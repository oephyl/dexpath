"use client"

import { useMemo } from "react"
import { AlertTriangle, BadgeCheck, CheckCircle2, Crosshair, Flame, RefreshCw, Rocket, TrendingUp, Users } from "lucide-react"
import { analyzeToken, extractMobulaTokenDetailsInputs } from "@/lib/token-analyzer"
import { Progress } from "@/components/ui/progress"

function formatPct(v: unknown, digits = 2) {
  const n = typeof v === "number" ? v : Number(v)
  if (!Number.isFinite(n)) return "--"
  return `${n.toFixed(digits)}%`
}

function formatPct01(v: number) {
  if (!Number.isFinite(v)) return "--"
  return `${(v * 100).toFixed(2)}%`
}

function formatPctSmart(v: unknown) {
  const n = typeof v === "number" ? v : Number(v)
  if (!Number.isFinite(n)) return "--"
  return n > 1 ? `${n.toFixed(2)}%` : `${(n * 100).toFixed(2)}%`
}

function formatNum(v: number, digits = 2) {
  if (!Number.isFinite(v)) return "--"
  return v.toFixed(digits)
}

function formatCount(v: unknown) {
  const n = typeof v === "number" ? v : Number(v)
  if (!Number.isFinite(n)) return "--"
  return new Intl.NumberFormat(undefined, { notation: "compact" }).format(n)
}

function getPath(obj: any, path: string): any {
  const parts = path.split(".")
  let cur = obj
  for (const p of parts) {
    if (cur == null) return undefined
    cur = cur[p]
  }
  return cur
}

function Metric({ label, value, icon, tone }: { label: string; value: React.ReactNode; icon?: React.ReactNode; tone?: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className={`mt-1 inline-flex items-center gap-2 text-sm font-semibold leading-none ${tone ?? ""}`}>
        {icon ? <span className="text-emerald-400/90">{icon}</span> : null}
        {value}
      </div>
    </div>
  )
}

