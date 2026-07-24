// Joseph Mews — mortgage payment plan types & helpers (owned holdings + Explore)

export type MortgageType = "Interest-only" | "Repayment";
export type MortgageInstallmentStatus = "paid" | "due" | "upcoming";

export interface MortgageInstallment {
  id: string;
  label: string;
  amount: number;
  dueDate: string;
  paidAt?: string;
  status: MortgageInstallmentStatus;
}

/** Owned holding mortgage schedule (lender facility). */
export interface MortgagePlan {
  lender: string;
  type: MortgageType;
  rate: number; // %
  termYears: number;
  remainingTermMonths: number;
  monthlyPayment: number;
  outstandingBalance: number;
  originalLoan: number;
  nextDueDate: string;
  /** Recent paid + near-term upcoming (prototype schedule). */
  schedule: MortgageInstallment[];
}

/** Marketplace illustrative financing (no paid/due state). */
export interface IllustrativeMortgagePlan {
  name: string;
  depositPercent: number;
  ltvPercent: number;
  rate: number;
  type: MortgageType;
  termYears: number;
}

export const MORTGAGE_PERSONALISATION_NOTE =
  "Rates and structure can be tailored to your circumstances — speak with your advisor.";

export function nextMortgagePayment(
  plan: MortgagePlan
): MortgageInstallment | undefined {
  const due = plan.schedule.find((i) => i.status === "due");
  if (due) return due;
  return plan.schedule.find((i) => i.status === "upcoming");
}

/** Principal repaid vs original loan (meaningful for repayment mortgages). */
export function principalPaidPct(plan: MortgagePlan): number {
  if (plan.originalLoan <= 0) return 0;
  return (
    ((plan.originalLoan - plan.outstandingBalance) / plan.originalLoan) * 100
  );
}

/** Share of contractual term elapsed. */
export function termProgressPct(plan: MortgagePlan): number {
  const totalMonths = plan.termYears * 12;
  if (totalMonths <= 0) return 0;
  const elapsed = totalMonths - plan.remainingTermMonths;
  return (Math.max(0, elapsed) / totalMonths) * 100;
}

export function progressPct(plan: MortgagePlan): number {
  return plan.type === "Repayment"
    ? principalPaidPct(plan)
    : termProgressPct(plan);
}

export function remainingLabel(plan: MortgagePlan): string {
  const y = Math.floor(plan.remainingTermMonths / 12);
  const m = plan.remainingTermMonths % 12;
  if (y <= 0) return `${m} mo remaining`;
  if (m === 0) return `${y} yr remaining`;
  return `${y} yr ${m} mo remaining`;
}

export function illustrativeLoan(price: number, ltvPercent: number): number {
  return Math.round((price * ltvPercent) / 100);
}

export function illustrativeDeposit(
  price: number,
  depositPercent: number
): number {
  return Math.round((price * depositPercent) / 100);
}

/** Monthly payment estimate for Explore (interest-only or repayment). */
export function illustrativeMonthlyPayment(
  loan: number,
  ratePercent: number,
  type: MortgageType,
  termYears: number
): number {
  if (loan <= 0) return 0;
  const r = ratePercent / 100;
  if (type === "Interest-only") {
    return Math.round((loan * r) / 12);
  }
  const monthlyRate = r / 12;
  const n = termYears * 12;
  if (monthlyRate === 0) return Math.round(loan / n);
  const payment =
    (loan * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -n));
  return Math.round(payment);
}

export function summarizeIllustrativeMortgage(
  plan: IllustrativeMortgagePlan
): string {
  return `${plan.depositPercent}% deposit · ${plan.ltvPercent}% LTV · ${plan.type}`;
}
