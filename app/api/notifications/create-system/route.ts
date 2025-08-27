import { NextResponse } from 'next/server'
import { requireAuthHandler } from '@/lib/auth-middleware'
import { db } from '@/lib/database'

export async function POST(request: Request) {
  try {
    const { type, message, targetUsers } = await request.json()
    
    // 관리자 권한 확인 (선택사항)
    // const user = await requireAuthHandler(request)
    // if (user.email !== 'cutlet.service@gmail.com') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    let users: any[] = []
    
    if (targetUsers === 'all') {
      // 모든 활성 사용자에게 알림 생성
      users = await db.user.findMany({
        where: { status: 'active' },
        select: { id: true }
      })
    } else if (targetUsers === 'new') {
      // 최근 7일 내 가입한 사용자에게만 알림 생성
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      users = await db.user.findMany({
        where: { 
          status: 'active',
          createdAt: { gte: sevenDaysAgo }
        },
        select: { id: true }
      })
    }

    // 각 사용자에게 알림 생성
                const notifications = users.map(user => ({
              userId: user.id,
              type: type || 'system',
              title: type === 'welcome' ? 'welcomeNotificationTitle' : 'premiumUpdateTitle',
              message: message,
              isRead: false,
              createdAt: new Date()
            }))

    if (notifications.length > 0) {
      await db.notification.createMany({
        data: notifications
      })
    }

    return NextResponse.json({
      success: true,
      message: `${notifications.length}명의 사용자에게 알림을 전송했습니다.`,
      count: notifications.length
    })

  } catch (error) {
    console.error('시스템 알림 생성 실패:', error)
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', message: '알림 생성에 실패했습니다.' },
      { status: 500 }
    )
  }
}
