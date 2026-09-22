// Joseph Mews Investor Platform — Sample Data
// All figures are realistic and consistent across screens.

import type { MortgagePlan } from "@/lib/paymentPlan";

export type PropertyStatus = "Tenanted" | "In Build" | "Vacant" | "Refurbishment";

export interface Property {
  id: string;
  reference: string;
  name: string;
  location: string;
  city: string;
  postcode: string;
  image: string;
  status: PropertyStatus;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  capitalGrowth: number;
  capitalGrowthPct: number;
  monthlyRent: number;
  expectedRent: number;
  monthlyServiceCharge: number;
  monthlyManagementFee: number;
  monthlyMortgage: number;
  netMonthlyIncome: number;
  annualNetIncome: number;
  grossYield: number;
  netYield: number;
  loanBalance: number;
  equity: number;
  tenantName?: string;
  tenancyEnd?: string;
  occupancy: number;
  valueHistory: { month: string; value: number; monthsAgo: number }[];
  rentHistory: { month: string; rent: number }[];
  /** Lender mortgage schedule — present when the holding is mortgaged. */
  mortgagePlan?: MortgagePlan;
}

export const investor = {
  name: "Alexander Whitfield",
  firstName: "Alexander",
  email: "alexander.whitfield@example.com",
  memberSince: "March 2021",
  tier: "Gold",
  photo: "/people/alexander.jpg",
  advisor: "Eleanor Hawthorne",
  advisorTitle: "Senior Investment Manager",
  advisorPhoto: "/people/eleanor.jpg",
};

