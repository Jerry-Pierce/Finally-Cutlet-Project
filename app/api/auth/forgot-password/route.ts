import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { sendPasswordResetEmail } from '@/lib/email-service'
import crypto from 'crypto'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: '이메일 주소를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 사용자 확인
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!user) {
      // 보안을 위해 사용자가 존재하지 않아도 성공 응답
      return NextResponse.json(
        { message: '비밀번호 재설정 이메일이 발송되었습니다.' },
        { status: 200 }
      )
    }

    // 기존 토큰 삭제
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id }
    })

    // 새로운 재설정 토큰 생성
    const resetToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1시간 후 만료

    await prisma.passwordResetToken.create({
      data: {
        token: resetToken,
        userId: user.id,
        expiresAt
      }
    })

    // 이메일 발송
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`
    const emailResult = await sendPasswordResetEmail(email, user.username || user.email, resetLink)

    if (!emailResult.success) {
      console.error('비밀번호 재설정 이메일 전송 실패:', emailResult.error)
      return NextResponse.json(
        { error: '이메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: '비밀번호 재설정 이메일이 발송되었습니다.' },
      { status: 200 }
    )

  } catch (error) {
    console.error('비밀번호 재설정 요청 오류:', error)
    console.error('오류 상세:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      name: error instanceof Error ? error.name : 'Unknown error type'
    })
    return NextResponse.json(
      { 
        error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
