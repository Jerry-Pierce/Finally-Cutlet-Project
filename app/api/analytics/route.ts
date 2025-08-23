import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import { db } from '@/lib/database'

async function handler(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '7d' // 7d, 30d, 90d, 1y
    const urlId = searchParams.get('urlId') // 특정 URL의 통계 (선택사항)
    
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

    // URL별 클릭 통계
    const urlStats = await db.shortenedUrl.findMany({
      where: baseFilter,
      include: {
        _count: {
          select: {
            clicks: true
          }
        },
        clicks: {
          where: {
            clickedAt: {
              gte: startDate
            }
          },
          orderBy: {
            clickedAt: 'asc'
          }
        }
      },
      orderBy: {
        _count: {
          clicks: 'desc'
        }
      }
    })

    // 일별 클릭 통계
    const dailyClicks = await db.urlClick.groupBy({
      by: ['clickedAt'],
      where: {
        url: {
          userId: userId,
          createdAt: {
            gte: startDate
          }
        },
        clickedAt: {
          gte: startDate
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        clickedAt: 'asc'
      }
    })

    // 전체 통계
    const totalUrls = await db.shortenedUrl.count({
      where: baseFilter
    })

    const totalClicks = await db.urlClick.count({
      where: {
        url: {
          userId: userId,
          createdAt: {
            gte: startDate
          }
        },
        clickedAt: {
          gte: startDate
        }
      }
    })

    const totalFavorites = await db.shortenedUrl.count({
      where: {
        ...baseFilter,
        isFavorite: true
      }
    })

    // 인기 태그
    const popularTags = await db.urlTag.groupBy({
      by: ['tagId'],
      where: {
        url: baseFilter
      },
      _count: {
        urlId: true
      },
      orderBy: {
        _count: {
          urlId: 'desc'
        }
      },
      take: 10
    })

    // 태그 정보와 함께 조회
    const tagStats = await Promise.all(
      popularTags.map(async (tagStat) => {
        const tag = await db.tag.findUnique({
          where: { id: tagStat.tagId }
        })
        return {
          name: tag?.name || 'Unknown',
          color: tag?.color || '#3B82F6',
          count: tagStat._count.urlId
        }
      })
    )

    // 응답 데이터 구성
    const responseData = {
      period,
      summary: {
        totalUrls,
        totalClicks,
        totalFavorites,
        averageClicksPerUrl: totalUrls > 0 ? Math.round(totalClicks / totalUrls * 100) / 100 : 0
      },
      urlStats: urlStats.map(url => ({
        id: url.id,
        shortCode: url.shortCode,
        title: url.title || url.originalUrl.substring(0, 50) + '...',
        clickCount: url._count.clicks,
        createdAt: url.createdAt,
        isFavorite: url.isFavorite
      })),
      dailyClicks: dailyClicks.map(day => ({
        date: day.clickedAt.toISOString().split('T')[0],
        clicks: day._count.id
      })),
      popularTags: tagStats
    }

    return NextResponse.json({
      success: true,
      data: responseData
    })

  } catch (error) {
    console.error('통계 조회 오류:', error)
    
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export const GET = requireAuth(handler)