export const properties: Property[] = [
  {
    id: "JM-001",
    reference: "JM-MAY-017",
    name: "The Mayfair Residence",
    location: "Mount Street, Mayfair",
    city: "London W1K",
    postcode: "W1K 2HQ",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/113764710/ETLftU46Rt6EamfGSt3aTE/property-london-mayfair-Jv7Vjqc938V9UWBiZDq96P.webp",
    status: "Tenanted",
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1240,
    purchaseDate: "12 March 2022",
    purchasePrice: 1450000,
    currentValue: 1685000,
    capitalGrowth: 235000,
    capitalGrowthPct: 16.2,
    monthlyRent: 6850,
    expectedRent: 6500,
    monthlyServiceCharge: 580,
    monthlyManagementFee: 685,
    monthlyMortgage: 3420,
    netMonthlyIncome: 2165,
    annualNetIncome: 25980,
    grossYield: 4.88,
    netYield: 1.54,
    loanBalance: 870000,
    equity: 815000,
    tenantName: "Henderson & Associates",
    tenancyEnd: "31 August 2026",
    occupancy: 100,
    valueHistory: [
      { month: "Mar '22", value: 1450000, monthsAgo: 50 },
      { month: "Sep '22", value: 1485000, monthsAgo: 44 },
      { month: "Mar '23", value: 1520000, monthsAgo: 38 },
      { month: "Sep '23", value: 1565000, monthsAgo: 32 },
      { month: "Mar '24", value: 1605000, monthsAgo: 26 },
      { month: "Sep '24", value: 1640000, monthsAgo: 20 },
      { month: "Mar '25", value: 1665000, monthsAgo: 14 },
      { month: "Sep '25", value: 1672000, monthsAgo: 8 },
      { month: "Jan '26", value: 1678000, monthsAgo: 4 },
      { month: "May '26", value: 1685000, monthsAgo: 0 },
    ],
    rentHistory: [
      { month: "Jun", rent: 6500 },
      { month: "Jul", rent: 6500 },
      { month: "Aug", rent: 6850 },
      { month: "Sep", rent: 6850 },
      { month: "Oct", rent: 6850 },
      { month: "Nov", rent: 6850 },
    ],
    mortgagePlan: {
      lender: "Coutts Private Bank",
      type: "Interest-only",
      rate: 4.75,
      termYears: 25,
      remainingTermMonths: 251,
      monthlyPayment: 3420,
      outstandingBalance: 870000,
      originalLoan: 870000,
      nextDueDate: "1 Aug 2026",
      schedule: [
        {
          id: "may-m1",
          label: "June 2026",
          amount: 3420,
          dueDate: "1 Jun 2026",
          paidAt: "1 Jun 2026",
          status: "paid",
        },
        {
          id: "may-m2",
          label: "July 2026",
          amount: 3420,
          dueDate: "1 Jul 2026",
          paidAt: "1 Jul 2026",
          status: "paid",
        },
        {
          id: "may-m3",
          label: "August 2026",
          amount: 3420,
          dueDate: "1 Aug 2026",
          status: "due",
        },
        {
          id: "may-m4",
          label: "September 2026",
          amount: 3420,
          dueDate: "1 Sep 2026",
          status: "upcoming",
        },
        {
          id: "may-m5",
          label: "October 2026",
          amount: 3420,
          dueDate: "1 Oct 2026",
          status: "upcoming",
        },
        {
          id: "may-m6",
          label: "November 2026",
          amount: 3420,
          dueDate: "1 Nov 2026",
          status: "upcoming",
        },
      ],
    },
  },
  {
    id: "JM-002",
    reference: "JM-MCR-042",
    name: "Deansgate Square",
    location: "Owen Street, Castlefield",
    city: "Manchester M15",
    postcode: "M15 4RD",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/113764710/ETLftU46Rt6EamfGSt3aTE/property-manchester-modern-68N8NjiUtsxN7NXMHZzona.webp",
    status: "Tenanted",
    bedrooms: 2,
    bathrooms: 2,
    sqft: 845,
    purchaseDate: "08 July 2022",
    purchasePrice: 385000,
    currentValue: 442000,
    capitalGrowth: 57000,
    capitalGrowthPct: 14.8,
    monthlyRent: 1950,
    expectedRent: 1900,
    monthlyServiceCharge: 245,
    monthlyManagementFee: 195,
    monthlyMortgage: 1180,
    netMonthlyIncome: 330,
    annualNetIncome: 3960,
    grossYield: 5.29,
    netYield: 0.90,
    loanBalance: 231000,
    equity: 211000,
    tenantName: "Sarah Mitchell",
    tenancyEnd: "14 February 2027",
    occupancy: 100,
    valueHistory: [
      { month: "Jul '22", value: 385000, monthsAgo: 46 },
      { month: "Jan '23", value: 395000, monthsAgo: 40 },
      { month: "Jul '23", value: 408000, monthsAgo: 34 },
      { month: "Jan '24", value: 418000, monthsAgo: 28 },
      { month: "Jul '24", value: 425000, monthsAgo: 22 },
      { month: "Jan '25", value: 432000, monthsAgo: 16 },
      { month: "Jul '25", value: 436000, monthsAgo: 10 },
      { month: "Nov '25", value: 438000, monthsAgo: 6 },
      { month: "Feb '26", value: 440000, monthsAgo: 3 },
      { month: "May '26", value: 442000, monthsAgo: 0 },
    ],
    rentHistory: [
      { month: "Jun", rent: 1900 },
      { month: "Jul", rent: 1900 },
      { month: "Aug", rent: 1950 },
      { month: "Sep", rent: 1950 },
      { month: "Oct", rent: 1950 },
      { month: "Nov", rent: 1950 },
    ],
    mortgagePlan: {
      lender: "HSBC UK",
      type: "Repayment",
      rate: 5.15,
      termYears: 25,
      remainingTermMonths: 248,
      monthlyPayment: 1180,
      outstandingBalance: 231000,
      originalLoan: 245000,
      nextDueDate: "5 Aug 2026",
      schedule: [
        {
          id: "mcr-m1",
          label: "June 2026",
          amount: 1180,
          dueDate: "5 Jun 2026",
          paidAt: "5 Jun 2026",
          status: "paid",
        },
        {
          id: "mcr-m2",
          label: "July 2026",
          amount: 1180,
          dueDate: "5 Jul 2026",
          paidAt: "5 Jul 2026",
          status: "paid",
        },
        {
          id: "mcr-m3",
          label: "August 2026",
          amount: 1180,
          dueDate: "5 Aug 2026",
          status: "due",
        },
        {
          id: "mcr-m4",
          label: "September 2026",
          amount: 1180,
          dueDate: "5 Sep 2026",
          status: "upcoming",
        },
        {
          id: "mcr-m5",
          label: "October 2026",
          amount: 1180,
          dueDate: "5 Oct 2026",
          status: "upcoming",
        },
        {
          id: "mcr-m6",
          label: "November 2026",
          amount: 1180,
          dueDate: "5 Nov 2026",
          status: "upcoming",
        },
      ],
    },
  },
  {
    id: "JM-003",
    reference: "JM-BHM-118",
    name: "The Hawthorn",
    location: "Snow Hill, Jewellery Quarter",
    city: "Birmingham B3",
    postcode: "B3 1JJ",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/113764710/ETLftU46Rt6EamfGSt3aTE/property-birmingham-jewel-mkDpyiZhsxCZGkHHiMENAm.webp",
    status: "In Build",
    bedrooms: 1,
    bathrooms: 1,
    sqft: 612,
    purchaseDate: "22 November 2024",
    purchasePrice: 245000,
    currentValue: 268000,
    capitalGrowth: 23000,
    capitalGrowthPct: 9.4,
    monthlyRent: 0,
    expectedRent: 1450,
    monthlyServiceCharge: 0,
    monthlyManagementFee: 0,
    monthlyMortgage: 0,
    netMonthlyIncome: 0,
    annualNetIncome: 0,
    grossYield: 0,
    netYield: 0,
    loanBalance: 147000,
    equity: 121000,
    occupancy: 0,
    valueHistory: [
      { month: "Nov '24", value: 245000, monthsAgo: 18 },
      { month: "Feb '25", value: 252000, monthsAgo: 15 },
      { month: "May '25", value: 258000, monthsAgo: 12 },
      { month: "Aug '25", value: 262000, monthsAgo: 9 },
      { month: "Nov '25", value: 265000, monthsAgo: 6 },
      { month: "Feb '26", value: 266500, monthsAgo: 3 },
      { month: "May '26", value: 268000, monthsAgo: 0 },
    ],
    rentHistory: [],
  },
  {
    id: "JM-004",
    reference: "JM-LIV-073",
    name: "The Edition Liverpool",
    location: "Princes Dock, Waterfront",
    city: "Liverpool L3",
    postcode: "L3 1DL",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/113764710/ETLftU46Rt6EamfGSt3aTE/property-liverpool-waterfront-FSwzvtfydh5B8YcpPdF5Wr.webp",
    status: "Tenanted",
    bedrooms: 2,
    bathrooms: 2,
    sqft: 762,
    purchaseDate: "16 May 2023",
    purchasePrice: 295000,
    currentValue: 332000,
    capitalGrowth: 37000,
    capitalGrowthPct: 12.5,
    monthlyRent: 1485,
    expectedRent: 1450,
    monthlyServiceCharge: 185,
    monthlyManagementFee: 148,
    monthlyMortgage: 920,
    netMonthlyIncome: 232,
    annualNetIncome: 2784,
    grossYield: 5.37,
    netYield: 0.84,
    loanBalance: 177000,
    equity: 155000,
    tenantName: "James Reilly",
    tenancyEnd: "30 April 2026",
    occupancy: 96,
    valueHistory: [
      { month: "May '23", value: 295000, monthsAgo: 36 },
      { month: "Nov '23", value: 305000, monthsAgo: 30 },
      { month: "May '24", value: 315000, monthsAgo: 24 },
      { month: "Nov '24", value: 322000, monthsAgo: 18 },
      { month: "May '25", value: 328000, monthsAgo: 12 },
      { month: "Nov '25", value: 330500, monthsAgo: 6 },
      { month: "Feb '26", value: 331200, monthsAgo: 3 },
      { month: "May '26", value: 332000, monthsAgo: 0 },
    ],
    rentHistory: [
      { month: "Jun", rent: 1450 },
      { month: "Jul", rent: 1450 },
      { month: "Aug", rent: 1485 },
      { month: "Sep", rent: 1485 },
      { month: "Oct", rent: 1485 },
      { month: "Nov", rent: 1485 },
    ],
    mortgagePlan: {
      lender: "Barclays",
      type: "Repayment",
      rate: 5.35,
      termYears: 25,
      remainingTermMonths: 262,
      monthlyPayment: 920,
      outstandingBalance: 177000,
      originalLoan: 188000,
      nextDueDate: "12 Aug 2026",
      schedule: [
        {
          id: "liv-m1",
          label: "June 2026",
          amount: 920,
          dueDate: "12 Jun 2026",
          paidAt: "12 Jun 2026",
          status: "paid",
        },
        {
          id: "liv-m2",
          label: "July 2026",
          amount: 920,
          dueDate: "12 Jul 2026",
          paidAt: "12 Jul 2026",
          status: "paid",
        },
        {
          id: "liv-m3",
          label: "August 2026",
          amount: 920,
          dueDate: "12 Aug 2026",
          status: "due",
        },
        {
          id: "liv-m4",
          label: "September 2026",
          amount: 920,
          dueDate: "12 Sep 2026",
          status: "upcoming",
        },
        {
          id: "liv-m5",
          label: "October 2026",
          amount: 920,
          dueDate: "12 Oct 2026",
          status: "upcoming",
        },
        {
          id: "liv-m6",
          label: "November 2026",
          amount: 920,
          dueDate: "12 Nov 2026",
          status: "upcoming",
        },
      ],
    },
  },
];

