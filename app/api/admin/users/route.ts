import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import { db } from '@/lib/database'

async function handler(request: AuthenticatedRequest) {
  try {
    const user = request.user!
    
    // 관리자 권한 확인
    if (!user.isAdmin) {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const offset = (page - 1) * limit

    // 검색 및 필터 조건
    const where: any = {}
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status === 'premium') {
      where.isPremium = true
    } else if (status === 'active') {
      where.isActive = true
    } else if (status === 'inactive') {
      where.isActive = false
    }

    // 정렬 조건
    const orderBy: any = {}
    orderBy[sortBy] = sortOrder

    // 사용자 목록 조회
    const [users, totalUsers] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          username: true,
          isPremium: true,
          isActive: true,
          isAdmin: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              shortenedUrls: true,
              favorites: true
            }
          }
        },
        orderBy,
        skip: offset,
        take: limit
      }),
      db.user.count({ where })
    ])

    // 사용자별 통계 추가
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        // 최근 활동 (마지막 URL 생성)
        const lastUrlCreated = await db.shortenedUrl.findFirst({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
          select: { createdAt: true }
        })

        // 최근 로그인 (마지막 업데이트)
        const lastActivity = user.updatedAt

        // 총 클릭 수
        const totalClicks = await db.urlClick.count({
          where: {
            shortenedUrl: {
              userId: user.id
            }
          }
        })

        return {
          ...user,
          lastUrlCreated: lastUrlCreated?.createdAt || null,
          lastActivity,
          totalClicks,
          stats: {
            totalUrls: user._count.shortenedUrls,
            totalFavorites: user._count.favorites,
            totalClicks
          }
        }
      })
    )

    // 페이지네이션 정보
    const totalPages = Math.ceil(totalUsers / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      success: true,
      data: {
        users: usersWithStats,
        pagination: {
          page,
          limit,
          totalUsers,
          totalPages,
          hasNextPage,
          hasPrevPage
        }
      }
    })

  } catch (error) {
    console.error('사용자 목록 조회 오류:', error)
    
    return NextResponse.json(
      { error: '사용자 목록을 조회하는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export const GET = requireAuth(handler)
