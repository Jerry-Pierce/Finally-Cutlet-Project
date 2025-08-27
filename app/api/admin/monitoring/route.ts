import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import { db } from '@/lib/database'
import { rateLimiters } from '@/lib/rate-limiter'
import { exec } from 'child_process'
import { promisify } from 'util'
import os from 'os'

const execAsync = promisify(exec)

async function handler(request: AuthenticatedRequest) {
  try {
    const user = request.user!
    
    // 관리자 권한 확인 - cutlet.service@gmail.com 계정만 접근 가능
    if (user.email !== 'cutlet.service@gmail.com') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'overview'

    let monitoringData: any = {}

    switch (type) {
      case 'overview':
        monitoringData = await getSystemOverview()
        break
      case 'performance':
        monitoringData = await getPerformanceMetrics()
        break
      case 'database':
        monitoringData = await getDatabaseStats()
        break
      case 'users':
        monitoringData = await getUserStats()
        break
      case 'urls':
        monitoringData = await getUrlStats()
        break
      case 'analytics':
        monitoringData = await getAnalyticsStats()
        break
      default:
        return NextResponse.json(
          { error: '잘못된 모니터링 타입입니다.' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data: monitoringData,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('모니터링 데이터 조회 오류:', error)
    
    return NextResponse.json(
      { error: '모니터링 데이터 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 시스템 전체 개요
async function getSystemOverview() {
  const [
    userCount,
    urlCount,
    clickCount,
    systemInfo,
    rateLimitInfo
  ] = await Promise.all([
    db.user.count(),
    db.shortenedUrl.count(),
    db.urlClick.count(),
    getSystemInfo(),
    getRateLimitInfo()
  ])

  return {
    system: systemInfo,
    users: {
      total: userCount,
      active: await getActiveUserCount(),
      premium: await getPremiumUserCount()
    },
    urls: {
      total: urlCount,
      active: await getActiveUrlCount(),
      expired: await getExpiredUrlCount()
    },
    analytics: {
      totalClicks: clickCount,
      todayClicks: await getTodayClickCount(),
      weeklyGrowth: await getWeeklyGrowth()
    },
    rateLimiting: rateLimitInfo,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  }
}

// 성능 메트릭
async function getPerformanceMetrics() {
  const startTime = Date.now()
  
  // 데이터베이스 응답 시간 측정
  const dbStartTime = Date.now()
  await db.user.count()
  const dbResponseTime = Date.now() - dbStartTime

  // API 응답 시간 측정
  const apiResponseTime = Date.now() - startTime

  return {
    performance: {
      databaseResponseTime: dbResponseTime,
      apiResponseTime: apiResponseTime,
      totalResponseTime: apiResponseTime
    },
    system: {
      cpuUsage: os.loadavg(),
      memoryUsage: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem(),
        percentage: ((os.totalmem() - os.freemem()) / os.totalmem()) * 100
      },
      uptime: os.uptime()
    },
    timestamp: new Date().toISOString()
  }
}

// 데이터베이스 통계
async function getDatabaseStats() {
  const [
    userCount,
    urlCount,
    clickCount,
    tagCount,
    favoriteCount,
    notificationCount
  ] = await Promise.all([
    db.user.count(),
    db.shortenedUrl.count(),
    db.urlClick.count(),
    db.tag.count(),
    db.favorite.count(),
    db.notification.count()
  ])

  // 테이블별 크기 추정 (PostgreSQL)
  let tableSizes: any = {}
  try {
    if (process.env.DATABASE_URL) {
      const { stdout } = await execAsync(
        `psql "${process.env.DATABASE_URL}" -c "SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size FROM pg_tables WHERE schemaname = 'public' ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"`
      )
      
      // 결과 파싱 (간단한 파싱)
      const lines = stdout.split('\n')
      lines.forEach(line => {
        const parts = line.split('|')
        if (parts.length >= 3) {
          const tableName = parts[1]?.trim()
          const size = parts[2]?.trim()
          if (tableName && size && tableName !== 'tablename') {
            tableSizes[tableName] = size
          }
        }
      })
    }
  } catch (error) {
    console.warn('테이블 크기 조회 실패:', error)
    tableSizes = { error: '테이블 크기 정보를 가져올 수 없습니다.' }
  }

  return {
    tables: {
      users: userCount,
      shortenedUrls: urlCount,
      urlClicks: clickCount,
      tags: tagCount,
      favorites: favoriteCount,
      notifications: notificationCount
    },
    tableSizes,
    totalRecords: userCount + urlCount + clickCount + tagCount + favoriteCount + notificationCount,
    timestamp: new Date().toISOString()
  }
}

// 사용자 통계
async function getUserStats() {
  const [
    totalUsers,
    premiumUsers,
    activeUsers,
    newUsersToday,
    newUsersThisWeek,
    newUsersThisMonth
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { isPremium: true } }),
    getActiveUserCount(),
    getNewUserCount('today'),
    getNewUserCount('week'),
    getNewUserCount('month')
  ])

  // 사용자 성장률 계산
  const growthRate = await calculateUserGrowthRate()

  return {
    overview: {
      total: totalUsers,
      premium: premiumUsers,
      active: activeUsers,
      premiumPercentage: totalUsers > 0 ? (premiumUsers / totalUsers) * 100 : 0
    },
    growth: {
      today: newUsersToday,
      thisWeek: newUsersThisWeek,
      thisMonth: newUsersThisMonth,
      growthRate
    },
    timestamp: new Date().toISOString()
  }
}

// URL 통계
async function getUrlStats() {
  const [
    totalUrls,
    activeUrls,
    expiredUrls,
    customUrls,
    premiumUrls,
    urlsToday,
    urlsThisWeek
  ] = await Promise.all([
    db.shortenedUrl.count(),
    getActiveUrlCount(),
    getExpiredUrlCount(),
    db.shortenedUrl.count({ where: { customCode: { not: null } } }),
    db.shortenedUrl.count({ where: { isPremiumFavorite: true } }),
    getNewUrlCount('today'),
    getNewUrlCount('week')
  ])

  // URL 성장률 계산
  const growthRate = await calculateUrlGrowthRate()

  return {
    overview: {
      total: totalUrls,
      active: activeUrls,
      expired: expiredUrls,
      custom: customUrls,
      premium: premiumUrls
    },
    growth: {
      today: urlsToday,
      thisWeek: urlsThisWeek,
      growthRate
    },
    timestamp: new Date().toISOString()
  }
}

// 분석 통계
async function getAnalyticsStats() {
  const [
    totalClicks,
    todayClicks,
    thisWeekClicks,
    thisMonthClicks,
    uniqueVisitors,
    topUrls
  ] = await Promise.all([
    db.urlClick.count(),
    getTodayClickCount(),
    getThisWeekClickCount(),
    getThisMonthClickCount(),
    getUniqueVisitorCount(),
    getTopUrls(10)
  ])

  // 클릭 성장률 계산
  const clickGrowthRate = await calculateClickGrowthRate()

  return {
    clicks: {
      total: totalClicks,
      today: todayClicks,
      thisWeek: thisWeekClicks,
      thisMonth: thisMonthClicks,
      growthRate: clickGrowthRate
    },
    visitors: {
      unique: uniqueVisitors,
      today: await getTodayUniqueVisitors(),
      thisWeek: await getThisWeekUniqueVisitors()
    },
    topUrls,
    timestamp: new Date().toISOString()
  }
}

// 시스템 정보
function getSystemInfo() {
  return {
    platform: os.platform(),
    arch: os.arch(),
    nodeVersion: process.version,
    uptime: os.uptime(),
    hostname: os.hostname(),
    cpus: os.cpus().length,
    totalMemory: os.totalmem(),
    freeMemory: os.freemem()
  }
}

// Rate Limit 정보
function getRateLimitInfo() {
  // 실제로는 rate limiters의 상태를 반환해야 함
  return {
    activeConnections: 0, // WebSocket 연결 수
    rateLimitConfigs: {
      general: { windowMs: 15 * 60 * 1000, maxRequests: 100 },
      urlShortening: { windowMs: 60 * 60 * 1000, maxRequests: 50 },
      auth: { windowMs: 15 * 60 * 1000, maxRequests: 10 }
    }
  }
}

// 헬퍼 함수들
async function getActiveUserCount() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  return await db.user.count({
    where: {
      updatedAt: { gte: thirtyDaysAgo }
    }
  })
}

async function getPremiumUserCount() {
  return await db.user.count({ where: { isPremium: true } })
}

async function getActiveUrlCount() {
  return await db.shortenedUrl.count({
    where: {
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } }
      ]
    }
  })
}

