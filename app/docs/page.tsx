"use client"

import { Suspense } from "react"
import { TopNav } from "@/components/top-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import {
  BookOpen,
  Layers,
  Zap,
  MousePointerClick,
  TrendingUp,
  Clock,
  Lightbulb,
  Target,
  AlertTriangle,
  BarChart3,
  Shield,
  Eye,
  Speaker,
  UsersIcon,
} from "lucide-react"

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={null}>
        <TopNav />
      </Suspense>

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent">
              Documentation
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Complete guide to mastering the Dexpath terminal for Solana token tracking and trading. Learn how to detect
            paid signals, track new launches, and execute trades with lightning speed.
          </p>
        </div>

        {/* What is Dexpath section */}
        <Card className="mb-10 bg-gradient-to-br from-primary/10 to-cyan-500/10 border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <BookOpen className="h-7 w-7 text-primary" />
              What is Dexpath?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-base leading-relaxed">
              <strong className="text-primary">Dexpath</strong> is a professional-grade trading terminal designed
              specifically for the Solana ecosystem. Our platform provides real-time detection and tracking of paid
              marketing signals across multiple launchpads and DEX platforms, giving traders a critical edge in
              identifying tokens with active promotion campaigns.
            </p>
            <p className="text-base leading-relaxed">
              Unlike traditional token trackers, Dexpath focuses on <strong>paid signals</strong> - marketing activities
              that indicate serious project investment. We track DexBoost promotions (from 10x to 500x multipliers),
              DexAd placements, DexBar banners, and community takeover alerts across{" "}
              <strong>10+ Solana launchpads</strong> including Pump.fun, Raydium, Orca, Bonk, Moonit, Belive, Meteora,
              Heaven, and Bags.
            </p>
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <div className="p-4 rounded-lg bg-background/50 border border-primary/20">
                <Target className="h-6 w-6 text-primary mb-2" />
                <h4 className="font-bold mb-1">Signal Detection</h4>
                <p className="text-sm text-muted-foreground">
                  Instantly identify tokens with active marketing campaigns across multiple platforms
                </p>
              </div>
              <div className="p-4 rounded-lg bg-background/50 border border-primary/20">
                <Zap className="h-6 w-6 text-primary mb-2" />
                <h4 className="font-bold mb-1">Real-Time Updates</h4>
                <p className="text-sm text-muted-foreground">
                  Live data feeds updating every 1-3 seconds for the fastest market intelligence
                </p>
              </div>
              <div className="p-4 rounded-lg bg-background/50 border border-primary/20">
                <MousePointerClick className="h-6 w-6 text-primary mb-2" />
                <h4 className="font-bold mb-1">Quick Trading</h4>
                <p className="text-sm text-muted-foreground">
                  One-click access to Trojan, Axion, GMGN, and Bonk for instant trade execution
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Getting Started */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Getting Started
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-bold mb-2">1. Understanding the Dashboard</h3>
              <p className="text-sm text-muted-foreground mb-2">
                The Dexpath dashboard consists of three main sections:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-4">
                <li>
                  <strong>Token Screener (Left)</strong> - Main table showing all tokens with filters and tabs
                </li>
                <li>
                  <strong>Token Trending (Right Top)</strong> - Top 4 trending tokens updated in real-time
                </li>
                <li>
                  <strong>$DEXPATH Info (Right Bottom)</strong> - Live token data and social links
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-2">2. Search for Tokens</h3>
              <p className="text-sm text-muted-foreground">
                Use the search bar at the top of the token screener to quickly find specific tokens by name, symbol, or
                contract address. Search results update instantly as you type.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tab Navigation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Tab Navigation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Tab 1
                </Badge>{" "}
                New Coins
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                View newly launched tokens across multiple Solana launchpads. This tab includes secondary filters to
                sort by specific platforms:
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {["All", "Pump.fun", "Bags", "Heaven", "Bonk", "Moonit", "Belive", "Raydium", "Orca", "Meteora"].map(
                  (lp) => (
                    <Badge key={lp} variant="secondary" className="text-xs">
                      {lp}
                    </Badge>
                  ),
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                <strong>Pump.fun</strong> tokens are fetched in real-time from the API and display automatically as they
                launch.
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Tab 2
                </Badge>{" "}
                Signals
              </h3>
              <p className="text-sm text-muted-foreground">
                Shows all tokens with active marketing signals (DexBoost, DexAd, DexBar, Price alerts). Use this to
                identify tokens with paid promotion.
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Tab 3
                </Badge>{" "}
                CTO
              </h3>
              <p className="text-sm text-muted-foreground">
                Community Takeover tokens where the original developers have left and the community has taken control of
                the project.
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Tab 4-6
                </Badge>{" "}
                New Dexpaid, New Boost, New Ads
              </h3>
              <p className="text-sm text-muted-foreground">
                Filter tokens by specific marketing signal types to track the latest paid promotions on Dexscreener.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Understanding Signals */}
        <Card className="mb-10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Zap className="h-7 w-7 text-primary" />
              Understanding Signal Icons & Marketing Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-base text-muted-foreground">
              Signals are the core of Dexpath's intelligence system. Each signal icon represents a specific type of paid
              marketing activity detected on Dexscreener. Hover over any icon in the table to see its full description.
            </p>

            <div className="space-y-6 mt-6">
              <h3 className="text-lg font-bold mb-2">Emoji & Symbol Legend in Token Table</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                <li><span className="font-bold">🟢</span> <span className="text-green-600">Green Dot</span>: Indicates positive values, such as high organic volume, upward momentum, or a "fresh" new token.</li>
                <li><span className="font-bold">🟡</span> <span className="text-yellow-600">Yellow Dot</span>: Medium organic volume, high whale/top10 holdings, or stable momentum.</li>
                <li><span className="font-bold">🔴</span> <span className="text-red-600">Red Dot</span>: Downward/cooling momentum, high risk, or negative signals.</li>
                <li><span className="font-bold">📈</span> <span className="text-green-600">Gainers</span>: Tokens with the highest price increase.</li>
                <li><span className="font-bold">📉</span> <span className="text-red-600">Losers</span>: Tokens with the biggest price drop.</li>
                <li><span className="font-bold">💰</span> <span className="text-green-600">Volume</span>: Tokens with the highest transaction volume.</li>
                <li><span className="font-bold">🧠</span> <span className="text-green-600">Smart</span>: Detected smart trader wallet.</li>
                <li><span className="font-bold">🐳</span> <span className="text-green-600">Pro</span>: Detected pro trader wallet.</li>
                <li><span className="font-bold">🆕</span> <span className="text-green-600">Fresh</span>: New/fresh buyer wallet.</li>
                <li><span className="font-bold">📣</span> <span className="text-amber-500">Ad</span>: Token is running an advertisement (DexAD).</li>
                <li><span className="font-bold">👁️</span> <span className="text-amber-500">Impressions</span>: Number of ad impressions.</li>
                <li><span className="font-bold">⏱️</span> <span className="text-amber-500">Duration</span>: Ad duration.</li>
                <li><span className="font-bold">🟢/🟡/🔴</span> <span className="text-green-600">Radar</span>: Token momentum status (UP, STB, COOL).</li>
                <li><span className="font-bold">🔥</span> <span className="text-amber-500">Spike</span>: Indicates possible price spike signal.</li>
                <li><span className="font-bold">DexBoost, DexAD, DexBar, CTO</span>: Lucide icons (lightning, speaker, chart, users) represent paid marketing signals.</li>
                <li><span className="font-bold">CheckCircle2/XCircle/AlertTriangle</span>: Status for snipers, bundlers, insiders, and LP. Green = safe, red/yellow = risk.</li>
                <li><span className="font-bold">Copy</span>: Button to copy wallet/token address.</li>
                <li><span className="font-bold">Target</span>: Snipe button for quick action.</li>
                <li><span className="font-bold">Rocket</span>: Prelaunch project detail.</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-2">These emojis and symbols help you quickly read token data and understand status, risk, and trading opportunities in Dexpath.</p>
            </div>

            <div className="space-y-4">
              <div className="p-5 rounded-lg bg-amber-500/5 border-2 border-amber-500/20">
                <div className="flex items-start gap-4 mb-3">
                  <Zap className="h-8 w-8 text-amber-500" />
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-bold text-lg">DexBoost Paid</h4>
                      <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">50x</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      <strong className="text-foreground">Token is paying for visibility boost on Dexscreener.</strong>
                      The multiplier (10x, 30x, 50x, 100x, or 500x) indicates the level of promotion spend. Higher
                      multipliers suggest more significant marketing budgets and serious project backing.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3 ml-11">
                  {["10x", "30x", "50x", "100x", "500x"].map((m) => (
                    <Badge key={m} variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30">
                      <Zap className="h-3 w-3 mr-1" /> {m}
                    </Badge>
                  ))}
                </div>
                <div className="mt-4 ml-11 p-3 rounded bg-background/50">
                  <p className="text-xs text-muted-foreground">
                    <strong>Pro Tip:</strong> Tokens with 100x or 500x multipliers typically have substantial marketing
                    budgets. This can indicate serious project investment, but always DYOR (Do Your Own Research).
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-lg bg-blue-500/5 border-2 border-blue-500/20">
                <div className="flex items-start gap-4">
                  <Speaker className="h-8 w-8 text-blue-500" />
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-bold text-lg">DexAD Paid</h4>
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Advertisement</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      <strong className="text-foreground">
                        Token has purchased homepage ad placement on Dexscreener.
                      </strong>
                      These are premium advertising spots that appear prominently on the Dexscreener homepage, reaching
                      thousands of traders. Projects paying for DexAD typically have marketing budgets and are serious
                      about visibility.
                    </p>
                    <div className="mt-3 p-3 rounded bg-background/50">
                      <p className="text-xs text-muted-foreground">
                        <strong>Visibility Impact:</strong> DexAD placements significantly increase token exposure,
                        often leading to volume spikes. Monitor price action when ads go live.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-lg bg-purple-500/5 border-2 border-purple-500/20">
                <div className="flex items-start gap-4">
                  <BarChart3 className="h-8 w-8 text-purple-500" />
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-bold text-lg">DexBar Paid</h4>
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Premium</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      <strong className="text-foreground">Premium top banner promotion on Dexscreener.</strong>
                      The DexBar is the most prominent advertising space, appearing as a full-width banner at the top of
                      the Dexscreener homepage. This is the most expensive and visible advertising option available.
                    </p>
                    <div className="mt-3 p-3 rounded bg-background/50">
                      <p className="text-xs text-muted-foreground">
                        <strong>Premium Placement:</strong> DexBar campaigns indicate significant marketing investment
                        and maximum visibility goals. These often coincide with major project announcements or launches.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-lg bg-orange-500/5 border-2 border-orange-500/20">
                <div className="flex items-start gap-4">
                  <UsersIcon className="h-8 w-8 text-orange-500" />
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-bold text-lg">CTO Alert</h4>
                      <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Community</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      <strong className="text-foreground">Community Takeover (CTO) detected.</strong>
                      This signal appears when the original development team has left or abandoned the project, and the
                      community has taken control. CTOs can represent both opportunities and risks depending on
                      community strength and organization.
                    </p>
                    <div className="mt-3 p-3 rounded bg-background/50 space-y-2">
                      <p className="text-xs text-muted-foreground">
                        <strong>Opportunity:</strong> Strong communities can revive abandoned tokens and create new
                        value through decentralized governance and grassroots marketing.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <strong>Risk:</strong> Assess community size, activity level, and leadership before engaging.
                        Some CTOs lack the structure needed for long-term success.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Trading */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MousePointerClick className="h-5 w-5 text-primary" />
              Quick Trading
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground mb-3">
              The "Buy" column on the right side of the table provides instant access to multiple trading platforms.
              Click any icon to open the token on that platform:
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center p-3 rounded-lg bg-secondary/30">
                <div className="w-10 h-10 mx-auto mb-2 rounded bg-secondary flex items-center justify-center">
                  <span className="text-xs font-bold">T</span>
                </div>
                <p className="text-xs font-bold">Trojan</p>
                <p className="text-[10px] text-muted-foreground">Solana DEX</p>
              </div>

              <div className="text-center p-3 rounded-lg bg-secondary/30">
                <div className="w-10 h-10 mx-auto mb-2 rounded bg-secondary flex items-center justify-center">
                  <span className="text-xs font-bold">A</span>
                </div>
                <p className="text-xs font-bold">Axion</p>
                <p className="text-[10px] text-muted-foreground">Trading Bot</p>
              </div>

              <div className="text-center p-3 rounded-lg bg-secondary/30">
                <div className="w-10 h-10 mx-auto mb-2 rounded bg-secondary flex items-center justify-center">
                  <span className="text-xs font-bold">G</span>
                </div>
                <p className="text-xs font-bold">GMGN</p>
                <p className="text-[10px] text-muted-foreground">Analytics</p>
              </div>

              <div className="text-center p-3 rounded-lg bg-secondary/30">
                <div className="w-10 h-10 mx-auto mb-2 rounded bg-secondary flex items-center justify-center">
                  <span className="text-xs font-bold">B</span>
                </div>
                <p className="text-xs font-bold">Bonk</p>
                <p className="text-[10px] text-muted-foreground">Swap</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Token Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Viewing Token Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Click on any token row in the table to view detailed information including:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-4">
              <li>Full token information (name, symbol, contract address)</li>
              <li>Current price and market statistics</li>
              <li>24-hour volume and liquidity data</li>
              <li>Price changes across multiple timeframes (5m, 1h, 6h, 24h)</li>
              <li>Complete signal timeline showing when marketing activities were detected</li>
            </ul>
          </CardContent>
        </Card>

        {/* Token Trending */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Token Trending Section
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Located on the right side of the dashboard, this card shows the top 4 trending tokens based on 5-minute
              price performance. Updates automatically every 3 seconds.
            </p>
            <p className="text-sm text-muted-foreground">
              Click any trending token to view its full details page with complete statistics and signal history.
            </p>
          </CardContent>
        </Card>

        {/* Real-time Updates */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Real-time Data Updates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground mb-3">
              Dexpath provides live data feeds with the following update intervals:
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <span className="text-sm font-medium">New Tokens (Pump.fun)</span>
                <Badge variant="secondary">Every 1 second</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <span className="text-sm font-medium">Token Trending</span>
                <Badge variant="secondary">Every 3 seconds</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <span className="text-sm font-medium">$DEXPATH Token Data</span>
                <Badge variant="secondary">Every 2 seconds</Badge>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              New tokens appear with a brief highlight animation when they first load into the table.
            </p>
          </CardContent>
        </Card>

        {/* Why Paid Signals Matter for Traders */}
        <Card className="mb-10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <BarChart3 className="h-7 w-7 text-primary" />
              Why Paid Signals Matter for Traders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-base leading-relaxed">
              Paid marketing signals are critical indicators in the Solana token ecosystem. Understanding why projects
              invest in promotion helps traders make informed decisions and identify potential opportunities before they
              become widely known.
            </p>

            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <span className="text-primary">1.</span>
                  Serious Project Investment
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Projects paying for DexBoost (especially 100x-500x) or DexAD placement are investing real money into
                  marketing. This indicates they have funding, a budget allocation for growth, and are committed to
                  building visibility. Scam projects rarely spend significant amounts on legitimate advertising.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <span className="text-primary">2.</span>
                  Volume Catalysts
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Paid promotions drive visibility, which drives volume. When a token activates DexBoost or runs a DexAD
                  campaign, thousands of traders see it. This increased exposure often creates buying pressure and
                  volatility - perfect conditions for active traders looking for momentum plays.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <span className="text-primary">3.</span>
                  Early Warning System
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Dexpath detects signals in real-time, often before the wider market catches on. By monitoring signal
                  activations, you can position yourself ahead of the crowd. When you see a new DexBoost activation,
                  you're among the first to know - giving you a timing advantage.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <span className="text-primary">4.</span>
                  Risk Assessment Tool
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Multiple signals on a single token (e.g., DexBoost + DexAD + DexBar simultaneously) suggest a
                  coordinated marketing campaign and substantial budget. However, heavy promotion doesn't guarantee
                  success - use signals as one factor in your analysis alongside tokenomics, liquidity, and community
                  strength.
                </p>
              </div>
            </div>

            <div className="mt-6 p-5 rounded-lg bg-amber-500/10 border-2 border-amber-500/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold mb-2 text-amber-400">Important Disclaimer</h4>
                  <p className="text-sm leading-relaxed">
                    <strong>Paid signals are indicators, not guarantees.</strong> Projects can pay for promotion and
                    still fail. Always conduct thorough research: check liquidity, review the contract, verify the team,
                    assess tokenomics, and evaluate community engagement. Dexpath provides intelligence - trading
                    decisions are yours.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Trading Strategies with Dexpath */}
        <Card className="mb-10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Target className="h-7 w-7 text-primary" />
              Advanced Trading Strategies with Dexpath
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-base leading-relaxed">
              Maximize your trading edge by combining Dexpath's signal intelligence with proven strategies. Here are
              advanced techniques used by professional traders in the Solana ecosystem.
            </p>

            <div className="space-y-5">
              <div>
                <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Strategy 1: Signal Activation Plays
                </h4>
                <div className="p-4 rounded-lg bg-secondary/30 space-y-3">
                  <p className="text-sm leading-relaxed">
                    <strong>Objective:</strong> Enter positions as soon as new signals are detected, capitalizing on the
                    initial visibility spike.
                  </p>
                  <div className="pl-4 border-l-2 border-primary space-y-2">
                    <p className="text-sm">
                      <strong>Step 1:</strong> Monitor the "New Boost" and "New Ads" tabs continuously
                    </p>
                    <p className="text-sm">
                      <strong>Step 2:</strong> When a new signal appears (especially 50x+ boost), immediately check
                      tokenomics and liquidity
                    </p>
                    <p className="text-sm">
                      <strong>Step 3:</strong> If fundamentals look solid, enter within the first 5-10 minutes
                    </p>
                    <p className="text-sm">
                      <strong>Step 4:</strong> Set profit targets (typically 20-50% for signal plays) and stop-losses
                      (10-15%)
                    </p>
                    <p className="text-sm">
                      <strong>Step 5:</strong> Exit as planned - signal plays are short-term momentum trades
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    <strong>Best For:</strong> Active traders comfortable with fast execution and quick decisions.
                    Requires monitoring during high-activity hours.
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" />
                  Strategy 2: Multi-Signal Accumulation
                </h4>
                <div className="p-4 rounded-lg bg-secondary/30 space-y-3">
                  <p className="text-sm leading-relaxed">
                    <strong>Objective:</strong> Identify tokens with multiple concurrent signals (DexBoost + DexAD +
                    DexBar) indicating large coordinated campaigns.
                  </p>
                  <div className="pl-4 border-l-2 border-primary space-y-2">
                    <p className="text-sm">
                      <strong>Step 1:</strong> Use the "Signals" tab and look for tokens with 3+ active signals
                    </p>
                    <p className="text-sm">
                      <strong>Step 2:</strong> Research the project thoroughly - multiple signals suggest big budget
                    </p>
                    <p className="text-sm">
                      <strong>Step 3:</strong> If project looks legitimate, accumulate during dips over 24-48 hours
                    </p>
                    <p className="text-sm">
                      <strong>Step 4:</strong> Hold through the campaign duration (typically 3-7 days)
                    </p>
                    <p className="text-sm">
                      <strong>Step 5:</strong> Take profits in stages as volume peaks
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    <strong>Best For:</strong> Swing traders with 3-7 day time horizons. Lower stress than scalping,
                    requires patience.
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Strategy 3: Trending + Signal Confirmation
                </h4>
                <div className="p-4 rounded-lg bg-secondary/30 space-y-3">
                  <p className="text-sm leading-relaxed">
                    <strong>Objective:</strong> Combine trending momentum with signal detection for high-probability
                    trades.
                  </p>
                  <div className="pl-4 border-l-2 border-primary space-y-2">
                    <p className="text-sm">
                      <strong>Step 1:</strong> Watch the Token Trending card (top 4 tokens by 5m performance)
                    </p>
                    <p className="text-sm">
                      <strong>Step 2:</strong> If a trending token also has active signals, this is a strong buy
                      indicator
                    </p>
                    <p className="text-sm">
                      <strong>Step 3:</strong> Enter on pullbacks (5-10% dips) rather than chasing pumps
                    </p>
                    <p className="text-sm">
                      <strong>Step 4:</strong> Hold while token remains in top trending AND signals are active
                    </p>
                    <p className="text-sm">
                      <strong>Step 5:</strong> Exit if token drops out of trending or volume decreases significantly
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    <strong>Best For:</strong> Day traders who want confirmation from both price action and marketing
                    activity. Balanced risk/reward.
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <MousePointerClick className="h-5 w-5 text-primary" />
                  Strategy 4: Launchpad Specialization
                </h4>
                <div className="p-4 rounded-lg bg-secondary/30 space-y-3">
                  <p className="text-sm leading-relaxed">
                    <strong>Objective:</strong> Become an expert on 1-2 specific launchpads and track their new launches
                    religiously.
                  </p>
                  <div className="pl-4 border-l-2 border-primary space-y-2">
                    <p className="text-sm">
                      <strong>Step 1:</strong> Choose a launchpad (Pump.fun is highest volume, Raydium is most
                      established)
                    </p>
                    <p className="text-sm">
                      <strong>Step 2:</strong> Filter "New Coins" tab by your chosen launchpad
                    </p>
                    <p className="text-sm">
                      <strong>Step 3:</strong> Learn the patterns - which tokens get traction, common tokenomics,
                      typical pump timings
                    </p>
                    <p className="text-sm">
                      <strong>Step 4:</strong> When you see a new launch matching successful patterns, enter early
                    </p>
                    <p className="text-sm">
                      <strong>Step 5:</strong> Build a track record and refine your entry/exit rules over time
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    <strong>Best For:</strong> Traders who prefer specialization over generalization. Become the expert
                    on one platform.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-5 rounded-lg bg-primary/10 border-2 border-primary/30">
              <div className="flex items-start gap-3">
                <Shield className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold mb-2">Risk Management Rules</h4>
                  <ul className="text-sm space-y-1.5 text-muted-foreground">
                    <li>• Never risk more than 1-3% of your portfolio on a single signal play</li>
                    <li>• Always use stop-losses - even "sure things" can fail</li>
                    <li>• Take partial profits (25-50%) at 2x to secure gains</li>
                    <li>• Diversify across multiple tokens rather than going all-in on one</li>
                    <li>• Track your trades and learn from both winners and losers</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform Features Deep Dive */}
        <Card className="mb-10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Shield className="h-7 w-7 text-primary" />
              Platform Features Deep Dive
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-base leading-relaxed">
              Explore every feature of the Dexpath terminal to unlock its full potential for your trading workflow.
            </p>

            <div className="space-y-5">
              <div>
                <h4 className="font-bold text-lg mb-3">Search & Filtering</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  The search bar at the top of the token screener provides instant filtering across all loaded tokens:
                </p>
                <ul className="text-sm text-muted-foreground space-y-2 ml-4 list-disc">
                  <li>
                    <strong>Name search:</strong> Type token name (e.g., "PEPE") to filter results instantly
                  </li>
                  <li>
                    <strong>Symbol search:</strong> Use ticker symbols for quick access
                  </li>
                  <li>
                    <strong>Contract address:</strong> Paste full or partial contract address for precise lookup
                  </li>
                  <li>
                    <strong>Case-insensitive:</strong> Search works regardless of capitalization
                  </li>
                  <li>
                    <strong>Real-time filtering:</strong> Results update as you type
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-lg mb-3">Boost Level Filtering</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  In the "New Boost" tab, filter tokens by their boost multiplier:
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {["All", "10x", "30x", "50x", "100x", "500x"].map((m) => (
                    <Badge key={m} variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30">
                      {m}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Use this to focus on tokens with specific marketing spend levels. Higher multipliers indicate larger
                  budgets.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-lg mb-3">Real-Time Price Updates</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  All price data in the token screener updates in real-time:
                </p>
                <div className="p-4 rounded-lg bg-secondary/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Current Price</span>
                    <span className="text-xs text-muted-foreground">Updates every 1-3 seconds</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">5-Minute Change</span>
                    <span className="text-xs text-muted-foreground">Most recent 5m candle</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">24-Hour Change</span>
                    <span className="text-xs text-muted-foreground">Rolling 24h performance</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-lg mb-3">Token Detail Pages</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Click any token row to access its detailed information page with:
                </p>
                <ul className="text-sm text-muted-foreground space-y-2 ml-4 list-disc">
                  <li>
                    <strong>Full Statistics:</strong> Market cap, volume, liquidity, holder count
                  </li>
                  <li>
                    <strong>Price History:</strong> Multiple timeframe changes (5m, 1h, 6h, 24h)
                  </li>
                  <li>
                    <strong>Signal Timeline:</strong> Chronological list of all detected marketing activities
                  </li>
                  <li>
                    <strong>Contract Info:</strong> Verified contract address with copy button
                  </li>
                  <li>
                    <strong>Quick Actions:</strong> Direct links to trading platforms
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-lg mb-3">Quick Trade Buttons</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  The "Buy" column provides instant access to multiple trading platforms. Each platform serves different
                  needs:
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-secondary/30">
                    <h5 className="font-bold text-sm mb-1">Trojan (T)</h5>
                    <p className="text-xs text-muted-foreground">Solana DEX aggregator with best price routing</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/30">
                    <h5 className="font-bold text-sm mb-1">Axion (A)</h5>
                    <p className="text-xs text-muted-foreground">Advanced trading bot with limit orders</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/30">
                    <h5 className="font-bold text-sm mb-1">GMGN (G)</h5>
                    <p className="text-xs text-muted-foreground">Analytics and trading combined</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/30">
                    <h5 className="font-bold text-sm mb-1">Bonk (B)</h5>
                    <p className="text-xs text-muted-foreground">Simple swap interface with low fees</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-lg mb-3">$DEXPATH Token Info Card</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  The bottom-right card displays live information about the $DEXPATH token:
                </p>
                <ul className="text-sm text-muted-foreground space-y-2 ml-4 list-disc">
                  <li>
                    <strong>Real-Time Price:</strong> Current $DEXPATH price updated every 2 seconds
                  </li>
                  <li>
                    <strong>24h Performance:</strong> Daily price change percentage
                  </li>
                  <li>
                    <strong>Market Cap:</strong> Total market valuation
                  </li>
                  <li>
                    <strong>Holder Count:</strong> Number of unique $DEXPATH holders
                  </li>
                  <li>
                    <strong>Contract Address:</strong> Quick copy button for the token contract
                  </li>
                  <li>
                    <strong>Social Links:</strong> Direct access to X (Twitter), Discord, and Telegram
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips & Best Practices */}
        <Card className="mb-10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Lightbulb className="h-7 w-7 text-primary" />
              Pro Tips & Best Practices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-cyan-500/10 border border-primary/20">
                <h4 className="font-bold mb-2">Monitor Multiple Tabs Simultaneously</h4>
                <p className="text-sm text-muted-foreground">
                  Don't just stick to one tab. Switch between "New Coins" for fresh launches, "Signals" for marketing
                  activity, and "New Boost" for the latest promotions. The best opportunities often appear across
                  multiple categories.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-cyan-500/10 border border-primary/20">
                <h4 className="font-bold mb-2">Pay Attention to Boost Multipliers</h4>
                <p className="text-sm text-muted-foreground">
                  Higher DexBoost levels (100x, 500x) indicate projects with significant marketing budgets. While this
                  doesn't guarantee success, it shows commitment and funding. Compare boost levels when evaluating
                  similar tokens in the same niche.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-cyan-500/10 border border-primary/20">
                <h4 className="font-bold mb-2">Use Search for Fast Token Lookup</h4>
                <p className="text-sm text-muted-foreground">
                  When someone shares a contract address in Discord or Telegram, immediately paste it into Dexpath's
                  search bar. You'll instantly see if the token has active signals, saving time on manual Dexscreener
                  checks.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-cyan-500/10 border border-primary/20">
                <h4 className="font-bold mb-2">Monitor Token Trending for Momentum</h4>
                <p className="text-sm text-muted-foreground">
                  The Token Trending card shows the top 4 tokens by 5-minute performance. These are moving RIGHT NOW. If
                  a trending token also has active signals, this combination of price momentum + marketing can be
                  powerful. Check the trending section every few minutes during active trading hours.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-cyan-500/10 border border-primary/20">
                <h4 className="font-bold mb-2">Leverage Launchpad Filters</h4>
                <p className="text-sm text-muted-foreground">
                  Different launchpads have different characteristics. Pump.fun has the highest volume but more
                  volatility. Raydium listings are typically more established. Experiment with each launchpad's filter
                  to understand their typical token profiles and find your preferred platforms.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-cyan-500/10 border border-primary/20">
                <h4 className="font-bold mb-2">Watch for New Token Animations</h4>
                <p className="text-sm text-muted-foreground">
                  When new tokens appear in the table, they briefly highlight to catch your attention. This animation
                  indicates fresh data just loaded. If you're actively monitoring, these highlights help you spot new
                  opportunities instantly without scanning the entire list.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-cyan-500/10 border border-primary/20">
                <h4 className="font-bold mb-2">Combine Signals with Your Own Research</h4>
                <p className="text-sm text-muted-foreground">
                  Dexpath provides intelligence, not investment advice. Before entering any position: (1) Check
                  liquidity on the detail page, (2) Review the contract on a scanner, (3) Assess the community size and
                  activity, (4) Verify tokenomics (supply, taxes, locks), (5) Set clear profit targets and stop-losses.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-cyan-500/10 border border-primary/20">
                <h4 className="font-bold mb-2">Time Your Market Participation</h4>
                <p className="text-sm text-muted-foreground">
                  Solana trading is most active during US and EU daytime hours (roughly 12:00-22:00 UTC). New token
                  launches and signal activations peak during these windows. If you're hunting for maximum
                  opportunities, focus your monitoring during high-activity periods.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-cyan-500/10 border border-primary/20">
                <h4 className="font-bold mb-2">Build Your Watchlist Strategy</h4>
                <p className="text-sm text-muted-foreground">
                  When you find promising tokens, save their contract addresses in a notes app. Check back on them
                  periodically using Dexpath's search. Track which signals lead to sustained growth vs. quick pumps, and
                  refine your signal interpretation over time.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-cyan-500/10 border border-primary/20">
                <h4 className="font-bold mb-2">Use Quick Trade Buttons Efficiently</h4>
                <p className="text-sm text-muted-foreground">
                  Learn which trading platform suits your style. Trojan for best routing, Axion for advanced orders,
                  GMGN for analytics first, Bonk for simplicity. Clicking a quick trade button opens a new tab, keeping
                  Dexpath open so you can continue monitoring while setting up your trade.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Common Questions */}
        <Card className="mb-10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <BookOpen className="h-7 w-7 text-primary" />
              Common Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <h4 className="font-bold mb-2">How often does data update?</h4>
              <p className="text-sm text-muted-foreground">
                New tokens from Pump.fun update every 1 second. Token Trending updates every 3 seconds. $DEXPATH token
                data updates every 2 seconds. All updates happen automatically in the background.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-2">Do I need to refresh the page?</h4>
              <p className="text-sm text-muted-foreground">
                No. Dexpath uses automatic polling to fetch new data continuously. Just keep the page open and watch the
                data stream in. You'll see new tokens highlight briefly when they first appear.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-2">What does it mean if a token has multiple signals?</h4>
              <p className="text-sm text-muted-foreground">
                Multiple concurrent signals (e.g., DexBoost + DexAD + DexBar) indicate a coordinated, well-funded
                marketing campaign. The project is investing heavily in visibility across multiple channels. This can be
                bullish, but always verify the project's fundamentals independently.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-2">Why are some launchpad filters empty?</h4>
              <p className="text-sm text-muted-foreground">
                Currently, only Pump.fun tokens are actively fetched from the API in real-time. Other launchpad filters
                (Bags, Heaven, Bonk, etc.) are prepared for future API integrations and will show data once those
                connections are established.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-2">Can I see historical signal data?</h4>
              <p className="text-sm text-muted-foreground">
                Yes! Click any token row to open its detail page, then scroll to the "Signal Timeline" section. This
                shows a chronological history of all detected signals for that token, including timestamps and signal
                types.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-2">What's the difference between the tabs?</h4>
              <p className="text-sm text-muted-foreground">
                <strong>New Coins:</strong> Shows recently launched tokens across all launchpads.{" "}
                <strong>Signals:</strong>
                Displays all tokens with any active marketing signal. <strong>CTO:</strong> Community takeover tokens
                only.
                <strong>Prelaunch:</strong> Coming soon. <strong>New Dexpaid/Boost/Ads:</strong> Filters by specific
                signal types for focused monitoring.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-2">How do I know if a signal is new or old?</h4>
              <p className="text-sm text-muted-foreground">
                Check the token's detail page and review the Signal Timeline. The most recent signal will appear at the
                top with a timestamp. Signals typically last 24-48 hours, but exact durations depend on how long the
                project pays for promotion.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-2">Are paid signals good or bad?</h4>
              <p className="text-sm text-muted-foreground">
                Neither inherently. Paid signals indicate marketing spend, which shows project commitment and funding.
                However, even well-funded marketing can't save a fundamentally flawed project. Use signals as one input
                in your decision-making process, not the only factor.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Getting Help */}
        <Card className="mb-10 bg-gradient-to-br from-primary/10 to-cyan-500/10 border-primary/30">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-3">Need Help or Have Questions?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join our community on Discord and Telegram for support, trading discussions, and real-time alerts. Follow
              us on X for platform updates and market insights.
            </p>
            <div className="flex flex-wrap gap-3 justify-center mb-6">
              <Link href="https://discord.gg/dexpath" target="_blank">
                <button className="px-5 py-2.5 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-lg font-semibold text-sm transition-colors">
                  Join Discord
                </button>
              </Link>
              <Link href="https://t.me/dexpath" target="_blank">
                <button className="px-5 py-2.5 bg-[#0088cc] hover:bg-[#006699] text-white rounded-lg font-semibold text-sm transition-colors">
                  Join Telegram
                </button>
              </Link>
              <Link href="https://x.com/dexpath" target="_blank">
                <button className="px-5 py-2.5 bg-black hover:bg-black/80 text-white rounded-lg font-semibold text-sm transition-colors">
                  Follow on X
                </button>
              </Link>
            </div>
            <div className="flex gap-3 justify-center">
              <Link href="/">
                <button className="px-5 py-2 bg-primary hover:bg-primary/80 text-primary-foreground rounded-lg font-semibold text-sm transition-colors">
                  Open Terminal
                </button>
              </Link>
              <Link href="/about">
                <button className="px-5 py-2 bg-secondary hover:bg-secondary/80 rounded-lg font-semibold text-sm transition-colors">
                  Learn More
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
