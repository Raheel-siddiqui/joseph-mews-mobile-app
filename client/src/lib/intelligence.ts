// Joseph Mews — Portfolio Intelligence Layer
// Derives lightweight insights from the raw property data.
// Pure functions, no UI concerns.
import type { Property } from "./data";
import { getActiveProperties } from "./holdings";

// Use gross yield as the primary performance signal; fall back to capital growth %
function performanceScore(p: Property) {
  if (p.grossYield > 0) return p.grossYield * 1.2 + p.capitalGrowthPct * 0.4;
  return p.capitalGrowthPct * 0.4;
}

export type PortfolioIntelligence = {
  bestPerformer: Property;
  lowestPerformer: Property;
  highestYield: Property | undefined;
  highestCapitalGrowth: Property;
  avgGrossYield: number;
  avgCapitalGrowthPct: number;
};

export function buildIntelligence(
  props: Property[] = getActiveProperties()
): PortfolioIntelligence {
  const incomeProducing = props.filter((p) => p.grossYield > 0);
  const sortedByPerformance = [...props].sort(
    (a, b) => performanceScore(b) - performanceScore(a)
  );
  const sortedByYield = [...incomeProducing].sort(
    (a, b) => b.grossYield - a.grossYield
  );
  const sortedByCapitalGrowth = [...props].sort(
    (a, b) => b.capitalGrowthPct - a.capitalGrowthPct
  );

  const avgGrossYield =
    incomeProducing.length > 0
      ? incomeProducing.reduce((sum, p) => sum + p.grossYield, 0) /
        incomeProducing.length
      : 0;

  const avgCapitalGrowthPct =
    props.length > 0
      ? props.reduce((sum, p) => sum + p.capitalGrowthPct, 0) / props.length
      : 0;

  return {
    bestPerformer: sortedByPerformance[0],
    lowestPerformer: sortedByPerformance[sortedByPerformance.length - 1],
    highestYield: sortedByYield[0],
    highestCapitalGrowth: sortedByCapitalGrowth[0],
    avgGrossYield,
    avgCapitalGrowthPct,
  };
}

/** @deprecated Prefer buildIntelligence() for persona-aware data. */
export const intelligence = buildIntelligence();

export type Signal = "above" | "below" | "neutral";

export function yieldSignal(
  p: Property,
  avgGrossYield = buildIntelligence().avgGrossYield
): Signal {
  if (p.grossYield === 0) return "neutral";
  const diff = p.grossYield - avgGrossYield;
  if (Math.abs(diff) < 0.05) return "neutral";
  return diff > 0 ? "above" : "below";
}

export function yieldDeltaLabel(
  p: Property,
  avgGrossYield = buildIntelligence().avgGrossYield
): string | null {
  if (p.grossYield === 0) return null;
  const diff = p.grossYield - avgGrossYield;
  if (Math.abs(diff) < 0.05) return null;
  const sign = diff > 0 ? "+" : "";
  return `${sign}${diff.toFixed(2)} pts vs avg`;
}

export function getRegionInsight(
  props: Property[] = getActiveProperties()
): string {
  if (props.length < 2) return "";

  const byRegion = new Map<string, Property[]>();
  props.forEach((p) => {
    const region = p.city.split(" ")[0];
    const arr = byRegion.get(region) ?? [];
    arr.push(p);
    byRegion.set(region, arr);
  });

  let topRegion = "";
  let topGrowth = 0;
  byRegion.forEach((regionProps, region) => {
    const growth = regionProps.reduce((sum, p) => sum + p.capitalGrowth, 0);
    if (growth > topGrowth) {
      topGrowth = growth;
      topRegion = region;
    }
  });

  let topYieldRegion = "";
  let topYield = 0;
  byRegion.forEach((regionProps, region) => {
    const earners = regionProps.filter((p) => p.grossYield > 0);
    if (earners.length === 0) return;
    const avg =
      earners.reduce((sum, p) => sum + p.grossYield, 0) / earners.length;
    if (avg > topYield) {
      topYield = avg;
      topYieldRegion = region;
    }
  });

  if (topRegion && topYieldRegion && topRegion !== topYieldRegion) {
    return `${topRegion} is driving most of your capital growth — ${topYieldRegion} leads on yield.`;
  }
  if (topRegion) {
    return `${topRegion} properties are driving most of your portfolio growth.`;
  }
  return "";
}
