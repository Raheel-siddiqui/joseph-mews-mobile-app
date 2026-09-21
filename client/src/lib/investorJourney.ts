// Goal-led investor journey for the calculator.
// Source: Mews One Personalised Investor Journey (client review spec).
// Persona labels are never shown — the route is inferred from goal + experience.

export type InvestorGoal =
  | "income"
  | "wealth"
  | "portfolio"
  | "retirement"
  | "family"
  | "unsure";

export type ExperienceLevel =
  | "first"
  | "home_only"
  | "owns_1_2"
  | "owns_3_plus";

export type UnsurePriority =
  | "income"
  | "growth"
  | "portfolio"
  | "future"
  | "options"
  | "still_unsure";

export type IncomeTarget =
  | "up_to_500"
  | "500_1000"
  | "1000_2000"
  | "2000_5000"
  | "5000_plus"
  | "not_sure";

export type Timeframe =
  | "within_5"
  | "5_10"
  | "10_15"
  | "15_20"
  | "20_plus"
  | "flexible";

export type CurrentIncome =
  | "none"
  | "up_to_500"
  | "500_1000"
  | "1000_2000"
  | "2000_plus"
  | "prefer_not";

export type GrowthPriority =
  | "steady"
  | "maximise"
  | "balanced"
  | "portfolio"
  | "not_sure";

export type WealthHorizon = "5" | "10" | "15" | "15_plus";

export type ValueBand =
  | "under_250k"
  | "250_500k"
  | "500k_1m"
  | "1m_2m"
  | "2m_plus"
  | "no_target"
  | "not_sure";

export type RetirementOutcome =
  | "income"
  | "value"
  | "both"
  | "legacy"
  | "not_sure";

export type PortfolioSize = "1_2" | "3_5" | "6_plus";

export type PortfolioObjective =
  | "income"
  | "growth"
  | "diversify"
  | "scale"
  | "balanced"
  | "not_sure";

export type FamilyMilestone =
  | "children"
  | "security"
  | "legacy"
  | "lump_sum";

export type FamilyOutcome =
  | "value"
  | "income"
  | "ownership"
  | "balanced"
  | "not_sure";

export type CapitalBand =
  | "under_10k"
  | "10_25k"
  | "25_50k"
  | "50_100k"
  | "100_250k"
  | "250k_plus";

export type ContributionBand =
  | "none"
  | "up_to_500"
  | "500_1000"
  | "1000_2500"
  | "2500_plus"
  | "staged";

export type FinanceChoice = "mortgage" | "cash" | "both" | "recommend";

export type FinanceRoute = "Mortgage" | "Cash";

export type ScreenId =
  | "goal"
  | "experience"
  | "unsurePriority"
  | "incomeTarget"
  | "incomeTimeframe"
  | "currentIncome"
  | "growthPriority"
  | "wealthHorizon"
  | "wealthTarget"
  | "currentPortfolioValue"
  | "retirementWindow"
  | "retirementOutcome"
  | "retirementIncomeTarget"
  | "retirementValueTarget"
  | "portfolioSize"
  | "portfolioObjective"
  | "portfolioIncome"
  | "familyMilestone"
  | "familyWhen"
  | "familyOutcome"
  | "familyValueTarget"
  | "familyIncomeTarget"
  | "capital"
  | "contributions"
  | "finance"
  | "plan"
  | "returns"
  | "projection";

export type JourneyPhase = "goal" | "details" | "capital" | "finance" | "plan";

export interface JourneyAnswers {
  goal: InvestorGoal | null;
  experience: ExperienceLevel | null;
  unsurePriority: UnsurePriority | null;
  incomeTarget: IncomeTarget | null;
  incomeTimeframe: Timeframe | null;
  currentIncome: CurrentIncome | null;
  growthPriority: GrowthPriority | null;
  wealthHorizon: WealthHorizon | null;
  wealthTarget: ValueBand | null;
  currentPortfolioValue: ValueBand | null;
  retirementWindow: Timeframe | null;
  retirementOutcome: RetirementOutcome | null;
  retirementIncomeTarget: IncomeTarget | null;
  retirementValueTarget: ValueBand | null;
  portfolioSize: PortfolioSize | null;
  portfolioObjective: PortfolioObjective | null;
  portfolioIncome: CurrentIncome | null;
  familyMilestone: FamilyMilestone | null;
  familyWhen: Timeframe | null;
  familyOutcome: FamilyOutcome | null;
  familyValueTarget: ValueBand | null;
  familyIncomeTarget: IncomeTarget | null;
  capital: CapitalBand | null;
  contributions: ContributionBand | null;
  finance: FinanceChoice | null;
}

export const EMPTY_ANSWERS: JourneyAnswers = {
  goal: null,
  experience: null,
  unsurePriority: null,
  incomeTarget: null,
  incomeTimeframe: null,
  currentIncome: null,
  growthPriority: null,
  wealthHorizon: null,
  wealthTarget: null,
  currentPortfolioValue: null,
  retirementWindow: null,
  retirementOutcome: null,
  retirementIncomeTarget: null,
  retirementValueTarget: null,
  portfolioSize: null,
  portfolioObjective: null,
  portfolioIncome: null,
  familyMilestone: null,
  familyWhen: null,
  familyOutcome: null,
  familyValueTarget: null,
  familyIncomeTarget: null,
  capital: null,
  contributions: null,
  finance: null,
};

export interface Option<T extends string> {
  value: T;
  label: string;
  hint?: string;
  recommended?: boolean;
}

export type ChoiceLayout = "stack" | "grid" | "chips";

export interface ScreenCopy {
  id: ScreenId;
  title: string;
  caption: string;
  prompt: string;
  helper: string;
  firstTimeHelper?: string;
}

export const GOAL_OPTIONS: Option<InvestorGoal>[] = [
  { value: "income", label: "Generate passive income", hint: "Regular rental income from property" },
  { value: "wealth", label: "Build long-term wealth", hint: "Grow asset value over time" },
  { value: "portfolio", label: "Grow an existing portfolio", hint: "Improve what you already own" },
  { value: "retirement", label: "Plan for retirement", hint: "Income or value at a future date" },
  { value: "family", label: "Invest for my family / future", hint: "A milestone, children or legacy" },
  { value: "unsure", label: "Not sure yet", hint: "We'll suggest a balanced starting route" },
];

