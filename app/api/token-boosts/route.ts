import { NextResponse } from "next/server"

export async function GET() {
  try {
    const response = await fetch("https://api.dexscreener.com/token-boosts/top/v1", {
      headers: { Accept: "application/json" },
      cache: "no-store",
    })

    if (!response.ok) {
      if (response.status === 429) return NextResponse.json([])
      return NextResponse.json([])
    }

    const data = await response.json()
    const list = Array.isArray(data) ? data : data?.tokens ?? data?.boosts ?? (data?.tokenAddress ? [data] : [])
    return NextResponse.json(list)
  } catch (error) {
    console.error("[api] Error fetching DexScreener token-boosts:", error)
    return NextResponse.json([])
  }
}
