export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get("timeframe") || "5m"

    const apiUrl = `https://api.jup.ag/tokens/v2/toptrending/${timeframe}?limit=5`

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

    const data = await response.json()

    return Response.json(data)
  } catch (error) {
    console.error("Error fetching trending tokens:", error)
    return Response.json({ error: "Failed to fetch trending tokens" }, { status: 500 })
  }
}
