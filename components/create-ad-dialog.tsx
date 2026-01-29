"use client"

import type React from "react"

import { useState } from "react"
import { Plus, AlertCircle, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function CreateAdDialog() {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    tokenName: "",
    tokenSymbol: "",
    tokenAddress: "",
    tokenLogo: "",
    description: "",
    walletAddress: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Creating ad with data:", formData)
    // Here would be the logic to burn 1M $DEXPATH and create the ad
    alert("Ad creation would require burning 1M $DEXPATH tokens. Feature coming soon!")
    setOpen(false)
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-[180px] h-10 flex-shrink-0 border-primary/50 hover:border-primary hover:bg-primary/20 text-[10px] font-bold bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg relative overflow-hidden animate-shine transition-all"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Create Ad
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">Create Featured Ad</DialogTitle>
          <DialogDescription className="text-xs">
            Promote your token in the featured ad slots by burning 1M $DEXPATH tokens
          </DialogDescription>
        </DialogHeader>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-start gap-2 mb-4">
          <Flame className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-[10px] text-foreground">
            <p className="font-semibold mb-1">Burn Requirement</p>
            <p className="text-muted-foreground">
              You must burn <span className="text-amber-500 font-bold">1,000,000 $DEXPATH</span> tokens to display your
              ad for 24 hours in the featured slots.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="tokenName" className="text-xs">
              Token Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="tokenName"
              placeholder="e.g., Dexpath"
              value={formData.tokenName}
              onChange={(e) => handleChange("tokenName", e.target.value)}
              required
              className="text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tokenSymbol" className="text-xs">
              Token Symbol <span className="text-red-500">*</span>
            </Label>
            <Input
              id="tokenSymbol"
              placeholder="e.g., DEXPATH"
              value={formData.tokenSymbol}
              onChange={(e) => handleChange("tokenSymbol", e.target.value)}
              required
              className="text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tokenAddress" className="text-xs">
              Token Contract Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="tokenAddress"
              placeholder="e.g., DexPathxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxpump"
              value={formData.tokenAddress}
              onChange={(e) => handleChange("tokenAddress", e.target.value)}
              required
              className="text-xs h-9 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tokenLogo" className="text-xs">
              Token Logo URL <span className="text-red-500">*</span>
            </Label>
            <Input
              id="tokenLogo"
              placeholder="https://example.com/logo.png"
              value={formData.tokenLogo}
              onChange={(e) => handleChange("tokenLogo", e.target.value)}
              required
              className="text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs">
              Description <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Brief description of your token..."
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="text-xs resize-none h-16"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="walletAddress" className="text-xs">
              Your Wallet Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="walletAddress"
              placeholder="Your Solana wallet address"
              value={formData.walletAddress}
              onChange={(e) => handleChange("walletAddress", e.target.value)}
              required
              className="text-xs h-9 font-mono"
            />
            <p className="text-[10px] text-muted-foreground">The wallet that will burn 1M $DEXPATH tokens</p>
          </div>

          <div className="bg-secondary/50 border border-border rounded-lg p-3">
            <div className="flex items-start gap-2 mb-2">
              <AlertCircle className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-[10px] font-medium text-foreground">What happens next?</p>
            </div>
            <ol className="text-[9px] text-muted-foreground space-y-1 ml-5 list-decimal">
              <li>You'll be prompted to approve burning 1M $DEXPATH from your wallet</li>
              <li>Once confirmed, your ad will appear in the featured slots</li>
              <li>Your ad will run for 24 hours from activation time</li>
              <li>After 24h, you can renew by burning another 1M $DEXPATH</li>
            </ol>
          </div>

          <Button type="submit" className="w-full h-9 text-xs font-semibold">
            <Flame className="h-3.5 w-3.5 mr-1.5" />
            Burn 1M $DEXPATH & Create Ad
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
