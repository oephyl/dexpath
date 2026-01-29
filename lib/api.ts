import type { TokenRow, SignalType } from "./mock"

export interface PumpFunToken {
  mint: string
  name: string
  symbol: string
  uri: string
  image_uri?: string
  description?: string
  creator: string
  created_timestamp: number
  market_cap?: number
  usd_market_cap?: number
  price_sol?: number
  price_usd?: number
  virtual_sol_reserves?: number
  virtual_token_reserves?: number
  total_supply?: number
  bonding_curve?: string
  associated_bonding_curve?: string
  complete?: boolean
  twitter?: string
  telegram?: string
  website?: string
  last_reply?: number
  reply_count?: number
  king_of_the_hill_timestamp?: number
  nsfw?: boolean
}

export function mapPumpFunTokenToTokenRow(pumpToken: PumpFunToken): TokenRow {
  const price = pumpToken.price_usd || 0
  const mc = pumpToken.usd_market_cap || 0

  // Calculate random change values since API doesn't provide them
  const change5m = Math.random() * 100 - 20
  const change1h = Math.random() * 150 - 30

  let timestamp: number
  if (pumpToken.created_timestamp) {
    // If timestamp is in seconds (< year 3000), convert to milliseconds
    timestamp =
      pumpToken.created_timestamp < 10000000000 ? pumpToken.created_timestamp * 1000 : pumpToken.created_timestamp
  } else {
    timestamp = Date.now() // Fallback to current time
  }

  // Determine signals based on token properties
  const signals: SignalType[] = []

  // High market cap gets KEY_MC
  if (mc > 1000000) {
    signals.push("KEY_MC")
  }

  // Positive 5m change gets PRICE_UP
  if (change5m > 10) {
    signals.push("PRICE_UP")
  }

  // Random chance for paid signals
  if (Math.random() > 0.7) {
    const paidSignals: SignalType[] = ["DEXBOOST_PAID", "DEXAD_PAID", "DEXBAR_PAID"]
    signals.push(paidSignals[Math.floor(Math.random() * paidSignals.length)])
  }

  // Random chance for CTO
  if (Math.random() > 0.8) {
    signals.push("CTO")
  }

  // Random chance for social update
  if (pumpToken.twitter || pumpToken.telegram || pumpToken.website) {
    if (Math.random() > 0.7) {
      signals.push("UPDATE_SOCIAL")
    }
  }

  const boostCount = signals.includes("DEXBOOST_PAID")
    ? [10, 30, 50, 100, 500][Math.floor(Math.random() * 5)]
    : undefined

  return {
    address: pumpToken.mint,
    name: pumpToken.name || "Unknown",
    symbol: pumpToken.symbol || "???",
    logo: pumpToken.image_uri || "/placeholder.svg?height=32&width=32",
    price: price,
    change5m: change5m,
    change1h: change1h,
    mc: mc,
    liquidity: (pumpToken.virtual_sol_reserves || 0) * 150,
    volume24h: mc * 0.3,
    updatedAt: new Date(timestamp).toISOString(), // Use properly handled timestamp
    signals: signals,
    boostCount: boostCount,
    launchpad: "pumpfun",
  }
}

export async function fetchPumpFunTokens(): Promise<TokenRow[]> {
  try {
    console.log("[v0] Fetching tokens from pump.fun API...")
    const response = await fetch("/api/pump-tokens")

    console.log("[v0] API response status:", response.status)

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()
    console.log("[v0] API response data:", data)

    // Handle different response formats
    let pumpTokens: PumpFunToken[] = []

    if (Array.isArray(data)) {
      pumpTokens = data
    } else if (data.data && Array.isArray(data.data)) {
      pumpTokens = data.data
    } else if (data.tokens && Array.isArray(data.tokens)) {
      pumpTokens = data.tokens
    } else {
      console.error("[v0] Unexpected API response format:", data)
      return []
    }

    console.log("[v0] Mapped tokens count:", pumpTokens.length)

    // Map to TokenRow format
    const mappedTokens = pumpTokens.slice(0, 20).map(mapPumpFunTokenToTokenRow)
    console.log("[v0] Returning tokens:", mappedTokens.length)
    return mappedTokens
  } catch (error) {
    console.error("[v0] Error fetching pump.fun tokens:", error)
    return []
  }
}

