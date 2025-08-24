import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: '토큰과 새 비밀번호가 필요합니다.' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: '비밀번호는 최소 8자 이상이어야 합니다.' },
        { status: 400 }
      )
    }

    // 토큰 검증
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true }
    })

    if (!resetToken) {
      return NextResponse.json(
        { error: '유효하지 않은 토큰입니다.' },
        { status: 400 }
      )
    }

    // 토큰 만료 확인
    if (resetToken.expiresAt < new Date()) {
      // 만료된 토큰 삭제
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id }
      })
      
      return NextResponse.json(
        { error: '토큰이 만료되었습니다.' },
        { status: 400 }
      )
    }

    // 새 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 12)

    // 비밀번호 업데이트
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { 
        passwordHash: hashedPassword,
        updatedAt: new Date()
      }
    })

    // 사용된 토큰 삭제
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id }
      })

    return NextResponse.json(
      { message: '비밀번호가 성공적으로 변경되었습니다.' },
      { status: 200 }
    )

  } catch (error) {
    console.error('비밀번호 재설정 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
