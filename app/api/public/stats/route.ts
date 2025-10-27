import { NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET() {
  try {
    // 기본 통계 데이터 수집
    const [
      totalUsers,
      totalUrls,
      totalClicks,
      activeUrls,
      premiumUsers
    ] = await Promise.all([
      db.user.count(),
      db.shortenedUrl.count(),
      db.urlClick.count(),
      db.shortenedUrl.count({
        where: {
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        }
      }),
Promise.resolve(0) // 프리미엄 사용자 통계 제거
    ])

    // 오늘 생성된 URL 수
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const urlsToday = await db.shortenedUrl.count({
      where: {
        createdAt: { gte: today }
      }
    })

    // 이번 주 생성된 URL 수
    const startOfWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const urlsThisWeek = await db.shortenedUrl.count({
      where: {
        createdAt: { gte: startOfWeek }
      }
    })

    // 오늘 클릭 수
    const clicksToday = await db.urlClick.count({
      where: {
        clickedAt: { gte: today }
      }
    })

    // 이번 주 클릭 수
    const clicksThisWeek = await db.urlClick.count({
      where: {
        clickedAt: { gte: startOfWeek }
      }
    })

    // 인기 태그 (상위 5개) - Prisma 관계 사용
    const popularTags = await db.tag.findMany({
      select: {
        name: true,
        urls: {
          select: {
            urlId: true
          }
        }
      },
      take: 5
    })

    // 태그별 URL 개수 계산
    const tagStats = popularTags.map(tag => ({
      tagName: tag.name,
      count: tag.urls.length
    })).sort((a, b) => b.count - a.count)

    // 태그 이름 가져오기
    const tagIds = tagStats.map(t => t.tagName)
    const tags = await db.tag.findMany({
      where: { id: { in: tagIds } },
      select: { id: true, name: true }
    })

    // tagStats는 이미 위에서 계산됨

    // 지리적 분포 (상위 5개 국가)
    const topCountries = await db.urlClick.groupBy({
      by: ['country'],
      _count: { id: true },
      where: {
        country: { not: null }
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 5
    })

    // 성장률 계산 (이번 주 vs 지난 주)
    const lastWeek = new Date(startOfWeek.getTime() - 7 * 24 * 60 * 60 * 1000)
    const lastWeekUrls = await db.shortenedUrl.count({
      where: {
        createdAt: { gte: lastWeek, lt: startOfWeek }
      }
    })

    const lastWeekClicks = await db.urlClick.count({
      where: {
        clickedAt: { gte: lastWeek, lt: startOfWeek }
      }
    })

    const urlGrowthRate = lastWeekUrls > 0 
      ? ((urlsThisWeek - lastWeekUrls) / lastWeekUrls) * 100 
      : 0

    const clickGrowthRate = lastWeekClicks > 0 
      ? ((clicksThisWeek - lastWeekClicks) / lastWeekClicks) * 100 
      : 0

    const stats = {
      users: {
        total: totalUsers,
        premium: premiumUsers,
        premiumPercentage: totalUsers > 0 ? (premiumUsers / totalUsers) * 100 : 0
      },
      urls: {
        total: totalUrls,
        active: activeUrls,
        today: urlsToday,
        thisWeek: urlsThisWeek,
        growthRate: urlGrowthRate
      },
      clicks: {
        total: totalClicks,
        today: clicksToday,
        thisWeek: clicksThisWeek,
        growthRate: clickGrowthRate
      },
      engagement: {
        averageClicksPerUrl: totalUrls > 0 ? (totalClicks / totalUrls) : 0,
        activeUrlPercentage: totalUrls > 0 ? (activeUrls / totalUrls) * 100 : 0
      },
      trends: {
        popularTags: tagStats,
        topCountries: topCountries.map(c => ({
          country: c.country,
          clicks: c._count.id
        }))
      },
      system: {
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      }
    }

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('공개 통계 조회 오류:', error)
    
    // 오류 발생 시 기본값 반환
    return NextResponse.json({
      success: true,
      data: {
        users: { total: 0, premium: 0, premiumPercentage: 0 },
        urls: { total: 0, active: 0, today: 0, thisWeek: 0, growthRate: 0 },
        clicks: { total: 0, today: 0, thisWeek: 0, growthRate: 0 },
        engagement: { averageClicksPerUrl: 0, activeUrlPercentage: 0 },
        trends: { popularTags: [], topCountries: [] },
        system: { uptime: 0, timestamp: new Date().toISOString() }
      }
    })
  }
}
