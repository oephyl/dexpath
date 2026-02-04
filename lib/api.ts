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

  // 5m/1h and volume: use 0 until enriched from DexScreener (no fake random)
  const change5m = 0
  const change1h = 0

  let timestamp: number
  if (pumpToken.created_timestamp) {
    // If timestamp is in seconds (< year 3000), convert to milliseconds
    timestamp =
      pumpToken.created_timestamp < 10000000000 ? pumpToken.created_timestamp * 1000 : pumpToken.created_timestamp
  } else {
    timestamp = Date.now() // Fallback to current time
  }

  // New pairs from pump.fun have no DexPaid/Boost/CTO signals yet – only real data from DexScreener should show signals
  const signals: SignalType[] = []

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
    volume24h: 0,
    updatedAt: new Date(timestamp).toISOString(), // Use properly handled timestamp
    signals,
    boostCount: undefined,
    launchpad: "pumpfun",
    mint: pumpToken.mint, // Add mint field
    creator: pumpToken.creator, // Add creator field
  }
}

export async function fetchPumpFunTokens(): Promise<TokenRow[]> {
  try {
    console.log("[v0] Fetching tokens from pump.fun API...")
    const response = await fetch("/api/pump-tokens")

    console.log("[v0] API response status:", response.status)

    if (!response.ok) {
      console.warn("[v0] Trending API request failed:", response.status)
      return []
    }

    const data = await response.json()
    console.log("[v0] API response data:", JSON.stringify(data, null, 2))

    // Handle different response formats
    let pumpTokens: PumpFunToken[] = []

    if (Array.isArray(data)) {
      pumpTokens = data
      console.log("[v0] Using data as array, length:", pumpTokens.length)
    } else if (data.data && Array.isArray(data.data)) {
      pumpTokens = data.data
      console.log("[v0] Using data.data as array, length:", pumpTokens.length)
    } else if (data.tokens && Array.isArray(data.tokens)) {
      pumpTokens = data.tokens
      console.log("[v0] Using data.tokens as array, length:", pumpTokens.length)
    } else {
      console.error("[v0] Unexpected API response format:", data)
      console.log("[v0] Data keys:", Object.keys(data))
      return []
    }

    console.log("[v0] Processing tokens count:", pumpTokens.length)

    // Remove duplicates - STRICTLY by mint address only
    const seenMints = new Set()
    const uniquePumpTokens = pumpTokens.filter(token => {
      if (seenMints.has(token.mint)) {
        return false  // Skip if mint already seen
      }
      seenMints.add(token.mint)
      return true
    })
    
    console.log("[v0] After removing mint duplicates:", uniquePumpTokens.length)

    const mappedTokens = uniquePumpTokens.slice(0, 20).map(mapPumpFunTokenToTokenRow)

    console.log("[v0] Final unique tokens:", mappedTokens.length)
    return mappedTokens
  } catch (error) {
    console.error("[v0] Error fetching pump.fun tokens:", error)
    return []
  }
}

export async function fetchTrendingTokens(timeframe: "5m" | "1h" | "24h" = "5m"): Promise<TokenRow[]> {
  try {
    console.log("[v0] Fetching trending tokens from Jupiter API...", timeframe)
    const response = await fetch(`/api/trending-tokens?timeframe=${encodeURIComponent(timeframe)}`)

    console.log("[v0] Trending API response status:", response.status)

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()
    // Jupiter route returns raw array or object with data array
    const rawTokens: any[] = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []
    if (!Array.isArray(rawTokens)) {
      console.error("[v0] Unexpected trending API response format:", Object.keys(data || {}))
      return []
    }

    console.log("[v0] Trending tokens count:", rawTokens.length)

    // Use Jupiter response directly (route already applies limit)
    const top = rawTokens
    const results: TokenRow[] = []
    for (const item of top) {
      const address = item?.id
      if (!address) continue 
      results.push({
        address,
        name: item.name,
        symbol: item.symbol,
        logo: item.icon,
        price: Number.parseFloat(item?.usdPrice || "0"),
        change5m: item?.stats5m?.priceChange ?? 0,
        change1h: item?.stats1h?.priceChange ?? 0,
        mc: item.mcap ?? 0,
        liquidity: item?.liquidity ?? 0,
        volume24h: item?.stats24h?.volume ?? 0,
        updatedAt: new Date().toISOString(),
        signals: [],
        boostCount: undefined,
        launchpad: item.launchpad || "-",
        mint: address,
        creator: item.dev,
      })
    }

    console.log("[v0] Returning trending tokens:", results.length)
    return results
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
  claimDate?: string | number
}

const parseClaimDateToIso = (value?: string | number) => {
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

export function mapCTOTokenToTokenRow(ctoToken: CTOToken): TokenRow {
  const name = ctoToken.name || "Unknown Token"
  const symbol = ctoToken.symbol || ctoToken.tokenAddress.substring(0, 6).toUpperCase()

  const price = Number.parseFloat(ctoToken.priceUsd || "0")
  const mc = ctoToken.marketCap || 0
  const change5m = ctoToken.priceChange5m || 0
  const change1h = ctoToken.priceChange1h || 0
  const claimDateIso = parseClaimDateToIso(ctoToken.claimDate)

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
    updatedAt: claimDateIso ?? new Date().toISOString(),
    signals: signals,
    boostCount: undefined,
    launchpad: undefined,
    mint: ctoToken.tokenAddress || "unknown", // Add mint field
    creator: undefined, // CTO tokens don't have creator info
  }
}

export interface DexScreenerAd {
  chainId?: string
  tokenAddress?: string
  date?: string
  type?: string
  durationHours?: number
  impressions?: number
}

export interface DexScreenerBoost {
  chainId?: string
  tokenAddress?: string
  amount?: number
  totalAmount?: number
  icon?: string
  header?: string
  description?: string
  name?: string
  symbol?: string
}

async function enrichTokenFromDexScreener(
  tokenAddress: string,
  chainId: string = "solana",
): Promise<{ priceUsd?: string; marketCap?: number; liquidity?: number; volume24h?: number; priceChange5m?: number; priceChange1h?: number; name?: string; symbol?: string; imageUrl?: string } | null> {
  try {
    const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    })
    if (!res.ok) return null
    const data = await res.json()
    const pairs = data.pairs ?? (Array.isArray(data) ? data : [])
    const pair = pairs[0]
    if (!pair) return null
    return {
      priceUsd: pair.priceUsd,
      marketCap: pair.fdv ?? pair.marketCap,
      liquidity: pair.liquidity?.usd,
      volume24h: pair.volume?.h24,
      priceChange5m: pair.priceChange?.m5,
      priceChange1h: pair.priceChange?.h1,
      name: pair.baseToken?.name,
      symbol: pair.baseToken?.symbol,
      imageUrl: pair.info?.imageUrl,
    }
  } catch {
    return null
  }
}

