"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Mail, Lock, ArrowRight } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function SignupPage() {
  const { t } = useLanguage()
  const { signup, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [isSendingCode, setIsSendingCode] = useState(false)
  const [isVerifyingCode, setIsVerifyingCode] = useState(false)
  const [expectedCode, setExpectedCode] = useState("")
  const [canResend, setCanResend] = useState(true)
  const [resendCountdown, setResendCountdown] = useState(0)

  // 이메일 인증 코드 전송
  const handleSendVerificationCode = async () => {
    if (!email) {
      toast({
        title: t("emailInputRequired"),
        description: t("pleaseEnterEmailFirst"),
        variant: "destructive",
      })
      return
    }

    setIsSendingCode(true)
    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const result = await response.json()

      if (result.success) {
        setExpectedCode(result.verificationCode)
        setIsEmailVerified(false)
        setVerificationCode("")
        toast({
          title: t("verificationCodeSentSuccess"),
          description: t("verificationCodeSent"),
        })
        
        // 재전송 제한 (1분)
        setCanResend(false)
        setResendCountdown(60)
        const timer = setInterval(() => {
          setResendCountdown((prev) => {
            if (prev <= 1) {
              setCanResend(true)
              clearInterval(timer)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        toast({
          title: t("verificationCodeSendFailed"),
          description: t(result.error) || t("verificationCodeSendFailedDesc"),
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: t("errorOccurred"),
        description: t("errorDuringVerificationCodeSend"),
        variant: "destructive",
      })
    } finally {
      setIsSendingCode(false)
    }
  }

  // 이메일 인증 코드 확인
  const handleVerifyEmail = async () => {
    if (!verificationCode || !expectedCode) {
      toast({
        title: t("verificationCodeInputRequired"),
        description: t("pleaseEnterVerificationCode"),
        variant: "destructive",
      })
      return
    }

    setIsVerifyingCode(true)
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          verificationCode, 
          expectedCode 
        })
      })

      const result = await response.json()

      if (result.success && result.verified) {
        setIsEmailVerified(true)
        toast({
          title: t("emailVerificationComplete"),
          description: t("emailVerificationComplete"),
        })
      } else {
        toast({
          title: t("verificationFailed"),
          description: t("verificationCodeMismatch"),
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: t("errorOccurred"),
        description: t("errorDuringVerification"),
        variant: "destructive",
      })
    } finally {
      setIsVerifyingCode(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isEmailVerified) {
      toast({
        title: t("emailVerificationRequired"),
        description: t("pleaseCompleteEmailVerification"),
        variant: "destructive",
      })
      return
    }
    
    if (password !== confirmPassword) {
      toast({
        title: t("passwordMismatch"),
        description: t("pleaseMakeSurePasswordsMatch"),
        variant: "destructive",
      })
      return
    }

    const success = await signup(email, password, username)

    if (success) {
      toast({
        title: t("accountCreatedSuccess"),
        description: `${t("welcomeToCutlet")}. ${t("youCanNowStartShorteningUrls")}`,
      })
      router.push("/shortener")
    } else {
      toast({
        title: t("signupFailed"),
        description: t("pleaseTryAgainWithDifferentCredentials"),
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-xl opacity-60" />
        <div className="absolute top-40 right-20 w-24 h-24 bg-accent/5 rounded-full blur-lg opacity-60" />
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-secondary/5 rounded-full blur-2xl opacity-60" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg shadow-primary/20 overflow-hidden">
                <img src="/logo.png" alt="Cutlet Logo" className="w-full h-10 object-cover" />
              </div>
              <span className="font-serif font-bold text-2xl text-foreground">Cutlet</span>
            </div>
            <h1 className="font-serif font-bold text-3xl text-foreground mb-2">{t("createNewAccount")}</h1>
            <p className="text-muted-foreground">{t("landingDescription")}</p>
          </div>

          <Card className="border-border/50 shadow-2xl shadow-black/10 backdrop-blur-sm bg-card/95 will-change-transform hover:scale-[1.01] transition-all duration-300 hover:shadow-3xl hover:shadow-black/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            <CardHeader className="relative z-10">
              <CardTitle className="font-serif text-xl">{t("signup")}</CardTitle>
              <CardDescription>{t("createNewAccount")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium">
                    {t("username")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="username"
                      type="text"
                      placeholder={t("usernamePlaceholder")}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="shadow-inner shadow-black/5 border-border/50 focus:shadow-lg focus:shadow-primary/10 transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    {t("email")}
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder={t("emailPlaceholder")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 shadow-inner shadow-black/5 border-border/50 focus:shadow-lg focus:shadow-primary/10 transition-all duration-300"
                      required
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleSendVerificationCode}
                    disabled={isSendingCode || !email || !canResend}
                    className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isSendingCode ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : canResend ? (
                      t("sendVerificationCode")
                    ) : (
                      `${resendCountdown}${t("seconds")} ${t("resendCodeIn")}`
                    )}
                  </Button>
                </div>

                {/* 이메일 인증 코드 입력란 */}
                {expectedCode && (
                  <div className="space-y-2">
                                      <Label htmlFor="verificationCode" className="text-sm font-medium">
                    {t("verificationCode")}
                  </Label>
                    <div className="flex gap-2">
                                              <Input
                          id="verificationCode"
                          type="text"
                          placeholder={t("verificationCodePlaceholder")}
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          className="flex-1 shadow-inner shadow-black/5 border-border/50 focus:shadow-lg focus:shadow-primary/10 transition-all duration-300"
                          maxLength={6}
                        />
                      <Button
                        type="button"
                        onClick={handleVerifyEmail}
                        disabled={isVerifyingCode || !verificationCode || isEmailVerified}
                        className="px-4 bg-green-600 hover:bg-green-700 text-white"
                      >
                        {isVerifyingCode ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : isEmailVerified ? (
                          t("emailVerificationComplete")
                        ) : (
                          t("verifyEmail")
                        )}
                      </Button>
                    </div>
                    {isEmailVerified && (
                      <p className="text-sm text-green-600 font-medium">
                        ✓ {t("emailVerificationComplete")}
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    {t("password")}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder={t("passwordPlaceholder")}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 shadow-inner shadow-black/5 border-border/50 focus:shadow-lg focus:shadow-primary/10 transition-all duration-300"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    {t("confirmPassword")}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder={t("confirmPasswordPlaceholder")}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 shadow-inner shadow-black/5 border-border/50 focus:shadow-lg focus:shadow-primary/10 transition-all duration-300"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !isEmailVerified}
                  className={`w-full shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 will-change-transform hover:scale-105 active:scale-95 transition-all duration-200 ${
                    !isEmailVerified ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : !isEmailVerified ? (
                    t("accountCreationPossibleAfterVerification")
                  ) : (
                    <>
                      {t("createAccount")}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              <div className="text-center pt-4 border-t border-border/30">
                <p className="text-sm text-muted-foreground">
                  {t("alreadyHaveAccount")}{" "}
                  <Link href="/auth/login" className="text-primary hover:text-primary/80 transition-colors font-medium">
                    {t("login")}
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
