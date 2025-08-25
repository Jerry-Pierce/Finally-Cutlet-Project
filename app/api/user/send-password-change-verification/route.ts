import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { sendEmail } from '@/lib/email-service'
import { verifyToken } from '@/lib/auth-middleware'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const authResult = await verifyToken(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'unauthorized', errorType: 'unauthorized' },
        { status: 401 }
      )
    }

    const { currentPassword } = await request.json()
    const userId = authResult.userId

    // 현재 비밀번호 검증
    if (!currentPassword) {
      return NextResponse.json(
        { error: 'currentPasswordRequired', errorType: 'currentPasswordRequired' },
        { status: 400 }
      )
    }

    // 사용자 정보 조회
    const user = await db.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'userNotFound', errorType: 'userNotFound' },
        { status: 404 }
      )
    }

    // 현재 비밀번호 확인
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash)
    
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'invalidCurrentPassword', errorType: 'invalidCurrentPassword' },
        { status: 400 }
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
        <h2 style="color: #333; text-align: center;">Cutlet 비밀번호 변경 인증</h2>
        <p style="color: #666; font-size: 16px;">안녕하세요! Cutlet 계정 비밀번호 변경을 위한 인증 코드입니다.</p>
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #007bff; font-size: 24px; margin: 0;">${verificationCode}</h3>
          <p style="color: #666; font-size: 14px; margin: 10px 0 0 0;">위의 6자리 코드를 입력해주세요.</p>
        </div>
        <p style="color: #666; font-size: 14px;">이 인증 코드는 5분간 유효합니다.</p>
        <p style="color: #dc3545; font-size: 14px;">⚠️ 본인이 요청하지 않았다면 이 이메일을 무시하세요.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">Cutlet Team</p>
      </div>
    `

    await sendEmail({
      to: user.email,
      subject: 'Cutlet 비밀번호 변경 인증 코드',
      html: emailContent,
      userId: userId
    })

    // 인증 코드를 세션에 저장 (실제로는 Redis 사용 권장)
    // 여기서는 간단하게 응답에 포함
    return NextResponse.json({
      success: true,
      message: 'verificationCodeSent',
      verificationCode: verificationCode, // 개발용으로 유지
      expiresAt: expiresAt.toISOString()
    })

  } catch (error) {
    console.error('비밀번호 변경 인증 코드 전송 오류:', error)
    return NextResponse.json(
      { error: 'verificationCodeSendFailed', errorType: 'verificationCodeSendFailed' },
      { status: 500 }
    )
  }
}