// Portfolio aggregates — computed once
export const portfolio = {
  totalInvested: properties.reduce((sum, p) => sum + p.purchasePrice, 0),
  currentValue: properties.reduce((sum, p) => sum + p.currentValue, 0),
  totalReturn: properties.reduce((sum, p) => sum + p.capitalGrowth, 0),
  monthlyRent: properties.reduce((sum, p) => sum + p.monthlyRent, 0),
  monthlyCosts: properties.reduce(
    (sum, p) => sum + p.monthlyServiceCharge + p.monthlyManagementFee + p.monthlyMortgage,
    0
  ),
  netCashFlow: properties.reduce((sum, p) => sum + p.netMonthlyIncome, 0),
  totalEquity: properties.reduce((sum, p) => sum + p.equity, 0),
  totalLoan: properties.reduce((sum, p) => sum + p.loanBalance, 0),
  propertyCount: properties.length,
  tenantedCount: properties.filter((p) => p.status === "Tenanted").length,
  get totalReturnPct() {
    return (this.totalReturn / this.totalInvested) * 100;
  },
  get grossYield() {
    return ((this.monthlyRent * 12) / this.currentValue) * 100;
  },
  // 12-month context (vs prior year)
  trailing12mReturn: 178420,
  trailing12mReturnPct: 7.4,
  grossYieldDelta: 0.18,      // +0.18 pts vs last year
  netCashFlowDelta: 245,      // +£245 vs last month
  netCashFlowDeltaPct: 9.6,
};

