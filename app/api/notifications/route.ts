import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import { db } from '@/lib/database'

// WebSocket 연결을 저장할 Map
const connections = new Map<string, WebSocket>()

async function handler(request: AuthenticatedRequest) {
  try {
    // WebSocket 업그레이드 확인 (현재 Next.js에서 지원되지 않음)
    // if (request.headers.get('upgrade') === 'websocket') {
    //   // WebSocket 연결 처리
    //   const { socket, response } = Deno.upgradeWebSocket(request)
    //   
    //   const userId = request.user!.userId
    //   
    //   // 연결 저장
    //   connections.set(userId, socket)
    //   
    //   // 연결 이벤트 처리
    //   socket.onopen = () => {
    //     console.log(`사용자 ${userId} WebSocket 연결됨`)
    //   }
    //   
    //   socket.onmessage = (event) => {
    //     try {
    //       const data = JSON.parse(event.data)
    //       console.log('WebSocket 메시지 수신:', data)
    //     } catch (error) {
    //       console.error('WebSocket 메시지 파싱 오류:', error)
    //     }
    //   }
    //   
    //   socket.onclose = () => {
    //     console.log(`사용자 ${userId} WebSocket 연결 해제됨`)
    //     connections.delete(userId)
    //   }
    //   
    //   socket.onerror = (error) => {
    //     console.error(`사용자 ${userId} WebSocket 오류:`, error)
    //     connections.delete(userId)
    //   }
    //   
    //   return response
    // }
    
    // 일반 HTTP 요청 처리
    const userId = request.user!.userId
    
    // 사용자의 알림 목록 조회
    const notifications = await db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    })
    
    return NextResponse.json({
      success: true,
      data: notifications
    })
    
  } catch (error) {
    console.error('알림 처리 오류:', error)
    
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export const GET = requireAuth(handler)

// 실시간 알림 전송 함수 (다른 API에서 호출)
export function sendNotification(userId: string, notification: {
  type: 'url_click' | 'url_expired' | 'system'
  title: string
  message: string
  data?: any
}) {
  const connection = connections.get(userId)
  
  if (connection && connection.readyState === WebSocket.OPEN) {
    try {
      connection.send(JSON.stringify({
        type: 'notification',
        data: notification
      }))
    } catch (error) {
      console.error('알림 전송 오류:', error)
      connections.delete(userId)
    }
  }
}

// 모든 연결된 사용자에게 브로드캐스트
export function broadcastNotification(notification: {
  type: 'system' | 'announcement'
  title: string
  message: string
  data?: any
}) {
  connections.forEach((connection, userId) => {
    if (connection.readyState === WebSocket.OPEN) {
      try {
        connection.send(JSON.stringify({
          type: 'broadcast',
          data: notification
        }))
      } catch (error) {
        console.error(`사용자 ${userId}에게 브로드캐스트 전송 오류:`, error)
        connections.delete(userId)
      }
    }
  })
}
