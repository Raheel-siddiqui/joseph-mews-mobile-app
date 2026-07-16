// Joseph Mews — Portfolio Insights Engine
// Turns raw portfolio data into 3–5 advisory cards written in plain English.
// Insights are generated deterministically from the underlying portfolio so
// figures stay consistent across the app — never hand-written narrative.

import { properties, portfolio, type Property } from "./data";

export type InsightTone = "neutral" | "positive" | "watch";

export interface Insight {
  id: string;
  tone: InsightTone;
  category: string;        // small label in the eyebrow ("Concentration")
  headline: string;        // 1-line headline
  body: string;            // 1 short supporting line
  metric?: string;         // optional bold number to anchor the card
}

const TARGET_NET_YIELD = 4.0;            // % — investor benchmark
const HIGH_CONCENTRATION_PCT = 50;       // single-city threshold

// ---- helpers ---------------------------------------------------------------

function shortCity(city: string): string {
  // "London W1K" -> "London", "Birmingham B3" -> "Birmingham"
  return city.split(" ")[0];
}

function cityValueShare(): { city: string; pct: number; value: number }[] {
  const map = new Map<string, number>();
  properties.forEach((p) => {
    const c = shortCity(p.city);
    map.set(c, (map.get(c) ?? 0) + p.currentValue);
  });
  const total = portfolio.currentValue;
  const entries: { city: string; value: number; pct: number }[] = [];
  map.forEach((value, city) => {
    entries.push({ city, value, pct: (value / total) * 100 });
  });
  return entries.sort((a, b) => b.pct - a.pct);
}

function avgNetYieldByCity(): { city: string; avg: number; count: number }[] {
  const groups = new Map<string, Property[]>();
  properties.forEach((p) => {
    if (p.status !== "Tenanted") return;
    const c = shortCity(p.city);
    if (!groups.has(c)) groups.set(c, []);
    groups.get(c)!.push(p);
  });
  const out: { city: string; avg: number; count: number }[] = [];
  groups.forEach((ps, city) => {
    const avg =
      ps.reduce((s: number, p: Property) => s + p.netYield, 0) / ps.length;
    out.push({ city, count: ps.length, avg });
  });
  return out.sort((a, b) => b.avg - a.avg);
}

// ---- insight builders ------------------------------------------------------

function concentrationInsight(): Insight | null {
  const shares = cityValueShare();
  const top = shares[0];
  if (!top || top.pct < HIGH_CONCENTRATION_PCT) return null;
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

function regionalYieldInsight(): Insight | null {
  const ys = avgNetYieldByCity();
  if (ys.length < 2) return null;
  const best = ys[0];
  const worst = ys[ys.length - 1];
  if (best.avg - worst.avg < 0.3) return null;
  return {
    id: "regional-yield",
    tone: "positive",
    category: "Regional Performance",
    headline: `${best.city} properties are generating higher yield than ${worst.city}.`,
    body: `${best.city} averages ${best.avg.toFixed(2)}% net vs ${worst.avg.toFixed(
      2
    )}% in ${worst.city}.`,
    metric: `${best.avg.toFixed(2)}%`,
  };
}

function yieldVsTargetInsight(): Insight | null {
  const ny = portfolio.netYield;
  if (ny >= TARGET_NET_YIELD) return null;
  return {
    id: "yield-vs-target",
    tone: "watch",
    category: "Income Performance",
    headline: `Portfolio net yield is below target (${ny.toFixed(
      1
    )}% vs ${TARGET_NET_YIELD.toFixed(0)}% benchmark).`,
    body: `High mortgage costs in London are dragging the headline figure down.`,
    metric: `${ny.toFixed(1)}%`,
  };
}

function growthVsCashInsight(): Insight | null {
  const growthPct = portfolio.totalReturnPct;
  const ny = portfolio.netYield;
  if (growthPct < 5 || ny >= TARGET_NET_YIELD - 1) return null;
  return {
    id: "growth-vs-cash",
    tone: "neutral",
    category: "Capital vs Cash Flow",
    headline: `Strong capital growth, but cash flow is under-performing.`,
    body: `Capital +${growthPct.toFixed(
      1
    )}% since purchase, yet net yield sits at ${ny.toFixed(
      1
    )}% — typical of a growth-weighted portfolio.`,
    metric: `+${growthPct.toFixed(0)}%`,
  };
}

function pipelineInsight(): Insight | null {
  const inBuild = properties.filter((p) => p.status === "In Build");
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

// ---- public API ------------------------------------------------------------

export function getPortfolioInsights(): Insight[] {
  const candidates = [
    concentrationInsight(),
    regionalYieldInsight(),
    yieldVsTargetInsight(),
    growthVsCashInsight(),
    pipelineInsight(),
  ].filter((x): x is Insight => x !== null);

  // Cap at 5 — the order above is editorial priority
  return candidates.slice(0, 5);
}
