import { NextResponse } from "next/server"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params
    const url = `https://api.rugcheck.xyz/v1/tokens/${address}/report`
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch rugcheck" }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error("[v0] Rugcheck proxy error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
