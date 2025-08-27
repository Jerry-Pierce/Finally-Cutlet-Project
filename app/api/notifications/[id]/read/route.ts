import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import { db } from '@/lib/database'

async function handler(
  request: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('읽음 처리 API 호출됨')
    console.log('요청 파라미터:', params)
    
    const { id } = params
    const userId = request.user!.userId

    console.log('알림 ID:', id)
    console.log('사용자 ID:', userId)

    if (!id) {
      console.log('알림 ID 누락')
      return NextResponse.json(
        { error: '알림 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    console.log('데이터베이스 업데이트 시작')
    
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

    console.log('업데이트 결과:', updatedNotification)

    if (updatedNotification.count === 0) {
      console.log('알림을 찾을 수 없음')
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
    console.error('오류 상세 정보:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    })
    
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.', details: error.message },
      { status: 500 }
    )
  }
}

export const PATCH = requireAuth(handler)
