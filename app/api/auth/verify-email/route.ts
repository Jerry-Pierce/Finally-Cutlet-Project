import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, verificationCode, expectedCode } = await request.json()

    if (!email || !verificationCode || !expectedCode) {
      return NextResponse.json(
        { error: '모든 필드가 필요합니다.' },
        { status: 400 }
      )
    }

    // 인증 코드 확인
    if (verificationCode === expectedCode) {
      return NextResponse.json({
        success: true,
        message: '이메일 인증이 완료되었습니다.',
        verified: true
      })
    } else {
      return NextResponse.json({
        success: false,
        message: '인증 코드가 일치하지 않습니다.',
        verified: false
      })
    }

  } catch (error) {
    console.error('이메일 인증 확인 오류:', error)
    return NextResponse.json(
      { error: '인증 확인에 실패했습니다. 다시 시도해주세요.' },
      { status: 500 }
    )
  }
}
