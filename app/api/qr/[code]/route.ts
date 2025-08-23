import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params

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

    // QR 코드 생성을 위한 URL
    const qrUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/${code}`
    
    // QR 코드 생성 서비스 (Google Charts API 사용)
    const googleQrUrl = `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${encodeURIComponent(qrUrl)}&choe=UTF-8`

    // QR 코드 이미지 리다이렉트
    return NextResponse.redirect(googleQrUrl)

  } catch (error) {
    console.error('QR 코드 생성 오류:', error)
    
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
