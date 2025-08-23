import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import { db } from '@/lib/database'

async function handler(
  request: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const userId = request.user!.userId

    if (!id) {
      return NextResponse.json(
        { error: '알림 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    // 알림 읽음 처리
    const updatedNotification = await db.notification.updateMany({
      where: {
        id: id,
        userId: userId
      },
      data: {
        isRead: true
      }
    })

    if (updatedNotification.count === 0) {
      return NextResponse.json(
        { error: '알림을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '알림이 읽음 처리되었습니다.'
    })

  } catch (error) {
    console.error('알림 읽음 처리 오류:', error)
    
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export const PATCH = requireAuth(handler)
