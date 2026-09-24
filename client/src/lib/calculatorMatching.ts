// Calculator match eligibility, style ranking, and deterministic fit reasons.
// Pure client-side rules — no invented metrics; ready to move server-side later.

import { fmt } from "@/lib/data";
import type { Opportunity } from "@/lib/explore";
import {
  buyingPowerFromCapital,
  contributionForProperty,
  financeRoutesToRun,
  type FinanceRoute,
  type GoalContribution,
  type PlanContext,
  type ScoreWeights,
} from "@/lib/investorJourney";

export type InvestmentStyle =
  | "Income Focused"
  | "Growth Focused"
  | "Balanced"
  | "Not Sure";

export type FitLabel = "Best Fit" | "Strong Fit" | "Alternative";

export type FitReasonCode =
  | "within_buying_power"
  | "lower_cash_than_deposit"
  | "stronger_gross_yield"
  | "stronger_projected_growth"
  | "balances_income_growth"
  | "stronger_net_income"
  | "affordability_headroom"
  | "diversifies_portfolio"
  | "income_contribution"
  | "value_contribution";

export interface FitReason {
  code: FitReasonCode;
  copy: string;
}

export interface MatchResult {
  opportunity: Opportunity;
  fitLabel: FitLabel;
  reasons: FitReason[];
  cashRequired: number;
  stretchGap: number | null; // null = exact match; else £ over budget
}

export interface MatchInput {
  opportunities: Opportunity[];
  budget: number;
  deposit: number;
  style: InvestmentStyle;
  horizonYears: number;
  isMortgage: boolean;
  ltv: number;
  sdltRate: number;
  legalFees?: number;
  cityFilter?: string | null;
  developmentFilter?: string | null;
  maxExact?: number;
  maxStretch?: number;
}

const LEGAL_FEES_DEFAULT = 2500;

export function estimateCashRequired(
  price: number,
  opts: {
    isMortgage: boolean;
    ltv: number;
    sdltRate: number;
    legalFees?: number;
  },
): number {
  const legal = opts.legalFees ?? LEGAL_FEES_DEFAULT;
  const loan = opts.isMortgage ? Math.round(price * (opts.ltv / 100)) : 0;
  const cashDeposit = price - loan;
  const sdlt = Math.round(price * opts.sdltRate);
  return cashDeposit + sdlt + legal;
}

function growthOverHorizon(o: Opportunity, horizonYears: number): number | null {
  if (!Number.isFinite(o.capitalGrowth5Y)) return null;
  // Scale 5Y forecast linearly to selected horizon (illustrative).
  return (o.capitalGrowth5Y / 5) * horizonYears;
}

function isEligibleExact(
  o: Opportunity,
  input: MatchInput,
  cashRequired: number,
): boolean {
  if (o.status === "Sold Out") return false;
  if (input.isMortgage) {
    return o.fromPrice <= input.budget;
  }
  // Cash: full cash required (price + SDLT + fees) must fit deposit.
  return cashRequired <= input.deposit;
}

function passesFilters(o: Opportunity, input: MatchInput): boolean {
  if (input.cityFilter && input.cityFilter !== "All" && o.city !== input.cityFilter) {
    return false;
  }
  if (input.developmentFilter && o.id !== input.developmentFilter) {
    return false;
  }
  return true;
}

function compareByStyle(
  a: Opportunity,
  b: Opportunity,
  style: InvestmentStyle,
  horizonYears: number,
  cashA: number,
  cashB: number,
): number {
  const yieldDiff = b.grossYield - a.grossYield;
  const growthA = growthOverHorizon(a, horizonYears);
  const growthB = growthOverHorizon(b, horizonYears);
  const growthDiff =
    growthA == null && growthB == null
      ? 0
      : growthA == null
        ? 1
        : growthB == null
          ? -1
          : growthB - growthA;

  if (style === "Income Focused") {
    if (yieldDiff !== 0) return yieldDiff;
    return growthDiff;
  }
  if (style === "Growth Focused") {
    if (growthDiff !== 0) return growthDiff;
    return yieldDiff;
  }
  // Balanced / Not Sure: combined income + growth, then lowest cash required.
  const score = (o: Opportunity, g: number | null) =>
    o.grossYield + (g ?? 0) / Math.max(horizonYears, 1);
  const scoreDiff =
    score(b, growthB) - score(a, growthA);
  if (scoreDiff !== 0) return scoreDiff;
  return cashA - cashB;
}

