"use client"

import { Suspense } from "react"
import { TopNav } from "@/components/top-nav"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import {
  Zap,
  Target,
  Shield,
  Rocket,
  TrendingUp,
  Users,
  Globe,
  BarChart3,
  Bell,
  Search,
  Filter,
  Layers,
  Clock,
} from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={null}>
        <TopNav />
      </Suspense>

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Image src="/images/logo-only.png" alt="Dexpath" width={120} height={120} />
          </div>
          <p className="text-2xl font-bold mb-3 text-balance">Solana's Premier Paid Signals Terminal</p>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Real-time detection and tracking of marketing campaigns across the Solana ecosystem. Identify tokens with
            active promotion, track boost levels, and execute trades at lightning speed.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { icon: Rocket, value: "7", label: "Signals" },
            { icon: Target, value: "10+", label: "Launchpads" },
            { icon: Zap, value: "Live", label: "Updates" },
            { icon: Shield, value: "4", label: "Platforms" },
          ].map((stat, i) => (
            <Card key={i} className="bg-primary/5 border-primary/20">
              <CardContent className="pt-5 pb-4 text-center">
                <stat.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features - Bento Grid */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Platform Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-amber-500/5 border-amber-500/20">
              <CardContent className="p-6">
                <Zap className="h-8 w-8 text-amber-500 mb-3" />
                <h3 className="text-xl font-bold mb-3">DexBoost Detection</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  Track paid visibility boosts from 10x to 500x multipliers in real-time. Higher multipliers indicate
                  larger marketing budgets and more serious project backing. Lightning bolt icons show boost levels at a
                  glance.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["10x", "30x", "50x", "100x", "500x"].map((m) => (
                    <Badge key={m} className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                      {m}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-500/5 border-blue-500/20">
              <CardContent className="p-6">
                <Bell className="h-8 w-8 text-blue-500 mb-3" />
                <h3 className="text-xl font-bold mb-3">Multi-Signal Alerts</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  Detect DexAD homepage placements, DexBar premium banners, and CTO community takeovers instantly.
                  Tokens with multiple concurrent signals indicate coordinated, well-funded marketing campaigns.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["DexAD", "DexBar", "CTO Alert"].map((s) => (
                    <Badge key={s} variant="outline" className="bg-blue-500/10 border-blue-500/30">
                      {s}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-500/5 border-purple-500/20">
              <CardContent className="p-6">
                <Target className="h-8 w-8 text-purple-500 mb-3" />
                <h3 className="text-xl font-bold mb-3">All-Launchpad Coverage</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  Monitor new token launches across 10+ Solana launchpads with dedicated filters. Track Pump.fun in
                  real-time, plus Raydium, Orca, Bonk, Moonit, Belive, Meteora, Heaven, Bags, and other major platforms.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Pump.fun", "Raydium", "Orca", "Bonk", "Moonit", "Meteora"].map((lp) => (
                    <Badge key={lp} variant="outline" className="text-xs bg-purple-500/10 border-purple-500/30">
                      {lp}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-500/5 border-green-500/20">
              <CardContent className="p-6">
                <Rocket className="h-8 w-8 text-green-500 mb-3" />
                <h3 className="text-xl font-bold mb-3">Lightning-Fast Execution</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  One-click trading via integrated platform buttons. Execute instantly on Trojan, Axion, GMGN, and Bonk
                  without leaving Dexpath. Each button opens the token directly on your chosen platform.
                </p>
                <div className="flex gap-3">
                  {["Trojan", "Axion", "GMGN", "Bonk"].map((p) => (
                    <Badge key={p} className="bg-green-500/20 text-green-400 border-green-500/30">
                      {p}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-cyan-500/5 border-cyan-500/20">
              <CardContent className="p-6">
                <TrendingUp className="h-8 w-8 text-cyan-500 mb-3" />
                <h3 className="text-xl font-bold mb-3">Token Trending Feed</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Live feed of the top 4 trending tokens based on 5-minute price performance. Updates every 3 seconds to
                  capture the hottest movers. Click any trending token for full details and trading links.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-orange-500/5 border-orange-500/20">
              <CardContent className="p-6">
                <Search className="h-8 w-8 text-orange-500 mb-3" />
                <h3 className="text-xl font-bold mb-3">Advanced Search & Filters</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Instant search by token name, symbol, or contract address. Filter by launchpad, boost level
                  (10x-500x), and signal type. Find exactly what you're looking for in milliseconds.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* What We Do */}
        <Card className="mb-12 bg-gradient-to-br from-primary/10 to-cyan-500/10 border-primary/30">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold mb-6 text-center">What We Do</h2>
            <div className="space-y-5 text-base leading-relaxed">
              <p>
                <strong className="text-primary">Dexpath</strong> is a professional-grade trading intelligence platform
                built specifically for the Solana ecosystem. We provide real-time detection, tracking, and analysis of
                paid marketing signals across multiple decentralized exchanges and launchpads.
              </p>
              <p>
                In the fast-moving world of Solana tokens, information is everything. Projects that invest in marketing
                through DexBoost promotions, DexAD placements, and DexBar campaigns are signaling serious commitment.
                Our platform detects these signals in real-time and presents them in an intuitive terminal interface,
                giving traders a critical timing advantage.
              </p>
              <p>
                We aggregate data from <strong>10+ Solana launchpads</strong> including Pump.fun, Raydium, Orca, Bonk,
                Moonit, Belive, Meteora, Heaven, and Bags. Our system monitors thousands of tokens continuously,
                detecting new launches, tracking marketing activations, and updating price data every 1-3 seconds.
              </p>
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="p-5 rounded-lg bg-background/50 border border-primary/20 text-center">
                  <BarChart3 className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h4 className="font-bold mb-2">7 Signal Types</h4>
                  <p className="text-sm text-muted-foreground">DexBoost, DexAD, DexBar, CTO alerts, and more</p>
                </div>
                <div className="p-5 rounded-lg bg-background/50 border border-primary/20 text-center">
                  <Globe className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h4 className="font-bold mb-2">10+ Launchpads</h4>
                  <p className="text-sm text-muted-foreground">Coverage across the entire Solana DeFi ecosystem</p>
                </div>
                <div className="p-5 rounded-lg bg-background/50 border border-primary/20 text-center">
                  <Clock className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h4 className="font-bold mb-2">1-3 Second Updates</h4>
                  <p className="text-sm text-muted-foreground">Real-time data streaming with minimal latency</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Why Choose Dexpath */}
        <Card className="mb-12">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold mb-6 text-center">Why Choose Dexpath?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Shield className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold mb-1">First-Mover Intelligence</h4>
                    <p className="text-sm text-muted-foreground">
                      Detect signal activations in real-time, often before the wider market notices. Position yourself
                      ahead of the crowd with instant notifications via our terminal interface.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Layers className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold mb-1">Comprehensive Coverage</h4>
                    <p className="text-sm text-muted-foreground">
                      Unlike single-platform trackers, Dexpath monitors the entire Solana ecosystem. We aggregate data
                      from 10+ launchpads, giving you complete market visibility in one interface.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Filter className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold mb-1">Signal-Focused Design</h4>
                    <p className="text-sm text-muted-foreground">
                      Built specifically for tracking paid marketing activities. Every feature exists to help you
                      identify, analyze, and act on marketing signals that indicate serious project investment.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <Clock className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold mb-1">Minimal Latency</h4>
                    <p className="text-sm text-muted-foreground">
                      1-3 second update intervals across all data feeds. Our polling system ensures you're seeing the
                      latest information without manual refreshing or API rate limit issues.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Rocket className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold mb-1">Integrated Trading</h4>
                    <p className="text-sm text-muted-foreground">
                      Quick trade buttons eliminate the friction between signal detection and trade execution. See a
                      signal, verify the token, and buy in seconds - all without leaving Dexpath.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Users className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold mb-1">Active Community</h4>
                    <p className="text-sm text-muted-foreground">
                      Join thousands of traders in our Discord and Telegram communities. Share insights, discuss
                      signals, and learn from experienced Solana traders.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Who Is Dexpath For */}
        <Card className="mb-12">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold mb-6 text-center">Who Is Dexpath For?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-5 rounded-lg bg-secondary/30 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <h4 className="font-bold mb-2">Day Traders</h4>
                <p className="text-sm text-muted-foreground">
                  Looking for fast-moving opportunities with clear entry signals. Monitor signal activations and
                  trending momentum for quick profits.
                </p>
              </div>

              <div className="p-5 rounded-lg bg-secondary/30 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h4 className="font-bold mb-2">Signal Hunters</h4>
                <p className="text-sm text-muted-foreground">
                  Specialize in tracking marketing campaigns and paid promotions. Use Dexpath as your primary
                  intelligence source for signal-based trading strategies.
                </p>
              </div>

              <div className="p-5 rounded-lg bg-secondary/30 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Rocket className="h-8 w-8 text-primary" />
                </div>
                <h4 className="font-bold mb-2">Launch Snipers</h4>
                <p className="text-sm text-muted-foreground">
                  Focus on new token launches across Pump.fun and other launchpads. Get instant visibility into fresh
                  projects the moment they appear.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Our Mission */}
        <Card className="mb-12 bg-gradient-to-br from-primary/10 to-cyan-500/10 border-primary/30">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold mb-4 text-center">Our Mission</h2>
            <p className="text-lg text-center text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              To provide Solana traders with the most comprehensive, real-time signal intelligence platform available.
              We believe that access to marketing data should be democratized - not locked behind paywalls or scattered
              across multiple tools. Dexpath brings everything together in one professional-grade terminal, free for all
              traders.
            </p>
          </CardContent>
        </Card>

        {/* What's Coming Next */}
        <Card className="mb-12">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold mb-6 text-center">What's Coming Next</h2>
            <p className="text-base text-muted-foreground text-center mb-6 max-w-3xl mx-auto">
              Dexpath is constantly evolving. Here are some of the major features in development:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { name: "Quick Trade", desc: "One-click buying directly within Dexpath, no external platforms needed" },
                {
                  name: "Copytrade",
                  desc: "Automatically mirror successful wallet trades with customizable parameters",
                },
                { name: "Sniper Bot", desc: "Automated token sniping at launch with configurable buy limits" },
                { name: "Insider Tracking", desc: "Monitor whale wallets and insider movements across Solana" },
                { name: "Caller Integration", desc: "Connect with top crypto callers and their real-time signals" },
                { name: "Migrate Tool", desc: "Easy token migration between wallets with tax optimization" },
                { name: "Fast Predict", desc: "AI-powered price prediction and trend analysis for tokens" },
                {
                  name: "Portfolio Tracking",
                  desc: "Track holdings, performance, and profit/loss across all positions",
                },
              ].map((feature, i) => (
                <div key={i} className="p-4 rounded-lg bg-secondary/30 border border-border">
                  <div className="flex items-start gap-3">
                    <Badge className="bg-primary/20 text-primary border-primary/30 mt-0.5">Soon</Badge>
                    <div>
                      <h4 className="font-bold mb-1">{feature.name}</h4>
                      <p className="text-sm text-muted-foreground">{feature.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground text-center mt-6">
              Follow our{" "}
              <Link href="/roadmap" className="text-primary hover:underline">
                roadmap
              </Link>{" "}
              for detailed timelines and feature specifications.
            </p>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="bg-gradient-to-r from-primary/20 to-cyan-500/20 border-primary/40">
          <CardContent className="p-10 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Trading Smarter?</h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join thousands of Solana traders using Dexpath to track market-moving signals in real-time. Free access,
              no registration required.
            </p>
            <div className="flex flex-wrap gap-3 justify-center mb-6">
              <Link href="/">
                <button className="px-6 py-3 bg-primary hover:bg-primary/80 text-primary-foreground rounded-lg font-bold text-base transition-colors">
                  Open Terminal
                </button>
              </Link>
              <Link href="/docs">
                <button className="px-6 py-3 bg-secondary hover:bg-secondary/80 rounded-lg font-bold text-base transition-colors">
                  Read Documentation
                </button>
              </Link>
              <Link href="/featured">
                <button className="px-6 py-3 bg-background hover:bg-background/80 border-2 border-primary rounded-lg font-bold text-base transition-colors">
                  View Features
                </button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="https://discord.gg/dexpath" target="_blank">
                <Badge
                  variant="outline"
                  className="px-4 py-2 bg-[#5865F2]/20 text-[#5865F2] border-[#5865F2]/30 hover:bg-[#5865F2]/30 cursor-pointer"
                >
                  Discord
                </Badge>
              </Link>
              <Link href="https://t.me/dexpath" target="_blank">
                <Badge
                  variant="outline"
                  className="px-4 py-2 bg-[#0088cc]/20 text-[#0088cc] border-[#0088cc]/30 hover:bg-[#0088cc]/30 cursor-pointer"
                >
                  Telegram
                </Badge>
              </Link>
              <Link href="https://x.com/dexpath" target="_blank">
                <Badge
                  variant="outline"
                  className="px-4 py-2 bg-black/20 text-foreground border-border hover:bg-black/30 cursor-pointer"
                >
                  X (Twitter)
                </Badge>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
