"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Copy, Link as LinkIcon, Crown, Clock, Tag, Heart, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { QRCode } from "@/components/ui/qr-code"
import { RateLimitInfo } from "@/components/ui/rate-limit-info"

export default function ShortenerPage() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const [url, setUrl] = useState("")
  const [shortUrl, setShortUrl] = useState("")
  const [customUrl, setCustomUrl] = useState("")
  const [expirationDays, setExpirationDays] = useState("permanent")
  const [tags, setTags] = useState<string[]>([])
  const [currentTag, setCurrentTag] = useState("")
  const [isFavorite, setIsFavorite] = useState(false)
  const [isPremiumFavorite, setIsPremiumFavorite] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    limit: number
    remaining: number
    reset: number
  } | null>(null)
  const { toast } = useToast()

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()])
      setCurrentTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleShorten = async () => {
    if (!url) return

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalUrl: url,
          customCode: customUrl || undefined,
          tags: tags,
          expirationDays: expirationDays,
          isFavorite: isFavorite,
          isPremiumFavorite: isPremiumFavorite,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setShortUrl(result.data.shortUrl)
        
        // Rate Limit 정보 저장
        const limit = response.headers.get('X-RateLimit-Limit')
        const remaining = response.headers.get('X-RateLimit-Remaining')
        const reset = response.headers.get('X-RateLimit-Reset')
        
        if (limit && remaining && reset) {
          setRateLimitInfo({
            limit: parseInt(limit),
            remaining: parseInt(remaining),
            reset: parseInt(reset)
          })
        }
        
        toast({
          title: t("urlShorteningComplete"),
          description: t("newShortLinkCreated"),
        })
      } else {
        // Rate Limit 오류 처리
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After')
          const limit = response.headers.get('X-RateLimit-Limit')
          const reset = response.headers.get('X-RateLimit-Reset')
          
          toast({
            title: "요청 제한",
            description: `요청이 너무 많습니다. ${retryAfter ? `${retryAfter}초 후` : '잠시 후'} 다시 시도해주세요.`,
            variant: "destructive",
          })
          
          if (limit && reset) {
            setRateLimitInfo({
              limit: parseInt(limit),
              remaining: 0,
              reset: parseInt(reset)
            })
          }
        } else {
          toast({
            title: "오류 발생",
            description: result.error || "URL 단축 중 오류가 발생했습니다.",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error('URL 단축 오류:', error)
      toast({
        title: "오류 발생",
        description: "네트워크 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shortUrl)
    toast({
      title: t("copyComplete"),
      description: t("copiedToClipboard"),
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-xl opacity-60" />
        <div className="absolute top-40 right-20 w-24 h-24 bg-accent/5 rounded-full blur-lg opacity-60" />
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-secondary/5 rounded-full blur-2xl opacity-60" />
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12 relative z-10">
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
          <div className="text-center space-y-3 md:space-y-4">
            <h1 className="font-serif font-bold text-3xl md:text-4xl lg:text-5xl text-foreground drop-shadow-lg">
              {t("urlShortener")}
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-md mx-auto px-4">
              {t("complexUrlDescription")}
            </p>
          </div>

          <Card className="border-border/50 shadow-2xl shadow-black/10 backdrop-blur-sm bg-card/95 will-change-transform hover:scale-[1.01] transition-all duration-300 hover:shadow-3xl hover:shadow-black/20 relative overflow-hidden">
            {/* Rate Limit 정보 표시 */}
            {rateLimitInfo && (
              <div className="absolute top-4 right-4 z-10">
                <RateLimitInfo 
                  limit={rateLimitInfo.limit}
                  remaining={rateLimitInfo.remaining}
                  reset={rateLimitInfo.reset}
                  endpoint="URL 단축"
                />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            <CardHeader className="relative z-10 pb-4 md:pb-6">
              <CardTitle className="font-serif text-lg md:text-xl">{t("shortenLink")}</CardTitle>
              <CardDescription className="text-sm md:text-base">{t("enterUrlDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6 relative z-10">
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    placeholder={t("urlPlaceholder")}
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1 shadow-inner shadow-black/5 border-border/50 focus:shadow-lg focus:shadow-primary/10 transition-all duration-300 placeholder:text-muted-foreground/60"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsFavorite(!isFavorite)}
                      className={`p-2 rounded-lg border transition-all duration-300 will-change-transform hover:scale-110 active:scale-95 ${
                        isFavorite
                          ? "bg-pink-500/10 border-pink-500/30 text-pink-500 shadow-lg shadow-pink-500/20"
                          : "bg-muted border-border/50 text-muted-foreground hover:bg-pink-500/5 hover:border-pink-500/20"
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
                    </button>
                    <Button
                      onClick={handleShorten}
                      disabled={!url || isLoading}
                      className="px-4 sm:px-6 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 will-change-transform hover:scale-105 active:scale-95 transition-all duration-200"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      ) : (
                        <>
                          <LinkIcon className="w-4 h-4 mr-2" />
                          <span className="hidden sm:inline">{t("shorten")}</span>
                          <span className="sm:hidden">Go</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Heart className="w-3 h-3 text-pink-500" />
                  {t("favoriteTooltip")}
                </p>
              </div>

              {user ? (
                <div className="border-t border-border/30 pt-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded-full border border-r-0 border-border/50">
                      <Crown className="w-3 h-3 text-amber-500" />
                      <span className="text-xs font-medium text-amber-600 dark:text-amber-400">{t("premium")}</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">{t("customUrl")}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex-1 flex items-center">
                        <span className="text-xs sm:text-sm text-muted-foreground bg-muted px-2 sm:px-3 py-2 rounded-l-md border border-r-0 border-border/50 whitespace-nowrap">
                          cutlet.ly/
                        </span>
                        <Input
                          placeholder={t("customUrlPlaceholder")}
                          value={customUrl}
                          onChange={(e) => setCustomUrl(e.target.value)}
                          className="rounded-l-none shadow-inner shadow-black/5 border-border/50 focus:shadow-lg focus:shadow-amber-500/10 transition-all duration-300 placeholder:text-muted-foreground/60"
                        />
                      </div>
                      <button
                        onClick={() => setIsPremiumFavorite(!isPremiumFavorite)}
                        className={`p-2 rounded-lg border transition-all duration-300 will-change-transform hover:scale-110 active:scale-95 self-start sm:self-auto ${
                          isPremiumFavorite
                            ? "bg-pink-500/10 border-pink-500/30 text-pink-500 shadow-lg shadow-pink-500/20"
                            : "bg-muted border-border/50 text-muted-foreground hover:bg-pink-500/5 hover:border-pink-500/20"
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isPremiumFavorite ? "fill-current" : ""}`} />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Crown className="w-3 h-3 text-amber-500" />
                      {t("premiumOnlyFeature")}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="border-t border-border/30 pt-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg border border-border/50">
                    <Crown className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                    <p className="text-sm font-medium mb-2">커스텀 URL을 사용하려면 로그인이 필요합니다</p>
                    <Link href="/auth/login" className="text-primary hover:text-primary/80 text-sm">
                      로그인하기 →
                    </Link>
                  </div>
                </div>
              )}

              <div className="border-t border-border/30 pt-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-full border border-r-0 border-border/50">
                    <Tag className="w-3 h-3 text-green-500" />
                    <span className="text-xs font-medium text-green-600 dark:text-green-400">
                      {t("classification")}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-foreground">{t("addTags")}</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 mb-3">
                  <Input
                    placeholder={t("tagPlaceholder")}
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={handleTagKeyPress}
                    className="flex-1 shadow-inner shadow-black/5 border-border/50 focus:shadow-lg focus:shadow-green-500/10 transition-all duration-300 placeholder:text-muted-foreground/60"
                  />
                  <Button
                    onClick={handleAddTag}
                    disabled={!currentTag.trim() || tags.includes(currentTag.trim())}
                    variant="outline"
                    size="sm"
                    className="px-4 shadow-md hover:shadow-lg will-change-transform hover:scale-105 active:scale-95 transition-all duration-200 bg-transparent w-full sm:w-auto"
                  >
                    <Tag className="w-4 h-4 mr-1" />
                    {t("add")}
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-700 dark:text-green-300 rounded-full border border-green-500/20 text-sm"
                      >
                        <Tag className="w-3 h-3" />
                        <span>{tag}</span>
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:bg-green-500/20 rounded-full p-0.5 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-green-500" />
                  {t("tagDescription")}
                </p>
              </div>

              <div className="border-t border-border/30 pt-4">
                <Select value={expirationDays} onValueChange={setExpirationDays}>
                  <SelectTrigger className="shadow-inner shadow-black/5 border-border/50 focus:shadow-lg focus:shadow-blue-500/10 transition-all duration-300">
                    <SelectValue placeholder={t("selectExpiration")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="permanent">{t("permanent")}</SelectItem>
                    <SelectItem value="1">{t("oneDayLater")}</SelectItem>
                    <SelectItem value="7">{t("sevenDaysLater")}</SelectItem>
                    <SelectItem value="30">{t("thirtyDaysLater")}</SelectItem>
                    <SelectItem value="90">{t("ninetyDaysLater")}</SelectItem>
                    <SelectItem value="365">{t("oneYearLater")}</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-blue-500" />
                  {t("expirationDescription")}
                </p>
              </div>

              {shortUrl && (
                <div className="space-y-4">
                  {/* 단축된 URL 표시 */}
                  <div className="p-3 md:p-4 bg-muted rounded-lg border border-border/50 shadow-inner shadow-black/5 backdrop-blur-sm animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-muted-foreground mb-1">{t("shortenedUrl")}</p>
                        <p className="font-mono text-sm md:text-base text-foreground truncate bg-gradient-to-r from-primary/10 to-transparent px-2 py-1 rounded">
                          {shortUrl}
                        </p>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleCopy}
                        className="shrink-0 shadow-md hover:shadow-lg will-change-transform hover:scale-105 active:scale-95 transition-all duration-200 w-full sm:w-auto"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        {t("copy")}
                      </Button>
                    </div>
                  </div>

                  {/* QR 코드 */}
                  <div className="flex justify-center">
                    <QRCode 
                      url={shortUrl} 
                      code={shortUrl.split('/').pop() || ''}
                      title="스마트폰으로 스캔하여 링크에 접속하세요"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
