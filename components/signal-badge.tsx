import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import { Zap, Megaphone, BarChart3, Users, Link2, TrendingUp, Trophy, Target, type LucideIcon } from "lucide-react"
import type { SignalType } from "@/lib/mock"

interface SignalBadgeProps {
  type: SignalType
  className?: string
  size?: "sm" | "default"
  iconOnly?: boolean
  boostCount?: number
}

const signalConfig: Record<
  SignalType,
  { label: string; icon: LucideIcon; variant: "paid" | "narrative" | "momentum" }
> = {
  DEXBOOST_PAID: { label: "DexBoost Paid", icon: Zap, variant: "paid" },
  DEXAD_PAID: { label: "DexAD Paid", icon: Megaphone, variant: "paid" },
  DEXBAR_PAID: { label: "DexBar Paid", icon: BarChart3, variant: "paid" },
  CTO: { label: "CTO", icon: Users, variant: "narrative" },
  UPDATE_SOCIAL: { label: "Update Social", icon: Link2, variant: "narrative" },
  PRICE_UP: { label: "Price Up", icon: TrendingUp, variant: "momentum" },
  ATH: { label: "ATH", icon: Trophy, variant: "momentum" },
  KEY_MC: { label: "Key MC", icon: Target, variant: "momentum" },
}

export function SignalBadge({ type, className, size = "default", iconOnly = false, boostCount }: SignalBadgeProps) {
  const config = signalConfig[type]
  const Icon = config.icon

  const variantStyles = {
    paid:
      type === "DEXBOOST_PAID"
        ? "border-amber-500/50 bg-amber-500/10 text-amber-400"
        : "border-primary/50 bg-primary/10 text-primary",
    narrative: "border-violet-500/50 bg-violet-500/10 text-violet-400",
    momentum: "border-cyan-500/50 bg-cyan-500/10 text-cyan-400",
  }

  const sizeStyles = {
    sm: iconOnly ? "p-1" : "gap-1 px-1.5 py-0.5 text-[10px]",
    default: iconOnly ? "p-1.5" : "gap-1.5",
  }

  const iconSize = size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3"

  return (
    <TooltipProvider>
      {iconOnly ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className={`${variantStyles[config.variant]} ${sizeStyles[size]} ${className || ""} cursor-help`}
            >
              <Icon className={iconSize} />
              {type === "DEXBOOST_PAID" && boostCount && (
                <span className="text-[10px] font-bold ml-0.5">{boostCount}x</span>
              )}
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-card border border-border text-foreground">
            <p className="text-xs font-medium">
              {config.label}
              {type === "DEXBOOST_PAID" && boostCount && ` (${boostCount}x)`}
            </p>
          </TooltipContent>
        </Tooltip>
      ) : (
        <Badge variant="outline" className={`${variantStyles[config.variant]} ${sizeStyles[size]} ${className || ""}`}>
          <Icon className={iconSize} />
          <span className={size === "sm" ? "text-[10px] font-medium" : "text-xs font-medium"}>
            {config.label}
            {type === "DEXBOOST_PAID" && boostCount && ` (${boostCount}x)`}
          </span>
        </Badge>
      )}
    </TooltipProvider>
  )
}
