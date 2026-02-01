"use client"

import { useState } from "react"
import { TopNav } from "@/components/top-nav"
import { TokenTable } from "@/components/token-table"
import { TokenTrending } from "@/components/live-signal-feed"
import { DexpathInfo } from "@/components/dexpath-info"
import { ChevronsLeft, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { TokenRow } from "@/lib/mock"
import { FeaturedAdToken } from "@/components/featured-ad-token"
import { CreateAdDialog } from "@/components/create-ad-dialog"
import { Button } from "@/components/ui/button"

export default function Home() {
  const [tokens, setTokens] = useState<TokenRow[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [rightSidebarHidden, setRightSidebarHidden] = useState(false)

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

  // New Coins data is fetched inside TokenTable via Mobula.

  return (
    <div className="min-h-screen bg-background">
      <TopNav />

      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 max-w-[1600px]">
        {/* Desktop handle when the right sidebar is hidden */}
        {rightSidebarHidden && (
          <div className="hidden lg:block fixed top-24 right-3 sm:right-4 z-50">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-9 w-9 p-0"
              onClick={() => setRightSidebarHidden(false)}
              aria-label="Show right sidebar"
              title="Show"
            >
              <ChevronsLeft className="h-5 w-5" />
            </Button>
          </div>
        )}

        <div
          className={`grid grid-cols-1 gap-4 sm:gap-6 ${
            rightSidebarHidden ? "lg:grid-cols-1" : "lg:grid-cols-[1fr_380px]"
          }`}
        >
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
          {!rightSidebarHidden && (
            <div className="sticky top-20 h-fit hidden lg:block">
              <div className="relative space-y-4 sm:space-y-6">
                <TokenTrending
                  sidebarHidden={rightSidebarHidden}
                  onToggleSidebar={() => setRightSidebarHidden((v) => !v)}
                />
                <DexpathInfo />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
