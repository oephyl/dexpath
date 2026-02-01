export type TokenAnalyzerInputs = {
  // Price/volume (USD)
  priceUSD?: number
  athUSD?: number
  atlUSD?: number

  priceChange1minPercentage?: number
  priceChange5minPercentage?: number

  volume5minUSD?: number
  volumeBuy5minUSD?: number
  volumeSell5minUSD?: number
  organicVolume5minUSD?: number

  buys5min?: number
  sells5min?: number

  // Liquidity/market cap
  liquidityUSD?: number
  liquidityMaxUSD?: number
  marketCapUSD?: number

  // Holders & concentration (percent or ratio)
  holdersCount?: number
  top10HoldingsPercentage?: number
  devHoldingsPercentage?: number
  snipersHoldingsPercentage?: number

  // Trend scores
  trendingScore1min?: number
  trendingScore5min?: number
  trendingScore4h?: number
}

export type TokenAnalyzerMode = "SNIPER" | "SCALPER" | "SWING" | "WAIT"

export type ConfidenceLabel = "❌ Avoid" | "⚠️ Risky" | "✅ Tradeable" | "🔥 Strong" | "🚀 High Conviction"

export type TokenAnalyzerMetrics = {
  momentumScore: number
  buySellRatio: number
  tradeBias: number
  liquidityRatio: number
  bondingProgress: number
  concentrationScore: number
  organicVolumeRatio: number
  spikePosition: number
  trendStrength: number
  confidenceScore: number
  confidenceLabel: ConfidenceLabel
  mode: TokenAnalyzerMode
  summary: string[]
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

// Returns 0..1
export function normalize(value: number, min: number, max: number) {
  if (!Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max)) return 0
  if (max <= min) return 0
  return clamp((value - min) / (max - min), 0, 1)
}

function asNumber(v: any): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v
  if (typeof v === "string") {
    const n = Number(v)
    if (Number.isFinite(n)) return n
  }
  return undefined
}

function toRatioMaybe(v?: number): number {
  if (!Number.isFinite(v as number)) return 0
  const n = v as number
  // If value looks like percent (e.g. 25, 80), convert to 0..1
  return n > 1 ? n / 100 : n
}

