import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import { db } from '@/lib/database'

async function handler(request: AuthenticatedRequest) {
  try {
    const userId = request.user!.userId
    const { searchParams } = new URL(request.url)

    if (request.method === 'GET') {
      // 검색 파라미터 파싱
      const query = searchParams.get('q') || ''
      const tags = searchParams.get('tags')?.split(',').filter(Boolean) || []
      const status = searchParams.get('status') || 'all' // all, active, inactive, expired
      const favorite = searchParams.get('favorite') || 'all' // all, true, false
      const dateRange = searchParams.get('dateRange') || 'all' // all, today, week, month, year
      const sortBy = searchParams.get('sortBy') || 'createdAt' // createdAt, title, clicks, expiresAt
      const sortOrder = searchParams.get('sortOrder') || 'desc' // asc, desc
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '20')
      const offset = (page - 1) * limit

      // 검색 조건 구성
      const where: any = {
        userId
      }

      // 텍스트 검색
      if (query) {
        where.OR = [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { originalUrl: { contains: query, mode: 'insensitive' } },
          { shortCode: { contains: query, mode: 'insensitive' } },
          { customCode: { contains: query, mode: 'insensitive' } }
        ]
      }

      // 태그 필터링
      if (tags.length > 0) {
        where.urlTags = {
          some: {
            tag: {
              name: { in: tags }
            }
          }
        }
      }

      // 상태 필터링
      if (status === 'active') {
        where.isActive = true
        where.OR = [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      } else if (status === 'inactive') {
        where.isActive = false
      } else if (status === 'expired') {
        where.expiresAt = { lt: new Date() }
      }

      // 즐겨찾기 필터링
      if (favorite === 'true') {
        where.favorites = {
          some: { userId }
        }
      } else if (favorite === 'false') {
        where.favorites = {
          none: { userId }
        }
      }

      // 날짜 범위 필터링
      if (dateRange !== 'all') {
        const now = new Date()
        let startDate: Date

        switch (dateRange) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            break
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            break
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1)
            break
          case 'year':
            startDate = new Date(now.getFullYear(), 0, 1)
            break
          default:
            startDate = new Date(0)
        }

        where.createdAt = { gte: startDate }
      }

      // 정렬 조건
      const orderBy: any = {}
      if (sortBy === 'clicks') {
        orderBy.urlClicks = { _count: sortOrder }
      } else if (sortBy === 'title') {
        orderBy.title = sortOrder
      } else if (sortBy === 'expiresAt') {
        orderBy.expiresAt = sortOrder
      } else {
        orderBy.createdAt = sortOrder
      }

      // URL 조회
      const [urls, totalCount] = await Promise.all([
        db.shortenedUrl.findMany({
          where,
          include: {
            urlTags: {
              include: {
                tag: true
              }
            },
            urlClicks: {
              select: { id: true }
            },
            favorites: {
              where: { userId },
              select: { id: true }
            }
          },
          orderBy,
          skip: offset,
          take: limit
        }),
        db.shortenedUrl.count({ where })
      ])

      // 응답 데이터 구성
      const formattedUrls = urls.map(url => ({
        id: url.id,
        title: url.title,
        description: url.description,
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        customCode: url.customCode,
        shortUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/${url.customCode || url.shortCode}`,
        isActive: url.isActive,
        isFavorite: url.favorites.length > 0,
        clickCount: url.urlClicks.length,
        tags: url.urlTags.map(ut => ({
          id: ut.tag.id,
          name: ut.tag.name,
          color: ut.tag.color
        })),
        createdAt: url.createdAt,
        expiresAt: url.expiresAt,
        updatedAt: url.updatedAt
      }))

      // 검색 통계
      const stats = {
        total: totalCount,
        active: await db.shortenedUrl.count({
          where: { userId, isActive: true }
        }),
        expired: await db.shortenedUrl.count({
          where: { 
            userId, 
            expiresAt: { lt: new Date() } 
          }
        }),
        favorite: await db.favorite.count({
          where: { userId }
        })
      }

      return NextResponse.json({
        success: true,
        data: {
          urls: formattedUrls,
          pagination: {
            page,
            limit,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limit)
          },
          stats,
          filters: {
            query,
            tags,
            status,
            favorite,
            dateRange,
            sortBy,
            sortOrder
          }
        }
      })
    }

    return NextResponse.json({ error: '지원하지 않는 HTTP 메서드입니다.' }, { status: 405 })
  } catch (error) {
    console.error('고급 검색 오류:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

export const GET = requireAuth(handler)
