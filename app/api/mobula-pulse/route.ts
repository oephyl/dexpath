import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const assetMode = searchParams.get("assetMode") ?? "true"
  const chainId = searchParams.get("chainId") ?? "solana:solana"
  const poolTypesRaw = searchParams.get("poolTypes") ?? ""

  const poolTypes = (() => {
    if (!poolTypesRaw || poolTypesRaw === "all") return ""
    if (poolTypesRaw === "meteora") return "meteora-dyn2"
    if (poolTypesRaw === "raydium") return "raydium-launchlab"
    return poolTypesRaw
  })()

  const upstreamParams = new URLSearchParams({
    assetMode,
    chainId,
  })

  if (poolTypes) {
    upstreamParams.set("poolTypes", poolTypes)
  }

  const upstreamUrl = `https://api.mobula.io/api/2/pulse?${upstreamParams.toString()}`
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
        "x-dexpath-pooltypes-raw": poolTypesRaw || "",
        "x-dexpath-pooltypes-normalized": poolTypes || "",
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