export const EXPERIENCE_OPTIONS: Option<ExperienceLevel>[] = [
  { value: "first", label: "This is my first investment", hint: "We'll keep terms simple and recommend a route" },
  { value: "home_only", label: "I own my home but no investment property" },
  { value: "owns_1_2", label: "I own 1–2 investment properties" },
  { value: "owns_3_plus", label: "I own 3+ investment properties" },
];

export const UNSURE_PRIORITY_OPTIONS: Option<UnsurePriority>[] = [
  { value: "income", label: "Creating regular income" },
  { value: "growth", label: "Growing money over time" },
  { value: "portfolio", label: "Building a property portfolio" },
  { value: "future", label: "Planning for the future" },
  { value: "options", label: "Keeping my options open" },
  { value: "still_unsure", label: "I am still not sure" },
];

export const INCOME_TARGET_OPTIONS: Option<IncomeTarget>[] = [
  { value: "up_to_500", label: "Up to £500" },
  { value: "500_1000", label: "£500–£1,000" },
  { value: "1000_2000", label: "£1,000–£2,000" },
  { value: "2000_5000", label: "£2,000–£5,000" },
  { value: "5000_plus", label: "£5,000+" },
  { value: "not_sure", label: "Not sure yet" },
];

export const INCOME_TIMEFRAME_OPTIONS: Option<Timeframe>[] = [
  { value: "within_5", label: "Within 5 years" },
  { value: "5_10", label: "5–10 years" },
  { value: "10_15", label: "10–15 years" },
  { value: "15_20", label: "15+ years" },
  { value: "flexible", label: "Flexible" },
];

export const CURRENT_INCOME_OPTIONS: Option<CurrentIncome>[] = [
  { value: "none", label: "No" },
  { value: "up_to_500", label: "Up to £500/month" },
  { value: "500_1000", label: "£500–£1,000/month" },
  { value: "1000_2000", label: "£1,000–£2,000/month" },
  { value: "2000_plus", label: "£2,000+/month" },
];

export const GROWTH_PRIORITY_OPTIONS: Option<GrowthPriority>[] = [
  { value: "steady", label: "Steady long-term growth" },
  { value: "maximise", label: "Maximise long-term growth" },
  { value: "balanced", label: "Balance growth and income" },
  { value: "portfolio", label: "Build a multi-property portfolio" },
  { value: "not_sure", label: "Not sure yet" },
];

export const WEALTH_HORIZON_OPTIONS: Option<WealthHorizon>[] = [
  { value: "5", label: "5 years" },
  { value: "10", label: "10 years" },
  { value: "15", label: "15 years" },
  { value: "15_plus", label: "15+ years" },
];

export const VALUE_BAND_OPTIONS: Option<ValueBand>[] = [
  { value: "under_250k", label: "Under £250k" },
  { value: "250_500k", label: "£250k–£500k" },
  { value: "500k_1m", label: "£500k–£1m" },
  { value: "1m_2m", label: "£1m–£2m" },
  { value: "2m_plus", label: "£2m+" },
  { value: "no_target", label: "No fixed target" },
];

export const VALUE_BAND_WITH_UNSURE: Option<ValueBand>[] = [
  ...VALUE_BAND_OPTIONS.filter((o) => o.value !== "no_target"),
  { value: "not_sure", label: "Not sure yet" },
];

export const RETIREMENT_WINDOW_OPTIONS: Option<Timeframe>[] = [
  { value: "within_5", label: "Within 5 years" },
  { value: "5_10", label: "5–10 years" },
  { value: "10_15", label: "10–20 years" },
  { value: "20_plus", label: "20+ years" },
];

export const RETIREMENT_OUTCOME_OPTIONS: Option<RetirementOutcome>[] = [
  { value: "income", label: "Regular monthly income" },
  { value: "value", label: "A valuable property portfolio" },
  { value: "both", label: "Both income and growth" },
  { value: "legacy", label: "An asset to pass on" },
  { value: "not_sure", label: "Not sure yet" },
];

export const PORTFOLIO_SIZE_OPTIONS: Option<PortfolioSize>[] = [
  { value: "1_2", label: "1–2 properties" },
  { value: "3_5", label: "3–5 properties" },
  { value: "6_plus", label: "6+ properties" },
];

export const PORTFOLIO_OBJECTIVE_OPTIONS: Option<PortfolioObjective>[] = [
  { value: "income", label: "Increase rental income" },
  { value: "growth", label: "Increase long-term growth" },
  { value: "diversify", label: "Diversify my portfolio" },
  { value: "scale", label: "Grow the number of properties" },
  { value: "balanced", label: "Balance income and growth" },
  { value: "not_sure", label: "Not sure yet" },
];

export const PORTFOLIO_INCOME_OPTIONS: Option<CurrentIncome>[] = [
  { value: "up_to_500", label: "Under £500" },
  { value: "500_1000", label: "£500–£1,000" },
  { value: "1000_2000", label: "£1,000–£2,000" },
  { value: "2000_plus", label: "£2,000–£5,000" },
  { value: "prefer_not", label: "Prefer not to use this" },
];

export const FAMILY_MILESTONE_OPTIONS: Option<FamilyMilestone>[] = [
  { value: "children", label: "Children" },
  { value: "security", label: "Family security" },
  { value: "legacy", label: "Legacy" },
  { value: "lump_sum", label: "A future lump sum" },
];

export const FAMILY_WHEN_OPTIONS: Option<Timeframe>[] = [
  { value: "within_5", label: "Within 5 years" },
  { value: "5_10", label: "5–10 years" },
  { value: "10_15", label: "10–15 years" },
  { value: "15_20", label: "15–20 years" },
  { value: "20_plus", label: "20+ years" },
];

