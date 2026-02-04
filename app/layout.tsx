import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Toaster as AppToaster } from "@/components/ui/sonner"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Dexpath - Paid Signals Terminal",
  description: "Detect marketing-paid signals and momentum on Dexscreener",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/images/untitled-20design-20-2810-29.gif",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/images/untitled-20design-20-2810-29.gif",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/images/untitled-20design-20-2810-29.gif",
        type: "image/svg+xml",
      },
    ],
    apple: "/images/untitled-20design-20-2810-29.gif",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased relative`}>
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div
            className="absolute top-[-10%] left-[-5%] w-[800px] h-[800px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(0, 221, 191, 0.35) 0%, rgba(0, 221, 191, 0.15) 40%, transparent 70%)",
              filter: "blur(80px)",
            }}
          />
          <div
            className="absolute top-[35%] right-[-10%] w-[900px] h-[900px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(0, 221, 191, 0.4) 0%, rgba(0, 221, 191, 0.18) 40%, transparent 70%)",
              filter: "blur(90px)",
            }}
          />
          <div
            className="absolute bottom-[-12%] left-[25%] w-[850px] h-[850px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(0, 221, 191, 0.38) 0%, rgba(0, 221, 191, 0.16) 40%, transparent 70%)",
              filter: "blur(85px)",
            }}
          />
        </div>

        <div className="relative z-10">{children}</div>
        <AppToaster richColors closeButton position="bottom-right" />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
