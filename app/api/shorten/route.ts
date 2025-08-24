import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { generateShortCode, validateUrl } from '@/lib/url-utils'
import { db } from '@/lib/database'
import { authenticateUser, AuthenticatedRequest } from '@/lib/auth-middleware'
import { withRateLimit, rateLimiters } from '@/lib/rate-limiter'

// URL 단축 요청 스키마
const shortenUrlSchema = z.object({
  originalUrl: z.string().url('유효한 URL을 입력해주세요'),
  customCode: z.string().optional(),
  tags: z.array(z.string()).optional(),
  expirationDays: z.string().optional(),
  isFavorite: z.boolean().optional(),
  isPremiumFavorite: z.boolean().optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Rate Limiting 적용
    const rateLimitResult = await withRateLimit(request, rateLimiters.urlShortening)
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
          retryAfter: rateLimitResult.retryAfter,
          limit: rateLimitResult.limit,
          reset: rateLimitResult.reset
        },
        { 
          status: 429,
          headers: {
            'Retry-After': rateLimitResult.retryAfter?.toString() || '3600',
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.reset.toString()
          }
        }
      )
    }

    // 사용자 인증 확인
    const authenticatedRequest = await authenticateUser(request)
    const userId = authenticatedRequest.user?.userId
    
    const body = await request.json()
    const validatedData = shortenUrlSchema.parse(body)
    
    const { originalUrl, customCode, tags, expirationDays, isFavorite, isPremiumFavorite } = validatedData

    // URL 유효성 검사
    if (!validateUrl(originalUrl)) {
      return NextResponse.json(
        { error: '유효하지 않은 URL입니다.' },
        { status: 400 }
      )
    }

    // 커스텀 코드가 있는 경우 프리미엄 사용자 체크 및 중복 확인
    if (customCode) {
      // 프리미엄 사용자 체크
      if (userId) {
        const user = await db.user.findUnique({
          where: { id: userId },
          select: { isPremium: true }
        })
        
        if (!user?.isPremium) {
          return NextResponse.json(
            { 
              error: 'customUrlPremiumOnly',
              errorType: 'CUSTOM_URL_PREMIUM_REQUIRED'
            },
            { status: 403 }
          )
        }
      } else {
        // 로그인하지 않은 사용자는 커스텀 URL 사용 불가
        return NextResponse.json(
          { 
            error: 'loginRequiredForCustomUrl',
            errorType: 'LOGIN_REQUIRED'
          },
            { status: 401 }
        )
      }
      
      // 중복 확인
      const existingUrl = await db.shortenedUrl.findUnique({
        where: { customCode }
      })
      
              if (existingUrl) {
          return NextResponse.json(
            { 
              error: 'customCodeAlreadyExists',
              errorType: 'DUPLICATE_CUSTOM_CODE'
            },
            { status: 409 }
          )
        }
    }

    // 만료일 계산
    let expiresAt: Date | null = null
    if (expirationDays && expirationDays !== 'permanent') {
      const days = parseInt(expirationDays)
      expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
    }

    // 무료 사용자 URL 제한 체크 (10개)
    if (userId) {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { isPremium: true }
      })
      
      if (!user?.isPremium) {
        // 무료 사용자의 총 URL 개수 확인
        const urlCount = await db.shortenedUrl.count({
          where: { userId }
        })
        
        if (urlCount >= 10) {
          return NextResponse.json(
            { 
              error: 'freePlanUrlLimitExceeded',
              errorType: 'URL_LIMIT_EXCEEDED',
              upgradeMessage: 'upgradeToPremiumForUnlimited'
            },
            { status: 403 }
          )
        }
      }
    }

    // 프리미엄 즐겨찾기 체크
    if (isPremiumFavorite && userId) {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { isPremium: true }
      })
      
      if (!user?.isPremium) {
        return NextResponse.json(
          { 
            error: 'premiumFavoritePremiumOnly',
            errorType: 'PREMIUM_FAVORITE_PREMIUM_REQUIRED'
          },
          { status: 403 }
        )
      }
    }

    // 짧은 코드 생성
    const shortCode = customCode || generateShortCode()

    // 데이터베이스에 저장
    const shortenedUrl = await db.shortenedUrl.create({
      data: {
        originalUrl,
        shortCode,
        customCode: customCode || null,
        expiresAt,
        isFavorite: isFavorite || false,
        isPremiumFavorite: isPremiumFavorite || false,
        userId: userId || null,
      }
    })

    // 태그가 있는 경우 저장
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        let tag = await db.tag.findUnique({
          where: { name: tagName }
        })
        
        if (!tag) {
          tag = await db.tag.create({
            data: { name: tagName }
          })
        }
        
        await db.urlTag.create({
          data: {
            urlId: shortenedUrl.id,
            tagId: tag.id
          }
        })
      }
    }

    // 기본 URL 설정 (환경 변수가 없을 때 localhost:3000 사용)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    
    return NextResponse.json({
      success: true,
      data: {
        id: shortenedUrl.id,
        shortUrl: `${baseUrl}/${shortenedUrl.shortCode}`,
        originalUrl: shortenedUrl.originalUrl,
        expiresAt: shortenedUrl.expiresAt,
        createdAt: shortenedUrl.createdAt
      }
    })

  } catch (error) {
    console.error('URL 단축 오류:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
