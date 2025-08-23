import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import { db } from '@/lib/database'
import { z } from 'zod'

// 태그 생성/수정 스키마
const tagSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  description: z.string().max(200).optional()
})

async function handler(request: AuthenticatedRequest) {
  try {
    const userId = request.user!.userId

    if (request.method === 'GET') {
      // 사용자의 모든 태그 조회
      const tags = await db.tag.findMany({
        where: {
          urlTags: {
            some: {
              shortenedUrl: {
                userId
              }
            }
          }
        },
        include: {
          _count: {
            select: {
              urlTags: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      })

      // 사용자가 생성한 커스텀 태그도 포함
      const customTags = await db.tag.findMany({
        where: {
          userId: userId
        },
        include: {
          _count: {
            select: {
              urlTags: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      })

      // 중복 제거 및 병합
      const allTags = [...tags, ...customTags]
      const uniqueTags = allTags.filter((tag, index, self) => 
        index === self.findIndex(t => t.id === tag.id)
      )

      return NextResponse.json({ success: true, data: uniqueTags })
    }

    if (request.method === 'POST') {
      // 새 태그 생성
      const body = await request.json()
      const validation = tagSchema.safeParse(body)

      if (!validation.success) {
        return NextResponse.json({ 
          error: '유효하지 않은 태그 데이터입니다.',
          details: validation.error.errors 
        }, { status: 400 })
      }

      const { name, color, description } = validation.data

      // 태그명 중복 확인 (사용자별)
      const existingTag = await db.tag.findFirst({
        where: {
          OR: [
            { name: name.toLowerCase(), userId: userId },
            { name: name.toLowerCase(), userId: null } // 시스템 태그
          ]
        }
      })

      if (existingTag) {
        return NextResponse.json({ error: '이미 존재하는 태그명입니다.' }, { status: 400 })
      }

      const newTag = await db.tag.create({
        data: {
          name: name.toLowerCase(),
          color: color || '#3b82f6', // 기본 파란색
          description: description || '',
          userId: userId
        }
      })

      return NextResponse.json({
        success: true,
        message: '태그가 성공적으로 생성되었습니다.',
        data: newTag
      }, { status: 201 })
    }

    if (request.method === 'PUT') {
      // 태그 일괄 업데이트
      const body = await request.json()
      const { tags } = body

      if (!Array.isArray(tags)) {
        return NextResponse.json({ error: '태그 배열이 필요합니다.' }, { status: 400 })
      }

      const updatedTags = []
      const errors = []

      for (const tagData of tags) {
        try {
          const validation = tagSchema.safeParse(tagData)
          if (!validation.success) {
            errors.push({ tag: tagData.name, error: '유효하지 않은 데이터' })
            continue
          }

          const { name, color, description } = validation.data

          // 태그 소유권 확인
          const existingTag = await db.tag.findFirst({
            where: {
              id: tagData.id,
              OR: [
                { userId: userId },
                { userId: null } // 시스템 태그는 수정 불가
              ]
            }
          })

          if (!existingTag) {
            errors.push({ tag: tagData.name, error: '태그를 찾을 수 없거나 수정 권한이 없습니다.' })
            continue
          }

          if (existingTag.userId === null) {
            errors.push({ tag: tagData.name, error: '시스템 태그는 수정할 수 없습니다.' })
            continue
          }

          // 태그명 중복 확인
          const duplicateTag = await db.tag.findFirst({
            where: {
              name: name.toLowerCase(),
              userId: userId,
              NOT: { id: tagData.id }
            }
          })

          if (duplicateTag) {
            errors.push({ tag: tagData.name, error: '이미 존재하는 태그명입니다.' })
            continue
          }

          const updatedTag = await db.tag.update({
            where: { id: tagData.id },
            data: {
              name: name.toLowerCase(),
              color: color || existingTag.color,
              description: description || existingTag.description
            }
          })

          updatedTags.push(updatedTag)
        } catch (error) {
          errors.push({ tag: tagData.name, error: '업데이트 실패' })
        }
      }

      return NextResponse.json({
        success: true,
        message: `${updatedTags.length}개 태그가 업데이트되었습니다.`,
        data: { updatedTags, errors }
      })
    }

    if (request.method === 'DELETE') {
      // 태그 삭제
      const { searchParams } = new URL(request.url)
      const tagId = searchParams.get('id')

      if (!tagId) {
        return NextResponse.json({ error: '태그 ID가 필요합니다.' }, { status: 400 })
      }

      // 태그 소유권 확인
      const tag = await db.tag.findFirst({
        where: {
          id: tagId,
          OR: [
            { userId: userId },
            { userId: null } // 시스템 태그는 삭제 불가
          ]
        }
      })

      if (!tag) {
        return NextResponse.json({ error: '태그를 찾을 수 없거나 삭제 권한이 없습니다.' }, { status: 404 })
      }

      if (tag.userId === null) {
        return NextResponse.json({ error: '시스템 태그는 삭제할 수 없습니다.' }, { status: 403 })
      }

      // 태그를 사용하는 URL이 있는지 확인
      const urlCount = await db.urlTag.count({
        where: { tagId }
      })

      if (urlCount > 0) {
        return NextResponse.json({ 
          error: `이 태그를 사용하는 URL이 ${urlCount}개 있습니다. 먼저 URL에서 태그를 제거해주세요.` 
        }, { status: 400 })
      }

      await db.tag.delete({
        where: { id: tagId }
      })

      return NextResponse.json({
        success: true,
        message: '태그가 성공적으로 삭제되었습니다.'
      })
    }

    return NextResponse.json({ error: '지원하지 않는 HTTP 메서드입니다.' }, { status: 405 })
  } catch (error) {
    console.error('태그 처리 오류:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

export const GET = requireAuth(handler)
export const POST = requireAuth(handler)
export const PUT = requireAuth(handler)
export const DELETE = requireAuth(handler)