function buildReasons(
  o: Opportunity,
  ranked: Opportunity[],
  input: MatchInput,
  cashRequired: number,
  isStretch: boolean,
): FitReason[] {
  const reasons: FitReason[] = [];
  const peers = ranked.filter((p) => p.id !== o.id);

  if (!isStretch && o.fromPrice <= input.budget) {
    reasons.push({
      code: "within_buying_power",
      copy: "Fits within estimated buying power",
    });
  }

  if (cashRequired < input.deposit) {
    const gap = input.deposit - cashRequired;
    reasons.push({
      code: "lower_cash_than_deposit",
      copy: `Requires ${fmt.currency(gap)} less than available deposit`,
    });
  }

  const maxYield = Math.max(...ranked.map((p) => p.grossYield), o.grossYield);
  if (o.grossYield >= maxYield && peers.some((p) => p.grossYield < o.grossYield)) {
    reasons.push({
      code: "stronger_gross_yield",
      copy: "Stronger gross yield among eligible options",
    });
  }

  const growths = ranked
    .map((p) => ({ id: p.id, g: growthOverHorizon(p, input.horizonYears) }))
    .filter((x): x is { id: string; g: number } => x.g != null);
  const ownGrowth = growthOverHorizon(o, input.horizonYears);
  if (ownGrowth != null && growths.length > 1) {
    const maxG = Math.max(...growths.map((x) => x.g));
    if (ownGrowth >= maxG) {
      reasons.push({
        code: "stronger_projected_growth",
        copy: `Stronger projected growth over ${input.horizonYears} years`,
      });
    }
  }

  if (
    (input.style === "Balanced" || input.style === "Not Sure") &&
    reasons.length < 3
  ) {
    reasons.push({
      code: "balances_income_growth",
      copy: "Balances income and growth",
    });
  }

  // Always at least one data-backed reason.
  if (reasons.length === 0) {
    reasons.push({
      code: "within_buying_power",
      copy: isStretch
        ? `Near your budget · ${fmt.currency(o.fromPrice - input.budget)} above`
        : "Fits within estimated buying power",
    });
  }

  return reasons.slice(0, 3);
}

function fitLabelForIndex(index: number): FitLabel {
  if (index === 0) return "Best Fit";
  if (index === 1) return "Strong Fit";
  return "Alternative";
}

/**
 * Exact matches (price/cash within affordability), ranked by style, max N.
 * Optional stretch: nearest over-budget options, clearly labelled.
 */
export function matchOpportunities(input: MatchInput): {
  exact: MatchResult[];
  stretch: MatchResult[];
} {
  const legalFees = input.legalFees ?? LEGAL_FEES_DEFAULT;
  const maxExact = input.maxExact ?? 3;
  const maxStretch = input.maxStretch ?? 3;

  const withCash = input.opportunities
    .filter((o) => o.status !== "Sold Out")
    .filter((o) => passesFilters(o, input))
    .map((o) => ({
      opportunity: o,
      cashRequired: estimateCashRequired(o.fromPrice, {
        isMortgage: input.isMortgage,
        ltv: input.ltv,
        sdltRate: input.sdltRate,
        legalFees,
      }),
    }));

  const exactPool = withCash.filter(({ opportunity, cashRequired }) =>
    isEligibleExact(opportunity, input, cashRequired),
  );

  const exactSorted = [...exactPool].sort((a, b) =>
    compareByStyle(
      a.opportunity,
      b.opportunity,
      input.style,
      input.horizonYears,
      a.cashRequired,
      b.cashRequired,
    ),
  );

  const exactOpps = exactSorted.map((x) => x.opportunity);
  const exact: MatchResult[] = exactSorted.slice(0, maxExact).map((row, i) => ({
    opportunity: row.opportunity,
    cashRequired: row.cashRequired,
    stretchGap: null,
    fitLabel: fitLabelForIndex(i),
    reasons: buildReasons(
      row.opportunity,
      exactOpps,
      input,
      row.cashRequired,
      false,
    ),
  }));

  const exactIds = new Set(exact.map((m) => m.opportunity.id));
  const stretchPool = withCash
    .filter(({ opportunity }) => !exactIds.has(opportunity.id))
    .filter(({ opportunity, cashRequired }) => {
      if (input.isMortgage) return opportunity.fromPrice > input.budget;
      return cashRequired > input.deposit;
    })
    .map((row) => ({
      ...row,
      gap: input.isMortgage
        ? row.opportunity.fromPrice - input.budget
        : row.cashRequired - input.deposit,
    }))
    .sort((a, b) => a.gap - b.gap);

  const stretch: MatchResult[] = stretchPool.slice(0, maxStretch).map((row) => ({
    opportunity: row.opportunity,
    cashRequired: row.cashRequired,
    stretchGap: row.gap,
    fitLabel: "Alternative" as const,
    reasons: buildReasons(
      row.opportunity,
      stretchPool.map((s) => s.opportunity),
      input,
      row.cashRequired,
      true,
    ),
  }));

  return { exact, stretch };
}

