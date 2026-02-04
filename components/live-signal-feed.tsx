"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import type { TokenRow } from "@/lib/mock"
import { useState, useEffect, useRef } from "react"
import { fetchTrendingTokens } from "@/lib/api"
import { ChevronsLeft, ChevronsRight, Copy } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

// No mock tokens; data comes from API

export function TokenTrending({
  sidebarHidden,
  onToggleSidebar,
}: {
  sidebarHidden?: boolean
  onToggleSidebar?: () => void
}) {
  const router = useRouter()
  const [trendingTokens, setTrendingTokens] = useState<TokenRow[]>([])
  const [newAddresses, setNewAddresses] = useState<Set<string>>(new Set())
  const prevAddressesRef = useRef<Set<string>>(new Set())
  const [timeframe, setTimeframe] = useState<"24h" | "1h" | "5m">("24h")
  const [isRateLimited, setIsRateLimited] = useState(false)

  useEffect(() => {
    if (sidebarHidden) return

    const loadTrendingTokens = async () => {
      if (isRateLimited) {
        console.log("[v0] Skipping trending fetch - rate limited")
        return
      }

      try {
        const tokens = await fetchTrendingTokens(timeframe)
        if (tokens.length > 0) {
          setTrendingTokens(tokens)
          setIsRateLimited(false)
        }
      } catch (error: any) {
        console.error("[v0] Error loading trending tokens:", error)
        if (error.message?.includes("429") || error.message?.includes("Too Many Requests")) {
          console.log("[v0] Rate limited - using mock data and backing off")
          setIsRateLimited(true)
          setTimeout(() => setIsRateLimited(false), 5 * 60 * 1000)
        }
      }
    }

    loadTrendingTokens()
    const interval = setInterval(loadTrendingTokens, 10000)

    return () => clearInterval(interval)
  }, [isRateLimited, timeframe, sidebarHidden])

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

  const copyToClipboard = async (text: string, message: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(message)
    } catch (error) {
      console.error("[v0] Copy failed:", error)
      toast.error("Copy failed")
    }
  }

  return (
    <Card className="h-fit">
      <CardHeader className="pb-2 sm:pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {typeof onToggleSidebar === "function" && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleSidebar()
                }}
                aria-label={sidebarHidden ? "Show right sidebar" : "Hide right sidebar"}
                title={sidebarHidden ? "Show" : "Hide"}
              >
                {sidebarHidden ? <ChevronsLeft className="h-4 w-4" /> : <ChevronsRight className="h-4 w-4" />}
              </Button>
            )}
            <CardTitle className="text-sm sm:text-base">Token Trending</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            {["24h", "1h", "5m"].map((tf) => (
              <Badge
                key={tf}
                variant={timeframe === tf ? "default" : "outline"}
                className="cursor-pointer text-[9px] sm:text-[10px] px-1.5 py-0.5 h-5"
                onClick={() => setTimeframe(tf as "24h" | "1h" | "5m")}
              >
                {tf}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-1.5 sm:space-y-2">
        {displayTokens.length === 0 ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={`trend-skel-${i}`} className="border-primary/20 bg-secondary/30 h-9">
              <CardContent className="p-0 h-full flex items-center px-2">
                <div className="flex items-center justify-between gap-2 w-full">
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <div className="flex flex-col flex-1 min-w-0">
                      <Skeleton className="h-3 w-12" />
                      <Skeleton className="h-2 w-20 mt-1" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-12" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          displayTokens.map((token) => (
          <Card
            key={token.address}
            className={`border-primary/20 bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer h-9 ${
              newAddresses.has(token.address) ? "animate-slide-in" : ""
            }`}
            onClick={() => {
              try {
                localStorage.setItem(`token_${token.address}`, JSON.stringify(token))
              } catch (e) {
                console.warn("[v0] Failed to persist token in localStorage", e)
              }
              router.push(`/token/${token.address}`)
            }}
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
                          copyToClipboard(token.address, "Copied contract address")
                        }}
                        title="Copy CA"
                      >
                        <Copy className="h-1.5 w-1.5 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                </div>
                {(() => {
                  const change = timeframe === "5m" ? token.change5m : token.change1h
                  return (
                    <span
                      className={`font-bold text-[10px] sm:text-xs px-2 ${change >= 0 ? "text-green-500" : "text-red-500"}`}
                    >
                      {change >= 0 ? "+" : ""}
                      {change.toFixed(1)}%
                    </span>
                  )
                })()}
              </div>
            </CardContent>
          </Card>
          ))
        )}
      </CardContent>
    </Card>
  )
}
