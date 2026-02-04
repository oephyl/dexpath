"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SignalBadge } from "@/components/signal-badge"
import type { SignalEvent } from "@/lib/mock"

interface SignalTimelineProps {
  events: SignalEvent[]
  analyzerContent?: React.ReactNode
}

type FilterType = "paid" | "analyzer"

export function SignalTimeline({ events, analyzerContent }: SignalTimelineProps) {
  const [filter, setFilter] = useState<FilterType>(analyzerContent ? "analyzer" : "paid")

  const filteredEvents = useMemo(() => {
    let filtered = [...events]

    if (filter === "paid") {
      filtered = filtered.filter(
        (e) => e.type === "DEXBOOST_PAID" || e.type === "DEXAD_PAID" || e.type === "DEXBAR_PAID",
      )
    }

    return filtered.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
  }, [events, filter])

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getVariantColor = (type: string) => {
    if (type === "DEXBOOST_PAID" || type === "DEXAD_PAID" || type === "DEXBAR_PAID") {
      return "bg-primary"
    } else if (type === "CTO" || type === "UPDATE_SOCIAL") {
      return "bg-violet-500"
    } else {
      return "bg-cyan-500"
    }
  }

  return (
    <Card className="h-fit" title="Signal Timeline: history of signals and related analysis for this token.">
      <CardHeader>
        <CardTitle>Signal Timeline</CardTitle>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)} className="mt-3">
          <TabsList className={analyzerContent ? "grid w-full grid-cols-2" : "grid w-full grid-cols-1"}>
            <TabsTrigger value="paid" className="text-xs">Paid</TabsTrigger>
            {analyzerContent ? <TabsTrigger value="analyzer" className="text-xs">Analyzer</TabsTrigger> : null}
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="max-h-[680px] overflow-y-auto pr-2">
        {filter === "analyzer" && analyzerContent ? (
          analyzerContent
        ) : (
          <div className="relative space-y-4">
            {/* Timeline line */}
            <div className="absolute left-[7px] top-0 bottom-0 w-[2px] bg-border" />

            {filteredEvents.map((event, idx) => (
              <div key={event.id} className="relative pl-8">
                {/* Timeline dot */}
                <div
                  className={`absolute left-0 top-1 w-4 h-4 rounded-full ${getVariantColor(event.type)} ring-4 ring-background`}
                />

                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <SignalBadge type={event.type} />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{getTimeAgo(event.ts)}</span>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed">{event.context}</p>

                  <div className="flex flex-wrap gap-2">
                    {event.mc && (
                      <Badge variant="secondary" className="text-xs">
                        MC: ${(event.mc / 1000).toFixed(0)}k
                      </Badge>
                    )}
                    {event.priceChange && (
                      <Badge
                        variant="secondary"
                        className={`text-xs ${event.priceChange >= 0 ? "text-green-500" : "text-red-500"}`}
                      >
                        {event.priceChange >= 0 ? "+" : ""}
                        {event.priceChange.toFixed(1)}%
                      </Badge>
                    )}
                    {event.timeframe && (
                      <Badge variant="secondary" className="text-xs">
                        {event.timeframe}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
