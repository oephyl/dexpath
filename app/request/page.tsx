"use client"

import type React from "react"

import { useState } from "react"
import { TopNav } from "@/components/top-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Search, Send, Lightbulb, CheckCircle2 } from "lucide-react"
import Image from "next/image"

interface TokenResult {
  symbol: string
  name: string
  address: string
  logo: string
  mc: number
}

export default function RequestFeaturePage() {
  const [tokenSearch, setTokenSearch] = useState("")
  const [selectedToken, setSelectedToken] = useState<TokenResult | null>(null)
  const [featureTitle, setFeatureTitle] = useState("")
  const [featureDescription, setFeatureDescription] = useState("")
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  // Mock token search results
  const searchResults: TokenResult[] =
    tokenSearch.length > 2
      ? [
          {
            symbol: "PEPE",
            name: "Pepe Coin",
            address: "0x1a2b3c...",
            logo: "/pepe-frog-crypto-logo.jpg",
            mc: 2500000,
          },
          {
            symbol: "DOGE",
            name: "Dogecoin",
            address: "0x4d5e6f...",
            logo: "/doge-rocket-crypto-logo.jpg",
            mc: 1800000,
          },
          {
            symbol: "SHIB",
            name: "Shiba Inu",
            address: "0x7g8h9i...",
            logo: "/shiba-crown-crypto-logo.jpg",
            mc: 3200000,
          },
        ].filter(
          (token) =>
            token.symbol.toLowerCase().includes(tokenSearch.toLowerCase()) ||
            token.name.toLowerCase().includes(tokenSearch.toLowerCase()),
        )
      : []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setFeatureTitle("")
      setFeatureDescription("")
      setEmail("")
      setSelectedToken(null)
      setTokenSearch("")
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Lightbulb className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Request a Feature</h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
            Help us improve Dexpath by suggesting new features or enhancements. You can also link your request to a
            specific token.
          </p>
          <p className="text-primary text-xs md:text-sm mt-2">
            Contact us:{" "}
            <a href="mailto:request@dexpath.io" className="underline hover:text-primary/80">
              request@dexpath.io
            </a>
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-6">
          {/* Main Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Feature Request Form</CardTitle>
              <CardDescription className="text-xs">
                Fill out the form below to submit your feature request
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Request Submitted!</h3>
                  <p className="text-sm text-muted-foreground">
                    Thank you for your feedback. We'll review your request and get back to you soon.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Feature Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm">
                      Feature Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="E.g., Add limit orders feature"
                      value={featureTitle}
                      onChange={(e) => setFeatureTitle(e.target.value)}
                      required
                      className="text-sm"
                    />
                  </div>

                  {/* Feature Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm">
                      Feature Description <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the feature you'd like to see..."
                      value={featureDescription}
                      onChange={(e) => setFeatureDescription(e.target.value)}
                      required
                      rows={6}
                      className="text-sm resize-none"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm">
                      Email (Optional)
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="text-sm"
                    />
                    <p className="text-xs text-muted-foreground">We'll notify you when we implement your feature</p>
                  </div>

                  {/* Selected Token Display */}
                  {selectedToken && (
                    <div className="space-y-2">
                      <Label className="text-sm">Related Token</Label>
                      <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg border">
                        <Image
                          src={selectedToken.logo || "/placeholder.svg"}
                          alt={selectedToken.symbol}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                        <div className="flex-1">
                          <div className="font-semibold text-sm">{selectedToken.symbol}</div>
                          <div className="text-xs text-muted-foreground">{selectedToken.name}</div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedToken(null)}
                          className="text-xs"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button type="submit" className="w-full" disabled={!featureTitle || !featureDescription}>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Request
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Token Search Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Link to Token</CardTitle>
                <CardDescription className="text-xs">
                  Search for a token to associate with your feature request
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search tokens..."
                    value={tokenSearch}
                    onChange={(e) => setTokenSearch(e.target.value)}
                    className="pl-9 text-sm"
                  />
                </div>

                {/* Search Results */}
                {tokenSearch.length > 2 && (
                  <div className="space-y-2">
                    {searchResults.length > 0 ? (
                      searchResults.map((token) => (
                        <div
                          key={token.address}
                          onClick={() => {
                            setSelectedToken(token)
                            setTokenSearch("")
                          }}
                          className="flex items-center gap-3 p-3 bg-secondary/30 hover:bg-secondary/50 rounded-lg border border-border cursor-pointer transition-colors"
                        >
                          <Image
                            src={token.logo || "/placeholder.svg"}
                            alt={token.symbol}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm">{token.symbol}</div>
                            <div className="text-xs text-muted-foreground truncate">{token.name}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground">MC</div>
                            <div className="text-xs font-mono">${(token.mc / 1000000).toFixed(2)}M</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-sm text-muted-foreground">No tokens found</div>
                    )}
                  </div>
                )}

                {tokenSearch.length === 0 && !selectedToken && (
                  <div className="text-center py-8 text-xs text-muted-foreground">
                    Start typing to search for tokens
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-muted-foreground">• Be specific about what you want to achieve</p>
                <p className="text-xs text-muted-foreground">• Explain how the feature would benefit you</p>
                <p className="text-xs text-muted-foreground">• Link to a token if your request is token-specific</p>
                <p className="text-xs text-muted-foreground">• Provide examples or use cases</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
