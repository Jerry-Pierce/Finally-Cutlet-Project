import { NextRequest, NextResponse } from 'next/server'
import { requireAdminHandler, AdminRequest } from '@/lib/admin-middleware'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

async function handler(request: AdminRequest, { params }: { params: Promise<{ filename: string }> }) {
  try {
    const { filename } = await params
    
    // 백업 파일 경로
    const backupDir = join(process.cwd(), 'backups')
    const backupPath = join(backupDir, filename)
    
    // 파일 존재 확인
    if (!existsSync(backupPath)) {
      return NextResponse.json(
        { error: 'BACKUP_NOT_FOUND', message: '백업 파일을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }
    
    // 파일 읽기
    const fileContent = await readFile(backupPath, 'utf-8')
    
    // 파일 다운로드 응답 생성
    const response = new NextResponse(fileContent, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': Buffer.byteLength(fileContent, 'utf-8').toString()
      }
    })
    
    return response
    
  } catch (error) {
    console.error('백업 다운로드 실패:', error)
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', message: '백업 다운로드에 실패했습니다.' },
      { status: 500 }
    )
  }
}

export const GET = requireAdminHandler(handler)
