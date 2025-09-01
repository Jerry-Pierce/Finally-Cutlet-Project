import { NextResponse } from 'next/server'
import { testRedisConnection, getRedisStatus } from '@/lib/redis'

export async function GET() {
  try {
    // Redis 연결 테스트
    const redisConnected = await testRedisConnection()
    const redisStatus = getRedisStatus()
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        redis: {
          connected: redisConnected,
          status: redisStatus.status,
          url: redisStatus.url ? '설정됨' : '설정되지 않음'
        }
      }
    })
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