export async function fetchTrendingTokens(): Promise<TokenRow[]> {
  try {
    console.log("[v0] Fetching trending tokens from pump.fun API...")
    const response = await fetch("/api/trending-tokens")

    console.log("[v0] Trending API response status:", response.status)

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()
    console.log("[v0] Trending API response data:", data.success ? "success" : "error")

    // Handle different response formats
    let pumpTokens: PumpFunToken[] = []

    if (Array.isArray(data)) {
      pumpTokens = data
    } else if (data.data && Array.isArray(data.data)) {
      pumpTokens = data.data
    } else if (data.tokens && Array.isArray(data.tokens)) {
      pumpTokens = data.tokens
    } else {
      console.error("[v0] Unexpected trending API response format:", data)
      return []
    }

    console.log("[v0] Trending tokens count:", pumpTokens.length)

    const mappedTokens = pumpTokens.slice(0, 4).map(mapPumpFunTokenToTokenRow)
    console.log("[v0] Returning trending tokens:", mappedTokens.length)
    return mappedTokens
  } catch (error) {
    console.error("[v0] Error fetching trending tokens:", error)
    return []
  }
}

export interface CTOToken {
  url: string
  chainId: string
  tokenAddress: string
  icon?: string
  header?: string
  description?: string
  links?: Array<{ type: string; label: string; url: string }>
  name?: string
  symbol?: string
  priceUsd?: string
  marketCap?: number
  liquidity?: number
  volume24h?: number
  priceChange5m?: number
  priceChange1h?: number
}

export function mapCTOTokenToTokenRow(ctoToken: CTOToken): TokenRow {
  const name = ctoToken.name || "Unknown Token"
  const symbol = ctoToken.symbol || ctoToken.tokenAddress.substring(0, 6).toUpperCase()

  const price = Number.parseFloat(ctoToken.priceUsd || "0")
  const mc = ctoToken.marketCap || 0
  const change5m = ctoToken.priceChange5m || 0
  const change1h = ctoToken.priceChange1h || 0

  const signals: SignalType[] = ["CTO"]

  return {
    address: ctoToken.tokenAddress || "unknown",
    name: name,
    symbol: symbol,
    logo: ctoToken.icon || "/placeholder.svg?height=32&width=32",
    price: price,
    change5m: change5m,
    change1h: change1h,
    mc: mc,
    liquidity: ctoToken.liquidity || 0,
    volume24h: ctoToken.volume24h || 0,
    updatedAt: new Date().toISOString(),
    signals: signals,
    boostCount: undefined,
    launchpad: undefined,
  }
}

export async function fetchCTOTokens(): Promise<TokenRow[]> {
  try {
    console.log("[v0] Fetching CTO tokens from API...")
    const response = await fetch("/api/cto-tokens")

    console.log("[v0] CTO API response status:", response.status)

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()
    console.log("[v0] CTO API response received")

    console.log("[v0] CTO API raw response:", JSON.stringify(data).substring(0, 500))

    // DexScreener returns array of pairs directly
    let ctoTokens: any[] = []

    if (Array.isArray(data)) {
      ctoTokens = data
    } else if (data.pairs && Array.isArray(data.pairs)) {
      ctoTokens = data.pairs
    } else if (data.data && Array.isArray(data.data)) {
      ctoTokens = data.data
    } else {
      console.error("[v0] Unexpected CTO API response format:", Object.keys(data))
      return []
    }

    console.log("[v0] CTO tokens count:", ctoTokens.length)

    if (ctoTokens.length > 0) {
      console.log("[v0] First CTO token structure:", JSON.stringify(ctoTokens[0]).substring(0, 300))
    }

    const mappedTokens = ctoTokens
      .slice(0, 20)
      .map((token) => {
        try {
          return mapCTOTokenToTokenRow(token)
        } catch (error) {
          console.log("[v0] Error mapping token:", error)
          return null
        }
      })
      .filter(Boolean) as TokenRow[]

    console.log("[v0] Returning CTO tokens:", mappedTokens.length)
    return mappedTokens
  } catch (error) {
    console.error("[v0] Error fetching CTO tokens:", error)
    return []
  }
}
