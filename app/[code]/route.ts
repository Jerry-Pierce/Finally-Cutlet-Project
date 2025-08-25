import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params

    if (!code) {
      return NextResponse.redirect(new URL('/', request.url))
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
      return NextResponse.redirect(new URL('/', request.url))
    }

    // 만료 확인
    if (shortenedUrl.expiresAt && new Date() > shortenedUrl.expiresAt) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // 원본 URL로 리다이렉트
    return NextResponse.redirect(shortenedUrl.originalUrl)

  } catch (error) {
    console.error('리다이렉트 오류:', error)
    return NextResponse.redirect(new URL('/', request.url))
  }
}
