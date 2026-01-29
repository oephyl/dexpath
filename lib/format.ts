export function formatPrice(price: number): string {
  if (price >= 1) {
    return `$${price.toFixed(2)}`
  } else if (price >= 0.01) {
    return `$${price.toFixed(4)}`
  } else if (price >= 0.0001) {
    return `$${price.toFixed(6)}`
  } else {
    // For very small numbers, use compact notation like $0.0{5}123
    const priceStr = price.toFixed(20) // Get enough decimals
    const match = priceStr.match(/^0\.0+/)

    if (match) {
      const zeros = match[0].length - 2 // Subtract "0."
      if (zeros >= 4) {
        const afterZeros = priceStr.slice(match[0].length).slice(0, 3) // Get first 3 significant digits
        return `$0.0{${zeros}}${afterZeros}`
      }
    }

    return `$${price.toFixed(8)}`
  }
}

export function formatMarketCap(mc: number): string {
  if (mc >= 1000000) {
    return `$${(mc / 1000000).toFixed(2)}M`
  } else if (mc >= 1000) {
    return `$${(mc / 1000).toFixed(0)}K`
  } else {
    return `$${mc.toFixed(0)}`
  }
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `$${(num / 1000000).toFixed(2)}M`
  } else if (num >= 1000) {
    return `$${(num / 1000).toFixed(0)}K`
  } else {
    return `$${num.toFixed(0)}`
  }
}
