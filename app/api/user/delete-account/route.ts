import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth-middleware'

const prisma = new PrismaClient()

export async function DELETE(request: NextRequest) {
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

    // 사용자 확인
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
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

    // 계정 삭제 시작 (트랜잭션 사용)
    await prisma.$transaction(async (tx) => {
      // 1. 사용자의 모든 URL 클릭 기록 삭제
      await tx.urlClick.deleteMany({
        where: {
          url: {
            userId: userId
          }
        }
      })

      // 2. 사용자의 모든 즐겨찾기 삭제
      await tx.favorite.deleteMany({
        where: { userId: userId }
      })

      // 3. 사용자의 모든 URL 태그 관계 삭제
      await tx.urlTag.deleteMany({
        where: {
          url: {
            userId: userId
          }
        }
      })

      // 4. 사용자의 모든 커스텀 태그 삭제
      await tx.tag.deleteMany({
        where: { userId: userId }
      })

      // 5. 사용자의 모든 알림 삭제
      await tx.notification.deleteMany({
        where: { userId: userId }
      })

      // 6. 사용자의 모든 비밀번호 재설정 토큰 삭제
      await tx.passwordResetToken.deleteMany({
        where: { userId: userId }
      })

      // 7. 사용자의 모든 단축 URL 삭제
      await tx.shortenedUrl.deleteMany({
        where: { userId: userId }
      })

      // 8. 마지막으로 사용자 계정 삭제
      await tx.user.delete({
        where: { id: userId }
      })
    })

    return NextResponse.json(
      { 
        message: '계정이 성공적으로 삭제되었습니다.',
        deletedAt: new Date().toISOString()
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('계정 삭제 오류:', error)
    
    // 데이터베이스 오류인 경우
    if (error instanceof Error && error.message.includes('database')) {
      return NextResponse.json(
        { error: '데이터베이스 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: '계정 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