// Portfolio value time-series — 25 monthly points (May 2024 → May 2026)
// Used for dashboard trend chart with timeframe filters
export interface PortfolioPoint {
  month: string;        // "May '24"
  monthShort: string;   // "May"
  value: number;        // GBP
  monthsAgo: number;    // 24, 23, ... 0
}

// Series ends precisely at the current portfolio value (£2,727,000)
// Shape: gradual growth, +£245k step in Nov '24 (Hawthorn acquired), continued growth
export const portfolioHistory: PortfolioPoint[] = [
  { month: "May '24", monthShort: "May", value: 2218000, monthsAgo: 24 },
  { month: "Jun '24", monthShort: "Jun", value: 2230000, monthsAgo: 23 },
  { month: "Jul '24", monthShort: "Jul", value: 2244000, monthsAgo: 22 },
  { month: "Aug '24", monthShort: "Aug", value: 2256000, monthsAgo: 21 },
  { month: "Sep '24", monthShort: "Sep", value: 2268000, monthsAgo: 20 },
  { month: "Oct '24", monthShort: "Oct", value: 2282000, monthsAgo: 19 },
  { month: "Nov '24", monthShort: "Nov", value: 2538000, monthsAgo: 18 }, // Hawthorn acquired (+£245k step)
  { month: "Dec '24", monthShort: "Dec", value: 2552000, monthsAgo: 17 },
  { month: "Jan '25", monthShort: "Jan", value: 2568000, monthsAgo: 16 },
  { month: "Feb '25", monthShort: "Feb", value: 2582000, monthsAgo: 15 },
  { month: "Mar '25", monthShort: "Mar", value: 2598000, monthsAgo: 14 },
  { month: "Apr '25", monthShort: "Apr", value: 2612000, monthsAgo: 13 },
  { month: "May '25", monthShort: "May", value: 2624000, monthsAgo: 12 },
  { month: "Jun '25", monthShort: "Jun", value: 2638000, monthsAgo: 11 },
  { month: "Jul '25", monthShort: "Jul", value: 2652000, monthsAgo: 10 },
  { month: "Aug '25", monthShort: "Aug", value: 2664000, monthsAgo: 9 },
  { month: "Sep '25", monthShort: "Sep", value: 2676000, monthsAgo: 8 },
  { month: "Oct '25", monthShort: "Oct", value: 2685000, monthsAgo: 7 },
  { month: "Nov '25", monthShort: "Nov", value: 2695000, monthsAgo: 6 },
  { month: "Dec '25", monthShort: "Dec", value: 2702000, monthsAgo: 5 },
  { month: "Jan '26", monthShort: "Jan", value: 2710000, monthsAgo: 4 },
  { month: "Feb '26", monthShort: "Feb", value: 2716000, monthsAgo: 3 },
  { month: "Mar '26", monthShort: "Mar", value: 2720000, monthsAgo: 2 },
  { month: "Apr '26", monthShort: "Apr", value: 2724000, monthsAgo: 1 },
  { month: "May '26", monthShort: "May", value: 2727000, monthsAgo: 0 },
];

