"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Mail, Lock, ArrowRight, Scissors } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const { t } = useLanguage()
  const { login, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    const success = await login(email, password)

    if (success) {
      toast({
        title: "Login successful!",
        description: "Welcome back to Cutlet.",
      })
      router.push("/shortener")
    } else {
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again.",
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
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                <Scissors className="w-6 h-6 text-primary" />
              </div>
              <span className="font-serif font-bold text-2xl text-foreground">Cutlet</span>
            </div>
            <h1 className="font-serif font-bold text-3xl text-foreground mb-2">{t("signInToAccount")}</h1>
            <p className="text-muted-foreground">{t("enterUrlDescription")}</p>
          </div>

          <Card className="border-border/50 shadow-2xl shadow-black/10 backdrop-blur-sm bg-card/95 will-change-transform hover:scale-[1.01] transition-all duration-300 hover:shadow-3xl hover:shadow-black/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            <CardHeader className="relative z-10">
              <CardTitle className="font-serif text-xl">{t("login")}</CardTitle>
              <CardDescription>{t("signInToAccount")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <form onSubmit={handleLogin} className="space-y-4">
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

                <div className="flex items-center justify-between">
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    {t("forgotPassword")}
                  </Link>
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
                      {t("login")}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              <div className="text-center pt-4 border-t border-border/30">
                <p className="text-sm text-muted-foreground">
                  {t("dontHaveAccount")}{" "}
                  <Link
                    href="/auth/signup"
                    className="text-primary hover:text-primary/80 transition-colors font-medium"
                  >
                    {t("signup")}
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
