// Rugcheck Internal Trust Score
// Pure function — no side effects

export type TrustLabel =
  | "Very Dangerous"
  | "Risky"
  | "Moderate"
  | "Safe"
  | "Very Safe";

export interface TrustScoreResult {
  score: number;
  label: TrustLabel;
  breakdown: {
    contract: number;
    liquidity: number;
    holders: number;
    creator: number;
    market: number;
  };
}

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(n, max));

export function calculateRugcheckTrustScore(r: any): TrustScoreResult {
  // =========================
  // 1 CONTRACT SAFETY (25)
  // =========================
  let contract = 0;
  if (r?.mintAuthority === null) contract += 8;
  if (r?.freezeAuthority === null) contract += 8;
  if (r?.tokenMeta?.mutable === false) contract += 5;
  if ((r?.transferFee?.pct ?? 0) === 0) contract += 4;
  contract = clamp(contract, 0, 25);

  // =========================
  // 2 LIQUIDITY SAFETY (25)
  // =========================
  let liquidity = 0;
  const lpLockedPct = r?.markets?.[0]?.lp?.lpLockedPct ?? 0;
  const liquidityUSD = r?.totalMarketLiquidity ?? 0;
  const lpProviders = r?.totalLPProviders ?? 0;

  if (lpLockedPct >= 95) liquidity += 12;
  else if (lpLockedPct >= 80) liquidity += 8;
  else if (lpLockedPct >= 50) liquidity += 4;

  if (liquidityUSD >= 500000) liquidity += 8;
  else if (liquidityUSD >= 150000) liquidity += 6;
  else if (liquidityUSD >= 50000) liquidity += 4;
  else if (liquidityUSD >= 20000) liquidity += 2;

  if (lpProviders >= 50) liquidity += 5;
  else if (lpProviders >= 20) liquidity += 3;
  else if (lpProviders >= 5) liquidity += 1;
  else liquidity -= 5;

  liquidity = clamp(liquidity, 0, 25);

  // =========================
  // 3 HOLDERS (20)
  // =========================
  let holdersScore = 0;
  const holders = r?.totalHolders ?? 0;
  const topHolderPct = r?.topHolders?.[0]?.pct ?? 100;

  const top10Pct =
    r?.topHolders?.slice(0, 10).reduce((a: number, b: any) => a + b.pct, 0) ?? 100;

  if (topHolderPct < 2) holdersScore += 8;
  else if (topHolderPct < 5) holdersScore += 5;
  else if (topHolderPct < 10) holdersScore += 2;

  if (top10Pct < 15) holdersScore += 6;
  else if (top10Pct < 25) holdersScore += 4;
  else if (top10Pct < 40) holdersScore += 2;

  if (holders >= 10000) holdersScore += 6;
  else if (holders >= 5000) holdersScore += 4;
  else if (holders >= 1000) holdersScore += 2;

  holdersScore = clamp(holdersScore, 0, 20);

  // =========================
  // 4 CREATOR RISK (15)
  // =========================
  let creator = 0;
  if ((r?.creatorBalance ?? 0) === 0) creator += 7;
  if ((r?.graphInsidersDetected ?? 1) === 0) creator += 5;
  creator = clamp(creator, 0, 15);

  // =========================
  // 5 MARKET FLAGS (15)
  // =========================
  let market = 15;
  (r?.risks ?? []).forEach((risk: any) => {
    if (risk.level === "warn") market -= 3;
    if (risk.level === "danger") market -= 6;
  });

  if ((r?.score_normalised ?? 100) < 20) market -= 5;
  if (r?.launchpad?.platform === "pump_fun") market -= 3;

  market = clamp(market, 0, 15);

  const total = clamp(
    Math.round(contract + liquidity + holdersScore + creator + market),
    0,
    100
  );

  const label: TrustLabel =
    total <= 25
      ? "Very Dangerous"
      : total <= 50
      ? "Risky"
      : total <= 70
      ? "Moderate"
      : total <= 85
      ? "Safe"
      : "Very Safe";

  return {
    score: total,
    label,
    breakdown: {
      contract,
      liquidity,
      holders: holdersScore,
      creator,
      market,
    },
  };
}

export const getTrustColor = (score: number) => {
  if (score < 25) return "bg-red-500";
  if (score < 50) return "bg-orange-500";
  if (score < 70) return "bg-yellow-400";
  if (score < 85) return "bg-lime-500";
  return "bg-green-500";
};
