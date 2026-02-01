"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { formatNumber } from "@/lib/format"

type TokenInfoValue = string | number | boolean | null | undefined

function formatValue(v: TokenInfoValue) {
  if (v == null) return "-"
  if (typeof v === "boolean") return v ? "Yes" : "No"
  if (typeof v === "number") return formatNumber(v)
  return String(v)
}

function formatDate(v: TokenInfoValue) {
  if (!v) return "-"
  const d = new Date(String(v))
  if (Number.isNaN(d.getTime())) return "-"
  return d.toLocaleString()
}

function getPath(obj: any, path: string): any {
  const parts = path.split(".")
  let cur = obj
  for (const p of parts) {
    if (cur == null) return undefined
    cur = cur[p]
  }
  return cur
}

export function TokenInfoSection({
  mobula,
  loading,
}: {
  mobula: any | null
  loading: boolean
}) {
  const rows = useMemo(() => {
    const data = mobula?.data ?? mobula?.data?.data ?? mobula

    return [
      { label: "Total Supply", value: getPath(data, "totalSupply") },
      { label: "Circulating Supply", value: getPath(data, "circulatingSupply") },
      { label: "Holders", value: getPath(data, "holdersCount") ?? getPath(data, "holders") },
      { label: "ATH (USD)", value: getPath(data, "athUSD") },
      { label: "ATL (USD)", value: getPath(data, "atlUSD") },
      { label: "Deployer", value: getPath(data, "deployer") },
      { label: "Token Type", value: getPath(data, "tokenType") },
      { label: "Buy Tax", value: getPath(data, "security.buyTax") },
      { label: "Sell Tax", value: getPath(data, "security.sellTax") },
      { label: "Blacklisted", value: getPath(data, "security.isBlacklisted") },
      { label: "Transfer Pausable", value: getPath(data, "security.transferPausable") },
      { label: "Created At", value: getPath(data, "createdAt"), isDate: true },
      { label: "Last Trade", value: getPath(data, "latestTradeDate"), isDate: true },
    ] as Array<{ label: string; value: any; isDate?: boolean }>
  }, [mobula])

  const groups = useMemo(() => {
    const a = rows.slice(0, 6)
    const b = rows.slice(6, 12)
    const c = rows.slice(12)
    return [
      { key: "supply", title: "Supply & Market", rows: a },
      { key: "security", title: "Security", rows: b },
      { key: "activity", title: "Activity", rows: c },
    ]
  }, [rows])

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Token Information</h2>
        <Badge variant="outline" className="text-[10px]">Mobula</Badge>
      </div>

      {loading && <div className="text-xs text-muted-foreground">Updating…</div>}

      {/* Mobile: collapsible cards (2-column inside) */}
      <div className="block md:hidden">
        <Accordion type="single" collapsible className="w-full">
          {groups.map((g) => (
            <AccordionItem key={g.key} value={g.key}>
              <AccordionTrigger>{g.title}</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {g.rows.map((r) => (
                    <div key={r.label} className="flex items-start justify-between gap-4 border-b border-border/40 py-2 last:border-b-0">
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{r.label}</div>
                      <div className="text-sm font-medium break-all text-right">
                        {r.isDate ? formatDate(r.value) : formatValue(r.value)}
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Desktop: 3–4 column grid */}
      <Card className="hidden md:block">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-8">
            {Array.from({ length: 3 }).map((_, colIdx) => {
              const colRows = rows.filter((_, i) => i % 3 === colIdx)
              return (
                <div key={`col-${colIdx}`} className="space-y-2">
                  {colRows.map((r) => (
                    <div key={r.label} className="flex items-start justify-between gap-6 border-b border-border/40 py-2 last:border-b-0">
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{r.label}</div>
                      <div className="text-sm font-medium break-all text-right">
                        {r.isDate ? formatDate(r.value) : formatValue(r.value)}
                      </div>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
