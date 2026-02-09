import * as React from "react";
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BookOpen, Info, MapPin, Star, MessageSquarePlus } from "lucide-react"

export function TopNav() {
  const [open, setOpen] = React.useState(false);
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

          {/* Hamburger menu for mobile */}
          <div className="md:hidden flex items-center">
            <Button variant="ghost" size="sm" className="p-2" onClick={() => setOpen(!open)}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
            </Button>
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
        {/* Mobile menu drawer */}
        {open && (
          <div className="md:hidden fixed inset-0 z-50 bg-black/40" onClick={() => setOpen(false)}>
            <div className="absolute top-0 left-0 w-64 h-full bg-background shadow-lg p-6 flex flex-col gap-4" onClick={e => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="text-xs gap-1.5 px-3 h-8" asChild>
                <Link href="/featured" onClick={() => setOpen(false)}>
                  <Star className="h-4 w-4" /> Featured
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="text-xs gap-1.5 px-3 h-8" asChild>
                <Link href="/docs" onClick={() => setOpen(false)}>
                  <BookOpen className="h-4 w-4" /> Docs
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="text-xs gap-1.5 px-3 h-8" asChild>
                <Link href="/about" onClick={() => setOpen(false)}>
                  <Info className="h-4 w-4" /> About
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="text-xs gap-1.5 px-3 h-8" asChild>
                <Link href="/roadmap" onClick={() => setOpen(false)}>
                  <MapPin className="h-4 w-4" /> Roadmap
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="text-xs gap-1.5 px-3 h-8" asChild>
                <Link href="/request" onClick={() => setOpen(false)}>
                  <MessageSquarePlus className="h-4 w-4" /> Request
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
