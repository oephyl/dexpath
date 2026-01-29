import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { address: string } }) {
  try {
    console.log("[v0] Fetching token detail for:", params.address)

    // Fetch from the external API without limit
    const response = await fetch("https://pump-api-pi.vercel.app/api/v1/new-token", {
      cache: "no-store",
    })

    if (!response.ok) {
      console.log("[v0] Token API response failed:", response.status)
      return NextResponse.json({ success: false, error: "Failed to fetch token data" }, { status: 500 })
    }

    const apiData = await response.json()
    console.log("[v0] API returned tokens count:", apiData?.data?.length || 0)

    // Find the specific token by address
    const tokenData = apiData?.data?.find((token: any) => token.address === params.address)

    if (!tokenData) {
      console.log("[v0] Token not found in API data")
      return NextResponse.json({ success: false, error: "Token not found" }, { status: 404 })
    }

    // Map the token data
    const mappedToken = {
      address: tokenData.address || "",
      name: tokenData.name || "Unknown",
      symbol: tokenData.symbol || "???",
      logo: tokenData.image || "/placeholder.svg",
      mc: tokenData.marketcap || 0,
      price: tokenData.price || 0,
      change5m: tokenData.change5m || 0,
      liquidity: tokenData.liquidity || 0,
      volume24h: tokenData.volume24h || 0,
      updatedAt: tokenData.timestamp ? new Date(tokenData.timestamp * 1000).toISOString() : new Date().toISOString(),
      signals: [],
      boostCount: undefined,
      launchpad: "pumpfun",
    }

    console.log("[v0] Token detail found and mapped")
    return NextResponse.json({ success: true, data: mappedToken })
  } catch (error) {
    console.error("[v0] Error in token detail API:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
