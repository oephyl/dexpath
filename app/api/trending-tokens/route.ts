export async function GET() {
  try {
    const response = await fetch("https://pump-api-pi.vercel.app/api/v1/trending", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
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
