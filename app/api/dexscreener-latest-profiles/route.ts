import { NextResponse } from "next/server"

export async function GET() {
  try {
    const url = "https://api.dexscreener.com/token-profiles/latest/v1"
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch Dexscreener profiles" }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error("[v0] Dexscreener latest profiles proxy error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
