"use client"

import { TopNav } from "@/components/top-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Users, Target, Eye, Radio, ArrowRightLeft, TrendingUp } from "lucide-react"

export default function FeaturedPage() {
  const features = [
    {
      icon: Zap,
      title: "Quick Trade",
      status: "Coming Soon",
      description:
        "Execute trades instantly with one-click functionality. Skip the complex swap interfaces and trade directly from the Dexpath terminal with optimal routing and minimal slippage.",
      benefits: [
        "One-click buy/sell interface",
        "Automatic best route finding",
        "Slippage protection built-in",
        "Gas optimization",
      ],
    },
    {
      icon: Users,
      title: "Copytrade",
      status: "Coming Soon",
      description:
        "Automatically mirror the trades of successful wallets and professional traders. Set your parameters and let Dexpath copy winning strategies in real-time.",
      benefits: [
        "Follow top performers automatically",
        "Customizable copy ratios",
        "Risk management controls",
        "Performance tracking",
      ],
    },
    {
      icon: Target,
      title: "Sniper",
      status: "Coming Soon",
      description:
        "Be first to buy new token launches with millisecond precision. Configure your sniping strategy and let our bot execute instantly when conditions are met.",
      benefits: [
        "Lightning-fast execution",
        "Smart contract validation",
        "Anti-rug protection",
        "Customizable buy conditions",
      ],
    },
    {
      icon: Eye,
      title: "Insider",
      status: "Coming Soon",
      description:
        "Track whale wallets and insider movements in real-time. Get notified when smart money makes moves before the market reacts.",
      benefits: [
        "Whale wallet tracking",
        "Smart money alerts",
        "Position size analysis",
        "Historical pattern matching",
      ],
    },
    {
      icon: Radio,
      title: "Caller",
      status: "Coming Soon",
      description:
        "Automated alpha call aggregator from trusted sources. Get signals from verified callers and KOLs consolidated in one feed with performance metrics.",
      benefits: [
        "Verified caller aggregation",
        "Performance scoring",
        "Signal quality filtering",
        "Multi-channel integration",
      ],
    },
    {
      icon: ArrowRightLeft,
      title: "Migrate",
      status: "Coming Soon",
      description:
        "Seamlessly move liquidity and positions across different DEXs and chains. One-click migration with optimal routing and minimal fees.",
      benefits: ["Cross-DEX transfers", "Multi-chain support", "Automated LP migration", "Fee optimization"],
    },
    {
      icon: TrendingUp,
      title: "Fast Predict",
      status: "Coming Soon",
      description:
        "AI-powered price prediction and trend analysis. Get probability-based forecasts for short-term price movements using machine learning models.",
      benefits: ["ML-based predictions", "Confidence scoring", "Technical indicator fusion", "Real-time model updates"],
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-12 text-center">
          <Badge className="mb-4 bg-primary/20 text-primary border-primary/50">Future Features</Badge>
          <h1 className="text-4xl font-bold mb-4 text-balance">What's Coming to Dexpath</h1>
          <p className="text-lg text-muted-foreground text-balance">
            We're building the most comprehensive trading terminal for Solana. Here's what we have planned for the near
            future.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="relative overflow-hidden group hover:border-primary/50 transition-all">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all" />
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant="outline" className="text-[10px] border-primary/30">
                      {feature.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription className="text-xs leading-relaxed">{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">Key Features:</p>
                    <ul className="space-y-1.5">
                      {feature.benefits.map((benefit, i) => (
                        <li key={i} className="text-xs flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Footer CTA */}
        <div className="mt-16 max-w-3xl mx-auto text-center">
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-2xl">Stay Updated</CardTitle>
              <CardDescription>
                These features are in active development. Follow us on social media or join our community to get
                notified when they launch.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Have feedback or feature requests? Reach out to us on Discord or X.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
