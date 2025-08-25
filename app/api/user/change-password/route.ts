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

    const { currentPassword, newPassword, verificationCode } = await request.json()
    const userId = authResult.userId

    // 필수 필드 검증
    if (!currentPassword || !newPassword || !verificationCode) {
      return NextResponse.json(
        { error: 'missingFields', errorType: 'missingFields' },
        { status: 400 }
      )
    }

    // 새 비밀번호 유효성 검증
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'passwordTooShort', errorType: 'passwordTooShort' },
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

    // 이메일 인증 코드 확인 (실제로는 Redis에서 확인)
    // 여기서는 간단하게 구현 - 실제로는 Redis 사용 권장
    console.log('🔍 디버깅 - 받은 인증 코드:', verificationCode)
    
    // 개발용: 인증 코드가 6자리 숫자인지만 확인
    if (!verificationCode || !/^\d{6}$/.test(verificationCode)) {
      console.log('❌ 인증 코드 형식 오류')
      return NextResponse.json(
        { error: 'invalidVerificationCode', errorType: 'invalidVerificationCode' },
        { status: 400 }
      )
    }
    
    console.log('✅ 인증 코드 형식 확인 완료')

    // 새 비밀번호 해시화
    const hashedNewPassword = await bcrypt.hash(newPassword, 12)

    // 비밀번호 업데이트
    await db.user.update({
      where: { id: userId },
      data: { passwordHash: hashedNewPassword }
    })

    // 비밀번호 변경 알림 이메일 전송
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; text-align: center;">Cutlet 비밀번호 변경 알림</h2>
        <p style="color: #666; font-size: 16px;">안녕하세요! 귀하의 Cutlet 계정 비밀번호가 변경되었습니다.</p>
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <p style="color: #dc3545; font-size: 14px; margin: 0;">⚠️ 보안 경고</p>
          <p style="color: #666; font-size: 14px; margin: 10px 0 0 0;">본인이 요청하지 않았다면 즉시 고객지원팀에 연락하세요.</p>
        </div>
        <p style="color: #666; font-size: 14px;">변경 시간: ${new Date().toLocaleString('ko-KR')}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">Cutlet Team</p>
      </div>
    `

    await sendEmail({
      to: user.email,
      subject: 'Cutlet 비밀번호 변경 알림',
      html: emailContent,
      userId: userId
    })

    return NextResponse.json({
      success: true,
      message: 'passwordChangeSuccess'
    })

  } catch (error) {
    console.error('비밀번호 변경 오류:', error)
    return NextResponse.json(
      { error: 'passwordChangeFailed', errorType: 'passwordChangeFailed' },
      { status: 500 }
    )
  }
}
