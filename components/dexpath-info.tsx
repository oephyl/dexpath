"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Copy, ExternalLink, Check } from "lucide-react"
import { useState, useEffect } from "react"
import Image from "next/image"

export function DexpathInfo() {
  const [copied, setCopied] = useState(false)
  const [tokenData, setTokenData] = useState({
    price: 0.0245,
    change24h: 15.3,
    marketCap: 2400000,
    holders: 1247,
  })

  const contractAddress = "DexPathxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxpump"

  useEffect(() => {
    const interval = setInterval(() => {
      setTokenData((prev) => ({
        price: prev.price + (Math.random() - 0.5) * 0.001,
        change24h: prev.change24h + (Math.random() - 0.5) * 0.5,
        marketCap: prev.marketCap + (Math.random() - 0.5) * 10000,
        holders: prev.holders + Math.floor(Math.random() * 3),
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const handleCopy = () => {
    navigator.clipboard.writeText(contractAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const socialLinks = [
    { label: "X", href: "https://x.com/dexpath" },
    { label: "Discord", href: "https://discord.gg/dexpath" },
    { label: "Telegram", href: "https://t.me/dexpath" },
  ]

  return (
    <Card className="h-fit bg-secondary/30 border-border/50 shadow-sm">
      <CardContent className="px-5 sm:px-6 py-4 sm:py-4 flex flex-col gap-4">
        {/* Header: logo + token name */}
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <Image
              src="/images/ppx.png"
              alt="DEXPATH"
              width={40}
              height={40}
              className="rounded-full ring-2 ring-border/50"
            />
            <div className="absolute -bottom-0.5 -right-0.5 rounded-full p-0.5 bg-background border border-border">
              <Image src="/images/solana-logo.png" alt="Solana" width={10} height={10} className="rounded-full" />
            </div>
          </div>
          <div>
            <h3 className="text-base font-bold text-primary tracking-tight">$DEXPATH</h3>
            <p className="text-xs text-muted-foreground">DexPath Token</p>
          </div>
        </div>

        <Separator className="bg-border/50" />

        {/* Price & MCap */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Price</p>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="font-semibold text-sm">${tokenData.price.toFixed(4)}</span>
              <span
                className={`text-xs font-medium ${tokenData.change24h >= 0 ? "text-green-500" : "text-red-500"}`}
              >
                {tokenData.change24h >= 0 ? "+" : ""}
                {tokenData.change24h.toFixed(1)}%
              </span>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Market Cap</p>
            <p className="font-semibold text-sm">${(tokenData.marketCap / 1000000).toFixed(2)}M</p>
          </div>
        </div>

        {/* Contract: copy button only for cleaner look */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8 text-xs font-mono text-muted-foreground justify-start gap-2 overflow-hidden"
            onClick={handleCopy}
          >
            <span className="truncate">{contractAddress}</span>
            {copied ? (
              <Check className="h-3.5 w-3.5 shrink-0 text-green-500" />
            ) : (
              <Copy className="h-2.5 w-2.5 shrink-0" />
            )}
          </Button>
        </div>

        <Separator className="bg-border/50" />

        {/* Social links */}
        <div className="flex gap-2">
          {socialLinks.map(({ label, href }) => (
            <Button
              key={label}
              variant="outline"
              size="sm"
              className="flex-1 h-8 text-xs bg-background/50 hover:bg-background"
              asChild
            >
              <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5">
                <ExternalLink className="h-3 w-3 shrink-0" />
                {label}
              </a>
            </Button>
          ))}
        </div>

        {/* Primary CTA */}
        <Button
          className="w-full h-9 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm"
          asChild
        >
          <a
            href="https://pump.fun/coin/DexPathSoL8NAxxxxxxxxxxxxxxxxxxxxxxxxxxpump"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            BUY $DEXPATH
          </a>
        </Button>
      </CardContent>
    </Card>
  )
}
