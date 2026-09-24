// Joseph Mews — Explore (Investment Marketplace) Data
// Curated developments available to investors. Mirrors the editorial tone
// of the rest of the app — a few high-quality opportunities, not a listings site.

import type { IllustrativeMortgagePlan } from "@/lib/paymentPlan";
import { summarizeIllustrativeMortgage } from "@/lib/paymentPlan";

export type OpportunityStatus = "Available" | "Coming Soon" | "Sold Out";
export type UnitType = "Studio" | "1-bed" | "2-bed" | "3-bed" | "Townhouse";

export interface UnitOption {
  type: UnitType;
  fromPrice: number;       // GBP
  sqftFrom: number;
  available: number;       // remaining units in this configuration
  total: number;           // total released in this configuration
}

export interface Opportunity {
  id: string;
  reference: string;       // e.g. JM-OPP-209
  name: string;
  developer: string;       // partner developer
  city: string;            // "Manchester"
  region: string;          // "North West"
  postcode: string;
  image: string;
  tagline: string;         // short editorial line
  status: OpportunityStatus;
  unitTypes: UnitOption[]; // available unit configurations
  fromPrice: number;       // overall starting price
  grossYield: number;      // %
  netYield: number;        // %
  capitalGrowth5Y: number; // % expected over 5 years (forecast)
  expectedCompletion: string; // "Q3 2027"
  tenure: "Leasehold" | "Freehold";
  leaseYears?: number;
  totalUnits: number;
  unitsAvailable: number;
  /** Short one-line summary (list / eyebrow use). */
  mortgagePlanSummary: string;
  /** Illustrative mortgage structure (null if closed). */
  illustrativeMortgage: IllustrativeMortgagePlan | null;
  highlights: string[];    // 3 bullet-style points
  // 5-year projection points (used by the projection CTA preview)
  projection: { year: number; value: number }[];
}

const MORTGAGE_IO_60: IllustrativeMortgagePlan = {
  name: "Illustrative mortgage",
  depositPercent: 40,
  ltvPercent: 60,
  rate: 5.25,
  type: "Interest-only",
  termYears: 25,
};

const MORTGAGE_REPAY_75: IllustrativeMortgagePlan = {
  name: "Illustrative mortgage",
  depositPercent: 25,
  ltvPercent: 75,
  rate: 5.45,
  type: "Repayment",
  termYears: 25,
};

const MORTGAGE_PRIME_IO: IllustrativeMortgagePlan = {
  name: "Illustrative mortgage",
  depositPercent: 40,
  ltvPercent: 60,
  rate: 4.95,
  type: "Interest-only",
  termYears: 25,
};