export const FAMILY_OUTCOME_OPTIONS: Option<FamilyOutcome>[] = [
  { value: "value", label: "A lump-sum asset value" },
  { value: "income", label: "Ongoing monthly income" },
  { value: "ownership", label: "Owning a long-term property asset" },
  { value: "balanced", label: "A mix of income and value" },
  { value: "not_sure", label: "Not sure yet" },
];

export const CAPITAL_OPTIONS: Option<CapitalBand>[] = [
  { value: "under_10k", label: "Less than £10k", hint: "Below the usual match floor — we'll show the funding gap" },
  { value: "10_25k", label: "£10k–£25k", hint: "Affordability uses £10k" },
  { value: "25_50k", label: "£25k–£50k", hint: "Affordability uses £25k" },
  { value: "50_100k", label: "£50k–£100k", hint: "Affordability uses £50k" },
  { value: "100_250k", label: "£100k–£250k", hint: "Affordability uses £100k" },
  { value: "250k_plus", label: "£250k+", hint: "Affordability uses £250k" },
];

export const CONTRIBUTION_OPTIONS: Option<ContributionBand>[] = [
  { value: "none", label: "No" },
  { value: "up_to_500", label: "Up to £500/month" },
  { value: "500_1000", label: "£500–£1,000/month" },
  { value: "1000_2500", label: "£1,000–£2,500/month" },
  { value: "2500_plus", label: "£2,500+/month" },
  { value: "staged", label: "At specific stages only" },
];

export const FINANCE_OPTIONS: Option<FinanceChoice>[] = [
  { value: "mortgage", label: "Mortgage", hint: "Use a loan to increase buying power" },
  { value: "cash", label: "Cash", hint: "Purchase without financing" },
  { value: "both", label: "Show me both", hint: "Compare mortgage and cash on the same capital" },
  {
    value: "recommend",
    label: "Recommend for me",
    hint: "We'll pick the stronger purchase route",
    recommended: true,
  },
];

export const JOURNEY_PHASES: {
  id: JourneyPhase;
  title: string;
  caption: string;
}[] = [
  { id: "goal", title: "Goal", caption: "What property should achieve" },
  { id: "details", title: "Route", caption: "Questions for this goal" },
  { id: "capital", title: "Capital", caption: "Available funds" },
  { id: "finance", title: "Finance", caption: "How you purchase" },
  { id: "plan", title: "Plan", caption: "Recommended next step" },
];

const MONTHLY_MIDPOINT: Record<IncomeTarget, number | null> = {
  up_to_500: 250,
  "500_1000": 750,
  "1000_2000": 1500,
  "2000_5000": 3500,
  "5000_plus": 5000,
  not_sure: null,
};

const CURRENT_INCOME_MIDPOINT: Record<CurrentIncome, number | null> = {
  none: 0,
  up_to_500: 250,
  "500_1000": 750,
  "1000_2000": 1500,
  "2000_plus": 2000,
  prefer_not: null,
};

const VALUE_MIDPOINT: Record<ValueBand, number | null> = {
  under_250k: 125_000,
  "250_500k": 375_000,
  "500k_1m": 750_000,
  "1m_2m": 1_500_000,
  "2m_plus": 2_000_000,
  no_target: null,
  not_sure: null,
};

const CAPITAL_VALUES: Record<
  CapitalBand,
  { hard: number; planning: number; label: string }
> = {
  under_10k: { hard: 0, planning: 5_000, label: "Less than £10k" },
  "10_25k": { hard: 10_000, planning: 17_500, label: "£10k–£25k" },
  "25_50k": { hard: 25_000, planning: 37_500, label: "£25k–£50k" },
  "50_100k": { hard: 50_000, planning: 75_000, label: "£50k–£100k" },
  "100_250k": { hard: 100_000, planning: 175_000, label: "£100k–£250k" },
  "250k_plus": { hard: 250_000, planning: 250_000, label: "£250k+" },
};

const CONTRIBUTION_VALUES: Record<
  ContributionBand,
  { hard: number | null; planning: number | null; label: string }
> = {
  none: { hard: 0, planning: 0, label: "No further contributions" },
  up_to_500: { hard: 0, planning: 250, label: "Up to £500/month" },
  "500_1000": { hard: 500, planning: 750, label: "£500–£1,000/month" },
  "1000_2500": { hard: 1_000, planning: 1_750, label: "£1,000–£2,500/month" },
  "2500_plus": { hard: 2_500, planning: 2_500, label: "£2,500+/month" },
  staged: { hard: null, planning: null, label: "At specific stages only" },
};

export function isExistingInvestor(experience: ExperienceLevel | null): boolean {
  return experience === "owns_1_2" || experience === "owns_3_plus";
}

export function isFirstTime(experience: ExperienceLevel | null): boolean {
  return experience === "first";
}

export function inferredRoute(answers: JourneyAnswers): InvestorGoal {
  if (answers.goal && answers.goal !== "unsure") return answers.goal;
  if (answers.unsurePriority === "income") return "income";
  if (answers.unsurePriority === "growth") return "wealth";
  if (answers.unsurePriority === "portfolio") return "portfolio";
  if (answers.unsurePriority === "future") return "family";
  return "unsure";
}

function wantsIncomeTarget(answers: JourneyAnswers): boolean {
  const route = inferredRoute(answers);
  if (route === "income") return true;
  if (route === "retirement") {
    return (
      answers.retirementOutcome === "income" ||
      answers.retirementOutcome === "both" ||
      answers.retirementOutcome === "not_sure"
    );
  }
  if (route === "family") {
    return (
      answers.familyOutcome === "income" ||
      answers.familyOutcome === "balanced" ||
      answers.familyOutcome === "not_sure"
    );
  }
  return false;
}

function wantsValueTarget(answers: JourneyAnswers): boolean {
  const route = inferredRoute(answers);
  if (route === "wealth") return true;
  if (route === "retirement") {
    return (
      answers.retirementOutcome === "value" ||
      answers.retirementOutcome === "both" ||
      answers.retirementOutcome === "legacy" ||
      answers.retirementOutcome === "not_sure"
    );
  }
  if (route === "family") {
    return (
      answers.familyOutcome === "value" ||
      answers.familyOutcome === "balanced" ||
      answers.familyOutcome === "ownership" ||
      answers.familyOutcome === "not_sure"
    );
  }
  return false;
}

