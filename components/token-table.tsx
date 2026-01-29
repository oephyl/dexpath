"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { SignalBadge } from "./signal-badge"
import { formatMarketCap, formatPrice, formatNumber } from "@/lib/format"
import type { TokenRow } from "@/lib/mock"
import Image from "next/image"
import { Copy, Target, Rocket, Construction, CheckCircle2, Heart, Repeat2, MessageCircle, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { fetchCTOTokens } from "@/lib/api"

interface TokenTableProps {
  tokens: TokenRow[]
  newestTokenAddress?: string | null
  searchQuery?: string
  onTokenClick?: (token: TokenRow) => void
}

interface KOLCall {
  id: string
  kolName: string
  kolHandle: string
  kolAvatar: string
  kolFollowers: number
  kolVerified: boolean
  token: {
    address: string
    name: string
    symbol: string
    logo: string
    price: number
    change5m: number
    mc: number
  }
  postContent: string
  postUrl: string
  postTime: string
  engagement: {
    likes: number
    retweets: number
    replies: number
  }
}

interface PrelaunchProject {
  id: string
  tokenName: string
  tokenSymbol: string
  tokenLogo: string
  devName: string
  devWallet: string
  description: string
  launchDate: string
}

const mockKOLCalls: KOLCall[] = [
  {
    id: "kol_001",
    kolName: "Crypto Alpha",
    kolHandle: "@cryptoalpha",
    kolAvatar: "/placeholder.svg?height=48&width=48",
    kolFollowers: 125000,
    kolVerified: true,
    token: {
      address: "0xa1b2c3d4e5f6",
      name: "PepeMax",
      symbol: "PMAX",
      logo: "/pepe-frog-crypto-logo.jpg",
      price: 0.00042,
      change5m: 24.5,
      mc: 850000,
    },
    postContent:
      "🚀 Just discovered $PMAX - strong fundamentals and growing community. This could be the next 100x gem! DYOR but I'm bullish AF. #Solana #DeFi",
    postUrl: "https://twitter.com/cryptoalpha/status/123456",
    postTime: new Date(Date.now() - 15 * 60000).toISOString(),
    engagement: {
      likes: 523,
      retweets: 187,
      replies: 94,
    },
  },
  {
    id: "kol_002",
    kolName: "SOL Whale",
    kolHandle: "@solwhale",
    kolAvatar: "/placeholder.svg?height=48&width=48",
    kolFollowers: 89000,
    kolVerified: true,
    token: {
      address: "0x1a2b3c4d5e6f",
      name: "ElonDoge",
      symbol: "EDOGE",
      logo: "/doge-rocket-crypto-logo.jpg",
      price: 0.0089,
      change5m: 145.8,
      mc: 5600000,
    },
    postContent:
      "$EDOGE is absolutely mooning right now! +145% in 5 minutes. Team just delivered on roadmap. This is NOT financial advice but... 🌙",
    postUrl: "https://twitter.com/solwhale/status/123457",
    postTime: new Date(Date.now() - 5 * 60000).toISOString(),
    engagement: {
      likes: 892,
      retweets: 341,
      replies: 156,
    },
  },
  {
    id: "kol_003",
    kolName: "DeFi Hunter",
    kolHandle: "@defihunter",
    kolAvatar: "/placeholder.svg?height=48&width=48",
    kolFollowers: 210000,
    kolVerified: true,
    token: {
      address: "0x7e6d5c4b3a2f",
      name: "BullRun",
      symbol: "BULL",
      logo: "/bull-charge-crypto-logo.jpg",
      price: 0.0892,
      change5m: 167.4,
      mc: 8200000,
    },
    postContent:
      "Thread 🧵 on why $BULL is my top pick for this cycle:\n\n1. Strong dev team\n2. Innovative tokenomics\n3. Growing ecosystem\n4. Early entry opportunity\n\nNFA, DYOR. LFG! 🔥",
    postUrl: "https://twitter.com/defihunter/status/123458",
    postTime: new Date(Date.now() - 25 * 60000).toISOString(),
    engagement: {
      likes: 1247,
      retweets: 498,
      replies: 203,
    },
  },
]

const mockPrelaunchProjects: PrelaunchProject[] = [
  {
    id: "pre_001",
    tokenName: "SolanaAI",
    tokenSymbol: "SOLAI",
    tokenLogo: "/placeholder.svg?height=40&width=40",
    devName: "CryptoBuilder",
    devWallet: "7xKXw...pM9nQ",
    description: "Revolutionary AI-powered trading bot on Solana with automated market making capabilities",
    launchDate: "2026-01-20T14:00:00Z",
  },
  {
    id: "pre_002",
    tokenName: "MetaDoge",
    tokenSymbol: "MDOGE",
    tokenLogo: "/placeholder.svg?height=40&width=40",
    devName: "DogeDevs",
    devWallet: "9yHXt...qL2pR",
    description: "Next-generation meme coin with utility features and NFT marketplace integration",
    launchDate: "2026-01-21T16:30:00Z",
  },
  {
    id: "pre_003",
    tokenName: "PumpMax",
    tokenSymbol: "PMAX",
    tokenLogo: "/placeholder.svg?height=40&width=40",
    devName: "SolDevMaster",
    devWallet: "4kZQr...vN8mT",
    description: "Community-driven token with innovative tokenomics and staking rewards",
    launchDate: "2026-01-22T12:00:00Z",
  },
]

export function TokenTable({ tokens: initialTokens, newestTokenAddress, searchQuery, onTokenClick }: TokenTableProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<string>("new")
  const [launchpadFilter, setLaunchpadFilter] = useState<string>("pumpfun")
  const [boostFilter, setBoostFilter] = useState<string>("all")
  const [ctoTokens, setCtoTokens] = useState<TokenRow[]>([])
  const [loadingCTO, setLoadingCTO] = useState(false)
  const [ctoRateLimited, setCtoRateLimited] = useState(false)
  const [showPrelaunchForm, setShowPrelaunchForm] = useState(false)
  const [prelaunchForm, setPrelaunchForm] = useState({
    tokenName: "",
    tokenSymbol: "",
    devName: "",
    devWallet: "",
    description: "",
    launchDate: "",
  })

  const [trackingData, setTrackingData] = useState<Record<string, { copyCount: number; snipeCount: number }>>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("prelaunch-tracking")
        return saved ? JSON.parse(saved) : {}
      } catch (error) {
        console.error("[v0] Error parsing tracking data:", error)
        return {}
      }
    }
    return {}
  })

  const [selectedPrelaunch, setSelectedPrelaunch] = useState<any>(null)
  const [isPrelaunchModalOpen, setIsPrelaunchModalOpen] = useState(false)

  const seenCTOTokens = useRef<Set<string>>(new Set())
  const [ctoTokensWithTime, setCtoTokensWithTime] = useState<TokenRow[]>([])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("prelaunch-tracking", JSON.stringify(trackingData))
    }
  }, [trackingData])

  useEffect(() => {
    if (activeTab === "cto") {
      let isInitialLoad = true

      const loadCTO = async () => {
        if (ctoRateLimited) {
          console.log("[v0] Skipping CTO fetch - rate limited")
          return
        }

        console.log("[v0] Loading CTO tokens...")
        if (isInitialLoad) {
          setLoadingCTO(true)
        }
        try {
          const tokens = await fetchCTOTokens()
          console.log("[v0] Loaded CTO tokens:", tokens.length)

          if ((tokens as any).rateLimit) {
            console.log("[v0] CTO API is rate limited")
            setCtoRateLimited(true)
            setTimeout(
              () => {
                console.log("[v0] Resetting CTO rate limit status")
                setCtoRateLimited(false)
              },
              5 * 60 * 1000,
            )
            return
          }

          const now = new Date()
          const tokensWithTime = tokens.map((token) => {
            // If token already seen, preserve its original timestamp
            const existingToken = ctoTokensWithTime.find((t) => t.address === token.address)
            if (existingToken) {
              return existingToken
            }

            // New token - add discovery timestamp
            if (!seenCTOTokens.current.has(token.address)) {
              seenCTOTokens.current.add(token.address)
              return {
                ...token,
                timestamp: now.toISOString(),
                updated: now.toISOString(),
              }
            }

            return token
          })

          setCtoTokensWithTime(tokensWithTime)
          setCtoTokens(tokensWithTime)
        } catch (error) {
          console.error("[v0] Error loading CTO tokens:", error)
        } finally {
          if (isInitialLoad) {
            setLoadingCTO(false)
            isInitialLoad = false
          }
        }
      }

      loadCTO() // Initial load

      // Poll every 10 seconds for new CTO data
      const interval = setInterval(loadCTO, 10000)
      return () => clearInterval(interval)
    }
  }, [activeTab, ctoTokensWithTime, ctoRateLimited])

  const handleCopyWallet = (wallet: string) => {
    navigator.clipboard.writeText(wallet)
    setTrackingData((prev) => ({
      ...prev,
      [wallet]: {
        copyCount: (prev[wallet]?.copyCount || 0) + 1,
        snipeCount: prev[wallet]?.snipeCount || 0,
      },
    }))
    localStorage.setItem(
      `prelaunch_${selectedPrelaunch?.id}_copy`,
      (Number.parseInt(localStorage.getItem(`prelaunch_${selectedPrelaunch?.id}_copy`) || "0") + 1).toString(),
    )
  }

  const handleSnipeClick = (wallet: string) => {
    setTrackingData((prev) => ({
      ...prev,
      [wallet]: {
        copyCount: prev[wallet]?.copyCount || 0,
        snipeCount: (prev[wallet]?.snipeCount || 0) + 1,
      },
    }))
    localStorage.setItem(
      `prelaunch_${selectedPrelaunch?.id}_snipe`,
      (Number.parseInt(localStorage.getItem(`prelaunch_${selectedPrelaunch?.id}_snipe`) || "0") + 1).toString(),
    )
    window.open(`https://t.me/solana_trojanbot?start=snipe_${wallet}`, "_blank")
  }

  const getTimeAgo = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return "just now"
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  const openBuyLink = (platform: string, address: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const links: Record<string, string> = {
      trojan: `https://t.me/solana_trojanbot?start=${address}`,
      axion: `https://axion.trade/swap?token=${address}`,
      gmgn: `https://gmgn.ai/sol/token/${address}`,
      bonk: `https://www.bonkbot.io/swap/${address}`,
    }
    window.open(links[platform] || "#", "_blank")
  }

  const handleTokenClick = (token: TokenRow) => {
    localStorage.setItem(`token_${token.address}`, JSON.stringify(token))
    if (onTokenClick) {
      onTokenClick(token)
    } else {
      router.push(`/token/${token.address}`)
    }
  }

  const handlePrelaunchClick = (project: any) => {
    setSelectedPrelaunch(project)
    setIsPrelaunchModalOpen(true)
  }

  const filteredTokens = initialTokens.filter((token) => {
    if (activeTab === "new") {
      if (launchpadFilter === "all") return true
      return token.launchpad === launchpadFilter
    }

    if (activeTab === "boost") {
      // This filter logic needs to be defined based on how boostFilter is used
      // For now, assuming it might filter based on a 'boostLevel' or similar property on TokenRow
      // Example: return token.boostLevel === boostFilter;
      return true // Placeholder
    }

    if (activeTab === "cto") {
      return ctoTokens.some((ct) => ct.address === token.address)
    }

    // Add other tab filtering logic here if necessary
    return true // Default to showing all if no specific filter matches
  })

  return (
    <Card>
      <CardHeader className="pb-px">
        {/* Reordered tabs: New Coins, New Dexpaid, New Boost, CTO, New Ads, Signals, KOL, Prelaunch */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-1.5 sm:gap-2">
          <Button
            variant={activeTab === "new" ? "default" : "outline"}
            size="sm"
            className="text-[10px] sm:text-xs py-1 h-7 sm:h-8"
            onClick={() => setActiveTab("new")}
          >
            New Coins
          </Button>
          <Button
            variant={activeTab === "dexpaid" ? "default" : "outline"}
            size="sm"
            className="text-[10px] sm:text-xs py-1 h-7 sm:h-8"
            onClick={() => setActiveTab("dexpaid")}
          >
            New Dexpaid
          </Button>
          <Button
            variant={activeTab === "boost" ? "default" : "outline"}
            size="sm"
            className="text-[10px] sm:text-xs py-1 h-7 sm:h-8"
            onClick={() => setActiveTab("boost")}
          >
            New Boost
          </Button>
          <Button
            variant={activeTab === "cto" ? "default" : "outline"}
            size="sm"
            className="text-[10px] sm:text-xs py-1 h-7 sm:h-8"
            onClick={() => setActiveTab("cto")}
          >
            CTO
          </Button>
          <Button
            variant={activeTab === "ads" ? "default" : "outline"}
            size="sm"
            className="text-[10px] sm:text-xs py-1 h-7 sm:h-8"
            onClick={() => setActiveTab("ads")}
          >
            New Ads
          </Button>
          <Button
            variant={activeTab === "signals" ? "default" : "outline"}
            size="sm"
            className="text-[10px] sm:text-xs py-1 h-7 sm:h-8"
            onClick={() => setActiveTab("signals")}
          >
            Signals
          </Button>
          <Button
            variant={activeTab === "kol" ? "default" : "outline"}
            size="sm"
            className="text-[10px] sm:text-xs py-1 h-7 sm:h-8"
            onClick={() => setActiveTab("kol")}
          >
            KOL
          </Button>
          <Button
            variant={activeTab === "prelaunch" ? "default" : "outline"}
            size="sm"
            className="text-[10px] sm:text-xs py-1 h-7 sm:h-8 flex items-center gap-1"
            onClick={() => setActiveTab("prelaunch")}
          >
            Prelaunch
            <Badge variant="secondary" className="text-[7px] sm:text-[8px] px-0.5 sm:px-1 py-0 h-3 leading-none">
              soon
            </Badge>
          </Button>
        </div>

        {(activeTab === "new" ||
          activeTab === "dexpaid" ||
          activeTab === "boost" ||
          activeTab === "cto" ||
          activeTab === "ads" ||
          activeTab === "signals") && (
          <div className={activeTab === "boost" ? "mt-2 flex justify-between items-center" : "mt-2 flex justify-end"}>
            {activeTab === "boost" && (
              <div className="flex flex-wrap gap-2">
                {["all", "10x", "30x", "50x", "100x", "500x"].map((filter) => (
                  <Badge
                    key={filter}
                    variant={boostFilter === filter ? "default" : "outline"}
                    className={`cursor-pointer text-xs sm:text-sm ${
                      boostFilter === filter ? "bg-amber-500 text-black hover:bg-amber-600" : "hover:bg-secondary"
                    }`}
                    onClick={() => setBoostFilter(filter)}
                  >
                    {filter}
                  </Badge>
                ))}
              </div>
            )}
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-black font-semibold text-xs h-8"
              onClick={() => {
                const tabNames: Record<string, string> = {
                  new: "New Coins",
                  dexpaid: "New Dexpaid",
                  boost: "New Boost",
                  cto: "CTO",
                  ads: "New Ads",
                  signals: "Signals",
                }
                alert(`Snipe ${tabNames[activeTab]} - Feature coming soon!`)
              }}
            >
              <Target className="h-3 w-3 mr-1" />
              Snipe{" "}
              {activeTab === "new"
                ? "New Coins"
                : activeTab === "dexpaid"
                  ? "New Dexpaid"
                  : activeTab === "boost"
                    ? "New Boost"
                    : activeTab === "cto"
                      ? "CTO"
                      : activeTab === "ads"
                        ? "New Ads"
                        : "Signals"}
            </Button>
          </div>
        )}

        {/* New Coins filter tabs */}
        {activeTab === "new" && (
          <div className="flex flex-wrap gap-2 mt-2">
            {["all", "pumpfun", "bags", "heaven", "bonk", "boop", "moonit", "belive", "raydium", "orca", "meteora"].map(
              (filter) => {
                const launchpadIcons: Record<string, string> = {
                  pumpfun: "/images/pumpfun.png",
                  bags: "/images/bags.png",
                  heaven: "/images/heven.png",
                  bonk: "/images/bonk.png",
                  boop: "/images/boop.png",
                  moonit: "/images/moonit.png",
                  belive: "/images/belive.png",
                  raydium: "/images/jup.png",
                  orca: "/images/orca.png",
                  meteora: "/images/meteora.png",
                }

                return (
                  <Badge
                    key={filter}
                    variant={launchpadFilter === filter ? "default" : "outline"}
                    className={`cursor-pointer capitalize text-xs sm:text-sm ${
                      launchpadFilter === filter
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "hover:bg-secondary"
                    }`}
                    onClick={() => setLaunchpadFilter(filter)}
                  >
                    <div className="flex items-center gap-1.5">
                      {launchpadIcons[filter] && (
                        <Image
                          src={launchpadIcons[filter] || "/placeholder.svg"}
                          alt={filter}
                          width={14}
                          height={14}
                          className="rounded"
                        />
                      )}
                      <span>{filter}</span>
                    </div>
                  </Badge>
                )
              },
            )}
          </div>
        )}

        {/* New Boost filter tabs */}
        {activeTab === "boost" && <></>}
      </CardHeader>
      <CardContent className="p-0">
        {activeTab === "kol" ? (
          <div className="overflow-y-auto h-[600px] px-3 space-y-2 py-3">
            {mockKOLCalls.map((call) => (
              <div
                key={call.id}
                className="p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 border border-border transition-colors"
              >
                {/* Influencer & Token Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Image
                      src={call.kolAvatar || "/placeholder.svg"}
                      alt={call.kolName}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-xs sm:text-sm">{call.kolName}</span>
                        {call.kolVerified && <CheckCircle2 className="h-3 w-3 text-primary" />}
                      </div>
                      <p className="text-[10px] sm:text-sm text-muted-foreground">
                        {call.kolHandle} · {formatNumber(call.kolFollowers)} followers
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Image
                      src={call.token.logo || "/placeholder.svg"}
                      alt={call.token.symbol}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                    <span className="font-semibold text-xs sm:text-sm">${call.token.symbol}</span>
                  </div>
                </div>

                {/* Post Content */}
                <p className="text-xs sm:text-sm text-foreground/90 mb-2 line-clamp-2">{call.postContent}</p>

                {/* Token Info & Engagement */}
                <div className="flex items-center justify-between text-[10px] sm:text-sm text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <span className="font-mono">${formatPrice(call.token.price)}</span>
                    <span className={`font-semibold ${call.token.change5m >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {call.token.change5m >= 0 ? "+" : ""}
                      {call.token.change5m.toFixed(1)}%
                    </span>
                    <span>MC: {formatMarketCap(call.token.mc)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-0.5">
                      <Heart className="h-3 w-3" /> {formatNumber(call.engagement.likes)}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Repeat2 className="h-3 w-3" /> {formatNumber(call.engagement.retweets)}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <MessageCircle className="h-3 w-3" /> {formatNumber(call.engagement.replies)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-7 text-[10px] sm:text-sm bg-transparent"
                    onClick={() => window.open(call.postUrl, "_blank")}
                  >
                    View Post
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    className="flex-1 h-7 text-[10px] sm:text-sm"
                    onClick={() => (window.location.href = `/token/${call.token.address}`)}
                  >
                    Token Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === "prelaunch" ? (
          <>
            <div className="flex justify-end px-4 py-2 border-b border-border">
              <Dialog open={showPrelaunchForm} onOpenChange={setShowPrelaunchForm}>
                <DialogTrigger asChild>
                  <Button size="sm" className="h-7 text-xs gap-1">
                    <Plus className="h-3 w-3" />
                    Create New
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Prelaunch Project</DialogTitle>
                    <DialogDescription>
                      Submit a new prelaunch token project. Only Dev Wallet and Description are required.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tokenName" className="text-xs">
                          Token Name (Optional)
                        </Label>
                        <Input
                          id="tokenName"
                          placeholder="e.g. MoonRocket"
                          value={prelaunchForm.tokenName}
                          onChange={(e) => setPrelaunchForm({ ...prelaunchForm, tokenName: e.target.value })}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tokenSymbol" className="text-xs">
                          Symbol (Optional)
                        </Label>
                        <Input
                          id="tokenSymbol"
                          placeholder="e.g. MOON"
                          value={prelaunchForm.tokenSymbol}
                          onChange={(e) => setPrelaunchForm({ ...prelaunchForm, tokenSymbol: e.target.value })}
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="devName" className="text-xs">
                        Dev Name (Optional)
                      </Label>
                      <Input
                        id="devName"
                        placeholder="e.g. CryptoBuilder"
                        value={prelaunchForm.devName}
                        onChange={(e) => setPrelaunchForm({ ...prelaunchForm, devName: e.target.value })}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="devWallet" className="text-xs">
                        Dev Wallet Address <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="devWallet"
                        placeholder="Solana wallet address"
                        value={prelaunchForm.devWallet}
                        onChange={(e) => setPrelaunchForm({ ...prelaunchForm, devWallet: e.target.value })}
                        className="h-8 text-xs"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-xs">
                        Description <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="Brief description of the project"
                        value={prelaunchForm.description}
                        onChange={(e) => setPrelaunchForm({ ...prelaunchForm, description: e.target.value })}
                        className="text-xs min-h-[80px]"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="launchDate" className="text-xs">
                        Launch Date (Optional)
                      </Label>
                      <Input
                        id="launchDate"
                        type="date"
                        value={prelaunchForm.launchDate}
                        onChange={(e) => setPrelaunchForm({ ...prelaunchForm, launchDate: e.target.value })}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="bg-secondary/50 p-3 rounded-lg border border-border">
                      <p className="text-[10px] text-muted-foreground">
                        Fields marked with <span className="text-red-500">*</span> are required. Other fields can be
                        left empty if unknown.
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" size="sm" onClick={() => setShowPrelaunchForm(false)}>
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      disabled={!prelaunchForm.devWallet || !prelaunchForm.description}
                      onClick={() => {
                        console.log("Submitting prelaunch:", prelaunchForm)
                        setShowPrelaunchForm(false)
                        setPrelaunchForm({
                          tokenName: "",
                          tokenSymbol: "",
                          devName: "",
                          devWallet: "",
                          description: "",
                          launchDate: "",
                        })
                      }}
                    >
                      Submit
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="h-[600px] overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-20 shadow-sm">
                  <TableRow className="hover:bg-transparent border-border">
                    <TableHead className="font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">
                      Token
                    </TableHead>
                    <TableHead className="font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">
                      Dev Name
                    </TableHead>
                    <TableHead className="font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">
                      Dev Wallet
                    </TableHead>
                    <TableHead className="font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">
                      Description
                    </TableHead>
                    <TableHead className="font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">
                      Interest
                    </TableHead>
                    <TableHead className="font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">
                      Launch
                    </TableHead>
                    <TableHead className="font-semibold text-foreground text-center text-[10px] sm:text-xs bg-background px-4">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPrelaunchProjects.map((project) => {
                    const tracking = trackingData[project.devWallet] || { copyCount: 0, snipeCount: 0 }

                    return (
                      <TableRow
                        key={project.id}
                        className="border-border hover:bg-secondary/50 cursor-pointer"
                        onClick={() => handlePrelaunchClick(project)}
                      >
                        <TableCell className="py-2 px-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-[10px] sm:text-xs">{project.tokenName}</span>
                            <span className="text-[9px] sm:text-xs text-muted-foreground">{project.tokenSymbol}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm py-2 px-4">{project.devName}</TableCell>
                        <TableCell className="py-2 px-4">
                          <div className="flex items-center gap-1">
                            <code className="bg-secondary/50 px-1.5 py-0.5 rounded text-[9px] sm:text-xs font-mono">
                              {project.devWallet}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCopyWallet(project.devWallet)
                              }}
                            >
                              <Copy className="h-1.5 w-1.5" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm py-2 px-4 max-w-xs">
                          <div className="line-clamp-2">{project.description}</div>
                        </TableCell>
                        <TableCell className="text-center py-2 px-4">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center justify-center gap-1 text-[9px] sm:text-xs text-muted-foreground">
                              <Copy className="h-2 w-2" />
                              <span>{tracking.copyCount}</span>
                            </div>
                            <div className="flex items-center justify-center gap-1 text-[9px] sm:text-xs text-amber-500">
                              <Target className="h-3 w-3" />
                              <span>{tracking.snipeCount}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-2 px-4">
                          <Badge variant="secondary" className="text-[9px] sm:text-xs px-2 py-0.5">
                            {new Date(project.launchDate).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center py-2 px-4">
                          <Button
                            size="sm"
                            variant="default"
                            className="h-6 px-2 text-[9px] sm:text-xs bg-amber-500 hover:bg-amber-600 gap-1"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSnipeClick(project.devWallet)
                            }}
                          >
                            <Target className="h-3 w-3" />
                            Snipe
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </>
        ) : activeTab === "cto" ? (
          loadingCTO ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <Construction className="h-8 w-8 mx-auto mb-2" />
              Loading Community Takeovers...
            </div>
          ) : ctoTokens.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <Construction className="h-8 w-8 mx-auto mb-2" />
              No Community Takeovers found
            </div>
          ) : ctoRateLimited ? (
            <div className="flex flex-col items-center justify-center h-[600px] space-y-4">
              <Construction className="h-16 w-16 text-red-500 animate-pulse" />
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-red-500">Rate Limited</h3>
                <p className="text-muted-foreground max-w-md">
                  We've been rate limited by the CTO API. Please try again in a few minutes.
                </p>
              </div>
            </div>
          ) : (
            <div className="max-h-[600px] overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-20 shadow-sm">
                  <TableRow className="hover:bg-transparent border-border">
                    <TableHead className="font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">
                      Token
                    </TableHead>
                    <TableHead className="font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">
                      MC
                    </TableHead>
                    <TableHead className="font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">
                      Price
                    </TableHead>
                    <TableHead className="font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">
                      5m
                    </TableHead>
                    <TableHead className="font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">
                      Vol(24h)
                    </TableHead>
                    <TableHead className="font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">
                      Signals
                    </TableHead>
                    <TableHead className="font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">
                      Updated
                    </TableHead>
                    <TableHead className="font-semibold text-foreground text-center text-[10px] sm:text-xs bg-background px-4">
                      Buy
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ctoTokens.map((token) => (
                    <TableRow
                      key={token.address}
                      className="border-border hover:bg-secondary/50 cursor-pointer"
                      onClick={() => {
                        if (onTokenClick) {
                          onTokenClick(token)
                        } else {
                          localStorage.setItem(`token_${token.address}`, JSON.stringify(token))
                          router.push(`/token/${token.address}`)
                        }
                      }}
                    >
                      <TableCell className="py-2 px-4">
                        <div className="flex items-center gap-2">
                          <Image
                            src={token.logo || "/placeholder.svg"}
                            alt={token.symbol}
                            width={24}
                            height={24}
                            className="rounded-full object-cover flex-shrink-0"
                          />
                          <div className="flex flex-col">
                            <span className="font-medium text-[9px] sm:text-[10px] truncate max-w-[120px]">
                              {token.name}
                            </span>
                            <div className="flex items-center gap-1">
                              <span className="text-muted-foreground text-[8px] sm:text-[9px]">{token.symbol}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto p-0 hover:bg-transparent"
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
                      </TableCell>
                      <TableCell className="text-right font-mono text-[9px] sm:text-[10px] py-2 px-4">
                        {formatMarketCap(token.mc)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-[9px] sm:text-[10px] py-2 px-4">
                        {formatPrice(token.price)}
                      </TableCell>
                      <TableCell className="text-right py-2 px-4">
                        <span
                          className={`font-semibold text-[9px] sm:text-[10px] ${
                            token.change5m >= 0 ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {token.change5m >= 0 ? "+" : ""}
                          {token.change5m.toFixed(2)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-[9px] sm:text-[10px] py-2 px-4">
                        ${formatNumber(token.volume24h)}
                      </TableCell>
                      <TableCell className="py-2 px-4">
                        <div className="flex gap-1 flex-wrap">
                          {token.signals.slice(0, 3).map((signal, index) => (
                            <SignalBadge key={index} type={signal} boostCount={token.boostCount} />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-[9px] sm:text-[10px] py-2 px-4">
                        {new Date(token.updatedAt).toLocaleTimeString()}
                      </TableCell>
                      <TableCell className="text-center py-2 px-4">
                        <div className="flex justify-center gap-1">
                          {[
                            { name: "Trojan", img: "/images/trojan.png" },
                            { name: "Axion", img: "/images/axiom.png" },
                            { name: "GMGN", img: "/images/gmgn.png" },
                            { name: "Bonk", img: "/images/bonk.png" },
                          ].map((platform) => (
                            <Button
                              key={platform.name}
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-primary/20"
                              onClick={(e) => {
                                e.stopPropagation()
                                window.open(`https://${platform.name.toLowerCase()}.com`, "_blank")
                              }}
                              title={`Buy on ${platform.name}`}
                            >
                              <Image
                                src={platform.img || "/placeholder.svg"}
                                alt={platform.name}
                                width={16}
                                height={16}
                              />
                            </Button>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )
        ) : (
          <>
            {/* Empty states for non-Pumpfun launchpads */}
            {activeTab === "new" &&
            launchpadFilter !== "all" &&
            launchpadFilter !== "pumpfun" &&
            filteredTokens.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[600px] space-y-4">
                <Construction className="h-16 w-16 text-muted-foreground/50" />
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">Coming Soon</h3>
                  <p className="text-muted-foreground max-w-md">
                    {launchpadFilter.charAt(0).toUpperCase() + launchpadFilter.slice(1)} integration is currently under
                    development.
                    <br />
                    Check back soon for updates!
                  </p>
                  <Badge variant="secondary" className="mt-4">
                    Under Building
                  </Badge>
                </div>
              </div>
            ) : (
              <>
                <div className="h-[600px] overflow-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-20 shadow-sm">
                      <TableRow className="hover:bg-transparent border-border">
                        <TableHead className="font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">
                          Token
                        </TableHead>
                        <TableHead className="font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">
                          MC
                        </TableHead>
                        <TableHead className="font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">
                          Price
                        </TableHead>
                        <TableHead className="font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">
                          5m
                        </TableHead>
                        <TableHead className="font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">
                          Vol(24h)
                        </TableHead>
                        <TableHead className="font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">
                          Signals
                        </TableHead>
                        <TableHead className="font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">
                          Updated
                        </TableHead>
                        <TableHead className="font-semibold text-foreground text-[10px] sm:text-xs bg-background text-center px-4">
                          Buy
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTokens.map((token) => (
                        <TableRow
                          key={token.address}
                          onClick={() => handleTokenClick(token)}
                          className={`cursor-pointer hover:bg-secondary/50 transition-colors border-border ${
                            newestTokenAddress === token.address ? "animate-slide-in" : ""
                          }`}
                        >
                          <TableCell className="py-2 px-4">
                            <div className="flex items-center gap-2">
                              <Image
                                src={token.logo || "/placeholder.svg"}
                                alt={token.symbol}
                                width={28}
                                height={28}
                                className="rounded-full object-cover"
                              />
                              <div className="flex flex-col">
                                <span className="font-semibold text-foreground text-[10px] sm:text-xs truncate max-w-[120px]">
                                  {token.name}
                                </span>
                                <div className="flex items-center gap-1">
                                  <span className="text-[9px] sm:text-xs text-muted-foreground">{token.symbol}</span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-3 w-3 p-0 hover:bg-primary/20"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      navigator.clipboard.writeText(token.address)
                                    }}
                                    title="Copy Contract Address"
                                  >
                                    <Copy className="h-1.5 w-1.5 text-muted-foreground" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-mono text-[10px] sm:text-xs py-2 px-4">
                            {formatMarketCap(token.mc)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-[10px] sm:text-xs py-2 px-4">
                            {formatPrice(token.price)}
                          </TableCell>
                          <TableCell className="text-right py-2 px-4">
                            <span
                              className={`font-semibold text-[10px] sm:text-xs ${token.change5m >= 0 ? "text-green-500" : "text-red-500"}`}
                            >
                              {token.change5m >= 0 ? "+" : ""}
                              {token.change5m.toFixed(1)}%
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-mono text-[10px] sm:text-xs py-2 px-4">
                            {formatNumber(token.volume24h)}
                          </TableCell>
                          <TableCell className="py-2 px-4">
                            <div className="flex flex-wrap gap-1">
                              {token.signals.slice(0, 5).map((signal, idx) => (
                                <SignalBadge
                                  key={idx}
                                  type={signal}
                                  size="sm"
                                  iconOnly
                                  boostCount={signal === "DEXBOOST_PAID" ? token.boostCount : undefined}
                                />
                              ))}
                              {token.signals.length > 5 && (
                                <span className="text-[9px] sm:text-xs text-muted-foreground">
                                  +{token.signals.length - 5}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-[9px] sm:text-xs text-muted-foreground py-2 px-4">
                            {getTimeAgo(token.updatedAt)}
                          </TableCell>
                          <TableCell className="py-2 px-4">
                            <div className="flex gap-1 justify-center">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 hover:bg-primary/20"
                                onClick={(e) => openBuyLink("trojan", token.address, e)}
                                title="Buy on Trojan"
                              >
                                <Image
                                  src="/images/trojan.png"
                                  alt="Trojan"
                                  width={16}
                                  height={16}
                                  className="rounded"
                                />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 hover:bg-primary/20"
                                onClick={(e) => openBuyLink("axion", token.address, e)}
                                title="Buy on Axion"
                              >
                                <Image src="/images/axiom.png" alt="Axion" width={16} height={16} className="rounded" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 hover:bg-primary/20"
                                onClick={(e) => openBuyLink("gmgn", token.address, e)}
                                title="Buy on GMGN"
                              >
                                <Image src="/images/gmgn.png" alt="GMGN" width={16} height={16} className="rounded" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 hover:bg-primary/20"
                                onClick={(e) => openBuyLink("bonk", token.address, e)}
                                title="Buy on Bonk"
                              >
                                <Image src="/images/bonk.png" alt="Bonk" width={16} height={16} className="rounded" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
      {/* Prelaunch Detail Modal */}
      <Dialog open={isPrelaunchModalOpen} onOpenChange={setIsPrelaunchModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-3">
              <Rocket className="h-6 w-6 text-primary" />
              Prelaunch Project Details
            </DialogTitle>
          </DialogHeader>
          {selectedPrelaunch && (
            <div className="space-y-6 py-4">
              {/* Token Info */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase">Token Information</h3>
                <div className="bg-secondary/30 rounded-lg p-4 space-y-3">
                  {selectedPrelaunch.tokenName && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Name:</span>
                      <span className="font-semibold">{selectedPrelaunch.tokenName}</span>
                    </div>
                  )}
                  {selectedPrelaunch.tokenSymbol && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Symbol:</span>
                      <span className="font-mono font-semibold">{selectedPrelaunch.tokenSymbol}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Launch Date:</span>
                    <Badge variant="secondary">
                      {new Date(selectedPrelaunch.launchDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Developer Info */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase">Developer Information</h3>
                <div className="bg-secondary/30 rounded-lg p-4 space-y-3">
                  {selectedPrelaunch.devName && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Name:</span>
                      <span className="font-semibold">{selectedPrelaunch.devName}</span>
                    </div>
                  )}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Wallet Address:</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCopyWallet(selectedPrelaunch.devWallet)
                        }}
                      >
                        <Copy className="h-2 w-2 mr-1" />
                        Copy
                      </Button>
                    </div>
                    <code className="bg-secondary px-3 py-2 rounded text-xs sm:text-sm font-mono block break-all">
                      {selectedPrelaunch.devWallet}
                    </code>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase">Project Description</h3>
                <div className="bg-secondary/30 rounded-lg p-4">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedPrelaunch.description}</p>
                </div>
              </div>

              {/* Interest Metrics */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase">Community Interest</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-secondary/30 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Copy className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm sm:text-sm">Wallet Copies</span>
                    </div>
                    <span className="text-2xl sm:text-2xl font-bold">
                      {localStorage.getItem(`prelaunch_${selectedPrelaunch.id}_copy`) || 0}
                    </span>
                  </div>
                  <div className="bg-secondary/30 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="h-3 w-3 text-amber-500" />
                      <span className="text-sm sm:text-sm">Snipe Clicks</span>
                    </div>
                    <span className="text-2xl sm:text-2xl font-bold text-amber-500">
                      {localStorage.getItem(`prelaunch_${selectedPrelaunch.id}_snipe`) || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Button
                className="w-full bg-amber-500 hover:bg-amber-600 h-12 sm:h-12 text-base sm:text-base gap-2"
                onClick={() => {
                  handleSnipeClick(selectedPrelaunch.devWallet)
                  setIsPrelaunchModalOpen(false)
                }}
              >
                <Target className="h-5 w-5" />
                Snipe This Wallet
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
