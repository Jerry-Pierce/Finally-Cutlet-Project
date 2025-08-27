"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Search, Filter, MoreHorizontal, UserCheck, UserX, Crown, Trash2 } from "lucide-react"

interface User {
  id: string
  email: string
  username?: string
  isPremium: boolean
  createdAt: string
  lastLogin?: string
  status: 'active' | 'suspended' | 'pending'
  urlCount: number
  clickCount: number
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [premiumFilter, setPremiumFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const { toast } = useToast()

  // 사용자 목록 조회
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : '',
        premium: premiumFilter !== 'all' ? premiumFilter : ''
      })

      const response = await fetch(`/api/admin/users?${params}`)
      if (!response.ok) throw new Error('사용자 목록 조회 실패')
      
      const data = await response.json()
      setUsers(data.users)
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages
      }))
    } catch (error) {
      console.error('사용자 목록 조회 오류:', error)
      toast({
        title: "오류",
        description: "사용자 목록을 불러오는데 실패했습니다.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // 사용자 상태 변경
  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateStatus', status: newStatus })
      })

      if (!response.ok) throw new Error('상태 변경 실패')
      
      toast({
        title: "성공",
        description: "사용자 상태가 변경되었습니다."
      })
      
      fetchUsers() // 목록 새로고침
    } catch (error) {
      console.error('상태 변경 오류:', error)
      toast({
        title: "오류",
        description: "사용자 상태 변경에 실패했습니다.",
        variant: "destructive"
      })
    }
  }

  // 사용자 삭제
  const handleDeleteUser = async () => {
    if (!selectedUser) return
    
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('사용자 삭제 실패')
      
      toast({
        title: "성공",
        description: "사용자가 삭제되었습니다."
      })
      
      setIsDeleteDialogOpen(false)
      setSelectedUser(null)
      fetchUsers() // 목록 새로고침
    } catch (error) {
      console.error('사용자 삭제 오류:', error)
      toast({
        title: "오류",
        description: "사용자 삭제에 실패했습니다.",
        variant: "destructive"
      })
    }
  }

  // 검색 및 필터 적용
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchUsers()
  }

  // 페이지 변경
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  // 초기 로딩
  useEffect(() => {
    fetchUsers()
  }, [pagination.page])

  // 검색어나 필터 변경 시 자동 검색
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pagination.page === 1) {
        fetchUsers()
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm, statusFilter, premiumFilter])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">활성</Badge>
      case 'suspended':
        return <Badge variant="destructive">정지</Badge>
      case 'pending':
        return <Badge variant="secondary">대기</Badge>
      default:
        return <Badge variant="outline">알 수 없음</Badge>
    }
  }

  const getPremiumBadge = (isPremium: boolean) => {
    return isPremium ? (
      <Badge variant="default" className="bg-yellow-100 text-yellow-800">
        <Crown className="w-3 h-3 mr-1" />
        프리미엄
      </Badge>
    ) : (
      <Badge variant="outline">무료</Badge>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold">사용자 관리</h1>
          <p className="text-muted-foreground">
            시스템 사용자들을 관리할 수 있습니다.
          </p>
        </div>
        
        {/* 검색 및 필터 */}
        <Card>
          <CardHeader>
            <CardTitle>사용자 검색</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="이메일 또는 사용자명으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="상태별 필터" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 상태</SelectItem>
                  <SelectItem value="active">활성</SelectItem>
                  <SelectItem value="suspended">정지</SelectItem>
                  <SelectItem value="pending">대기</SelectItem>
                </SelectContent>
              </Select>
              <Select value={premiumFilter} onValueChange={setPremiumFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="구독별 필터" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 구독</SelectItem>
                  <SelectItem value="premium">프리미엄</SelectItem>
                  <SelectItem value="free">무료</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch} className="w-full sm:w-auto">
                <Search className="w-4 h-4 mr-2" />
                검색
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 사용자 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>사용자 목록</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-muted-foreground">사용자 목록을 불러오는 중...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">검색 결과가 없습니다.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>사용자</TableHead>
                        <TableHead>구독</TableHead>
                        <TableHead>상태</TableHead>
                        <TableHead>URL 수</TableHead>
                        <TableHead>클릭 수</TableHead>
                        <TableHead>가입일</TableHead>
                        <TableHead>마지막 로그인</TableHead>
                        <TableHead>작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{user.email}</div>
                              {user.username && (
                                <div className="text-sm text-muted-foreground">@{user.username}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getPremiumBadge(user.isPremium)}</TableCell>
                          <TableCell>{getStatusBadge(user.status)}</TableCell>
                          <TableCell>{user.urlCount}</TableCell>
                          <TableCell>{user.clickCount}</TableCell>
                          <TableCell>
                            {new Date(user.createdAt).toLocaleString('ko-KR', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </TableCell>
                          <TableCell>
                            {user.lastLogin 
                              ? new Date(user.lastLogin).toLocaleString('ko-KR', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : '로그인 기록 없음'
                            }
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Select
                                value={user.status}
                                onValueChange={(value) => handleStatusChange(user.id, value)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="active">활성</SelectItem>
                                  <SelectItem value="suspended">정지</SelectItem>
                                  <SelectItem value="pending">대기</SelectItem>
                                </SelectContent>
                              </Select>
                              
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedUser(user)}
                                  >
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>사용자 상세 정보</DialogTitle>
                                    <DialogDescription>
                                      사용자 정보를 확인하고 관리할 수 있습니다.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label>이메일</Label>
                                      <p className="text-sm text-muted-foreground">{user.email}</p>
                                    </div>
                                    <div>
                                      <Label>사용자명</Label>
                                      <p className="text-sm text-muted-foreground">
                                        {user.username || '설정되지 않음'}
                                      </p>
                                    </div>
                                    <div>
                                      <Label>구독 상태</Label>
                                      <div className="mt-1">{getPremiumBadge(user.isPremium)}</div>
                                    </div>
                                    <div>
                                      <Label>계정 상태</Label>
                                      <div className="mt-1">{getStatusBadge(user.status)}</div>
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button
                                      variant="destructive"
                                      onClick={() => {
                                        setSelectedUser(user)
                                        setIsDeleteDialogOpen(true)
                                      }}
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      사용자 삭제
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* 페이지네이션 */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      총 {pagination.total}명의 사용자
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                      >
                        이전
                      </Button>
                      <span className="text-sm">
                        {pagination.page} / {pagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page >= pagination.totalPages}
                      >
                        다음
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 사용자 삭제 확인 다이얼로그 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>사용자 삭제 확인</DialogTitle>
            <DialogDescription>
              정말로 <strong>{selectedUser?.email}</strong> 사용자를 삭제하시겠습니까?
              이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