export function analyzeToken(inputs: TokenAnalyzerInputs): TokenAnalyzerMetrics {
  const priceChange1m = inputs.priceChange1minPercentage ?? 0
  const priceChange5m = inputs.priceChange5minPercentage ?? 0

  const volume5m = Math.max(inputs.volume5minUSD ?? 0, 0)
  const volumeBuy5m = Math.max(inputs.volumeBuy5minUSD ?? 0, 0)
  const volumeSell5m = Math.max(inputs.volumeSell5minUSD ?? 0, 0)
  const organicVolume5m = Math.max(inputs.organicVolume5minUSD ?? 0, 0)

  const buys5m = Math.max(inputs.buys5min ?? 0, 0)
  const sells5m = Math.max(inputs.sells5min ?? 0, 0)

  const liquidityUSD = Math.max(inputs.liquidityUSD ?? 0, 0)
  const liquidityMaxUSD = Math.max(inputs.liquidityMaxUSD ?? 0, 0)
  const marketCapUSD = Math.max(inputs.marketCapUSD ?? 0, 0)

  const top10 = toRatioMaybe(inputs.top10HoldingsPercentage)
  const devHoldings = toRatioMaybe(inputs.devHoldingsPercentage)
  const snipers = toRatioMaybe(inputs.snipersHoldingsPercentage)

  const athUSD = Math.max(inputs.athUSD ?? 0, 0)
  const atlUSD = Math.max(inputs.atlUSD ?? 0, 0)
  const priceUSD = Math.max(inputs.priceUSD ?? 0, 0)

  const trending1m = inputs.trendingScore1min ?? 0
  const trending5m = inputs.trendingScore5min ?? 0
  const trending4h = inputs.trendingScore4h ?? 0

  // A. Price Momentum (1–5 min)
  const momentumScore =
    (priceChange1m * 0.4 + priceChange5m * 0.6) * Math.log10(Math.max(volume5m, 0) + 1)

  // B. Buy vs Sell Pressure
  const buySellRatio = volumeBuy5m / Math.max(volumeSell5m, 1)
  const tradeBias = buys5m / Math.max(sells5m, 1)

  // C. Liquidity Risk
  const liquidityRatio = liquidityUSD / Math.max(marketCapUSD, 1)
  const bondingProgress = liquidityUSD / Math.max(liquidityMaxUSD, 1)

  // D. Holder Concentration (Rug Risk)
  const concentrationScore = top10 + devHoldings + snipers

  // E. Organic Activity (Bot Filter)
  const organicVolumeRatio = organicVolume5m / Math.max(volume5m, 1)

  // F. Volatility Spike Position (60–80%)
  const spikePosition = (priceUSD - atlUSD) / Math.max(athUSD - atlUSD, 1e-9)

  // G. Trend Strength
  const trendStrength = trending1m * 0.5 + trending5m * 0.3 + trending4h * 0.2

  // Confidence Score (0–100)
  const confidence01 =
    normalize(momentumScore, 0, 50) * 0.25 +
    normalize(buySellRatio, 0, 3) * 0.2 +
    normalize(organicVolumeRatio, 0, 1) * 0.15 +
    normalize(liquidityRatio, 0, 1) * 0.15 +
    normalize(1 - concentrationScore, 0, 1) * 0.15 +
    normalize(trendStrength, 0, 50) * 0.1

  const confidenceScore = Math.round(clamp(confidence01 * 100, 0, 100))

  const confidenceLabel: ConfidenceLabel =
    confidenceScore < 30
      ? "❌ Avoid"
      : confidenceScore < 50
        ? "⚠️ Risky"
        : confidenceScore < 70
          ? "✅ Tradeable"
          : confidenceScore < 85
            ? "🔥 Strong"
            : "🚀 High Conviction"

  // Mode recommendation
  const holdersCount = inputs.holdersCount ?? 0
  const mode: TokenAnalyzerMode =
    momentumScore > 20 && liquidityUSD < 5000
      ? "SNIPER"
      : momentumScore > 10 && organicVolumeRatio > 0.4
        ? "SCALPER"
        : trendStrength > 20 && holdersCount > 100
          ? "SWING"
          : "WAIT"

  // Deterministic summary (max 4 sentences)
  const summary: string[] = []

  if (momentumScore > 20) {
    summary.push(`Strong short-term momentum (score: ${momentumScore.toFixed(1)}).`)
  } else if (momentumScore < -10) {
    summary.push(`Negative short-term momentum (score: ${momentumScore.toFixed(1)}).`)
  }

  if (buySellRatio >= 1.25 || tradeBias >= 1.25) {
    summary.push(
      `Buy pressure leads in 5m (buy/sell vol: ${buySellRatio.toFixed(2)}, buys/sells: ${tradeBias.toFixed(2)}).`,
    )
  } else if (buySellRatio <= 0.8 || tradeBias <= 0.8) {
    summary.push(
      `Sell pressure leads in 5m (buy/sell vol: ${buySellRatio.toFixed(2)}, buys/sells: ${tradeBias.toFixed(2)}).`,
    )
  }

  if (liquidityUSD > 0 && marketCapUSD > 0 && liquidityRatio < 0.02) {
    summary.push(`Liquidity is thin (Liq/MC: ${(liquidityRatio * 100).toFixed(2)}%).`)
  } else if (liquidityUSD > 0 && marketCapUSD > 0 && liquidityRatio > 0.1) {
    summary.push(`Liquidity is strong (Liq/MC: ${(liquidityRatio * 100).toFixed(2)}%).`)
  }

  if (athUSD > 0 && atlUSD > 0 && athUSD > atlUSD) {
    const posPct = clamp(spikePosition, 0, 1) * 100
    if (posPct >= 60 && posPct <= 80) {
      summary.push(`Price is at ${posPct.toFixed(0)}% of the ATH–ATL range.`)
    }
  }

  // Always include mode as the last sentence (ensures at least 1 sentence)
  summary.push(`Recommended mode: ${mode}.`)

  return {
    momentumScore,
    buySellRatio,
    tradeBias,
    liquidityRatio,
    bondingProgress,
    concentrationScore,
    organicVolumeRatio,
    spikePosition,
    trendStrength,
    confidenceScore,
    confidenceLabel,
    mode,
    summary: summary.slice(0, 4),
  }
}

