import { type NextRequest, NextResponse } from "next/server"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ address: string }> }) {
  try {
    const { address } = await params
    console.log("[v0] Fetching token detail for:", address)

    const apiUrl = `https://api.jup.ag/tokens/v2/search?query=${address}`

    const apiKey = process.env.JUPITER_API_KEY
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }
    if (apiKey) {
      headers["x-api-key"] = apiKey
    } else {
      console.warn("[v0] JUPITER_API_KEY is not set; calling without API key")
    }

    const response = await fetch(apiUrl, {
      method: "GET",
      headers,
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

      const apiData = await response.json()

      // Support both shapes: top-level array `[...]` and object with `data` (`{ data: [...] }`)
      let list: any[] = []
      if (Array.isArray(apiData)) list = apiData
      else if (Array.isArray(apiData?.data)) list = apiData.data
      else if (apiData?.data) list = [apiData.data]

      console.log("[v0] API returned tokens count:", list.length)
    const tokenData = list.find((t: any) => {
      const id = (t?.id ?? t?.address ?? t?.mint ?? "").toString().toLowerCase()
      return id === address.toLowerCase()
    }) ?? list[0] ?? null

    if (!tokenData) {
      console.log("[v0] Token not found in API data")
      return NextResponse.json({ success: false, error: "Token not found" }, { status: 404 })
    }

    // Safely parse updatedAt from multiple possible shapes (seconds, milliseconds, ISO string)
    const parseUpdatedAt = (val: any) => {
      if (val == null) return new Date().toISOString()
      if (typeof val === "number") {
        const ms = val > 1e12 ? val : val * 1000
        const d = new Date(ms)
        if (!Number.isNaN(d.getTime())) return d.toISOString()
        return new Date().toISOString()
      }
      if (typeof val === "string") {
        const num = Number(val)
        if (!Number.isNaN(num)) {
          const ms = num > 1e12 ? num : num * 1000
          const d = new Date(ms)
          if (!Number.isNaN(d.getTime())) return d.toISOString()
        }
        const d2 = new Date(val)
        if (!Number.isNaN(d2.getTime())) return d2.toISOString()
        return new Date().toISOString()
      }
      return new Date().toISOString()
    }

    // Map the token data
    const mappedToken = {
      address: tokenData.id || "",
      name: tokenData.name || "Unknown",
      symbol: tokenData.symbol || "???",
      logo: tokenData.icon || "/placeholder.svg",
      mc: tokenData.mcap || 0,
      price: tokenData.usdPrice || 0,
      change5m: tokenData.stats5m?.priceChange || 0,
      liquidity: tokenData.liquidity || 0,
      volume24h: 0,
      updatedAt: parseUpdatedAt(tokenData.updatedAt),
      signals: [],
      boostCount: undefined,
      launchpad: tokenData.launchpad || false,
      // Use bondingPercentage when available for progress; keep bondingCurve for compatibility
      bondingCurve: tokenData.bondingPercentage ?? tokenData.bonding ?? tokenData.bondingCurve ?? null,
    }

    console.log("[v0] Token detail found and mapped")
    return NextResponse.json({ success: true, data: mappedToken })
  } catch (error) {
    console.error("[v0] Error in token detail API:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