export type TimeRange = "1M" | "3M" | "1Y" | "ALL";

export const timeRangeLabels: Record<TimeRange, string> = {
  "1M": "Past month",
  "3M": "Past 3 months",
  "1Y": "Past 12 months",
  "ALL": "Since inception",
};

export function filterByRange<T extends { monthsAgo: number }>(
  series: T[],
  tf: TimeRange
): T[] {
  const cutoff = tf === "1M" ? 1 : tf === "3M" ? 3 : tf === "1Y" ? 12 : Infinity;
  return series.filter((p) => p.monthsAgo <= cutoff);
}

// Activity feed — recent updates
export interface Activity {
  id: string;
  type: "rent" | "valuation" | "document" | "tenant" | "milestone";
  title: string;
  detail: string;
  property?: string;
  amount?: number;
  timestamp: string;
  isNew?: boolean;
}

export const activities: Activity[] = [
  {
    id: "a1",
    type: "rent",
    title: "Rent received",
    detail: "Mayfair Residence",
    property: "JM-001",
    amount: 6850,
    timestamp: "2 hours ago",
    isNew: true,
  },
  {
    id: "a2",
    type: "valuation",
    title: "Valuation increased",
    detail: "Deansgate Square · +£10,000",
    property: "JM-002",
    amount: 10000,
    timestamp: "Yesterday",
    isNew: true,
  },
  {
    id: "a3",
    type: "document",
    title: "Tax statement available",
    detail: "Annual summary 2025/26",
    timestamp: "3 days ago",
  },
  {
    id: "a4",
    type: "milestone",
    title: "Construction update",
    detail: "The Hawthorn · 78% complete",
    property: "JM-003",
    timestamp: "5 days ago",
  },
  {
    id: "a5",
    type: "rent",
    title: "Rent received",
    detail: "The Edition Liverpool",
    property: "JM-004",
    amount: 1485,
    timestamp: "1 week ago",
  },
  {
    id: "a6",
    type: "tenant",
    title: "Tenancy renewed",
    detail: "Deansgate Square · 12 months",
    property: "JM-002",
    timestamp: "2 weeks ago",
  },
];

