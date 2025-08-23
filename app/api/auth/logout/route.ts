import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // 응답 생성
    const response = NextResponse.json({
      success: true,
      message: '로그아웃이 완료되었습니다.'
    })

    // 인증 토큰 쿠키 제거
    response.cookies.set('auth-token', '', {
      httpOnly: true,
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
