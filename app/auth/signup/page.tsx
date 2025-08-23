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

export default function SignupPage() {
  const { t } = useLanguage()
  const { signup, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      })
      return
    }

    const success = await signup(email, password, username)

    if (success) {
      toast({
        title: "Account created!",
        description: "Welcome to Cutlet. You can now start shortening URLs.",
      })
      router.push("/shortener")
    } else {
      toast({
        title: "Signup failed",
        description: "Please try again with different credentials.",
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
                      placeholder="사용자명을 입력하세요"
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
                  disabled={isLoading}
                  className="w-full shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 will-change-transform hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
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
