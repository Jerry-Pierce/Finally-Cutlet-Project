"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Mail, ArrowLeft, ArrowRight, Scissors } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function ForgotPasswordPage() {
  const { t } = useLanguage()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      if (response.ok) {
        setIsEmailSent(true)
        toast({
          title: t("emailSentSuccessfully"),
          description: t("passwordResetLinkSent"),
        })
      } else {
        const error = await response.json()
        toast({
          title: t("errorOccurred"),
          description: error.error || t("emailSendFailed"),
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
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                <Scissors className="w-6 h-6 text-primary" />
              </div>
              <span className="font-serif font-bold text-2xl text-foreground">Cutlet</span>
            </div>
            <h1 className="font-serif font-bold text-3xl text-foreground mb-2">{t("resetPasswordTitle")}</h1>
            <p className="text-muted-foreground">{t("resetPasswordDesc")}</p>
          </div>

          <Card className="border-border/50 shadow-2xl shadow-black/10 backdrop-blur-sm bg-card/95 will-change-transform hover:scale-[1.01] transition-all duration-300 hover:shadow-3xl hover:shadow-black/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            <CardHeader className="relative z-10">
              <CardTitle className="font-serif text-xl">{t("resetPassword")}</CardTitle>
              <CardDescription>{t("resetPasswordDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              {!isEmailSent ? (
                <form onSubmit={handleResetPassword} className="space-y-4">
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
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 will-change-transform hover:scale-105 active:scale-95 transition-all duration-200"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    ) : (
                      <>
                        {t("sendResetLink")}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-500/20">
                    <Mail className="w-8 h-8 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-serif font-semibold text-lg text-foreground mb-2">{t("emailSent")}</h3>
                    <p className="text-sm text-muted-foreground" 
                       dangerouslySetInnerHTML={{ 
                         __html: t("passwordResetLinkSentDesc").replace('{email}', email) 
                       }} />
                  </div>
                </div>
              )}

              <div className="text-center pt-4 border-t border-border/30">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center text-sm text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t("backToLogin")}
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