export function extractMobulaTokenDetailsInputs(mobulaJson: any): TokenAnalyzerInputs {
  // This function is deterministic and only maps known fields with safe fallbacks.
  const d = mobulaJson?.data ?? mobulaJson?.data?.data ?? mobulaJson?.data?.token ?? mobulaJson?.token ?? mobulaJson

  return {
    priceUSD: asNumber(d?.priceUSD ?? d?.price_usd ?? d?.price),
    athUSD: asNumber(d?.athUSD ?? d?.ath_usd ?? d?.ath),
    atlUSD: asNumber(d?.atlUSD ?? d?.atl_usd ?? d?.atl),

    priceChange1minPercentage: asNumber(
      d?.priceChange1minPercentage ?? d?.priceChange1mPercentage ?? d?.priceChange1m ?? d?.price_change_1m,
    ),
    priceChange5minPercentage: asNumber(
      d?.priceChange5minPercentage ?? d?.priceChange5mPercentage ?? d?.priceChange5m ?? d?.price_change_5m,
    ),

    volume5minUSD: asNumber(d?.volume5minUSD ?? d?.volume_5m_usd ?? d?.volume5mUsd),
    volumeBuy5minUSD: asNumber(d?.volumeBuy5minUSD ?? d?.volume_buy_5m_usd ?? d?.volumeBuy5mUsd),
    volumeSell5minUSD: asNumber(d?.volumeSell5minUSD ?? d?.volume_sell_5m_usd ?? d?.volumeSell5mUsd),
    organicVolume5minUSD: asNumber(d?.organicVolume5minUSD ?? d?.organic_volume_5m_usd ?? d?.organicVolume5mUsd),

    buys5min: asNumber(d?.buys5min ?? d?.buys_5m),
    sells5min: asNumber(d?.sells5min ?? d?.sells_5m),

    liquidityUSD: asNumber(d?.liquidityUSD ?? d?.liquidity_usd ?? d?.liquidity),
    liquidityMaxUSD: asNumber(d?.liquidityMaxUSD ?? d?.liquidity_max_usd ?? d?.liquidityMax),
    marketCapUSD: asNumber(d?.marketCapUSD ?? d?.market_cap_usd ?? d?.marketCap ?? d?.mcap),

    holdersCount: asNumber(d?.holdersCount ?? d?.holders_count ?? d?.holders),
    top10HoldingsPercentage: asNumber(d?.top10HoldingsPercentage ?? d?.top10_holdings_pct ?? d?.top10Pct),
    devHoldingsPercentage: asNumber(d?.devHoldingsPercentage ?? d?.dev_holdings_pct ?? d?.devPct),
    snipersHoldingsPercentage: asNumber(d?.snipersHoldingsPercentage ?? d?.snipers_holdings_pct ?? d?.snipersPct),

    trendingScore1min: asNumber(d?.trendingScore1min ?? d?.trendScore1m ?? d?.trend_1m),
    trendingScore5min: asNumber(d?.trendingScore5min ?? d?.trendScore5m ?? d?.trend_5m),
    trendingScore4h: asNumber(d?.trendingScore4h ?? d?.trendScore4h ?? d?.trend_4h),
  }
}