function wantsPortfolioIncome(answers: JourneyAnswers): boolean {
  return (
    answers.portfolioObjective === "income" ||
    answers.portfolioObjective === "balanced" ||
    answers.portfolioObjective === "not_sure"
  );
}

export function getJourneyScreens(answers: JourneyAnswers): ScreenId[] {
  const screens: ScreenId[] = ["goal"];
  if (!answers.goal) return screens;

  if (answers.goal === "unsure") {
    screens.push("unsurePriority");
    screens.push("experience");
    screens.push("capital");
    screens.push("finance");
    screens.push("plan", "returns", "projection");
    return screens;
  }

  if (answers.goal === "portfolio") {
    screens.push("portfolioSize");
  } else {
    screens.push("experience");
  }

  const existing =
    answers.goal === "portfolio" || isExistingInvestor(answers.experience);

  if (answers.goal === "income") {
    screens.push("incomeTarget", "incomeTimeframe");
    if (existing) screens.push("currentIncome");
  }

  if (answers.goal === "wealth") {
    screens.push("growthPriority", "wealthHorizon", "wealthTarget");
    if (existing) screens.push("currentPortfolioValue");
  }

  if (answers.goal === "retirement") {
    screens.push("retirementWindow", "retirementOutcome");
    if (wantsIncomeTarget(answers)) screens.push("retirementIncomeTarget");
    if (wantsValueTarget(answers)) screens.push("retirementValueTarget");
    if (existing) {
      if (wantsIncomeTarget(answers)) screens.push("currentIncome");
      if (wantsValueTarget(answers)) screens.push("currentPortfolioValue");
    }
  }

  if (answers.goal === "portfolio") {
    screens.push("portfolioObjective", "currentPortfolioValue");
    if (wantsPortfolioIncome(answers)) screens.push("portfolioIncome");
  }

  if (answers.goal === "family") {
    screens.push("familyMilestone", "familyWhen", "familyOutcome");
    if (wantsValueTarget(answers)) screens.push("familyValueTarget");
    if (wantsIncomeTarget(answers)) screens.push("familyIncomeTarget");
    if (existing) {
      if (wantsIncomeTarget(answers)) screens.push("currentIncome");
      if (wantsValueTarget(answers)) screens.push("currentPortfolioValue");
    }
  }

  screens.push("capital", "contributions", "finance");
  screens.push("plan", "returns", "projection");
  return screens;
}

export function phaseForScreen(id: ScreenId): JourneyPhase {
  if (id === "goal" || id === "unsurePriority") return "goal";
  if (id === "capital" || id === "contributions") return "capital";
  if (id === "finance") return "finance";
  if (id === "plan" || id === "returns" || id === "projection") return "plan";
  return "details";
}

export function layoutForScreen(id: ScreenId): ChoiceLayout {
  switch (id) {
    case "incomeTimeframe":
    case "wealthHorizon":
    case "retirementWindow":
    case "familyWhen":
    case "portfolioSize":
    case "familyMilestone":
      return "chips";
    case "goal":
    case "experience":
    case "unsurePriority":
    case "growthPriority":
    case "portfolioObjective":
    case "finance":
    case "retirementOutcome":
    case "familyOutcome":
      return "stack";
    default:
      return "grid";
  }
}

/** PRD F-CALC-2 LTV defaults, inferred from the goal — not a risk-appetite question. */
export function suggestedLtv(answers: JourneyAnswers): 55 | 65 | 75 {
  const route = matchingRoute(answers);
  if (
    answers.growthPriority === "maximise" ||
    route === "wealth" ||
    route === "portfolio_growth" ||
    route === "family_value"
  ) {
    return 75;
  }
  if (
    answers.growthPriority === "steady" ||
    answers.familyMilestone === "security" ||
    route === "portfolio_scale"
  ) {
    return 55;
  }
  return 65;
}

export function firstScreenInPhase(
  screens: ScreenId[],
  phase: JourneyPhase,
): ScreenId | null {
  return screens.find((id) => phaseForScreen(id) === phase) ?? null;
}

export function labelFor<T extends string>(
  options: Option<T>[],
  value: T | null,
): string | null {
  if (!value) return null;
  return options.find((o) => o.value === value)?.label ?? null;
}

