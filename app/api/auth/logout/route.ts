import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { TokenBlacklistService } from '@/lib/token-blacklist'

export async function POST(request: NextRequest) {
  try {
    // 현재 토큰 가져오기
    const token = request.cookies.get('auth-token')?.value
    
    if (token) {
      try {
        // JWT 토큰 디코딩하여 사용자 ID와 만료 시간 확인
        const jwtSecret = process.env.JWT_SECRET || 'fallback-secret'
        const decoded = jwt.verify(token, jwtSecret) as any
        
        // 토큰을 블랙리스트에 추가
        await TokenBlacklistService.blacklistToken(token, decoded.userId, decoded.exp * 1000)
        
        // 사용자 토큰 목록에서 제거
        await TokenBlacklistService.removeUserToken(decoded.userId, token)
        
        console.log(`사용자 ${decoded.userId}가 로그아웃했습니다. 토큰이 블랙리스트에 추가되었습니다.`)
      } catch (error) {
        console.error('토큰 블랙리스트 처리 실패:', error)
      }
    }

    // 응답 생성
    const response = NextResponse.json({
      success: true,
      message: '로그아웃이 완료되었습니다.'
    })

    // 인증 토큰 쿠키 제거
    response.cookies.set('auth-token', '', {
      httpOnly: false, // 클라이언트에서 접근 가능하도록 변경
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(0), // 즉시 만료
      path: '/'
    })

    return response

  } catch (error) {
    console.error('로그아웃 오류:', error)
    
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
