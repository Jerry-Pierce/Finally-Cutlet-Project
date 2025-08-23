"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import {
  Users,
  Link,
  Server,
  Shield,
  AlertTriangle,
  TrendingUp,
  Activity,
  Settings,
  UserCheck,
  UserX,
  Ban,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Download,
  RefreshCw,
  Crown,
  Mail,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const systemStats = [
  { name: "1월", users: 1200, links: 15000, clicks: 45000 },
  { name: "2월", users: 1350, links: 18000, clicks: 52000 },
  { name: "3월", users: 1500, links: 22000, clicks: 61000 },
  { name: "4월", users: 1680, links: 25000, clicks: 68000 },
  { name: "5월", users: 1850, links: 28000, clicks: 75000 },
  { name: "6월", users: 2100, links: 32000, clicks: 85000 },
]

const recentUsers = [
  {
    id: 1,
    name: "김철수",
    email: "kimcs@example.com",
    plan: "premium",
    status: "active",
    joined: "2024-08-15",
    links: 247,
    lastActive: "2시간 전",
  },
  {
    id: 2,
    name: "이영희",
    email: "leeyh@example.com",
    plan: "free",
    status: "active",
    joined: "2024-08-14",
    links: 12,
    lastActive: "1일 전",
  },
  {
    id: 3,
    name: "박민수",
    email: "parkms@example.com",
    plan: "premium",
    status: "suspended",
    joined: "2024-08-10",
    links: 89,
    lastActive: "3일 전",
  },
]