export function getScreenCopy(
  id: ScreenId,
  firstTime: boolean,
): ScreenCopy {
  const questions: Partial<Record<ScreenId, ScreenCopy>> = {
    goal: {
      id: "goal",
      title: "Goal",
      caption: "What property should achieve",
      prompt: "What are you looking to achieve through property?",
      helper:
        "We'll shape the questions and the plan around this. You don't need to pick a persona label.",
    },
    experience: {
      id: "experience",
      title: "Experience",
      caption: "Where you are today",
      prompt: "What is your property investment experience?",
      helper:
        "This changes whether we ask about an existing portfolio, and how much we explain along the way.",
      firstTimeHelper:
        "If this is new, we'll keep the language simple and recommend a route where it helps.",
    },
    unsurePriority: {
      id: "unsurePriority",
      title: "Priority",
      caption: "What matters most right now",
      prompt: "What matters most to you right now?",
      helper:
        "We'll suggest a starting route from this. You can change it before viewing recommendations.",
    },
    incomeTarget: {
      id: "incomeTarget",
      title: "Income",
      caption: "Monthly income aim",
      prompt: "What level of monthly property income are you aiming for?",
      helper: "We'll use the selected band to show progress — not as a guarantee.",
    },
    incomeTimeframe: {
      id: "incomeTimeframe",
      title: "Timeframe",
      caption: "When you want to reach it",
      prompt: "How soon would you like to reach this level?",
      helper: "This sets the horizon we use for the plan.",
    },
    currentIncome: {
      id: "currentIncome",
      title: "Position",
      caption: "Current property income",
      prompt: "Do you already receive income from investment property?",
      helper: "Only used to show the remaining gap to your goal.",
    },
    growthPriority: {
      id: "growthPriority",
      title: "Growth",
      caption: "How wealth should grow",
      prompt: "What matters most in the way your property wealth grows?",
      helper: "This decides whether we lean toward growth, income, or a blend.",
    },
    wealthHorizon: {
      id: "wealthHorizon",
      title: "Horizon",
      caption: "How long you will invest",
      prompt: "How long are you comfortable investing for?",
      helper: "We'll project the plan to the nearest supported horizon.",
    },
    wealthTarget: {
      id: "wealthTarget",
      title: "Target",
      caption: "Property-wealth aim",
      prompt: "Do you have a target level of property wealth in mind?",
      helper: "Optional. Used to show contribution toward the goal, not eligibility.",
    },
    currentPortfolioValue: {
      id: "currentPortfolioValue",
      title: "Position",
      caption: "Current portfolio value",
      prompt: "What is the approximate value of your current investment-property portfolio?",
      helper: "An estimate is enough — we use the band, not an exact figure.",
    },
    retirementWindow: {
      id: "retirementWindow",
      title: "Retirement",
      caption: "When you are planning for",
      prompt: "When are you planning for retirement?",
      helper: "The plan is built around this window.",
    },
    retirementOutcome: {
      id: "retirementOutcome",
      title: "Outcome",
      caption: "What property should provide",
      prompt: "What would you most want property to provide at retirement?",
      helper: "This chooses whether we optimise for income, value, or both.",
    },
    retirementIncomeTarget: {
      id: "retirementIncomeTarget",
      title: "Income",
      caption: "Retirement income aim",
      prompt: "What level of monthly income would you like property to provide?",
      helper: "We'll show how far the next property could contribute.",
    },
    retirementValueTarget: {
      id: "retirementValueTarget",
      title: "Value",
      caption: "Retirement portfolio aim",
      prompt: "What level of portfolio value would you like to work towards?",
      helper: "Used for progress, not to stretch affordability.",
    },
    portfolioSize: {
      id: "portfolioSize",
      title: "Portfolio",
      caption: "How many you own today",
      prompt: "How many investment properties do you currently own?",
      helper: "The next purchase is framed as an addition to this portfolio.",
    },
    portfolioObjective: {
      id: "portfolioObjective",
      title: "Next step",
      caption: "What the next purchase should improve",
      prompt: "What should your next investment improve most?",
      helper: "We'll recommend the best next acquisition for this objective.",
    },
    portfolioIncome: {
      id: "portfolioIncome",
      title: "Income",
      caption: "Current rental income",
      prompt: "What level of monthly rental income does the portfolio currently produce?",
      helper: "Skip this if you'd rather not use it in the plan.",
    },
    familyMilestone: {
      id: "familyMilestone",
      title: "Milestone",
      caption: "Who or what this is for",
      prompt: "What is this investment mainly for?",
      helper: "We'll describe the plan in terms of this milestone.",
    },
    familyWhen: {
      id: "familyWhen",
      title: "Timing",
      caption: "When it should start serving the goal",
      prompt: "When do you expect this investment to start serving that goal?",
      helper: "This sets the long-horizon view in the plan.",
    },
    familyOutcome: {
      id: "familyOutcome",
      title: "Outcome",
      caption: "What matters most at that point",
      prompt: "What matters most at that point?",
      helper: "We'll rank properties around this outcome.",
    },
    familyValueTarget: {
      id: "familyValueTarget",
      title: "Value",
      caption: "Future value aim",
      prompt: "What level of value would you like to work towards?",
      helper: "Indicative only — shown as progress toward the milestone.",
    },
    familyIncomeTarget: {
      id: "familyIncomeTarget",
      title: "Income",
      caption: "Future income aim",
      prompt: "What level of monthly income would you like the portfolio to provide?",
      helper: "Indicative only — shown as progress toward the milestone.",
    },
    capital: {
      id: "capital",
      title: "Capital",
      caption: "Funds for the next investment",
      prompt: "How much capital do you have available for your next investment?",
      helper:
        "We'll use the lower end of the band for affordability, so the plan stays conservative.",
      firstTimeHelper:
        "This is the cash you can put toward a deposit or a cash purchase. You can change it later.",
    },
    contributions: {
      id: "contributions",
      title: "Contributions",
      caption: "Future funding",
      prompt: "Could you add more capital over time?",
      helper:
        "Future contributions shape the longer route. They do not increase today's buying power.",
    },
    finance: {
      id: "finance",
      title: "Finance",
      caption: "How you prefer to purchase",
      prompt: "How would you prefer to purchase?",
      helper: "Mortgage settings stay under Adjust assumptions unless you want to change them.",
      firstTimeHelper:
        "A mortgage uses your capital as a deposit so you can consider a higher-value property. Cash means buying without a loan. If you're unsure, we can recommend a route.",
    },
  };

  const copy = questions[id];
  if (!copy) {
    return {
      id,
      title: "Plan",
      caption: "Recommended next step",
      prompt: "Your investment plan",
      helper: "",
    };
  }
  if (firstTime && copy.firstTimeHelper) {
    return { ...copy, helper: copy.firstTimeHelper };
  }
  return copy;
}

export function optionsForScreen(id: ScreenId): Option<string>[] {
  switch (id) {
    case "goal":
      return GOAL_OPTIONS;
    case "experience":
      return EXPERIENCE_OPTIONS;
    case "unsurePriority":
      return UNSURE_PRIORITY_OPTIONS;
    case "incomeTarget":
    case "retirementIncomeTarget":
    case "familyIncomeTarget":
      return INCOME_TARGET_OPTIONS;
    case "incomeTimeframe":
      return INCOME_TIMEFRAME_OPTIONS;
    case "currentIncome":
      return CURRENT_INCOME_OPTIONS;
    case "growthPriority":
      return GROWTH_PRIORITY_OPTIONS;
    case "wealthHorizon":
      return WEALTH_HORIZON_OPTIONS;
    case "wealthTarget":
      return VALUE_BAND_OPTIONS;
    case "currentPortfolioValue":
    case "retirementValueTarget":
    case "familyValueTarget":
      return VALUE_BAND_WITH_UNSURE;
    case "retirementWindow":
      return RETIREMENT_WINDOW_OPTIONS;
    case "retirementOutcome":
      return RETIREMENT_OUTCOME_OPTIONS;
    case "portfolioSize":
      return PORTFOLIO_SIZE_OPTIONS;
    case "portfolioObjective":
      return PORTFOLIO_OBJECTIVE_OPTIONS;
    case "portfolioIncome":
      return PORTFOLIO_INCOME_OPTIONS;
    case "familyMilestone":
      return FAMILY_MILESTONE_OPTIONS;
    case "familyWhen":
      return FAMILY_WHEN_OPTIONS;
    case "familyOutcome":
      return FAMILY_OUTCOME_OPTIONS;
    case "capital":
      return CAPITAL_OPTIONS;
    case "contributions":
      return CONTRIBUTION_OPTIONS;
    case "finance":
      return FINANCE_OPTIONS;
    default:
      return [];
  }
}

