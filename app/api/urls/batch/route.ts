import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import { db } from '@/lib/database'
import { z } from 'zod'

// 일괄 작업 스키마
const batchOperationSchema = z.object({
  operation: z.enum(['update', 'addTags', 'removeTags', 'delete', 'favorite', 'unfavorite']),
  urlIds: z.array(z.string()).min(1),
  data: z.record(z.any()).optional(), // 업데이트할 데이터
  tagIds: z.array(z.string()).optional(), // 태그 ID 배열
})

async function handler(request: AuthenticatedRequest) {
  try {
    const userId = request.user!.userId

    if (request.method === 'POST') {
      const body = await request.json()
      const validation = batchOperationSchema.safeParse(body)

      if (!validation.success) {
        return NextResponse.json({ 
          error: '유효하지 않은 요청 데이터입니다.',
          details: validation.error.errors 
        }, { status: 400 })
      }

      const { operation, urlIds, data, tagIds } = validation.data

      // URL 소유권 확인
      const userUrls = await db.shortenedUrl.findMany({
        where: {
          id: { in: urlIds },
          userId
        },
        select: { id: true }
      })

      if (userUrls.length !== urlIds.length) {
        return NextResponse.json({ 
          error: '일부 URL에 대한 권한이 없습니다.' 
        }, { status: 403 })
      }

      let result: any = {}

      switch (operation) {
        case 'update':
          // URL 정보 일괄 업데이트
          if (!data) {
            return NextResponse.json({ error: '업데이트할 데이터가 필요합니다.' }, { status: 400 })
          }

          const updateData: any = {}
          if (data.title !== undefined) updateData.title = data.title
          if (data.description !== undefined) updateData.description = data.description
          if (data.expiresAt !== undefined) updateData.expiresAt = data.expiresAt
          if (data.isActive !== undefined) updateData.isActive = data.isActive

          if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: '업데이트할 데이터가 없습니다.' }, { status: 400 })
          }

          const updatedUrls = await db.shortenedUrl.updateMany({
            where: { id: { in: urlIds } },
            data: updateData
          })

          result = { updatedCount: updatedUrls.count }
          break

        case 'addTags':
          // 태그 일괄 추가
          if (!tagIds || tagIds.length === 0) {
            return NextResponse.json({ error: '추가할 태그가 필요합니다.' }, { status: 400 })
          }

          // 태그 존재 확인
          const tags = await db.tag.findMany({
            where: {
              id: { in: tagIds },
              OR: [
                { userId: userId },
                { userId: null } // 시스템 태그
              ]
            }
          })

          if (tags.length !== tagIds.length) {
            return NextResponse.json({ error: '일부 태그를 찾을 수 없습니다.' }, { status: 400 })
          }

          // 기존 태그 관계 확인 및 새로 생성
          const existingTags = await db.urlTag.findMany({
            where: {
              shortenedUrlId: { in: urlIds },
              tagId: { in: tagIds }
            }
          })

          const newUrlTags = []
          for (const urlId of urlIds) {
            for (const tagId of tagIds) {
              const exists = existingTags.some(ut => 
                ut.shortenedUrlId === urlId && ut.tagId === tagId
              )
              if (!exists) {
                newUrlTags.push({
                  shortenedUrlId: urlId,
                  tagId: tagId
                })
              }
            }
          }

          if (newUrlTags.length > 0) {
            await db.urlTag.createMany({
              data: newUrlTags
            })
          }

          result = { addedTags: newUrlTags.length }
          break

        case 'removeTags':
          // 태그 일괄 제거
          if (!tagIds || tagIds.length === 0) {
            return NextResponse.json({ error: '제거할 태그가 필요합니다.' }, { status: 400 })
          }

          const removedTags = await db.urlTag.deleteMany({
            where: {
              shortenedUrlId: { in: urlIds },
              tagId: { in: tagIds }
            }
          })

          result = { removedTags: removedTags.count }
          break

        case 'delete':
          // URL 일괄 삭제
          const deletedUrls = await db.shortenedUrl.deleteMany({
            where: { id: { in: urlIds } }
          })

          result = { deletedCount: deletedUrls.count }
          break

        case 'favorite':
          // 즐겨찾기 일괄 추가
          const existingFavorites = await db.favorite.findMany({
            where: {
              userId,
              shortenedUrlId: { in: urlIds }
            }
          })

          const newFavorites = urlIds.filter(urlId => 
            !existingFavorites.some(fav => fav.shortenedUrlId === urlId)
          )

          if (newFavorites.length > 0) {
            await db.favorite.createMany({
              data: newFavorites.map(urlId => ({
                userId,
                shortenedUrlId: urlId
              }))
            })
          }

          result = { addedFavorites: newFavorites.length }
          break

        case 'unfavorite':
          // 즐겨찾기 일괄 제거
          const removedFavorites = await db.favorite.deleteMany({
            where: {
              userId,
              shortenedUrlId: { in: urlIds }
            }
          })

          result = { removedFavorites: removedFavorites.count }
          break

        default:
          return NextResponse.json({ error: '지원하지 않는 작업입니다.' }, { status: 400 })
      }

      return NextResponse.json({
        success: true,
        message: '일괄 작업이 완료되었습니다.',
        data: result
      })

    }

    return NextResponse.json({ error: '지원하지 않는 HTTP 메서드입니다.' }, { status: 405 })
  } catch (error) {
    console.error('일괄 URL 처리 오류:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

export const POST = requireAuth(handler)
