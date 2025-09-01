import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { createClickWithGeo } from '@/lib/geo-middleware'
import { sendNotification } from '@/app/api/notifications/route'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params

    console.log('Redirect request received for code:', code)
    console.log('User-Agent:', request.headers.get('user-agent'))
    console.log('IP Address:', request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown')

    if (!code) {
      return NextResponse.json(
        { error: 'URL 코드가 필요합니다.' },
        { status: 400 }
      )
    }

    // 데이터베이스에서 URL 찾기
    const shortenedUrl = await prisma.shortenedUrl.findFirst({
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
      console.log('URL not found for code:', code)
      return NextResponse.json(
        { error: 'URL을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    console.log('URL found:', shortenedUrl.originalUrl)

    // 만료 확인
    if (shortenedUrl.expiresAt && new Date() > shortenedUrl.expiresAt) {
      console.log('URL expired for code:', code)
      return NextResponse.json(
        { error: '이 링크는 만료되었습니다.' },
        { status: 410 }
      )
    }

    // 클릭 추적 정보 수집 (지리적 위치 정보 포함)
    console.log('Creating click data for URL ID:', shortenedUrl.id)
    const clickData = await createClickWithGeo(request, shortenedUrl.id)
    console.log('Click data created:', {
      ipAddress: clickData.ipAddress,
      deviceType: clickData.deviceType,
      country: clickData.country,
      city: clickData.city
    })

    // 클릭 기록 저장 (디바이스 정보 포함)
    console.log('Saving click record to database...')
    const savedClick = await prisma.urlClick.create({
      data: {
        urlId: clickData.urlId,
        ipAddress: clickData.ipAddress,
        userAgent: clickData.userAgent,
        referer: clickData.referer,
        country: clickData.country,
        city: clickData.city,
        deviceType: clickData.deviceType
      }
    })
    console.log('Click record saved with ID:', savedClick.id)

    // URL 소유자에게 실시간 알림 전송 (로그인한 사용자인 경우)
    if (shortenedUrl.userId) {
      try {
        // 알림 데이터베이스에 저장
        await prisma.notification.create({
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
