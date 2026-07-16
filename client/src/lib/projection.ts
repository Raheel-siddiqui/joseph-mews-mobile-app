// Joseph Mews — Forward Projection Engine
// Single source of truth for the property value & cumulative income forecast
// shared across Property Detail (owned assets) and the Explore project detail.
//
// Philosophy: simple, trustworthy, not a simulator. Assumptions are exposed
// to the investor but kept high-level (growth rate, rental growth, mortgage rate).

// Section views (Property/Project) use 5/10/15. The calculator allows any whole-year value.
export type ProjectionHorizon = number;

export interface ProjectionInput {
  startValue: number;        // current/starting property value
  annualGrowth: number;      // % per annum (e.g. 4.5)
  annualGrossRent: number;   // gross rent in year 1
  rentalGrowth: number;      // % per annum
  // Annual costs in year 1
  annualServiceCharge: number;
  annualManagementFee: number;
  annualMortgage: number;    // 0 if no mortgage
  costGrowth?: number;       // % per annum applied to all costs (default 2.5)
}

export interface ProjectionYear {
  year: number;              // 1..horizon
  propertyValue: number;
  capitalGain: number;       // vs startValue
  grossRent: number;
  serviceCharge: number;
  managementFee: number;
  mortgage: number;
  totalCosts: number;
  netIncome: number;
  cumulativeNetIncome: number;
  totalReturn: number;       // capitalGain + cumulativeNetIncome
}

export interface ProjectionResult {
  startValue: number;
  years: ProjectionYear[];
  // Headline numbers at horizon
  endValue: number;
  totalCapitalGain: number;
  totalNetIncome: number;
  totalReturn: number;
  totalReturnPct: number;
}

// Default assumption set used when a property's historical figures do not
// expose explicit forward-looking parameters.
export const DEFAULT_ASSUMPTIONS = {
  costGrowth: 2.5,
};

export function projectInvestment(
  input: ProjectionInput,
  horizon: ProjectionHorizon
): ProjectionResult {
  const safeHorizon = Math.max(1, Math.round(horizon));
  horizon = safeHorizon;
  const cg = input.costGrowth ?? DEFAULT_ASSUMPTIONS.costGrowth;
  const years: ProjectionYear[] = [];
  let cumulative = 0;

  for (let y = 1; y <= horizon; y++) {
    const propertyValue =
      input.startValue * Math.pow(1 + input.annualGrowth / 100, y);
    const grossRent =
      input.annualGrossRent * Math.pow(1 + input.rentalGrowth / 100, y - 1);
    const serviceCharge =
      input.annualServiceCharge * Math.pow(1 + cg / 100, y - 1);
    const managementFee =
      input.annualManagementFee * Math.pow(1 + cg / 100, y - 1);
    // Mortgage held flat (interest-only style) — the prototype is illustrative.
    const mortgage = input.annualMortgage;
    const totalCosts = serviceCharge + managementFee + mortgage;
    const netIncome = grossRent - totalCosts;
    cumulative += netIncome;
    const capitalGain = propertyValue - input.startValue;

    years.push({
      year: y,
      propertyValue: Math.round(propertyValue),
      capitalGain: Math.round(capitalGain),
      grossRent: Math.round(grossRent),
      serviceCharge: Math.round(serviceCharge),
      managementFee: Math.round(managementFee),
      mortgage: Math.round(mortgage),
      totalCosts: Math.round(totalCosts),
      netIncome: Math.round(netIncome),
      cumulativeNetIncome: Math.round(cumulative),
      totalReturn: Math.round(capitalGain + cumulative),
    });
  }

  const last = years[years.length - 1];
  const totalReturnPct = (last.totalReturn / input.startValue) * 100;

  return {
    startValue: input.startValue,
    years,
    endValue: last.propertyValue,
    totalCapitalGain: last.capitalGain,
    totalNetIncome: last.cumulativeNetIncome,
    totalReturn: last.totalReturn,
    totalReturnPct,
  };
}
