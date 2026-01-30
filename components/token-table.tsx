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
import { useToast } from "@/hooks/use-toast"
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
import { fetchCTOTokens, fetchDexPaidTokens, fetchBoostTokens } from "@/lib/api"

interface TokenTableProps {
  tokens: TokenRow[]
  newestTokenAddress?: string | null
  searchQuery?: string
  onTokenClick?: (token: TokenRow) => void
  isLoading?: boolean
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

export function TokenTable({ tokens: initialTokens, newestTokenAddress, searchQuery, onTokenClick, isLoading }: TokenTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<string>("new")
  const [launchpadFilter, setLaunchpadFilter] = useState<string>("pumpfun")
  const [boostFilter, setBoostFilter] = useState<string>("all")
  const [ctoTokens, setCtoTokens] = useState<TokenRow[]>([])
  const [loadingCTO, setLoadingCTO] = useState(false)
  const [ctoRateLimited, setCtoRateLimited] = useState(false)
  const [dexpaidTokens, setDexpaidTokens] = useState<TokenRow[]>([])
  const [boostTokens, setBoostTokens] = useState<TokenRow[]>([])
  const [loadingDexpaid, setLoadingDexpaid] = useState(false)
  const [loadingBoost, setLoadingBoost] = useState(false)
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
    if (activeTab !== "cto") return
  }, [activeTab])

  useEffect(() => {
    if (activeTab !== "dexpaid") return
    let cancelled = false
    setLoadingDexpaid(true)
    fetchDexPaidTokens()
      .then((tokens) => {
        if (!cancelled) setDexpaidTokens(tokens)
      })
      .finally(() => {
        if (!cancelled) setLoadingDexpaid(false)
      })
    return () => {
      cancelled = true
    }
  }, [activeTab])

  useEffect(() => {
    if (activeTab !== "boost") return
    let cancelled = false
    setLoadingBoost(true)
    fetchBoostTokens()
      .then((tokens) => {
        if (!cancelled) setBoostTokens(tokens)
      })
      .finally(() => {
        if (!cancelled) setLoadingBoost(false)
      })
    return () => {
      cancelled = true
    }
  }, [activeTab])

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

  const formatCreator = (creator: string) => {
    if (!creator || creator.length <= 10) return creator
    return `${creator.slice(0, 5)}...${creator.slice(-5)}`
  }

  const formatMint = (mint: string) => {
    if (!mint || mint.length <= 8) return mint
    return `${mint.slice(0, 3)}...${mint.slice(-5)}`
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
    console.log("[v0] Token clicked:", {
      address: token.address,
      mint: token.mint,
      creator: token.creator,
      name: token.name,
      symbol: token.symbol,
      fullData: token
    })
    
    // Store with both address and mint as keys to handle both cases
    localStorage.setItem(`token_${token.address}`, JSON.stringify(token))
    if (token.mint && token.mint !== token.address) {
      localStorage.setItem(`token_${token.mint}`, JSON.stringify(token))
    }
    
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

  const filteredTokens = (() => {
    if (activeTab === "new") {
      return initialTokens.filter((token) => {
        if (launchpadFilter === "all") return true
        return token.launchpad === launchpadFilter
      })
    }
    if (activeTab === "dexpaid") {
      return dexpaidTokens
    }
    if (activeTab === "boost") {
      if (boostFilter === "all") return boostTokens
      const minBoost: Record<string, number> = {
        "10x": 10,
        "30x": 30,
        "50x": 50,
        "100x": 100,
        "500x": 500,
      }
      const min = minBoost[boostFilter]
      if (min == null) return boostTokens
      return boostTokens.filter((t) => (t.boostCount ?? 0) >= min)
    }
    if (activeTab === "cto") {
      return ctoTokens
    }
    if (activeTab === "signals") {
      const byAddress = new Map<string, TokenRow>()
      ;[...dexpaidTokens, ...boostTokens, ...ctoTokens].forEach((t) => byAddress.set(t.address, t))
      return Array.from(byAddress.values())
    }
    return initialTokens
  })()

  return (
    <Card>
      <CardHeader className="pb-px">
        {/* Reordered tabs: New Coins, New Dexpaid, New Boost, CTO, New Ads, Signals, Prelaunch */}
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
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-black font-semibold text-xs h-8"
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
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Coming Soon</DialogTitle>
                    <DialogDescription>
                      Snipe {(() => {
                        const tabNames: Record<string, string> = {
                          new: "New Coins",
                          dexpaid: "New Dexpaid",
                          boost: "New Boost",
                          cto: "CTO",
                          ads: "New Ads",
                          signals: "Signals",
                        };
                        return tabNames[activeTab] || "Feature";
                      })()} - Feature coming soon!
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
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
        {activeTab === "prelaunch" ? (
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
            <Table wrapperClassName="h-[600px] overflow-auto overflow-x-auto">
              <TableHeader className="shadow-sm">
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
                              <Copy className="h-1 w-1" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm py-2 px-4 max-w-xs">
                          <div className="line-clamp-2">{project.description}</div>
                        </TableCell>
                        <TableCell className="text-center py-2 px-4">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center justify-center gap-1 text-[9px] sm:text-xs text-muted-foreground">
                              <Copy className="h-1.5 w-1.5" />
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
          </>
        ) : activeTab === "cto" ? (
          <div className="flex flex-col items-center justify-center h-[600px] space-y-4">
            <Construction className="h-16 w-16 text-muted-foreground/50" />
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-foreground">Coming Soon</h3>
              <p className="text-muted-foreground max-w-md">
                CTO (Community Takeover) signals are under development. Check back soon!
              </p>
            </div>
          </div>
        ) : activeTab === "dexpaid" && loadingDexpaid ? (
          <div className="flex flex-col items-center justify-center h-[600px] space-y-4">
            <Construction className="h-16 w-16 text-muted-foreground/50 animate-pulse" />
            <p className="text-sm text-muted-foreground">Loading DexPaid tokens...</p>
          </div>
        ) : activeTab === "boost" && loadingBoost ? (
          <div className="flex flex-col items-center justify-center h-[600px] space-y-4">
            <Construction className="h-16 w-16 text-muted-foreground/50 animate-pulse" />
            <p className="text-sm text-muted-foreground">Loading Boost tokens...</p>
          </div>
        ) : (activeTab === "dexpaid" || activeTab === "boost" || activeTab === "signals") && filteredTokens.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[600px] space-y-4">
            <Construction className="h-16 w-16 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              {activeTab === "dexpaid"
                ? "No DexPaid tokens right now."
                : activeTab === "boost"
                  ? "No Boost tokens right now."
                  : "No signals data yet. Try DexPaid or Boost tabs."}
            </p>
          </div>
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
                <Table wrapperClassName="h-[600px] overflow-auto overflow-x-auto" className="w-full min-w-[980px]">
                  <TableHeader className="sticky top-0 shadow-md z-10">
                      <TableRow className="hover:bg-transparent border-border bg-background/95 backdrop-blur-sm">
                        <TableHead className="font-semibold text-foreground text-[10px] sm:text-xs bg-background/95 pl-3 pr-2 py-2 text-left min-w-[200px]">
                          Token
                        </TableHead>
                        <TableHead className="font-semibold text-foreground text-[10px] sm:text-xs bg-background/95 px-2 py-2 text-left min-w-[120px]">
                          Creator
                        </TableHead>
                        <TableHead className="font-semibold text-foreground text-[10px] sm:text-xs bg-background/95 px-2 py-2 text-left min-w-[120px]">
                          Mint
                        </TableHead>
                        <TableHead className="font-semibold text-foreground text-[10px] sm:text-xs bg-background/95 px-2 py-2 text-right min-w-[80px]">
                          MC
                        </TableHead>
                        <TableHead className="font-semibold text-foreground text-[10px] sm:text-xs bg-background/95 px-2 py-2 text-right min-w-[70px]">
                          Price
                        </TableHead>
                        {activeTab !== "new" && (
                          <TableHead className="font-semibold text-foreground text-[10px] sm:text-xs bg-background/95 px-2 py-2 text-left min-w-[90px]">
                            Signals
                          </TableHead>
                        )}
                        <TableHead className="font-semibold text-foreground text-[10px] sm:text-xs bg-background/95 px-2 py-2 text-right min-w-[60px]">
                          Updated
                        </TableHead>
                        <TableHead className="font-semibold text-foreground text-[10px] sm:text-xs bg-background/95 pl-2 pr-3 py-2 text-center min-w-[100px]">
                          Buy
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        // Loading skeleton rows
                        Array.from({ length: 5 }).map((_, index) => (
                          <TableRow key={`loading-${index}`} className="border-border">
                            <TableCell className="py-3 pl-4 pr-3">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 bg-secondary rounded-full animate-pulse"></div>
                                <div className="space-y-1">
                                  <div className="h-3 bg-secondary rounded animate-pulse w-16"></div>
                                  <div className="h-2 bg-secondary rounded animate-pulse w-12"></div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-3 px-3">
                              <div className="h-3 bg-secondary rounded animate-pulse w-20"></div>
                            </TableCell>
                            <TableCell className="py-3 px-3">
                              <div className="h-3 bg-secondary rounded animate-pulse w-16"></div>
                            </TableCell>
                            <TableCell className="py-3 px-3">
                              <div className="h-3 bg-secondary rounded animate-pulse w-12"></div>
                            </TableCell>
                            <TableCell className="py-3 px-3">
                              <div className="h-3 bg-secondary rounded animate-pulse w-14"></div>
                            </TableCell>
                            <TableCell className="py-3 px-3">
                              <div className="h-3 bg-secondary rounded animate-pulse w-16"></div>
                            </TableCell>
                            <TableCell className="py-3 pl-3 pr-4">
                              <div className="h-6 bg-secondary rounded animate-pulse w-12"></div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        filteredTokens.map((token) => (
                        <TableRow
                          key={token.address}
                          onClick={() => handleTokenClick(token)}
                          className={`cursor-pointer hover:bg-secondary/50 transition-colors border-border ${
                            !isLoading && newestTokenAddress === token.address ? "animate-slide-in" : ""
                          }`}
                        >
                          <TableCell className="py-2.5 pl-3 pr-2 text-left align-middle">
                            <div className="flex items-center gap-3 min-w-0">
                              <Image
                                src={token.logo || "/placeholder.svg"}
                                alt={token.symbol}
                                width={36}
                                height={36}
                                className="rounded-full object-cover shrink-0 w-8 h-8 sm:w-9 sm:h-9"
                              />
                              <div className="flex flex-col min-w-0 flex-1">
                                <span className="font-medium text-foreground text-[9px] sm:text-[10px] truncate leading-tight">
                                  {token.name}
                                </span>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[8px] sm:text-[9px] text-muted-foreground truncate font-mono">{token.symbol}</span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-4 w-4 shrink-0 p-0 hover:bg-secondary/80 rounded-md"
                                    onClick={async (e) => {
                                      e.stopPropagation()
                                      try {
                                        await navigator.clipboard.writeText(token.address)
                                        toast({
                                          description: "Contract address copied!",
                                          duration: 2000
                                        })
                                      } catch (err) {
                                        console.error('Failed to copy contract address:', err)
                                        toast({
                                          description: "Failed to copy address",
                                          variant: "destructive",
                                          duration: 2000
                                        })
                                      }
                                    }}
                                    title="Copy Contract Address"
                                  >
                                    <Copy className="w-2 h-2 text-muted-foreground" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-3 px-4 text-left align-middle">
                            <div className="flex items-center gap-2 min-w-0">
                              <code className="bg-secondary/60 px-1 py-0.5 rounded text-[7px] sm:text-[8px] font-mono text-foreground border border-border/50">
                                {formatCreator(token.creator || token.address)}
                              </code>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-4 w-4 p-0 hover:bg-secondary/80 rounded-md shrink-0"
                                onClick={async (e) => {
                                  e.stopPropagation()
                                  try {
                                    const textToCopy = token.creator || token.address
                                    await navigator.clipboard.writeText(textToCopy)
                                    toast({
                                      description: "Creator address copied!",
                                      duration: 2000
                                    })
                                  } catch (err) {
                                    console.error('Failed to copy creator address:', err)
                                    toast({
                                      description: "Failed to copy creator address",
                                      variant: "destructive",
                                      duration: 2000
                                    })
                                  }
                                }}
                                title="Copy Creator Address"
                              >
                                <Copy className="w-2 h-2 text-muted-foreground" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="py-3 px-4 text-left align-middle">
                            <div className="flex items-center gap-2 min-w-0">
                              <code className="bg-secondary/60 px-1 py-0.5 rounded text-[7px] sm:text-[8px] font-mono text-foreground border border-border/50">
                                {formatMint(token.mint || token.address)}
                              </code>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-4 w-4 p-0 hover:bg-secondary/80 rounded-md shrink-0"
                                onClick={async (e) => {
                                  e.stopPropagation()
                                  try {
                                    const textToCopy = token.mint || token.address
                                    await navigator.clipboard.writeText(textToCopy)
                                    toast({
                                      description: "Mint address copied!",
                                      duration: 2000
                                    })
                                  } catch (err) {
                                    console.error('Failed to copy mint address:', err)
                                    toast({
                                      description: "Failed to copy mint address",
                                      variant: "destructive",
                                      duration: 2000
                                    })
                                  }
                                }}
                                title="Copy Mint Address"
                              >
                                <Copy className="w-2 h-2 text-muted-foreground" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="py-2 px-2 text-right font-mono text-[9px] sm:text-[10px] align-middle whitespace-nowrap font-medium">
                            <span className="text-foreground">{formatMarketCap(token.mc)}</span>
                          </TableCell>
                          <TableCell className="py-2 px-2 text-right font-mono text-[9px] sm:text-[10px] align-middle whitespace-nowrap font-medium">
                            <span className="text-foreground">${formatPrice(token.price)}</span>
                          </TableCell>
                          {activeTab !== "new" && (
                            <TableCell className="py-3 px-4 text-left align-middle">
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
                          )}
                          <TableCell className="py-2 px-2 text-right text-[8px] sm:text-[9px] text-muted-foreground align-middle whitespace-nowrap">
                            <span className="font-medium">{getTimeAgo(token.updatedAt)}</span>
                          </TableCell>
                          <TableCell className="py-2 pl-2 pr-3 text-center align-middle">
                            <div className="flex gap-1.5 justify-center items-center">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 hover:bg-primary/20 rounded-md"
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
                        ))
                      )}
                    </TableBody>
                  </Table>
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
                        <Copy className="h-1.5 w-1.5 mr-1" />
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
                      <Copy className="h-1.5 w-1.5 text-muted-foreground" />
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
