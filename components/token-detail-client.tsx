"use client"

import { useState, useEffect, useMemo, useRef, type ElementType } from "react"
import { useRouter } from "next/navigation"
import { TopNav } from "@/components/top-nav"
import { SignalTimeline } from "@/components/signal-timeline"
import { SignalAnalyzerTab } from "@/components/signal-analyzer-tab"
import { events as mockEvents } from "@/lib/mock"
import { formatPrice, formatMarketCap, formatNumber } from "@/lib/format"
import { analyzeToken, extractMobulaTokenDetailsInputs } from "@/lib/token-analyzer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Copy, Check, Twitter, Send, Globe, Github, Link2 } from "lucide-react"
import { toast } from "sonner"
import { SignalBadge } from "@/components/signal-badge"
import Image from "next/image"
import type { TokenRow, SignalEvent, SignalType } from "@/lib/mock"
import { Badge } from "@/components/ui/badge"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { ShieldCheck, ShieldAlert, Info as InfoIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
 

export default function TokenDetailClient({ address }: { address: string }) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [copiedCreator, setCopiedCreator] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [token, setToken] = useState<TokenRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [dexEvents, setDexEvents] = useState<SignalEvent[]>([])

  // Mobula token details (auto-refresh ready)
  const [mobulaDetails, setMobulaDetails] = useState<any | null>(null)
  const [mobulaLoading, setMobulaLoading] = useState<boolean>(true)
  const [mobulaError, setMobulaError] = useState<string | null>(null)
  const mobulaTimerRef = useRef<number | null>(null)
  const tokenInfoRef = useRef<{ name: string; symbol: string; logo: string }>({ name: "", symbol: "", logo: "" })

  // Rugcheck state and fetch
  const [rugReport, setRugReport] = useState<any | null>(null)
  const [rugLoading, setRugLoading] = useState<boolean>(true)
  const [rugError, setRugError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        console.log("[v0] Fetching token detail for address:", address)

        // Check if we're on client side before using localStorage
        if (typeof window !== 'undefined') {
          const cachedToken = localStorage.getItem(`token_${address}`)
          if (cachedToken) {
            console.log("[v0] Token found in localStorage")
            setToken(JSON.parse(cachedToken))
            setLoading(false)
            return
          }
        }

        console.log("[v0] Token not in cache, fetching from API")
        const response = await fetch(`/api/token/${address}`)
        const data = await response.json()

        if (data.success && data.data) {
          console.log("[v0] Token data received from API")
          setToken(data.data)
          // Only set localStorage on client side
          if (typeof window !== 'undefined') {
            localStorage.setItem(`token_${address}`, JSON.stringify(data.data))
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
  }, [address])

  useEffect(() => {
    tokenInfoRef.current = {
      name: token?.name ?? "",
      symbol: token?.symbol ?? "",
      logo: token?.logo ?? "",
    }
  }, [token])

  useEffect(() => {
    let aborted = false

    const fetchMobula = async () => {
      if (!address) return
      try {
        setMobulaError(null)
        if (mobulaDetails == null) {
          setMobulaLoading(true)
        }

        const res = await fetch(`/api/mobula-token-details/${address}`, { cache: "no-store" })
        const text = await res.text()

        if (!res.ok) {
          throw new Error(`Mobula details failed: ${res.status} ${text}`)
        }

        const json = text ? JSON.parse(text) : null
        if (!aborted) {
          setMobulaDetails(json)
        }
      } catch (err: any) {
        console.error("[v0] Error fetching Mobula token details:", err)
        if (!aborted) {
          setMobulaError(typeof err?.message === "string" ? err.message : "Failed to load Mobula details")
        }
      } finally {
        if (!aborted) setMobulaLoading(false)
      }
    }

    fetchMobula()
    mobulaTimerRef.current = window.setInterval(fetchMobula, 5000)

    return () => {
      aborted = true
      if (mobulaTimerRef.current) {
        window.clearInterval(mobulaTimerRef.current)
        mobulaTimerRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address])

  useEffect(() => {
    const fetchRugReport = async () => {
      try {
        setRugLoading(true)
        setRugError(null)
        const res = await fetch(`/api/rugcheck/${address}`)
        if (!res.ok) {
          throw new Error(`Rugcheck request failed: ${res.status}`)
        }
        const data = await res.json()
        setRugReport(data)
      } catch (err: any) {
        console.error("[v0] Error fetching rugcheck:", err)
        setRugError(err?.message || "Failed to load rugcheck report")
      } finally {
        setRugLoading(false)
      }
    }
    fetchRugReport()
  }, [address])

  // Dexscreener Orders/Boosts timeline (declare before any early returns)
  useEffect(() => {
    let timer: any
    const fetchDexOrders = async () => {
      if (!address) return
      try {
        const res = await fetch(`/api/dexscreener-orders/${address}`)
        if (!res.ok) throw new Error(`Dexscreener orders failed: ${res.status}`)
        const data = await res.json()
        const orders = Array.isArray(data?.orders) ? data.orders : []
        const boosts = Array.isArray(data?.boosts) ? data.boosts : []

        const toEvent = (item: any, kind: "order" | "boost"): SignalEvent => {
          const tokenInfo = tokenInfoRef.current
          const ts = new Date(Number(item.paymentTimestamp || Date.now())).toISOString()
          const type: SignalType = kind === "boost" ? "DEXBOOST_PAID" : "DEXAD_PAID"
          const context = kind === "boost"
            ? `Boost payment: ${item.amount}`
            : `Order: ${item.type}${item.status ? ` (${item.status})` : ""}`
          return {
            id: `${kind}-${item.id || item.type}-${item.paymentTimestamp || ts}`,
            ts,
            type,
            tokenAddress: address,
            tokenName: tokenInfo.name,
            tokenSymbol: tokenInfo.symbol,
            tokenLogo: tokenInfo.logo,
            context,
          }
        }

        const events: SignalEvent[] = [
          ...orders.map((o: any) => toEvent(o, "order")),
          ...boosts.map((b: any) => toEvent(b, "boost")),
        ].sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())

        setDexEvents(events)
      } catch (err) {
        console.error("[v0] Error fetching Dexscreener orders:", err)
      }
    }

    fetchDexOrders()
    timer = setInterval(fetchDexOrders, 10000)
    return () => timer && clearInterval(timer)
  }, [address])

  // Memoized rugcheck calculations
  const rugcheckSummary = useMemo(() => {
    if (!rugReport) return null
    const risks = (rugReport?.risks ?? []) as Array<any>
    const danger = risks.filter((r) => r.level === "danger").length
    const warning = risks.filter((r) => r.level === "warning").length
    const info = risks.filter((r) => r.level === "info").length
    const summaryText =
      danger > 0
        ? `High risk detected (${danger} danger, ${warning} warning). Trade with extreme caution.`
        : warning > 0
        ? `Moderate risk (${warning} warnings, ${info} info). Evaluate carefully before trading.`
        : `Low risk based on current checks. Always verify independently.`
    return { summaryText, risks, danger, warning, info }
  }, [rugReport])

  const rugcheckScore = useMemo(() => {
    if (!rugReport) return null
    const score = rugReport?.score_normalised ?? rugReport?.score ?? 0
    const rugged = !!rugReport?.rugged
    const scoreColor = score >= 80 ? "bg-green-500" : score >= 50 ? "bg-yellow-500" : "bg-red-500"
    return { score, rugged, scoreColor }
  }, [rugReport])

  const rugcheckChecklist = useMemo(() => {
    if (!rugReport) return null
    const tokenInfo = rugReport?.token || {}
    const transferFee = rugReport?.transferFee || {}
    const mintAuthorityDisabled = tokenInfo?.mintAuthority == null
    const freezeAuthorityDisabled = tokenInfo?.freezeAuthority == null
    const transferFeeEnabled = (transferFee?.pct ?? 0) > 0 || !!transferFee?.authority

    // Markets LP lock summary
    const markets: any[] = Array.isArray(rugReport?.markets) ? rugReport.markets : []
    const lpLockPctList = markets
      .map((m: any) => m?.lp?.lpLockedPct)
      .filter((v: any) => typeof v === "number") as number[]
    const lpLockPct = lpLockPctList.length ? Math.max(...lpLockPctList) : undefined

    const checklist = [
      {
        label: "Mint Authority Disabled",
        ok: mintAuthorityDisabled,
        help: mintAuthorityDisabled ? "Mint cannot be altered" : "Mint can be changed — high risk",
      },
      {
        label: "Freeze Authority Disabled",
        ok: freezeAuthorityDisabled,
        help: freezeAuthorityDisabled ? "Transfers cannot be frozen" : "Freeze enabled — caution",
      },
      {
        label: "Transfer Fee",
        ok: !transferFeeEnabled,
        help: transferFeeEnabled ? `Fee ${transferFee?.pct ?? 0}% set by ${transferFee?.authority ?? "unknown"}` : "No transfer fees",
      },
      {
        label: "LP Locked",
        ok: (lpLockPct ?? 0) >= 80,
        help: lpLockPct != null ? `Locked ${Math.round(lpLockPct)}%` : "No LP lock data",
      },
    ]
    return { checklist, markets }
  }, [rugReport])

  const rugcheckInfo = useMemo(() => {
    if (!rugReport) return null
    const creator = rugReport?.creator
    const tokenProgram = rugReport?.tokenProgram
    const creatorTokens = Array.isArray(rugReport?.creatorTokens) ? rugReport.creatorTokens : []
    return { creator, tokenProgram, creatorTokens }
  }, [rugReport])

  const dexPaid = useMemo(() => {
    return dexEvents.some((e) => e.type === "DEXBOOST_PAID" || e.type === "DEXAD_PAID" || e.type === "DEXBAR_PAID")
  }, [dexEvents])

  const analyzerSummary = useMemo(() => {
    if (!mobulaDetails) return [] as string[]
    const inputs = extractMobulaTokenDetailsInputs(mobulaDetails)
    const analysis = analyzeToken(inputs)
    return Array.isArray(analysis?.summary) ? analysis.summary : []
  }, [mobulaDetails])

  const bondingState = useMemo(() => {
    const data = mobulaDetails?.data?.data ?? mobulaDetails?.data ?? mobulaDetails
    const bondedRaw = data?.bonded ?? data?.isBonded
    const bonded = bondedRaw === true || bondedRaw === "true"

    if (bonded) return { percent: 100, bonded: true }

    const rawPrimary = data?.bondingPercentage ?? data?.bonding_percent ?? (token as any)?.bondingPercentage
    const primary = typeof rawPrimary === "number" ? rawPrimary : Number(rawPrimary)
    let val = Number.isFinite(primary) ? primary : Number.NaN

    if (!Number.isFinite(val)) {
      const bc: any = (token as any)?.bondingCurve
      const raw = typeof bc === "number" ? bc : typeof bc?.progress === "number" ? bc.progress : undefined
      if (typeof raw === "number" && Number.isFinite(raw)) val = raw
    }

    if (!Number.isFinite(val)) return { percent: null, bonded: false }
    const pct = val <= 1 ? val * 100 : val
    return { percent: Math.max(0, Math.min(100, Math.round(pct))), bonded: false }
  }, [mobulaDetails, token])

  const tokenDescription = useMemo(() => {
    const data = mobulaDetails?.data ?? mobulaDetails?.data?.data ?? mobulaDetails
    const desc = data?.description ?? data?.tokenDescription ?? (token as any)?.description
    if (typeof desc !== "string") return ""
    return desc.trim()
  }, [mobulaDetails, token])

  const descriptionPreview = useMemo(() => {
    if (!tokenDescription) return ""
    const words = tokenDescription.split(/\s+/).filter(Boolean)
    if (words.length <= 300) return tokenDescription
    return `${words.slice(0, 300).join(" ")}…`
  }, [tokenDescription])

  const socialLinks = useMemo(() => {
    const data = mobulaDetails?.data?.data ?? mobulaDetails?.data ?? mobulaDetails
    const socials = data?.socials
    if (!socials || typeof socials !== "object") return [] as { key: string; label: string; href: string; Icon: ElementType }[]

    const links: { key: string; label: string; href: string; Icon: ElementType }[] = []

    if (typeof socials.twitter === "string" && socials.twitter.length > 0) {
      links.push({ key: "twitter", label: "Twitter", href: socials.twitter, Icon: Twitter })
    }
    if (typeof socials.telegram === "string" && socials.telegram.length > 0) {
      links.push({ key: "telegram", label: "Telegram", href: socials.telegram, Icon: Send })
    }
    if (typeof socials.website === "string" && socials.website.length > 0) {
      links.push({ key: "website", label: "Website", href: socials.website, Icon: Globe })
    }

    const others = socials.others
    if (others && typeof others === "object") {
      Object.entries(others as Record<string, unknown>).forEach(([key, value]) => {
        if (typeof value === "string" && value.length > 0) {
          const icon = key.toLowerCase() === "github" ? Github : Link2
          links.push({ key: `other-${key}`, label: key, href: value, Icon: icon })
        }
      })
    }

    return links
  }, [mobulaDetails])

  const dexscreenerHeader = useMemo(() => {
    const data = mobulaDetails?.data?.data ?? mobulaDetails?.data ?? mobulaDetails
    const listedRaw = data?.dexscreenerListed ?? data?.dexScreenerListed
    const listed = listedRaw === true || listedRaw === "true"
    const header = data?.dexscreenerHeader ?? data?.dexScreenerHeader
    if (!listed || typeof header !== "string" || header.length === 0) return null
    return header
  }, [mobulaDetails])

  const dexscreenerBoostedAmount = useMemo(() => {
    const data = mobulaDetails?.data?.data ?? mobulaDetails?.data ?? mobulaDetails
    const boostedRaw = data?.dexscreenerBoosted ?? data?.dexScreenerBoosted
    const boosted = boostedRaw === true || boostedRaw === "true"
    if (!boosted) return "-"
    const amountRaw = data?.dexscreenerBoostedAmount ?? data?.dexScreenerBoostedAmount
    const normalizedRaw = typeof amountRaw === "string" ? amountRaw.replace(/\$/g, "").trim() : amountRaw
    const amountNum = typeof normalizedRaw === "number" ? normalizedRaw : Number(normalizedRaw)
    if (Number.isFinite(amountNum)) {
      return new Intl.NumberFormat(undefined, {
        notation: "compact",
        maximumFractionDigits: 2,
      }).format(amountNum)
    }
    if (typeof normalizedRaw === "string" && normalizedRaw.length > 0) return normalizedRaw
    return "-"
  }, [mobulaDetails])

  const volume24hUsd = useMemo(() => {
    const data = mobulaDetails?.data?.data ?? mobulaDetails?.data ?? mobulaDetails
    const raw = data?.volume24hUSD ?? data?.volume_24h_usd
    const num = typeof raw === "number" ? raw : Number(raw)
    if (Number.isFinite(num)) return num
    return Number.isFinite(token?.volume24h ?? NaN) ? (token?.volume24h as number) : null
  }, [mobulaDetails, token])

  const tokenRank = useMemo(() => {
    const data = mobulaDetails?.data?.data ?? mobulaDetails?.data ?? mobulaDetails
    const raw = data?.rank
    const num = typeof raw === "number" ? raw : Number(raw)
    if (Number.isFinite(num)) return num
    if (typeof raw === "string" && raw.trim().length > 0) return raw.trim()
    return "-"
  }, [mobulaDetails])

  const creatorAddress = useMemo(() => {
    const data = mobulaDetails?.data?.data ?? mobulaDetails?.data ?? mobulaDetails
    const primary = typeof token?.creator === "string" ? token.creator.trim() : ""
    if (primary) return primary
    const deployer = typeof data?.deployer === "string" ? data.deployer.trim() : ""
    if (deployer) return deployer
    const tokenDeployer = typeof (token as any)?.deployer === "string" ? (token as any).deployer.trim() : ""
    if (tokenDeployer) return tokenDeployer
    return ""
  }, [mobulaDetails, token])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <TopNav />
        <main className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <div className="flex items-start gap-4 mb-3">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-7 w-7 rounded" />
            </div>
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={`sig-skel-${i}`} className="h-6 w-20 rounded" />
              ))}
            </div>
          </div>

          <div className="space-y-6 mb-6">
          {/* Bonding Curve */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Bonding Curve</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const bc: any = (token as any)?.bondingCurve
                let raw = typeof bc === 'number' ? bc : (typeof bc?.progress === 'number' ? bc.progress : 0)
                const percent = Math.max(0, Math.min(100, raw <= 1 ? Math.round(raw * 100) : Math.round(raw)))
                return (
                  <div className="space-y-2">
                    <Progress value={percent} />
                    <div className="text-xs text-muted-foreground">{percent}% complete</div>
                  </div>
                )
              })()}
            </CardContent>
          </Card>
            <Card className="overflow-hidden"> 
              <CardContent className="p-0">
              {/* Bonding Curve skeleton */}
              <Card> 
                <CardContent>
                  <Skeleton className="h-2 w-full rounded-full" />
                  <Skeleton className="h-3 w-20 mt-2" />
                </CardContent>
              </Card>
                <div className="relative w-full h-[560px]">
                  <Skeleton className="absolute inset-0 h-full w-full" />
                </div>
              </CardContent>
            </Card>

            <Card
              className="h-fit self-start"
              title="Token Details: summary of token data, performance, metadata, and insights."
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Token Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={`detail-skel-${i}`}>
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-6 w-28 mt-2" />
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-5 w-52 mt-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Token not found</p>
          <Button onClick={() => router.push("/")} className="mt-4">
            Go Home
          </Button>
        </div>
      </div>
    )
  }

  const copyAddress = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(token.address)
      setCopied(true)
      toast.success("Copied contract address", {
        description: `${token.address.slice(0, 8)}...${token.address.slice(-6)}`,
      })
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const copyCreatorAddress = (address?: string | null) => {
    if (!address) return
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(address)
      setCopiedCreator(true)
      toast.success("Copied creator address", {
        description: `${address.slice(0, 8)}...${address.slice(-6)}`,
      })
      setTimeout(() => setCopiedCreator(false), 2000)
    }
  }

  const truncateMiddle = (val?: string, front: number = 6, back: number = 6) => {
    if (!val) return "-"
    if (val.length <= front + back) return val
    return `${val.slice(0, front)}.....${val.slice(-back)}`
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav />

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
              {copied ? <Check className="h-2 w-2 text-primary" /> : <Copy className="h-2 w-2" />}
            </Button>
          </div>

          {tokenDescription ? (
            <div className="mb-4 max-w-3xl">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {showFullDescription ? tokenDescription : descriptionPreview}
              </p>
              {descriptionPreview !== tokenDescription && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-0 text-xs text-primary hover:text-primary/80"
                  onClick={() => setShowFullDescription((prev) => !prev)}
                >
                  {showFullDescription ? "Show less" : "Read more"}
                </Button>
              )}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {token.signals.map((signal, idx) => (
              <SignalBadge key={idx} type={signal} boostCount={token.boostCount} />
            ))}
          </div>

        </div>

        {/* Chart full-width, details below */}
        <div className="space-y-6 mb-6">
          <Card> 
            <CardContent className="p-0">
              <div className="relative w-full h-[560px]">
                <iframe
                  id="mobula-chart-embed"
                  title={`${token.name}`}
                  src={`https://www.mtt.gg/embed/token/solana:solana/${token.address}?embed=1&resolution=1s&chart_type=price&theme=Navy&bg_color=0e1a1f&candle_up_color=18C722&candle_down_color=EF4444&show_symbol=1&show_grid_lines=1&show_volume=1`}
                  frameBorder="0"
                  allow="clipboard-write"
                  allowFullScreen
                  style={{ width: "100%", height: "600px" }}
                />
                <div className="pointer-events-none left-0 right-0 h-8 bg-background" style={{position: "absolute", bottom: "-39px"}}></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Bonding Progress</CardTitle>
                {bondingState.bonded ? (
                  <Badge variant="outline" className="text-[10px]">Bonded</Badge>
                ) : null}
              </div>
            </CardHeader>
            <CardContent>
              {bondingState.percent == null ? (
                <div className="text-sm text-muted-foreground">No bonding data available.</div>
              ) : (
                <div className="space-y-2">
                  <Progress value={bondingState.percent} className="h-2" />
                  <div className="text-xs text-muted-foreground">{bondingState.percent}% complete</div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left: Token Details */}
            <Card className="h-fit self-start">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Token Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dexscreenerHeader ? (
                    <div className="relative w-full overflow-hidden rounded-xl">
                      <div className="relative h-40 w-full">
                        <Image
                          src={dexscreenerHeader}
                          alt={`${token.symbol} header`}
                          fill
                          sizes="(max-width: 1024px) 100vw, 33vw"
                          className="object-cover"
                          priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/20 to-transparent" />
                      </div>
                    </div>
                  ) : null}
                  {socialLinks.length > 0 ? (
                    <div className="relative -mt-5 flex justify-center">
                      <div className="inline-flex items-center gap-2 rounded-full bg-background/70 px-2 py-1 shadow-lg backdrop-blur-sm" style={{ transform: "translateY(-6px)" }}>
                        {socialLinks.map((social) => (
                          <Button
                            key={social.key}
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            asChild
                          >
                            <a href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label} title={social.label}>
                              <social.Icon className="h-3.5 w-3.5" />
                            </a>
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  <div className="space-y-2">
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
                    <div className="flex flex-wrap gap-2">
                      {token.signals.map((signal, idx) => (
                        <SignalBadge key={idx} type={signal} boostCount={token.boostCount} />
                      ))}
                    </div>
                    <hr className="w-full border-t border-slate-700" />
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Overview</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground">Price</div>
                        <div className="text-lg font-bold">{formatPrice(token.price)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Market Cap</div>
                        <div className="text-lg font-bold">{formatMarketCap(token.mc)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Liquidity</div>
                        <div className="text-lg font-bold">{formatNumber(token.liquidity)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Volume (24h)</div>
                        <div className="text-lg font-bold">{volume24hUsd != null ? formatNumber(volume24hUsd) : "-"}</div>
                      </div>
                    </div>
                  </div> 
                  <hr className="w-full border-t border-slate-700" />
                  <div className="space-y-2">
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Performance</div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground">5m</div>
                        <div className={`text-lg font-bold ${token.change5m >= 0 ? "text-green-500" : "text-red-500"}`}>
                          {token.change5m >= 0 ? "+" : ""}
                          {token.change5m.toFixed(2)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">1h</div>
                        <div className={`text-lg font-bold ${(token as any).change1h >= 0 ? "text-green-500" : "text-red-500"}`}>
                          {(token as any).change1h >= 0 ? "+" : ""}
                          {((token as any).change1h ?? 0).toFixed(2)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">24h</div>
                        <div className={`text-lg font-bold ${(token as any).change24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                          {(token as any).change24h >= 0 ? "+" : ""}
                          {((token as any).change24h ?? 0).toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </div>
                  <hr className="w-full border-t border-slate-700" />
                  <div className="space-y-2">
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Metadata</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground">Contract Address</div>
                        <div className="text-sm"><code className="text-xs bg-secondary px-2 py-1 rounded font-mono text-muted-foreground">
                        {token.address.slice(0, 8)}...{token.address.slice(-6)}
                      </code>
                      <Button variant="ghost" size="sm" onClick={copyAddress} className="h-7 w-7 p-0">
                        {copied ? <Check className="h-2 w-2 text-primary" /> : <Copy className="h-2 w-2" />}
                      </Button></div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Mint</div>
                        <div className="text-sm">{truncateMiddle(token.mint ?? token.address)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Creator</div>
                        <div className="flex items-center gap-1">
                          <span className="text-sm">{truncateMiddle(creatorAddress)}</span>
                          {creatorAddress && (
                            <Button variant="ghost" size="sm" onClick={() => copyCreatorAddress(creatorAddress)} className="h-6 w-6 p-0">
                              {copiedCreator ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
                            </Button>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Launchpad</div>
                        <div className="text-sm">{token.launchpad ?? "-"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Boosts</div>
                        <div className="text-lg font-bold">{dexscreenerBoostedAmount}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Rank</div>
                        <div className="text-lg font-bold">{tokenRank}</div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-xs text-muted-foreground">Last Updated</div>
                        <div className="text-sm">{new Date(token.updatedAt).toLocaleString()}</div>
                      </div>
                    </div>
                  </div> 
                  <hr className="w-full border-t border-slate-700" />
                  <div className="space-y-2">
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Summary / Resume</div>
                    {analyzerSummary.length === 0 ? (
                      <div className="text-sm text-muted-foreground">No summary available.</div>
                    ) : (
                      <div className="space-y-1">
                        {analyzerSummary.slice(0, 4).map((line, idx) => (
                          <div key={`summary-${idx}`} className="text-sm text-muted-foreground">
                            {line}
                          </div>
                        ))}
                      </div>
                    )}
                  </div> 
                </div>
              </CardContent>
            </Card>

            {/* Middle: Rugcheck */}
            <Card title="Rugcheck Analysis: risk summary and audit results for this token.">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Rugcheck Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                {rugLoading && <p className="text-muted-foreground text-sm">Loading rugcheck…</p>}
                {rugError && <p className="text-red-500 text-sm">{rugError}</p>}
                {!rugLoading && !rugError && rugReport && (
                  <TooltipProvider delayDuration={0}>
                  <div className="space-y-4">
                    {rugcheckSummary && (
                      <div className="rounded border border-border p-3 bg-secondary/40">
                        <div className="text-sm">{rugcheckSummary.summaryText}</div>
                      </div>
                    )}
                    {rugcheckScore && (
                      <div className="rounded border border-border p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-semibold">Risk Score</div>
                          <Badge variant="outline" className={rugcheckScore.rugged ? "text-red-600 border-red-600" : "text-green-600 border-green-600"}>
                            {rugcheckScore.rugged ? "Rugged" : "Not Rugged"}
                          </Badge>
                        </div>
                        <div className="h-2 w-full bg-secondary rounded">
                          <div className={`h-2 ${rugcheckScore.scoreColor} rounded`} style={{ width: `${Math.min(Math.max(Number(rugcheckScore.score), 0), 100)}%` }} />
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">Score: {Math.round(Number(rugcheckScore.score))}/100</div>
                      </div>
                    )}
                    {rugcheckChecklist && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {rugcheckChecklist.checklist.map((item, idx) => (
                          <div key={idx} className="rounded border border-border p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {item.ok ? (
                                  <ShieldCheck className="h-4 w-4 text-green-500" />
                                ) : (
                                  <ShieldAlert className="h-4 w-4 text-red-500" />
                                )}
                                <div className="text-sm font-semibold">{item.label}</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <InfoIcon className="h-4 w-4 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <div className="max-w-xs text-xs">{item.help}</div>
                                  </TooltipContent>
                                </Tooltip>
                                <Badge variant={item.ok ? "default" : "outline"} className={item.ok ? "bg-green-500" : "text-red-600 border-red-600"}>
                                  {item.ok ? "OK" : "Risk"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {rugcheckInfo && (
                      <div className="rounded border border-border p-3">
                        <div className="text-sm font-semibold mb-1">Token Program</div>
                        <div className="text-xs">{truncateMiddle(rugcheckInfo.tokenProgram)}</div>
                        <div className="mt-1 text-xs text-muted-foreground">Check authorities and extensions</div>
                      </div>
                    )}
                    {rugcheckChecklist && rugcheckChecklist.markets.length > 0 && (
                      <div className="rounded border border-border p-3">
                        <div className="text-sm font-semibold mb-2">Markets</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {rugcheckChecklist.markets.slice(0, 4).map((m: any, idx: number) => (
                            <div key={idx} className="rounded bg-secondary/40 p-2">
                              <div className="text-xs font-semibold">{m?.marketType || "Unknown"}</div>
                              <div className="text-xs text-muted-foreground">LP Locked: {m?.lp?.lpLockedPct != null ? `${Math.round(m.lp.lpLockedPct)}%` : "N/A"}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  </TooltipProvider>
                )}
              </CardContent>
            </Card>
            {/* Right: Signal Timeline */}
            <div>
              <SignalTimeline
                events={dexEvents}
                analyzerContent={
                  <SignalAnalyzerTab
                    mobula={mobulaDetails}
                    dexPaid={dexPaid}
                  />
                }
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
