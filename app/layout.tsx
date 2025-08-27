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
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icon-128.png', sizes: '128x128', type: 'image/png' },
      { url: '/icon-256.png', sizes: '256x256', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/icon-180.png',
    other: [
      { rel: 'apple-touch-icon', url: '/icon-180.png' },
      { rel: 'mask-icon', url: '/icon-512.png', color: '#0b1220' },
    ],
  },
  manifest: '/manifest.webmanifest',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#0b1220" />
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
        <script dangerouslySetInnerHTML={{ __html: `
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(console.error)
  })
}
`}} />
      </body>
    </html>
  )
}
