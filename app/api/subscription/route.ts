import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import { db } from '@/lib/database'

// 구독 플랜 정의
export const SUBSCRIPTION_PLANS = {
  free: {
    name: '무료',
    price: 0,
    features: [
      '월 100개 URL 단축',
      '기본 통계',
      'QR 코드 생성',
      '태그 관리'
    ],
    limits: {
      urlsPerMonth: 100,
      customDomains: 0,
      advancedAnalytics: false,
      prioritySupport: false
    }
  },
  premium: {
    name: '프리미엄',
    price: 9900, // 9,900원
    features: [
      '무제한 URL 단축',
      '고급 통계 및 분석',
      '커스텀 도메인',
      '우선 지원',
      'API 액세스',
      '일괄 URL 관리'
    ],
    limits: {
      urlsPerMonth: -1, // 무제한
      customDomains: 3,
      advancedAnalytics: true,
      prioritySupport: true
    }
  }
}

async function handler(request: AuthenticatedRequest) {
  try {
    const userId = request.user!.userId

    if (request.method === 'GET') {
      // 현재 구독 상태 조회
      const user = await db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          isPremium: true,
          createdAt: true,
          updatedAt: true
        }
      })

      if (!user) {
        return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 })
      }

      // 사용량 통계
      const [urlsThisMonth, totalUrls, totalClicks] = await Promise.all([
        db.shortenedUrl.count({
          where: {
            userId,
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        }),
        db.shortenedUrl.count({ where: { userId } }),
        db.urlClick.count({
          where: {
            url: { userId }
          }
        })
      ])

      const currentPlan = user.isPremium ? 'premium' : 'free'
      const planDetails = SUBSCRIPTION_PLANS[currentPlan as keyof typeof SUBSCRIPTION_PLANS]

      const subscription = {
        currentPlan,
        planDetails,
        usage: {
          urlsThisMonth,
          totalUrls,
          totalClicks,
          limit: planDetails.limits.urlsPerMonth,
          remaining: planDetails.limits.urlsPerMonth === -1 ? -1 : Math.max(0, planDetails.limits.urlsPerMonth - urlsThisMonth)
        },
        features: planDetails.features,
        limits: planDetails.limits,
        isActive: true,
        nextBillingDate: user.isPremium ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null
      }

      return NextResponse.json({ success: true, data: subscription })
    }

    if (request.method === 'POST') {
      // 구독 플랜 변경 (실제로는 결제 처리 후)
      const body = await request.json()
      const { plan, paymentMethod } = body

      if (!plan || !SUBSCRIPTION_PLANS[plan as keyof typeof SUBSCRIPTION_PLANS]) {
        return NextResponse.json({ error: '유효하지 않은 플랜입니다.' }, { status: 400 })
      }

      // 실제 결제 처리는 여기서 구현 (Stripe 등)
      // 현재는 시뮬레이션
      const isPremium = plan === 'premium'
      
      const updatedUser = await db.user.update({
        where: { id: userId },
        data: { isPremium },
        select: {
          id: true,
          isPremium: true,
          updatedAt: true
        }
      })

      return NextResponse.json({
        success: true,
        message: `${SUBSCRIPTION_PLANS[plan as keyof typeof SUBSCRIPTION_PLANS].name} 플랜으로 변경되었습니다.`,
        data: {
          plan,
          isPremium,
          updatedAt: updatedUser.updatedAt
        }
      })
    }

    if (request.method === 'DELETE') {
      // 구독 취소
      const updatedUser = await db.user.update({
        where: { id: userId },
        data: { isPremium: false },
        select: {
          id: true,
          isPremium: true,
          updatedAt: true
        }
      })

      return NextResponse.json({
        success: true,
        message: '프리미엄 구독이 취소되었습니다.',
        data: {
          plan: 'free',
          isPremium: false,
          updatedAt: updatedUser.updatedAt
        }
      })
    }

    return NextResponse.json({ error: '지원하지 않는 HTTP 메서드입니다.' }, { status: 405 })
  } catch (error) {
    console.error('구독 처리 오류:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

export const GET = requireAuth(handler)
export const POST = requireAuth(handler)
export const DELETE = requireAuth(handler)
