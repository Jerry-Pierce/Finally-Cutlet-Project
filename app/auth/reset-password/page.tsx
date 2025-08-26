"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/contexts/language-context"
import { Eye, EyeOff, Lock, Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"

function ResetPasswordContent() {
  const { t } = useLanguage()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isValidToken, setIsValidToken] = useState(false)
  const [token, setToken] = useState("")
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (tokenParam) {
      setToken(tokenParam)
      validateToken(tokenParam)
    } else {
      router.push('/auth/forgot-password')
    }
  }, [searchParams, router])

  const validateToken = async (resetToken: string) => {
    try {
      const response = await fetch('/api/auth/validate-reset-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken })
      })

      if (response.ok) {
        setIsValidToken(true)
      } else {
        setIsValidToken(false)
        toast({
          title: t("tokenError"),
          description: t("invalidResetLink"),
          variant: "destructive"
        })
      }
    } catch (error) {
      setIsValidToken(false)
      toast({
        title: t("errorOccurred"),
        description: t("errorDuringTokenValidation"),
        variant: "destructive"
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast({
        title: t("passwordMismatch"),
        description: t("passwordMismatchDesc"),
        variant: "destructive"
      })
      return
    }

    if (password.length < 8) {
      toast({
        title: t("passwordTooShort"),
        description: t("passwordTooShortDesc"),
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      })

      if (response.ok) {
        toast({
          title: t("passwordChangeComplete"),
          description: t("passwordChangeCompleteDesc"),
        })
        router.push('/auth/login')
      } else {
        const error = await response.json()
        toast({
          title: t("passwordChangeFailed"),
          description: error.error || t("passwordChangeFailedDesc"),
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: t("errorOccurred"),
        description: t("networkError"),
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isValidToken) {
      return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-card to-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold text-red-600">{t("tokenError")}</CardTitle>
        <CardDescription>
          {t("invalidResetLink")}
        </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Link href="/auth/forgot-password">
            <Button className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("requestPasswordResetAgain")}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-card to-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">{t("setNewPassword")}</CardTitle>
          <CardDescription>
            {t("enterNewPassword")}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">{t("newPassword")}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("newPasswordPlaceholder")}
                  required
                  minLength={8}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t("confirmPasswordPlaceholder")}
                  required
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? t("processing") : t("changePassword")}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-primary">
              {t("backToLogin")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ResetPasswordPage() {
  const { t } = useLanguage()
  
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-card to-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">{t("loading")}</CardTitle>
            <CardDescription>
              {t("loadingPage")}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
