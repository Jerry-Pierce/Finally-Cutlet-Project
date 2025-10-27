import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import { db } from '@/lib/database'

// URL 삭제
async function DELETEHandler(request: AuthenticatedRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const userId = request.user!.userId

    // URL이 사용자 소유인지 확인
    const url = await db.shortenedUrl.findFirst({
      where: {
        id: id,
        userId: userId
      }
    })

    if (!url) {
      return NextResponse.json(
        { error: 'URL을 찾을 수 없거나 삭제 권한이 없습니다.' },
        { status: 404 }
      )
    }

    // URL 삭제 (관련된 태그와 클릭 기록도 자동 삭제됨)
    await db.shortenedUrl.delete({
      where: { id: id }
    })

    return NextResponse.json({
      success: true,
      message: 'URL이 성공적으로 삭제되었습니다.'
    })

  } catch (error) {
    console.error('URL 삭제 오류:', error)
    
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// URL 정보 업데이트
async function PATCHHandler(request: AuthenticatedRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const userId = request.user!.userId
    const body = await request.json()

    // URL이 사용자 소유인지 확인
    const existingUrl = await db.shortenedUrl.findFirst({
      where: {
        id: id,
        userId: userId
      }
    })

    if (!existingUrl) {
      return NextResponse.json(
        { error: 'URL을 찾을 수 없거나 수정 권한이 없습니다.' },
        { status: 404 }
      )
    }

    // 업데이트 가능한 필드들
    const updateData: any = {}
    
    if (body.title !== undefined) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description
    if (body.isFavorite !== undefined) updateData.isFavorite = body.isFavorite
    if (body.expiresAt !== undefined) updateData.expiresAt = body.expiresAt

    // URL 업데이트
    const updatedUrl = await db.shortenedUrl.update({
      where: { id: id },
      data: updateData,
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'URL이 성공적으로 업데이트되었습니다.',
      data: {
        id: updatedUrl.id,
        originalUrl: updatedUrl.originalUrl,
        shortUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/${updatedUrl.shortCode}`,
        shortCode: updatedUrl.shortCode,
        customCode: updatedUrl.customCode,
        title: updatedUrl.title,
        description: updatedUrl.description,
        isFavorite: updatedUrl.isFavorite,
        expiresAt: updatedUrl.expiresAt,
        createdAt: updatedUrl.createdAt,
        tags: updatedUrl.tags.map(urlTag => ({
          id: urlTag.tag.id,
          name: urlTag.tag.name,
          color: urlTag.tag.color
        }))
      }
    })

  } catch (error) {
    console.error('URL 업데이트 오류:', error)
    
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export const DELETE = requireAuth(DELETEHandler)
export const PATCH = requireAuth(PATCHHandler)
