"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { TopNav } from "@/components/top-nav"
import { SignalTimeline } from "@/components/signal-timeline"
import { events as mockEvents } from "@/lib/mock"
import { formatPrice, formatMarketCap, formatNumber } from "@/lib/format"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Copy, Check } from "lucide-react"
import { SignalBadge } from "@/components/signal-badge"
import Image from "next/image"
import type { TokenRow } from "@/lib/mock"

export default function TokenDetailPage({ params }: { params: { address: string } }) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [token, setToken] = useState<TokenRow | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        console.log("[v0] Fetching token detail for address:", params.address)

        const cachedToken = localStorage.getItem(`token_${params.address}`)
        if (cachedToken) {
          console.log("[v0] Token found in localStorage")
          setToken(JSON.parse(cachedToken))
          setLoading(false)
          return
        }

        console.log("[v0] Token not in cache, fetching from API")
        const response = await fetch(`/api/token/${params.address}`)
        const data = await response.json()

        if (data.success && data.data) {
          console.log("[v0] Token data received from API")
          setToken(data.data)
          localStorage.setItem(`token_${params.address}`, JSON.stringify(data.data))
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
  }, [params.address])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <TopNav searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-background">
        <TopNav searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Token not found</p>
          <Button onClick={() => router.push("/")} className="mt-4">
            Go Home
          </Button>
        </div>
      </div>
    )
  }

  const tokenEvents = mockEvents.filter((e) => e.tokenAddress === token.address)

  const copyAddress = () => {
    navigator.clipboard.writeText(token.address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main className="container mx-auto px-4 py-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/")}
          className="mb-4 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Screener
        </Button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start gap-4 mb-3">
            <Image
              src={token.logo || "/placeholder.svg"}
              alt={token.symbol}
              width={64}
              height={64}
              className="rounded-full"
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-1">{token.name}</h1>
              <p className="text-lg text-muted-foreground">{token.symbol}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <code className="text-xs bg-secondary px-2 py-1 rounded font-mono text-muted-foreground">
              {token.address.slice(0, 8)}...{token.address.slice(-6)}
            </code>
            <Button variant="ghost" size="sm" onClick={copyAddress} className="h-7 w-7 p-0">
              {copied ? <Check className="h-1.5 w-1.5 text-primary" /> : <Copy className="h-1.5 w-1.5" />}
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {token.signals.map((signal, idx) => (
              <SignalBadge key={idx} type={signal} boostCount={token.boostCount} />
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground font-medium">Price</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold text-foreground">{formatPrice(token.price)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground font-medium">Market Cap</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold text-foreground">{formatMarketCap(token.mc)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground font-medium">Liquidity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold text-foreground">{formatNumber(token.liquidity)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground font-medium">Volume (24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold text-foreground">{formatNumber(token.volume24h)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Trade Buttons Section */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Trade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <a
                href={`https://trojan.app/token/${token.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Image src="/images/trojan.png" alt="Trojan" width={24} height={24} />
                  Trojan
                </Button>
              </a>
              <a
                href={`https://axion.trade/token/${token.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Image src="/images/axiom.png" alt="Axion" width={24} height={24} />
                  Axion
                </Button>
              </a>
              <a
                href={`https://gmgn.ai/sol/token/${token.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Image src="/images/gmgn.png" alt="GMGN" width={24} height={24} />
                  GMGN
                </Button>
              </a>
              <a
                href={`https://bonk.trade/token/${token.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Image src="/images/bonk.png" alt="Bonk" width={24} height={24} />
                  Bonk
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - Overview */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">5m Change</span>
                    <span
                      className={`text-sm font-semibold ${token.change5m >= 0 ? "text-green-500" : "text-red-500"}`}
                    >
                      {token.change5m >= 0 ? "+" : ""}
                      {token.change5m.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-muted-foreground">Last Updated</span>
                    <span className="text-sm text-foreground">{new Date(token.updatedAt).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right - Signal Timeline */}
          <div className="lg:col-span-1">
            <SignalTimeline events={tokenEvents} />
          </div>
        </div>
      </main>
    </div>
  )
}
