import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth-middleware'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    // JWT 토큰 검증
    const authResult = await verifyToken(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    const userId = authResult.userId
    const { password, userId: requestUserId } = await request.json()

    // 사용자 ID 우선순위: 요청에서 받은 ID > 토큰에서 추출한 ID
    const finalUserId = requestUserId || userId

    if (!password) {
      return NextResponse.json(
        { error: '비밀번호를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 사용자 확인
    const user = await prisma.user.findUnique({
      where: { id: finalUserId }
    })

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 비밀번호 확인
    const bcrypt = require('bcryptjs')
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: '비밀번호가 올바르지 않습니다.' },
        { status: 400 }
      )
    }

    // 계정 삭제 전 확인 - 최근 24시간 내 생성된 계정은 삭제 불가
    const accountAge = Date.now() - user.createdAt.getTime()
    const oneDayInMs = 24 * 60 * 60 * 1000
    
    if (accountAge < oneDayInMs) {
      return NextResponse.json(
        { error: '계정 생성 후 24시간이 지나야 삭제할 수 있습니다.' },
        { status: 400 }
      )
    }

    // 삭제 가능한 데이터 요약 제공
    const dataSummary = await prisma.$transaction(async (tx) => {
      const urlCount = await tx.shortenedUrl.count({
        where: { userId: finalUserId }
      })

      const clickCount = await tx.urlClick.count({
        where: {
          url: {
            userId: finalUserId
          }
        }
      })

      const tagCount = await tx.tag.count({
        where: { userId: finalUserId }
      })

      const favoriteCount = await tx.favorite.count({
        where: { userId: finalUserId }
      })

      return {
        urlCount,
        clickCount,
        tagCount,
        favoriteCount,
        accountAge: Math.floor(accountAge / (1000 * 60 * 60 * 24)) // 일 단위
      }
    })

    return NextResponse.json(
      { 
        message: '계정 삭제가 확인되었습니다.',
        dataSummary,
        canDelete: true
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('계정 삭제 확인 오류:', error)
    return NextResponse.json(
      { error: '계정 삭제 확인 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
