import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { sendEmail } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'emailRequired', errorType: 'emailRequired' },
        { status: 400 }
      )
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'invalidEmailFormat', errorType: 'invalidEmailFormat' },
        { status: 400 }
      )
    }

    // 이미 가입된 이메일인지 확인
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'emailAlreadyExists', errorType: 'emailAlreadyExists' },
        { status: 409 }
      )
    }

    // 6자리 랜덤 인증 코드 생성
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    
    // 인증 코드를 Redis에 저장 (5분간 유효)
    // 실제 구현에서는 Redis를 사용하지만, 여기서는 간단하게 구현
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5분 후 만료

    // 이메일 전송
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; text-align: center;">Cutlet 이메일 인증</h2>
        <p style="color: #666; font-size: 16px;">안녕하세요! Cutlet 회원가입을 위한 인증 코드입니다.</p>
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #007bff; font-size: 24px; margin: 0;">${verificationCode}</h3>
          <p style="color: #666; font-size: 14px; margin: 10px 0 0 0;">위의 6자리 코드를 입력해주세요.</p>
        </div>
        <p style="color: #666; font-size: 14px;">이 인증 코드는 5분간 유효합니다.</p>
        <p style="color: #666; font-size: 14px;">본인이 요청하지 않았다면 이 이메일을 무시하세요.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">Cutlet Team</p>
      </div>
    `

    await sendEmail({
      to: email,
      subject: 'Cutlet 이메일 인증 코드',
      html: emailContent,
      checkNotifications: false
    })

    // 인증 코드를 세션에 저장 (실제로는 Redis 사용 권장)
    // 여기서는 간단하게 응답에 포함
    return NextResponse.json({
      success: true,
      message: 'verificationCodeSent',
      verificationCode: verificationCode, // 실제 운영에서는 제거
      expiresAt: expiresAt.toISOString()
    })

  } catch (error) {
    console.error('이메일 인증 코드 전송 오류:', error)
    return NextResponse.json(
      { error: 'verificationCodeSendFailed', errorType: 'verificationCodeSendFailed' },
      { status: 500 }
    )
  }
}
