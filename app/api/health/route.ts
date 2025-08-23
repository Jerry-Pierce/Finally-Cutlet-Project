import { NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { cache } from '@/lib/redis'
import { logger } from '@/lib/logger'
import os from 'os'

// 헬스체크 응답 인터페이스
interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  uptime: number
  version: string
  environment: string
  checks: {
    database: {
      status: 'healthy' | 'unhealthy'
      responseTime: number
      error?: string
    }
    redis: {
      status: 'healthy' | 'unhealthy'
      responseTime: number
      error?: string
    }
    system: {
      status: 'healthy' | 'unhealthy'
      memory: {
        used: number
        total: number
        usage: number
      }
      cpu: {
        usage: number
        loadAverage: number[]
      }
    }
  }
  metadata: {
    nodeVersion: string
    platform: string
    arch: string
    hostname: string
  }
}

export async function GET() {
  const startTime = Date.now()
  const healthCheck: HealthCheckResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    checks: {
      database: { status: 'unhealthy', responseTime: 0 },
      redis: { status: 'unhealthy', responseTime: 0 },
      system: {
        status: 'healthy',
        memory: { used: 0, total: 0, usage: 0 },
        cpu: { usage: 0, loadAverage: [] }
      }
    },
    metadata: {
      nodeVersion: process.version,
      platform: os.platform(),
      arch: os.arch(),
      hostname: os.hostname()
    }
  }

  let unhealthyChecks = 0

  // 데이터베이스 헬스체크
  try {
    const dbStartTime = Date.now()
    await db.user.count()
    const dbResponseTime = Date.now() - dbStartTime
    
    healthCheck.checks.database = {
      status: 'healthy',
      responseTime: dbResponseTime
    }
    
    if (dbResponseTime > 1000) {
      healthCheck.checks.database.status = 'degraded'
      healthCheck.status = 'degraded'
    }
  } catch (error) {
    healthCheck.checks.database = {
      status: 'unhealthy',
      responseTime: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
    unhealthyChecks++
    logger.error('데이터베이스 헬스체크 실패', error as Error, 'HEALTH_CHECK')
  }

  // Redis 헬스체크
  try {
    const redisStartTime = Date.now()
    const isConnected = await cache.ping()
    const redisResponseTime = Date.now() - redisStartTime
    
    if (isConnected) {
      healthCheck.checks.redis = {
        status: 'healthy',
        responseTime: redisResponseTime
      }
      
      if (redisResponseTime > 100) {
        healthCheck.checks.redis.status = 'degraded'
        if (healthCheck.status === 'healthy') {
          healthCheck.status = 'degraded'
        }
      }
    } else {
      healthCheck.checks.redis = {
        status: 'unhealthy',
        responseTime: redisResponseTime,
        error: 'Redis 연결 실패'
      }
      unhealthyChecks++
    }
  } catch (error) {
    healthCheck.checks.redis = {
      status: 'unhealthy',
      responseTime: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
    unhealthyChecks++
    logger.error('Redis 헬스체크 실패', error as Error, 'HEALTH_CHECK')
  }

  // 시스템 리소스 헬스체크
  try {
    const totalMem = os.totalmem()
    const freeMem = os.freemem()
    const usedMem = totalMem - freeMem
    const memoryUsage = (usedMem / totalMem) * 100
    
    const cpus = os.cpus()
    const cpuUsage = cpus.reduce((acc, cpu) => {
      const total = Object.values(cpu.times).reduce((sum, time) => sum + time, 0)
      const idle = cpu.times.idle
      return acc + ((total - idle) / total)
    }, 0) / cpus.length * 100

    healthCheck.checks.system = {
      status: 'healthy',
      memory: {
        used: usedMem,
        total: totalMem,
        usage: Math.round(memoryUsage * 100) / 100
      },
      cpu: {
        usage: Math.round(cpuUsage * 100) / 100,
        loadAverage: os.loadavg()
      }
    }

    // 메모리 사용률이 90% 이상이면 degraded
    if (memoryUsage > 90) {
      healthCheck.checks.system.status = 'degraded'
      if (healthCheck.status === 'healthy') {
        healthCheck.status = 'degraded'
      }
    }

    // CPU 사용률이 95% 이상이면 degraded
    if (cpuUsage > 95) {
      healthCheck.checks.system.status = 'degraded'
      if (healthCheck.status === 'healthy') {
        healthCheck.status = 'degraded'
      }
    }

    // 로드 평균이 CPU 코어 수보다 높으면 degraded
    const loadAverage = os.loadavg()[0] // 1분 평균
    if (loadAverage > cpus.length) {
      healthCheck.checks.system.status = 'degraded'
      if (healthCheck.status === 'healthy') {
        healthCheck.status = 'degraded'
      }
    }
  } catch (error) {
    healthCheck.checks.system.status = 'unhealthy'
    unhealthyChecks++
    logger.error('시스템 헬스체크 실패', error as Error, 'HEALTH_CHECK')
  }

  // 전체 상태 결정
  if (unhealthyChecks > 0) {
    healthCheck.status = 'unhealthy'
  }

  // 헬스체크 로깅
  const totalResponseTime = Date.now() - startTime
  logger.info('헬스체크 완료', 'HEALTH_CHECK', {
    status: healthCheck.status,
    responseTime: totalResponseTime,
    checks: healthCheck.checks
  })

  // 상태별 HTTP 상태 코드
  let statusCode = 200
  if (healthCheck.status === 'degraded') {
    statusCode = 200 // degraded는 여전히 서비스 가능
  } else if (healthCheck.status === 'unhealthy') {
    statusCode = 503 // Service Unavailable
  }

  return NextResponse.json(healthCheck, { status: statusCode })
}