export function SignalAnalyzerTab({
  mobula,
  dexPaid,
}: {
  mobula: any | null
  dexPaid: boolean
}) {
  const mobulaData = mobula?.data ?? mobula?.data?.data ?? mobula
  const { inputs, analysis } = useMemo(() => {
    if (!mobula) return { inputs: null as any, analysis: null as any }
    const i = extractMobulaTokenDetailsInputs(mobula)
    return { inputs: i, analysis: analyzeToken(i) }
  }, [mobula])

  const holders = getPath(mobulaData, "holdersCount") ?? getPath(mobulaData, "holders")

  const top10 = inputs?.top10HoldingsPercentage
  const dev = inputs?.devHoldingsPercentage
  const snipers = inputs?.snipersHoldingsPercentage
  const bondedRaw = getPath(mobulaData, "bonded") ?? getPath(mobulaData, "isBonded")
  const bonded = bondedRaw === true || bondedRaw === "true"
  const bondingValue = bonded
    ? "100.00%"
    : formatPctSmart(getPath(mobulaData, "bondingPercentage") ?? inputs?.bondingPercentage)
  const proTraders = getPath(mobulaData, "proTradersCount") ?? getPath(mobulaData, "pro_traders_count")
  const smartTraders = getPath(mobulaData, "smartTradersCount") ?? getPath(mobulaData, "smart_traders_count")
  const freshTraders = getPath(mobulaData, "freshTradersCount") ?? getPath(mobulaData, "fresh_traders_count")

  return (
    <div className="space-y-4 text-[13px] max-h-[560px] overflow-y-auto pr-2">
      {/* Top metrics grid (matches screenshot style: no boxes) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-5">
        <Metric
          label="Top 10"
          value={
            <span className="inline-flex items-center gap-2">
              <span className={typeof top10 === "number" && top10 <= 10 ? "text-green-500" : ""}>{formatPct(top10)}</span>
            </span>
          }
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
        <Metric
          label="DEV"
          value={
            <span className={typeof dev === "number" && dev <= 2 ? "text-green-500" : ""}>{formatPct(dev)}</span>
          }
          icon={<BadgeCheck className="h-4 w-4" />}
        />
        <Metric label="Holders" value={<span>{formatCount(holders)}</span>} icon={<Users className="h-4 w-4" />} />
        <Metric label="Snipers" value={<span>{formatPct(snipers)}</span>} icon={<Crosshair className="h-4 w-4" />} />

        <Metric label="Dex Paid" value={<span className={dexPaid ? "text-green-500" : ""}>{dexPaid ? "Paid" : "Unpaid"}</span>} icon={<CheckCircle2 className="h-4 w-4" />} />
        <Metric
          label="Burnt"
          value={
            <span className="inline-flex items-center gap-2">
              <span>{formatPct(getPath(mobulaData, "burnedPercent") ?? getPath(mobulaData, "burntPercent"))}</span>
            </span>
          }
          icon={<Flame className="h-4 w-4 text-amber-500" />}
        />
        <Metric label="Organic" value={<span>{analysis ? formatPct01(analysis.organicVolumeRatio) : "--"}</span>} icon={<TrendingUp className="h-4 w-4" />} />
        <Metric label="Liq/MC" value={<span>{analysis ? formatPct01(analysis.liquidityRatio) : "--"}</span>} icon={<TrendingUp className="h-4 w-4" />} />
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span title={`Smart traders: ${smartTraders ?? 0}`}>
          🧠 Smart {(smartTraders ?? 0) > 0 ? `✅ ${smartTraders}` : "❌"}
        </span>
        <span title={`Pro traders: ${proTraders ?? 0}`}>
          🐳 Pro {(proTraders ?? 0) > 0 ? `✅ ${proTraders}` : "❌"}
        </span>
        <span title={`Fresh wallets: ${freshTraders ?? 0}`}>
          🆕 Fresh {(freshTraders ?? 0) > 0 ? `✅ ${freshTraders}` : "⚠️ 0"}
        </span>
      </div>

      {/* Analyzer core blocks */}
      <div className="space-y-4">
        <div className="border-b border-border/40 pb-3">
          <div className="mb-2 space-y-1 text-xs text-muted-foreground">
            <div className="inline-flex items-center gap-2 text-xs font-bold">
              <RefreshCw className="h-3.5 w-3.5 text-emerald-400" />
              Created tokens: {formatCount(getPath(mobulaData, "deployerTokensCount"))}
            </div><br/>
            <div className="inline-flex items-center gap-2 text-xs font-bold">
              <Rocket className="h-3.5 w-3.5 text-sky-400" />
              Creator migration tokens: {formatCount(getPath(mobulaData, "deployerMigrationsCount"))}
            </div>
          </div>
          <div className="text-xs font-medium">Confidence</div>
          {!analysis ? (
            <div className="mt-2 text-xs text-muted-foreground">Waiting for analyzer data…</div>
          ) : (
            <div className="mt-2 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="text-muted-foreground">Label</div>
                <div className="font-medium">{analysis.confidenceLabel}</div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="text-muted-foreground">Score</div>
                <div className="font-mono">{analysis.confidenceScore}/100</div>
              </div>
              <Progress value={analysis.confidenceScore} className="h-1.5" />
              <div className="text-xs text-muted-foreground">Mode: {analysis.mode}</div>
            </div>
          )}
        </div>

        {analysis ? (
          <div className="border-b border-border/40 pb-3">
            <div className="text-xs font-medium">Trader Signals</div>
            <div className="mt-2 space-y-2 text-xs text-muted-foreground">
              <div>
                <div className="text-[11px] uppercase tracking-wide">Buy Pressure</div>
                <div className="mt-1 font-mono text-foreground">Buys/Sells: {formatNum(analysis.tradeBias, 2)}</div>
                <div className="font-mono text-foreground">Buy/Sell Vol: {formatNum(analysis.buySellRatio, 2)}</div>
                <div className="mt-1 font-mono">Buys: {formatNum(inputs?.buys5min ?? 0, 0)} · Sells: {formatNum(inputs?.sells5min ?? 0, 0)}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide">Organic</div>
                <div className="mt-1 font-mono text-foreground">{formatPct01(analysis.organicVolumeRatio)}</div>
                <div className="mt-1 font-mono">Organic USD (5m): {formatNum(inputs?.organicVolume5minUSD ?? 0, 0)}</div>
                <div className="font-mono">Total USD (5m): {formatNum(inputs?.volume5minUSD ?? 0, 0)}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide">Concentration</div>
                <div className="mt-1 font-mono text-foreground">Score: {formatNum(analysis.concentrationScore, 3)}</div>
                <div className="mt-1 font-mono">Top10: {formatNum(top10 ?? 0, 2)}%</div>
                <div className="font-mono">Dev: {formatNum(dev ?? 0, 2)}%</div>
                <div className="font-mono">Snipers: {formatNum(snipers ?? 0, 2)}%</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide">Liquidity</div>
                <div className="mt-1 font-mono text-foreground">Liq/MC: {formatPct01(analysis.liquidityRatio)}</div>
                <div className="mt-1 font-mono">Liquidity USD: {formatNum(inputs?.liquidityUSD ?? 0, 0)}</div>
                <div className="font-mono">Vol/MC (5m): {formatNum((inputs?.volume5minUSD ?? 0) / Math.max(inputs?.marketCapUSD ?? 0, 1), 4)}x</div>
              </div>
            </div>
          </div>
        ) : null}

        {analysis ? (
          <div>
            <div className="text-xs font-medium">Metrics Snapshot</div>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-8">
              {[
                { label: "Momentum", value: formatNum(analysis.momentumScore, 1) },
                { label: "Buy/Sell Vol", value: formatNum(analysis.buySellRatio, 2) },
                { label: "Buys/Sells", value: formatNum(analysis.tradeBias, 2) },
                { label: "Organic Vol", value: formatPct01(analysis.organicVolumeRatio) },
                { label: "Liq/MC", value: formatPct01(analysis.liquidityRatio) },
                { label: "Bonding", value: bondingValue },
                { label: "Concentration", value: formatNum(analysis.concentrationScore, 3) },
                { label: "Trend", value: formatNum(analysis.trendStrength, 1) },
              ].map((r) => (
                <div key={r.label} className="flex items-center justify-between gap-6 border-b border-border/40 py-2 last:border-b-0">
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{r.label}</div>
                  <div className="text-xs font-mono text-right">{r.value}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

    </div>
  )
}
