import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import { db } from '@/lib/database'

async function handler(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '7d'
    const urlId = searchParams.get('urlId')
    
    const userId = request.user!.userId

    // 기간 계산
    const now = new Date()
    let startDate = new Date()
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 7)
    }

    // 기본 필터 조건
    const baseFilter: any = {
      userId: userId,
      createdAt: {
        gte: startDate
      }
    }

    // 특정 URL의 통계인 경우
    if (urlId) {
      baseFilter.id = urlId
    }

    // 국가별 클릭 통계
    const countryStats = await db.urlClick.groupBy({
      by: ['country'],
      where: {
        url: baseFilter,
        clickedAt: {
          gte: startDate
        },
        country: {
          not: null
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    })

    // 도시별 클릭 통계
    const cityStats = await db.urlClick.groupBy({
      by: ['city'],
      where: {
        url: baseFilter,
        clickedAt: {
          gte: startDate
        },
        city: {
          not: null
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 20 // 상위 20개 도시만
    })

    // IP 주소별 클릭 통계 (중복 방문자 분석)
    const ipStats = await db.urlClick.groupBy({
      by: ['ipAddress'],
      where: {
        url: baseFilter,
        clickedAt: {
          gte: startDate
        },
        ipAddress: {
          not: null
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 50
    })

    // 응답 데이터 구성
    const responseData = {
      period,
      countryStats: countryStats.map(stat => ({
        country: stat.country,
        clicks: stat._count.id
      })),
      cityStats: cityStats.map(stat => ({
        city: stat.city,
        clicks: stat._count.id
      })),
      ipStats: ipStats.map(stat => ({
        ip: stat.ipAddress,
        visits: stat._count.id
      })),
      summary: {
        totalCountries: countryStats.length,
        totalCities: cityStats.length,
        uniqueVisitors: ipStats.length
      }
    }

    return NextResponse.json({
      success: true,
      data: responseData
    })

  } catch (error) {
    console.error('지리적 분석 조회 오류:', error)
    
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export const GET = requireAuth(handler)
