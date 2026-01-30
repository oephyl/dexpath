"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { TopNav } from "@/components/top-nav"
import { SignalTimeline } from "@/components/signal-timeline"
import { events as mockEvents } from "@/lib/mock"
import { formatPrice, formatMarketCap, formatNumber } from "@/lib/format"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Copy, Check, ExternalLink, TrendingUp, TrendingDown, Activity, Clock, DollarSign, BarChart3 } from "lucide-react"
import { SignalBadge } from "@/components/signal-badge"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import type { TokenRow } from "@/lib/mock"

export default function TokenDetailPage({ params }: { params: Promise<{ address: string }> }) {
  const router = useRouter()
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [token, setToken] = useState<TokenRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [resolvedParams, setResolvedParams] = useState<{ address: string } | null>(null)

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params
      setResolvedParams(resolved)
    }
    resolveParams()
  }, [params])

  useEffect(() => {
    if (!resolvedParams) return

    const fetchTokenData = async () => {
      try {
        console.log("[v0] Fetching token detail for address:", resolvedParams.address)

        // Try to find cached token with both address and mint
        let cachedToken = localStorage.getItem(`token_${resolvedParams.address}`)
        if (cachedToken) {
          console.log("[v0] Token found in localStorage with address key")
          const parsed = JSON.parse(cachedToken)
          console.log("[v0] Cached token data:", {
            address: parsed.address,
            mint: parsed.mint,
            creator: parsed.creator,
            name: parsed.name
          })
          setToken(parsed)
          setLoading(false)
          return
        }

        console.log("[v0] Token not in cache, fetching from API")
        const response = await fetch(`/api/token/${resolvedParams.address}`)
        const data = await response.json()

        console.log("[v0] API response:", {
          success: data.success,
          hasData: !!data.data,
          tokenData: data.data ? {
            address: data.data.address,
            mint: data.data.mint,
            creator: data.data.creator,
            name: data.data.name
          } : null
        })

        if (data.success && data.data) {
          console.log("[v0] Token data received from API")
          setToken(data.data)
          localStorage.setItem(`token_${resolvedParams.address}`, JSON.stringify(data.data))
          if (data.data.mint && data.data.mint !== resolvedParams.address) {
            localStorage.setItem(`token_${data.data.mint}`, JSON.stringify(data.data))
          }
        } else {
          console.log("[v0] Token not found in API")
          setToken(null)
        }
      } catch (error) {
        console.error("[v0] Error fetching token detail:", error)
        setToken(null)
      } finally {
        setLoading(false)
      }
    }

    fetchTokenData()
  }, [resolvedParams])

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(token?.address || "")
      toast({
        description: "Contract address copied!",
        duration: 2000
      })
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        description: "Failed to copy address",
        variant: "destructive",
        duration: 2000
      })
    }
  }

  const formatCreator = (address: string) => {
    return `${address.slice(0, 5)}...${address.slice(-5)}`
  }

  const formatMint = (address: string) => {
    return `${address.slice(0, 3)}...${address.slice(-5)}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
        <TopNav searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <div className="container mx-auto px-3 sm:px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-secondary/60 rounded-lg w-32"></div>
              <div className="bg-card/60 backdrop-blur-sm border border-border/60 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-16 w-16 bg-secondary/60 rounded-full"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-8 bg-secondary/60 rounded-lg w-48"></div>
                    <div className="h-5 bg-secondary/60 rounded-lg w-24"></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-20 bg-secondary/40 rounded-xl"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
        <TopNav searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <div className="container mx-auto px-3 sm:px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-card/60 backdrop-blur-sm border border-border/60 rounded-2xl p-8">
              <div className="w-16 h-16 bg-secondary/60 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Activity className="w-8 h-8 text-muted-foreground" />
              </div>
              <h1 className="text-xl font-semibold text-foreground mb-2">Token not found</h1>
              <p className="text-muted-foreground mb-6">The token address you're looking for doesn't exist or has been removed.</p>
              <Button onClick={() => router.push("/")} className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Screener
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const tokenEvents = mockEvents.filter((e) => e.tokenAddress === token.address)
  const priceChange = token.change5m || 0
  const isPositive = priceChange >= 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <TopNav searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main className="container mx-auto px-3 sm:px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Screener
          </Button>

          {/* Token Header Card */}
          <Card className="bg-card/80 backdrop-blur-xl border-border/40 shadow-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start gap-6 mb-8">
                <div className="flex items-start gap-4 flex-1">
                  <div className="relative flex-shrink-0">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border-2 border-primary/20 flex items-center justify-center overflow-hidden">
                      {token.logo && token.logo !== "/placeholder.svg" ? (
                        <Image
                          src={token.logo}
                          alt={token.symbol}
                          width={96}
                          height={96}
                          className="w-full h-full rounded-full object-cover"
                          onError={(e) => {
                            // Fallback to showing token symbol if image fails
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                          <span className="text-base sm:text-lg font-bold text-primary">
                            {token.symbol?.slice(0, 2) || "??"}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-card animate-pulse flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 flex-1 min-w-0">
                    <div>
                      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground leading-tight break-words">
                        {token.name}
                      </h1>
                      <p className="text-base sm:text-lg text-primary font-semibold mt-1">
                        ${token.symbol}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3 flex-wrap">
                      <code className="text-xs sm:text-sm bg-secondary/80 px-3 py-1.5 rounded-lg font-mono text-muted-foreground border border-border/60">
                        {token.address.slice(0, 6)}...{token.address.slice(-4)}
                      </code>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={copyAddress} 
                        className="h-8 w-8 p-0 hover:bg-secondary/80 rounded-lg"
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Creator & Mint Info */}
                {(token.creator || token.mint) && (
                  <div className="bg-secondary/30 rounded-xl p-4 border border-border/40 min-w-0 sm:max-w-xs">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Contract Details</h3>
                    <div className="space-y-3">
                      {token.creator && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">Creator</p>
                          <code className="text-xs bg-secondary/60 px-2 py-1 rounded font-mono text-foreground border border-border/50 block">
                            {formatCreator(token.creator)}
                          </code>
                        </div>
                      )}
                      {token.mint && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">Mint</p>
                          <code className="text-xs bg-secondary/60 px-2 py-1 rounded font-mono text-foreground border border-border/50 block">
                            {formatMint(token.mint)}
                          </code>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Signal Badges */}
              {token.signals.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {token.signals.map((signal, idx) => (
                    <SignalBadge key={idx} type={signal} boostCount={token.boostCount} />
                  ))}
                </div>
              )}

              {/* Price Section */}
              <div className="bg-gradient-to-r from-secondary/40 via-secondary/20 to-transparent rounded-2xl p-4 sm:p-5 border border-border/30">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground font-medium">Current Price</p>
                    <p className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                      ${formatPrice(token.price)}
                    </p>
                  </div>
                  <div className="text-left sm:text-right space-y-1">
                    <p className="text-sm text-muted-foreground font-medium">5m Change</p>
                    <div className="flex items-center gap-2 sm:justify-end">
                      {isPositive ? (
                        <TrendingUp className="w-5 h-5 text-green-500" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-500" />
                      )}
                      <span className={`text-lg sm:text-xl font-bold ${isPositive ? "text-green-500" : "text-red-500"}`}>
                        {isPositive ? "+" : ""}{priceChange.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card className="bg-card/70 backdrop-blur-sm border-border/50 hover:shadow-xl hover:border-border/80 transition-all duration-300">
              <CardContent className="p-2 sm:p-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 bg-blue-500/15 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-blue-400" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Market Cap</p>
                </div>
                <p className="text-lg sm:text-xl font-bold text-foreground">{formatMarketCap(token.mc)}</p>
              </CardContent>
            </Card>

            <Card className="bg-card/70 backdrop-blur-sm border-border/50 hover:shadow-xl hover:border-border/80 transition-all duration-300">
              <CardContent className="p-2 sm:p-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 bg-green-500/15 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-green-400" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Volume 24h</p>
                </div>
                <p className="text-lg sm:text-xl font-bold text-foreground">{formatNumber(token.volume24h)}</p>
              </CardContent>
            </Card>

            <Card className="bg-card/70 backdrop-blur-sm border-border/50 hover:shadow-xl hover:border-border/80 transition-all duration-300">
              <CardContent className="p-2 sm:p-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 bg-purple-500/15 rounded-lg flex items-center justify-center">
                    <Activity className="w-4 h-4 text-purple-400" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Liquidity</p>
                </div>
                <p className="text-lg sm:text-xl font-bold text-foreground">{formatNumber(token.liquidity)}</p>
              </CardContent>
            </Card>

            <Card className="bg-card/70 backdrop-blur-sm border-border/50 hover:shadow-xl hover:border-border/80 transition-all duration-300">
              <CardContent className="p-2 sm:p-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 bg-orange-500/15 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-orange-400" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Last Update</p>
                </div>
                <p className="text-base sm:text-lg font-semibold text-foreground">{new Date(token.updatedAt).toLocaleTimeString()}</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Trade Section */}
          <Card className="bg-card/60 backdrop-blur-sm border-border/60 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-primary" />
                Quick Trade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <a
                  href={`https://trojan.app/token/${token.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button variant="outline" className="w-full h-12 gap-2 hover:scale-105 transition-transform bg-transparent border-border/60">
                    <Image src="/images/trojan.png" alt="Trojan" width={20} height={20} className="w-5 h-5 rounded-full object-cover" />
                    <span className="font-medium text-sm">Trojan</span>
                  </Button>
                </a>
                <a
                  href={`https://axion.trade/token/${token.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button variant="outline" className="w-full h-12 gap-2 hover:scale-105 transition-transform bg-transparent border-border/60">
                    <Image src="/images/axiom.png" alt="Axion" width={20} height={20} className="w-5 h-5 rounded-full object-cover" />
                    <span className="font-medium text-sm">Axion</span>
                  </Button>
                </a>
                <a
                  href={`https://gmgn.ai/sol/token/${token.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button variant="outline" className="w-full h-12 gap-2 hover:scale-105 transition-transform bg-transparent border-border/60">
                    <Image src="/images/gmgn.png" alt="GMGN" width={20} height={20} className="w-5 h-5 rounded-full object-cover" />
                    <span className="font-medium text-sm">GMGN</span>
                  </Button>
                </a>
                <a
                  href={`https://bonk.trade/token/${token.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button variant="outline" className="w-full h-12 gap-2 hover:scale-105 transition-transform bg-transparent border-border/60">
                    <Image src="/images/bonk.png" alt="Bonk" width={20} height={20} className="w-5 h-5 rounded-full object-cover" />
                    <span className="font-medium text-sm">Bonk</span>
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Token Overview */}
            <div className="lg:col-span-2">
              <Card className="bg-card/70 backdrop-blur-xl border-border/50 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl flex items-center gap-3">
                    <div className="w-7 h-7 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Activity className="w-4 h-4 text-primary" />
                    </div>
                    Token Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-secondary/30 via-secondary/20 to-transparent rounded-2xl p-4 sm:p-5 border border-border/40">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-base sm:text-lg font-semibold text-foreground">Performance Metrics</h3>
                        <span className="text-sm text-muted-foreground bg-secondary/60 px-3 py-1 rounded-full">Last 5 minutes</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-base text-muted-foreground font-medium">Price Change</span>
                        <div className="flex items-center gap-3">
                          {isPositive ? (
                            <TrendingUp className="w-6 h-6 text-green-500" />
                          ) : (
                            <TrendingDown className="w-6 h-6 text-red-500" />
                          )}
                          <span className={`text-base sm:text-lg font-bold ${isPositive ? "text-green-500" : "text-red-500"}`}>
                            {isPositive ? "+" : ""}{priceChange.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {(token.creator || token.mint) && (
                      <div className="bg-gradient-to-r from-secondary/30 via-secondary/20 to-transparent rounded-2xl p-4 sm:p-5 border border-border/40">
                        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3">Contract Information</h3>
                        <div className="space-y-3">
                          {token.creator && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm sm:text-base text-muted-foreground font-medium">Creator Address</span>
                              <code className="text-sm bg-secondary/80 px-3 py-2 rounded-lg font-mono text-foreground border border-border/60">
                                {formatCreator(token.creator)}
                              </code>
                            </div>
                          )}
                          {token.mint && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm sm:text-base text-muted-foreground font-medium">Mint Address</span>
                              <code className="text-sm bg-secondary/80 px-3 py-2 rounded-lg font-mono text-foreground border border-border/60">
                                {formatMint(token.mint)}
                              </code>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Signal Timeline */}
            <div className="lg:col-span-1">
              <SignalTimeline events={tokenEvents} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
