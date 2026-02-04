"use client"

import { useState, useEffect, useRef } from "react"
import { TopNav } from "@/components/top-nav"
import { TokenTable } from "@/components/token-table"
import { TokenTrending } from "@/components/live-signal-feed"
import { DexpathInfo } from "@/components/dexpath-info"
import { ChevronsLeft, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { TokenRow } from "@/lib/mock"
import { FeaturedAdToken } from "@/components/featured-ad-token"
import { CreateAdDialog } from "@/components/create-ad-dialog"
import { Button } from "@/components/ui/button"
import { formatNumber } from "@/lib/format"
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

  type SearchToken = {
    address: string
    name?: string
    symbol?: string
    logo?: string
    price?: number
    marketCap?: number
    liquidity?: number
    volume24h?: number
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
    if (!searchOpen) return

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

    searchDebounceRef.current = window.setTimeout(async () => {
      const requestId = ++searchRequestIdRef.current
      setSearchLoading(true)
      setSearchError(null)

      try {
        const response = await fetch(`/api/mobula-fast-search?input=${encodeURIComponent(query)}`, {
          cache: "no-store",
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

                return {
                  address,
                  name: item?.name ?? item?.tokenName ?? item?.token_name ?? undefined,
                  symbol: item?.symbol ?? item?.tokenSymbol ?? item?.token_symbol ?? undefined,
                  logo: item?.logo ?? item?.icon ?? item?.image ?? item?.image_url ?? undefined,
                  price: Number(item?.price ?? item?.priceUsd ?? item?.price_usd ?? 0),
                  marketCap,
                  liquidity,
                  volume24h,
                  raw: item,
                }
              })
              .filter((item): item is SearchToken => item !== null)
          : []

        if (requestId === searchRequestIdRef.current) {
          setSearchResults(normalized)
        }
      } catch (error: any) {
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
                  <DialogContent className="max-w-3xl p-0 overflow-hidden">
                    <DialogTitle className="sr-only">Token search</DialogTitle>
                    <div className="border-b border-border p-4 space-y-3">
                      <div className="text-sm text-muted-foreground">Search by name, ticker, CA, KOL or X handle</div>
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
                    <div className="max-h-[420px] overflow-y-auto p-2">
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
                                    <TableHead className="sticky top-0 z-30 font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">
                                      MC
                                    </TableHead>
                                    <TableHead className="sticky top-0 z-30 font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">
                                      V
                                    </TableHead>
                                    <TableHead className="sticky top-0 z-30 font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">
                                      L
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
                                            <div className="text-[11px] sm:text-xs font-semibold truncate">
                                              {token.name || token.symbol || "Unknown"}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground truncate">
                                              {token.symbol || "???"}
                                            </div>
                                          </div>
                                        </div>
                                      </TableCell>
                                      <TableCell className="py-2 px-4 text-[10px] sm:text-xs text-muted-foreground">
                                        {formatMetric(token.marketCap)}
                                      </TableCell>
                                      <TableCell className="py-2 px-4 text-[10px] sm:text-xs text-muted-foreground">
                                        {formatMetric(token.volume24h)}
                                      </TableCell>
                                      <TableCell className="py-2 px-4 text-[10px] sm:text-xs text-muted-foreground">
                                        {formatMetric(token.liquidity)}
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
                                    <TableHead className="sticky top-0 z-30 font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">
                                      MC
                                    </TableHead>
                                    <TableHead className="sticky top-0 z-30 font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">
                                      V
                                    </TableHead>
                                    <TableHead className="sticky top-0 z-30 font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">
                                      L
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
                                            <div className="text-[11px] sm:text-xs font-semibold truncate">
                                              {token.name || token.symbol || "Unknown"}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground truncate">
                                              {token.symbol || "???"}
                                            </div>
                                          </div>
                                        </div>
                                      </TableCell>
                                      <TableCell className="py-2 px-4 text-[10px] sm:text-xs text-muted-foreground">
                                        {formatMetric(token.marketCap)}
                                      </TableCell>
                                      <TableCell className="py-2 px-4 text-[10px] sm:text-xs text-muted-foreground">
                                        {formatMetric(token.volume24h)}
                                      </TableCell>
                                      <TableCell className="py-2 px-4 text-[10px] sm:text-xs text-muted-foreground">
                                        {formatMetric(token.liquidity)}
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
