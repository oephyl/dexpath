import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("[v0] Fetching CTO tokens from DexScreener...")
    const response = await fetch("https://api.dexscreener.com/community-takeovers/latest/v1", {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      const contentType = response.headers.get("content-type")

      if (response.status === 429) {
        console.error("[v0] DexScreener CTO API rate limited (429)")
        return NextResponse.json([]) // Return empty array for rate limit
      }

      console.error("[v0] DexScreener CTO API error:", response.status)
      return NextResponse.json([]) // Return empty array for errors
    }

    const ctoData = await response.json()
    console.log("[v0] CTO API returned", ctoData.length, "tokens")

    const tokensWithData = await Promise.all(
      ctoData.slice(0, 20).map(async (ctoToken: any) => {
        try {
          // Fetch token details from DexScreener
          const tokenResponse = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${ctoToken.tokenAddress}`, {
            headers: { Accept: "application/json" },
            cache: "no-store",
          })

          if (tokenResponse.ok) {
            const tokenData = await tokenResponse.json()
            // Get the first pair (usually the most liquid)
            const pair = tokenData.pairs?.[0]

            if (pair) {
              return {
                ...ctoToken,
                name: pair.baseToken?.name,
                symbol: pair.baseToken?.symbol,
                priceUsd: pair.priceUsd,
                marketCap: pair.fdv || pair.marketCap,
                liquidity: pair.liquidity?.usd,
                volume24h: pair.volume?.h24,
                priceChange5m: pair.priceChange?.m5,
                priceChange1h: pair.priceChange?.h1,
              }
            }
          }
        } catch (error) {
          console.log("[v0] Error fetching token details:", error)
        }

        // Return original CTO data if fetch fails
        return ctoToken
      }),
    )

    console.log("[v0] Enriched CTO tokens with pair data")
    return NextResponse.json(tokensWithData)
  } catch (error) {
    console.error("[v0] Error fetching CTO tokens:", error)
    return NextResponse.json([])
  }
}
