import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import { db } from '@/lib/database'

async function handler(request: AuthenticatedRequest) {
  try {
    const userId = request.user!.userId

    // 사용자의 모든 읽지 않은 알림을 읽음 처리
    const updatedNotifications = await db.notification.updateMany({
      where: {
        userId: userId,
        isRead: false
      },
      data: {
        isRead: true
      }
    })

    return NextResponse.json({
      success: true,
      message: `${updatedNotifications.count}개의 알림이 읽음 처리되었습니다.`,
      count: updatedNotifications.count
    })

  } catch (error) {
    console.error('모든 알림 읽음 처리 오류:', error)
    
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export const PATCH = requireAuth(handler)