export function answerKeyForScreen(
  id: ScreenId,
): keyof JourneyAnswers | null {
  const map: Partial<Record<ScreenId, keyof JourneyAnswers>> = {
    goal: "goal",
    experience: "experience",
    unsurePriority: "unsurePriority",
    incomeTarget: "incomeTarget",
    incomeTimeframe: "incomeTimeframe",
    currentIncome: "currentIncome",
    growthPriority: "growthPriority",
    wealthHorizon: "wealthHorizon",
    wealthTarget: "wealthTarget",
    currentPortfolioValue: "currentPortfolioValue",
    retirementWindow: "retirementWindow",
    retirementOutcome: "retirementOutcome",
    retirementIncomeTarget: "retirementIncomeTarget",
    retirementValueTarget: "retirementValueTarget",
    portfolioSize: "portfolioSize",
    portfolioObjective: "portfolioObjective",
    portfolioIncome: "portfolioIncome",
    familyMilestone: "familyMilestone",
    familyWhen: "familyWhen",
    familyOutcome: "familyOutcome",
    familyValueTarget: "familyValueTarget",
    familyIncomeTarget: "familyIncomeTarget",
    capital: "capital",
    contributions: "contributions",
    finance: "finance",
  };
  return map[id] ?? null;
}

export function applyAnswer(
  prev: JourneyAnswers,
  key: keyof JourneyAnswers,
  value: string,
): JourneyAnswers {
  if (key === "goal") {
    return {
      ...EMPTY_ANSWERS,
      goal: value as InvestorGoal,
    };
  }
  const next: JourneyAnswers = { ...prev, [key]: value };

  if (key === "experience" && value === "first") {
    next.currentIncome = null;
    next.currentPortfolioValue = null;
    next.portfolioIncome = null;
  }

  if (key === "retirementOutcome") {
    if (!wantsIncomeTarget(next)) next.retirementIncomeTarget = null;
    if (!wantsValueTarget(next)) next.retirementValueTarget = null;
  }
  if (key === "familyOutcome") {
    if (!wantsIncomeTarget(next)) next.familyIncomeTarget = null;
    if (!wantsValueTarget(next)) next.familyValueTarget = null;
  }
  if (key === "portfolioObjective" && !wantsPortfolioIncome(next)) {
    next.portfolioIncome = null;
  }
  if (key === "portfolioSize") {
    next.experience =
      value === "6_plus" ? "owns_3_plus" : "owns_1_2";
  }
  return next;
}

export type HoldingPeriod = 5 | 10 | 15;

export function horizonFromTimeframe(
  timeframe: Timeframe | WealthHorizon | null,
): HoldingPeriod {
  if (timeframe === "within_5" || timeframe === "5") return 5;
  if (
    timeframe === "10_15" ||
    timeframe === "15_20" ||
    timeframe === "20_plus" ||
    timeframe === "15" ||
    timeframe === "15_plus"
  ) {
    return 15;
  }
  return 10;
}

export function selectedHorizon(answers: JourneyAnswers): HoldingPeriod {
  const route = inferredRoute(answers);
  if (route === "income") return horizonFromTimeframe(answers.incomeTimeframe);
  if (route === "wealth") return horizonFromTimeframe(answers.wealthHorizon);
  if (route === "retirement") return horizonFromTimeframe(answers.retirementWindow);
  if (route === "family") return horizonFromTimeframe(answers.familyWhen);
  return 10;
}

export type MatchingRoute =
  | "income"
  | "wealth"
  | "retirement_income"
  | "retirement_value"
  | "retirement_balanced"
  | "portfolio_income"
  | "portfolio_growth"
  | "portfolio_diversify"
  | "portfolio_scale"
  | "family_value"
  | "family_income"
  | "family_balanced"
  | "balanced";

export interface ScoreWeights {
  income: number;
  growth: number;
  affordability: number;
  diversification: number;
}

export function matchingRoute(answers: JourneyAnswers): MatchingRoute {
  const route = inferredRoute(answers);
  if (route === "income") return "income";
  if (route === "wealth") return "wealth";
  if (route === "retirement") {
    if (answers.retirementOutcome === "income") return "retirement_income";
    if (
      answers.retirementOutcome === "value" ||
      answers.retirementOutcome === "legacy"
    ) {
      return "retirement_value";
    }
    return "retirement_balanced";
  }
  if (route === "portfolio") {
    if (answers.portfolioObjective === "income") return "portfolio_income";
    if (answers.portfolioObjective === "growth") return "portfolio_growth";
    if (answers.portfolioObjective === "diversify") return "portfolio_diversify";
    if (answers.portfolioObjective === "scale") return "portfolio_scale";
    return "family_balanced";
  }
  if (route === "family") {
    if (answers.familyOutcome === "income") return "family_income";
    if (answers.familyOutcome === "value") return "family_value";
    return "family_balanced";
  }
  return "balanced";
}

