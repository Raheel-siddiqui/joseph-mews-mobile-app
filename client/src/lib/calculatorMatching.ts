// Calculator match eligibility, style ranking, and deterministic fit reasons.
// Pure client-side rules — no invented metrics; ready to move server-side later.

import { fmt } from "@/lib/data";
import type { Opportunity } from "@/lib/explore";

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
  | "balances_income_growth";

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