async function getExpiredUrlCount() {
  return await db.shortenedUrl.count({
    where: {
      expiresAt: { lt: new Date() }
    }
  })
}

async function getTodayClickCount() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return await db.urlClick.count({
    where: {
      clickedAt: { gte: today }
    }
  })
}

async function getWeeklyGrowth() {
  const now = new Date()
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
  
  const [lastWeekCount, twoWeeksAgoCount] = await Promise.all([
    db.urlClick.count({ where: { clickedAt: { gte: lastWeek } } }),
    db.urlClick.count({ where: { clickedAt: { gte: twoWeeksAgo, lt: lastWeek } } })
  ])
  
  if (twoWeeksAgoCount === 0) return 0
  return ((lastWeekCount - twoWeeksAgoCount) / twoWeeksAgoCount) * 100
}

async function getNewUserCount(period: string) {
  const now = new Date()
  let startDate: Date
  
  switch (period) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      break
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      break
    default:
      startDate = new Date(0)
  }
  
  return await db.user.count({
    where: {
      createdAt: { gte: startDate }
    }
  })
}

async function getNewUrlCount(period: string) {
  const now = new Date()
  let startDate: Date
  
  switch (period) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      break
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    default:
      startDate = new Date(0)
  }
  
  return await db.shortenedUrl.count({
    where: {
      createdAt: { gte: startDate }
    }
  })
}

