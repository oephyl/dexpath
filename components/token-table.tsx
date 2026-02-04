"use client"
import { Skeleton } from "@/components/ui/skeleton" 

import { Fragment, useState, useEffect, useRef, useMemo } from "react"
import type { MouseEvent } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { SignalBadge } from "./signal-badge"
import { formatMarketCap, formatPrice, formatNumber, formatCount } from "@/lib/format"
import type { SignalType, TokenRow } from "@/lib/mock"
import Image from "next/image"
import { Copy, Target, Rocket, Construction, CheckCircle2, XCircle, AlertTriangle, Heart, Repeat2, MessageCircle, Plus, SearchX } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
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
import { generateTokenSummary } from "@/lib/token-summary"

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

type PresetKey = "top_traded" | "gainers" | "losers"

type RuntimeTokenExtensions = {
  confidenceScore?: number
  momentumState?: "ACCELERATING" | "STABLE" | "COOLING"
  riskLevel?: "LOW" | "MEDIUM" | "HIGH"
  tradeModeFit?: "SNIPER" | "SCALPER" | "SWING"
  priceChange24h?: number
  // Mobula pool/source identifier (runtime-only; New tab)
  source?: string
  // Proxy spike probability (runtime-only; New tab)
  spikeProbability?: number
  change15m?: number
  priceChange5m?: number
  volume5m?: number
  volume15m?: number
  // Mobula/terminal indicators (optional, runtime only)
  buyCount?: number
  sellCount?: number
  organicPct?: number
  top10HoldingsPct?: number
  devHoldingsPct?: number
  bondingPct?: number
  createdAt?: string
  snipersCount?: number
  bundlersCount?: number
  insidersCount?: number
  liquidityDeltaPct?: number
  priceChange1m?: number
  volume1m?: number
  buyers1m?: number
  proTradersCount?: number
  smartTradersCount?: number
  freshTradersCount?: number
  tradeDecision?: "BUY" | "WATCH" | "SKIP"
  exchangeName?: string
  exchangeLogo?: string
  adType?: string
  adImpressions?: number
  adDurationHours?: number
}

type TokenRowRuntime = TokenRow & RuntimeTokenExtensions

const clampNumber = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const pickNumber = (obj: any, keys: string[]) => {
  for (const key of keys) {
    const value = obj?.[key]
    if (typeof value === "number" && Number.isFinite(value)) return value
  }
  return undefined
}

const pickString = (obj: any, keys: string[]) => {
  for (const key of keys) {
    const value = obj?.[key]
    if (typeof value === "string" && value.length > 0) return value
  }
  return undefined
}

const parseBoostAmount = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const match = value.match(/[\d.]+/)
    if (!match) return undefined
    const parsed = Number.parseFloat(match[0])
    return Number.isFinite(parsed) ? parsed : undefined
  }
  return undefined
}

