// Joseph Mews — Portfolio Intelligence Layer
// Derives lightweight insights from the raw property data.
// Pure functions, no UI concerns.
import { properties, type Property } from "./data";

// Only consider properties that are generating yield (exclude In Build / Vacant with 0 yield)
const incomeProducing = properties.filter((p) => p.netYield > 0);

// Use net yield as the primary performance signal; fall back to capital growth %
function performanceScore(p: Property) {
  // Income-producing: weighted blend of net yield and capital growth
  if (p.netYield > 0) return p.netYield * 1.2 + p.capitalGrowthPct * 0.4;
  // In-build: rely on capital growth only
  return p.capitalGrowthPct * 0.4;
}

const sortedByPerformance = [...properties].sort(
  (a, b) => performanceScore(b) - performanceScore(a)
);

const sortedByYield = [...incomeProducing].sort((a, b) => b.netYield - a.netYield);

const sortedByCapitalGrowth = [...properties].sort(
  (a, b) => b.capitalGrowthPct - a.capitalGrowthPct
);

// Average net yield across income-producing properties
const avgNetYield =
  incomeProducing.length > 0
    ? incomeProducing.reduce((sum, p) => sum + p.netYield, 0) / incomeProducing.length
    : 0;

// Average capital growth across all properties (incl. in-build)
const avgCapitalGrowthPct =
  properties.reduce((sum, p) => sum + p.capitalGrowthPct, 0) / properties.length;

export const intelligence = {
  bestPerformer: sortedByPerformance[0],
  lowestPerformer: sortedByPerformance[sortedByPerformance.length - 1],
  highestYield: sortedByYield[0],
  highestCapitalGrowth: sortedByCapitalGrowth[0],
  avgNetYield,
  avgCapitalGrowthPct,
};

// Per-property comparison signal vs portfolio average
export type Signal = "above" | "below" | "neutral";

export function yieldSignal(p: Property): Signal {
  if (p.netYield === 0) return "neutral"; // in-build / vacant — no yield to compare
  // Only flag as "above" / "below" if the difference is meaningful (> 0.05 pts)
  const diff = p.netYield - intelligence.avgNetYield;
  if (Math.abs(diff) < 0.05) return "neutral";
  return diff > 0 ? "above" : "below";
}

export function yieldDeltaLabel(p: Property): string | null {
  if (p.netYield === 0) return null;
  const diff = p.netYield - intelligence.avgNetYield;
  if (Math.abs(diff) < 0.05) return null;
  const sign = diff > 0 ? "+" : "";
  return `${sign}${diff.toFixed(2)} pts vs avg`;
}

// Region-level insight — derives a one-line headline from the data
export function getRegionInsight(): string {
  // Group properties by city stem (first word)
  const byRegion = new Map<string, Property[]>();
  properties.forEach((p) => {
    const region = p.city.split(" ")[0]; // London, Manchester, Birmingham, Liverpool
    const arr = byRegion.get(region) ?? [];
    arr.push(p);
    byRegion.set(region, arr);
  });

  // Find region with highest aggregate capital growth
  let topRegion = "";
  let topGrowth = 0;
  byRegion.forEach((props, region) => {
    const growth = props.reduce((sum, p) => sum + p.capitalGrowth, 0);
    if (growth > topGrowth) {
      topGrowth = growth;
      topRegion = region;
    }
  });

  // Find region with highest avg yield (income-producing only)
  let topYieldRegion = "";
  let topYield = 0;
  byRegion.forEach((props, region) => {
    const earners = props.filter((p) => p.netYield > 0);
    if (earners.length === 0) return;
    const avg = earners.reduce((sum, p) => sum + p.grossYield, 0) / earners.length;
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
