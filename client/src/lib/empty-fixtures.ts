// Joseph Mews — Empty / partial fixtures for Preview hub only.
// Do not import these into the live loaded journeys.
import type { Document, Property } from "@/lib/data";
import type { Opportunity } from "@/lib/explore";

/** True zero-data portfolio case (new investor, CRM not ready). */
export const emptyPortfolioKpis = {
  totalInvested: null as number | null,
  currentValue: null as number | null,
  totalReturn: null as number | null,
  grossYield: null as number | null,
  netYield: null as number | null,
  netCashFlow: null as number | null,
  propertyCount: 0,
};

export const emptyProperties: Property[] = [];
export const emptyDocuments: Document[] = [];
export const emptyOpportunities: Opportunity[] = [];
export const emptyActivities: [] = [];

/**
 * Partial / incomplete CRM data — one property with many missing figures.
 * Mirrors the “1 property, 60% data missing” migration case.
 */
export const partialProperty: Property = {
  id: "JM-PARTIAL",
  reference: "JM-MAN-…",
  name: "Deansgate Studio",
  location: "Deansgate, Manchester",
  city: "Manchester",
  postcode: "M3 4LY",
  image:
    "https://d2xsxph8kpxj0f.cloudfront.net/113764710/ETLftU46Rt6EamfGSt3aTE/property-manchester-modern-68N8NjiUtsxN7NXMHZzona.webp",
  status: "Tenanted",
  bedrooms: 1,
  bathrooms: 1,
  sqft: 0,
  purchaseDate: "—",
  purchasePrice: 285000,
  currentValue: 0,
  capitalGrowth: 0,
  capitalGrowthPct: 0,
  monthlyRent: 0,
  expectedRent: 0,
  monthlyServiceCharge: 0,
  monthlyManagementFee: 0,
  monthlyMortgage: 0,
  netMonthlyIncome: 0,
  annualNetIncome: 0,
  grossYield: 0,
  netYield: 0,
  loanBalance: 0,
  equity: 0,
  occupancy: 0,
  valueHistory: [],
  rentHistory: [],
};

export const partialPortfolioKpis = {
  totalInvested: 285000,
  currentValue: null as number | null,
  totalReturn: null as number | null,
  grossYield: null as number | null,
  netYield: null as number | null,
  netCashFlow: null as number | null,
  propertyCount: 1,
};