/** Reasons for a single already-selected opportunity (Returns step). */
export function reasonsForOpportunity(
  opportunity: Opportunity,
  input: MatchInput,
): FitReason[] {
  const { exact, stretch } = matchOpportunities({
    ...input,
    maxExact: 50,
    maxStretch: 50,
  });
  const hit =
    exact.find((m) => m.opportunity.id === opportunity.id) ??
    stretch.find((m) => m.opportunity.id === opportunity.id);
  if (hit) return hit.reasons;

  const cashRequired = estimateCashRequired(opportunity.fromPrice, {
    isMortgage: input.isMortgage,
    ltv: input.ltv,
    sdltRate: input.sdltRate,
    legalFees: input.legalFees,
  });
  return buildReasons(opportunity, [opportunity], input, cashRequired, false);
}

/* ---------- Goal-weighted plan matching (Personalised Investor Journey) ---------- */

export interface PlanMatch {
  opportunity: Opportunity;
  fitLabel: FitLabel;
  reasons: FitReason[];
  cashRequired: number;
  stretchGap: number | null;
  route: FinanceRoute;
  goalScore: number;
  incomeScore: number;
  growthScore: number;
  affordabilityScore: number;
  diversificationScore: number | null;
  netMonthlyIncome: number;
  projectedValue: number;
  contribution: GoalContribution;
}

export interface PlanMatchInput {
  opportunities: Opportunity[];
  ctx: PlanContext;
  ltv: number;
  sdltRate: number;
  legalFees?: number;
  ownedCities?: string[];
  cityFilter?: string | null;
  developmentFilter?: string | null;
}

function cityKey(value: string): string {
  return value.split(/[\s,]/)[0]?.toLowerCase() ?? value.toLowerCase();
}

function diversificationScore(
  opportunity: Opportunity,
  ownedCities: string[] | undefined,
): number | null {
  if (!ownedCities || ownedCities.length === 0) return null;
  const owned = new Set(ownedCities.map(cityKey));
  const city = cityKey(opportunity.city);
  if (!owned.has(city)) return 100;
  return 0;
}

function growthPctAtHorizon(o: Opportunity, horizonYears: number): number | null {
  if (!Number.isFinite(o.capitalGrowth5Y)) return null;
  return (Math.pow(1 + o.capitalGrowth5Y / 100, horizonYears / 5) - 1) * 100;
}

function netMonthlyFromOpportunity(o: Opportunity): number {
  return Math.round((o.fromPrice * (o.netYield / 100)) / 12);
}

function projectedValueAtHorizon(o: Opportunity, horizonYears: number): number {
  const pct = growthPctAtHorizon(o, horizonYears);
  if (pct == null) return o.fromPrice;
  return Math.round(o.fromPrice * (1 + pct / 100));
}

/** Higher-is-better percentile: best = 100, worst = 0. Average rank for ties. */
function percentileScores(values: number[]): number[] {
  const n = values.length;
  if (n === 0) return [];
  if (n === 1) return [100];
  const indexed = values.map((v, i) => ({ v, i }));
  indexed.sort((a, b) => b.v - a.v);
  const ranks = Array<number>(n).fill(0);
  let i = 0;
  while (i < n) {
    let j = i;
    while (j + 1 < n && indexed[j + 1].v === indexed[i].v) j += 1;
    const avgRank = (i + 1 + j + 1) / 2;
    for (let k = i; k <= j; k++) ranks[indexed[k].i] = avgRank;
    i = j + 1;
  }
  return ranks.map((r) => (100 * (n - r)) / (n - 1));
}

