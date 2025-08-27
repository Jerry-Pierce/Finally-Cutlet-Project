import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: '토큰이 필요합니다.' },
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

    return NextResponse.json(
      { message: '토큰이 유효합니다.', userId: resetToken.userId },
      { status: 200 }
    )

  } catch (error) {
    console.error('토큰 검증 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
