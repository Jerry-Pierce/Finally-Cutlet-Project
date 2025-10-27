import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { db } from './database'
import { TokenBlacklistService } from './token-blacklist'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string
    email: string
    username?: string
  }
}

export async function authenticateUser(request: NextRequest): Promise<AuthenticatedRequest> {
  try {
    // 쿠키에서 토큰 가져오기
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return request as AuthenticatedRequest
    }

    // JWT 토큰 검증
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret'
    const decoded = jwt.verify(token, jwtSecret) as any

    // 토큰이 블랙리스트에 있는지 확인
    const isBlacklisted = await TokenBlacklistService.isTokenBlacklisted(token)
    if (isBlacklisted) {
      console.log('블랙리스트된 토큰입니다:', decoded.userId)
      return request as AuthenticatedRequest
    }

    // 사용자 정보 확인
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
      }
    })

    if (!user) {
      return request as AuthenticatedRequest
    }

    // 인증된 사용자 정보를 요청 객체에 추가
    const authenticatedRequest = request as AuthenticatedRequest
    authenticatedRequest.user = {
      userId: user.id,
      email: user.email,
      username: user.username
    }

    // 토큰을 사용자 토큰 목록에 등록
    try {
      await TokenBlacklistService.registerUserToken(user.id, token)
    } catch (error) {
      console.error('토큰 등록 실패:', error)
    }

    return authenticatedRequest

  } catch (error) {
    console.error('인증 오류:', error)
    return request as AuthenticatedRequest
  }
}

export function requireAuth(handler: (request: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const authenticatedRequest = await authenticateUser(request)
    
    if (!authenticatedRequest.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    return handler(authenticatedRequest)
  }
}

// Premium features removed - function kept for backward compatibility
export function requirePremium(handler: (request: AuthenticatedRequest) => Promise<NextResponse>) {
  return requireAuth(handler) // Just require basic auth since premium is removed
}

// JWT 토큰 검증 함수
export async function verifyToken(request: NextRequest): Promise<{ success: boolean; userId?: string; email?: string; username?: string }> {
  try {
    // 쿠키에서 토큰 가져오기
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return { success: false }
    }

    // JWT 토큰 검증
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret'
    const decoded = jwt.verify(token, jwtSecret) as any

    // 사용자 정보 확인
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
      }
    })

    if (!user) {
      return { success: false }
    }

    return {
      success: true,
      userId: user.id,
      email: user.email,
      username: user.username
    }

  } catch (error) {
    console.error('토큰 검증 오류:', error)
    return { success: false }
  }
}
