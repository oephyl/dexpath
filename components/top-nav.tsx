import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BookOpen, Info, MapPin, Star, MessageSquarePlus } from "lucide-react"

export function TopNav() {
  return (
    <div className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-2">
          {/* Left - Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <a href="/" className="flex items-center gap-2">
              <Image
                src="/images/logo-only.png"
                alt="Dexpath"
                width={120}
                height={32}
                className="h-7 sm:h-8 w-auto"
                priority
              />
            </a>
          </div>

          {/* Navigation - Hidden on mobile, centered on desktop */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2 absolute left-1/2 -translate-x-1/2">
            <Button variant="ghost" size="sm" className="text-xs gap-1.5 px-3 h-8" asChild>
              <Link href="/featured">
                <Star className="h-3.5 w-3.5" />
                Featured
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="text-xs gap-1.5 px-3 h-8" asChild>
              <Link href="/docs">
                <BookOpen className="h-3.5 w-3.5" />
                Docs
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="text-xs gap-1.5 px-3 h-8" asChild>
              <Link href="/about">
                <Info className="h-3.5 w-3.5" />
                About
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="text-xs gap-1.5 px-3 h-8" asChild>
              <Link href="/roadmap">
                <MapPin className="h-3.5 w-3.5" />
                Roadmap
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="text-xs gap-1.5 px-3 h-8" asChild>
              <Link href="/request">
                <MessageSquarePlus className="h-3.5 w-3.5" />
                Request
              </Link>
            </Button>
          </nav>

          {/* Right - Status */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge variant="outline" className="gap-1.5 border-primary/50 bg-primary/10 text-primary px-2 py-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-full w-full bg-primary"></span>
              </span>
              <span className="text-[10px] sm:text-xs font-medium">LIVE</span>
            </Badge>
            <span className="text-[9px] sm:text-[10px] text-muted-foreground hidden xl:inline whitespace-nowrap">
              updated just now
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
