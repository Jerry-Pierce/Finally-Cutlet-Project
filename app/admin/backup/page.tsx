"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Download, 
  Database, 
  Users, 
  Link, 
  BarChart3, 
  Clock, 
  FileText,
  Trash2,
  RefreshCw,
  AlertCircle
} from "lucide-react"

interface BackupMetadata {
  timestamp: string
  type: string
  filename: string
  size: number
  recordCount: Record<string, number>
  createdBy: string
}

interface BackupInfo {
  filename: string
  metadata: BackupMetadata
  backupPath: string
  downloadUrl: string
}

export default function BackupPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [backups, setBackups] = useState<BackupInfo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreatingBackup, setIsCreatingBackup] = useState(false)
  const [selectedType, setSelectedType] = useState<'full' | 'users' | 'urls' | 'analytics'>('full')

  // 백업 목록 로드
  const loadBackups = async () => {
    setIsLoading(true)
    try {
      // 실제로는 백업 목록을 가져오는 API 호출
      // 여기서는 예시 데이터 사용
      const mockBackups: BackupInfo[] = [
        {
          filename: 'full-backup-2024-01-15T10-30-00-000Z.json',
          metadata: {
            timestamp: '2024-01-15T10:30:00.000Z',
            type: 'full',
            filename: 'full-backup-2024-01-15T10-30-00-000Z.json',
            size: 1024000,
            recordCount: {
              users: 150,
              shortenedUrls: 2500,
              urlClicks: 15000,
              tags: 200
            },
            createdBy: 'admin'
          },
          backupPath: '/backups/full-backup-2024-01-15T10-30-00-000Z.json',
          downloadUrl: '/api/admin/backup/download/full-backup-2024-01-15T10-30-00-000Z.json'
        }
      ]
      setBackups(mockBackups)
    } catch (error) {
      console.error('백업 목록 로드 오류:', error)
      toast({
        title: "오류 발생",
        description: "백업 목록을 불러오는데 실패했습니다.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 백업 생성
  const createBackup = async () => {
    setIsCreatingBackup(true)
    try {
      const response = await fetch(`/api/admin/backup?type=${selectedType}`, {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "백업 완료",
          description: "백업이 성공적으로 생성되었습니다.",
        })
        
        // 백업 목록 새로고침
        loadBackups()
      } else {
        const error = await response.json()
        toast({
          title: "백업 실패",
          description: error.error || "백업 생성에 실패했습니다.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('백업 생성 오류:', error)
      toast({
        title: "백업 실패",
        description: "백업 생성 중 오류가 발생했습니다.",
        variant: "destructive"
      })
    } finally {
      setIsCreatingBackup(false)
    }
  }

  // 백업 다운로드
  const downloadBackup = async (downloadUrl: string, filename: string) => {
    try {
      const response = await fetch(downloadUrl, {
        credentials: 'include'
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        toast({
          title: "다운로드 완료",
          description: "백업 파일이 다운로드되었습니다.",
        })
      } else {
        toast({
          title: "다운로드 실패",
          description: "백업 파일 다운로드에 실패했습니다.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('백업 다운로드 오류:', error)
      toast({
        title: "다운로드 실패",
        description: "백업 파일 다운로드 중 오류가 발생했습니다.",
        variant: "destructive"
      })
    }
  }

  // 백업 삭제
  const deleteBackup = async (filename: string) => {
    if (!confirm(`정말로 "${filename}" 백업을 삭제하시겠습니까?`)) {
      return
    }

    try {
      // 실제로는 백업 삭제 API 호출
      setBackups(prev => prev.filter(b => b.filename !== filename))
      toast({
        title: "삭제 완료",
        description: "백업이 삭제되었습니다.",
      })
    } catch (error) {
      console.error('백업 삭제 오류:', error)
      toast({
        title: "삭제 실패",
        description: "백업 삭제에 실패했습니다.",
        variant: "destructive"
      })
    }
  }

  // 파일 크기 포맷팅
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // 백업 타입별 아이콘
  const getBackupTypeIcon = (type: string) => {
    switch (type) {
      case 'full':
        return <Database className="w-5 h-5" />
      case 'users':
        return <Users className="w-5 h-5" />
      case 'urls':
        return <Link className="w-5 h-5" />
      case 'analytics':
        return <BarChart3 className="w-5 h-5" />
      default:
        return <FileText className="w-5 h-5" />
    }
  }

  // 백업 타입별 색상
  const getBackupTypeColor = (type: string) => {
    switch (type) {
      case 'full':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'users':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'urls':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
      case 'analytics':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  useEffect(() => {
    if (user?.isAdmin) {
      loadBackups()
    }
  }, [user])

  // 관리자 권한 확인
  if (!user?.isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">접근 권한이 없습니다</h1>
            <p className="text-muted-foreground">
              이 페이지에 접근하려면 관리자 권한이 필요합니다.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 페이지 헤더 */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold">백업 관리</h1>
          <p className="text-muted-foreground">
            데이터베이스 백업을 생성하고 관리할 수 있습니다.
          </p>
        </div>

        {/* 백업 생성 섹션 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              새 백업 생성
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">백업 타입</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as any)}
                  className="w-full p-2 border border-border rounded-md bg-background"
                >
                  <option value="full">전체 데이터</option>
                  <option value="users">사용자 데이터</option>
                  <option value="urls">URL 데이터</option>
                  <option value="analytics">분석 데이터</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={createBackup}
                  disabled={isCreatingBackup}
                  className="flex items-center gap-2"
                >
                  {isCreatingBackup ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Database className="w-4 h-4" />
                  )}
                  {isCreatingBackup ? '백업 생성 중...' : '백업 생성'}
                </Button>
              </div>
            </div>

            {/* 백업 타입 설명 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <strong>전체 데이터:</strong> 모든 테이블의 데이터를 포함한 완전한 백업
              </div>
              <div>
                <strong>사용자 데이터:</strong> 사용자 계정 정보 (비밀번호 제외)
              </div>
              <div>
                <strong>URL 데이터:</strong> 단축 URL 및 태그 정보
              </div>
              <div>
                <strong>분석 데이터:</strong> 클릭 통계 및 알림 데이터
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 백업 목록 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                백업 목록
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={loadBackups}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                새로고침
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p className="text-muted-foreground">백업 목록을 불러오는 중...</p>
              </div>
            ) : backups.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">아직 생성된 백업이 없습니다</p>
              </div>
            ) : (
              <div className="space-y-4">
                {backups.map((backup) => (
                  <div
                    key={backup.filename}
                    className="p-4 border border-border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        {/* 백업 헤더 */}
                        <div className="flex items-center gap-3">
                          {getBackupTypeIcon(backup.metadata.type)}
                          <div>
                            <h3 className="font-semibold">{backup.filename}</h3>
                            <Badge className={getBackupTypeColor(backup.metadata.type)}>
                              {backup.metadata.type === 'full' ? '전체' :
                               backup.metadata.type === 'users' ? '사용자' :
                               backup.metadata.type === 'urls' ? 'URL' : '분석'}
                            </Badge>
                          </div>
                        </div>

                        {/* 백업 정보 */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">생성 시간:</span>
                            <br />
                            <span className="font-medium">
                              {new Date(backup.metadata.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">파일 크기:</span>
                            <br />
                            <span className="font-medium">
                              {formatFileSize(backup.metadata.size)}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">레코드 수:</span>
                            <br />
                            <span className="font-medium">
                              {Object.values(backup.metadata.recordCount).reduce((a, b) => a + b, 0)}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">생성자:</span>
                            <br />
                            <span className="font-medium">{backup.metadata.createdBy}</span>
                          </div>
                        </div>

                        {/* 레코드 상세 정보 */}
                        <div className="space-y-2">
                          <span className="text-sm text-muted-foreground">데이터 구성:</span>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(backup.metadata.recordCount).map(([key, count]) => (
                              <Badge key={key} variant="secondary" className="text-xs">
                                {key}: {count}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* 액션 버튼 */}
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadBackup(backup.downloadUrl, backup.filename)}
                          className="flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          다운로드
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteBackup(backup.filename)}
                          className="flex items-center gap-2 text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                          삭제
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
