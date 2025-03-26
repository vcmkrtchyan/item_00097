import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { TravelProvider } from "@/context/travel-context"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Travel Planner",
  description: "Plan your trips, track expenses, and bookmark locations",
  icons: {
    icon: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/favicon-7nbEteUGkj6ir4sxtxVDRhkIbjJRpB.ico",
    shortcut: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/favicon-7nbEteUGkj6ir4sxtxVDRhkIbjJRpB.ico",
    apple: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/favicon-7nbEteUGkj6ir4sxtxVDRhkIbjJRpB.ico",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TravelProvider>{children}</TravelProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'