"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import type { TokenRow } from "@/lib/mock"
import { useState, useEffect, useRef } from "react"
import { fetchTrendingTokens } from "@/lib/api"
import { Copy } from "lucide-react"

const mockTrendingTokens: TokenRow[] = [
  {
    id: "trend1",
    name: "Trending Doge",
    symbol: "TDOGE",
    logo: "/pepe-frog-crypto-logo.jpg",
    mc: 1250000,
    price: 0.00012,
    change5m: 45.2,
    change1h: 32.1,
    change24h: 128.5,
    volume24h: 850000,
    liquidity: 320000,
    address: "TrendAddr1",
    createdAt: new Date().toISOString(),
    updated: "just now",
    signals: [],
  },
  {
    id: "trend2",
    name: "Moon Shot",
    symbol: "MOON",
    logo: "/moon-dog-crypto-logo.jpg",
    mc: 890000,
    price: 0.00089,
    change5m: 38.7,
    change1h: 25.4,
    change24h: 95.2,
    volume24h: 620000,
    liquidity: 280000,
    address: "TrendAddr2",
    createdAt: new Date().toISOString(),
    updated: "just now",
    signals: [],
  },
  {
    id: "trend3",
    name: "Rocket Launch",
    symbol: "RCKT",
    logo: "/rocket-moon-crypto-logo.jpg",
    mc: 2100000,
    price: 0.00021,
    change5m: 52.3,
    change1h: 41.8,
    change24h: 167.9,
    volume24h: 1200000,
    liquidity: 450000,
    address: "TrendAddr3",
    createdAt: new Date().toISOString(),
    updated: "just now",
    signals: [],
  },
  {
    id: "trend4",
    name: "Diamond Hands",
    symbol: "DMNDS",
    logo: "/baby-dog-crypto-logo.jpg",
    mc: 750000,
    price: 0.000075,
    change5m: 29.6,
    change1h: 18.3,
    change24h: 72.4,
    volume24h: 520000,
    liquidity: 210000,
    address: "TrendAddr4",
    createdAt: new Date().toISOString(),
    updated: "just now",
    signals: [],
  },
  {
    id: "trend5",
    name: "Pump King",
    symbol: "PKING",
    logo: "/shiba-crown-crypto-logo.jpg",
    mc: 1680000,
    price: 0.000168,
    change5m: 41.2,
    change1h: 35.7,
    change24h: 145.8,
    volume24h: 980000,
    liquidity: 390000,
    address: "TrendAddr5",
    createdAt: new Date().toISOString(),
    updated: "just now",
    signals: [],
  },
]

export function TokenTrending() {
  const router = useRouter()
  const [trendingTokens, setTrendingTokens] = useState<TokenRow[]>(mockTrendingTokens)
  const [newAddresses, setNewAddresses] = useState<Set<string>>(new Set())
  const prevAddressesRef = useRef<Set<string>>(new Set())
  const [timeframe, setTimeframe] = useState<"24h" | "4h" | "1m">("24h")
  const [isRateLimited, setIsRateLimited] = useState(false)

  useEffect(() => {
    const loadTrendingTokens = async () => {
      if (isRateLimited) {
        console.log("[v0] Skipping trending fetch - rate limited")
        return
      }

      try {
        const tokens = await fetchTrendingTokens()
        if (tokens.length > 0) {
          setTrendingTokens(tokens)
          setIsRateLimited(false)
        }
      } catch (error: any) {
        console.error("[v0] Error loading trending tokens:", error)
        if (error.message?.includes("429") || error.message?.includes("Too Many Requests")) {
          console.log("[v0] Rate limited - using mock data and backing off")
          setIsRateLimited(true)
          setTrendingTokens(mockTrendingTokens)
          setTimeout(() => setIsRateLimited(false), 5 * 60 * 1000)
        }
      }
    }

    loadTrendingTokens()
    const interval = setInterval(loadTrendingTokens, 60000)

    return () => clearInterval(interval)
  }, [isRateLimited])

  useEffect(() => {
    const currentAddresses = new Set(trendingTokens.map((t) => t.address))
    const newlyAdded = new Set<string>()

    currentAddresses.forEach((addr) => {
      if (!prevAddressesRef.current.has(addr)) {
        newlyAdded.add(addr)
      }
    })

    if (newlyAdded.size > 0) {
      setNewAddresses(newlyAdded)
      const timer = setTimeout(() => {
        setNewAddresses(new Set())
      }, 1500)
      return () => clearTimeout(timer)
    }

    prevAddressesRef.current = currentAddresses
  }, [trendingTokens.map((t) => t.address).join(",")])

  const getTimeAgo = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return "just now"
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  const displayTokens = trendingTokens.slice(0, 5)

  const formatMC = (mc: number) => {
    if (mc >= 1_000_000) return `${(mc / 1_000_000).toFixed(1)}M`
    if (mc >= 1_000) return `${(mc / 1_000).toFixed(0)}K`
    return `${mc.toFixed(0)}`
  }

  return (
    <Card className="h-fit">
      <CardHeader className="pb-2 sm:pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm sm:text-base">Token Trending</CardTitle>
          <div className="flex gap-1">
            {["24h", "4h", "1m"].map((tf) => (
              <Badge
                key={tf}
                variant={timeframe === tf ? "default" : "outline"}
                className="cursor-pointer text-[9px] sm:text-[10px] px-1.5 py-0.5 h-5"
                onClick={() => setTimeframe(tf as "24h" | "4h" | "1m")}
              >
                {tf}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-1.5 sm:space-y-2">
        {displayTokens.map((token) => (
          <Card
            key={token.address}
            className={`border-primary/20 bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer h-9 ${
              newAddresses.has(token.address) ? "animate-slide-in" : ""
            }`}
            onClick={() => router.push(`/token/${token.address}`)}
          >
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
                    <div className="font-bold text-[9px] truncate uppercase leading-tight max-w-[70px]">
                      {token.symbol}
                    </div>
                    <div className="text-[8px] text-muted-foreground font-medium leading-tight flex items-center gap-0.5">
                      MCAP {formatMC(token.mc)}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-2.5 w-2.5 p-0 hover:bg-primary/20 ml-0.5"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigator.clipboard.writeText(token.address)
                        }}
                        title="Copy CA"
                      >
                        <Copy className="h-1.5 w-1.5 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                </div>
                <span
                  className={`font-bold text-[10px] sm:text-xs px-2 ${
                    token.change5m >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {token.change5m >= 0 ? "+" : ""}
                  {token.change5m.toFixed(1)}%
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  )
}
