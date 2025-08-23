import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { db } from './database'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string
    email: string
    isPremium: boolean
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

    // 사용자 정보 확인
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        isPremium: true,
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
      isPremium: user.isPremium
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

export function requirePremium(handler: (request: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const authenticatedRequest = await authenticateUser(request)
    
    if (!authenticatedRequest.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    if (!authenticatedRequest.user.isPremium) {
      return NextResponse.json(
        { error: '프리미엄 사용자만 이용할 수 있는 기능입니다.' },
        { status: 403 }
      )
    }

    return handler(authenticatedRequest)
  }
}
