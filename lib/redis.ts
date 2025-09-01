import { Redis } from 'ioredis'

// Redis 클라이언트 설정
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 10,   // 재시도 횟수 증가
  lazyConnect: true,          // 지연 연결 (필요할 때 연결)
  keepAlive: 30000,
  connectTimeout: 10000,      // 연결 타임아웃 설정
  commandTimeout: 5000,       // 명령 타임아웃 설정
  enableOfflineQueue: true,   // 오프라인 큐 활성화
  enableReadyCheck: true,     // 준비 상태 확인 활성화
})

// 연결 이벤트 처리
redis.on('connect', () => {
  console.log('✅ Redis 연결 성공')
})

redis.on('error', (error) => {
  console.error('❌ Redis 연결 오류:', error)
})

redis.on('close', () => {
  console.log('🔌 Redis 연결 종료')
})

redis.on('reconnecting', () => {
  console.log('🔄 Redis 재연결 시도 중...')
})

// 캐시 유틸리티 함수들
export class CacheManager {
  private static instance: CacheManager
  private redis: Redis

  private constructor() {
    this.redis = redis
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager()
    }
    return CacheManager.instance
  }

  // 키 생성
  private generateKey(prefix: string, identifier: string): string {
    return `${prefix}:${identifier}`
  }

  // 문자열 캐시
  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await this.redis.setex(key, ttl, value)
      } else {
        await this.redis.set(key, value)
      }
    } catch (error) {
      console.error('Redis SET 오류:', error)
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.redis.get(key)
    } catch (error) {
      console.error('Redis GET 오류:', error)
      return null
    }
  }

  // JSON 객체 캐시
  async setJSON(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value)
      if (ttl) {
        await this.redis.setex(key, ttl, jsonValue)
      } else {
        await this.redis.set(key, jsonValue)
      }
    } catch (error) {
      console.error('Redis SET JSON 오류:', error)
    }
  }

  async getJSON<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error('Redis GET JSON 오류:', error)
      return null
    }
  }

  // 해시 캐시
  async hset(key: string, field: string, value: string): Promise<void> {
    try {
      await this.redis.hset(key, field, value)
    } catch (error) {
      console.error('Redis HSET 오류:', error)
    }
  }

  async hget(key: string, field: string): Promise<string | null> {
    try {
      return await this.redis.hget(key, field)
    } catch (error) {
      console.error('Redis HGET 오류:', error)
      return null
    }
  }

  async hgetall(key: string): Promise<Record<string, string> | null> {
    try {
      return await this.redis.hgetall(key)
    } catch (error) {
      console.error('Redis HGETALL 오류:', error)
      return null
    }
  }

  // 리스트 캐시
  async lpush(key: string, value: string): Promise<void> {
    try {
      await this.redis.lpush(key, value)
    } catch (error) {
      console.error('Redis LPUSH 오류:', error)
    }
  }

  async rpush(key: string, value: string): Promise<void> {
    try {
      await this.redis.rpush(key, value)
    } catch (error) {
      console.error('Redis RPUSH 오류:', error)
    }
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    try {
      return await this.redis.lrange(key, start, stop)
    } catch (error) {
      console.error('Redis LRANGE 오류:', error)
      return []
    }
  }

  // 키 관리
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key)
      return result === 1
    } catch (error) {
      console.error('Redis EXISTS 오류:', error)
      return false
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key)
    } catch (error) {
      console.error('Redis DEL 오류:', error)
    }
  }

  async expire(key: string, ttl: number): Promise<void> {
    try {
      await this.redis.expire(key, ttl)
    } catch (error) {
      console.error('Redis EXPIRE 오류:', error)
    }
  }

  // 패턴 기반 키 삭제
  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern)
      if (keys.length > 0) {
        await this.redis.del(...keys)
      }
    } catch (error) {
      console.error('Redis DEL PATTERN 오류:', error)
    }
  }

  // 통계 정보
  async getStats(): Promise<any> {
    try {
      const info = await this.redis.info()
      const stats: any = {}
      
      info.split('\r\n').forEach(line => {
        if (line.includes(':')) {
          const [key, value] = line.split(':')
          stats[key] = value
        }
      })
      
      return stats
    } catch (error) {
      console.error('Redis INFO 오류:', error)
      return {}
    }
  }

  // 연결 상태 확인
  async ping(): Promise<boolean> {
    try {
      const result = await this.redis.ping()
      return result === 'PONG'
    } catch (error) {
      console.error('Redis PING 오류:', error)
      return false
    }
  }

  // 연결 종료
  async disconnect(): Promise<void> {
    try {
      await this.redis.quit()
    } catch (error) {
      console.error('Redis DISCONNECT 오류:', error)
    }
  }
}

// 캐시 키 상수
export const CACHE_KEYS = {
  USER_PROFILE: 'user:profile',
  URL_STATS: 'url:stats',
  TAG_LIST: 'tag:list',
  SEARCH_RESULTS: 'search:results',
  ANALYTICS: 'analytics',
  PUBLIC_STATS: 'public:stats',
  RATE_LIMIT: 'rate:limit',
} as const

// 캐시 TTL 상수 (초)
export const CACHE_TTL = {
  SHORT: 300,      // 5분
  MEDIUM: 1800,    // 30분
  LONG: 3600,      // 1시간
  DAY: 86400,      // 24시간
  WEEK: 604800,    // 7일
} as const

// 기본 캐시 매니저 인스턴스
export const cache = CacheManager.getInstance()

// Redis 클라이언트 직접 접근 (필요시)
export { redis }

// 연결 테스트
export async function testRedisConnection(): Promise<boolean> {
  try {
    const isConnected = await cache.ping()
    if (isConnected) {
      console.log('✅ Redis 연결 테스트 성공')
      return true
    } else {
      console.log('❌ Redis 연결 테스트 실패')
      return false
    }
  } catch (error) {
    console.error('❌ Redis 연결 테스트 오류:', error)
    return false
  }
}

// Redis 연결 상태 확인 및 재연결
export async function ensureRedisConnection(): Promise<boolean> {
  try {
    // ping으로 연결 상태 확인
    const result = await redis.ping()
    return result === 'PONG'
  } catch (error) {
    console.error('❌ Redis 연결 확인 오류:', error)
    return false
  }
}
