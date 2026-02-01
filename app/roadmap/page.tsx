"use client"

import { Suspense } from "react"
import { TopNav } from "@/components/top-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Circle, Clock, Target, TrendingUp, Zap } from "lucide-react"
import Image from "next/image"

export default function RoadmapPage() {
  const roadmapItems = [
    {
      quarter: "Q1 2026",
      status: "completed",
      theme: "Foundation & Launch",
      description: "Core platform development and initial feature set",
      items: [
        {
          title: "Platform Architecture & Design",
          desc: "Built scalable terminal interface with real-time data streaming capabilities and responsive design for all devices",
          done: true,
        },
        {
          title: "Pump.fun API Integration",
          desc: "Real-time new token detection from Pump.fun with 1-second polling intervals and automatic data refresh",
          done: true,
        },
        {
          title: "Signal Detection System",
          desc: "Implemented DexBoost (10x-500x), DexAD, DexBar, and CTO signal tracking with visual indicators and tooltips",
          done: true,
        },
        {
          title: "Token Trending Feed",
          desc: "Built real-time trending tokens feed based on 5-minute price performance, updating every 3 seconds",
          done: true,
        },
        {
          title: "Multi-Launchpad Support",
          desc: "Added support for 10+ Solana launchpads including Pump.fun, Raydium, Orca, Bonk, Moonit, Belive, Meteora, Heaven, and Bags",
          done: true,
        },
        {
          title: "Quick Trade Integration",
          desc: "One-click trading buttons for Trojan, Axion, GMGN, and Bonk platforms integrated directly into token table",
          done: true,
        },
        {
          title: "Search & Filter System",
          desc: "Instant search by name/symbol/address with advanced filters by launchpad, boost level, and signal type",
          done: true,
        },
      ],
    },
    {
      quarter: "Q2 2026",
      status: "in-progress",
      theme: "Enhancement & Optimization",
      description: "Advanced features and user experience improvements",
      items: [
        {
          title: "$DEXPATH Token Launch",
          desc: "Official token launch with utility features including premium access, governance voting, and platform revenue sharing",
          done: true,
        },
        {
          title: "Advanced Filtering System",
          desc: "Market cap ranges, volume thresholds, liquidity minimums, and custom signal combinations for power users",
          done: false,
        },
        {
          title: "Portfolio Tracking Dashboard",
          desc: "Track your token holdings with real-time P&L, entry/exit tracking, and performance analytics across all positions",
          done: false,
        },
        {
          title: "Custom Price Alerts",
          desc: "Set alerts for price movements, volume spikes, signal activations, and custom conditions with multi-channel notifications",
          done: false,
        },
        {
          title: "Enhanced Analytics",
          desc: "Detailed token analytics including holder distribution, transaction history, smart money flows, and whale wallet tracking",
          done: false,
        },
        {
          title: "Mobile Responsive Optimization",
          desc: "Fully optimized mobile experience with touch-friendly controls and condensed layouts for on-the-go trading",
          done: false,
        },
      ],
    },
    {
      quarter: "Q3 2026",
      status: "planned",
      theme: "Advanced Trading Tools",
      description: "Professional trading features for serious traders",
      items: [
        {
          title: "Copytrade Feature",
          desc: "Automatically mirror trades from successful wallets with customizable position sizing, stop-losses, and profit targets",
          done: false,
        },
        {
          title: "Sniper Bot Integration",
          desc: "Automated token sniping at launch with MEV protection, configurable buy limits, anti-rug safety checks, and slippage control",
          done: false,
        },
        {
          title: "Insider Tracking Dashboard",
          desc: "Monitor whale wallets and insider movements across all Solana tokens with real-time transaction alerts and holdings analysis",
          done: false,
        },
        {
          title: "Quick Trade (Built-in)",
          desc: "Execute trades directly within Dexpath without external platforms using integrated Jupiter swap with best price routing",
          done: false,
        },
        {
          title: "Signal History & Backtesting",
          desc: "Historical signal data with backtesting tools to analyze which signal types and combinations perform best over time",
          done: false,
        },
        {
          title: "Watchlist & Favorites",
          desc: "Save tokens to custom watchlists with grouped organization, notes, and automatic alert creation for tracked tokens",
          done: false,
        },
      ],
    },
    {
      quarter: "Q4 2026",
      status: "planned",
      theme: "AI & Community Features",
      description: "Next-generation intelligence and social trading",
      items: [
        {
          title: "Caller Integration Network",
          desc: "Connect with top crypto callers and receive their trading signals in real-time with reputation scoring and call tracking",
          done: false,
        },
        {
          title: "Migrate Tool",
          desc: "Easy token migration between wallets with automatic tax calculation, gas optimization, and batch transfer support",
          done: false,
        },
        {
          title: "Fast Predict AI Engine",
          desc: "AI-powered price prediction using machine learning models trained on signal data, volume patterns, and historical performance",
          done: false,
        },
        {
          title: "Mobile Apps (iOS & Android)",
          desc: "Native mobile applications with push notifications for signals, price alerts, and trending tokens with full terminal functionality",
          done: false,
        },
        {
          title: "Social Trading Features",
          desc: "Share trades, strategies, and performance on public leaderboards with social feeds and community reputation system",
          done: false,
        },
        {
          title: "Advanced Charting",
          desc: "TradingView-style charts with signal overlays, volume analysis, and technical indicators integrated into token detail pages",
          done: false,
        },
      ],
    },
    {
      quarter: "Q1 2027",
      status: "future",
      theme: "Expansion & Ecosystem",
      description: "Platform expansion and ecosystem growth",
      items: [
        {
          title: "Multi-Chain Expansion",
          desc: "Support for Ethereum, BSC, Base, and Arbitrum networks with cross-chain signal aggregation and unified terminal interface",
          done: false,
        },
        {
          title: "API & Developer Platform",
          desc: "Public API for integrating Dexpath data into external tools, bots, and trading applications with webhook support",
          done: false,
        },
        {
          title: "Premium Tier Features",
          desc: "Advanced features for $DEXPATH token holders including priority data, unlimited alerts, API access, and premium analytics",
          done: false,
        },
        {
          title: "Institutional Dashboard",
          desc: "Professional tools for funds and trading desks including multi-account management, team collaboration, and advanced reporting",
          done: false,
        },
        {
          title: "NFT Signal Tracking",
          desc: "Expand signal detection to Solana NFT collections with trait rarity tracking, floor price alerts, and volume monitoring",
          done: false,
        },
        {
          title: "DeFi Protocol Integration",
          desc: "Track DeFi protocol TVL changes, yield opportunities, and liquidity pool signals with auto-farming strategies",
          done: false,
        },
      ],
    },
  ]

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: {
        label: "Completed",
        color: "bg-green-500/20 text-green-400 border-green-500/30",
        icon: CheckCircle2,
      },
      "in-progress": { label: "In Progress", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: Clock },
      planned: { label: "Planned", color: "bg-purple-500/20 text-purple-400 border-purple-500/30", icon: Target },
      future: { label: "Future", color: "bg-gray-500/20 text-gray-400 border-gray-500/30", icon: TrendingUp },
    }
    const variant = variants[status as keyof typeof variants]
    const Icon = variant.icon
    return (
      <Badge className={`${variant.color} flex items-center gap-1.5 px-3 py-1`}>
        <Icon className="h-3.5 w-3.5" />
        {variant.label}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={null}>
        <TopNav />
      </Suspense>

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="mb-16 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Image src="/images/logo-only.png" alt="Dexpath" width={64} height={64} />
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent">
              Roadmap
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Our vision for building the most powerful Solana trading terminal with advanced features, AI intelligence,
            and multi-chain support. Track our progress from foundation to ecosystem expansion.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-12">
          {[
            { label: "Completed", count: roadmapItems[0].items.length, icon: CheckCircle2, color: "text-green-500" },
            {
              label: "In Progress",
              count: roadmapItems[1].items.filter((i) => !i.done).length,
              icon: Clock,
              color: "text-blue-500",
            },
            {
              label: "Planned",
              count: roadmapItems[2].items.length + roadmapItems[3].items.length,
              icon: Target,
              color: "text-purple-500",
            },
            { label: "Future", count: roadmapItems[4].items.length, icon: TrendingUp, color: "text-gray-400" },
          ].map((stat, i) => (
            <Card key={i} className="bg-secondary/30 border-primary/20">
              <CardContent className="pt-5 pb-4 text-center">
                <stat.icon className={`h-7 w-7 ${stat.color} mx-auto mb-2`} />
                <div className="text-3xl font-bold mb-1">{stat.count}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="relative space-y-12">
          {/* Vertical line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border hidden md:block" />

          {roadmapItems.map((quarter, idx) => (
            <div key={idx} className="relative">
              {/* Quarter marker */}
              <div className="flex items-start gap-4 mb-6">
                <div className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full bg-background border-2 border-primary flex-shrink-0">
                  <span className="text-sm font-bold text-primary">{quarter.quarter.split(" ")[0]}</span>
                </div>
                <div className="flex-1 pt-2">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-3xl font-bold">{quarter.quarter}</h2>
                    {getStatusBadge(quarter.status)}
                  </div>
                  <h3 className="text-xl font-semibold text-primary mb-1">{quarter.theme}</h3>
                  <p className="text-sm text-muted-foreground">{quarter.description}</p>
                </div>
              </div>

              {/* Items */}
              <div className="md:ml-24 grid gap-4">
                {quarter.items.map((item, itemIdx) => (
                  <Card key={itemIdx} className={item.done ? "border-primary/50 bg-primary/5" : "bg-secondary/30"}>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-start gap-3 text-lg">
                        {item.done ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        ) : quarter.status === "in-progress" ? (
                          <Clock className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                        )}
                        <span className={item.done ? "text-green-500" : ""}>{item.title}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 pl-11">
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        <Card className="mt-16 bg-gradient-to-br from-primary/10 to-cyan-500/10 border-primary/30">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-3">Building the Future of Trading Intelligence</h3>
              <p className="text-base text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-6">
                This roadmap represents our commitment to creating the most comprehensive trading platform for the
                Solana ecosystem and beyond. Development priorities may shift based on community feedback, market
                conditions, and technological opportunities. We're building for the long term.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Badge variant="outline" className="px-4 py-2 bg-primary/10 border-primary/30">
                  Community-Driven Development
                </Badge>
                <Badge variant="outline" className="px-4 py-2 bg-primary/10 border-primary/30">
                  Regular Updates
                </Badge>
                <Badge variant="outline" className="px-4 py-2 bg-primary/10 border-primary/30">
                  Transparent Progress
                </Badge>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Have suggestions for features? Join our community and share your ideas:
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <a href="https://discord.gg/dexpath" target="_blank" rel="noopener noreferrer">
                  <button className="px-5 py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-lg font-semibold text-sm transition-colors">
                    Discord
                  </button>
                </a>
                <a href="https://t.me/dexpath" target="_blank" rel="noopener noreferrer">
                  <button className="px-5 py-2 bg-[#0088cc] hover:bg-[#006699] text-white rounded-lg font-semibold text-sm transition-colors">
                    Telegram
                  </button>
                </a>
                <a href="https://x.com/dexpath" target="_blank" rel="noopener noreferrer">
                  <button className="px-5 py-2 bg-black hover:bg-black/80 text-white rounded-lg font-semibold text-sm transition-colors">
                    X (Twitter)
                  </button>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
