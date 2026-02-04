import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const amountParam = searchParams.get("amount") ?? ""
    const rawAmount = amountParam ? decodeURIComponent(amountParam) : ""
    const amount = rawAmount.replace(/x$/i, "")

    const url = new URL("https://api.dexscreener.com/token-boosts/latest/v1")
    if (amount && amount !== "all") {
      url.searchParams.set("amount", amount)
    }

    const response = await fetch(url.toString(), {
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
    console.error("[api] Error fetching DexScreener token-boosts latest:", error)
    return NextResponse.json([])
  }
}