export function mapDexPaidAdToTokenRow(ad: DexScreenerAd, enriched: Awaited<ReturnType<typeof enrichTokenFromDexScreener>>): TokenRow {
  const address = ad.tokenAddress || "unknown"
  const chainId = ad.chainId || "solana"
  const signals: SignalType[] = ["DEXAD_PAID"]
  return {
    address,
    name: enriched?.name || "Unknown",
    symbol: enriched?.symbol || address.slice(0, 6).toUpperCase(),
    logo: enriched?.imageUrl || "/placeholder.svg?height=32&width=32",
    price: Number.parseFloat(enriched?.priceUsd || "0"),
    change5m: enriched?.priceChange5m ?? 0,
    change1h: enriched?.priceChange1h ?? 0,
    mc: enriched?.marketCap ?? 0,
    liquidity: enriched?.liquidity ?? 0,
    volume24h: enriched?.volume24h ?? 0,
    updatedAt: new Date().toISOString(),
    signals,
    boostCount: undefined,
    launchpad: undefined,
    mint: address, // Add mint field
    creator: undefined, // DexPaid ads don't have creator info
  }
}

export function mapBoostToTokenRow(boost: DexScreenerBoost, enriched: Awaited<ReturnType<typeof enrichTokenFromDexScreener>>): TokenRow {
  const address = boost.tokenAddress || "unknown"
  const amount = boost.amount ?? boost.totalAmount ?? 0
  const signals: SignalType[] = ["DEXBOOST_PAID"]
  return {
    address,
    name: enriched?.name ?? boost.name ?? "Unknown",
    symbol: enriched?.symbol ?? boost.symbol ?? address.slice(0, 6).toUpperCase(),
    logo: enriched?.imageUrl ?? boost.icon ?? "/placeholder.svg?height=32&width=32",
    price: Number.parseFloat(enriched?.priceUsd || "0"),
    change5m: enriched?.priceChange5m ?? 0,
    change1h: enriched?.priceChange1h ?? 0,
    mc: enriched?.marketCap ?? 0,
    liquidity: enriched?.liquidity ?? 0,
    volume24h: enriched?.volume24h ?? 0,
    updatedAt: new Date().toISOString(),
    signals,
    boostCount: typeof amount === "number" && amount > 0 ? amount : undefined,
    launchpad: undefined,
    mint: address, // Add mint field
    creator: undefined, // Boost tokens don't have creator info
  }
}

export async function fetchDexPaidTokens(): Promise<TokenRow[]> {
  try {
    const response = await fetch("/api/ads");
    if (!response.ok) return [];
    const data = await response.json();
    const ads: DexScreenerAd[] = Array.isArray(data) ? data : data?.ads ?? data?.data ?? [];
    const mappedTokens: TokenRow[] = [];
    for (const ad of ads.slice(0, 20)) {
      const address = ad.tokenAddress || "unknown";
      const enriched = await enrichTokenFromDexScreener(address, ad.chainId || "solana");
      mappedTokens.push(mapDexPaidAdToTokenRow(ad, enriched));
    }
    return mappedTokens;
  } catch (error) {
    console.error("[v0] Error fetching DexPaid tokens:", error);
    return [];
  }
}

export async function fetchBoostTokens(): Promise<TokenRow[]> {
  try {
    const response = await fetch("/api/token-boosts")
    if (!response.ok) return []
    const data = await response.json()
    const boosts: DexScreenerBoost[] = Array.isArray(data) ? data : data?.tokenAddress ? [data] : []
    const chainId = "solana"
    const results: TokenRow[] = []
    for (const boost of boosts.slice(0, 20)) {
      const addr = boost.tokenAddress
      if (!addr) continue
      const enriched = await enrichTokenFromDexScreener(addr, chainId)
      results.push(mapBoostToTokenRow(boost, enriched))
    }
    return results
  } catch (error) {
    console.error("[v0] Error fetching Boost tokens:", error)
    return []
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