const parseClaimDate = (value: unknown) => {
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

const normalizeLaunchpadIconKeyFromSource = (source?: string) => {
  if (!source) return undefined
  const normalized = source.toLowerCase()
  if (normalized === "raydium-launchlab") return "raydium"
  if (normalized === "meteora-dyn2") return "meteora"
  return normalized
}

const normalizePct = (value?: number) => {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined
  // Accept either 0..1 ratio or 0..100 percent.
  const pct = value <= 1 ? value * 100 : value
  return clampNumber(pct, 0, 100)
}

const getConfidenceColorClass = (score: number) => {
  if (score <= 40) return "bg-red-500"
  if (score <= 70) return "bg-yellow-500"
  return "bg-green-500"
}

const getRiskBadgeClass = (risk?: TokenRowRuntime["riskLevel"]) => {
  if (risk === "HIGH") return "bg-amber-500/20 text-amber-600 border-amber-500/30"
  if (risk === "MEDIUM") return "bg-yellow-500/15 text-yellow-600 border-yellow-500/30"
  return "bg-green-500/15 text-green-600 border-green-500/30"
}

const getMomentumBadgeClass = (m?: TokenRowRuntime["momentumState"]) => {
  if (m === "ACCELERATING") return "bg-green-500/15 text-green-600 border-green-500/30"
  if (m === "COOLING") return "bg-muted/40 text-muted-foreground border-border"
  return "bg-secondary/40 text-foreground/70 border-border"
}

function ConfidenceBar({ score }: { score: number }) {
  const clamped = clampNumber(score, 0, 100)
  const color = getConfidenceColorClass(clamped)
  return (
    <div
      className="h-1.5 w-10 sm:w-12 rounded-full bg-secondary/60 overflow-hidden"
      title={`Confidence: ${clamped}/100`}
      aria-label={`Confidence score ${clamped} out of 100`}
      role="img"
    >
      <div className={`h-full ${color}`} style={{ width: `${clamped}%` }} />
    </div>
  )
}

function MiniBar({ value, title }: { value: number; title: string }) {
  const clamped = clampNumber(value, 0, 100)
  const color = getConfidenceColorClass(clamped)
  return (
    <div className="flex items-center gap-2" title={title} aria-label={title}>
      <div className="h-1.5 w-16 rounded-full bg-secondary/60 overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${clamped}%` }} />
      </div>
      <span className="text-[9px] sm:text-[10px] text-muted-foreground tabular-nums">{Math.round(clamped)}%</span>
    </div>
  )
}

const getDecisionClass = (decision?: TokenRowRuntime["tradeDecision"]) => {
  if (decision === "BUY") return "bg-green-500/15 text-green-600 border-green-500/30"
  if (decision === "WATCH") return "bg-yellow-500/15 text-yellow-600 border-yellow-500/30"
  return "bg-red-500/15 text-red-600 border-red-500/30"
}

const getSpikeBadgeClass = (probability: number) => {
  if (probability < 40) return "bg-red-500/15 text-red-600 border-red-500/30"
  if (probability < 60) return "bg-yellow-500/15 text-yellow-600 border-yellow-500/30"
  if (probability <= 80) return "bg-green-500/15 text-green-600 border-green-500/30"
  return "bg-amber-500/20 text-amber-600 border-amber-500/30"
}

const getSpikeBand = (probability: number) => {
  if (probability < 40) return { label: "Random / dead", tone: "text-red-600" }
  if (probability < 60) return { label: "Speculative", tone: "text-yellow-600" }
  if (probability <= 80) return { label: "High-probability momentum", tone: "text-green-600" }
  return { label: "Overheated / dump risk", tone: "text-amber-600" }
}

const computeSpikeProbabilityProxy = (
  token: Pick<
    TokenRowRuntime,
    | "change5m"
    | "priceChange1m"
    | "change15m"
    | "volume1m"
    | "volume5m"
    | "volume15m"
    | "volume24h"
    | "liquidity"
    | "mc"
    | "buyCount"
    | "sellCount"
    | "createdAt"
    | "updatedAt"
  >,
) => {
  const mc = token.mc ?? 0
  const liq = token.liquidity ?? 0

  const change1m = token.priceChange1m
  const shortChange = (typeof change1m === "number" && Number.isFinite(change1m) ? change1m : token.change5m) ?? 0
  const change15m = token.change15m

  const shortDivisor = typeof change1m === "number" && Number.isFinite(change1m) ? 10 : 30
  const priceMomentumBase = clampNumber(shortChange / shortDivisor, 0, 1)
  const priceMomentum =
    typeof change15m === "number" && Number.isFinite(change15m)
      ? clampNumber(0.7 * priceMomentumBase + 0.3 * clampNumber(change15m / 50, 0, 1), 0, 1)
      : priceMomentumBase

  const volume5m =
    token.volume5m ?? (typeof token.volume1m === "number" && Number.isFinite(token.volume1m) ? token.volume1m * 5 : undefined)
  const volume15m =
    token.volume15m ??
    (typeof token.volume1m === "number" && Number.isFinite(token.volume1m) ? token.volume1m * 15 : undefined)

  const avgVolume30m = (() => {
    if (typeof volume15m === "number" && volume15m > 0) return volume15m * 2
    if (typeof volume5m === "number" && volume5m > 0) return volume5m * 6
    const vol24h = token.volume24h
    if (typeof vol24h === "number" && vol24h > 0) return vol24h / 48 // 30m buckets in 24h
    return undefined
  })()

  const volumeAcceleration =
    typeof volume5m === "number" && typeof avgVolume30m === "number" && avgVolume30m > 0
      ? clampNumber(volume5m / avgVolume30m, 0, 3) / 3
      : 0

  const liquidityRatio = mc > 0 && liq > 0 ? clampNumber(liq / mc, 0, 1) : 0

  const marketCapBias = (() => {
    if (mc <= 0) return 0.6
    if (mc <= 1_000_000) return 1
    if (mc <= 5_000_000) return 0.8
    if (mc <= 20_000_000) return 0.6
    return 0.4
  })()

  const ageMinutes = (() => {
    const iso = token.createdAt ?? token.updatedAt
    if (!iso) return undefined
    const ms = Date.parse(iso)
    if (!Number.isFinite(ms)) return undefined
    return (Date.now() - ms) / 60000
  })()
  const recencyFactor = typeof ageMinutes === "number" ? (ageMinutes < 60 ? 1 : ageMinutes < 360 ? 0.8 : 0.6) : 0.7

  // Optional extras: buy/sell ratio, tx velocity proxies.
  const buySellFactor = (() => {
    if (typeof token.buyCount === "number" && typeof token.sellCount === "number") {
      const ratio = token.buyCount / Math.max(token.sellCount, 1)
      return clampNumber((ratio - 1) / 4, 0, 0.15) // up to +0.15
    }
    return 0
  })()

  const baseScore =
    0.35 * priceMomentum + 0.25 * volumeAcceleration + 0.2 * liquidityRatio + 0.1 * marketCapBias + 0.1 * recencyFactor
  const score = clampNumber(baseScore + buySellFactor, 0, 1)
  return clampNumber(score * 100, 0, 100)
}

const classifyMomentumRadar = (token: Pick<TokenRowRuntime, "priceChange1m" | "volume1m" | "buyers1m" | "change5m">) => {
  const pc1m = token.priceChange1m
  const v1m = token.volume1m
  const b1m = token.buyers1m

  if (typeof pc1m === "number" && typeof v1m === "number" && typeof b1m === "number") {
    const isHot = pc1m >= 0.8 && b1m >= 3 && v1m >= 5_000
    const isCooling = pc1m <= -0.4 || b1m === 0
    if (isHot) return "ACCELERATING" as const
    if (isCooling) return "COOLING" as const
    return "STABLE" as const
  }

  // Fallback
  if ((token.change5m ?? 0) >= 8) return "ACCELERATING" as const
  if ((token.change5m ?? 0) <= -5) return "COOLING" as const
  return "STABLE" as const
}

const decideTradeAction = (token: Pick<TokenRowRuntime, "confidenceScore" | "riskLevel" | "momentumState">) => {
  const score = token.confidenceScore ?? 0
  const risk = token.riskLevel
  const mom = token.momentumState

  if (score >= 70 && risk !== "HIGH" && mom === "ACCELERATING") return "BUY" as const
  if (score >= 55 && risk !== "HIGH") return "WATCH" as const
  return "SKIP" as const
}

const classifyTradeModeFit = (token: Pick<TokenRowRuntime, "mc" | "volume24h" | "liquidity" | "priceChange24h" | "updatedAt">) => {
  const mc = token.mc ?? 0
  const vol = token.volume24h ?? 0
  const liq = token.liquidity ?? 0
  const change24h = token.priceChange24h ?? 0
  const volatility = Math.abs(change24h)
  const createdOrUpdatedMs = Number.isFinite(Date.parse(token.updatedAt)) ? Date.parse(token.updatedAt) : Date.now()
  const ageMinutes = (Date.now() - createdOrUpdatedMs) / 60000
  const isVeryEarly = ageMinutes >= 0 && ageMinutes <= 90
  const buyPressure = change24h > 3 && mc > 0 && vol / mc > 0.5

  if (mc > 0 && mc < 50_000 && isVeryEarly && buyPressure) return "SNIPER" as const
  if ((vol >= 750_000 || vol / Math.max(mc, 1) > 2) && volatility >= 15) return "SCALPER" as const
  if (mc >= 1_000_000 && liq >= 50_000 && volatility <= 10 && vol >= 100_000) return "SWING" as const
  if (mc > 0 && mc < 200_000 && volatility >= 20) return "SCALPER" as const
  return "SWING" as const
}

const classifyRiskLevel = (token: Pick<TokenRowRuntime, "mc" | "liquidity" | "priceChange24h" | "top10HoldingsPct" | "devHoldingsPct" | "snipersCount" | "insidersCount" | "bundlersCount">) => {
  const mc = token.mc ?? 0
  const liq = token.liquidity ?? 0
  const volatility = Math.abs(token.priceChange24h ?? 0)
  const top10 = token.top10HoldingsPct
  const devPct = token.devHoldingsPct
  const snipers = token.snipersCount
  const insiders = token.insidersCount
  const bundlers = token.bundlersCount

  if ((typeof snipers === "number" && snipers > 0) || (typeof insiders === "number" && insiders > 0) || (typeof bundlers === "number" && bundlers > 0)) {
    return "HIGH" as const
  }

  if (typeof top10 === "number" && top10 >= 25) return "HIGH" as const
  if (typeof devPct === "number" && devPct >= 15) return "HIGH" as const

  if (mc > 0 && mc < 100_000) return "HIGH" as const
  if (liq > 0 && liq < 50_000) return "HIGH" as const
  if (volatility >= 50) return "HIGH" as const
  if (mc > 0 && mc < 1_000_000) return "MEDIUM" as const
  if (volatility >= 20) return "MEDIUM" as const
  return "LOW" as const
}

const classifyMomentumState = (token: Pick<TokenRowRuntime, "change5m" | "change1h" | "priceChange24h" | "priceChange1m">) => {
  const cShort = typeof token.priceChange1m === "number" ? token.priceChange1m : (token.change5m ?? 0)
  const c1h = token.change1h ?? 0
  const c24 = token.priceChange24h ?? 0

  const isUsing1m = typeof token.priceChange1m === "number"
  const accelThresh = isUsing1m ? 1.2 : 8
  const coolThresh = isUsing1m ? -0.8 : -5
  const relativeDivisor = isUsing1m ? 60 : 12

  if (cShort >= accelThresh || (cShort > 0 && c1h > 0 && c24 > 0 && cShort > c1h / relativeDivisor)) return "ACCELERATING" as const
  if (cShort <= coolThresh || (cShort < 0 && c1h < 0)) return "COOLING" as const
  return "STABLE" as const
}

const computeConfidenceScore = (
  raw: any,
  mapped: Pick<
    TokenRowRuntime,
    | "mc"
    | "volume24h"
    | "priceChange24h"
    | "liquidity"
    | "updatedAt"
    | "buyCount"
    | "sellCount"
    | "organicPct"
    | "devHoldingsPct"
    | "top10HoldingsPct"
    | "snipersCount"
    | "bundlersCount"
    | "insidersCount"
  >,
) => {
  let score = 50

  const mc = mapped.mc ?? 0
  const vol24h = mapped.volume24h ?? 0
  const change24h = mapped.priceChange24h ?? 0
  const liq = mapped.liquidity ?? 0

  // Buy/Sell ratio
  if (typeof mapped.buyCount === "number" && typeof mapped.sellCount === "number") {
    const ratio = mapped.buyCount / Math.max(mapped.sellCount, 1)
    if (ratio >= 3) score += 10
    else if (ratio >= 1.5) score += 5
    else if (ratio < 0.8) score -= 5
  }

  const buyPressure = change24h > 0 && mc > 0 && vol24h / mc > 0.5
  if (buyPressure) score += 10

  // Organic %
  const organicPct = mapped.organicPct ?? normalizePct(
    raw?.organic_volume_ratio ?? raw?.organicVolumeRatio ?? raw?.organic_volume_percent ?? raw?.organicVolumePercent,
  )
  if (typeof organicPct === "number") {
    if (organicPct >= 70) score += 10
    else if (organicPct >= 50) score += 5
    else if (organicPct < 30) score -= 5
  }

  // Dev holdings %
  const devHoldingsPct = mapped.devHoldingsPct ?? normalizePct(raw?.dev_holdings_pct ?? raw?.devHoldingsPct ?? raw?.dev_holding_percent)
  if (typeof devHoldingsPct === "number") {
    if (devHoldingsPct <= 5) score += 10
    else if (devHoldingsPct <= 10) score += 5
    else if (devHoldingsPct >= 15) score -= 5
  }

  // No insiders/snipers/bundlers
  if (typeof mapped.snipersCount === "number") score += mapped.snipersCount === 0 ? 5 : -8
  if (typeof mapped.bundlersCount === "number") score += mapped.bundlersCount === 0 ? 5 : -6
  if (typeof mapped.insidersCount === "number") score += mapped.insidersCount === 0 ? 5 : -8

  // Liquidity / MC ratio
  if (mc > 0 && liq > 0) {
    const liqRatio = liq / mc
    if (liqRatio >= 0.2) score += 10
    else if (liqRatio >= 0.1) score += 5
    else if (liqRatio < 0.03) score -= 5
  }

  const holders = raw?.holders ?? raw?.holders_count ?? raw?.holderCount
  if (typeof holders === "number" && holders > 0 && holders <= 500) score += 5

  // Top holder concentration (Top10)
  const whalePct =
    mapped.top10HoldingsPct ??
    normalizePct(
      raw?.top10Holdings ??
        raw?.top10_holdings ??
        raw?.top10_holdings_pct ??
        raw?.top10HoldingsPct ??
        raw?.top_holders_pct ??
        raw?.topHoldersPct ??
        raw?.top_holder_pct,
    )
  if (typeof whalePct === "number") {
    if (whalePct >= 25) score -= 10
    else if (whalePct >= 15) score -= 5
  }

  // Only penalize "no socials" when socials fields are present but empty.
  const socials = raw?.socials
  const socialsFieldsPresent =
    raw != null &&
    ("socials" in (raw as object) || "twitter" in (raw as object) || "telegram" in (raw as object) || "website" in (raw as object))
  if (socialsFieldsPresent) {
    const hasSocials =
      Boolean(raw?.twitter || raw?.telegram || raw?.website) ||
      Boolean(socials?.twitter || socials?.telegram || socials?.website || socials?.discord)
    if (!hasSocials) score -= 3
  }

  return clampNumber(score, 0, 100)
}

const extendTokenRowRuntime = (token: TokenRow): TokenRowRuntime => {
  const priceChange24h = typeof (token as any).priceChange24h === "number" ? (token as any).priceChange24h : token.change1h
  const base: TokenRowRuntime = {
    ...(token as TokenRowRuntime),
    priceChange24h,
  }
  const confidenceScore = computeConfidenceScore(undefined, base)
  const momentumState = classifyMomentumState(base)
  const riskLevel = classifyRiskLevel(base)
  const tradeModeFit = classifyTradeModeFit(base)
  return {
    ...base,
    confidenceScore,
    momentumState,
    riskLevel,
    tradeModeFit,
  }
}

const mapMobulaPulseItemToTokenRow = (item: any, launchpadFilter: string, requestedPoolTypes?: string): TokenRowRuntime | null => {
  const address: string | undefined =
    item?.address ?? item?.contract_address ?? item?.contractAddress ?? item?.token_address ?? item?.tokenAddress
  if (!address || typeof address !== "string") return null

  // Prefer the poolTypes we requested (when filtering by a specific launchpad),
  // because Mobula's returned `source` can be generic and not match the filter.
  const source =
    (requestedPoolTypes && requestedPoolTypes !== "all" ? requestedPoolTypes : undefined) ??
    pickString(item, [
      "source",
      "poolType",
      "pool_type",
      "poolTypes",
      "pool_types",
      "dex",
      "dexName",
      "dex_name",
    ])

  const price = item?.price ?? 0
  const mc = item?.marketCap ?? item?.latest_market_cap ?? 0
  const volume24h = item?.volume_24h ?? (typeof item?.volume_1h === "number" ? item.volume_1h * 24 : 0)
  const priceChange24h = item?.price_change_24h ?? item?.price_change_1h ?? 0
  const updatedAt = item?.latest_trade_date ?? item?.createdAt ?? new Date().toISOString()
  const liquidity = item?.liquidity ?? item?.liquidity_usd ?? item?.liquidityUSD ?? 0

  const change1h = item?.price_change_1h ?? 0
  const change5m = item?.price_change_5m ?? item?.price_change_5min ?? item?.price_change_1h ?? 0
  const change15m =
    pickNumber(item, ["price_change_15m", "price_change_15min", "price_change_15", "priceChange15m", "priceChange15Min"]) ??
    undefined

  const volume5m = pickNumber(item, ["volume_5m", "volume_5min", "volume5m", "volume5Min"])
  const volume15m = pickNumber(item, ["volume_15m", "volume_15min", "volume15m", "volume15Min"])

  const name = item?.name ?? item?.token_name ?? item?.tokenName ?? "Unknown"
  const symbol = item?.symbol ?? item?.token_symbol ?? item?.tokenSymbol ?? "???"
  const logo = item?.logo ?? item?.image ?? item?.logo_url ?? item?.logoUrl ?? "/placeholder.svg"

  const signals: SignalType[] = []
  if (typeof priceChange24h === "number" && priceChange24h > 0) signals.push("PRICE_UP")
  if (typeof mc === "number" && mc >= 1_000_000) signals.push("KEY_MC")

  const buyCount = pickNumber(item, [
    "buys_1min",
    "buys_1m",
    "buys_5min",
    "buys_5m",
    "buys_1h",
    "buys_24h",
    "buys",
    "buy_count",
    "buyCount",
    "buy_count_5m",
    "buy_count_1h",
    "buyers_1min",
    "buyers_5min",
    "buyers",
  ])
  const sellCount = pickNumber(item, [
    "sells_1min",
    "sells_1m",
    "sells_5min",
    "sells_5m",
    "sells_1h",
    "sells_24h",
    "sells",
    "sell_count",
    "sellCount",
    "sell_count_5m",
    "sell_count_1h",
    "sellers_1min",
    "sellers_5min",
    "sellers",
  ])

  const derivedOrganicPct = (() => {
    const volumePairs: Array<[string, string]> = [
      ["organic_volume_1min", "volume_1min"],
      ["organic_volume_5min", "volume_5min"],
      ["organic_volume_24h", "volume_24h"],
      ["organic_volume_1h", "volume_1h"],
    ]
    for (const [organicKey, totalKey] of volumePairs) {
      const organic = pickNumber(item, [organicKey])
      const total = pickNumber(item, [totalKey])
      if (typeof organic === "number" && typeof total === "number" && total > 0) {
        return clampNumber((organic / total) * 100, 0, 100)
      }
    }

    const tradePairs: Array<[string, string]> = [
      ["organic_trades_1min", "trades_1min"],
      ["organic_trades_5min", "trades_5min"],
      ["organic_trades_24h", "trades_24h"],
      ["organic_trades_1h", "trades_1h"],
    ]
    for (const [organicKey, totalKey] of tradePairs) {
      const organic = pickNumber(item, [organicKey])
      const total = pickNumber(item, [totalKey])
      if (typeof organic === "number" && typeof total === "number" && total > 0) {
        return clampNumber((organic / total) * 100, 0, 100)
      }
    }
    return undefined
  })()

  const organicPct =
    derivedOrganicPct ??
    normalizePct(
      pickNumber(item, [
        "organicPct",
        "organic_pct",
        "organic_volume_ratio",
        "organicVolumeRatio",
        "organic_volume_percent",
        "organicVolumePercent",
      ]),
    )
  const top10HoldingsPct = normalizePct(
    pickNumber(item, [
      "top10Holdings",
      "top10HoldingsPercentage",
      "top10_holdings",
      "top10_holdings_pct",
      "top10HoldingsPct",
      "top_holders_pct",
      "topHoldersPct",
      "top_holder_pct",
    ]),
  )
  const devHoldingsPct = normalizePct(
    pickNumber(item, [
      "devHoldings",
      "devHoldingsPercentage",
      "devHoldingsPct",
      "dev_holdings_pct",
      "dev_holding_percent",
    ]),
  )

  const bondingPct = (() => {
    const raw = pickNumber(item, [
      "bondingPercentage",
      "bonding_percentage",
      "bondingPct",
      "bonding_pct",
      "bonding_progress",
      "bondingProgress",
      "bonding_curve_progress",
      "bondingCurveProgress",
      "bonded_percentage",
      "bondedPercentage",
    ])
    return normalizePct(raw)
  })()

  const createdAt = pickString(item, ["createdAt", "created_at", "creation_date", "token_created_at", "launch_date"])

  const snipersCount = pickNumber(item, ["snipersCount", "snipers_count", "snipers"])
  const bundlersCount = pickNumber(item, ["bundlersCount", "bundlers_count", "bundlers"])
  const insidersCount = pickNumber(item, ["insidersCount", "insiders_count", "insiders"])

  const liquidityDeltaPct = normalizePct(
    pickNumber(item, ["liquidity_delta_pct", "liquidityDeltaPct", "liquidity_change_pct", "liquidity_change_24h"]),
  )

  const priceChange1m = pickNumber(item, ["price_change_1min", "price_change_1m", "priceChange1m", "priceChange1Min"])
  const volume1m = pickNumber(item, ["volume_1min", "volume_1m", "volume1m", "volume1Min"])
  const buyers1m = pickNumber(item, ["buyers_1min", "buyers_1m", "buyers1m", "buyers1Min"])

  const proTradersCount = pickNumber(item, ["proTradersCount", "pro_traders_count", "proTraders"])
  const smartTradersCount = pickNumber(item, ["smartTradersCount", "smart_traders_count", "smartTraders"])
  const freshTradersCount = pickNumber(item, ["freshTradersCount", "fresh_traders_count", "freshTraders"])

  const mappedBase: TokenRowRuntime = {
    address,
    name,
    symbol,
    logo,
    source,
    price: typeof price === "number" ? price : 0,
    // For New Coins, treat the short-term column as 1m (fallback to 5m when 1m unavailable)
    change5m: typeof priceChange1m === "number" ? priceChange1m : typeof change5m === "number" ? change5m : 0,
    priceChange5m: typeof change5m === "number" ? change5m : undefined,
    change1h: typeof change1h === "number" ? change1h : 0,
    mc: typeof mc === "number" ? mc : 0,
    liquidity: typeof liquidity === "number" ? liquidity : 0,
    volume24h: typeof volume24h === "number" ? volume24h : 0,
    updatedAt: typeof updatedAt === "string" ? updatedAt : new Date().toISOString(),
    signals,
    launchpad: normalizeLaunchpadIconKeyFromSource(source) ?? launchpadFilter,
    priceChange24h: typeof priceChange24h === "number" ? priceChange24h : 0,
    change15m: typeof change15m === "number" ? change15m : undefined,
    volume5m: typeof volume5m === "number" ? volume5m : undefined,
    volume15m: typeof volume15m === "number" ? volume15m : undefined,
    buyCount,
    sellCount,
    organicPct,
    top10HoldingsPct,
    devHoldingsPct,
    bondingPct,
    createdAt,
    snipersCount,
    bundlersCount,
    insidersCount,
    liquidityDeltaPct,
    priceChange1m,
    volume1m,
    buyers1m,
    proTradersCount,
    smartTradersCount,
    freshTradersCount,
  }

  const momentumState = classifyMomentumRadar(mappedBase)
  const confidenceScore = computeConfidenceScore(item, mappedBase)
  const riskLevel = classifyRiskLevel(mappedBase)
  const tradeModeFit = classifyTradeModeFit(mappedBase)
  const tradeDecision = decideTradeAction({ confidenceScore, riskLevel, momentumState })
  const spikeProbability = computeSpikeProbabilityProxy(mappedBase)

  return {
    ...mappedBase,
    confidenceScore,
    momentumState,
    riskLevel,
    tradeModeFit,
    tradeDecision,
    spikeProbability,
  }
}

const mapMobulaDetailsToTokenRow = (address: string, header: string | undefined, mobulaJson: any): TokenRowRuntime => {
  const data = mobulaJson?.data?.data ?? mobulaJson?.data ?? mobulaJson ?? {}

  const name =
    data?.name ??
    data?.tokenName ??
    data?.token_name ??
    data?.symbol ??
    "Unknown"
  const symbol = data?.symbol ?? data?.token_symbol ?? data?.tokenSymbol ?? "???"
  const logo = data?.logo ?? data?.image ?? data?.logo_url ?? data?.logoUrl ?? header ?? "/placeholder.svg"

  const price = typeof data?.price === "number" ? data.price : Number(data?.price ?? 0)
  const mc = typeof data?.marketCapUSD === "number" ? data.marketCapUSD : Number(data?.marketCap ?? data?.market_cap ?? 0)
  const liquidity =
    typeof data?.liquidityUSD === "number" ? data.liquidityUSD : Number(data?.liquidity ?? data?.liquidity_usd ?? 0)
  const volume24h =
    typeof data?.volume24hUSD === "number" ? data.volume24hUSD : Number(data?.volume_24h_usd ?? data?.volume24h ?? 0)

  const change1h = Number(data?.priceChange1h ?? data?.price_change_1h ?? 0)
  const change5m = Number(data?.priceChange5m ?? data?.price_change_5m ?? data?.price_change_5min ?? 0)
  const priceChange24h = Number(data?.priceChange24h ?? data?.price_change_24h ?? 0)

  const updatedAt =
    typeof data?.updatedAt === "string"
      ? data.updatedAt
      : typeof data?.lastUpdate === "string"
        ? data.lastUpdate
        : new Date().toISOString()

  const signals: SignalType[] = []

  const top10HoldingsPct = normalizePct(
    pickNumber(data, [
      "top10HoldingsPercentage",
      "top10HoldingsPct",
      "top10_holdings_pct",
      "top10_holdings",
      "topHoldersPct",
    ]),
  )
  const devHoldingsPct = normalizePct(
    pickNumber(data, [
      "devHoldingsPercentage",
      "devHoldingsPct",
      "dev_holdings_pct",
      "dev_holding_percent",
    ]),
  )
  const bondedFlag = Boolean(data?.bonded ?? data?.isBonded ?? data?.bonding_completed)
  const bondingPct = bondedFlag
    ? 100
    : normalizePct(
        pickNumber(data, [
          "bondingPercentage",
          "bonding_percentage",
          "bondingPct",
          "bonding_pct",
          "bondingProgress",
          "bonding_progress",
        ]),
      )

  const mappedBase: TokenRowRuntime = {
    address,
    name,
    symbol,
    logo,
    price: Number.isFinite(price) ? price : 0,
    change5m: Number.isFinite(change5m) ? change5m : 0,
    change1h: Number.isFinite(change1h) ? change1h : 0,
    mc: Number.isFinite(mc) ? mc : 0,
    liquidity: Number.isFinite(liquidity) ? liquidity : 0,
    volume24h: Number.isFinite(volume24h) ? volume24h : 0,
    updatedAt,
    signals,
    priceChange24h: Number.isFinite(priceChange24h) ? priceChange24h : 0,
    top10HoldingsPct,
    devHoldingsPct,
    bondingPct,
  }

  const confidenceScore = computeConfidenceScore(data, mappedBase)
  const momentumState = classifyMomentumState(mappedBase)
  const riskLevel = classifyRiskLevel(mappedBase)
  const tradeModeFit = classifyTradeModeFit(mappedBase)
  const tradeDecision = decideTradeAction({ confidenceScore, riskLevel, momentumState })
  const spikeProbability = computeSpikeProbabilityProxy(mappedBase)

  return {
    ...mappedBase,
    confidenceScore,
    momentumState,
    riskLevel,
    tradeModeFit,
    tradeDecision,
    spikeProbability,
  }
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
  const [boostRefreshTick, setBoostRefreshTick] = useState(0)
  const [activePreset, setActivePreset] = useState<PresetKey | undefined>(undefined)
  const [mobulaTokens, setMobulaTokens] = useState<TokenRowRuntime[]>([])
  const [mobulaRateLimited, setMobulaRateLimited] = useState(false)
  const [mobulaFetchStatus, setMobulaFetchStatus] = useState<"idle" | "loading" | "ready" | "error" | "rate_limited">("idle")
  const [mobulaLastMappedCount, setMobulaLastMappedCount] = useState<number | null>(null)
  const [mobulaRefreshTick, setMobulaRefreshTick] = useState(0)
  const [boostTokens, setBoostTokens] = useState<TokenRowRuntime[]>([])
  const [boostLoading, setBoostLoading] = useState(false)
  const [boostError, setBoostError] = useState<string | null>(null)
  const [adsTokens, setAdsTokens] = useState<TokenRowRuntime[]>([])
  const [adsLoading, setAdsLoading] = useState(false)
  const [adsError, setAdsError] = useState<string | null>(null)
  const [dexPaidTokens, setDexPaidTokens] = useState<TokenRowRuntime[]>([])
  const [dexPaidLoading, setDexPaidLoading] = useState(false)
  const [dexPaidError, setDexPaidError] = useState<string | null>(null)
  const [newTabHiddenDetails, setNewTabHiddenDetails] = useState<Record<string, boolean>>({})
  const [newTabDetailsDrawerToken, setNewTabDetailsDrawerToken] = useState<TokenRowRuntime | null>(null)
  const mobulaIntervalRef = useRef<number | null>(null)
  const mobulaInitialLoadedRef = useRef(false)
  const [ctoTokens, setCtoTokens] = useState<TokenRowRuntime[]>([])
  const [loadingCTO, setLoadingCTO] = useState(false)
  const [ctoRateLimited, setCtoRateLimited] = useState(false)
  const [showPrelaunchForm, setShowPrelaunchForm] = useState(false)
  const [snipeNotice, setSnipeNotice] = useState<string | null>(null)
  const [snipeDialogOpen, setSnipeDialogOpen] = useState(false)
  const [prelaunchForm, setPrelaunchForm] = useState({
    tokenName: "",
    tokenSymbol: "",
    devName: "",
    devWallet: "",
    description: "",
    launchDate: "",
  })

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

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("prelaunch-tracking", JSON.stringify(trackingData))
    }
  }, [trackingData])

  useEffect(() => {
    if (activeTab !== "cto") return
    let aborted = false

    const fetchCTO = async () => {
      try {
        setLoadingCTO(true)
        setCtoRateLimited(false)
        setCtoTokens([])

        const res = await fetch("/api/cto-tokens")
        if (!res.ok) {
          if (res.status === 429) setCtoRateLimited(true)
          throw new Error(`CTO fetch failed: ${res.status}`)
        }
        const json = await res.json().catch(() => null)
        const items: any[] = Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : []

        const candidates = items
          .map((item) => ({
            tokenAddress: item?.tokenAddress ?? item?.token_address,
            header: item?.header ?? item?.icon ?? item?.image,
            claimDate: parseClaimDate(
              pickString(item, ["claimDate", "claim_date", "claimedAt", "claimed_at"]) ?? item?.claimDate,
            ),
            name: pickString(item, ["name", "tokenName", "token_name"]),
            symbol: pickString(item, ["symbol", "tokenSymbol", "token_symbol"]),
            logo: item?.icon ?? item?.header ?? item?.image,
            price: item?.priceUsd ?? item?.price_usd,
            mc: item?.marketCap ?? item?.market_cap,
            liquidity: item?.liquidity,
            volume24h: item?.volume24h ?? item?.volume_24h,
            change5m: item?.priceChange5m ?? item?.price_change_5m,
            change1h: item?.priceChange1h ?? item?.price_change_1h,
            exchangeName: pickString(item?.exchange, ["name"]),
            exchangeLogo: pickString(item?.exchange, ["logo"]),
          }))
          .filter((it) => typeof it.tokenAddress === "string" && it.tokenAddress.length > 0)
          .slice(0, 50)

        const results = await Promise.allSettled(
          candidates.map(async (candidate) => {
            try {
              const mobulaRes = await fetch(`/api/mobula-token-details/${candidate.tokenAddress}`)
              if (!mobulaRes.ok) throw new Error(`Mobula details failed: ${mobulaRes.status}`)
              const mobulaJson = await mobulaRes.json()
              const mapped = mapMobulaDetailsToTokenRow(candidate.tokenAddress, candidate.header, mobulaJson)
              const withSignals = { ...mapped, signals: ["CTO"] as SignalType[] }

              const mobulaData = mobulaJson?.data?.data ?? mobulaJson?.data ?? mobulaJson ?? {}
              const exchangeName = pickString(mobulaData?.exchange, ["name"])
              const exchangeLogo = pickString(mobulaData?.exchange, ["logo"])
              const withExchange =
                exchangeName || exchangeLogo
                  ? { ...withSignals, exchangeName, exchangeLogo }
                  : withSignals

              return candidate.claimDate
                ? { ...withExchange, updatedAt: candidate.claimDate }
                : withExchange
            } catch {
              const fallback: TokenRowRuntime = {
                address: candidate.tokenAddress,
                name: candidate.name ?? "Unknown",
                symbol: candidate.symbol ?? candidate.tokenAddress.slice(0, 6).toUpperCase(),
                logo: candidate.logo ?? candidate.header ?? "/placeholder.svg",
                price: Number(candidate.price ?? 0),
                change5m: Number(candidate.change5m ?? 0),
                change1h: Number(candidate.change1h ?? 0),
                mc: Number(candidate.mc ?? 0),
                liquidity: Number(candidate.liquidity ?? 0),
                volume24h: Number(candidate.volume24h ?? 0),
                updatedAt: candidate.claimDate ?? new Date().toISOString(),
                signals: ["CTO"],
                exchangeName: candidate.exchangeName,
                exchangeLogo: candidate.exchangeLogo,
              }
              return fallback
            }
          }),
        )

        if (aborted) return

        const mapped = results
          .filter((r): r is PromiseFulfilledResult<TokenRowRuntime> => r.status === "fulfilled")
          .map((r) => r.value)

        setCtoTokens(mapped)
      } catch (error) {
        if (!aborted) {
          console.error("[v0] Error loading CTO tokens:", error)
          setCtoTokens([])
        }
      } finally {
        if (!aborted) setLoadingCTO(false)
      }
    }

    fetchCTO()

    return () => {
      aborted = true
    }
  }, [activeTab])

  useEffect(() => {
    if (activeTab !== "new") {
      if (mobulaIntervalRef.current) {
        window.clearInterval(mobulaIntervalRef.current)
        mobulaIntervalRef.current = null
      }
      setMobulaFetchStatus("idle")
      setMobulaLastMappedCount(null)
      setMobulaTokens([])
      return
    }

    const fetchMobulaPulse = async (isInitial: boolean) => {
      try {
        if (isInitial) {
          setMobulaFetchStatus("loading")
          setMobulaLastMappedCount(null)
        }

        const params = new URLSearchParams({
          assetMode: "true",
          chainId: "solana:solana",
        })

        let requestedPoolTypes: string | undefined = undefined

        if (launchpadFilter !== "all") {
          const poolTypes =
            launchpadFilter === "meteora"
              ? "meteora-dyn2"
              : launchpadFilter === "raydium"
                ? "raydium-launchlab"
                : launchpadFilter
          params.set("poolTypes", poolTypes)
          requestedPoolTypes = poolTypes
        }
        const url = `/api/mobula-pulse?${params.toString()}`
        const res = await fetch(url, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        })

        const json = await res.json().catch(() => null)

        if (!res.ok) {
          if (res.status === 429 || json?.statusCode === 429) {
            setMobulaRateLimited(true)
            if (isInitial) setMobulaFetchStatus("rate_limited")
          } else {
            if (isInitial) setMobulaFetchStatus("error")
          }
          return
        }

        if (json?.statusCode === 429) {
          setMobulaRateLimited(true)
          if (isInitial) setMobulaFetchStatus("rate_limited")
          return
        }

        setMobulaRateLimited(false)
        const items: any[] =
          (Array.isArray(json?.new?.data) ? json.new.data : null) ??
          (Array.isArray(json) ? json : null) ??
          (Array.isArray(json?.data) ? json.data : null) ??
          (Array.isArray(json?.data?.assets) ? json.data.assets : null) ??
          (Array.isArray(json?.data?.result) ? json.data.result : null) ??
          (Array.isArray(json?.result) ? json.result : [])

        if (!Array.isArray(items)) {
          if (isInitial) setMobulaFetchStatus("error")
          return
        }

        const mapped = items
          .map((it) => mapMobulaPulseItemToTokenRow(it, launchpadFilter, requestedPoolTypes))
          .filter(Boolean) as TokenRowRuntime[]

        if (isInitial) {
          setMobulaFetchStatus("ready")
          setMobulaLastMappedCount(mapped.length)
        }

        if (mapped.length > 0) {
          setMobulaTokens(mapped)
          mobulaInitialLoadedRef.current = true
        } else if (isInitial && !mobulaInitialLoadedRef.current) {
          setMobulaTokens([])
        }
      } catch {
        // no-op (defensive)
        if (isInitial) setMobulaFetchStatus("error")
      }
    }

    if (mobulaIntervalRef.current) {
      window.clearInterval(mobulaIntervalRef.current)
      mobulaIntervalRef.current = null
    }

    fetchMobulaPulse(true)
    mobulaIntervalRef.current = window.setInterval(() => {
      fetchMobulaPulse(false)
    }, 10000)

    return () => {
      if (mobulaIntervalRef.current) {
        window.clearInterval(mobulaIntervalRef.current)
        mobulaIntervalRef.current = null
      }
    }
  }, [activeTab, launchpadFilter, mobulaRefreshTick])

  const handleBoostFilterChange = (filter: string) => {
    setBoostFilter(filter)
    if (filter === boostFilter) {
      setBoostRefreshTick((tick) => tick + 1)
    }
  }

  useEffect(() => {
    if (activeTab !== "boost") return
    let aborted = false

    const fetchBoostTokens = async () => {
      try {
        setBoostError(null)
        setBoostLoading(true)
        setBoostTokens([])

        const filterParam = boostFilter || "all"
        const res = await fetch("/api/token-boosts/latest")
        if (!res.ok) throw new Error(`Dexscreener boosts failed: ${res.status}`)
        const json = await res.json()
        const items: any[] = Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : []

        const filterAmount = (() => {
          if (!filterParam || filterParam === "all") return undefined
          const parsed = Number.parseFloat(filterParam.replace(/x$/i, ""))
          return Number.isFinite(parsed) ? parsed : undefined
        })()

        const candidates = items
          .map((item) => ({
            tokenAddress: item?.tokenAddress ?? item?.token_address,
            header: item?.header ?? item?.icon ?? item?.image,
            amount: parseBoostAmount(
              pickNumber(item, ["amount", "totalAmount", "boostAmount"]) ??
                pickString(item, ["amount", "totalAmount", "boostAmount"]),
            ),
          }))
          .filter((it) => typeof it.tokenAddress === "string" && it.tokenAddress.length > 0)
          .filter((it) => {
            if (filterAmount === undefined) return true
            if (typeof it.amount !== "number") return false
            if (filterAmount === 500) return it.amount >= 500
            return it.amount === filterAmount
          })
          .slice(0, 50)

        const results = await Promise.allSettled(
          candidates.map(async (candidate) => {
            const mobulaRes = await fetch(`/api/mobula-token-details/${candidate.tokenAddress}`)
            if (!mobulaRes.ok) throw new Error(`Mobula details failed: ${mobulaRes.status}`)
            const mobulaJson = await mobulaRes.json()
            const mapped = mapMobulaDetailsToTokenRow(candidate.tokenAddress, candidate.header, mobulaJson)
            const withBoost = typeof candidate.amount === "number" ? { ...mapped, boostCount: candidate.amount } : mapped
            const withSignals = { ...withBoost, signals: ["DEXBOOST_PAID"] as SignalType[] }

            const mobulaData = mobulaJson?.data?.data ?? mobulaJson?.data ?? mobulaJson ?? {}
            const exchangeName = pickString(mobulaData?.exchange, ["name"])
            const exchangeLogo = pickString(mobulaData?.exchange, ["logo"])
            return exchangeName || exchangeLogo
              ? { ...withSignals, exchangeName, exchangeLogo }
              : withSignals
          }),
        )

        if (aborted) return

        const mapped = results
          .filter((r): r is PromiseFulfilledResult<TokenRowRuntime> => r.status === "fulfilled")
          .map((r) => r.value)

        setBoostTokens(mapped)
      } catch (err: any) {
        if (!aborted) {
          setBoostError(typeof err?.message === "string" ? err.message : "Failed to load boost tokens")
          setBoostTokens([])
        }
      } finally {
        if (!aborted) setBoostLoading(false)
      }
    }

    fetchBoostTokens()

    return () => {
      aborted = true
    }
  }, [activeTab, boostFilter, boostRefreshTick])

  useEffect(() => {
    if (activeTab !== "dexpaid") return
    let aborted = false

    const fetchDexPaid = async () => {
      try {
        setDexPaidError(null)
        setDexPaidLoading(true)
        setDexPaidTokens([])
        const res = await fetch("/api/ads")
        if (!res.ok) throw new Error(`Dexscreener ads failed: ${res.status}`)
        const json = await res.json().catch(() => null)
        const ads: any[] = Array.isArray(json) ? json : Array.isArray(json?.ads) ? json.ads : Array.isArray(json?.data) ? json.data : []

        const candidates = ads
          .map((ad) => ({
            tokenAddress: ad?.tokenAddress ?? ad?.token_address,
          }))
          .filter((it) => typeof it.tokenAddress === "string" && it.tokenAddress.length > 0)
          .slice(0, 50)

        const results = await Promise.allSettled(
          candidates.map(async (candidate) => {
            const mobulaRes = await fetch(`/api/mobula-token-details/${candidate.tokenAddress}`)
            if (!mobulaRes.ok) throw new Error(`Mobula details failed: ${mobulaRes.status}`)
            const mobulaJson = await mobulaRes.json()
            const mapped = mapMobulaDetailsToTokenRow(candidate.tokenAddress, undefined, mobulaJson)
            const dexSignals: SignalType[] = []
            if (typeof mapped.priceChange24h === "number" && mapped.priceChange24h > 0) dexSignals.push("PRICE_UP")
            if (typeof mapped.mc === "number" && mapped.mc >= 1_000_000) dexSignals.push("KEY_MC")
            const withSignals = dexSignals.length > 0 ? { ...mapped, signals: dexSignals } : mapped

            const mobulaData = mobulaJson?.data?.data ?? mobulaJson?.data ?? mobulaJson ?? {}
            const adPaidDate = pickString(mobulaData, [
              "dexscreenerAdPaidDate",
              "dexscreener_ad_paid_date",
              "dexscreener_ad_paid_at",
              "dexscreenerAdPaidAt",
            ])

            const exchangeName = pickString(mobulaData?.exchange, ["name"])
            const exchangeLogo = pickString(mobulaData?.exchange, ["logo"])
            const withExchange =
              exchangeName || exchangeLogo
                ? { ...withSignals, exchangeName, exchangeLogo }
                : withSignals

            return adPaidDate ? { ...withExchange, updatedAt: adPaidDate } : withExchange
          }),
        )

        if (aborted) return

        const mapped = results
          .filter((r): r is PromiseFulfilledResult<TokenRowRuntime> => r.status === "fulfilled")
          .map((r) => r.value)

        setDexPaidTokens(mapped)
      } catch (err: any) {
        if (!aborted) {
          setDexPaidError(typeof err?.message === "string" ? err.message : "Failed to load Dexpaid tokens")
          setDexPaidTokens([])
        }
      } finally {
        if (!aborted) setDexPaidLoading(false)
      }
    }

    fetchDexPaid()

    return () => {
      aborted = true
    }
  }, [activeTab])

  useEffect(() => {
    if (activeTab !== "ads") return
    let aborted = false

    const fetchAds = async () => {
      try {
        setAdsError(null)
        setAdsLoading(true)
        setAdsTokens([])

        const res = await fetch("/api/ads?chainId=solana")
        if (!res.ok) throw new Error(`Dexscreener ads failed: ${res.status}`)
        const json = await res.json().catch(() => null)
        const ads: any[] = Array.isArray(json) ? json : Array.isArray(json?.ads) ? json.ads : Array.isArray(json?.data) ? json.data : []

        const candidates = ads
          .map((ad) => ({
            tokenAddress: ad?.tokenAddress ?? ad?.token_address,
            header: ad?.header ?? ad?.icon ?? ad?.image,
            adType: pickString(ad, ["type"]),
            adImpressions: pickNumber(ad, ["impressions"]),
            adDurationHours: pickNumber(ad, ["durationHours", "duration_hours"]),
            adDate: parseClaimDate(pickString(ad, ["date", "createdAt", "created_at"]) ?? ad?.date),
          }))
          .filter((it) => typeof it.tokenAddress === "string" && it.tokenAddress.length > 0)
          .slice(0, 50)

        const results = await Promise.allSettled(
          candidates.map(async (candidate) => {
            try {
              const mobulaRes = await fetch(`/api/mobula-token-details/${candidate.tokenAddress}`)
              if (!mobulaRes.ok) throw new Error(`Mobula details failed: ${mobulaRes.status}`)
              const mobulaJson = await mobulaRes.json()
              const mapped = mapMobulaDetailsToTokenRow(candidate.tokenAddress, candidate.header, mobulaJson)
              const withSignals = { ...mapped, signals: ["DEXAD_PAID"] as SignalType[] }

              const mobulaData = mobulaJson?.data?.data ?? mobulaJson?.data ?? mobulaJson ?? {}
              const exchangeName = pickString(mobulaData?.exchange, ["name"])
              const exchangeLogo = pickString(mobulaData?.exchange, ["logo"])

              const withAds = {
                ...withSignals,
                adType: candidate.adType,
                adImpressions: candidate.adImpressions,
                adDurationHours: candidate.adDurationHours,
                exchangeName,
                exchangeLogo,
              }
              return candidate.adDate ? { ...withAds, updatedAt: candidate.adDate } : withAds
            } catch {
              const fallback: TokenRowRuntime = {
                address: candidate.tokenAddress,
                name: "Unknown",
                symbol: candidate.tokenAddress.slice(0, 6).toUpperCase(),
                logo: candidate.header ?? "/placeholder.svg",
                price: 0,
                change5m: 0,
                change1h: 0,
                mc: 0,
                liquidity: 0,
                volume24h: 0,
                updatedAt: candidate.adDate ?? new Date().toISOString(),
                signals: ["DEXAD_PAID"],
                adType: candidate.adType,
                adImpressions: candidate.adImpressions,
                adDurationHours: candidate.adDurationHours,
              }
              return fallback
            }
          }),
        )

        if (aborted) return

        const mapped = results
          .filter((r): r is PromiseFulfilledResult<TokenRowRuntime> => r.status === "fulfilled")
          .map((r) => r.value)

        setAdsTokens(mapped)
      } catch (err: any) {
        if (!aborted) {
          setAdsError(typeof err?.message === "string" ? err.message : "Failed to load ads")
          setAdsTokens([])
        }
      } finally {
        if (!aborted) setAdsLoading(false)
      }
    }

    fetchAds()

    return () => {
      aborted = true
    }
  }, [activeTab])

  const copyToClipboard = async (text: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(successMessage)
    } catch (error) {
      console.error("[v0] Copy failed:", error)
      toast.error("Copy failed")
    }
  }

  const handleCopyWallet = (wallet: string) => {
    copyToClipboard(wallet, "Copied wallet address")
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

  const openBuyLink = (platform: string, address: string, e: MouseEvent) => {
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

  const renderNewTabDexpathDetail = (runtime: TokenRowRuntime) => {
    return (
      <>
        {typeof runtime.bondingPct === "number" && (
          <div className="mt-1" aria-label="Bonding progress">
            <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-muted-foreground">
              <span className="text-yellow-600" title="Bonding progress">
                🟡 Bonding {runtime.bondingPct?.toFixed(0)}%
              </span>
              {typeof runtime.spikeProbability === "number" ? (
                <span
                  className={`text-[8px] sm:text-[9px] ${getSpikeBand(runtime.spikeProbability ?? 0).tone}`}
                  title="Interpretation band for Often Spike %"
                >
                  {getSpikeBand(runtime.spikeProbability ?? 0).label}
                </span>
              ) : (
                <span className="text-[8px] sm:text-[9px]" title="Bonding progress">
                  Bonding progress
                </span>
              )}
            </div>
            <div className="mt-0.5 h-1.5 w-full rounded-full bg-secondary/60 overflow-hidden" title="Bonding progress">
              <div className="h-full bg-primary" style={{ width: `${clampNumber(runtime.bondingPct ?? 0, 0, 100)}%` }} />
            </div>
          </div>
        )}

        {(typeof runtime.snipersCount === "number" ||
          typeof runtime.bundlersCount === "number" ||
          typeof runtime.insidersCount === "number" ||
          typeof runtime.liquidityDeltaPct === "number" ||
          typeof runtime.proTradersCount === "number" ||
          typeof runtime.smartTradersCount === "number" ||
          typeof runtime.freshTradersCount === "number") && (
          <div className="mt-1 flex flex-wrap gap-3 text-[9px] sm:text-[10px] text-muted-foreground">
            {typeof runtime.snipersCount === "number" && (
              <span className="inline-flex items-center gap-1" title={`Snipers: ${runtime.snipersCount}`}>
                {runtime.snipersCount === 0 ? (
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                ) : (
                  <XCircle className="h-3 w-3 text-red-600" />
                )}
                Snipers {runtime.snipersCount}
              </span>
            )}
            {typeof runtime.bundlersCount === "number" && (
              <span className="inline-flex items-center gap-1" title={`Bundlers: ${runtime.bundlersCount}`}>
                {runtime.bundlersCount === 0 ? (
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                ) : (
                  <XCircle className="h-3 w-3 text-red-600" />
                )}
                Bundlers {runtime.bundlersCount}
              </span>
            )}
            {typeof runtime.insidersCount === "number" && (
              <span className="inline-flex items-center gap-1" title={`Insiders: ${runtime.insidersCount}`}>
                {runtime.insidersCount === 0 ? (
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                ) : (
                  <XCircle className="h-3 w-3 text-red-600" />
                )}
                Insiders {runtime.insidersCount}
              </span>
            )}
            {typeof runtime.liquidityDeltaPct === "number" && (
              <span className="inline-flex items-center gap-1" title={`Liquidity delta: ${runtime.liquidityDeltaPct?.toFixed(0)}%`}>
                {(runtime.liquidityDeltaPct ?? 0) >= -20 ? (
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                ) : (
                  <AlertTriangle className="h-3 w-3 text-yellow-600" />
                )}
                LP
              </span>
            )}
            {typeof runtime.smartTradersCount === "number" && (
              <span title={`Smart traders: ${runtime.smartTradersCount}`}>
                🧠 Smart {(runtime.smartTradersCount ?? 0) > 0 ? "✅" : "❌"}
              </span>
            )}
            {typeof runtime.proTradersCount === "number" && (
              <span title={`Pro traders: ${runtime.proTradersCount}`}>
                🐳 Pro {(runtime.proTradersCount ?? 0) > 0 ? `✅ ${runtime.proTradersCount}` : "❌"}
              </span>
            )}
            {typeof runtime.freshTradersCount === "number" && (
              <span title={`Fresh wallets: ${runtime.freshTradersCount}`}>
                🆕 Fresh {(runtime.freshTradersCount ?? 0) > 0 ? `✅ ${runtime.freshTradersCount}` : "⚠️ 0"}
              </span>
            )}
          </div>
        )}

        {(() => {
          const createdOrUpdatedIso = runtime.createdAt ?? runtime.updatedAt
          const createdOrUpdatedMs = createdOrUpdatedIso ? Date.parse(createdOrUpdatedIso) : Number.NaN
          const tokenAgeMinutes = Number.isFinite(createdOrUpdatedMs) ? (Date.now() - createdOrUpdatedMs) / 60000 : undefined

          if (!(typeof tokenAgeMinutes === "number" && tokenAgeMinutes >= 0 && tokenAgeMinutes <= 5)) return null

          const summary = generateTokenSummary({
            priceChange1m: runtime.priceChange1m,
            priceChange5m: runtime.priceChange5m,
            volume1m: runtime.volume1m,
            volume5m: runtime.volume5m,
            liquidity: runtime.liquidity,
            marketCap: runtime.mc,
            spikeProbability: runtime.spikeProbability,
            confidenceScore: runtime.confidenceScore,
            tokenAgeMinutes,
          })

          const modeClass =
            summary.mode === "SNIPER"
              ? "bg-green-500/15 text-green-600 border-green-500/30"
              : summary.mode === "SCALPER"
                ? "bg-yellow-500/15 text-yellow-700 border-yellow-500/30"
                : "bg-muted text-muted-foreground border-border"

          const confidenceClass =
            summary.confidence === "HIGH"
              ? "bg-green-500/15 text-green-600 border-green-500/30"
              : summary.confidence === "MEDIUM"
                ? "bg-yellow-500/15 text-yellow-700 border-yellow-500/30"
                : "bg-red-500/15 text-red-600 border-red-500/30"

          return (
            <div className="mt-2 rounded-md border border-border bg-secondary/20 px-2 py-1.5 text-[9px] sm:text-[10px]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-foreground">Summary</span>
                <span className={`inline-flex items-center rounded border px-1.5 py-0 h-4 leading-none ${modeClass}`}>{summary.mode}</span>
                <span className={`inline-flex items-center rounded border px-1.5 py-0 h-4 leading-none ${confidenceClass}`}>{summary.confidence}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-foreground/90">{summary.verdict}</span>
              </div>

              {summary.momentum.length > 0 && (
                <div className="mt-1 text-muted-foreground">
                  <span className="text-foreground/80">Momentum:</span> {summary.momentum.join(" • ")}
                </div>
              )}

              {summary.risks.length > 0 && (
                <div className="mt-0.5 text-muted-foreground">
                  <span className="text-foreground/80">Risks:</span> {summary.risks.join(" • ")}
                </div>
              )}
            </div>
          )
        })()}
      </>
    )
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

  const richTabEffectiveTokens = useMemo(() => {
    if (activeTab === "dexpaid") return dexPaidTokens as TokenRowRuntime[]
    if (activeTab === "boost") return boostTokens as TokenRowRuntime[]
    if (activeTab === "ads") return adsTokens as TokenRowRuntime[]
    if (activeTab === "cto") return ctoTokens as TokenRowRuntime[]
    if (activeTab !== "new") return filteredTokens as TokenRowRuntime[]

    const source = mobulaTokens as TokenRowRuntime[]

    const filtered = source.filter((token) => {
      if (launchpadFilter === "all") return true
      return token.launchpad === launchpadFilter
    })

    if (!activePreset) return filtered

    const sorted = [...filtered]
    if (activePreset === "top_traded") {
      sorted.sort((a, b) => (b.volume24h ?? 0) - (a.volume24h ?? 0))
    } else if (activePreset === "gainers") {
      sorted.sort((a, b) => ((b.priceChange1m ?? b.change5m) ?? 0) - ((a.priceChange1m ?? a.change5m) ?? 0))
    } else if (activePreset === "losers") {
      sorted.sort((a, b) => ((a.priceChange1m ?? a.change5m) ?? 0) - ((b.priceChange1m ?? b.change5m) ?? 0))
    }
    return sorted
  }, [activeTab, activePreset, launchpadFilter, mobulaTokens, boostTokens, dexPaidTokens, adsTokens, ctoTokens, filteredTokens])

  const newTabScrollRef = useRef<HTMLDivElement | null>(null)
  const [newTabScrollTop, setNewTabScrollTop] = useState(0)
  const NEW_TAB_CONTAINER_HEIGHT = 600
  const NEW_TAB_ROW_HEIGHT = 96

  const shouldVirtualizeNewTab =
    (activeTab === "new" || activeTab === "boost" || activeTab === "dexpaid" || activeTab === "cto" || activeTab === "ads") &&
    richTabEffectiveTokens.length > 100

  const effectiveFilteredTokensLength =
    activeTab === "new" || activeTab === "boost" || activeTab === "dexpaid" || activeTab === "cto" || activeTab === "ads"
      ? richTabEffectiveTokens.length
      : filteredTokens.length

  const newTabWindowed = useMemo(() => {
    if (!shouldVirtualizeNewTab) {
      return {
        topPad: 0,
        bottomPad: 0,
        visible: richTabEffectiveTokens,
      }
    }

    const total = richTabEffectiveTokens.length
    const overscan = 10
    const startIndex = clampNumber(Math.floor(newTabScrollTop / NEW_TAB_ROW_HEIGHT) - overscan, 0, total)
    const visibleCount = Math.ceil(NEW_TAB_CONTAINER_HEIGHT / NEW_TAB_ROW_HEIGHT) + overscan * 2
    const endIndex = clampNumber(startIndex + visibleCount, 0, total)

    const topPad = startIndex * NEW_TAB_ROW_HEIGHT
    const bottomPad = (total - endIndex) * NEW_TAB_ROW_HEIGHT
    const visible = richTabEffectiveTokens.slice(startIndex, endIndex)
    return { topPad, bottomPad, visible }
  }, [shouldVirtualizeNewTab, richTabEffectiveTokens, newTabScrollTop])

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
            <Badge variant="secondary" className="text-[7px] sm:text-[8px] px-0.5 sm:px-1 py-0 h-3 leading-none">
              soon
            </Badge>
          </Button>
          <Button
            variant={activeTab === "kol" ? "default" : "outline"}
            size="sm"
            className="text-[10px] sm:text-xs py-1 h-7 sm:h-8"
            onClick={() => setActiveTab("kol")}
          >
            KOL
            <Badge variant="secondary" className="text-[7px] sm:text-[8px] px-0.5 sm:px-1 py-0 h-3 leading-none">
              soon
            </Badge>
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
                    onClick={() => handleBoostFilterChange(filter)}
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
                setSnipeNotice(`Snipe ${tabNames[activeTab]} - Feature coming soon!`)
                setSnipeDialogOpen(true)
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
        <AlertDialog open={snipeDialogOpen} onOpenChange={setSnipeDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Coming soon</AlertDialogTitle>
              <AlertDialogDescription>{snipeNotice ?? "Feature coming soon!"}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction
                onClick={() => {
                  setSnipeDialogOpen(false)
                  setSnipeNotice(null)
                }}
              >
                OK
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* New Coins filter tabs */}
        {activeTab === "new" && (
          <div className="flex flex-wrap gap-2 mt-2">
            {["all", "pumpfun", "bags", "heaven", "bonk", "boop", "moonit", "belive", "raydium", "orca", "meteora"].map(
              (filter) => {
                return (
                  <Badge
                    key={filter}
                    variant={launchpadFilter === filter ? "default" : "outline"}
                    className={`cursor-pointer capitalize text-xs sm:text-sm ${
                      launchpadFilter === filter
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "hover:bg-secondary"
                    }`}
                    onClick={() => {
                      if (filter === launchpadFilter) {
                        // Re-click should refresh Mobula fetch (New Coins only)
                        setMobulaRefreshTick((t) => t + 1)
                        return
                      }
                      setLaunchpadFilter(filter)
                    }}
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

        {/* Preset toggle (New Coins only) */}
        {activeTab === "new" && (
          <div className="mt-2 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              <Button
                type="button"
                size="sm"
                variant={activePreset === "top_traded" ? "default" : "outline"}
                className="h-9 sm:h-8 text-xs px-3 whitespace-nowrap"
                onClick={() => setActivePreset((prev) => (prev === "top_traded" ? undefined : "top_traded"))}
                aria-label="Toggle Volume preset"
              >
                💰 Volume
              </Button>
              <Button
                type="button"
                size="sm"
                variant={activePreset === "gainers" ? "default" : "outline"}
                className="h-9 sm:h-8 text-xs px-3 whitespace-nowrap"
                onClick={() => setActivePreset((prev) => (prev === "gainers" ? undefined : "gainers"))}
                aria-label="Toggle Gainers preset"
              >
                📈 Gainers
              </Button>
              <Button
                type="button"
                size="sm"
                variant={activePreset === "losers" ? "default" : "outline"}
                className="h-9 sm:h-8 text-xs px-3 whitespace-nowrap"
                onClick={() => setActivePreset((prev) => (prev === "losers" ? undefined : "losers"))}
                aria-label="Toggle Losers preset"
              >
                📉 Losers
              </Button>
            </div>
          </div>
        )}

        {/* New Boost filter tabs */}
        {activeTab === "boost" && <></>}
      </CardHeader>
      <CardContent className="p-0">
        {activeTab === "signals" || activeTab === "kol" ? (
          <div className="h-[600px] flex items-center justify-center text-sm text-muted-foreground">
            Coming soon — still in development.
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
                    <TableHead className="sticky top-0 z-30 font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">
                      Token
                    </TableHead>
                    <TableHead className="sticky top-0 z-30 font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">
                      Dev Name
                    </TableHead>
                    <TableHead className="sticky top-0 z-30 font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">
                      Dev Wallet
                    </TableHead>
                    <TableHead className="sticky top-0 z-30 font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">
                      Description
                    </TableHead>
                    <TableHead className="sticky top-0 z-30 font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">
                      Interest
                    </TableHead>
                    <TableHead className="sticky top-0 z-30 font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">
                      Launch
                    </TableHead>
                    <TableHead className="sticky top-0 z-30 font-semibold text-foreground text-center text-[10px] sm:text-xs bg-background px-4">
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
        ) : activeTab === "cto" && false ? (
          loadingCTO ? (
            <div className="max-h-[600px] overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-20 shadow-sm">
                  <TableRow className="hover:bg-transparent border-border">
                    <TableHead className="sticky top-0 z-30 font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">Token</TableHead>
                    <TableHead className="sticky top-0 z-30 font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">MC</TableHead>
                    <TableHead className="sticky top-0 z-30 font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">Price</TableHead>
                    <TableHead className="sticky top-0 z-30 font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">5m</TableHead>
                    <TableHead className="sticky top-0 z-30 font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">Vol(24h)</TableHead>
                    <TableHead className="sticky top-0 z-30 font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">Signals</TableHead>
                    <TableHead className="sticky top-0 z-30 font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">Updated</TableHead>
                    <TableHead className="sticky top-0 z-30 font-semibold text-foreground text-center text-[10px] sm:text-xs bg-background px-4">Buy</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={`cto-skel-${i}`} className="border-border">
                      <TableCell className="py-2 px-4">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-6 w-6 rounded-full" />
                          <div className="flex flex-col gap-1">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-2 w-24" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-2 px-4"><Skeleton className="h-3 w-10" /></TableCell>
                      <TableCell className="py-2 px-4"><Skeleton className="h-3 w-12" /></TableCell>
                      <TableCell className="py-2 px-4"><Skeleton className="h-3 w-8" /></TableCell>
                      <TableCell className="py-2 px-4"><Skeleton className="h-3 w-16" /></TableCell>
                      <TableCell className="py-2 px-4">
                        <div className="flex gap-1">
                          <Skeleton className="h-3 w-10" />
                          <Skeleton className="h-3 w-8" />
                        </div>
                      </TableCell>
                      <TableCell className="py-2 px-4"><Skeleton className="h-3 w-20" /></TableCell>
                      <TableCell className="py-2 px-4 text-center"><Skeleton className="h-6 w-12 rounded" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                    <TableHead className="sticky top-0 z-30 font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">
                      Token
                    </TableHead>
                    <TableHead className="sticky top-0 z-30 font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">
                      MC
                    </TableHead>
                    <TableHead className="sticky top-0 z-30 font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">
                      Price
                    </TableHead>
                    <TableHead className="sticky top-0 z-30 font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">
                      5m
                    </TableHead>
                    <TableHead className="sticky top-0 z-30 font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">
                      Vol(24h)
                    </TableHead>
                    <TableHead className="sticky top-0 z-30 font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">
                      Signals
                    </TableHead>
                    <TableHead className="sticky top-0 z-30 font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">
                      Updated
                    </TableHead>
                    <TableHead className="sticky top-0 z-30 font-semibold text-foreground text-center text-[10px] sm:text-xs bg-background px-4">
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
                                  copyToClipboard(token.address, "Copied contract address")
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
                        {getTimeAgo(token.updatedAt)}
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
            {effectiveFilteredTokensLength === 0 ? (
              activeTab === "boost" && boostLoading ? (
                <div className="h-[600px] flex items-center justify-center text-muted-foreground text-sm">
                  Loading boost tokens…
                </div>
              ) : activeTab === "ads" && adsLoading ? (
                <div className="h-[600px] flex items-center justify-center text-muted-foreground text-sm">
                  Loading ads…
                </div>
              ) : activeTab === "cto" && loadingCTO ? (
                <div className="h-[600px] flex items-center justify-center text-muted-foreground text-sm">
                  Loading CTO tokens…
                </div>
              ) : activeTab === "cto" && ctoRateLimited ? (
                <div className="h-[600px] flex items-center justify-center text-muted-foreground text-sm">
                  CTO data is temporarily rate limited. Please try again later.
                </div>
              ) : activeTab === "boost" && !boostLoading && !boostError ? (
                <div className="h-[600px] flex items-center justify-center text-muted-foreground text-sm">
                  No boost data available for this filter.
                </div>
              ) : activeTab === "ads" && !adsLoading && !adsError ? (
                <div className="h-[600px] flex items-center justify-center text-muted-foreground text-sm">
                  No ads available right now.
                </div>
              ) : activeTab === "cto" && !loadingCTO ? (
                <div className="h-[600px] flex items-center justify-center text-muted-foreground text-sm">
                  No community takeovers available.
                </div>
              ) : activeTab === "dexpaid" && dexPaidLoading ? (
                <div className="h-[600px] flex items-center justify-center text-muted-foreground text-sm">
                  Loading dexpaid tokens…
                </div>
              ) : activeTab === "boost" && boostError ? (
                <div className="h-[600px] flex items-center justify-center text-red-500 text-sm">
                  {boostError}
                </div>
              ) : activeTab === "ads" && adsError ? (
                <div className="h-[600px] flex items-center justify-center text-red-500 text-sm">
                  {adsError}
                </div>
              ) : activeTab === "dexpaid" && dexPaidError ? (
                <div className="h-[600px] flex items-center justify-center text-red-500 text-sm">
                  {dexPaidError}
                </div>
              ) : activeTab === "new" && mobulaFetchStatus === "ready" && !mobulaRateLimited && mobulaLastMappedCount === 0 ? (
                <div className="h-[600px] overflow-auto p-4">
                  <Empty className="border-border bg-secondary/20">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <SearchX className="h-6 w-6" />
                      </EmptyMedia>
                      <EmptyTitle>No tokens available</EmptyTitle>
                      <EmptyDescription>
                        {launchpadFilter === "all"
                          ? "There are no new tokens available right now."
                          : "There are no new tokens available for this launchpad right now."}
                      </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                      {launchpadFilter !== "all" && (
                        <div className="text-xs text-muted-foreground">
                          Selected launchpad: <span className="font-medium text-foreground">{launchpadFilter}</span>
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">Try a different launchpad or switch to All.</div>
                    </EmptyContent>
                  </Empty>
                </div>
              ) : (
                <div className="h-[600px] overflow-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-20 shadow-sm">
                      <TableRow className="hover:bg-transparent border-border">
                        <TableHead className="sticky top-0 z-30 font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">Token</TableHead>
                        <TableHead className="sticky top-0 z-30 font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">MC</TableHead>
                        <TableHead className="sticky top-0 z-30 font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">Price</TableHead>
                        <TableHead className="sticky top-0 z-30 font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">
                          {activeTab === "new" || activeTab === "dexpaid" ? "1m" : "5m"}
                        </TableHead>
                        <TableHead className="sticky top-0 z-30 font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">Vol(24h)</TableHead>
                        <TableHead className="sticky top-0 z-30 font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">Signals</TableHead>
                        <TableHead className="sticky top-0 z-30 font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">Updated</TableHead>
                        <TableHead className="sticky top-0 z-30 font-semibold text-foreground text-center text-[10px] sm:text-xs bg-background px-4">Buy</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.from({ length: 8 }).map((_, i) => (
                        <TableRow key={`tab-skel-${i}`} className="border-border">
                          <TableCell className="py-2 px-4">
                            <div className="flex items-center gap-2">
                              <Skeleton className="h-7 w-7 rounded-full" />
                              <div className="flex flex-col gap-1">
                                <Skeleton className="h-3 w-24" />
                                <Skeleton className="h-2 w-16" />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-2 px-4 text-right"><Skeleton className="h-3 w-12 ml-auto" /></TableCell>
                          <TableCell className="py-2 px-4 text-right"><Skeleton className="h-3 w-10 ml-auto" /></TableCell>
                          <TableCell className="py-2 px-4 text-right"><Skeleton className="h-3 w-8 ml-auto" /></TableCell>
                          <TableCell className="py-2 px-4 text-right"><Skeleton className="h-3 w-16 ml-auto" /></TableCell>
                          <TableCell className="py-2 px-4">
                            <div className="flex gap-1">
                              <Skeleton className="h-3 w-10" />
                              <Skeleton className="h-3 w-8" />
                              <Skeleton className="h-3 w-6" />
                            </div>
                          </TableCell>
                          <TableCell className="py-2 px-4"><Skeleton className="h-3 w-20" /></TableCell>
                          <TableCell className="py-2 px-4 text-center"><Skeleton className="h-6 w-24 rounded" /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )
            ) : (
              <>
                <div
                  className="h-[600px] overflow-auto [&_[data-slot=table-container]]:overflow-x-visible"
                  ref={newTabScrollRef}
                  onScroll={(e) => {
                    if ((activeTab === "new" || activeTab === "boost" || activeTab === "dexpaid" || activeTab === "cto" || activeTab === "ads") && shouldVirtualizeNewTab) {
                      const target = e.currentTarget
                      setNewTabScrollTop(target.scrollTop)
                    }
                  }}
                >
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
                          Price
                        </TableHead>
                        <TableHead className="sticky top-0 z-30 font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">
                          1m
                        </TableHead>
                        <TableHead className="sticky top-0 z-30 font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">
                          Vol(24h)
                        </TableHead>
                        <TableHead className="sticky top-0 z-30 font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">
                          Signals
                        </TableHead>
                        <TableHead className="sticky top-0 z-30 font-semibold text-foreground text-[10px] sm:text-xs bg-background px-4">
                          Updated
                        </TableHead>
                        <TableHead className="sticky top-0 z-30 font-semibold text-foreground text-[10px] sm:text-xs bg-background text-center px-4">
                          Buy
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(activeTab === "new" || activeTab === "boost" || activeTab === "dexpaid" || activeTab === "cto" || activeTab === "ads") &&
                        shouldVirtualizeNewTab &&
                        newTabWindowed.topPad > 0 && (
                        <TableRow className="border-border hover:bg-transparent">
                          <TableCell colSpan={8} style={{ height: newTabWindowed.topPad }} className="p-0" />
                        </TableRow>
                      )}

                      {((activeTab === "new" || activeTab === "boost" || activeTab === "dexpaid" || activeTab === "cto" || activeTab === "ads")
                        ? newTabWindowed.visible
                        : (filteredTokens as TokenRowRuntime[])
                      ).map((token, index) => {
                        const rowClassName = `cursor-pointer hover:bg-secondary/50 transition-colors border-border ${
                          newestTokenAddress === token.address ? "animate-slide-in" : ""
                        } ${
                          activeTab === "new" && (token as TokenRowRuntime).momentumState === "ACCELERATING"
                            ? "ring-1 ring-green-500/30 animate-pulse"
                            : ""
                        } ${
                          activeTab === "new" && (token as TokenRowRuntime).momentumState === "COOLING" ? "opacity-70" : ""
                        } ${activeTab === "new" && (token as TokenRowRuntime).riskLevel === "HIGH" ? "border-l-4 border-l-amber-500" : ""}`

                        if (activeTab !== "new" && activeTab !== "boost" && activeTab !== "dexpaid" && activeTab !== "cto" && activeTab !== "ads") {
                          return (
                            <TableRow
                              key={token.address}
                              onClick={() => handleTokenClick(token)}
                              className={rowClassName}
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
                                        className={`p-0 hover:bg-primary/20 ${activeTab === "new" ? "h-11 w-11 sm:h-3 sm:w-3" : "h-3 w-3"}`}
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          copyToClipboard(token.address, "Copied contract address")
                                        }}
                                        title="Copy Contract Address"
                                        aria-label="Copy contract address"
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
                                <div className="flex flex-col items-end leading-none">
                                  <span
                                    className={`font-semibold text-[10px] sm:text-xs ${token.change5m >= 0 ? "text-green-500" : "text-red-500"}`}
                                  >
                                    {token.change5m >= 0 ? "+" : ""}
                                    {token.change5m.toFixed(1)}%
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right font-mono text-[10px] sm:text-xs py-2 px-4">
                                <div className="flex flex-col items-end leading-none">
                                  <span>{formatNumber(token.volume24h)}</span>
                                </div>
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
                                    className={`${activeTab === "new" ? "h-11 w-11 sm:h-6 sm:w-6" : "h-6 w-6"} p-0 hover:bg-primary/20`}
                                    onClick={(e) => openBuyLink("trojan", token.address, e)}
                                    title="Buy on Trojan"
                                    aria-label="Buy on Trojan"
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
                                    className={`${activeTab === "new" ? "h-11 w-11 sm:h-6 sm:w-6" : "h-6 w-6"} p-0 hover:bg-primary/20`}
                                    onClick={(e) => openBuyLink("axion", token.address, e)}
                                    title="Buy on Axion"
                                    aria-label="Buy on Axion"
                                  >
                                    <Image
                                      src="/images/axiom.png"
                                      alt="Axion"
                                      width={16}
                                      height={16}
                                      className="rounded"
                                    />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className={`${activeTab === "new" ? "h-11 w-11 sm:h-6 sm:w-6" : "h-6 w-6"} p-0 hover:bg-primary/20`}
                                    onClick={(e) => openBuyLink("gmgn", token.address, e)}
                                    title="Buy on GMGN"
                                    aria-label="Buy on GMGN"
                                  >
                                    <Image
                                      src="/images/gmgn.png"
                                      alt="GMGN"
                                      width={16}
                                      height={16}
                                      className="rounded"
                                    />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className={`${activeTab === "new" ? "h-11 w-11 sm:h-6 sm:w-6" : "h-6 w-6"} p-0 hover:bg-primary/20`}
                                    onClick={(e) => openBuyLink("bonk", token.address, e)}
                                    title="Buy on Bonk"
                                    aria-label="Buy on Bonk"
                                  >
                                    <Image
                                      src="/images/bonk.png"
                                      alt="Bonk"
                                      width={16}
                                      height={16}
                                      className="rounded"
                                    />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        }

                        return (
                          <Fragment key={`${token.address}-${activeTab}-${index}`}>
                            <TableRow
                              onClick={() => handleTokenClick(token)}
                              className={rowClassName}
                            >
                              <TableCell className="py-2 px-4" rowSpan={2}>
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-2">
                                    <Image
                                      src={token.logo || "/placeholder.svg"}
                                      alt={token.symbol}
                                      width={34}
                                      height={34}
                                      className="rounded-md object-cover"
                                    />
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                                          {activeTab === "new" && (() => {
                                            const runtime = token as TokenRowRuntime
                                            const iconKey = normalizeLaunchpadIconKeyFromSource(runtime.source)
                                            if (!iconKey) return null
                                            const iconSrc = launchpadIcons[iconKey]
                                            if (!iconSrc) return null
                                            return (
                                              <Image
                                                src={iconSrc}
                                                alt={iconKey}
                                                width={14}
                                                height={14}
                                                className="rounded"
                                              />
                                            )
                                          })()}
                                          <span className="font-semibold text-foreground text-xs sm:text-sm truncate max-w-[160px]">
                                            {token.name}
                                          </span>
                                          {(activeTab === "dexpaid" || activeTab === "boost" || activeTab === "cto" || activeTab === "ads") && ((token as TokenRowRuntime).exchangeName || (token as TokenRowRuntime).exchangeLogo) && (
                                            <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] text-muted-foreground">
                                              {(token as TokenRowRuntime).exchangeLogo && (
                                                <Image
                                                  src={(token as TokenRowRuntime).exchangeLogo as string}
                                                  alt={(token as TokenRowRuntime).exchangeName || "Exchange"}
                                                  width={14}
                                                  height={14}
                                                  className="rounded"
                                                />
                                              )}
                                              {(token as TokenRowRuntime).exchangeName && (
                                                <span className="truncate max-w-[120px]">{(token as TokenRowRuntime).exchangeName}</span>
                                              )}
                                            </span>
                                          )}
                                        </div>
                                      <div className="flex items-center gap-1">
                                        <span className="text-[10px] sm:text-xs text-muted-foreground">{token.symbol}</span>
                                        {activeTab === "boost" && (
                                          <Badge
                                            variant="outline"
                                            className="text-[8px] sm:text-[9px] px-1.5 py-0 h-4 leading-none bg-amber-500/15 text-amber-700 border-amber-500/40"
                                          >
                                            Dexpaid
                                          </Badge>
                                        )}
                                        {(activeTab === "new" || activeTab === "dexpaid") && (token as TokenRowRuntime).tradeDecision && (
                                          <span
                                            className={`inline-flex items-center rounded border px-1.5 py-0 h-4 leading-none text-[8px] sm:text-[9px] ${getDecisionClass(
                                              (token as TokenRowRuntime).tradeDecision,
                                            )}`}
                                            title={`Decision: ${(token as TokenRowRuntime).tradeDecision}`}
                                            aria-label={`Trade decision ${(token as TokenRowRuntime).tradeDecision}`}
                                          >
                                            {(token as TokenRowRuntime).tradeDecision}
                                          </span>
                                        )}
                                        {(activeTab === "new" || activeTab === "dexpaid") && (token as TokenRowRuntime).tradeModeFit && (
                                          <Badge
                                            variant="secondary"
                                            className="text-[8px] sm:text-[9px] px-1.5 py-0 h-4 leading-none"
                                            title={`Trade mode: ${(token as TokenRowRuntime).tradeModeFit}`}
                                          >
                                            {(token as TokenRowRuntime).tradeModeFit}
                                          </Badge>
                                        )}
                                        {(activeTab === "new" || activeTab === "dexpaid") && (token as TokenRowRuntime).riskLevel && (
                                          <span
                                            className={`inline-flex items-center rounded border px-1.5 py-0 h-4 leading-none text-[8px] sm:text-[9px] ${getRiskBadgeClass(
                                              (token as TokenRowRuntime).riskLevel,
                                            )}`}
                                            title={`Risk: ${(token as TokenRowRuntime).riskLevel}`}
                                            aria-label={`Risk level ${(token as TokenRowRuntime).riskLevel}`}
                                          >
                                            {(token as TokenRowRuntime).riskLevel}
                                          </span>
                                        )}
                                        {(activeTab === "new" || activeTab === "dexpaid") && (token as TokenRowRuntime).momentumState && (
                                          <span
                                            className={`inline-flex items-center rounded border px-1.5 py-0 h-4 leading-none text-[8px] sm:text-[9px] ${getMomentumBadgeClass(
                                              (token as TokenRowRuntime).momentumState,
                                            )}`}
                                            title={`Momentum: ${(token as TokenRowRuntime).momentumState}`}
                                            aria-label={`Momentum ${(token as TokenRowRuntime).momentumState}`}
                                          >
                                            {(token as TokenRowRuntime).momentumState === "ACCELERATING"
                                              ? "UP"
                                              : (token as TokenRowRuntime).momentumState === "COOLING"
                                                ? "COOL"
                                                : "STB"}
                                          </span>
                                        )}
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className={`p-0 hover:bg-primary/20 ${activeTab === "new" ? "h-11 w-11 sm:h-3 sm:w-3" : "h-3 w-3"}`}
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            copyToClipboard(token.address, "Copied contract address")
                                          }}
                                          title="Copy Contract Address"
                                          aria-label="Copy contract address"
                                        >
                                          <Copy className="h-1.5 w-1.5 text-muted-foreground" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>

                                  {(() => {
                                    const runtime = token as TokenRowRuntime
                                    const isHidden = Boolean(newTabHiddenDetails[runtime.address])
                                    if (isHidden) return null
                                    return renderNewTabDexpathDetail(runtime)
                                  })()}
                                </div>
                              </TableCell>
                          <TableCell className="text-right font-mono text-[10px] sm:text-xs py-2 px-4">
                            {formatMarketCap(token.mc)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-[10px] sm:text-xs py-2 px-4">
                            {formatPrice(token.price)}
                          </TableCell>
                          <TableCell className="text-right py-2 px-4">
                            <div className="flex flex-col items-end leading-none">
                              {(() => {
                                const shortChange =
                                  typeof (token as TokenRowRuntime).priceChange1m === "number"
                                    ? ((token as TokenRowRuntime).priceChange1m as number)
                                    : token.change5m
                                return (
                              <span
                                className={`font-semibold text-[10px] sm:text-xs ${shortChange >= 0 ? "text-green-500" : "text-red-500"}`}
                                title={`1m change: ${shortChange.toFixed(1)}%`}
                                aria-label={`1 minute change ${shortChange.toFixed(1)} percent`}
                              >
                                {shortChange >= 0 ? "+" : ""}
                                {shortChange.toFixed(1)}%
                              </span>
                                )
                              })()}
                              {(activeTab === "new" || activeTab === "dexpaid") && typeof (token as TokenRowRuntime).priceChange24h === "number" && (
                                <span
                                  className={`mt-1 text-[8px] sm:text-[9px] ${
                                    ((token as TokenRowRuntime).priceChange24h ?? 0) >= 0
                                      ? "text-green-500/80"
                                      : "text-red-500/80"
                                  }`}
                                  title={`24h change: ${((token as TokenRowRuntime).priceChange24h ?? 0).toFixed(1)}%`}
                                  aria-label={`24 hour change ${((token as TokenRowRuntime).priceChange24h ?? 0).toFixed(1)} percent`}
                                >
                                  {((token as TokenRowRuntime).priceChange24h ?? 0) >= 0 ? "+" : ""}
                                  {((token as TokenRowRuntime).priceChange24h ?? 0).toFixed(1)}%
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-mono text-[10px] sm:text-xs py-2 px-4">
                            <div className="flex flex-col items-end leading-none">
                              <span>{formatNumber(token.volume24h)}</span>
                              {(activeTab === "new" || activeTab === "dexpaid") && token.mc > 0 && (
                                <span
                                  className="mt-1 text-[8px] sm:text-[9px] text-muted-foreground"
                                  title={`Vol/MC: ${(token.volume24h / Math.max(token.mc, 1)).toFixed(2)}x`}
                                  aria-label={`Volume to market cap ratio ${(token.volume24h / Math.max(token.mc, 1)).toFixed(2)}x`}
                                >
                                  {(token.volume24h / Math.max(token.mc, 1)).toFixed(2)}x
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-2 px-4" />
                          <TableCell className="text-right text-[9px] sm:text-xs text-muted-foreground py-2 px-4">
                            {getTimeAgo(token.updatedAt)}
                          </TableCell>
                          <TableCell className="py-2 px-4">
                            <div className="flex gap-1 justify-center">
                              <Button
                                size="sm"
                                variant="ghost"
                                className={`${activeTab === "new" ? "h-11 w-11 sm:h-6 sm:w-6" : "h-6 w-6"} p-0 hover:bg-primary/20`}
                                onClick={(e) => openBuyLink("trojan", token.address, e)}
                                title="Buy on Trojan"
                                aria-label="Buy on Trojan"
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
                                className={`${activeTab === "new" ? "h-11 w-11 sm:h-6 sm:w-6" : "h-6 w-6"} p-0 hover:bg-primary/20`}
                                onClick={(e) => openBuyLink("axion", token.address, e)}
                                title="Buy on Axion"
                                aria-label="Buy on Axion"
                              >
                                <Image src="/images/axiom.png" alt="Axion" width={16} height={16} className="rounded" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className={`${activeTab === "new" ? "h-11 w-11 sm:h-6 sm:w-6" : "h-6 w-6"} p-0 hover:bg-primary/20`}
                                onClick={(e) => openBuyLink("gmgn", token.address, e)}
                                title="Buy on GMGN"
                                aria-label="Buy on GMGN"
                              >
                                <Image src="/images/gmgn.png" alt="GMGN" width={16} height={16} className="rounded" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className={`${activeTab === "new" ? "h-11 w-11 sm:h-6 sm:w-6" : "h-6 w-6"} p-0 hover:bg-primary/20`}
                                onClick={(e) => openBuyLink("bonk", token.address, e)}
                                title="Buy on Bonk"
                                aria-label="Buy on Bonk"
                              >
                                <Image src="/images/bonk.png" alt="Bonk" width={16} height={16} className="rounded" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>

                        <TableRow
                          onClick={() => handleTokenClick(token)}
                          className={rowClassName}
                        >
                          <TableCell colSpan={7} className="px-4 py-2">
                            <div className="flex flex-col gap-1">
                              <div className="flex flex-wrap items-center gap-2">
                                {token.signals.slice(0, 6).map((signal, idx) => (
                                  <SignalBadge
                                    key={idx}
                                    type={signal}
                                    size="sm"
                                    iconOnly
                                    boostCount={signal === "DEXBOOST_PAID" ? token.boostCount : undefined}
                                  />
                                ))}
                                {typeof (token as TokenRowRuntime).confidenceScore === "number" && (
                                  <ConfidenceBar score={(token as TokenRowRuntime).confidenceScore ?? 0} />
                                )}
                                {token.signals.length > 6 && (
                                  <span className="text-[9px] sm:text-xs text-muted-foreground">+{token.signals.length - 6}</span>
                                )}
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 text-[9px] sm:text-[10px] text-muted-foreground">
                                {activeTab === "ads" && (token as TokenRowRuntime).adType && (
                                  <div title="Ad type" aria-label="Ad type">
                                    <span className="text-amber-500">📣</span> Type {(token as TokenRowRuntime).adType}
                                  </div>
                                )}
                                {activeTab === "ads" && typeof (token as TokenRowRuntime).adImpressions === "number" && (
                                  <div title="Ad impressions" aria-label="Ad impressions">
                                    <span className="text-amber-500">👁️</span> Impressions {formatCount((token as TokenRowRuntime).adImpressions ?? 0)}
                                  </div>
                                )}
                                {activeTab === "ads" && typeof (token as TokenRowRuntime).adDurationHours === "number" && (
                                  <div title="Ad duration" aria-label="Ad duration">
                                    <span className="text-amber-500">⏱️</span> Duration {(token as TokenRowRuntime).adDurationHours?.toFixed(0)}h
                                  </div>
                                )}
                                {typeof (token as TokenRowRuntime).buyCount === "number" &&
                                  typeof (token as TokenRowRuntime).sellCount === "number" && (
                                    <div title="Buy Pressure (buys vs sells)" aria-label="Buy pressure">
                                      <span className="text-green-600">🟢</span> Buy Pressure {(token as TokenRowRuntime).buyCount} / {(token as TokenRowRuntime).sellCount}
                                    </div>
                                  )}

                                {typeof (token as TokenRowRuntime).organicPct === "number" && (
                                  <div title="Organic volume percentage" aria-label="Organic volume percentage">
                                    <span className={((token as TokenRowRuntime).organicPct ?? 0) >= 70 ? "text-green-600" : "text-yellow-600"}>
                                      {((token as TokenRowRuntime).organicPct ?? 0) >= 70 ? "🟢" : "🟡"}
                                    </span>{" "}
                                    Organic {(token as TokenRowRuntime).organicPct?.toFixed(0)}%
                                  </div>
                                )}

                                {typeof (token as TokenRowRuntime).top10HoldingsPct === "number" && (
                                  <div title="Whale Risk (Top10 holdings)" aria-label="Whale risk">
                                    <span className={((token as TokenRowRuntime).top10HoldingsPct ?? 0) >= 25 ? "text-yellow-600" : "text-green-600"}>
                                      {((token as TokenRowRuntime).top10HoldingsPct ?? 0) >= 25 ? "🟡" : "🟢"}
                                    </span>{" "}
                                    Whale Top10 {(token as TokenRowRuntime).top10HoldingsPct?.toFixed(1)}%
                                  </div>
                                )}

                                {typeof (token as TokenRowRuntime).devHoldingsPct === "number" && (
                                  <div title="Dev Risk (dev holdings)" aria-label="Dev risk">
                                    <span className={((token as TokenRowRuntime).devHoldingsPct ?? 0) <= 5 ? "text-green-600" : "text-yellow-600"}>
                                      {((token as TokenRowRuntime).devHoldingsPct ?? 0) <= 5 ? "🟢" : "🟡"}
                                    </span>{" "}
                                    Dev {(token as TokenRowRuntime).devHoldingsPct?.toFixed(1)}%
                                  </div>
                                )}

                                {((token as TokenRowRuntime).createdAt || (token as TokenRowRuntime).updatedAt) && (
                                  <div title="Freshness" aria-label="Freshness">
                                    <span className="text-green-600">🟢</span> Fresh {getTimeAgo(((token as TokenRowRuntime).createdAt ?? token.updatedAt) as string)}
                                  </div>
                                )}

                                {typeof (token as TokenRowRuntime).priceChange1m === "number" && (
                                  <div title="Momentum radar (1m)" aria-label="Momentum radar">
                                    <span
                                      className={
                                        (token as TokenRowRuntime).momentumState === "ACCELERATING"
                                          ? "text-green-600"
                                          : (token as TokenRowRuntime).momentumState === "COOLING"
                                            ? "text-red-600"
                                            : "text-yellow-600"
                                      }
                                    >
                                      {(token as TokenRowRuntime).momentumState === "ACCELERATING"
                                        ? "🟢"
                                        : (token as TokenRowRuntime).momentumState === "COOLING"
                                          ? "🔴"
                                          : "🟡"}
                                    </span>{" "}
                                    Radar {(token as TokenRowRuntime).momentumState}
                                  </div>
                                )}

                                {typeof (token as TokenRowRuntime).spikeProbability === "number" && (
                                  <div
                                    title={
                                      "Often Spike % (proxy). Spike Probability = score × 100, where score = w1*priceMomentum + w2*volumeAcceleration + w3*(liquidity/MC) + w4*marketCapBias + w5*recencyFactor. This is a fast approximation (not long historical candles)."
                                    }
                                    aria-label="Often spike probability"
                                  >
                                    <span
                                      className={`inline-flex items-center rounded border px-1.5 py-0 h-4 leading-none text-[8px] sm:text-[9px] ${getSpikeBadgeClass(
                                        (token as TokenRowRuntime).spikeProbability ?? 0,
                                      )}`}
                                      title="Often Spike probability band"
                                      aria-label="Spike probability band"
                                    >
                                      SPIKE
                                    </span>{" "}
                                    <span className={getSpikeBand((token as TokenRowRuntime).spikeProbability ?? 0).tone}>🔥</span>{" "}
                                    Often Spike {Math.round((token as TokenRowRuntime).spikeProbability ?? 0)}%
                                  </div>
                                )}
                              </div>

                            </div>
                          </TableCell>
                        </TableRow>
                      </Fragment>
                        )
                      })}

                      {(activeTab === "new" || activeTab === "boost" || activeTab === "dexpaid" || activeTab === "cto" || activeTab === "ads") &&
                        shouldVirtualizeNewTab &&
                        newTabWindowed.bottomPad > 0 && (
                        <TableRow className="border-border hover:bg-transparent">
                          <TableCell colSpan={8} style={{ height: newTabWindowed.bottomPad }} className="p-0" />
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </>
        )}
      </CardContent>

      {activeTab === "new" && (
        <Drawer
          open={Boolean(newTabDetailsDrawerToken)}
          onOpenChange={(open) => {
            if (!open) setNewTabDetailsDrawerToken(null)
          }}
        >
          <DrawerContent className="max-h-[80vh]">
            <DrawerHeader>
              <DrawerTitle className="text-sm">
                {newTabDetailsDrawerToken ? `${newTabDetailsDrawerToken.name} (${newTabDetailsDrawerToken.symbol})` : "Dexpath Detail"}
              </DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-4 overflow-auto">
              {newTabDetailsDrawerToken ? renderNewTabDexpathDetail(newTabDetailsDrawerToken) : null}
            </div>
            <DrawerFooter>
              {newTabDetailsDrawerToken && newTabHiddenDetails[newTabDetailsDrawerToken.address] && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setNewTabHiddenDetails((prev) => ({ ...prev, [newTabDetailsDrawerToken.address]: false }))
                    setNewTabDetailsDrawerToken(null)
                  }}
                >
                  Show Inline
                </Button>
              )}
              <DrawerClose asChild>
                <Button type="button">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
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
