import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { sendNotification } from '@/app/api/notifications/route'

export async function GET(request: NextRequest) {
  try {
    // API 키 확인 (보안을 위해)
    const apiKey = request.headers.get('x-api-key')
    if (apiKey !== process.env.CRON_API_KEY) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      )
    }

    const now = new Date()
    
    // 만료된 URL 찾기 (24시간 이내에 만료되는 것들)
    const expiringUrls = await db.shortenedUrl.findMany({
      where: {
        expiresAt: {
          lte: new Date(now.getTime() + 24 * 60 * 60 * 1000), // 24시간 후
          gt: now // 현재보다는 늦게
        },
        userId: {
          not: null // 로그인한 사용자의 URL만
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true
          }
        }
      }
    })

    // 이미 만료된 URL 찾기
    const expiredUrls = await db.shortenedUrl.findMany({
      where: {
        expiresAt: {
          lte: now
        },
        userId: {
          not: null
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true
          }
        }
      }
    })

    let notificationsSent = 0

    // 만료 예정인 URL에 대한 알림
    for (const url of expiringUrls) {
      if (url.userId && url.user) {
        const hoursUntilExpiry = Math.ceil((url.expiresAt!.getTime() - now.getTime()) / (1000 * 60 * 60))
        
        try {
          // 알림 데이터베이스에 저장
          await db.notification.create({
            data: {
              userId: url.userId,
              type: 'url_expired',
              title: 'URL 만료 예정',
              message: `"${url.title || url.originalUrl.substring(0, 30)}" 링크가 ${hoursUntilExpiry}시간 후에 만료됩니다.`,
              data: {
                urlId: url.id,
                shortCode: url.shortCode,
                expiresAt: url.expiresAt,
                hoursUntilExpiry
              }
            }
          })

          // 실시간 알림 전송
          sendNotification(url.userId, {
            type: 'url_expired',
            title: 'URL 만료 예정',
            message: `"${url.title || url.originalUrl.substring(0, 30)}" 링크가 ${hoursUntilExpiry}시간 후에 만료됩니다.`,
            data: {
              urlId: url.id,
              shortCode: url.shortCode,
              expiresAt: url.expiresAt,
              hoursUntilExpiry
            }
          })

          notificationsSent++
        } catch (error) {
          console.error(`사용자 ${url.userId}에게 만료 예정 알림 전송 실패:`, error)
        }
      }
    }

    // 이미 만료된 URL에 대한 알림
    for (const url of expiredUrls) {
      if (url.userId && url.user) {
        try {
          // 알림 데이터베이스에 저장
          await db.notification.create({
            data: {
              userId: url.userId,
              type: 'url_expired',
              title: 'URL 만료됨',
              message: `"${url.title || url.originalUrl.substring(0, 30)}" 링크가 만료되었습니다.`,
              data: {
                urlId: url.id,
                shortCode: url.shortCode,
                expiredAt: url.expiresAt
              }
            }
          })

          // 실시간 알림 전송
          sendNotification(url.userId, {
            type: 'url_expired',
            title: 'URL 만료됨',
            message: `"${url.title || url.originalUrl.substring(0, 30)}" 링크가 만료되었습니다.`,
            data: {
              urlId: url.id,
              shortCode: url.shortCode,
              expiredAt: url.expiresAt
            }
          })

          notificationsSent++
        } catch (error) {
          console.error(`사용자 ${url.userId}에게 만료 알림 전송 실패:`, error)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: '만료 URL 확인 완료',
      data: {
        expiringUrls: expiringUrls.length,
        expiredUrls: expiredUrls.length,
        notificationsSent
      }
    })

  } catch (error) {
    console.error('만료 URL 확인 오류:', error)
    
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