function combineWeighted(
  parts: { score: number | null; weight: number }[],
): number {
  const usable = parts.filter(
    (p): p is { score: number; weight: number } =>
      p.score != null && p.weight > 0,
  );
  const total = usable.reduce((sum, p) => sum + p.weight, 0);
  if (total <= 0) return 0;
  return usable.reduce((sum, p) => sum + (p.score * p.weight) / total, 0);
}

function isAvailable(o: Opportunity): boolean {
  return o.status === "Available";
}

function passesPlanFilters(
  o: Opportunity,
  input: PlanMatchInput,
): boolean {
  if (input.cityFilter && input.cityFilter !== "All" && o.city !== input.cityFilter) {
    return false;
  }
  if (input.developmentFilter && o.id !== input.developmentFilter) {
    return false;
  }
  return true;
}

function eligibleForRoute(
  o: Opportunity,
  route: FinanceRoute,
  input: PlanMatchInput,
  cashRequired: number,
): boolean {
  if (!isAvailable(o) || !passesPlanFilters(o, input)) return false;
  if (route === "Mortgage") {
    const budget = buyingPowerFromCapital(input.ctx.safeCapital, true, input.ltv);
    return o.fromPrice <= budget && cashRequired <= input.ctx.safeCapital;
  }
  return cashRequired <= input.ctx.safeCapital;
}

function scoreEligible(
  rows: {
    opportunity: Opportunity;
    cashRequired: number;
    route: FinanceRoute;
  }[],
  input: PlanMatchInput,
  weights: ScoreWeights,
): PlanMatch[] {
  if (rows.length === 0) return [];
  const horizon = input.ctx.horizon;
  const net = rows.map((r) => netMonthlyFromOpportunity(r.opportunity));
  const yields = rows.map((r) => r.opportunity.grossYield);
  const growthPct = rows.map((r) => growthPctAtHorizon(r.opportunity, horizon) ?? 0);
  const growthGbp = rows.map((r, i) => {
    const pct = growthPctAtHorizon(r.opportunity, horizon);
    return pct == null ? 0 : Math.round(r.opportunity.fromPrice * (pct / 100));
  });
  const incomeRank = percentileScores(net);
  const yieldRank = percentileScores(yields);
  const growthPctRank = percentileScores(growthPct);
  const growthGbpRank = percentileScores(growthGbp);

  const scored = rows.map((row, i) => {
    const o = row.opportunity;
    const incomeScore = combineWeighted([
      { score: incomeRank[i], weight: 70 },
      { score: yieldRank[i], weight: 30 },
    ]);
    const growthScore = combineWeighted([
      { score: growthPctRank[i], weight: 70 },
      { score: growthGbpRank[i], weight: 30 },
    ]);
    const headroom = input.ctx.safeCapital - row.cashRequired;
    const affordabilityScore = Math.max(
      0,
      Math.min(100, (headroom / Math.max(input.ctx.safeCapital, 1)) * 100),
    );
    const diversification = diversificationScore(o, input.ownedCities);
    const goalScore = combineWeighted([
      { score: incomeScore, weight: weights.income },
      { score: growthScore, weight: weights.growth },
      { score: affordabilityScore, weight: weights.affordability },
      { score: diversification, weight: weights.diversification },
    ]);
    const projectedValue = projectedValueAtHorizon(o, horizon);
    const netMonthlyIncome = net[i];
    return {
      opportunity: o,
      cashRequired: row.cashRequired,
      stretchGap: null as number | null,
      route: row.route,
      goalScore,
      incomeScore,
      growthScore,
      affordabilityScore,
      diversificationScore: diversification,
      netMonthlyIncome,
      projectedValue,
      contribution: contributionForProperty(
        input.ctx,
        netMonthlyIncome,
        projectedValue,
      ),
      fitLabel: "Alternative" as FitLabel,
      reasons: [] as FitReason[],
    };
  });

  scored.sort((a, b) => {
    if (b.goalScore !== a.goalScore) return b.goalScore - a.goalScore;
    if (b.affordabilityScore !== a.affordabilityScore) {
      return b.affordabilityScore - a.affordabilityScore;
    }
    return a.cashRequired - b.cashRequired;
  });

  const best = scored[0]?.goalScore ?? 0;
  return scored.map((row, index) => {
    const fitLabel: FitLabel =
      index === 0
        ? "Best Fit"
        : best - row.goalScore <= 10
          ? "Strong Fit"
          : "Alternative";
    return {
      ...row,
      fitLabel,
      reasons: planReasons(row, input.ctx.horizon, fitLabel),
    };
  });
}

