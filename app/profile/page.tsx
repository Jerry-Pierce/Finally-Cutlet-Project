"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Lock, Bell, Key, Crown, Shield, Trash2, Camera, Copy, RefreshCw, BarChart3, Save, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/contexts/language-context"

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const { t } = useLanguage()

  const [activeSection, setActiveSection] = useState("general")
  const [profileData, setProfileData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  
  // 비밀번호 표시 상태
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  // 알림 설정
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: true,
  })

  // API 키 (실제로는 백엔드에서 생성)
  const [apiKey] = useState("cutlet_sk_" + Math.random().toString(36).substr(2, 15))

  const profileSections = [
    { id: "general", label: t("generalInfo"), icon: User },
    { id: "security", label: t("security"), icon: Lock },
    { id: "notifications", label: t("notifications"), icon: Bell },
    { id: "subscription", label: t("subscription"), icon: Crown },
    { id: "api", label: "API", icon: Key },
    { id: "danger", label: t("accountManagement"), icon: Shield },
  ]

  // 프로필 데이터 로드
  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    loadProfile()
  }, [user, router])

  const loadProfile = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/user/profile', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const result = await response.json()
        setProfileData(result.data)
        setFormData({
          username: result.data.username || "",
          email: result.data.email || "",
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        })
      } else {
        toast({
          title: "오류 발생",
          description: t("profileLoadFailed"),
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('프로필 로드 오류:', error)
      toast({
        title: "오류 발생",
        description: "네트워크 오류가 발생했습니다.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return
    
    // 비밀번호 변경 시 확인
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "오류",
        description: t("newPasswordMismatch"),
        variant: "destructive"
      })
      return
    }

    setIsSaving(true)
    try {
      const updateData: any = {}
      
      if (formData.username && formData.username !== profileData?.username) {
        updateData.username = formData.username
      }
      
      if (formData.email && formData.email !== profileData?.email) {
        updateData.email = formData.email
      }
      
      if (formData.currentPassword && formData.newPassword) {
        updateData.currentPassword = formData.currentPassword
        updateData.newPassword = formData.newPassword
      }

      if (Object.keys(updateData).length === 0) {
        toast({
          title: "알림",
          description: t("noChanges"),
        })
        return
      }

      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "저장 완료",
          description: result.message || t("profileUpdateSuccess"),
        })
        
        // 프로필 데이터 새로고침
        await loadProfile()
        
        // 사용자 정보 업데이트
        if (updateUser && result.data) {
          updateUser({
            ...user,
            username: result.data.username,
            email: result.data.email
          })
        }
        
        // 비밀번호 필드 초기화
        setFormData(prev => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        }))
      } else {
        const error = await response.json()
        toast({
          title: "저장 실패",
          description: error.error || "프로필 업데이트에 실패했습니다.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('프로필 저장 오류:', error)
      toast({
        title: "오류 발생",
        description: "네트워크 오류가 발생했습니다.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey)
    toast({
      title: "복사 완료",
      description: t("apiKeyCopied"),
    })
  }

  const handleRegenerateApiKey = () => {
    // 실제로는 백엔드에서 새 API 키 생성
    toast({
      title: "알림",
      description: t("apiKeyRegenerationComingSoon"),
    })
  }

  const handleDeleteAccount = () => {
    if (confirm(t("confirmAccountDeletion"))) {
      toast({
        title: "알림",
        description: t("accountDeletionComingSoon"),
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user || !profileData) {
    return null
  }

  const renderContent = () => {
    switch (activeSection) {
      case "general":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold mb-2">{t("generalInfo")}</h2>
              <p className="text-muted-foreground">{t("manageBasicProfileInfo")}</p>
            </div>

            <Card className="border-border/50 shadow-lg shadow-black/5 backdrop-blur-sm bg-card/95">
              <CardContent className="pt-6">
                <div className="flex items-center gap-6 mb-6">
                  <div className="relative">
                    <Avatar className="w-20 h-20 shadow-lg shadow-black/10">
                      <AvatarImage src={profileData.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                        {profileData.username?.charAt(0) || profileData.email.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 shadow-lg"
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{profileData.username || t("user")}</h3>
                    <p className="text-muted-foreground">{profileData.email}</p>
                    <Badge variant="secondary" className="mt-2 bg-accent/10 text-accent border-accent/20">
                      <Crown className="w-3 h-3 mr-1" />
                      {profileData.isPremium ? t("premiumUser") : t("regularUser")}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">{t("totalUrls")}</Label>
                    <p className="text-2xl font-bold text-primary">{profileData.stats.totalUrls}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">{t("favorites")}</Label>
                    <p className="text-2xl font-bold text-accent">{profileData.stats.totalFavorites}</p>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="username">{t("username")}</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="shadow-inner shadow-black/5"
                      placeholder={t("enterUsername")}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="email">{t("email")}</Label>
                    <Input
                      id="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="shadow-inner shadow-black/5"
                      placeholder={t("emailPlaceholder")}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case "security":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold mb-2">{t("security")}</h2>
              <p className="text-muted-foreground">{t("manageAccountSecurity")}</p>
            </div>

            <Card className="border-border/50 shadow-lg shadow-black/5 backdrop-blur-sm bg-card/95">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="currentPassword">{t("currentPassword")}</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPasswords.current ? "text" : "password"}
                        value={formData.currentPassword}
                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                        className="shadow-inner shadow-black/5 pr-10"
                        placeholder={t("enterCurrentPassword")}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                      >
                        {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
  
                  <div className="grid gap-2">
                    <Label htmlFor="newPassword">{t("newPassword")}</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPasswords.new ? "text" : "password"}
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        className="shadow-inner shadow-black/5 pr-10"
                        placeholder={t("enterNewPassword")}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      >
                        {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
  
                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">{t("confirmNewPassword")}</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showPasswords.confirm ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="shadow-inner shadow-black/5 pr-10"
                        placeholder={t("reEnterNewPassword")}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      >
                        {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case "notifications":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold mb-2">{t("notificationSettings")}</h2>
              <p className="text-muted-foreground">{t("manageNotificationSettings")}</p>
            </div>

            <Card className="border-border/50 shadow-lg shadow-black/5 backdrop-blur-sm bg-card/95">
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">{t("emailNotifications")}</Label>
                      <p className="text-sm text-muted-foreground">{t("emailNotificationsDesc")}</p>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">{t("pushNotifications")}</Label>
                      <p className="text-sm text-muted-foreground">{t("pushNotificationsDesc")}</p>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, push: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">{t("marketingNotifications")}</Label>
                      <p className="text-sm text-muted-foreground">{t("marketingNotificationsDesc")}</p>
                    </div>
                    <Switch
                      checked={notifications.marketing}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, marketing: checked }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case "subscription":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold mb-2">{t("subscription")}</h2>
              <p className="text-muted-foreground">구독 정보를 확인하고 관리하세요</p>
            </div>

            <Card className="border-border/50 shadow-lg shadow-black/5 backdrop-blur-sm bg-card/95">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">현재 플랜</h3>
                      <p className="text-sm text-muted-foreground">
                        {profileData.isPremium ? "프리미엄" : "무료"}
                      </p>
                    </div>
                    <Badge variant={profileData.isPremium ? "default" : "secondary"}>
                      {profileData.isPremium ? "프리미엄" : "무료"}
                    </Badge>
                  </div>
                  
                  {profileData.isPremium && (
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        다음 결제일: {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case "api":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold mb-2">API</h2>
              <p className="text-muted-foreground">API 키를 관리하세요</p>
            </div>

            <Card className="border-border/50 shadow-lg shadow-black/5 backdrop-blur-sm bg-card/95">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">API 키</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        value={apiKey}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCopyApiKey}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleRegenerateApiKey}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      새로고침
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case "danger":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold mb-2 text-red-600">{t("accountManagement")}</h2>
              <p className="text-muted-foreground">위험한 작업을 수행할 수 있습니다</p>
            </div>

            <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-red-500" />
                    <div>
                      <h3 className="font-semibold text-red-700 dark:text-red-300">계정 삭제</h3>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다.
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    계정 삭제
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="font-serif font-bold text-3xl text-foreground mb-2">프로필 설정</h1>
          <p className="text-muted-foreground">
            계정 정보와 설정을 관리하세요
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 사이드바 */}
          <div className="lg:col-span-1">
            <Card className="border-border/50 shadow-lg shadow-black/5 backdrop-blur-sm bg-card/95">
              <CardContent className="p-4">
                <nav className="space-y-2">
                  {profileSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeSection === section.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      <section.icon className="w-4 h-4" />
                      {section.label}
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-3">
            {renderContent()}
            
            {/* 저장 버튼 */}
            {activeSection === "general" || activeSection === "security" ? (
              <div className="mt-6">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? "저장 중..." : "변경사항 저장"}
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
