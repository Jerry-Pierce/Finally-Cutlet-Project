import { NextRequest } from 'next/server'

interface RateLimitConfig {
  windowMs: number      // 시간 윈도우 (밀리초)
  maxRequests: number   // 최대 요청 수
  keyGenerator?: (request: NextRequest) => string  // 키 생성 함수
  skipSuccessfulRequests?: boolean  // 성공한 요청도 카운트할지
  skipFailedRequests?: boolean      // 실패한 요청도 카운트할지
}

interface RateLimitInfo {
  limit: number
  remaining: number
  reset: number
  retryAfter?: number
}

// 메모리 기반 저장소 (프로덕션에서는 Redis 사용 권장)
const store = new Map<string, { count: number; resetTime: number }>()

// 정기적인 정리 작업 (메모리 누수 방지)
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of store.entries()) {
    if (now > value.resetTime) {
      store.delete(key)
    }
  }
}, 60000) // 1분마다 정리

export class RateLimiter {
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = {
      windowMs: 15 * 60 * 1000, // 기본 15분
      maxRequests: 100,          // 기본 100회
      keyGenerator: this.defaultKeyGenerator,
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      ...config
    }
  }

  // 기본 키 생성 함수 (IP 주소 기반)
  private defaultKeyGenerator(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const cfConnectingIp = request.headers.get('cf-connecting-ip')
    
    const ip = forwarded || realIp || cfConnectingIp || 'unknown'
    return `rate_limit:${ip}`
  }

  // 사용자 ID 기반 키 생성
  private userKeyGenerator(request: NextRequest, userId: string): string {
    return `rate_limit:user:${userId}`
  }

  // API 엔드포인트별 키 생성
  private endpointKeyGenerator(request: NextRequest): string {
    const ip = this.defaultKeyGenerator(request)
    const endpoint = request.nextUrl?.pathname || 'unknown'
    return `rate_limit:${endpoint}:${ip}`
  }

  // Rate Limit 체크
  async checkLimit(request: NextRequest, userId?: string): Promise<RateLimitInfo> {
    const key = userId 
      ? this.userKeyGenerator(request, userId)
      : this.config.keyGenerator!(request)

    const now = Date.now()
    const windowStart = now - this.config.windowMs

    // 기존 데이터 가져오기
    const existing = store.get(key)
    
    if (existing && now < existing.resetTime) {
      // 윈도우 내에 있는 경우
      if (existing.count >= this.config.maxRequests) {
        // 제한 초과
        const retryAfter = Math.ceil((existing.resetTime - now) / 1000)
        return {
          limit: this.config.maxRequests,
          remaining: 0,
          reset: existing.resetTime,
          retryAfter
        }
      }
      
      // 카운트 증가
      existing.count++
      store.set(key, existing)
      
      return {
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests - existing.count,
        reset: existing.resetTime
      }
    } else {
      // 새로운 윈도우 시작
      const newEntry = {
        count: 1,
        resetTime: now + this.config.windowMs
      }
      store.set(key, newEntry)
      
      return {
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests - 1,
        reset: newEntry.resetTime
      }
    }
  }

  // Rate Limit 미들웨어
  async middleware(request: NextRequest, userId?: string) {
    const rateLimitInfo = await this.checkLimit(request, userId)
    
    if (rateLimitInfo.remaining < 0) {
      return {
        success: false,
        error: 'Rate limit exceeded',
        retryAfter: rateLimitInfo.retryAfter,
        limit: rateLimitInfo.limit,
        reset: rateLimitInfo.reset
      }
    }
    
    return {
      success: true,
      limit: rateLimitInfo.limit,
      remaining: rateLimitInfo.remaining,
      reset: rateLimitInfo.reset
    }
  }

  // 헤더 생성
  generateHeaders(rateLimitInfo: RateLimitInfo): Record<string, string> {
    const headers: Record<string, string> = {
      'X-RateLimit-Limit': rateLimitInfo.limit.toString(),
      'X-RateLimit-Remaining': rateLimitInfo.remaining.toString(),
      'X-RateLimit-Reset': rateLimitInfo.reset.toString()
    }

    if (rateLimitInfo.retryAfter) {
      headers['Retry-After'] = rateLimitInfo.retryAfter.toString()
    }

    return headers
  }
}

// 미리 정의된 Rate Limiter들
export const rateLimiters = {
  // 일반 API 요청 (IP 기반)
  general: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15분
    maxRequests: 100           // 100회
  }),

  // URL 단축 (IP 기반)
  urlShortening: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1시간
    maxRequests: 50            // 50회
  }),

  // 인증 관련 (IP 기반)
  auth: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15분
    maxRequests: 10            // 10회
  }),

  // 사용자별 제한 (사용자 ID 기반)
  userSpecific: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1시간
    maxRequests: 1000          // 1000회
  })
}

// Rate Limit 미들웨어 함수
export async function withRateLimit(
  request: NextRequest,
  limiter: RateLimiter,
  userId?: string
) {
  const result = await limiter.middleware(request, userId)
  
  if (!result.success) {
    return {
      success: false,
      error: result.error,
      retryAfter: result.retryAfter,
      limit: result.limit,
      reset: result.reset
    }
  }
  
  return {
    success: true,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset
  }
}
