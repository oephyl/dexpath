"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
import type { TokenRow } from "@/lib/mock"
import { fetchPumpFunTokens } from "@/lib/api"

export function FeaturedAdToken({ index = 0 }: { index?: number }) {
  const [token, setToken] = useState<TokenRow | null>(null)

  useEffect(() => {
    const loadFeaturedToken = async () => {
      const tokens = await fetchPumpFunTokens()
      // Get different token for each card based on index
      if (tokens.length > index) {
        setToken(tokens[index])
      }
    }

    loadFeaturedToken()

    // Refresh every 30 seconds
    const interval = setInterval(loadFeaturedToken, 30000)
    return () => clearInterval(interval)
  }, [index])

  if (!token) return null

  const formatMC = (mc: number) => {
    if (mc >= 1_000_000) return `${(mc / 1_000_000).toFixed(0)}M`
    if (mc >= 1_000) return `${(mc / 1_000).toFixed(0)}K`
    return `${mc.toFixed(0)}`
  }

  return (
    <Card className="border-primary/20 bg-secondary/30 hover:bg-secondary/50 transition-colors relative min-w-[180px] lg:min-w-0 lg:w-full flex-shrink-0 h-9">
      <CardContent className="p-0 h-full flex items-center px-2">
        <div className="flex items-center justify-between gap-2 w-full">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <Image
              src={token.logo || "/placeholder.svg"}
              alt={token.symbol}
              width={24}
              height={24}
              className="rounded-full flex-shrink-0 object-cover"
            />
            <div className="flex flex-col flex-1 min-w-0">
              <div className="font-bold text-[9px] truncate uppercase leading-tight max-w-[60px]">{token.name}</div>
              <div className="text-[8px] text-muted-foreground font-medium leading-tight flex items-center gap-0.5">
                MCAP {formatMC(token.mc)}
                <Button
                  size="sm"
                  variant="ghost"
                  className="size-5 p-0 hover:bg-primary/20 ml-0.5"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigator.clipboard.writeText(token.address)
                  }}
                  title="Copy CA"
                >
                  <Copy className="size-2.5 text-muted-foreground" />
                </Button>
              </div>
            </div>
          </div>
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90 text-black font-bold text-[9px] h-6 px-3"
            onClick={() => window.open(`/token/${token.address}`, "_blank")}
          >
            BUY
          </Button>
        </div>
        <div className="absolute top-0.5 right-1.5 text-[7px] text-muted-foreground font-medium">Ads</div>
      </CardContent>
    </Card>
  )
}
