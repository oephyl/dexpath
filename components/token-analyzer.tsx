"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TokenSummary } from "@/components/token-summary"
import { analyzeToken, extractMobulaTokenDetailsInputs } from "@/lib/token-analyzer"

function formatPct01(v: number) {
  if (!Number.isFinite(v)) return "-"
  return `${(v * 100).toFixed(2)}%`
}

function formatNum(v: number, digits = 2) {
  if (!Number.isFinite(v)) return "-"
  return v.toFixed(digits)
}

export function TokenAnalyzerSection({
  mobula,
  loading,
}: {
  mobula: any | null
  loading: boolean
}) {
  const { inputs, analysis } = useMemo(() => {
    if (!mobula) return { inputs: null as any, analysis: null as any }
    const i = extractMobulaTokenDetailsInputs(mobula)
    return { inputs: i, analysis: analyzeToken(i) }
  }, [mobula])

  const top10Pct = inputs?.top10HoldingsPercentage
  const devPct = inputs?.devHoldingsPercentage
  const snipersPct = inputs?.snipersHoldingsPercentage
  const volPerMc = (inputs?.volume5minUSD ?? 0) / Math.max(inputs?.marketCapUSD ?? 0, 1)

  const metricRows = analysis
    ? [
        { label: "Momentum", value: formatNum(analysis.momentumScore, 1) },
        { label: "Buy/Sell Vol", value: formatNum(analysis.buySellRatio, 2) },
        { label: "Buys/Sells", value: formatNum(analysis.tradeBias, 2) },
        { label: "Organic Vol", value: formatPct01(analysis.organicVolumeRatio) },
        { label: "Liq/MC", value: formatPct01(analysis.liquidityRatio) },
        { label: "Bonding", value: formatPct01(analysis.bondingProgress) },
        { label: "Concentration", value: formatNum(analysis.concentrationScore, 3) },
        { label: "Trend", value: formatNum(analysis.trendStrength, 1) },
      ]
    : []

  const timelineItems = analysis
    ? [
        {
          title: "Price Changes",
          lines: [
            `1m: ${formatNum(inputs?.priceChange1minPercentage ?? 0, 2)}%`,
            `5m: ${formatNum(inputs?.priceChange5minPercentage ?? 0, 2)}%`,
          ],
        },
        {
          title: "Volume (5m)",
          lines: [
            `Total: ${formatNum(inputs?.volume5minUSD ?? 0, 0)} USD`,
            `Organic: ${formatNum(inputs?.organicVolume5minUSD ?? 0, 0)} USD`,
          ],
        },
        {
          title: "Buy vs Sell Imbalance",
          lines: [
            `Buy/Sell Vol: ${formatNum(analysis.buySellRatio, 2)}`,
            `Buys/Sells: ${formatNum(analysis.tradeBias, 2)}`,
          ],
        },
        {
          title: "Organic Activity",
          lines: [`Organic Ratio: ${formatPct01(analysis.organicVolumeRatio)}`],
        },
        {
          title: "Spike Position",
          lines: [
            `${formatPct01(Math.max(0, Math.min(1, analysis.spikePosition)))}`,
          ],
        },
        {
          title: "Trend Scores",
          lines: [
            `1m: ${formatNum(inputs?.trendingScore1min ?? 0, 1)}`,
            `5m: ${formatNum(inputs?.trendingScore5min ?? 0, 1)}`,
            `4h: ${formatNum(inputs?.trendingScore4h ?? 0, 1)}`,
            `Strength: ${formatNum(analysis.trendStrength, 1)}`,
          ],
        },
      ]
    : []

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Token Analyzer</h2>
        <Badge variant="outline" className="text-[10px]">Deterministic</Badge>
      </div>

      {loading && <div className="text-xs text-muted-foreground">Updating…</div>}

      {!analysis ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Analyzer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">Waiting for Mobula analyzer fields…</div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Confidence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold">{analysis.confidenceLabel}</div>
                <div className="text-sm font-mono">{analysis.confidenceScore}/100</div>
              </div>
              <Progress value={analysis.confidenceScore} />
              <div className="mt-2 text-xs text-muted-foreground">Mode: {analysis.mode}</div>
            </CardContent>
          </Card>

          {/* Trader quick signals (similar intent to New Coins) */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Trader Signals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-xs text-muted-foreground">
                <div className="border-b border-border/40 pb-3">
                  <div className="text-[10px] uppercase tracking-wide">Buy Pressure</div>
                  <div className="mt-1 font-mono text-sm text-foreground">Buys/Sells: {formatNum(analysis.tradeBias, 2)}</div>
                  <div className="font-mono text-sm text-foreground">Buy/Sell Vol: {formatNum(analysis.buySellRatio, 2)}</div>
                  <div className="mt-1 font-mono">Buys: {formatNum(inputs?.buys5min ?? 0, 0)} · Sells: {formatNum(inputs?.sells5min ?? 0, 0)}</div>
                </div>

                <div className="border-b border-border/40 pb-3">
                  <div className="text-[10px] uppercase tracking-wide">Organic</div>
                  <div className="mt-1 font-mono text-sm text-foreground">{formatPct01(analysis.organicVolumeRatio)}</div>
                  <div className="mt-1 font-mono">Organic USD (5m): {formatNum(inputs?.organicVolume5minUSD ?? 0, 0)}</div>
                  <div className="font-mono">Total USD (5m): {formatNum(inputs?.volume5minUSD ?? 0, 0)}</div>
                </div>

                <div className="border-b border-border/40 pb-3">
                  <div className="text-[10px] uppercase tracking-wide">Concentration (Rug Risk)</div>
                  <div className="mt-1 font-mono text-sm text-foreground">Score: {formatNum(analysis.concentrationScore, 3)}</div>
                  <div className="mt-1 font-mono">Top10: {formatNum(top10Pct ?? 0, 2)}%</div>
                  <div className="font-mono">Dev: {formatNum(devPct ?? 0, 2)}%</div>
                  <div className="font-mono">Snipers: {formatNum(snipersPct ?? 0, 2)}%</div>
                </div>

                <div>
                  <div className="text-[10px] uppercase tracking-wide">Liquidity</div>
                  <div className="mt-1 font-mono text-sm text-foreground">Liq/MC: {formatPct01(analysis.liquidityRatio)}</div>
                  <div className="mt-1 font-mono">Liquidity USD: {formatNum(inputs?.liquidityUSD ?? 0, 0)}</div>
                  <div className="font-mono">Vol/MC (5m): {formatNum(volPerMc, 4)}x</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Metrics Snapshot</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
                {Array.from({ length: 2 }).map((_, colIdx) => {
                  const col = metricRows.filter((_, i) => i % 2 === colIdx)
                  return (
                    <div key={`mcol-${colIdx}`} className="space-y-2">
                      {col.map((r) => (
                        <div
                          key={r.label}
                          className="flex items-center justify-between gap-6 border-b border-border/40 py-2 last:border-b-0"
                        >
                          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{r.label}</div>
                          <div className="text-sm font-mono text-right">{r.value}</div>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <TokenSummary lines={analysis.summary} title="Summary / Resume" />

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Signal Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative space-y-4 border-l border-border/40 pl-4">
                {timelineItems.map((item, idx) => (
                  <div key={item.title} className="relative">
                    <div className="absolute -left-[9px] top-2 h-2 w-2 rounded-full bg-muted-foreground/40" />
                    <div className="flex items-start justify-between gap-6">
                      <div>
                        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{item.title}</div>
                        <div className="mt-1 space-y-1">
                          {item.lines.map((line) => (
                            <div key={line} className="text-sm font-mono">{line}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                    {idx !== timelineItems.length - 1 ? (
                      <div className="mt-4 border-b border-border/30" />
                    ) : null}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </section>
  )
}