async function calculateUserGrowthRate() {
  const now = new Date()
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1)
  
  const [lastMonthCount, twoMonthsAgoCount] = await Promise.all([
    db.user.count({ where: { createdAt: { gte: lastMonth } } }),
    db.user.count({ where: { createdAt: { gte: twoMonthsAgo, lt: lastMonth } } })
  ])
  
  if (twoMonthsAgoCount === 0) return 0
  return ((lastMonthCount - twoMonthsAgoCount) / twoMonthsAgoCount) * 100
}

async function calculateUrlGrowthRate() {
  const now = new Date()
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1)
  
  const [lastMonthCount, twoMonthsAgoCount] = await Promise.all([
    db.shortenedUrl.count({ where: { createdAt: { gte: lastMonth } } }),
    db.shortenedUrl.count({ where: { createdAt: { gte: twoMonthsAgo, lt: lastMonth } } })
  ])
  
  if (twoMonthsAgoCount === 0) return 0
  return ((lastMonthCount - twoMonthsAgoCount) / twoMonthsAgoCount) * 100
}

async function getThisWeekClickCount() {
  const now = new Date()
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  return await db.urlClick.count({
    where: {
      clickedAt: { gte: startOfWeek }
    }
  })
}

async function getThisMonthClickCount() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  return await db.urlClick.count({
    where: {
      clickedAt: { gte: startOfMonth }
    }
  })
}

async function getUniqueVisitorCount() {
  const result = await db.urlClick.groupBy({
    by: ['ipAddress'],
    _count: { id: true }
  })
  return result.length
}

async function getTopUrls(limit: number) {
  return await db.shortenedUrl.findMany({
    take: limit,
    orderBy: {
      clicks: {
        _count: 'desc'
      }
    },
    include: {
      _count: {
        select: { clicks: true }
      }
    }
  })
}

async function calculateClickGrowthRate() {
  const now = new Date()
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1)
  
  const [lastMonthCount, twoMonthsAgoCount] = await Promise.all([
    db.urlClick.count({ where: { clickedAt: { gte: lastMonth } } }),
    db.urlClick.count({ where: { clickedAt: { gte: twoMonthsAgo, lt: lastMonth } } })
  ])
  
  if (twoMonthsAgoCount === 0) return 0
  return ((lastMonthCount - twoMonthsAgoCount) / twoMonthsAgoCount) * 100
}

async function getTodayUniqueVisitors() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const result = await db.urlClick.groupBy({
    by: ['ipAddress'],
    where: {
      clickedAt: { gte: today }
    },
    _count: { id: true }
  })
  
  return result.length
}

async function getThisWeekUniqueVisitors() {
  const now = new Date()
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  
  const result = await db.urlClick.groupBy({
    by: ['ipAddress'],
    where: {
      clickedAt: { gte: startOfWeek }
    },
    _count: { id: true }
  })
  
  return result.length
}

export const GET = requireAuth(handler)
