"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function TokenSummary({ lines, title = "Summary" }: { lines: string[]; title?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {lines.length === 0 ? (
          <div className="text-sm text-muted-foreground">No summary available.</div>
        ) : (
          <div className="space-y-2">
            {lines.slice(0, 4).map((line, idx) => (
              <div key={idx} className="text-sm">
                {line}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
