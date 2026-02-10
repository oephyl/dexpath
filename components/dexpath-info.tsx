"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, ExternalLink } from "lucide-react"
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

  const contractAddress = "GmS9k9Zh1AuSBxHqVKTPd8NGoGU2vjCeNU1u6zLzpump"

  useEffect(() => {
    const interval = setInterval(() => {
      setTokenData((prev) => ({
        price: prev.price + (Math.random() - 0.5) * 0.001,
        change24h: prev.change24h + (Math.random() - 0.5) * 0.5,
        marketCap: prev.marketCap + (Math.random() - 0.5) * 10000,
        holders: prev.holders + Math.floor(Math.random() * 3),
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const handleCopy = () => {
    navigator.clipboard.writeText(contractAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="h-fit bg-secondary/30">
      <CardContent className="p-3 space-y-2 py-px px-6">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Image src="/images/ppx.png" alt="DEXPATH" width={32} height={32} className="rounded-full" />
            <div className="absolute -bottom-0.5 -right-0.5 rounded-full p-0.5 bg-black">
              <Image src="/images/solana-logo.png" alt="Solana" width={8} height={8} />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-primary">$DEXPATH</h3>
          </div>
        </div> 

        <div className="flex items-center gap-1 bg-background/50 rounded px-2 py-1">
          <code className="flex-1 text-[9px] font-mono truncate text-muted-foreground">{contractAddress}</code>
          <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={handleCopy}>
            <Copy className="h-1.5 w-1.5" />
          </Button>
        </div>

        <div className="flex gap-1">
          <Button variant="outline" size="sm" className="flex-1 h-6 text-[9px] bg-transparent" asChild>
            <a href="https://x.com/DexpathApp" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-2.5 w-2.5 mr-1" />X
            </a>
          </Button>
          <Button variant="outline" size="sm" className="flex-1 h-6 text-[9px] bg-transparent" asChild>
            <a href="https://discord.gg/kcUsPgEAqf" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-2.5 w-2.5 mr-1" />
              Discord
            </a>
          </Button>
          <Button variant="outline" size="sm" className="flex-1 h-6 text-[9px] bg-transparent" asChild>
            <a href="https://t.me/dexpathapp" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-2.5 w-2.5 mr-1" />
              Telegram
            </a>
          </Button>
        </div>

        <Button className="w-full h-7 bg-primary hover:bg-primary/90 text-black font-bold text-[10px]" asChild>
          <a
            href="https://pump.fun/coin/GmS9k9Zh1AuSBxHqVKTPd8NGoGU2vjCeNU1u6zLzpump"
            target="_blank"
            rel="noopener noreferrer"
          >
            BUY $DEXPATH
          </a>
        </Button>
      </CardContent>
    </Card>
  )
}
