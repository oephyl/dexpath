"use client"

import { useState, useEffect, useRef } from "react"
import { TopNav } from "@/components/top-nav"
import { TokenTable } from "@/components/token-table"
import { TokenTrending } from "@/components/live-signal-feed"
import { DexpathInfo } from "@/components/dexpath-info"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { fetchPumpFunTokens } from "@/lib/api"
import type { TokenRow } from "@/lib/mock"
import { FeaturedAdToken } from "@/components/featured-ad-token"
import { CreateAdDialog } from "@/components/create-ad-dialog"

export default function Home() {
  const [tokens, setTokens] = useState<TokenRow[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const seenTokensRef = useRef<Set<string>>(new Set())

  const handleSearchFocus = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        setSearchQuery(text)
      }
    } catch (err) {
      // Clipboard access denied or not available
    }
  }

  useEffect(() => {
    const fetchTokens = async () => {
      const newTokens = await fetchPumpFunTokens()
      const seenTokens = seenTokensRef.current
      const updatedTokens = newTokens.filter((token) => !seenTokens.has(token.address))
      setTokens((prevTokens) => [...prevTokens, ...updatedTokens])
      updatedTokens.forEach((token) => seenTokens.add(token.address))
    }

    fetchTokens()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <TopNav />

      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 max-w-[1600px]">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4 sm:gap-6">
          {/* Main Content */}
          <div className="space-y-3 sm:space-y-4 min-w-0">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search tokens..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={handleSearchFocus}
                  className="w-full pl-10 text-sm h-10 sm:h-11"
                />
              </div>
              <CreateAdDialog />
            </div>

            <div className="flex gap-2 overflow-x-auto hide-scrollbar lg:grid lg:grid-cols-6 lg:gap-2 lg:overflow-visible">
              <FeaturedAdToken index={0} />
              <FeaturedAdToken index={1} />
              <FeaturedAdToken index={2} />
              <FeaturedAdToken index={3} />
              <FeaturedAdToken index={4} />
              <FeaturedAdToken index={5} />
            </div>

            {/* Token Table */}
            <TokenTable tokens={tokens} searchQuery={searchQuery} />
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6 sticky top-20 h-fit hidden lg:block">
            <TokenTrending />
            <DexpathInfo />
          </div>
        </div>
      </main>
    </div>
  )
}
