export type Token = {
  priceChange1m?: number
  priceChange5m?: number
  volume1m?: number
  volume5m?: number
  liquidity?: number
  marketCap?: number
  spikeProbability?: number
  confidenceScore?: number
  tokenAgeMinutes?: number
}

export type TokenSummary = {
  verdict: string
  momentum: string[]
  risks: string[]
  mode: "SNIPER" | "SCALPER" | "NO_TRADE"
  confidence: "LOW" | "MEDIUM" | "HIGH"
}

const isFiniteNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value)

export function generateTokenSummary(token: Token): TokenSummary {
  const momentum: string[] = []
  const risks: string[] = []

  const priceChange1m = isFiniteNumber(token.priceChange1m) ? token.priceChange1m : undefined
  const priceChange5m = isFiniteNumber(token.priceChange5m) ? token.priceChange5m : undefined
  const volume1m = isFiniteNumber(token.volume1m) ? token.volume1m : undefined
  const volume5m = isFiniteNumber(token.volume5m) ? token.volume5m : undefined
  const liquidity = isFiniteNumber(token.liquidity) ? token.liquidity : undefined
  const marketCap = isFiniteNumber(token.marketCap) ? token.marketCap : undefined
  const spikeProbability = isFiniteNumber(token.spikeProbability) ? token.spikeProbability : undefined
  const confidenceScore = isFiniteNumber(token.confidenceScore) ? token.confidenceScore : undefined
  const tokenAgeMinutes = isFiniteNumber(token.tokenAgeMinutes) ? token.tokenAgeMinutes : undefined

  // --- MOMENTUM RULES ---
  if (
    isFiniteNumber(priceChange1m) &&
    isFiniteNumber(priceChange5m) &&
    priceChange1m > 0 &&
    priceChange5m > priceChange1m
  ) {
    momentum.push("Price acceleration in first 5 minutes")
  }

  if (isFiniteNumber(volume1m) && isFiniteNumber(volume5m) && volume1m > 0 && volume5m >= volume1m * 1.5) {
    momentum.push("Volume expanding confirms move")
  }

  if (isFiniteNumber(spikeProbability) && spikeProbability >= 60) {
    momentum.push("High early spike probability")
  }

  // --- RISK RULES ---
  if (isFiniteNumber(liquidity) && isFiniteNumber(marketCap) && marketCap > 0 && liquidity / marketCap < 0.05) {
    risks.push("Thin liquidity increases dump risk")
  }

  if (isFiniteNumber(spikeProbability) && spikeProbability > 80) {
    risks.push("Overheated spike zone")
  }

  if (isFiniteNumber(tokenAgeMinutes) && tokenAgeMinutes < 2) {
    risks.push("Extremely new token")
  }

  // --- MODE DECISION ---
  const mode: TokenSummary["mode"] = (() => {
    if (isFiniteNumber(spikeProbability) && spikeProbability >= 60 && momentum.length >= 2) return "SNIPER"
    if (isFiniteNumber(spikeProbability) && spikeProbability >= 40 && momentum.length >= 1) return "SCALPER"
    return "NO_TRADE"
  })()

  // --- CONFIDENCE ---
  const confidence: TokenSummary["confidence"] = (() => {
    if (isFiniteNumber(confidenceScore) && confidenceScore >= 70) return "HIGH"
    if (isFiniteNumber(confidenceScore) && confidenceScore >= 40) return "MEDIUM"
    return "LOW"
  })()

  // --- VERDICT ---
  const verdict = (() => {
    if (mode === "SNIPER") return "Strong early momentum detected within first minutes."
    if (mode === "SCALPER") return "Early movement present but continuation not fully confirmed."
    return "Signals are weak or unstable for early entry."
  })()

  return {
    verdict,
    momentum,
    risks,
    mode,
    confidence,
  }
}
