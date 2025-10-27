import { NextResponse } from 'next/server'
import { requireAuth, AuthenticatedRequest } from '@/lib/auth-middleware'

// 가벼운 인증 체크 API - 토큰 유효성만 검사
export const GET = requireAuth(async (request: AuthenticatedRequest) => {
  // requireAuth 미들웨어를 통과했다면 토큰이 유효함
  return NextResponse.json({ 
    success: true, 
    message: 'Token is valid',
    userId: request.user!.userId 
  })
})
