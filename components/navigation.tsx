"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Scissors, Home, CreditCard, User, BarChart3, Settings, LinkIcon, LogIn, LogOut, Menu, X, Activity, Database, Users } from "lucide-react"
import { NotificationBell } from "@/components/ui/notification-bell"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/language-context"
import { LanguageSelector } from "@/components/language-selector"
import { useAuth } from "@/contexts/auth-context"
import { useState } from "react"

const publicNavigationItems = [
  {
    nameKey: "home" as const,
    href: "/",
    icon: Home,
  },
]

const protectedNavigationItems = [
  {
    nameKey: "urlShortener" as const,
    href: "/shortener",
    icon: LinkIcon,
  },
  {
    nameKey: "dashboard" as const,
    href: "/dashboard",
    icon: BarChart3,
  },
  {
    nameKey: "profile" as const,
    href: "/profile",
    icon: User,
  },
]

const adminNavigationItems = [
  {
    nameKey: "admin" as const,
    href: "/admin",
    icon: Settings,
  },
  {
    nameKey: "monitoring" as const,
    href: "/admin/monitoring",
    icon: Activity,
  },
  {
    nameKey: "users" as const,
    href: "/admin/users",
    icon: Users,
  },
  {
    nameKey: "backup" as const,
    href: "/admin/backup",
    icon: Database,
  },
]



export function Navigation() {
  const pathname = usePathname()
  const { t } = useLanguage()
  const { user, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigationItems = user ? [
    ...publicNavigationItems, 
    ...protectedNavigationItems,
    ...(user.email === 'cutlet.service@gmail.com' ? adminNavigationItems : [])
  ] : publicNavigationItems

  const handleLogout = () => {
    logout()
    setIsMobileMenuOpen(false)
  }

  return (
    <header className="border-b border-border/50 backdrop-blur-md bg-background/90 relative z-50 shadow-lg shadow-black/5">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg shadow-lg shadow-primary/25 will-change-transform group-hover:scale-110 transition-transform duration-300 overflow-hidden">
              <img src="/logo.png" alt="Cutlet Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-xl text-foreground">Cutlet</h1>
              <p className="text-sm text-muted-foreground hidden sm:block">{t("urlShortenerService")}</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "flex items-center gap-2 will-change-transform hover:scale-105 transition-all duration-200",
                      isActive && "shadow-lg shadow-primary/25",
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {t(item.nameKey)}
                  </Button>
                </Link>
              )
            })}

            {user ? (
              <div className="flex items-center gap-2">
                <NotificationBell />
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 will-change-transform hover:scale-105 transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <Link href="/auth/login">
                <Button
                  size="sm"
                  className="flex items-center gap-2 will-change-transform hover:scale-105 transition-all duration-200 shadow-lg shadow-primary/25"
                >
                  <LogIn className="w-4 h-4" />
                  {t("login")}
                </Button>
              </Link>
            )}

            <LanguageSelector />
          </nav>

          <div className="md:hidden flex items-center gap-2">
            <LanguageSelector />
            <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border/50 animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col gap-2 pt-4">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className={cn(
                        "w-full justify-start flex items-center gap-3 py-3",
                        isActive && "shadow-lg shadow-primary/25",
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {t(item.nameKey)}
                    </Button>
                  </Link>
                )
              })}

              <div className="border-t border-border/30 pt-2 mt-2">
                {user ? (
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start flex items-center gap-3 py-3"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                ) : (
                  <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button
                      size="sm"
                      className="w-full justify-start flex items-center gap-3 py-3 shadow-lg shadow-primary/25"
                    >
                      <LogIn className="w-4 h-4" />
                      {t("login")}
                    </Button>
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
