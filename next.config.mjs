/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    const csp = [
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.tradingview.com https://eu-assets.i.posthog.com",
      "script-src-elem 'self' 'unsafe-inline' 'unsafe-eval' https://*.tradingview.com https://eu-assets.i.posthog.com",
    ].join("; ")

    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: csp,
          },
        ],
      },
    ]
  },
}

export default nextConfig