export function weightsForRoute(route: MatchingRoute): ScoreWeights {
  switch (route) {
    case "income":
    case "portfolio_income":
    case "family_income":
      return { income: 70, growth: 20, affordability: 10, diversification: 0 };
    case "wealth":
    case "portfolio_growth":
    case "family_value":
    case "retirement_value":
      return { income: 10, growth: 70, affordability: 20, diversification: 0 };
    case "retirement_income":
      return { income: 65, growth: 20, affordability: 15, diversification: 0 };
    case "retirement_balanced":
      return { income: 40, growth: 40, affordability: 20, diversification: 0 };
    case "portfolio_diversify":
      return { income: 30, growth: 20, affordability: 10, diversification: 40 };
    case "portfolio_scale":
      return { income: 30, growth: 30, affordability: 40, diversification: 0 };
    case "family_balanced":
    case "balanced":
      return { income: 35, growth: 40, affordability: 25, diversification: 0 };
  }
}

export function financeRoutesToRun(
  choice: FinanceChoice | null,
): FinanceRoute[] {
  if (choice === "cash") return ["Cash"];
  if (choice === "mortgage") return ["Mortgage"];
  return ["Mortgage", "Cash"];
}

export function buyingPowerFromCapital(
  safeCapital: number,
  isMortgage: boolean,
  ltv: number,
): number {
  if (!isMortgage) return safeCapital;
  if (ltv >= 100) return safeCapital;
  const equityPct = 1 - ltv / 100;
  if (equityPct <= 0) return safeCapital;
  return Math.round(safeCapital / equityPct);
}

export interface PlanContext {
  answers: JourneyAnswers;
  route: InvestorGoal;
  matching: MatchingRoute;
  weights: ScoreWeights;
  firstTime: boolean;
  existingInvestor: boolean;
  safeCapital: number;
  planningCapital: number;
  capitalLabel: string;
  horizon: HoldingPeriod;
  incomeTargetMid: number | null;
  valueTargetMid: number | null;
  currentIncomeMid: number | null;
  currentValueMid: number | null;
  contributionLabel: string;
  contributionPlanning: number | null;
  finance: FinanceChoice;
  goalLabel: string;
  routeLabel: string;
}

export function buildPlanContext(answers: JourneyAnswers): PlanContext | null {
  if (!answers.goal || !answers.capital || !answers.finance) return null;
  const capital = CAPITAL_VALUES[answers.capital];
  const contrib = answers.contributions
    ? CONTRIBUTION_VALUES[answers.contributions]
    : CONTRIBUTION_VALUES.none;
  const route = inferredRoute(answers);
  const matching = matchingRoute(answers);

  return {
    answers,
    route,
    matching,
    weights: weightsForRoute(matching),
    firstTime: isFirstTime(answers.experience),
    existingInvestor: isExistingInvestor(answers.experience) || route === "portfolio",
    safeCapital: capital.hard,
    planningCapital: capital.planning,
    capitalLabel: capital.label,
    horizon: selectedHorizon(answers),
    incomeTargetMid: selectedIncomeTarget(answers),
    valueTargetMid: selectedValueTarget(answers),
    currentIncomeMid: currentIncomePlanning(answers),
    currentValueMid: VALUE_MIDPOINT[answers.currentPortfolioValue ?? "not_sure"],
    contributionLabel: contrib.label,
    contributionPlanning: contrib.planning,
    finance: answers.finance,
    goalLabel: goalSentence(answers),
    routeLabel: routeTitle(route, answers),
  };
}

function currentIncomePlanning(answers: JourneyAnswers): number | null {
  if (answers.currentIncome) return CURRENT_INCOME_MIDPOINT[answers.currentIncome];
  if (answers.portfolioIncome) return CURRENT_INCOME_MIDPOINT[answers.portfolioIncome];
  return isExistingInvestor(answers.experience) || answers.goal === "portfolio"
    ? null
    : 0;
}

function selectedIncomeTarget(answers: JourneyAnswers): number | null {
  const route = inferredRoute(answers);
  if (route === "income") return MONTHLY_MIDPOINT[answers.incomeTarget ?? "not_sure"];
  if (route === "retirement") {
    return MONTHLY_MIDPOINT[answers.retirementIncomeTarget ?? "not_sure"];
  }
  if (route === "family") {
    return MONTHLY_MIDPOINT[answers.familyIncomeTarget ?? "not_sure"];
  }
  return null;
}

function selectedValueTarget(answers: JourneyAnswers): number | null {
  const route = inferredRoute(answers);
  if (route === "wealth") return VALUE_MIDPOINT[answers.wealthTarget ?? "not_sure"];
  if (route === "retirement") {
    return VALUE_MIDPOINT[answers.retirementValueTarget ?? "not_sure"];
  }
  if (route === "family") {
    return VALUE_MIDPOINT[answers.familyValueTarget ?? "not_sure"];
  }
  return null;
}

function goalSentence(answers: JourneyAnswers): string {
  const route = inferredRoute(answers);
  if (answers.goal === "unsure") {
    const priority = labelFor(UNSURE_PRIORITY_OPTIONS, answers.unsurePriority);
    return priority
      ? `Still exploring · ${priority}`
      : "Still exploring";
  }
  if (route === "income") {
    const band = labelFor(INCOME_TARGET_OPTIONS, answers.incomeTarget);
    const when = labelFor(INCOME_TIMEFRAME_OPTIONS, answers.incomeTimeframe);
    if (band && when && answers.incomeTarget !== "not_sure") {
      return `Generate ${band} per month in property income ${when.toLowerCase()}`;
    }
    return "Generate regular passive income from property";
  }
  if (route === "wealth") {
    const horizon = labelFor(WEALTH_HORIZON_OPTIONS, answers.wealthHorizon);
    const target = labelFor(VALUE_BAND_OPTIONS, answers.wealthTarget);
    if (target && answers.wealthTarget && answers.wealthTarget !== "no_target") {
      return `Build long-term property wealth toward ${target}${horizon ? ` over ${horizon}` : ""}`;
    }
    return `Build long-term property wealth${horizon ? ` over ${horizon}` : ""}`;
  }
  if (route === "retirement") {
    const when = labelFor(RETIREMENT_WINDOW_OPTIONS, answers.retirementWindow);
    const outcome = labelFor(RETIREMENT_OUTCOME_OPTIONS, answers.retirementOutcome);
    return `Plan for retirement${when ? ` ${when.toLowerCase()}` : ""}${outcome ? ` · ${outcome.toLowerCase()}` : ""}`;
  }
  if (route === "portfolio") {
    const obj = labelFor(PORTFOLIO_OBJECTIVE_OPTIONS, answers.portfolioObjective);
    return obj
      ? `Grow the existing portfolio · ${obj.toLowerCase()}`
      : "Improve the existing property portfolio";
  }
  const milestone = labelFor(FAMILY_MILESTONE_OPTIONS, answers.familyMilestone);
  const when = labelFor(FAMILY_WHEN_OPTIONS, answers.familyWhen);
  return `Invest for ${milestone ? milestone.toLowerCase() : "family / future"}${when ? ` · ${when.toLowerCase()}` : ""}`;
}

