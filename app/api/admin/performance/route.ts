import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import { db } from '@/lib/database'
import { cache } from '@/lib/redis'
import { logger } from '@/lib/logger'
import os from 'os'

// 성능 메트릭 인터페이스
interface PerformanceMetrics {
  timestamp: string
  system: {
    cpu: {
      usage: number
      loadAverage: number[]
      cores: number
    }
    memory: {
      total: number
      used: number
      free: number
      usage: number
    }
    disk: {
      total: number
      used: number
      free: number
      usage: number
    }
    network: {
      bytesIn: number
      bytesOut: number
    }
  }
  database: {
    connections: number
    queryTime: {
      avg: number
      min: number
      max: number
      p95: number
      p99: number
    }
    slowQueries: number
    activeTransactions: number
  }
  api: {
    responseTime: {
      avg: number
      min: number
      max: number
      p95: number
      p99: number
    }
    requestsPerSecond: number
    errorRate: number
    activeConnections: number
  }
  cache: {
    hitRate: number
    memoryUsage: number
    keysCount: number
    evictions: number
  }
  uptime: number
}

// 성능 데이터 저장소 (메모리)
const performanceData: PerformanceMetrics[] = []
const MAX_DATA_POINTS = 1000

async function handler(request: AuthenticatedRequest) {
  try {
    const userId = request.user!.userId

    if (request.method === 'GET') {
      // 성능 메트릭 수집
      const metrics = await collectPerformanceMetrics()
      
      // 데이터 저장
      performanceData.push(metrics)
      if (performanceData.length > MAX_DATA_POINTS) {
        performanceData.shift()
      }

      // 캐시에 저장 (5분간)
      await cache.setJSON('performance:latest', metrics, 300)

      return NextResponse.json({
        success: true,
        data: {
          current: metrics,
          history: performanceData.slice(-24), // 최근 24개 데이터
          summary: generatePerformanceSummary(performanceData)
        }
      })
    }

    if (request.method === 'POST') {
      // 성능 데이터 초기화
      performanceData.length = 0
      await cache.del('performance:latest')
      
      logger.info('성능 데이터가 초기화되었습니다.', 'PERFORMANCE', { userId })
      
      return NextResponse.json({
        success: true,
        message: '성능 데이터가 초기화되었습니다.'
      })
    }

    return NextResponse.json({ error: '지원하지 않는 HTTP 메서드입니다.' }, { status: 405 })
  } catch (error) {
    logger.error('성능 모니터링 오류', error as Error, 'PERFORMANCE', { userId: request.user?.userId })
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

// 성능 메트릭 수집
async function collectPerformanceMetrics(): Promise<PerformanceMetrics> {
  const startTime = Date.now()
  
  try {
    // 시스템 메트릭 수집
    const systemMetrics = await collectSystemMetrics()
    
    // 데이터베이스 메트릭 수집
    const dbMetrics = await collectDatabaseMetrics()
    
    // API 메트릭 수집
    const apiMetrics = await collectApiMetrics()
    
    // 캐시 메트릭 수집
    const cacheMetrics = await collectCacheMetrics()
    
    const metrics: PerformanceMetrics = {
      timestamp: new Date().toISOString(),
      system: systemMetrics,
      database: dbMetrics,
      api: apiMetrics,
      cache: cacheMetrics,
      uptime: process.uptime()
    }

    // 성능 데이터 수집 시간 로깅
    const collectionTime = Date.now() - startTime
    if (collectionTime > 1000) {
      logger.warn('성능 메트릭 수집이 느림', 'PERFORMANCE', { collectionTime })
    }

    return metrics
  } catch (error) {
    logger.error('성능 메트릭 수집 실패', error as Error, 'PERFORMANCE')
    throw error
  }
}

// 시스템 메트릭 수집
async function collectSystemMetrics() {
  const cpus = os.cpus()
  const totalMem = os.totalmem()
  const freeMem = os.freemem()
  const usedMem = totalMem - freeMem

  // CPU 사용률 계산 (간단한 방법)
  const cpuUsage = cpus.reduce((acc, cpu) => {
    const total = Object.values(cpu.times).reduce((sum, time) => sum + time, 0)
    const idle = cpu.times.idle
    return acc + ((total - idle) / total)
  }, 0) / cpus.length

  return {
    cpu: {
      usage: Math.round(cpuUsage * 100 * 100) / 100,
      loadAverage: os.loadavg(),
      cores: cpus.length
    },
    memory: {
      total: totalMem,
      used: usedMem,
      free: freeMem,
      usage: Math.round((usedMem / totalMem) * 100 * 100) / 100
    },
    disk: {
      total: 0, // Node.js에서는 직접적인 디스크 정보 접근이 어려움
      used: 0,
      free: 0,
      usage: 0
    },
    network: {
      bytesIn: 0, // Node.js에서는 직접적인 네트워크 정보 접근이 어려움
      bytesOut: 0
    }
  }
}

// 데이터베이스 메트릭 수집
async function collectDatabaseMetrics() {
  try {
    const startTime = Date.now()
    
    // 간단한 쿼리로 응답 시간 측정
    const testQuery = await db.user.count()
    const queryTime = Date.now() - startTime

    // 실제 프로덕션에서는 더 정교한 메트릭 수집 필요
    return {
      connections: 0, // Prisma에서는 직접적인 연결 수 접근이 어려움
      queryTime: {
        avg: queryTime,
        min: queryTime,
        max: queryTime,
        p95: queryTime,
        p99: queryTime
      },
      slowQueries: 0,
      activeTransactions: 0
    }
  } catch (error) {
    logger.error('데이터베이스 메트릭 수집 실패', error as Error, 'PERFORMANCE')
    return {
      connections: 0,
      queryTime: { avg: 0, min: 0, max: 0, p95: 0, p99: 0 },
      slowQueries: 0,
      activeTransactions: 0
    }
  }
}

// API 메트릭 수집
async function collectApiMetrics() {
  // 실제 프로덕션에서는 미들웨어를 통해 수집
  // 현재는 기본값 반환
  return {
    responseTime: {
      avg: 0,
      min: 0,
      max: 0,
      p95: 0,
      p99: 0
    },
    requestsPerSecond: 0,
    errorRate: 0,
    activeConnections: 0
  }
}

// 캐시 메트릭 수집
async function collectCacheMetrics() {
  try {
    const stats = await cache.getStats()
    
    return {
      hitRate: 0, // Redis에서는 직접적인 hit rate 제공 안함
      memoryUsage: parseInt(stats.used_memory_human || '0'),
      keysCount: parseInt(stats.db0 || '0'),
      evictions: parseInt(stats.evicted_keys || '0')
    }
  } catch (error) {
    logger.error('캐시 메트릭 수집 실패', error as Error, 'PERFORMANCE')
    return {
      hitRate: 0,
      memoryUsage: 0,
      keysCount: 0,
      evictions: 0
    }
  }
}

// 성능 요약 생성
function generatePerformanceSummary(data: PerformanceMetrics[]) {
  if (data.length === 0) return null

  const recentData = data.slice(-10) // 최근 10개 데이터

  const summary = {
    system: {
      avgCpuUsage: average(recentData.map(d => d.system.cpu.usage)),
      avgMemoryUsage: average(recentData.map(d => d.system.memory.usage)),
      maxCpuUsage: Math.max(...recentData.map(d => d.system.cpu.usage)),
      maxMemoryUsage: Math.max(...recentData.map(d => d.system.memory.usage))
    },
    database: {
      avgQueryTime: average(recentData.map(d => d.database.queryTime.avg)),
      maxQueryTime: Math.max(...recentData.map(d => d.database.queryTime.max)),
      totalSlowQueries: recentData.reduce((sum, d) => sum + d.database.slowQueries, 0)
    },
    api: {
      avgResponseTime: average(recentData.map(d => d.api.responseTime.avg)),
      maxResponseTime: Math.max(...recentData.map(d => d.api.responseTime.max)),
      avgErrorRate: average(recentData.map(d => d.api.errorRate))
    },
    cache: {
      avgHitRate: average(recentData.map(d => d.cache.hitRate)),
      avgMemoryUsage: average(recentData.map(d => d.cache.memoryUsage)),
      totalEvictions: recentData.reduce((sum, d) => sum + d.cache.evictions, 0)
    }
  }

  return summary
}

// 평균 계산 헬퍼
function average(numbers: number[]): number {
  if (numbers.length === 0) return 0
  return Math.round((numbers.reduce((sum, num) => sum + num, 0) / numbers.length) * 100) / 100
}

export const GET = requireAuth(handler)
export const POST = requireAuth(handler)
