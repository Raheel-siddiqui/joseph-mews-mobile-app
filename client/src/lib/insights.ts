// Joseph Mews — Portfolio Insights Engine
// Turns raw portfolio data into 3–5 advisory cards written in plain English.
// Insights are generated deterministically from the underlying portfolio so
// figures stay consistent across the app — never hand-written narrative.

import type { Property } from "./data";
import {
  getActivePortfolio,
  getActiveProperties,
  type PortfolioSnapshot,
} from "./holdings";

export type InsightTone = "neutral" | "positive" | "watch";

export interface Insight {
  id: string;
  tone: InsightTone;
  category: string;
  headline: string;
  body: string;
  metric?: string;
}

const TARGET_GROSS_YIELD = 5.0;
const HIGH_CONCENTRATION_PCT = 50;

function shortCity(city: string): string {
  return city.split(" ")[0];
}

function cityValueShare(
  props: Property[],
  totalValue: number
): { city: string; pct: number; value: number }[] {
  const map = new Map<string, number>();
  props.forEach((p) => {
    const c = shortCity(p.city);
    map.set(c, (map.get(c) ?? 0) + p.currentValue);
  });
  const entries: { city: string; value: number; pct: number }[] = [];
  map.forEach((value, city) => {
    entries.push({
      city,
      value,
      pct: totalValue > 0 ? (value / totalValue) * 100 : 0,
    });
  });
  return entries.sort((a, b) => b.pct - a.pct);
}

function avgGrossYieldByCity(
  props: Property[]
): { city: string; avg: number; count: number }[] {
  const groups = new Map<string, Property[]>();
  props.forEach((p) => {
    if (p.status !== "Tenanted") return;
    const c = shortCity(p.city);
    if (!groups.has(c)) groups.set(c, []);
    groups.get(c)!.push(p);
  });
  const out: { city: string; avg: number; count: number }[] = [];
  groups.forEach((ps, city) => {
    const avg =
      ps.reduce((s: number, p: Property) => s + p.grossYield, 0) / ps.length;
    out.push({ city, count: ps.length, avg });
  });
  return out.sort((a, b) => b.avg - a.avg);
}

function concentrationInsight(
  props: Property[],
  snap: PortfolioSnapshot
): Insight | null {
  const shares = cityValueShare(props, snap.currentValue);
  const top = shares[0];
  if (!top || top.pct < HIGH_CONCENTRATION_PCT) return null;

  if (props.length === 1) {
    return {
      id: "concentration",
      tone: "watch",
      category: "Single holding",
      headline: `Your entire portfolio sits in one ${top.city} property.`,
      body: `A second holding in another region would diversify market exposure.`,
      metric: `100%`,
    };
  }

  return {
    id: "concentration",
    tone: "watch",
    category: "Concentration",
    headline: `Your portfolio is heavily weighted toward ${top.city} (${Math.round(
      top.pct
    )}%).`,
    body: `Diversifying into a second region could reduce single-market exposure.`,
    metric: `${Math.round(top.pct)}%`,
  };
}

function regionalYieldInsight(props: Property[]): Insight | null {
  const ys = avgGrossYieldByCity(props);
  if (ys.length < 2) return null;
  const best = ys[0];
  const worst = ys[ys.length - 1];
  if (best.avg - worst.avg < 0.3) return null;
  return {
    id: "regional-yield",
    tone: "positive",
    category: "Regional Performance",
    headline: `${best.city} properties are generating higher yield than ${worst.city}.`,
    body: `${best.city} averages ${best.avg.toFixed(2)}% gross vs ${worst.avg.toFixed(
      2
    )}% in ${worst.city}.`,
    metric: `${best.avg.toFixed(2)}%`,
  };
}

function yieldVsTargetInsight(snap: PortfolioSnapshot): Insight | null {
  const gy = snap.grossYield;
  if (gy >= TARGET_GROSS_YIELD) return null;
  return {
    id: "yield-vs-target",
    tone: "watch",
    category: "Income Performance",
    headline: `Gross yield is below target (${gy.toFixed(
      1
    )}% vs ${TARGET_GROSS_YIELD.toFixed(0)}% benchmark).`,
    body: `Review rental income and acquisition pricing with your advisor.`,
    metric: `${gy.toFixed(1)}%`,
  };
}

function growthVsCashInsight(snap: PortfolioSnapshot): Insight | null {
  const growthPct = snap.totalReturnPct;
  const gy = snap.grossYield;
  if (growthPct < 5 || gy >= TARGET_GROSS_YIELD - 1) return null;
  return {
    id: "growth-vs-cash",
    tone: "neutral",
    category: "Capital vs Cash Flow",
    headline: `Strong capital growth, but cash flow is under-performing.`,
    body: `Capital +${growthPct.toFixed(
      1
    )}% since purchase, yet gross yield sits at ${gy.toFixed(
      1
    )}% — typical of a growth-weighted holding.`,
    metric: `+${growthPct.toFixed(0)}%`,
  };
}

function pipelineInsight(props: Property[]): Insight | null {
  const inBuild = props.filter((p) => p.status === "In Build");
  if (inBuild.length === 0) return null;
  const expectedAnnualRent = inBuild.reduce(
    (s, p) => s + (p.expectedRent ?? 0) * 12,
    0
  );
  if (expectedAnnualRent === 0) return null;
  return {
    id: "pipeline",
    tone: "positive",
    category: "Pipeline",
    headline: `${inBuild.length} ${
      inBuild.length === 1 ? "property" : "properties"
    } in build will lift annual rent on completion.`,
    body: `An estimated +£${(
      expectedAnnualRent / 1000
    ).toFixed(1)}k of new gross income is queued for the next 12–18 months.`,
    metric: `+£${(expectedAnnualRent / 1000).toFixed(0)}k`,
  };
}

export function getPortfolioInsights(
  props: Property[] = getActiveProperties(),
  snap: PortfolioSnapshot = getActivePortfolio()
): Insight[] {
  const candidates = [
    concentrationInsight(props, snap),
    regionalYieldInsight(props),
    yieldVsTargetInsight(snap),
    growthVsCashInsight(snap),
    pipelineInsight(props),
  ].filter((x): x is Insight => x !== null);

  return candidates.slice(0, 5);
}