const reportedLinks = [
  {
    id: 1,
    short: "cutlet.ly/abc123",
    original: "https://suspicious-site.com/malware",
    reporter: "user@example.com",
    reason: "악성 소프트웨어",
    status: "pending",
    reported: "2024-08-16",
  },
  {
    id: 2,
    short: "cutlet.ly/xyz789",
    original: "https://spam-site.com/ads",
    reporter: "another@example.com",
    reason: "스팸",
    status: "resolved",
    reported: "2024-08-15",
  },
]

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  const handleUserAction = (action: string, userId: number) => {
    toast({
      title: `사용자 ${action}`,
      description: `사용자 ID ${userId}에 대한 작업이 완료되었습니다.`,
    })
  }

  const handleLinkAction = (action: string, linkId: number) => {
    toast({
      title: `링크 ${action}`,
      description: `링크 ID ${linkId}에 대한 작업이 완료되었습니다.`,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-destructive/5 to-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-32 left-20 w-44 h-44 bg-destructive/10 rounded-full blur-2xl opacity-60" />
        <div className="absolute top-64 right-28 w-36 h-36 bg-primary/10 rounded-full blur-xl opacity-60" />
        <div className="absolute bottom-32 left-1/3 w-52 h-52 bg-accent/10 rounded-full blur-3xl opacity-60" />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="font-serif font-bold text-3xl text-foreground flex items-center gap-3">
                <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center shadow-lg shadow-destructive/20">
                  <Shield className="w-5 h-5 text-destructive" />
                </div>
                관리자 대시보드
              </h1>
              <p className="text-muted-foreground">시스템 전체를 모니터링하고 관리하세요</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="bg-transparent">
                <Download className="w-4 h-4 mr-2" />
                리포트 다운로드
              </Button>
              <Button variant="outline" className="bg-transparent">
                <RefreshCw className="w-4 h-4 mr-2" />
                새로고침
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="border-border/50 shadow-lg shadow-black/5 backdrop-blur-sm bg-card/95 will-change-transform hover:scale-105 transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">총 사용자</p>
                    <p className="text-2xl font-bold text-foreground">2,847</p>
                  </div>
                  <Users className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-lg shadow-black/5 backdrop-blur-sm bg-card/95 will-change-transform hover:scale-105 transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">총 링크</p>
                    <p className="text-2xl font-bold text-foreground">45,291</p>
                  </div>
                  <Link className="w-8 h-8 text-accent" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-lg shadow-black/5 backdrop-blur-sm bg-card/95 will-change-transform hover:scale-105 transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">서버 상태</p>
                    <p className="text-2xl font-bold text-green-600">정상</p>
                  </div>
                  <Server className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-lg shadow-black/5 backdrop-blur-sm bg-card/95 will-change-transform hover:scale-105 transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">신고 대기</p>
                    <p className="text-2xl font-bold text-destructive">3</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-destructive" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-lg shadow-black/5 backdrop-blur-sm bg-card/95 will-change-transform hover:scale-105 transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">수익 (월)</p>
                    <p className="text-2xl font-bold text-foreground">₩2.1M</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-secondary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-card/50 backdrop-blur-sm border border-border/50">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Activity className="w-4 h-4 mr-2" />
                개요
              </TabsTrigger>
              <TabsTrigger
                value="users"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Users className="w-4 h-4 mr-2" />
                사용자
              </TabsTrigger>
              <TabsTrigger
                value="links"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Link className="w-4 h-4 mr-2" />
                링크
              </TabsTrigger>
              <TabsTrigger
                value="reports"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                신고
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Settings className="w-4 h-4 mr-2" />
                설정
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="border-border/50 shadow-lg shadow-black/5 backdrop-blur-sm bg-card/95">
                  <CardHeader>
                    <CardTitle className="font-serif">월별 성장 추이</CardTitle>
                    <CardDescription>사용자, 링크, 클릭 수 변화</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={systemStats}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="users"
                          stackId="1"
                          stroke="hsl(var(--primary))"
                          fill="hsl(var(--primary))"
                          fillOpacity={0.3}
                        />
                        <Area
                          type="monotone"
                          dataKey="links"
                          stackId="2"
                          stroke="hsl(var(--accent))"
                          fill="hsl(var(--accent))"
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-border/50 shadow-lg shadow-black/5 backdrop-blur-sm bg-card/95">
                  <CardHeader>
                    <CardTitle className="font-serif">시스템 상태</CardTitle>
                    <CardDescription>실시간 서버 모니터링</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                        <span className="font-medium">API 서버</span>
                      </div>
                      <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                        정상
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                        <span className="font-medium">데이터베이스</span>
                      </div>
                      <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                        정상
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
                        <span className="font-medium">캐시 서버</span>
                      </div>
                      <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                        주의
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-foreground">99.9%</p>
                        <p className="text-sm text-muted-foreground">가동률</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-foreground">45ms</p>
                        <p className="text-sm text-muted-foreground">평균 응답시간</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <Card className="border-border/50 shadow-lg shadow-black/5 backdrop-blur-sm bg-card/95">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="font-serif">사용자 관리</CardTitle>
                      <CardDescription>등록된 사용자들을 관리하세요</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="사용자 검색..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 w-64 shadow-inner shadow-black/5"
                        />
                      </div>
                      <Button variant="outline" size="sm" className="bg-transparent">
                        <Filter className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>사용자</TableHead>
                        <TableHead>플랜</TableHead>
                        <TableHead>상태</TableHead>
                        <TableHead>링크 수</TableHead>
                        <TableHead>가입일</TableHead>
                        <TableHead>마지막 활동</TableHead>
                        <TableHead className="text-right">작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentUsers.map((user) => (
                        <TableRow key={user.id} className="hover:bg-muted/50 transition-colors">
                          <TableCell>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={user.plan === "premium" ? "default" : "secondary"}
                              className={
                                user.plan === "premium"
                                  ? "bg-accent/10 text-accent border-accent/20"
                                  : "bg-muted text-muted-foreground"
                              }
                            >
                              {user.plan === "premium" && <Crown className="w-3 h-3 mr-1" />}
                              {user.plan === "premium" ? "프리미엄" : "무료"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={user.status === "active" ? "default" : "destructive"}
                              className={
                                user.status === "active"
                                  ? "bg-green-500/10 text-green-600 border-green-500/20"
                                  : "bg-destructive/10 text-destructive border-destructive/20"
                              }
                            >
                              {user.status === "active" ? (
                                <CheckCircle className="w-3 h-3 mr-1" />
                              ) : (
                                <XCircle className="w-3 h-3 mr-1" />
                              )}
                              {user.status === "active" ? "활성" : "정지"}
                            </Badge>
                          </TableCell>
                          <TableCell>{user.links}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{user.joined}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{user.lastActive}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUserAction("이메일 발송", user.id)}
                                className="will-change-transform hover:scale-110"
                              >
                                <Mail className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUserAction(user.status === "active" ? "정지" : "활성화", user.id)}
                                className="will-change-transform hover:scale-110"
                              >
                                {user.status === "active" ? (
                                  <UserX className="w-4 h-4" />
                                ) : (
                                  <UserCheck className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <Card className="border-border/50 shadow-lg shadow-black/5 backdrop-blur-sm bg-card/95">
                <CardHeader>
                  <CardTitle className="font-serif">신고된 링크</CardTitle>
                  <CardDescription>사용자가 신고한 링크들을 검토하고 처리하세요</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>단축 URL</TableHead>
                        <TableHead>원본 URL</TableHead>
                        <TableHead>신고자</TableHead>
                        <TableHead>신고 사유</TableHead>
                        <TableHead>상태</TableHead>
                        <TableHead>신고일</TableHead>
                        <TableHead className="text-right">작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportedLinks.map((link) => (
                        <TableRow key={link.id} className="hover:bg-muted/50 transition-colors">
                          <TableCell>
                            <code className="text-sm bg-muted px-2 py-1 rounded">{link.short}</code>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <span className="truncate block" title={link.original}>
                              {link.original}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm">{link.reporter}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {link.reason}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={link.status === "pending" ? "destructive" : "default"}
                              className={
                                link.status === "pending"
                                  ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                                  : "bg-green-500/10 text-green-600 border-green-500/20"
                              }
                            >
                              {link.status === "pending" ? "대기중" : "처리완료"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{link.reported}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleLinkAction("승인", link.id)}
                                className="will-change-transform hover:scale-110"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleLinkAction("차단", link.id)}
                                className="will-change-transform hover:scale-110"
                              >
                                <Ban className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="border-border/50 shadow-lg shadow-black/5 backdrop-blur-sm bg-card/95">
                  <CardHeader>
                    <CardTitle className="font-serif">시스템 설정</CardTitle>
                    <CardDescription>전체 시스템 동작을 제어합니다</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="maintenance">유지보수 모드</Label>
                        <p className="text-sm text-muted-foreground">시스템을 일시적으로 중단합니다</p>
                      </div>
                      <Switch id="maintenance" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="registration">신규 가입 허용</Label>
                        <p className="text-sm text-muted-foreground">새로운 사용자 등록을 허용합니다</p>
                      </div>
                      <Switch id="registration" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="analytics">분석 데이터 수집</Label>
                        <p className="text-sm text-muted-foreground">사용자 행동 분석을 위한 데이터를 수집합니다</p>
                      </div>
                      <Switch id="analytics" defaultChecked />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rate-limit">API 요청 제한 (분당)</Label>
                      <Input id="rate-limit" type="number" defaultValue="100" className="shadow-inner shadow-black/5" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 shadow-lg shadow-black/5 backdrop-blur-sm bg-card/95">
                  <CardHeader>
                    <CardTitle className="font-serif">보안 설정</CardTitle>
                    <CardDescription>시스템 보안을 강화합니다</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="2fa-required">2단계 인증 필수</Label>
                        <p className="text-sm text-muted-foreground">모든 사용자에게 2FA를 요구합니다</p>
                      </div>
                      <Switch id="2fa-required" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="auto-scan">자동 링크 스캔</Label>
                        <p className="text-sm text-muted-foreground">악성 링크를 자동으로 감지합니다</p>
                      </div>
                      <Switch id="auto-scan" defaultChecked />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="session-timeout">세션 만료 시간 (분)</Label>
                      <Input
                        id="session-timeout"
                        type="number"
                        defaultValue="60"
                        className="shadow-inner shadow-black/5"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="backup-frequency">백업 주기</Label>
                      <Select defaultValue="daily">
                        <SelectTrigger className="shadow-inner shadow-black/5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">매시간</SelectItem>
                          <SelectItem value="daily">매일</SelectItem>
                          <SelectItem value="weekly">매주</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
