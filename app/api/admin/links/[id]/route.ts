import { NextRequest, NextResponse } from 'next/server'
import { requireAdminHandler, AdminRequest } from '@/lib/admin-middleware'
import { db } from '@/lib/database'

async function handler(request: AdminRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (!action) {
      return NextResponse.json(
        { error: 'MISSING_ACTION', message: '액션을 지정해야 합니다.' },
        { status: 400 }
      )
    }

    // 링크 존재 확인
    const link = await db.shortenedUrl.findUnique({
      where: { id },
      select: { id: true, shortCode: true, customCode: true, originalUrl: true }
    })

    if (!link) {
      return NextResponse.json(
        { error: 'LINK_NOT_FOUND', message: '링크를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    let message = ''

    switch (action) {
      case 'block':
        // 링크 차단 (만료 시간을 과거로 설정)
        await db.shortenedUrl.update({
          where: { id },
          data: { expiresAt: new Date(0) } // 1970년 1월 1일로 설정하여 즉시 만료
        })
        message = '링크가 차단되었습니다.'
        break
        
      case 'unblock':
        // 링크 차단 해제 (만료 시간을 null로 설정)
        await db.shortenedUrl.update({
          where: { id },
          data: { expiresAt: null }
        })
        message = '링크 차단이 해제되었습니다.'
        break
        
      case 'delete':
      case '삭제':
        // 링크 삭제 (관련 데이터도 함께 삭제)
        await db.$transaction([
          // URL 클릭 기록 삭제
          db.urlClick.deleteMany({
            where: { urlId: id }
          }),
          // 링크 삭제
          db.shortenedUrl.delete({
            where: { id }
          })
        ])
        
        return NextResponse.json({
          success: true,
          message: '링크가 삭제되었습니다.'
        })
        
      default:
        return NextResponse.json(
          { error: 'INVALID_ACTION', message: '유효하지 않은 액션입니다.' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      message,
      link: {
        id: link.id,
        short: link.customCode || link.shortCode,
        original: link.originalUrl
      }
    })

  } catch (error) {
    console.error('링크 상태 변경 실패:', error)
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', message: '링크 상태 변경에 실패했습니다.' },
      { status: 500 }
    )
  }
}

export const PATCH = requireAdminHandler(handler)
export const DELETE = requireAdminHandler(handler)
