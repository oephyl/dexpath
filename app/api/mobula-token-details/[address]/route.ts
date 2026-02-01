import { NextResponse } from "next/server"

export async function GET(_req: Request, { params }: { params: Promise<{ address: string }> }) {
  const { address } = await params

  const upstreamParams = new URLSearchParams({
    blockchain: "solana",
    instanceTracking: "true",
    address,
  })

  const upstreamUrl = `https://api.mobula.io/api/2/token/details?${upstreamParams.toString()}`
  const apiKey = process.env.MOBULA_API_KEY

  try {
    const res = await fetch(upstreamUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(apiKey
          ? {
              Authorization: `Bearer ${apiKey}`,
              "X-API-KEY": apiKey,
            }
          : {}),
      },
      cache: "no-store",
    })

    const text = await res.text()

    return new NextResponse(text, {
      status: res.status,
      headers: {
        "content-type": res.headers.get("content-type") ?? "application/json",
        "cache-control": "no-store",
        "x-dexpath-upstream-url": upstreamUrl,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Upstream fetch failed",
        message: typeof error?.message === "string" ? error.message : undefined,
      },
      { status: 502 },
    )
  }
}