// Curated list — keep small (5–6) so it reads as a marketplace, not Rightmove.
export const opportunities: Opportunity[] = [
  {
    id: "OPP-209",
    reference: "JM-OPP-209",
    name: "Albion Wharf",
    developer: "Glencross Developments",
    city: "Manchester",
    region: "North West",
    postcode: "M3 4LZ",
    image:
      "https://d2xsxph8kpxj0f.cloudfront.net/113764710/ETLftU46Rt6EamfGSt3aTE/property-manchester-modern-68N8NjiUtsxN7NXMHZzona.webp",
    tagline: "A landmark waterfront development in the heart of Manchester's Castlefield quarter.",
    status: "Available",
    unitTypes: [
      { type: "1-bed", fromPrice: 245000, sqftFrom: 545, available: 18, total: 42 },
      { type: "2-bed", fromPrice: 365000, sqftFrom: 780, available: 9, total: 28 },
    ],
    fromPrice: 245000,
    grossYield: 6.4,
    netYield: 4.8,
    capitalGrowth5Y: 24.5,
    expectedCompletion: "Q3 2027",
    tenure: "Leasehold",
    leaseYears: 250,
    totalUnits: 70,
    unitsAvailable: 27,
    illustrativeMortgage: MORTGAGE_IO_60,
    mortgagePlanSummary: summarizeIllustrativeMortgage(MORTGAGE_IO_60),
    highlights: [
      "Waterfront views, Castlefield conservation area",
      "5-min walk to Deansgate-Castlefield interchange",
      "JLL-projected 24.5% capital growth over 5 years",
    ],
    projection: [
      { year: 0, value: 245000 },
      { year: 1, value: 256000 },
      { year: 2, value: 268000 },
      { year: 3, value: 281000 },
      { year: 4, value: 293000 },
      { year: 5, value: 305000 },
    ],
  },
  {
    id: "OPP-184",
    reference: "JM-OPP-184",
    name: "The Birchwood Collection",
    developer: "Hawthorne Estates",
    city: "Birmingham",
    region: "West Midlands",
    postcode: "B5 6DR",
    image:
      "https://d2xsxph8kpxj0f.cloudfront.net/113764710/ETLftU46Rt6EamfGSt3aTE/property-birmingham-jewel-mkDpyiZhsxCZGkHHiMENAm.webp",
    tagline: "Boutique residences in Birmingham's reimagined Southside cultural district.",
    status: "Available",
    unitTypes: [
      { type: "Studio", fromPrice: 198000, sqftFrom: 410, available: 12, total: 24 },
      { type: "1-bed", fromPrice: 235000, sqftFrom: 540, available: 16, total: 36 },
      { type: "2-bed", fromPrice: 325000, sqftFrom: 760, available: 4, total: 18 },
    ],
    fromPrice: 198000,
    grossYield: 6.9,
    netYield: 5.2,
    capitalGrowth5Y: 22.0,
    expectedCompletion: "Q1 2027",
    tenure: "Leasehold",
    leaseYears: 250,
    totalUnits: 78,
    unitsAvailable: 32,
    illustrativeMortgage: MORTGAGE_REPAY_75,
    mortgagePlanSummary: summarizeIllustrativeMortgage(MORTGAGE_REPAY_75),
    highlights: [
      "Strongest yield profile in the current pipeline",
      "Adjacent to HS2 Curzon Street terminus (2030)",
      "Knight Frank rental forecast +18% over 5 years",
    ],
    projection: [
      { year: 0, value: 198000 },
      { year: 1, value: 207000 },
      { year: 2, value: 216000 },
      { year: 3, value: 226000 },
      { year: 4, value: 235000 },
      { year: 5, value: 242000 },
    ],
  },
  {
    id: "OPP-176",
    reference: "JM-OPP-176",
    name: "Marylebone House",
    developer: "Berkeley Heritage",
    city: "London",
    region: "Greater London",
    postcode: "W1U 6PH",
    image:
      "https://d2xsxph8kpxj0f.cloudfront.net/113764710/ETLftU46Rt6EamfGSt3aTE/property-london-mayfair-Jv7Vjqc938V9UWBiZDq96P.webp",
    tagline: "Eighteen private residences behind a restored Marylebone Georgian façade.",
    status: "Available",
    unitTypes: [
      { type: "1-bed", fromPrice: 1250000, sqftFrom: 720, available: 4, total: 6 },
      { type: "2-bed", fromPrice: 1850000, sqftFrom: 1080, available: 5, total: 8 },
      { type: "3-bed", fromPrice: 2950000, sqftFrom: 1640, available: 2, total: 4 },
    ],
    fromPrice: 1250000,
    grossYield: 4.2,
    netYield: 2.8,
    capitalGrowth5Y: 18.5,
    expectedCompletion: "Q2 2027",
    tenure: "Leasehold",
    leaseYears: 999,
    totalUnits: 18,
    unitsAvailable: 11,
    illustrativeMortgage: MORTGAGE_PRIME_IO,
    mortgagePlanSummary: summarizeIllustrativeMortgage(MORTGAGE_PRIME_IO),
    highlights: [
      "Conservation-grade restoration of Georgian terrace",
      "Concierge, residents' lounge, private gardens",
      "Capital preservation profile · Prime Central London",
    ],
    projection: [
      { year: 0, value: 1250000 },
      { year: 1, value: 1295000 },
      { year: 2, value: 1342000 },
      { year: 3, value: 1390000 },
      { year: 4, value: 1438000 },
      { year: 5, value: 1481000 },
    ],
  },
];

export function getOpportunity(id: string) {
  return opportunities.find((o) => o.id === id);
}

// Cities derived dynamically so the filter chips never go stale.
export const opportunityCities = Array.from(
  new Set(opportunities.map((o) => o.city))
).sort();

// Pre-canned budget bands — kept simple for non-technical investors.
export interface BudgetBand {
  id: string;
  label: string;
  min: number;
  max: number;
}

export const budgetBands: BudgetBand[] = [
  { id: "u250", label: "Under £250k", min: 0,       max: 250000 },
  { id: "250-500", label: "£250k – £500k", min: 250000, max: 500000 },
  { id: "500-1m", label: "£500k – £1m",   min: 500000, max: 1000000 },
  { id: "1m+",   label: "£1m+",           min: 1000000, max: Infinity },
];

export interface YieldBand {
  id: string;
  label: string;
  min: number;
}

export const yieldBands: YieldBand[] = [
  { id: "any", label: "Any yield", min: 0 },
  { id: "5+", label: "5%+", min: 5 },
  { id: "6+", label: "6%+", min: 6 },
  { id: "7+", label: "7%+", min: 7 },
];
