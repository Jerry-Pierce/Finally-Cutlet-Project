import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import { readFile, stat } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

async function handler(
  request: AuthenticatedRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const user = request.user!
    
    // 관리자 권한 확인
    if (!user.isAdmin) {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    const { filename } = params
    
    if (!filename) {
      return NextResponse.json(
        { error: '파일명이 필요합니다.' },
        { status: 400 }
      )
    }

    // 파일 경로 보안 검사
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json(
        { error: '잘못된 파일명입니다.' },
        { status: 400 }
      )
    }

    const backupDir = join(process.cwd(), 'backups')
    const filePath = join(backupDir, filename)
    
    // 파일 존재 확인
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: '파일을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 파일 정보 가져오기
    const fileStats = await stat(filePath)
    
    // 파일 크기 제한 (100MB)
    const maxSize = 100 * 1024 * 1024
    if (fileStats.size > maxSize) {
      return NextResponse.json(
        { error: '파일이 너무 큽니다.' },
        { status: 413 }
      )
    }

    // 파일 읽기
    const fileContent = await readFile(filePath)
    
    // 파일 타입에 따른 Content-Type 설정
    let contentType = 'application/json'
    if (filename.endsWith('.sql')) {
      contentType = 'application/sql'
    } else if (filename.endsWith('.zip')) {
      contentType = 'application/zip'
    }

    // 응답 헤더 설정
    const headers = {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': fileStats.size.toString(),
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }

    return new NextResponse(fileContent, {
      status: 200,
      headers
    })

  } catch (error) {
    console.error('백업 다운로드 오류:', error)
    
    return NextResponse.json(
      { error: '파일 다운로드 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export const GET = requireAuth(handler)