function planReasons(
  row: PlanMatch,
  horizon: number,
  fitLabel: FitLabel,
): FitReason[] {
  const reasons: FitReason[] = [];
  const components: { key: FitReasonCode; score: number; copy: string }[] = [
    {
      key: "stronger_net_income",
      score: row.incomeScore,
      copy: "One of the stronger net-income options available within your current buying power.",
    },
    {
      key: "stronger_projected_growth",
      score: row.growthScore,
      copy: `Projects stronger capital growth over your selected ${horizon}-year horizon.`,
    },
    {
      key: "affordability_headroom",
      score: row.affordabilityScore,
      copy: "Fits your current capital while leaving more headroom than other eligible options.",
    },
  ];
  if (row.diversificationScore != null) {
    components.push({
      key: "diversifies_portfolio",
      score: row.diversificationScore,
      copy: "Adds exposure to a market not currently represented in your Mews One portfolio.",
    });
  }
  components.sort((a, b) => b.score - a.score);
  for (const c of components) {
    if (c.score < 40) continue;
    if (c.key === "diversifies_portfolio" && (row.diversificationScore ?? 0) < 100) {
      continue;
    }
    reasons.push({ code: c.key, copy: c.copy });
    if (reasons.length >= 2) break;
  }

  if (
    row.contribution.kind !== "none" &&
    !row.contribution.alreadyMet &&
    row.contribution.ratio != null
  ) {
    reasons.push({
      code:
        row.contribution.kind === "income"
          ? "income_contribution"
          : "value_contribution",
      copy: row.contribution.copy,
    });
  }

  if (reasons.length === 0) {
    reasons.push({
      code: "within_buying_power",
      copy:
        fitLabel === "Best Fit"
          ? "Fits within estimated buying power for the selected goal."
          : "Fits within estimated buying power.",
    });
  }

  return reasons.slice(0, 3);
}

function collectRouteRows(
  route: FinanceRoute,
  input: PlanMatchInput,
): {
  opportunity: Opportunity;
  cashRequired: number;
  route: FinanceRoute;
}[] {
  const legalFees = input.legalFees ?? LEGAL_FEES_DEFAULT;
  const isMortgage = route === "Mortgage";
  return input.opportunities
    .filter(isAvailable)
    .filter((o) => passesPlanFilters(o, input))
    .map((o) => ({
      opportunity: o,
      cashRequired: estimateCashRequired(o.fromPrice, {
        isMortgage,
        ltv: input.ltv,
        sdltRate: input.sdltRate,
        legalFees,
      }),
      route,
    }))
    .filter((row) =>
      eligibleForRoute(row.opportunity, route, input, row.cashRequired),
    );
}

function stretchForRoute(
  route: FinanceRoute,
  input: PlanMatchInput,
  exactIds: Set<string>,
): PlanMatch[] {
  const legalFees = input.legalFees ?? LEGAL_FEES_DEFAULT;
  const isMortgage = route === "Mortgage";
  const budget = buyingPowerFromCapital(input.ctx.safeCapital, isMortgage, input.ltv);
  const pool = input.opportunities
    .filter(isAvailable)
    .filter((o) => passesPlanFilters(o, input))
    .filter((o) => !exactIds.has(`${route}:${o.id}`))
    .map((o) => {
      const cashRequired = estimateCashRequired(o.fromPrice, {
        isMortgage,
        ltv: input.ltv,
        sdltRate: input.sdltRate,
        legalFees,
      });
      const gap = isMortgage
        ? Math.max(0, o.fromPrice - budget)
        : Math.max(0, cashRequired - input.ctx.safeCapital);
      return { opportunity: o, cashRequired, gap, route };
    })
    .filter((row) => row.gap > 0)
    .sort((a, b) => a.gap - b.gap)
    .slice(0, 3);

  return pool.map((row) => {
    const netMonthlyIncome = netMonthlyFromOpportunity(row.opportunity);
    const projectedValue = projectedValueAtHorizon(
      row.opportunity,
      input.ctx.horizon,
    );
    return {
      opportunity: row.opportunity,
      cashRequired: row.cashRequired,
      stretchGap: row.gap,
      route: row.route,
      goalScore: 0,
      incomeScore: 0,
      growthScore: 0,
      affordabilityScore: 0,
      diversificationScore: diversificationScore(row.opportunity, input.ownedCities),
      netMonthlyIncome,
      projectedValue,
      contribution: contributionForProperty(
        input.ctx,
        netMonthlyIncome,
        projectedValue,
      ),
      fitLabel: "Alternative" as const,
      reasons: [
        {
          code: "within_buying_power" as const,
          copy: `Near your budget · ${fmt.currency(row.gap)} above current buying power`,
        },
      ],
    };
  });
}

