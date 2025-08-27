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
    const premium = searchParams.get('premium') || ''

    const skip = (page - 1) * limit

    // 검색 조건 구성
    const where: any = {}
    
    console.log('사용자 필터링 파라미터:', { search, status, premium, page, limit })
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (status === 'active') {
      where.status = 'active'
    } else if (status === 'suspended') {
      where.status = 'suspended'
    } else if (status === 'pending') {
      where.status = 'pending'
    }
    
    if (premium === 'premium') {
      where.isPremium = true
    } else if (premium === 'free') {
      where.isPremium = false
    }
    
    console.log('적용된 필터링 조건:', where)

    // 사용자 목록 조회
    const [users, totalCount] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          username: true,
          isPremium: true,
          createdAt: true,
          updatedAt: true,
          status: true,
          _count: {
            select: {
              shortenedUrls: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      db.user.count({ where })
    ])

    // 사용자별 URL 클릭 수 조회
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const totalClicks = await db.urlClick.count({
          where: {
            url: {
              userId: user.id
            }
          }
        })

        // 마지막 활동 시간 (URL 클릭)
        const lastActive = await db.urlClick.findFirst({
          where: {
            url: {
              userId: user.id
            }
          },
          orderBy: { clickedAt: 'desc' },
          select: { clickedAt: true }
        })

        // 마지막 로그인 시간 (사용자 업데이트 시간으로 대체)
        const lastLogin = user.updatedAt

        return {
          id: user.id,
          email: user.email,
          username: user.username,
          isPremium: user.isPremium,
          createdAt: user.createdAt.toISOString(),
          lastLogin: lastLogin.toISOString(),
          status: user.status || 'active',
          urlCount: user._count.shortenedUrls,
          clickCount: totalClicks
        }
      })
    )

    return NextResponse.json({
      users: usersWithStats,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error('사용자 목록 조회 실패:', error)
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', message: '사용자 목록 조회에 실패했습니다.' },
      { status: 500 }
    )
  }
}

// 시간 포맷팅 함수
function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInMinutes < 60) {
    return `${diffInMinutes}분 전`
  } else if (diffInHours < 24) {
    return `${diffInHours}시간 전`
  } else {
    return `${diffInDays}일 전`
  }
}

export const GET = requireAdminHandler(handler)
