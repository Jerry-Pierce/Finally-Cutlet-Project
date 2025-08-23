"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Search, 
  Filter, 
  Plus, 
  ExternalLink, 
  Copy, 
  Edit, 
  Trash2, 
  Heart, 
  Crown,
  Calendar,
  BarChart3,
  Tag,
  Eye,
  Globe
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { GeoChart } from "@/components/ui/geo-chart"

interface UrlData {
  id: string
  originalUrl: string
  shortUrl: string
  shortCode: string
  customCode: string | null
  title: string | null
  description: string | null
  isFavorite: boolean
  isPremiumFavorite: boolean
  expiresAt: string | null
  createdAt: string
  clickCount: number
  tags: Array<{
    id: string
    name: string
    color: string
  }>
}

interface PaginationData {
  page: number
  limit: number
  totalCount: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { t } = useLanguage()
  const { toast } = useToast()
  const router = useRouter()
  
  const [urls, setUrls] = useState<UrlData[]>([])
  const [pagination, setPagination] = useState<PaginationData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTag, setSelectedTag] = useState("")
  const [showFavorites, setShowFavorites] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState<'urls' | 'analytics' | 'geo'>('urls')
  const [geoData, setGeoData] = useState<any>(null)
  const [isLoadingGeo, setIsLoadingGeo] = useState(false)

  // 인증 확인
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  // URL 목록 로드
  const loadUrls = async (page = 1) => {
    if (!user) return

    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      })

      if (searchTerm) params.append('search', searchTerm)
      if (selectedTag) params.append('tag', selectedTag)
      if (showFavorites) params.append('favorite', 'true')

      const response = await fetch(`/api/urls?${params}`, {
        credentials: 'include'
      })

      if (response.ok) {
        const result = await response.json()
        setUrls(result.data.urls)
        setPagination(result.data.pagination)
        setCurrentPage(page)
      } else {
        toast({
          title: "오류 발생",
          description: t("urlListLoadFailed"),
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('URL 목록 로드 오류:', error)
      toast({
        title: "오류 발생",
        description: "네트워크 오류가 발생했습니다.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // URL 삭제
  const handleDeleteUrl = async (urlId: string) => {
    if (!confirm(t("confirmDelete"))) return

    try {
      const response = await fetch(`/api/urls/${urlId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        toast({
          title: "삭제 완료",
          description: t("urlDeleted")
        })
        loadUrls(currentPage)
      } else {
        toast({
          title: "삭제 실패",
          description: t("urlDeleteFailed"),
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('URL 삭제 오류:', error)
      toast({
        title: "오류 발생",
        description: "네트워크 오류가 발생했습니다.",
        variant: "destructive"
      })
    }
  }

  // URL 복사
  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      toast({
        title: "복사 완료",
        description: t("urlCopied")
      })
    } catch (error) {
      toast({
        title: "복사 실패",
        description: t("urlCopyFailed"),
        variant: "destructive"
      })
    }
  }

  // 검색 및 필터 적용
  useEffect(() => {
    if (user) {
      loadUrls(1)
    }
  }, [user, searchTerm, selectedTag, showFavorites])

  // 지리적 데이터 로드
  const loadGeoData = async () => {
    if (!user) return

    setIsLoadingGeo(true)
    try {
      const response = await fetch('/api/analytics/geo', {
        credentials: 'include'
      })

      if (response.ok) {
        const result = await response.json()
        setGeoData(result.data)
      }
    } catch (error) {
      console.error('지리적 데이터 로드 오류:', error)
    } finally {
      setIsLoadingGeo(false)
    }
  }

  // 탭 변경 시 데이터 로드
  useEffect(() => {
    if (user && activeTab === 'geo' && !geoData) {
      loadGeoData()
    }
  }, [user, activeTab, geoData])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-serif font-bold text-3xl text-foreground">
                {t("dashboard")}
              </h1>
              <p className="text-muted-foreground">
                안녕하세요, {user.username || user.email}님!
              </p>
            </div>
            <Link href="/shortener">
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                {t("createUrl")}
              </Button>
            </Link>
          </div>

          {/* 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t("totalUrls")}</p>
                    <p className="text-2xl font-bold">{pagination?.totalCount || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t("totalClicks")}</p>
                    <p className="text-2xl font-bold">
                      {urls.reduce((sum, url) => sum + url.clickCount, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t("favorites")}</p>
                    <p className="text-2xl font-bold">
                      {urls.filter(url => url.isFavorite).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t("premium")}</p>
                    <p className="text-2xl font-bold">
                      {user.isPremium ? "활성" : "비활성"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'urls' ? 'default' : 'outline'}
            onClick={() => setActiveTab('urls')}
            className="flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
                          {t("urlList")}
          </Button>
          <Button
            variant={activeTab === 'analytics' ? 'default' : 'outline'}
            onClick={() => setActiveTab('analytics')}
            className="flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            기본 통계
          </Button>
          <Button
            variant={activeTab === 'geo' ? 'default' : 'outline'}
            onClick={() => setActiveTab('geo')}
            className="flex items-center gap-2"
          >
            {/* 아이콘 간단화: Globe 대신 기본 아이콘 사용 */}
            <BarChart3 className="w-4 h-4" />
                          {t("geographicAnalysis")}
          </Button>
        </div>

        {/* 검색 및 필터 (URL 목록 탭에서만 표시) */}
        {activeTab === 'urls' && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder={t("searchPlaceholder")}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={selectedTag || undefined} onValueChange={(v) => setSelectedTag(v === 'all' ? '' : v)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="태그 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("allTags")}</SelectItem>
                      {Array.from(new Set(urls.flatMap(url => url.tags.map(tag => tag.name)))).map(tagName => (
                        <SelectItem key={tagName} value={tagName}>{tagName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant={showFavorites ? "default" : "outline"}
                    onClick={() => setShowFavorites(!showFavorites)}
                    className="flex items-center gap-2"
                  >
                    <Heart className={`w-4 h-4 ${showFavorites ? "fill-current" : ""}`} />
                    즐겨찾기
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 탭별 콘텐츠 */}
        {activeTab === 'urls' && (
          <div className="space-y-4">
            {/* 기존 URL 목록 코드는 그대로 유지 */}
            {/* ... */}
          </div>
        )}

        {activeTab === 'analytics' && (
          <Card>
            <CardContent className="p-8 text-center">
              <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">기본 통계</h3>
              <p className="text-muted-foreground">
                기본 통계 기능은 곧 추가될 예정입니다.
              </p>
            </CardContent>
          </Card>
        )}

        {activeTab === 'geo' && (
          <div>
            {isLoadingGeo ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-primary border-t-primary/30 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">지리적 데이터를 불러오는 중...</p>
              </div>
            ) : geoData ? (
              <GeoChart 
                countryStats={geoData.countryStats}
                cityStats={geoData.cityStats}
                summary={geoData.summary}
              />
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-4xl mx-auto mb-4">🌐</div>
                  <h3 className="text-lg font-semibold mb-2">지리적 데이터가 없습니다</h3>
                  <p className="text-muted-foreground">
                    {t("urlShared")}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* URL 목록 */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">{t("urlListLoading")}</p>
            </div>
          ) : urls.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t("noUrlsMessage")}</h3>
                <p className="text-muted-foreground mb-4">
                  {t("createFirstUrl")}
                </p>
                <Link href="/shortener">
                  <Button>{t("createUrl")}</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            urls.map((url) => (
              <Card key={url.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* URL 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-2">
                        {url.isFavorite && (
                          <Heart className="w-4 h-4 text-pink-500 fill-current" />
                        )}
                        {url.isPremiumFavorite && (
                          <Crown className="w-4 h-4 text-amber-500" />
                        )}
                        <h3 className="font-semibold truncate">
                          {url.title || url.originalUrl.substring(0, 50) + '...'}
                        </h3>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground truncate">
                          {url.originalUrl}
                        </p>
                        <p className="font-mono text-sm text-primary">
                          {url.shortUrl}
                        </p>
                        {url.description && (
                          <p className="text-sm text-muted-foreground">
                            {url.description}
                          </p>
                        )}
                      </div>

                      {/* 태그 */}
                      {url.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {url.tags.map((tag) => (
                            <Badge key={tag.id} variant="secondary" className="text-xs">
                              <Tag className="w-3 h-3 mr-1" />
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* 메타 정보 */}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {url.clickCount} {t("clicks")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(url.createdAt).toLocaleDateString()}
                        </span>
                        {url.expiresAt && (
                          <span className="flex items-center gap-1 text-orange-500">
                            <Calendar className="w-3 h-3" />
                            {new Date(url.expiresAt).toLocaleDateString()} {t("expiresAt")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex flex-col sm:flex-row gap-2 lg:flex-col">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyUrl(url.shortUrl)}
                        className="flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        복사
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(url.shortUrl, '_blank')}
                        className="flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        열기
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/dashboard/edit/${url.id}`)}
                        className="flex items-center gap-1"
                      >
                        <Edit className="w-3 h-3" />
                        편집
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteUrl(url.id)}
                        className="flex items-center gap-1 text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                        삭제
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* 페이지네이션 */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              onClick={() => loadUrls(currentPage - 1)}
              disabled={!pagination.hasPrev}
            >
              이전
            </Button>
            
            <span className="text-sm text-muted-foreground">
              {pagination.page} / {pagination.totalPages}
            </span>
            
            <Button
              variant="outline"
              onClick={() => loadUrls(currentPage + 1)}
              disabled={!pagination.hasNext}
            >
              다음
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
