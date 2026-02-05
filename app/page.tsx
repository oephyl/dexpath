"use client"

import { useState, useEffect, useRef } from "react"
import { TopNav } from "@/components/top-nav"
import { TokenTable } from "@/components/token-table"
import { TokenTrending } from "@/components/live-signal-feed"
import { DexpathInfo } from "@/components/dexpath-info"
import { ChevronsLeft, Search } from "lucide-react"
import { Copy } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { TokenRow } from "@/lib/mock"
import { FeaturedAdToken } from "@/components/featured-ad-token"
import { CreateAdDialog } from "@/components/create-ad-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCount, formatNumber } from "@/lib/format"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function Home() {
  const router = useRouter()
  const [tokens, setTokens] = useState<TokenRow[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [rightSidebarHidden, setRightSidebarHidden] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<SearchToken[]>([])
  const [historyTokens, setHistoryTokens] = useState<SearchToken[]>([])
  const searchDebounceRef = useRef<number | null>(null)
  const searchRequestIdRef = useRef(0)
  const searchAbortRef = useRef<AbortController | null>(null)
  const searchCacheRef = useRef<Map<string, { ts: number; data: SearchToken[] }>>(new Map())
  const SEARCH_CACHE_TTL = 60_000

  type SearchToken = {
    address: string
    name?: string
    symbol?: string
    logo?: string
    price?: number
    marketCap?: number
    liquidity?: number
    volume24h?: number
    createdAt?: string
    bondingPercentage?: number
    exchangeName?: string
    exchangeLogo?: string
    snipersCount?: number
    bundlersCount?: number
    insidersCount?: number
    smartTradersCount?: number
    proTradersCount?: number
    freshTradersCount?: number
    raw?: any
  }

  const handleSearchFocus = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        setSearchQuery(text)
      }
    } catch (err) {
      // Clipboard access denied or not available
    }
  }

  const formatMetric = (value?: number) => (Number.isFinite(value) ? formatNumber(value as number) : "-")

  const pickNumber = (source: any, keys: string[]) => {
    for (const key of keys) {
      const value = key.split(".").reduce((acc, part) => (acc ? acc[part] : undefined), source)
      const num = Number(value)
      if (Number.isFinite(num)) return num
    }
    return undefined
  }

  const pickString = (source: any, keys: string[]) => {
    for (const key of keys) {
      const value = key.split(".").reduce((acc, part) => (acc ? acc[part] : undefined), source)
      if (typeof value === "string" && value.trim().length > 0) return value.trim()
    }
    return undefined
  }

  const normalizeDate = (value: unknown) => {
    if (value === undefined || value === null) return undefined
    if (typeof value === "number" && Number.isFinite(value)) {
      const ms = value < 1_000_000_000_000 ? value * 1000 : value
      const date = new Date(ms)
      return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
    }
    if (typeof value === "string") {
      const trimmed = value.trim()
      if (!trimmed) return undefined
      const numeric = Number(trimmed)
      if (Number.isFinite(numeric)) {
        const ms = numeric < 1_000_000_000_000 ? numeric * 1000 : numeric
        const date = new Date(ms)
        return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
      }
      const ms = Date.parse(trimmed)
      if (!Number.isFinite(ms)) return undefined
      return new Date(ms).toISOString()
    }
    return undefined
  }

  const formatAge = (createdAt?: string) => {
    if (!createdAt) return "-"
    const ms = Date.parse(createdAt)
    if (!Number.isFinite(ms)) return "-"
    const diff = Date.now() - ms
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return "just now"
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h`
    return `${Math.floor(hours / 24)}d`
  }

  const formatBonding = (value?: number) => {
    if (typeof value !== "number" || !Number.isFinite(value)) return "-"
    const pct = value <= 1 ? value * 100 : value
    return `${Math.max(0, Math.min(100, Math.round(pct)))}%`
  }

  const renderExchangeBadge = (token: SearchToken) => {
    if (!token.exchangeName && !token.exchangeLogo) return null
    return (
      <Badge variant="secondary" className="h-5 px-2 text-[9px] font-medium gap-1">
        {token.exchangeLogo && (
          <img
            src={token.exchangeLogo}
            alt={token.exchangeName || "Exchange"}
            className="h-3 w-3 rounded-sm object-cover"
          />
        )}
        <span>{token.exchangeName || "Exchange"}</span>
      </Badge>
    )
  }

  const copyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address)
    } catch (error) {
      console.warn("[v0] Failed to copy address:", error)
    }
  }

  const formatAddress = (address: string) => {
    if (!address) return "-"
    if (address.length <= 10) return address
    return `${address.slice(0, 4)}…${address.slice(-4)}`
  }

  const renderTokenMeta = (token: SearchToken) => {
    const age = token.createdAt ? formatAge(token.createdAt) : "-"
    const bondedRaw =
      token.raw?.bonded ??
      token.raw?.isBonded ??
      token.raw?.data?.bonded ??
      token.raw?.data?.isBonded
    const isBonded = bondedRaw === true || bondedRaw === "true" || bondedRaw === 1 || bondedRaw === "1"
    const bondingRaw = isBonded
      ? 100
      : typeof token.bondingPercentage === "number"
        ? token.bondingPercentage
        : pickNumber(token.raw, [
            "bondingPercentage",
            "bonding_percent",
            "bondingProgress",
            "bonding_progress",
            "data.bondingPercentage",
            "data.bonding_percent",
            "token.bondingPercentage",
          ])
    const bonding = typeof bondingRaw === "number" ? formatBonding(bondingRaw) : "-"
    const showAge = age !== "-"
    const showBonding = bonding !== "-"

    const countItems = [
      { label: "Snipers", value: token.snipersCount },
      { label: "Bundlers", value: token.bundlersCount },
      { label: "Insiders", value: token.insidersCount },
      { label: "Smart", value: token.smartTradersCount },
      { label: "Pro", value: token.proTradersCount },
      { label: "Fresh", value: token.freshTradersCount },
    ].filter((item) => typeof item.value === "number")

    const metricItems = [
      { label: "MC", value: token.marketCap },
      { label: "V", value: token.volume24h },
      { label: "L", value: token.liquidity },
    ].filter((item) => typeof item.value === "number")

    const dexListed =
      token.raw?.dexscreenerListed ??
      token.raw?.dexScreenerListed ??
      token.raw?.data?.dexscreenerListed ??
      token.raw?.data?.dexScreenerListed
    const dexAdPaid =
      token.raw?.dexscreenerAdPaid ??
      token.raw?.dexScreenerAdPaid ??
      token.raw?.data?.dexscreenerAdPaid ??
      token.raw?.data?.dexScreenerAdPaid
    const dexSocialPaid =
      token.raw?.dexscreenerSocialPaid ??
      token.raw?.dexScreenerSocialPaid ??
      token.raw?.data?.dexscreenerSocialPaid ??
      token.raw?.data?.dexScreenerSocialPaid
    const dexBoosted =
      token.raw?.dexscreenerBoosted ??
      token.raw?.dexScreenerBoosted ??
      token.raw?.data?.dexscreenerBoosted ??
      token.raw?.data?.dexScreenerBoosted
    const boostedAmountRaw =
      token.raw?.dexscreenerBoostedAmount ??
      token.raw?.dexScreenerBoostedAmount ??
      token.raw?.data?.dexscreenerBoostedAmount ??
      token.raw?.data?.dexScreenerBoostedAmount
    const boostedAmount = typeof boostedAmountRaw === "string" ? boostedAmountRaw : Number.isFinite(Number(boostedAmountRaw)) ? `${boostedAmountRaw}` : undefined

    const dexBadges: Array<{ key: string; label: string; variant?: "secondary" | "default" | "outline" }> = []
    if (dexListed === true || dexListed === "true") dexBadges.push({ key: "dex-listed", label: "Dex Listed" })
    if (dexAdPaid === true || dexAdPaid === "true") dexBadges.push({ key: "dex-ad", label: "Dex Ad Paid" })
    if (dexSocialPaid === true || dexSocialPaid === "true") dexBadges.push({ key: "dex-social", label: "Dex Social Paid" })
    if (dexBoosted === true || dexBoosted === "true") dexBadges.push({ key: "dex-boosted", label: "Dex Boosted" })

    if (!showAge && !showBonding && countItems.length === 0 && metricItems.length === 0 && dexBadges.length === 0) return null

    return (
      <div className="mt-1 flex flex-wrap items-center gap-1.5">
        {metricItems.map((item) => (
          <Badge key={item.label} variant="secondary" className="h-5 px-2 text-[9px] font-medium">
            {item.label} {formatMetric(item.value as number)}
          </Badge>
        ))}
        {dexBadges.map((item) => (
          <Badge key={item.key} variant="secondary" className="h-5 px-2 text-[9px] font-medium">
            ✅ {item.label}
          </Badge>
        ))}
        {(dexBoosted === true || dexBoosted === "true") && boostedAmount && (
          <Badge className="h-5 px-2 text-[9px] font-medium bg-yellow-400/90 text-black hover:bg-yellow-400">
            ⚡ {boostedAmount}X
          </Badge>
        )}
        {showAge && (
          <Badge variant="secondary" className="h-5 px-2 text-[9px] font-medium">
            ⏱️ Age {age}
          </Badge>
        )}
        {showBonding && (
          <Badge variant="secondary" className="h-5 px-2 text-[9px] font-medium">
            🧩 Bonding {bonding}
          </Badge>
        )}
        {countItems.map((item) => (
          <Badge key={item.label} variant="secondary" className="h-5 px-2 text-[9px] font-medium">
            {item.label === "Snipers"
              ? "🎯"
              : item.label === "Bundlers"
                ? "📦"
                : item.label === "Insiders"
                  ? "🕵️"
                  : item.label === "Smart"
                    ? "🧠"
                    : item.label === "Pro"
                      ? "⭐"
                      : "🆕"} {item.label} {formatCount(item.value as number)}
          </Badge>
        ))}
      </div>
    )
  }

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const stored = localStorage.getItem("search-history-tokens")
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setHistoryTokens(parsed)
        }
      }
    } catch (error) {
      console.warn("[v0] Failed to read search history:", error)
    }
  }, [])

  useEffect(() => {
    if (!searchOpen) {
      if (searchAbortRef.current) {
        searchAbortRef.current.abort()
      }
      return
    }

    const query = searchQuery.trim()
    if (query.length < 2) {
      setSearchResults([])
      setSearchError(null)
      setSearchLoading(false)
      return
    }

    if (searchDebounceRef.current) {
      window.clearTimeout(searchDebounceRef.current)
    }

    const cacheKey = query.toLowerCase()
    const cached = searchCacheRef.current.get(cacheKey)
    if (cached && Date.now() - cached.ts < SEARCH_CACHE_TTL) {
      if (searchAbortRef.current) {
        searchAbortRef.current.abort()
      }
      setSearchResults(cached.data)
      setSearchLoading(false)
      setSearchError(null)
      return
    }

    searchDebounceRef.current = window.setTimeout(async () => {
      const requestId = ++searchRequestIdRef.current
      if (searchAbortRef.current) {
        searchAbortRef.current.abort()
      }
      const controller = new AbortController()
      searchAbortRef.current = controller
      setSearchLoading(true)
      setSearchError(null)

      try {
        const response = await fetch(`/api/mobula-fast-search?input=${encodeURIComponent(query)}`, {
          cache: "no-store",
          signal: controller.signal,
        })

        if (!response.ok) {
          const errorText = await response.text().catch(() => "")
          console.warn("[v0] Search failed:", response.status, errorText)
          if (requestId === searchRequestIdRef.current) {
            setSearchError("Failed to fetch tokens")
            setSearchResults([])
          }
          return
        }

        const data = await response.json()
        const list =
          data?.data?.tokens ??
          data?.data?.results ??
          data?.tokens ??
          data?.results ??
          data?.data ??
          []

        const normalized: SearchToken[] = Array.isArray(list)
          ? list
              .map((item: any): SearchToken | null => {
                const address =
                  item?.address ?? item?.tokenAddress ?? item?.token_address ?? item?.id ?? item?.mint
                if (!address) return null
                const marketCap = pickNumber(item, ["marketCapUSD", "marketcapUSD", "market_cap_usd"])
                const volume24h = pickNumber(item, ["volume24usd", "volume24Usd", "volume_24h_usd"])
                const liquidity = pickNumber(item, ["liquidityUSD", "liquidityUsd", "liquidity_usd"])
                const createdAt =
                  normalizeDate(item?.createdAt) ??
                  normalizeDate(item?.created_at) ??
                  normalizeDate(item?.createdAtMs) ??
                  normalizeDate(item?.createdAtTs) ??
                  normalizeDate(item?.created_at_ts)

                const bondingPercentage = pickNumber(item, [
                  "bondingPercentage",
                  "bonding_percent",
                  "bondingProgress",
                  "bonding_progress",
                ])

                const exchangeName =
                  pickString(item, ["exchange.name", "exchangeName", "exchange_name"]) ??
                  pickString(item?.exchange, ["name"])
                const exchangeLogo =
                  pickString(item, ["exchange.logo", "exchangeLogo", "exchange_logo"]) ??
                  pickString(item?.exchange, ["logo"])

                const snipersCount = pickNumber(item, ["snipersCount", "snipers_count", "snipers"])
                const bundlersCount = pickNumber(item, ["bundlersCount", "bundlers_count", "bundlers"])
                const insidersCount = pickNumber(item, ["insidersCount", "insiders_count", "insiders"])
                const smartTradersCount = pickNumber(item, ["smartTradersCount", "smart_traders_count", "smartTraders"])
                const proTradersCount = pickNumber(item, ["proTradersCount", "pro_traders_count", "proTraders"])
                const freshTradersCount = pickNumber(item, ["freshTradersCount", "fresh_traders_count", "freshTraders"])

                return {
                  address,
                  name: item?.name ?? item?.tokenName ?? item?.token_name ?? undefined,
                  symbol: item?.symbol ?? item?.tokenSymbol ?? item?.token_symbol ?? undefined,
                  logo: item?.logo ?? item?.icon ?? item?.image ?? item?.image_url ?? undefined,
                  price: Number(item?.price ?? item?.priceUsd ?? item?.price_usd ?? 0),
                  marketCap,
                  liquidity,
                  volume24h,
                  createdAt,
                  bondingPercentage,
                  exchangeName: exchangeName ?? undefined,
                  exchangeLogo: exchangeLogo ?? undefined,
                  snipersCount,
                  bundlersCount,
                  insidersCount,
                  smartTradersCount,
                  proTradersCount,
                  freshTradersCount,
                  raw: item,
                }
              })
              .filter((item): item is SearchToken => item !== null)
          : []

        if (requestId === searchRequestIdRef.current) {
          searchCacheRef.current.set(cacheKey, { ts: Date.now(), data: normalized })
          setSearchResults(normalized)
        }
      } catch (error: any) {
        if (error?.name === "AbortError") return
        if (requestId === searchRequestIdRef.current) {
          console.error("[v0] Search failed:", error)
          setSearchError("Failed to fetch tokens")
          setSearchResults([])
        }
      } finally {
        if (requestId === searchRequestIdRef.current) {
          setSearchLoading(false)
        }
      }
    }, 300)

    return () => {
      if (searchDebounceRef.current) {
        window.clearTimeout(searchDebounceRef.current)
      }
      if (searchAbortRef.current) {
        searchAbortRef.current.abort()
      }
    }
  }, [searchQuery, searchOpen])

  const handleSelectToken = (token: SearchToken) => {
    const storedToken: TokenRow & { raw?: any } = {
      address: token.address,
      name: token.name || "Unknown",
      symbol: token.symbol || "???",
      logo: token.logo || "/placeholder.svg?height=32&width=32",
      price: token.price ?? 0,
      change5m: 0,
      change1h: 0,
      mc: token.marketCap ?? 0,
      liquidity: token.liquidity ?? 0,
      volume24h: token.volume24h ?? 0,
      updatedAt: new Date().toISOString(),
      signals: [],
      boostCount: undefined,
      launchpad: "-",
      mint: token.address,
      creator: undefined,
      raw: token.raw,
    }

    try {
      localStorage.setItem(`token_${token.address}`, JSON.stringify(storedToken))
      const nextHistory = [token, ...historyTokens.filter((t) => t.address !== token.address)].slice(0, 8)
      setHistoryTokens(nextHistory)
      localStorage.setItem("search-history-tokens", JSON.stringify(nextHistory))
    } catch (error) {
      console.warn("[v0] Failed to store selected token:", error)
    }

    setSearchQuery("")
    setSearchOpen(false)
    router.push(`/token/${token.address}`)
  }

  // New Coins data is fetched inside TokenTable via Mobula.

  return (
    <div className="min-h-screen bg-background">
      <TopNav />

      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 max-w-[1600px]">
        {/* Desktop handle when the right sidebar is hidden */}
        {rightSidebarHidden && (
          <div className="hidden lg:block fixed top-24 right-3 sm:right-4 z-50">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-9 w-9 p-0"
              onClick={() => setRightSidebarHidden(false)}
              aria-label="Show right sidebar"
              title="Show"
            >
              <ChevronsLeft className="h-5 w-5" />
            </Button>
          </div>
        )}

        <div
          className={`grid grid-cols-1 gap-4 sm:gap-6 ${
            rightSidebarHidden ? "lg:grid-cols-1" : "lg:grid-cols-[1fr_380px]"
          }`}
        >
          {/* Main Content */}
          <div className="space-y-3 sm:space-y-4 min-w-0">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search tokens..."
                  value={searchQuery}
                  readOnly
                  onClick={() => {
                    setSearchOpen(true)
                    handleSearchFocus()
                  }}
                  className="w-full pl-10 text-sm h-10 sm:h-11"
                />
                <Dialog
                  open={searchOpen}
                  onOpenChange={(open) => {
                    setSearchOpen(open)
                    if (!open) {
                      setSearchQuery("")
                      setSearchResults([])
                      setSearchError(null)
                    }
                  }}
                >
                  <DialogContent className="w-[calc(100vw-3rem)] max-w-none h-[calc(100vh-8rem)] max-h-none p-0 overflow-hidden rounded-xl flex flex-col">
                    <DialogTitle className="sr-only">Token search</DialogTitle>
                    <div className="border-b border-border p-4 space-y-3">
                      <div className="text-sm text-muted-foreground">Search by name or address</div>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="Paste token address or type keyword"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          autoFocus
                          className="w-full pl-10 text-sm h-10"
                        />
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2">
                      {searchQuery.trim().length === 0 ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between px-2">
                            <div className="text-xs text-muted-foreground">History tokens</div>
                          </div>
                          {historyTokens.length > 0 ? (
                            <div className="overflow-hidden rounded-lg border border-border">
                              <Table>
                                <TableHeader className="sticky top-0 bg-background z-20 shadow-sm">
                                  <TableRow className="hover:bg-transparent border-border">
                                    <TableHead className="sticky top-0 z-30 font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">
                                      Token
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {historyTokens.map((token) => (
                                    <TableRow
                                      key={token.address}
                                      className="border-border hover:bg-secondary/50 cursor-pointer"
                                      onClick={() => handleSelectToken(token)}
                                    >
                                      <TableCell className="py-2 px-4">
                                        <div className="flex items-center gap-2 min-w-0">
                                          <img
                                            src={token.logo || "/placeholder.svg"}
                                            alt={token.symbol || token.name || "Token"}
                                            className="h-8 w-8 rounded-full object-cover"
                                          />
                                          <div className="min-w-0">
                                            <div className="text-[11px] sm:text-xs font-semibold truncate flex items-center gap-1">
                                              <span className="truncate">{token.name || token.symbol || "Unknown"}</span>
                                              {renderExchangeBadge(token)}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground truncate">
                                              {token.symbol || "???"}
                                            </div>
                                            <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                                              <span className="truncate max-w-[220px] sm:max-w-[260px]">
                                                {formatAddress(token.address)}
                                              </span>
                                              <button
                                                type="button"
                                                className="inline-flex items-center justify-center rounded-md border border-border/60 bg-secondary/40 p-1 hover:bg-secondary"
                                                onClick={(e) => {
                                                  e.stopPropagation()
                                                  copyAddress(token.address)
                                                }}
                                                aria-label="Copy address"
                                                title="Copy address"
                                              >
                                                <Copy className="h-3 w-3" />
                                              </button>
                                            </div>
                                            {renderTokenMeta(token)}
                                          </div>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          ) : (
                            <div className="py-4 text-center text-xs text-muted-foreground">No history yet</div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between px-2">
                            <div className="text-xs text-muted-foreground">Search results</div>
                            {searchLoading && <div className="text-[11px] text-muted-foreground">Searching...</div>}
                          </div>
                          {searchError && (
                            <div className="py-4 text-center text-xs text-muted-foreground">{searchError}</div>
                          )}
                          {!searchLoading && !searchError && searchResults.length === 0 && (
                            <div className="py-4 text-center text-xs text-muted-foreground">No tokens found</div>
                          )}
                          {searchResults.length > 0 && (
                            <div className="overflow-hidden rounded-lg border border-border">
                              <Table>
                                <TableHeader className="sticky top-0 bg-background z-20 shadow-sm">
                                  <TableRow className="hover:bg-transparent border-border">
                                    <TableHead className="sticky top-0 z-30 font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">
                                      Token
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {searchResults.map((token) => (
                                    <TableRow
                                      key={token.address}
                                      className="border-border hover:bg-secondary/50 cursor-pointer"
                                      onClick={() => handleSelectToken(token)}
                                    >
                                      <TableCell className="py-2 px-4">
                                        <div className="flex items-center gap-2 min-w-0">
                                          <img
                                            src={token.logo || "/placeholder.svg"}
                                            alt={token.symbol || token.name || "Token"}
                                            className="h-8 w-8 rounded-full object-cover"
                                          />
                                          <div className="min-w-0">
                                            <div className="text-[11px] sm:text-xs font-semibold truncate flex items-center gap-1">
                                              <span className="truncate">{token.name || token.symbol || "Unknown"}</span>
                                              {renderExchangeBadge(token)}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground truncate">
                                              {token.symbol || "???"}
                                            </div>
                                            <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                                              <span className="truncate max-w-[220px] sm:max-w-[260px]">
                                                {formatAddress(token.address)}
                                              </span>
                                              <button
                                                type="button"
                                                className="inline-flex items-center justify-center rounded-md border border-border/60 bg-secondary/40 p-1 hover:bg-secondary"
                                                onClick={(e) => {
                                                  e.stopPropagation()
                                                  copyAddress(token.address)
                                                }}
                                                aria-label="Copy address"
                                                title="Copy address"
                                              >
                                                <Copy className="h-3 w-3" />
                                              </button>
                                            </div>
                                            {renderTokenMeta(token)}
                                          </div>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <CreateAdDialog />
            </div>

            <div className="flex gap-2 overflow-x-auto hide-scrollbar lg:grid lg:grid-cols-6 lg:gap-2 lg:overflow-visible">
              <FeaturedAdToken index={0} />
              <FeaturedAdToken index={1} />
              <FeaturedAdToken index={2} />
              <FeaturedAdToken index={3} />
              <FeaturedAdToken index={4} />
              <FeaturedAdToken index={5} />
            </div>

            {/* Token Table */}
            <TokenTable tokens={tokens} searchQuery={searchQuery} />
          </div>

          {/* Sidebar */}
          {!rightSidebarHidden && (
            <div className="sticky top-20 h-fit hidden lg:block">
              <div className="relative space-y-4 sm:space-y-6">
                <TokenTrending
                  sidebarHidden={rightSidebarHidden}
                  onToggleSidebar={() => setRightSidebarHidden((v) => !v)}
                />
                <DexpathInfo />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