/**
 * Eligibility first, then goal-weighted ranking. Never lets yield/growth
 * override affordability. Internal scores are not shown as percentages.
 */
export function matchForInvestorPlan(input: PlanMatchInput): {
  exact: PlanMatch[];
  stretch: PlanMatch[];
  resolvedRoute: FinanceRoute;
} {
  const routes = financeRoutesToRun(input.ctx.finance);
  const routeSets = routes.map((route) => ({
    route,
    exact: scoreEligible(collectRouteRows(route, input), input, input.ctx.weights),
  }));

  let resolvedRoute: FinanceRoute = routes[0] ?? "Mortgage";
  let exact: PlanMatch[] = [];

  if (input.ctx.finance === "recommend" || input.ctx.finance === "both") {
    const bestByRoute = routeSets
      .map((set) => ({ route: set.route, best: set.exact[0] ?? null, exact: set.exact }))
      .filter((s) => s.best);
    if (bestByRoute.length === 0) {
      exact = [];
      resolvedRoute = routes.includes("Mortgage") ? "Mortgage" : "Cash";
    } else if (input.ctx.finance === "recommend") {
      bestByRoute.sort((a, b) => {
        const as = a.best!.goalScore;
        const bs = b.best!.goalScore;
        if (bs !== as) return bs - as;
        return b.best!.affordabilityScore - a.best!.affordabilityScore;
      });
      resolvedRoute = bestByRoute[0].route;
      exact = bestByRoute[0].exact;
    } else {
      const combined = routeSets.flatMap((s) => s.exact);
      combined.sort((a, b) => {
        if (b.goalScore !== a.goalScore) return b.goalScore - a.goalScore;
        if (b.affordabilityScore !== a.affordabilityScore) {
          return b.affordabilityScore - a.affordabilityScore;
        }
        return a.cashRequired - b.cashRequired;
      });
      // Deduplicate by property, keep the better route.
      const seen = new Set<string>();
      exact = [];
      for (const row of combined) {
        if (seen.has(row.opportunity.id)) continue;
        seen.add(row.opportunity.id);
        exact.push(row);
      }
      const best = exact[0];
      resolvedRoute = best?.route ?? resolvedRoute;
      if (exact.length > 0) {
        const top = exact[0].goalScore;
        exact = exact.map((row, i) => ({
          ...row,
          fitLabel:
            i === 0
              ? "Best Fit"
              : top - row.goalScore <= 10
                ? "Strong Fit"
                : "Alternative",
        }));
      }
    }
  } else {
    exact = routeSets[0]?.exact ?? [];
    resolvedRoute = routes[0] ?? "Mortgage";
  }

  const exactIds = new Set(exact.map((m) => `${m.route}:${m.opportunity.id}`));
  const stretch = stretchForRoute(resolvedRoute, input, exactIds);

  return { exact, stretch, resolvedRoute };
}

export function reasonsForPlanMatch(
  opportunity: Opportunity,
  matches: { exact: PlanMatch[]; stretch: PlanMatch[] },
): FitReason[] {
  const hit =
    matches.exact.find((m) => m.opportunity.id === opportunity.id) ??
    matches.stretch.find((m) => m.opportunity.id === opportunity.id);
  return hit?.reasons ?? [];
}

