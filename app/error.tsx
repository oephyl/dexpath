"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error("[GlobalError]", error)
  }, [error])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
        <p className="text-sm text-muted-foreground mb-6">
          A client-side exception occurred. Please try resetting the page.
        </p>
        <div className="flex gap-2">
          <Button onClick={() => reset()}>Reload</Button>
          <Button variant="outline" onClick={() => location.reload()}>Hard Reload</Button>
        </div>
      </div>
    </div>
  )
}
