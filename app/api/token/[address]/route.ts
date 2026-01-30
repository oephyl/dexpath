import { type NextRequest, NextResponse } from "next/server"
import { mapPumpFunTokenToTokenRow } from "@/lib/api"

export async function GET(request: NextRequest, { params }: { params: Promise<{ address: string }> }) {
  try {
    const resolvedParams = await params
    console.log("[v0] Fetching token detail for:", resolvedParams.address)

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

    // Find the specific token by address (could be mint address)
    const tokenData = apiData?.data?.find((token: any) => 
      token.address === resolvedParams.address || token.mint === resolvedParams.address
    )

    if (!tokenData) {
      console.log("[v0] Token not found in API data")
      return NextResponse.json({ success: false, error: "Token not found" }, { status: 404 })
    }

    console.log("[v0] Found token data:", {
      address: tokenData.address,
      mint: tokenData.mint,
      creator: tokenData.creator,
      name: tokenData.name,
      symbol: tokenData.symbol
    })

    // Use the same mapping function as the main API to ensure consistency
    const mappedToken = mapPumpFunTokenToTokenRow(tokenData)

    console.log("[v0] Token detail mapped:", {
      address: mappedToken.address,
      mint: mappedToken.mint,
      creator: mappedToken.creator,
      name: mappedToken.name
    })
    
    return NextResponse.json({ success: true, data: mappedToken })
  } catch (error) {
    console.error("[v0] Error in token detail API:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
