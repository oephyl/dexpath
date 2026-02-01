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
    console.log("[v0] API returned tokens count:", apiData?.data?.length || 0)

    // Find the specific token by address
    const tokenData = apiData?.data
    console.log(tokenData.id)
    if (!tokenData) {
      console.log("[v0] Token not found in API data")
      return NextResponse.json({ success: false, error: "Token not found" }, { status: 404 })
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
      updatedAt: tokenData.updatedAt ? new Date(tokenData.updatedAt * 1000).toISOString() : new Date().toISOString(),
      signals: [],
      boostCount: undefined,
      launchpad: tokenData.launchpad || false,
      bondingCurve: tokenData.bondingCurve || null,
    }

    console.log("[v0] Token detail found and mapped")
    return NextResponse.json({ success: true, data: mappedToken })
  } catch (error) {
    console.error("[v0] Error in token detail API:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
