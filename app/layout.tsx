import type React from "react"
import type { Metadata } from "next"
import { Nunito } from "next/font/google"
import { Poppins } from "next/font/google"
import { ClientWrapper } from "@/components/client-wrapper"
import "./globals.css"

const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nunito",
})

const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: "Cutlet - URL Shortener Service",
  description: "Fast and secure URL shortening service",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${poppins.style.fontFamily};
  --font-sans: ${poppins.variable};
  --font-mono: ${nunito.variable};
}
        `}</style>
      </head>
      <body className={`${nunito.variable} ${poppins.variable} antialiased`}>
        <ClientWrapper>
          {children}
        </ClientWrapper>
      </body>
    </html>
  )
}
