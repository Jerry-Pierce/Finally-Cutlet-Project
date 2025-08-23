import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { createClickWithGeo } from '@/lib/geo-middleware'
import { sendNotification } from '@/app/api/notifications/route'

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params

    if (!code) {
      return NextResponse.json(
        { error: 'URL 코드가 필요합니다.' },
        { status: 400 }
      )
    }

    // 데이터베이스에서 URL 찾기
    const shortenedUrl = await db.shortenedUrl.findFirst({
      where: {
        OR: [
          { shortCode: code },
          { customCode: code }
        ]
      },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    if (!shortenedUrl) {
      return NextResponse.json(
        { error: 'URL을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 만료 확인
    if (shortenedUrl.expiresAt && new Date() > shortenedUrl.expiresAt) {
      return NextResponse.json(
        { error: '이 링크는 만료되었습니다.' },
        { status: 410 }
      )
    }

    // 클릭 추적 정보 수집 (지리적 위치 정보 포함)
    const clickData = await createClickWithGeo(request, shortenedUrl.id)

    // 클릭 기록 저장
    await db.urlClick.create({
      data: clickData
    })

    // URL 소유자에게 실시간 알림 전송 (로그인한 사용자인 경우)
    if (shortenedUrl.userId) {
      try {
        // 알림 데이터베이스에 저장
        await db.notification.create({
          data: {
            userId: shortenedUrl.userId,
            type: 'url_click',
            title: '새로운 방문자!',
            message: `"${shortenedUrl.title || shortenedUrl.originalUrl.substring(0, 30)}" 링크가 클릭되었습니다.`,
            data: {
              urlId: shortenedUrl.id,
              shortCode: shortenedUrl.shortCode,
              clickData: {
                country: clickData.country,
                city: clickData.city,
                ipAddress: clickData.ipAddress
              }
            }
          }
        })

        // 실시간 WebSocket 알림 전송
        sendNotification(shortenedUrl.userId, {
          type: 'url_click',
          title: '새로운 방문자!',
          message: `"${shortenedUrl.title || shortenedUrl.originalUrl.substring(0, 30)}" 링크가 클릭되었습니다.`,
          data: {
            urlId: shortenedUrl.id,
            shortCode: shortenedUrl.shortCode,
            clickData: {
              country: clickData.country,
              city: clickData.city,
              ipAddress: clickData.ipAddress
            }
          }
        })
      } catch (error) {
        console.error('알림 생성 오류:', error)
        // 알림 실패는 리다이렉트에 영향을 주지 않음
      }
    }

    // 원본 URL로 리다이렉트
    return NextResponse.redirect(shortenedUrl.originalUrl)

  } catch (error) {
    console.error('리다이렉트 오류:', error)
    
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
