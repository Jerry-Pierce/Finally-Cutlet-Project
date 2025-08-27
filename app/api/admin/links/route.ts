import { NextRequest, NextResponse } from 'next/server'
import { requireAdminHandler, AdminRequest } from '@/lib/admin-middleware'
import { db } from '@/lib/database'

async function handler(request: AdminRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const skip = (page - 1) * limit

    // 검색 조건 구성
    const where: any = {}
    
    if (search) {
      where.OR = [
        { shortCode: { contains: search, mode: 'insensitive' } },
        { customCode: { contains: search, mode: 'insensitive' } },
        { originalUrl: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (status === 'active') {
      where.OR = [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } }
      ]
    } else if (status === 'expired') {
      where.expiresAt = { lt: new Date() }
    }

    // 정렬 조건
    const orderBy: any = {}
    orderBy[sortBy] = sortOrder

    // 링크 목록 조회
    const [links, totalCount] = await Promise.all([
      db.shortenedUrl.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      db.shortenedUrl.count({ where })
    ])

    // 링크별 상세 정보 추가 (클릭 수는 별도로 계산)
    const linksWithDetails = await Promise.all(
      links.map(async (link) => {
        const clickCount = await db.urlClick.count({
          where: { urlId: link.id }
        })
        
        return {
          id: link.id,
          short: link.customCode || `cutlet.ly/${link.shortCode}`,
          original: link.originalUrl,
          title: link.title || '제목 없음',
          description: link.description || '설명 없음',
          user: link.user?.email || '알 수 없음',
          clicks: clickCount,
          status: link.expiresAt && link.expiresAt < new Date() ? 'expired' : 'active',
          createdAt: link.createdAt.toISOString().split('T')[0],
          expiresAt: link.expiresAt?.toISOString().split('T')[0] || null
        }
      })
    )

    return NextResponse.json({
      links: linksWithDetails,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error('링크 목록 조회 실패:', error)
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', message: '링크 목록 조회에 실패했습니다.' },
      { status: 500 }
    )
  }
}

export const GET = requireAdminHandler(handler)
