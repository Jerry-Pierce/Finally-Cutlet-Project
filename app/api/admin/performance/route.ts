import { NextRequest, NextResponse } from 'next/server'
import { requireAdminHandler, AdminRequest } from '@/lib/admin-middleware'
import { db } from '@/lib/database'

async function handler(request: AdminRequest) {
  try {
    // 시스템 성능 메트릭 수집
    const [
      totalUsers,
      totalUrls,
      totalClicks,
      activeUrls,
      premiumUsers,
      recentActivity,
      systemMetrics
    ] = await Promise.all([
      // 기본 통계
      db.user.count(),
      db.shortenedUrl.count(),
      db.urlClick.count(),
      
      // 활성 URL 수
      db.shortenedUrl.count({
        where: {
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        }
      }),
      
      // 프리미엄 사용자 수
      db.user.count({ where: { isPremium: true } }),
      
      // 최근 활동 (최근 24시간)
      db.urlClick.count({
        where: {
          clickedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // 시스템 메트릭 (실제 구현 시에는 Redis나 다른 모니터링 시스템에서 가져와야 함)
      Promise.resolve({
        cpuUsage: Math.random() * 30 + 20, // 20-50%
        memoryUsage: Math.random() * 20 + 60, // 60-80%
        diskUsage: Math.random() * 15 + 70, // 70-85%
        networkLatency: Math.random() * 20 + 10, // 10-30ms
        activeConnections: Math.floor(Math.random() * 100 + 50), // 50-150
        uptime: '99.9%',
        lastRestart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7일 전
      })
    ])

    // 성능 점수 계산 (간단한 알고리즘)
    const performanceScore = calculatePerformanceScore({
      totalUsers,
      totalUrls,
      totalClicks,
      activeUrls,
      premiumUsers,
      recentActivity
    })

    // 성능 등급 결정
    const performanceGrade = getPerformanceGrade(performanceScore)

    return NextResponse.json({
      metrics: {
        totalUsers,
        totalUrls,
        totalClicks,
        activeUrls,
        premiumUsers,
        recentActivity
      },
      systemMetrics,
      performanceScore,
      performanceGrade,
      recommendations: getRecommendations(performanceScore, {
        totalUsers,
        totalUrls,
        totalClicks,
        activeUrls,
        premiumUsers,
        recentActivity
      })
    })
  } catch (error) {
    console.error('성능 모니터링 데이터 조회 실패:', error)
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', message: '성능 모니터링 데이터 조회에 실패했습니다.' },
      { status: 500 }
    )
  }
}

// 성능 점수 계산 함수
function calculatePerformanceScore(metrics: any): number {
  const {
    totalUsers,
    totalUrls,
    totalClicks,
    activeUrls,
    premiumUsers,
    recentActivity
  } = metrics

  let score = 0

  // 사용자 기반 점수 (최대 25점)
  if (totalUsers > 1000) score += 25
  else if (totalUsers > 500) score += 20
  else if (totalUsers > 100) score += 15
  else if (totalUsers > 50) score += 10
  else score += 5

  // URL 기반 점수 (최대 20점)
  if (totalUrls > 10000) score += 20
  else if (totalUrls > 5000) score += 16
  else if (totalUrls > 1000) score += 12
  else if (totalUrls > 100) score += 8
  else score += 4

  // 클릭 기반 점수 (최대 20점)
  if (totalClicks > 50000) score += 20
  else if (totalClicks > 20000) score += 16
  else if (totalClicks > 5000) score += 12
  else if (totalClicks > 500) score += 8
  else score += 4

  // 활성 URL 비율 점수 (최대 15점)
  const activeRatio = totalUrls > 0 ? activeUrls / totalUrls : 0
  if (activeRatio > 0.8) score += 15
  else if (activeRatio > 0.6) score += 12
  else if (activeRatio > 0.4) score += 9
  else if (activeRatio > 0.2) score += 6
  else score += 3

  // 프리미엄 사용자 비율 점수 (최대 10점)
  const premiumRatio = totalUsers > 0 ? premiumUsers / totalUsers : 0
  if (premiumRatio > 0.3) score += 10
  else if (premiumRatio > 0.2) score += 8
  else if (premiumRatio > 0.1) score += 6
  else if (premiumRatio > 0.05) score += 4
  else score += 2

  // 최근 활동 점수 (최대 10점)
  if (recentActivity > 1000) score += 10
  else if (recentActivity > 500) score += 8
  else if (recentActivity > 100) score += 6
  else if (recentActivity > 50) score += 4
  else score += 2

  return Math.min(100, score)
}

// 성능 등급 결정 함수
function getPerformanceGrade(score: number): string {
  if (score >= 90) return 'A+'
  if (score >= 80) return 'A'
  if (score >= 70) return 'B+'
  if (score >= 60) return 'B'
  if (score >= 50) return 'C+'
  if (score >= 40) return 'C'
  if (score >= 30) return 'D'
  return 'F'
}

// 성능 개선 권장사항 함수
function getRecommendations(score: number, metrics: any): string[] {
  const recommendations: string[] = []

  if (score < 70) {
    recommendations.push('시스템 성능이 낮습니다. 서버 리소스를 점검해주세요.')
  }

  if (metrics.totalUsers < 100) {
    recommendations.push('사용자 수가 적습니다. 마케팅 활동을 강화해보세요.')
  }

  if (metrics.totalUrls < 1000) {
    recommendations.push('URL 생성이 적습니다. 사용자 참여도를 높여보세요.')
  }

  if (metrics.activeUrls / metrics.totalUrls < 0.5) {
    recommendations.push('비활성 URL이 많습니다. 만료 정책을 검토해보세요.')
  }

  if (metrics.premiumUsers / metrics.totalUsers < 0.1) {
    recommendations.push('프리미엄 전환율이 낮습니다. 요금제를 검토해보세요.')
  }

  if (metrics.recentActivity < 100) {
    recommendations.push('최근 활동이 적습니다. 사용자 참여를 유도해보세요.')
  }

  if (recommendations.length === 0) {
    recommendations.push('시스템이 양호한 상태입니다. 현재 상태를 유지하세요.')
  }

  return recommendations
}

export const GET = requireAdminHandler(handler)
