import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import QRCode from 'qrcode'

const prisma = new PrismaClient()

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
    const shortenedUrl = await prisma.shortenedUrl.findFirst({
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
    const qrUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/${code}`
    
    // QR 코드 생성 (qrcode 라이브러리 사용)
    const qrCodeDataUrl = await QRCode.toDataURL(qrUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
    
    // Data URL을 이미지로 변환하여 응답
    const base64Data = qrCodeDataUrl.split(',')[1]
    const buffer = Buffer.from(base64Data, 'base64')
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    })

  } catch (error) {
    console.error('QR 코드 생성 오류:', error)
    
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
