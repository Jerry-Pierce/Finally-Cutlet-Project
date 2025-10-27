import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import { db } from '@/lib/database'

async function handler(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const tag = searchParams.get('tag') || ''
    const favorite = searchParams.get('favorite') === 'true'
    
    const userId = request.user!.userId
    const offset = (page - 1) * limit

    // 필터 조건 구성
    const where: any = {
      userId: userId
    }

    if (search) {
      where.OR = [
        { originalUrl: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (favorite) {
      where.isFavorite = true
    }

    // URL 조회
    const urls = await db.shortenedUrl.findMany({
      where,
      include: {
        tags: {
          include: {
            tag: true
          }
        },
        _count: {
          select: {
            clicks: true
          }
        }
      },
      orderBy: [
        { isFavorite: 'desc' },
        { createdAt: 'desc' }
      ],
      skip: offset,
      take: limit
    })

    // 태그별 필터링
    let filteredUrls = urls
    if (tag) {
      filteredUrls = urls.filter(url => 
        url.tags.some(urlTag => urlTag.tag.name === tag)
      )
    }

    // 전체 개수 조회
    const totalCount = await db.shortenedUrl.count({ where })
    const totalPages = Math.ceil(totalCount / limit)

    // 응답 데이터 구성
    const responseData = filteredUrls.map(url => ({
      id: url.id,
      originalUrl: url.originalUrl,
      shortUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/${url.shortCode}`,
      shortCode: url.shortCode,
      customCode: url.customCode,
      title: url.title,
      description: url.description,
      isFavorite: url.isFavorite,
      expiresAt: url.expiresAt,
      createdAt: url.createdAt,
      clickCount: url._count.clicks,
      tags: url.tags.map(urlTag => ({
        id: urlTag.tag.id,
        name: urlTag.tag.name,
        color: urlTag.tag.color
      }))
    }))

    return NextResponse.json({
      success: true,
      data: {
        urls: responseData,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    })

  } catch (error) {
    console.error('URL 목록 조회 오류:', error)
    
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export const GET = requireAuth(handler)