function routeTitle(route: InvestorGoal, answers: JourneyAnswers): string {
  if (route === "income") return "Income-led";
  if (route === "wealth") return "Growth-led";
  if (route === "retirement") {
    if (answers.retirementOutcome === "income") return "Retirement income";
    if (answers.retirementOutcome === "value" || answers.retirementOutcome === "legacy") {
      return "Retirement value";
    }
    return "Retirement · balanced";
  }
  if (route === "portfolio") return "Next acquisition";
  if (route === "family") return "Long-horizon";
  return "Balanced starting route";
}

export function financeLabel(choice: FinanceChoice, resolved?: FinanceRoute): string {
  if (choice === "cash") return "Cash";
  if (choice === "mortgage") return "Mortgage";
  if (choice === "both") {
    return resolved ? `Both compared · ${resolved} shown` : "Mortgage and cash compared";
  }
  return resolved ? `Recommended · ${resolved}` : "Recommended for you";
}

export function nextMilestoneCopy(ctx: PlanContext): string {
  if (ctx.route === "portfolio") {
    return "Review how this acquisition changes the portfolio, then decide whether the following purchase should add income, growth or a new market.";
  }
  if (ctx.contributionPlanning && ctx.contributionPlanning > 0) {
    return "After this purchase, continued contributions could support a second acquisition toward the same goal.";
  }
  if (ctx.answers.contributions === "staged") {
    return "Staged contributions can be mapped onto a payment plan with your advisor once a property is reserved.";
  }
  if (ctx.route === "income" || ctx.matching === "retirement_income") {
    return "The next milestone is usually a second income-producing purchase once this property is in place.";
  }
  if (ctx.route === "family") {
    return "This is the first step toward the selected milestone. The following review is at the chosen horizon.";
  }
  return "Once this property is in the plan, the next review is whether a further purchase or a change in finance would close more of the remaining gap.";
}

export function suggestedRouteCopy(ctx: PlanContext): string {
  if (ctx.answers.goal === "unsure") {
    return "A balanced starting route until you choose a clearer goal. We rank properties on income, growth and affordability together.";
  }
  if (ctx.route === "income") {
    return "Rank eligible properties primarily for net income and yield, within today's buying power.";
  }
  if (ctx.route === "wealth") {
    return "Rank eligible properties primarily for projected capital growth over the selected horizon.";
  }
  if (ctx.route === "retirement") {
    return "Shape the recommendation around the retirement outcome you selected, using the matching horizon.";
  }
  if (ctx.route === "portfolio") {
    return "Recommend the next acquisition that best improves the stated portfolio objective, rather than the strongest standalone property.";
  }
  return "Rank properties by how they contribute to the future milestone over the selected horizon.";
}

export interface GoalContribution {
  kind: "income" | "value" | "none";
  copy: string;
  ratio: number | null;
  alreadyMet: boolean;
}

export function contributionForProperty(
  ctx: PlanContext,
  netMonthlyIncome: number,
  projectedValue: number,
): GoalContribution {
  const noTarget: GoalContribution = {
    kind: "none",
    copy: "No fixed target was set, so we explain the strongest income, growth and affordability characteristics instead of a progress figure.",
    ratio: null,
    alreadyMet: false,
  };

  const incomeLed =
    ctx.matching === "income" ||
    ctx.matching === "retirement_income" ||
    ctx.matching === "portfolio_income" ||
    ctx.matching === "family_income";
  const valueLed =
    ctx.matching === "wealth" ||
    ctx.matching === "retirement_value" ||
    ctx.matching === "portfolio_growth" ||
    ctx.matching === "family_value";

  if (incomeLed && ctx.incomeTargetMid != null) {
    const current = Math.max(0, ctx.currentIncomeMid ?? 0);
    if (current >= ctx.incomeTargetMid) {
      return {
        kind: "income",
        copy: "The selected income target is already met on the figures provided. This property is framed as maintaining or extending that income.",
        ratio: null,
        alreadyMet: true,
      };
    }
    const gap = ctx.incomeTargetMid - current;
    const ratio = Math.min(1, netMonthlyIncome / gap);
    return {
      kind: "income",
      copy: `Could contribute approximately ${Math.round(ratio * 100)}% of the midpoint of your selected monthly income goal.`,
      ratio,
      alreadyMet: false,
    };
  }

  if (valueLed && ctx.valueTargetMid != null) {
    const current = Math.max(0, ctx.currentValueMid ?? 0);
    if (current >= ctx.valueTargetMid) {
      return {
        kind: "value",
        copy: "The selected wealth target is already met on the figures provided. This property is framed as maintaining or extending that position.",
        ratio: null,
        alreadyMet: true,
      };
    }
    const gap = ctx.valueTargetMid - current;
    const ratio = Math.min(1, projectedValue / gap);
    return {
      kind: "value",
      copy: `The projected value at your ${ctx.horizon}-year horizon could contribute approximately ${Math.round(ratio * 100)}% of the remaining midpoint of your selected wealth target.`,
      ratio,
      alreadyMet: false,
    };
  }

  return noTarget;
}

export function annualGrowthFromOpportunity(capitalGrowth5Y: number): number {
  return Math.round((Math.pow(1 + capitalGrowth5Y / 100, 1 / 5) * 100 - 100) * 10) / 10;
}
