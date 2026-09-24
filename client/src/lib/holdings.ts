// Active holdings scoped to the signed-in demo persona.
import {
  activities,
  documents,
  pennyPlace,
  portfolio,
  portfolioHistory,
  properties,
  type Activity,
  type Document,
  type PortfolioPoint,
  type Property,
} from "@/lib/data";
import { getPersona } from "@/lib/session";

/** Single-holding demo investor owns Penny Place only. */
export const SINGLE_PROPERTY_ID = pennyPlace.id;

export type PortfolioSnapshot = {
  totalInvested: number;
  currentValue: number;
  totalReturn: number;
  monthlyRent: number;
  monthlyCosts: number;
  netCashFlow: number;
  totalEquity: number;
  totalLoan: number;
  propertyCount: number;
  tenantedCount: number;
  totalReturnPct: number;
  grossYield: number;
  trailing12mReturn: number;
  trailing12mReturnPct: number;
  grossYieldDelta: number;
  netCashFlowDelta: number;
  netCashFlowDeltaPct: number;
};

function buildPortfolio(
  props: Property[],
  deltas?: {
    trailing12mReturn?: number;
    trailing12mReturnPct?: number;
    grossYieldDelta?: number;
    netCashFlowDelta?: number;
    netCashFlowDeltaPct?: number;
  }
): PortfolioSnapshot {
  const totalInvested = props.reduce((sum, p) => sum + p.purchasePrice, 0);
  const currentValue = props.reduce((sum, p) => sum + p.currentValue, 0);
  const totalReturn = props.reduce((sum, p) => sum + p.capitalGrowth, 0);
  const monthlyRent = props.reduce((sum, p) => sum + p.monthlyRent, 0);
  const monthlyCosts = props.reduce(
    (sum, p) =>
      sum + p.monthlyServiceCharge + p.monthlyManagementFee + p.monthlyMortgage,
    0
  );
  const netCashFlow = props.reduce((sum, p) => sum + p.netMonthlyIncome, 0);
  const totalEquity = props.reduce((sum, p) => sum + p.equity, 0);
  const totalLoan = props.reduce((sum, p) => sum + p.loanBalance, 0);

  return {
    totalInvested,
    currentValue,
    totalReturn,
    monthlyRent,
    monthlyCosts,
    netCashFlow,
    totalEquity,
    totalLoan,
    propertyCount: props.length,
    tenantedCount: props.filter((p) => p.status === "Tenanted").length,
    totalReturnPct: totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0,
    grossYield:
      currentValue > 0 ? ((monthlyRent * 12) / currentValue) * 100 : 0,
    trailing12mReturn: deltas?.trailing12mReturn ?? 0,
    trailing12mReturnPct: deltas?.trailing12mReturnPct ?? 0,
    grossYieldDelta: deltas?.grossYieldDelta ?? 0,
    netCashFlowDelta: deltas?.netCashFlowDelta ?? 0,
    netCashFlowDeltaPct: deltas?.netCashFlowDeltaPct ?? 0,
  };
}

export function isSingleHolding(): boolean {
  return getPersona() === "single";
}

export function getActiveProperties(): Property[] {
  if (isSingleHolding()) return [pennyPlace];
  return properties;
}

export function getActivePortfolio(): PortfolioSnapshot {
  if (!isSingleHolding()) {
    return {
      totalInvested: portfolio.totalInvested,
      currentValue: portfolio.currentValue,
      totalReturn: portfolio.totalReturn,
      monthlyRent: portfolio.monthlyRent,
      monthlyCosts: portfolio.monthlyCosts,
      netCashFlow: portfolio.netCashFlow,
      totalEquity: portfolio.totalEquity,
      totalLoan: portfolio.totalLoan,
      propertyCount: portfolio.propertyCount,
      tenantedCount: portfolio.tenantedCount,
      totalReturnPct: portfolio.totalReturnPct,
      grossYield: portfolio.grossYield,
      trailing12mReturn: portfolio.trailing12mReturn,
      trailing12mReturnPct: portfolio.trailing12mReturnPct,
      grossYieldDelta: portfolio.grossYieldDelta,
      netCashFlowDelta: portfolio.netCashFlowDelta,
      netCashFlowDeltaPct: portfolio.netCashFlowDeltaPct,
    };
  }

  return buildPortfolio(getActiveProperties(), {
    trailing12mReturn: 34813,
    trailing12mReturnPct: 16.98,
    grossYieldDelta: 0,
    netCashFlowDelta: 0,
    netCashFlowDeltaPct: 0,
  });
}

export function getActivePortfolioHistory(): PortfolioPoint[] {
  if (!isSingleHolding()) return portfolioHistory;

  const prop = getActiveProperties()[0];
  if (!prop) return [];

  return [...prop.valueHistory]
    .sort((a, b) => b.monthsAgo - a.monthsAgo)
    .map((h) => ({
      month: h.month,
      monthShort: h.month.split(" ")[0],
      value: h.value,
      monthsAgo: h.monthsAgo,
    }));
}

export function getActiveDocuments(): Document[] {
  if (!isSingleHolding()) return documents;
  const ids = new Set(getActiveProperties().map((p) => p.id));
  return documents.filter(
    (d) => !d.property || ids.has(d.property) || d.category === "Tax"
  );
}

export function getActiveActivities(): Activity[] {
  if (!isSingleHolding()) return activities;
  const ids = new Set(getActiveProperties().map((p) => p.id));
  return activities.filter((a) => !a.property || ids.has(a.property));
}

export function ownsProperty(id: string): boolean {
  return getActiveProperties().some((p) => p.id === id);
}

export function propertyCountLabel(count: number): string {
  return count === 1 ? "1 property" : `${count} properties`;
}