// Documents
export interface Document {
  id: string;
  name: string;
  category: "Contracts" | "Rental" | "Tax" | "Mortgage" | "Legal" | "Others";
  property?: string;
  fileType: "PDF" | "DOC";
  size: string;
  uploaded: string;
  isNew?: boolean;
}

export const documents: Document[] = [
  {
    id: "d1",
    name: "Tenancy Agreement — Mayfair",
    category: "Rental",
    property: "JM-001",
    fileType: "PDF",
    size: "2.4 MB",
    uploaded: "Updated 3 days ago",
    isNew: true,
  },
  {
    id: "d2",
    name: "Annual Tax Summary 2025/26",
    category: "Tax",
    fileType: "PDF",
    size: "1.8 MB",
    uploaded: "Updated 3 days ago",
    isNew: true,
  },
  {
    id: "d3",
    name: "Purchase Contract — Hawthorn",
    category: "Contracts",
    property: "JM-003",
    fileType: "PDF",
    size: "4.1 MB",
    uploaded: "Updated 2 weeks ago",
  },
  {
    id: "d4",
    name: "Mortgage Statement — Mayfair",
    category: "Mortgage",
    property: "JM-001",
    fileType: "PDF",
    size: "892 KB",
    uploaded: "Updated 1 month ago",
  },
  {
    id: "d5",
    name: "Tenancy Agreement — Deansgate",
    category: "Rental",
    property: "JM-002",
    fileType: "PDF",
    size: "2.1 MB",
    uploaded: "Updated 2 months ago",
  },
  {
    id: "d6",
    name: "Lease Title Deed — Liverpool",
    category: "Legal",
    property: "JM-004",
    fileType: "PDF",
    size: "3.6 MB",
    uploaded: "Updated 4 months ago",
  },
  {
    id: "d7",
    name: "Mortgage Statement — Liverpool",
    category: "Mortgage",
    property: "JM-004",
    fileType: "PDF",
    size: "865 KB",
    uploaded: "Updated 1 month ago",
  },
  {
    id: "d8",
    name: "Tenancy Agreement — Liverpool",
    category: "Rental",
    property: "JM-004",
    fileType: "PDF",
    size: "1.9 MB",
    uploaded: "Updated 6 months ago",
  },
  {
    id: "d9",
    name: "Purchase Contract — Mayfair",
    category: "Contracts",
    property: "JM-001",
    fileType: "PDF",
    size: "5.2 MB",
    uploaded: "Updated 14 months ago",
  },
];

export const LOGO_URL = "/joseph-mews-logo.svg";
export const HERO_TEXTURE = "https://d2xsxph8kpxj0f.cloudfront.net/113764710/ETLftU46Rt6EamfGSt3aTE/hero-texture-h8eVTcygCqs5s6BBg4mNvM.webp";

// Currency formatter
export const fmt = {
  currency: (n: number, decimals = 0) =>
    new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(n),
  number: (n: number) => new Intl.NumberFormat("en-GB").format(n),
  pct: (n: number) =>
    `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`,
  pctPlain: (n: number) => `${n.toFixed(2)}%`,
};

export function getProperty(id: string) {
  return properties.find((p) => p.id === id);
}
