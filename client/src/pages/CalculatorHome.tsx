// Joseph Mews — Start My Journey (goal-led calculator)
// Questions branch on goal + experience. Affordability still uses the
// existing projection / cash-required engine. Ranking is deterministic.

import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ContactAdvisorSheet } from "@/components/ContactAdvisorSheet";
import {
  matchForInvestorPlan,
  type PlanMatch,
} from "@/lib/calculatorMatching";
import { fmt } from "@/lib/data";
import { opportunities } from "@/lib/explore";
import { getActiveProperties } from "@/lib/holdings";
import {
  JOURNEY_PHASES,
  EMPTY_ANSWERS,
  annualGrowthFromOpportunity,
  answerKeyForScreen,
  applyAnswer,
  buildPlanContext,
  buyingPowerFromCapital,
  financeLabel,
  firstScreenInPhase,
  getJourneyScreens,
  getScreenCopy,
  isFirstTime,
  layoutForScreen,
  nextMilestoneCopy,
  optionsForScreen,
  phaseForScreen,
  suggestedLtv,
  suggestedRouteCopy,
  type ChoiceLayout,
  type FinanceChoice,
  type HoldingPeriod,
  type JourneyAnswers,
  type JourneyPhase,
  type Option,
  type ScreenId,
} from "@/lib/investorJourney";
import { projectInvestment, type ProjectionYear } from "@/lib/projection";
import {
  getMortgageRate,
  getSdltRate,
  RESIDENCIES,
  type Residency,
} from "@/lib/residencyRates";
import { isInvestor } from "@/lib/session";
import {
  Area,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowRight,
  ChevronDown,
  Info,
  Sparkle,
  Check,
  TrendingUp,
} from "lucide-react";

type MortgageType = "Interest-only" | "Repayment";

const HOLDING_PERIODS = [5, 10, 15] as const;
const DEFAULT_LTV = 65;

const ASSUMPTIONS = {
  rentalGrowth: 3.0,
  costGrowth: 2.5,
  managementFeePctOfRent: 10,
  serviceChargePctOfValue: 0.5,
};

const LEGAL_FEES = 2500;

function scrollTop() {
  requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
}

export default function CalculatorHome() {
  const [answers, setAnswers] = useState<JourneyAnswers>(EMPTY_ANSWERS);
  const [screenIndex, setScreenIndex] = useState(0);
  const [advisorOpen, setAdvisorOpen] = useState(false);

  const [oppId, setOppId] = useState<string>(opportunities[0].id);
  const [hasSelectedMatch, setHasSelectedMatch] = useState(false);
  const opp = useMemo(
    () => opportunities.find((o) => o.id === oppId) ?? opportunities[0],
    [oppId],
  );
  const [unitType, setUnitType] = useState<string>(opp.unitTypes[0].type);
  const [price, setPrice] = useState<number>(opp.unitTypes[0].fromPrice);

  const [filterCity, setFilterCity] = useState<string>("All");
  const [filterDevelopment, setFilterDevelopment] = useState<string>("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [assumptionsOpen, setAssumptionsOpen] = useState(false);
  const [outlookAssumptionsOpen, setOutlookAssumptionsOpen] = useState(false);

  const [ltv, setLtv] = useState<number>(DEFAULT_LTV);
  const [ltvTouched, setLtvTouched] = useState(false);
  const [mortgageType, setMortgageType] =
    useState<MortgageType>("Interest-only");
  const [residency, setResidency] = useState<Residency | null>(null);
  const [holdingOverride, setHoldingOverride] = useState<HoldingPeriod | null>(
    null,
  );
  const [showYearBreakdown, setShowYearBreakdown] = useState(false);
  const [confirmValue, setConfirmValue] = useState<string | null>(null);
  const advanceTimer = useRef<number | null>(null);

  function clearAdvanceTimer() {
    if (advanceTimer.current != null) {
      window.clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
  }

  function selectionDelayMs() {
    if (typeof window === "undefined") return 520;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? 80
      : 520;
  }

  const screens = useMemo(() => getJourneyScreens(answers), [answers]);
  const screenId: ScreenId = screens[Math.min(screenIndex, screens.length - 1)]!;
  const phase = phaseForScreen(screenId);
  const firstTime = isFirstTime(answers.experience);
  const copy = getScreenCopy(screenId, firstTime);
  const questionScreens = screens.filter(
    (id) => id !== "plan" && id !== "returns" && id !== "projection",
  );
  const questionNumber = questionScreens.findIndex((id) => id === screenId) + 1;

  const ctx = useMemo(() => buildPlanContext(answers), [answers]);
  const holding: HoldingPeriod = holdingOverride ?? ctx?.horizon ?? 10;
  const inferredLtv = suggestedLtv(answers);

  useEffect(() => {
    if (!ltvTouched) setLtv(inferredLtv);
  }, [inferredLtv, ltvTouched]);
  const finance: FinanceChoice = answers.finance ?? "recommend";
  const rateResidency: Residency = residency ?? "UK";
  const mortgageRate = getMortgageRate(rateResidency);
  const sdltRate = getSdltRate(rateResidency);

  const ownedCities = useMemo(() => {
    if (!isInvestor()) return [];
    return getActiveProperties().map((p) => p.city);
  }, []);

  const matchResult = useMemo(() => {
    if (!ctx) {
      return {
        exact: [] as PlanMatch[],
        stretch: [] as PlanMatch[],
        resolvedRoute: "Mortgage" as const,
      };
    }
    return matchForInvestorPlan({
      opportunities,
      ctx,
      ltv,
      sdltRate,
      legalFees: LEGAL_FEES,
      ownedCities,
      cityFilter: filterCity,
      developmentFilter: filterDevelopment || null,
    });
  }, [ctx, ltv, sdltRate, ownedCities, filterCity, filterDevelopment]);

  const { exact: exactMatches, stretch: stretchMatches, resolvedRoute } =
    matchResult;
  const isMortgage = resolvedRoute === "Mortgage";
  const deposit = ctx?.safeCapital ?? 0;
  const budget = useMemo(
    () => buyingPowerFromCapital(deposit, isMortgage, ltv),
    [deposit, isMortgage, ltv],
  );

  const selectedMatch =
    exactMatches.find((m) => m.opportunity.id === oppId) ??
    stretchMatches.find((m) => m.opportunity.id === oppId) ??
    null;

  const annualGrowth = annualGrowthFromOpportunity(opp.capitalGrowth5Y);
  const monthlyRent = useMemo(() => {
    const annual = price * (opp.grossYield / 100);
    return Math.round(annual / 12);
  }, [price, opp.grossYield]);
  const annualGrossRent = monthlyRent * 12;
  const annualServiceCharge = Math.round(
    price * (ASSUMPTIONS.serviceChargePctOfValue / 100),
  );
  const annualManagementFee = Math.round(
    annualGrossRent * (ASSUMPTIONS.managementFeePctOfRent / 100),
  );
  const loanAmount = isMortgage ? Math.round(price * (ltv / 100)) : 0;
  const budgetLoan = isMortgage ? Math.max(0, budget - deposit) : 0;
  const annualMortgageInterest = isMortgage
    ? Math.round(loanAmount * (mortgageRate / 100))
    : 0;
  const annualMortgageRepayment = useMemo(() => {
    if (!isMortgage || loanAmount === 0) return 0;
    const r = mortgageRate / 100;
    const n = 25;
    if (r === 0) return Math.round(loanAmount / n);
    return Math.round((loanAmount * r) / (1 - Math.pow(1 + r, -n)));
  }, [isMortgage, loanAmount, mortgageRate]);
  const annualMortgage =
    mortgageType === "Repayment"
      ? annualMortgageRepayment
      : annualMortgageInterest;

  const monthlyMortgage = useMemo(() => {
    if (!isMortgage || budgetLoan === 0) return 0;
    const r = mortgageRate / 100;
    if (mortgageType === "Interest-only") {
      return Math.round((budgetLoan * r) / 12);
    }
    const i = r / 12;
    const n = 25 * 12;
    if (i === 0) return Math.round(budgetLoan / n);
    return Math.round((budgetLoan * i) / (1 - Math.pow(1 + i, -n)));
  }, [isMortgage, budgetLoan, mortgageRate, mortgageType]);

  const result = useMemo(
    () =>
      projectInvestment(
        {
          startValue: price,
          annualGrowth,
          annualGrossRent,
          rentalGrowth: ASSUMPTIONS.rentalGrowth,
          annualServiceCharge,
          annualManagementFee,
          annualMortgage,
          costGrowth: ASSUMPTIONS.costGrowth,
        },
        holding,
      ),
    [
      price,
      annualGrowth,
      annualGrossRent,
      annualServiceCharge,
      annualManagementFee,
      annualMortgage,
      holding,
    ],
  );

  const annualCosts =
    annualServiceCharge + annualManagementFee + annualMortgage;
  const netAnnualIncome = annualGrossRent - annualCosts;
  const netMonthlyIncome = Math.round(netAnnualIncome / 12);
  const grossYieldPct = price > 0 ? (annualGrossRent / price) * 100 : 0;
  const sdlt = Math.round(price * sdltRate);
  const cashDeposit = price - loanAmount;
  const initialCashRequired = cashDeposit + sdlt + LEGAL_FEES;

  useEffect(() => {
    if (!hasSelectedMatch) return;
    const stillExact = exactMatches.some((m) => m.opportunity.id === oppId);
    if (!stillExact) setHasSelectedMatch(false);
  }, [exactMatches, oppId, hasSelectedMatch]);

  useEffect(() => {
    if (screenIndex >= screens.length) {
      setScreenIndex(Math.max(0, screens.length - 1));
    }
  }, [screenIndex, screens.length]);

  const chartData = useMemo(() => {
    return [
      { label: "Now", propertyValue: price, cumulativeIncome: 0 },
      ...result.years.map((y) => ({
        label: `Yr ${y.year}`,
        propertyValue: y.propertyValue,
        cumulativeIncome: y.cumulativeNetIncome,
      })),
    ];
  }, [price, result.years]);

  const contribution = selectedMatch?.contribution ?? null;

  function goToScreen(id: ScreenId) {
    clearAdvanceTimer();
    setConfirmValue(null);
    const idx = screens.indexOf(id);
    if (idx >= 0) {
      setScreenIndex(idx);
      scrollTop();
    }
  }

  function advanceFrom(nextAnswers: JourneyAnswers, fromScreen: ScreenId) {
    clearAdvanceTimer();
    setConfirmValue(null);
    const nextScreens = getJourneyScreens(nextAnswers);
    const idx = nextScreens.indexOf(fromScreen);
    if (idx >= 0 && idx + 1 < nextScreens.length) {
      setScreenIndex(idx + 1);
      scrollTop();
    }
  }

  function scheduleAdvance(nextAnswers: JourneyAnswers, fromScreen: ScreenId) {
    clearAdvanceTimer();
    advanceTimer.current = window.setTimeout(() => {
      advanceFrom(nextAnswers, fromScreen);
    }, selectionDelayMs());
  }

  useEffect(() => {
    return () => clearAdvanceTimer();
  }, []);

  function goNext() {
    if (screenIndex >= screens.length - 1) return;
    const key = answerKeyForScreen(screenId);
    if (key && !answers[key]) return;
    if (screenId === "finance" && answers.finance === "mortgage" && !residency) {
      return;
    }
    if (answers.finance === "recommend" && !residency) setResidency("UK");
    advanceFrom(answers, screenId);
  }

  function goBack() {
    if (screenIndex === 0) return;
    clearAdvanceTimer();
    setConfirmValue(null);
    setScreenIndex((s) => s - 1);
    scrollTop();
  }

  function startAgain() {
    clearAdvanceTimer();
    setConfirmValue(null);
    setAnswers(EMPTY_ANSWERS);
    setScreenIndex(0);
    setHasSelectedMatch(false);
    setHoldingOverride(null);
    setFiltersOpen(false);
    setLtvTouched(false);
    setLtv(DEFAULT_LTV);
    scrollTop();
  }

  function selectOption(value: string) {
    const key = answerKeyForScreen(screenId);
    if (!key) return;
    const nextAnswers = applyAnswer(answers, key, value);
    const nextResidency =
      key === "finance" && value === "recommend" && !residency ? "UK" : residency;
    if (nextResidency !== residency) setResidency(nextResidency);
    setAnswers(nextAnswers);
    setHoldingOverride(null);
    setConfirmValue(value);

    const needsResidency =
      screenId === "finance" &&
      (value === "mortgage" || value === "both") &&
      !nextResidency;
    if (needsResidency) {
      clearAdvanceTimer();
      return;
    }
    scheduleAdvance(nextAnswers, screenId);
  }

  function selectResidency(value: Residency) {
    setResidency(value);
    setConfirmValue(value);
    if (!answers.finance) {
      clearAdvanceTimer();
      return;
    }
    scheduleAdvance(answers, screenId);
  }

  function selectPhase(nextPhase: JourneyPhase) {
    const target = firstScreenInPhase(screens, nextPhase);
    if (!target) return;
    const targetIdx = screens.indexOf(target);
    for (let i = 0; i < targetIdx; i++) {
      const key = answerKeyForScreen(screens[i]);
      if (key && !answers[key]) return;
    }
    if (nextPhase === "plan" && answers.finance === "mortgage" && !residency) {
      return;
    }
    setScreenIndex(targetIdx);
    scrollTop();
  }

  function selectMatch(match: PlanMatch) {
    const o = match.opportunity;
    const firstUnit = o.unitTypes[0];
    setOppId(o.id);
    setUnitType(firstUnit.type);
    setPrice(o.fromPrice);
    setHasSelectedMatch(true);
    setConfirmValue(o.id);
    clearAdvanceTimer();
    advanceTimer.current = window.setTimeout(() => {
      setConfirmValue(null);
      goToScreen("returns");
    }, selectionDelayMs());
  }

  const selectedValue = (() => {
    const key = answerKeyForScreen(screenId);
    if (!key) return null;
    return answers[key];
  })();

  const financeBlocked =
    screenId === "finance" && answers.finance === "mortgage" && !residency;
  const isQuestion = Boolean(answerKeyForScreen(screenId));
  const continueEnabled = isQuestion
    ? Boolean(selectedValue) && !financeBlocked
    : screenId === "returns";
  const continueLabel =
    screenId === "finance"
      ? "See My Plan"
      : screenId === "returns"
        ? "View Long-Term Outlook"
        : "Continue";

  return (
    <AppShell>
      <div className="page-px">
        <WizardProgress
          current={phase}
          onSelect={selectPhase}
        />

        <div className="pt-2 pb-7 animate-fade-up" key={`hdr-${screenId}`}>
          <p className="label-eyebrow mb-3">
            {screenId === "plan" && "Your investment plan"}
            {screenId === "returns" && `Quick look · ${opp.name}`}
            {screenId === "projection" &&
              `Your ${holding}-year investment outlook`}
            {questionNumber > 0 &&
              screenId !== "plan" &&
              screenId !== "returns" &&
              screenId !== "projection" &&
              `Question ${questionNumber} of ${questionScreens.length} · ${copy.caption}`}
          </p>
          <h1 className="font-serif text-[26px] sm:text-[28px] leading-tight mb-3">
            {screenId === "plan" && "Your Investment Plan"}
            {screenId === "returns" && `${opp.name}`}
            {screenId === "projection" &&
              `Your ${holding}-year investment outlook`}
            {screenId !== "plan" &&
              screenId !== "returns" &&
              screenId !== "projection" &&
              copy.prompt}
          </h1>
          {copy.helper &&
            screenId !== "plan" &&
            screenId !== "returns" &&
            screenId !== "projection" && (
              <p className="text-[15px] text-muted-foreground leading-relaxed max-w-[42ch]">
                {copy.helper}
              </p>
            )}
          {isQuestion && (
            <p className="text-[13px] text-muted-foreground/80 mt-3">
              Tap an answer to continue.
            </p>
          )}
          {screenId === "plan" && ctx && (
            <p className="text-[13px] text-muted-foreground leading-relaxed max-w-[40ch]">
              {ctx.goalLabel}
            </p>
          )}
          {screenId === "returns" && (
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              {opp.city} · {resolvedRoute} route
            </p>
          )}
        </div>

        {answerKeyForScreen(screenId) && (
          <ChoiceGroup
            options={optionsForScreen(screenId)}
            selected={selectedValue}
            confirming={confirmValue}
            onSelect={selectOption}
            layout={layoutForScreen(screenId)}
            preferRecommended={firstTime && screenId === "finance"}
          />
        )}

        {screenId === "finance" &&
          (answers.finance === "mortgage" || answers.finance === "both") && (
          <div className="mb-8 animate-fade-up">
            <div className="flex items-baseline justify-between mb-3">
              <span className="label-eyebrow">Where are you currently resident?</span>
              {residency && (
                <span className="text-[10px] text-muted-foreground/70 tabular-nums">
                  Indicative · {mortgageRate.toFixed(2)}%
                </span>
              )}
            </div>
            <ChoiceGroup
              options={RESIDENCIES.map((r) => ({ value: r, label: r }))}
              selected={residency}
              confirming={confirmValue}
              onSelect={(v) => selectResidency(v as Residency)}
              layout="grid"
            />
            <p className="text-[13px] text-muted-foreground/80 leading-relaxed mt-1">
              Residency sets your illustrative mortgage rate and SDLT treatment.
              You can change this later under Adjust assumptions.
            </p>
            {answers.finance === "mortgage" && !residency && (
              <p className="text-[11px] text-primary/90 mt-2">
                Select residency to continue.
              </p>
            )}
          </div>
        )}

        {screenId === "plan" && ctx && (
          <div key="plan" className="animate-fade-up">
            <PlanSummary
              goal={ctx.goalLabel}
              position={`${ctx.capitalLabel} available${ctx.existingInvestor ? " · existing portfolio considered" : ""}`}
              route={ctx.routeLabel}
              routeDetail={suggestedRouteCopy(ctx)}
              finance={financeLabel(ctx.finance, resolvedRoute)}
              budget={budget}
              isMortgage={isMortgage}
              deposit={deposit}
              ltv={ltv}
              loanAmount={budgetLoan}
              monthlyMortgage={monthlyMortgage}
              mortgageType={mortgageType}
              firstTime={firstTime}
              onChangeGoal={() => goToScreen("goal")}
              onStartAgain={startAgain}
            />

            <AdjustAssumptions
              open={assumptionsOpen}
              setOpen={setAssumptionsOpen}
              ltv={ltv}
              setLtv={(n) => {
                setLtvTouched(true);
                setLtv(n);
              }}
              suggestedLtvValue={inferredLtv}
              mortgageType={mortgageType}
              setMortgageType={setMortgageType}
              residency={residency}
              setResidency={setResidency}
              mortgageRate={mortgageRate}
              isMortgage={isMortgage}
            />

            <CityChips
              value={filterCity}
              onChange={setFilterCity}
              cities={Array.from(new Set(opportunities.map((o) => o.city))).sort()}
            />

            <MatchedOpportunities
              exact={exactMatches}
              stretch={stretchMatches}
              budget={budget}
              selectedId={hasSelectedMatch ? oppId : null}
              confirmingId={confirmValue}
              showRoute={ctx.finance === "both"}
              firstTime={firstTime}
              onSelect={selectMatch}
              onEditFinance={() => goToScreen("finance")}
              onEditCapital={() => goToScreen("capital")}
              onSpeakToAdvisor={() => setAdvisorOpen(true)}
            />

            <div className="mb-9">
              <button
                onClick={() => setFiltersOpen((o) => !o)}
                className="tap press w-full flex items-center justify-between py-3 border-t border-b border-border text-[10px] tracking-[0.18em] uppercase text-muted-foreground active:text-foreground transition-colors"
                aria-expanded={filtersOpen}
              >
                <span>Optional filters</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${
                    filtersOpen ? "rotate-180" : ""
                  }`}
                  strokeWidth={1.5}
                />
              </button>
              {filtersOpen && (
                <div className="space-y-5 mt-5 animate-fade-up">
                  <SelectField
                    label="City"
                    value={filterCity}
                    onChange={setFilterCity}
                    options={[
                      { value: "All", label: "All cities" },
                      ...Array.from(new Set(opportunities.map((o) => o.city)))
                        .sort()
                        .map((c) => ({ value: c, label: c })),
                    ]}
                  />
                  <SelectField
                    label="Development"
                    value={filterDevelopment}
                    onChange={setFilterDevelopment}
                    options={[
                      { value: "", label: "Any development" },
                      ...opportunities
                        .filter((o) => o.status === "Available")
                        .map((o) => ({
                          value: o.id,
                          label: `${o.name} · ${o.city}`,
                        })),
                    ]}
                  />
                  {hasSelectedMatch && (
                    <>
                      <SelectField
                        label="Unit Type"
                        value={unitType}
                        onChange={(v) => {
                          setUnitType(v);
                          const u = opp.unitTypes.find((x) => x.type === v);
                          if (u) setPrice(u.fromPrice);
                        }}
                        options={opp.unitTypes.map((u) => ({
                          value: u.type,
                          label: `${u.type} · from ${fmt.currency(u.fromPrice)}`,
                        }))}
                      />
                      <CurrencyField
                        label="Purchase Price"
                        value={price}
                        onChange={setPrice}
                      />
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {screenId === "returns" && ctx && (
          <div key="returns" className="animate-fade-up">
            {firstTime && (
              <p className="text-[12.5px] text-muted-foreground leading-relaxed mb-6">
                Why this property is a suitable next step comes first. The
                detailed figures underneath are estimates, not a quote.
              </p>
            )}

            <WhyThisFits
              reasons={selectedMatch?.reasons ?? []}
            />

            {contribution && contribution.kind !== "none" && (
              <div className="mb-7 rounded-sm border border-primary/40 bg-primary/[0.04] px-4 py-4">
                <p className="label-eyebrow !text-primary/85 mb-2">
                  Progress towards the goal
                </p>
                <p className="text-[13px] leading-relaxed text-foreground/90">
                  {contribution.copy}
                </p>
              </div>
            )}

            <QuickReturnSummary
              oppName={opp.name}
              oppCity={opp.city}
              holding={holding}
              totalReturn={result.totalReturn}
              netMonthlyIncome={netMonthlyIncome}
              grossYield={grossYieldPct}
              monthlyRent={monthlyRent}
              firstTime={firstTime}
              onView={() => goToScreen("projection")}
            />

            <p className="text-[12.5px] text-muted-foreground leading-relaxed mb-7">
              {nextMilestoneCopy(ctx)}
            </p>

            <div className="border-t border-border pt-7 mb-7">
              <p className="label-eyebrow mb-1.5">Detail</p>
              <h2 className="font-serif text-xl tracking-tight mb-6">
                Detailed results
              </h2>
              <div className="px-5 py-6 rounded-sm border border-border bg-card/40 mb-6">
                <p className="label-eyebrow mb-3">Total Return · {holding}Y</p>
                <p className="font-serif num-display tabular-nums leading-none text-primary mb-2">
                  {fmt.currency(result.totalReturn)}
                </p>
                <p className="text-[12px] text-muted-foreground tabular-nums">
                  +{result.totalReturnPct.toFixed(0)}% on {fmt.currency(price)} ·
                  capital + cumulative income
                </p>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-7">
                <Output
                  label="Monthly Rental Income"
                  value={fmt.currency(monthlyRent)}
                  sub="Year 1 · gross"
                />
                <Output
                  label="Annual Rental Income"
                  value={fmt.currency(annualGrossRent)}
                  sub="Year 1 · gross"
                />
                <Output
                  label="Net Monthly Income"
                  value={fmt.currency(netMonthlyIncome)}
                  sub="After all costs"
                />
                <Output
                  label="Gross Yield"
                  value={`${grossYieldPct.toFixed(2)}%`}
                  sub={firstTime ? "Annual rent as a share of price" : "Year 1"}
                />
                <Output
                  label="Initial Cash Required"
                  value={fmt.currency(initialCashRequired)}
                  sub={isMortgage ? "Deposit + SDLT + fees" : "Price + SDLT + fees"}
                />
                <Output
                  label="Projected Future Value"
                  value={fmt.currency(result.endValue)}
                  sub={`Year ${holding}`}
                  tone="primary"
                />
                <Output
                  label="Buying Power"
                  value={fmt.currency(budget)}
                  sub={isMortgage ? `${ltv}% LTV` : "Cash purchase"}
                />
              </div>
            </div>
          </div>
        )}

        {screenId === "projection" && (
          <div key="projection" className="animate-fade-up">
            <FinalOutlook
              oppName={opp.name}
              oppCity={opp.city}
              holding={holding}
              setHolding={(v) => setHoldingOverride(v)}
              chartData={chartData}
              years={result.years}
              annualGrowth={annualGrowth}
              totalReturn={result.totalReturn}
              totalCapitalGain={result.totalCapitalGain}
              totalNetIncome={result.totalNetIncome}
              assumptionsOpen={outlookAssumptionsOpen}
              setAssumptionsOpen={setOutlookAssumptionsOpen}
              breakdownOpen={showYearBreakdown}
              setBreakdownOpen={setShowYearBreakdown}
              isMortgage={isMortgage}
              mortgageRate={mortgageRate}
              onSpeakToAdvisor={() => setAdvisorOpen(true)}
            />
          </div>
        )}

        <WizardNav
          screenId={screenId}
          canBack={screenIndex > 0}
          canContinue={continueEnabled}
          continueLabel={continueLabel}
          onBack={goBack}
          onNext={goNext}
        />

        <div className="mt-5 mb-4 flex items-start gap-2.5">
          <Info
            className="w-3.5 h-3.5 text-muted-foreground/70 mt-0.5 shrink-0"
            strokeWidth={1.5}
          />
          <p className="text-[11px] leading-relaxed text-muted-foreground/80">
            Projections are estimates based on current assumptions and are for
            illustrative purposes only. Selected bands are shown as ranges;
            calculations remain indicative. SDLT and fees are not a quote.
          </p>
        </div>
        <div className="h-8" />
      </div>

      {advisorOpen && (
        <ContactAdvisorSheet opp={opp} onClose={() => setAdvisorOpen(false)} />
      )}
    </AppShell>
  );
}

function ChoiceGroup({
  options,
  selected,
  confirming = null,
  onSelect,
  layout,
  preferRecommended = false,
}: {
  options: Option<string>[];
  selected: string | null;
  confirming?: string | null;
  onSelect: (value: string) => void;
  layout: ChoiceLayout;
  preferRecommended?: boolean;
}) {
  return (
    <div
      role="radiogroup"
      className={`mb-8 ${
        layout === "stack"
          ? "space-y-3"
          : layout === "chips"
            ? "flex flex-wrap gap-2.5"
            : "grid grid-cols-2 gap-2.5"
      }`}
    >
      {options.map((o) => {
        const active = selected === o.value;
        const isConfirming = confirming === o.value;
        const highlight = o.recommended && preferRecommended && !selected;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onSelect(o.value)}
            className={`tap text-left rounded-sm border min-h-[56px] transition-[border-color,background-color,opacity] duration-300 ${
              layout === "chips"
                ? "px-4 py-3 flex-1 min-w-[30%]"
                : "w-full px-4 py-4"
            } ${
              active
                ? "border-primary text-primary bg-primary/10"
                : highlight
                  ? "border-primary/40 text-foreground bg-primary/[0.04]"
                  : "border-border text-foreground/90"
            } ${isConfirming ? "choice-confirm" : ""} ${
              confirming && !isConfirming ? "opacity-45" : "opacity-100"
            }`}
          >
            <span className="flex items-start gap-3.5">
              {layout !== "chips" && (
                <span
                  className={`mt-0.5 w-[18px] h-[18px] rounded-full border shrink-0 flex items-center justify-center ${
                    active ? "border-primary bg-primary" : "border-border"
                  }`}
                >
                  {active && (
                    <Check
                      className={`w-3 h-3 text-primary-foreground ${
                        isConfirming ? "choice-check-in" : ""
                      }`}
                      strokeWidth={3}
                    />
                  )}
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`leading-snug ${
                      layout === "chips"
                        ? "text-[15px] font-medium"
                        : "text-[16px]"
                    }`}
                  >
                    {o.label}
                  </span>
                  {o.recommended && (
                    <span className="text-[10px] tracking-[0.14em] uppercase text-primary">
                      Suggested
                    </span>
                  )}
                </span>
                {o.hint && layout !== "chips" && (
                  <span className="block text-[13px] text-muted-foreground leading-relaxed mt-1">
                    {o.hint}
                  </span>
                )}
              </span>
              {layout === "chips" && active && (
                <Check
                  className={`w-4 h-4 text-primary shrink-0 mt-0.5 ${
                    isConfirming ? "choice-check-in" : ""
                  }`}
                  strokeWidth={2.5}
                />
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function PlanSummary({
  goal,
  position,
  route,
  routeDetail,
  finance,
  budget,
  isMortgage,
  deposit,
  ltv,
  loanAmount,
  monthlyMortgage,
  mortgageType,
  firstTime,
  onChangeGoal,
  onStartAgain,
}: {
  goal: string;
  position: string;
  route: string;
  routeDetail: string;
  finance: string;
  budget: number;
  isMortgage: boolean;
  deposit: number;
  ltv: number;
  loanAmount: number;
  monthlyMortgage: number;
  mortgageType: MortgageType;
  firstTime: boolean;
  onChangeGoal: () => void;
  onStartAgain: () => void;
}) {
  return (
    <div className="mb-7">
      <div className="rounded-sm border border-primary/40 bg-primary/[0.04] px-5 py-6 mb-4">
        <p className="label-eyebrow !text-primary/85 mb-2">Your goal</p>
        <p className="font-serif text-lg leading-snug mb-4">{goal}</p>
        <div className="grid grid-cols-1 gap-4 pt-4 border-t border-primary/15">
          <PlanRow label="Where you are today" value={position} />
          <PlanRow label="Suggested route" value={route} detail={routeDetail} />
          <PlanRow label="Finance" value={finance} />
        </div>
        <div className="mt-5 pt-5 border-t border-primary/15">
          <p className="label-eyebrow mb-2">Your buying power</p>
          <p className="font-serif num-display tabular-nums leading-none text-primary mb-1">
            {fmt.currency(budget)}
          </p>
          <p className="text-[11px] text-muted-foreground/80 tabular-nums mb-4">
            {isMortgage
              ? `${fmt.currency(deposit)} deposit · ${ltv}% LTV`
              : "Cash purchase · no financing"}
          </p>
          <div className="grid grid-cols-3 gap-x-3">
            <MiniStat label="Deposit" value={fmt.currency(deposit)} />
            <MiniStat
              label="Loan"
              value={isMortgage ? fmt.currency(loanAmount) : "—"}
            />
            <MiniStat
              label="LTV"
              value={isMortgage ? `${ltv}%` : "0%"}
              tone="primary"
            />
          </div>
          {isMortgage && (
            <div className="mt-4 pt-4 border-t border-primary/15 flex items-center justify-between">
              <div>
                <p className="label-eyebrow mb-1">Monthly mortgage</p>
                <p className="text-[10.5px] text-muted-foreground/75">
                  {mortgageType} · 25 yr term
                </p>
              </div>
              <p className="font-serif text-xl tabular-nums">
                {fmt.currency(monthlyMortgage)}
                <span className="text-[11px] text-muted-foreground/70 ml-1">/mo</span>
              </p>
            </div>
          )}
          {firstTime && (
            <p className="text-[11px] text-muted-foreground leading-relaxed mt-3">
              Buying power is the property price we can consider with your
              selected capital and finance route, before choosing a specific
              unit.
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4 mb-2">
        <button
          onClick={onChangeGoal}
          className="tap min-h-[44px] text-[10px] tracking-[0.16em] uppercase text-muted-foreground active:text-foreground"
        >
          Change goal
        </button>
        <button
          onClick={onStartAgain}
          className="tap min-h-[44px] text-[10px] tracking-[0.16em] uppercase text-muted-foreground active:text-foreground"
        >
          Start again
        </button>
      </div>
    </div>
  );
}

function PlanRow({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div>
      <p className="text-[9.5px] tracking-[0.14em] uppercase text-muted-foreground/80 mb-1">
        {label}
      </p>
      <p className="text-[13px] leading-snug">{value}</p>
      {detail && (
        <p className="text-[11.5px] text-muted-foreground leading-relaxed mt-1">
          {detail}
        </p>
      )}
    </div>
  );
}

function AdjustAssumptions({
  open,
  setOpen,
  ltv,
  setLtv,
  suggestedLtvValue,
  mortgageType,
  setMortgageType,
  residency,
  setResidency,
  mortgageRate,
  isMortgage,
}: {
  open: boolean;
  setOpen: (fn: (s: boolean) => boolean) => void;
  ltv: number;
  setLtv: (n: number) => void;
  suggestedLtvValue: 55 | 65 | 75;
  mortgageType: MortgageType;
  setMortgageType: (v: MortgageType) => void;
  residency: Residency | null;
  setResidency: (v: Residency) => void;
  mortgageRate: number;
  isMortgage: boolean;
}) {
  const ltvFill = ((ltv - 50) / 30) * 100;
  return (
    <div className="mb-7">
      <button
        onClick={() => setOpen((s) => !s)}
        className="tap press w-full flex items-center justify-between py-3 border-t border-b border-border text-[10px] tracking-[0.18em] uppercase text-muted-foreground active:text-foreground transition-colors"
        aria-expanded={open}
      >
        <span>Adjust assumptions</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          strokeWidth={1.5}
        />
      </button>
      {open && (
        <div className="space-y-6 mt-5 animate-fade-up">
          {isMortgage && (
            <>
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="label-eyebrow">Residency</span>
                  <span className="text-[10px] text-muted-foreground/70 tabular-nums">
                    {mortgageRate.toFixed(2)}%
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {RESIDENCIES.map((r) => {
                    const active = residency === r;
                    return (
                      <button
                        key={r}
                        onClick={() => setResidency(r)}
                        className={`tap press py-3 rounded-sm border text-[11px] uppercase tracking-[0.12em] transition-colors ${
                          active
                            ? "border-primary text-primary bg-primary/10"
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        {r}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <div className="flex items-baseline justify-between mb-3">
                  <span className="label-eyebrow">Loan to Value</span>
                  <span className="font-serif text-sm tabular-nums text-primary">
                    {ltv}%
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mb-3">
                  Suggested {suggestedLtvValue}% from your selected goal. Override
                  if you want a different gearing.
                </p>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {([55, 65, 75] as const).map((preset) => {
                    const active = ltv === preset;
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setLtv(preset)}
                        className={`tap press min-h-[48px] rounded-sm border text-[13px] tabular-nums transition-colors ${
                          active
                            ? "border-primary text-primary bg-primary/10"
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        {preset}%
                        {preset === suggestedLtvValue && (
                          <span className="block text-[9px] tracking-[0.12em] uppercase mt-0.5">
                            Suggested
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <input
                  type="range"
                  min={50}
                  max={80}
                  step={5}
                  value={ltv}
                  onChange={(e) => setLtv(Number(e.target.value))}
                  className="w-full h-1 accent-primary cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #C6A46C 0%, #C6A46C ${ltvFill}%, rgba(245,241,232,0.12) ${ltvFill}%, rgba(245,241,232,0.12) 100%)`,
                    WebkitAppearance: "none",
                    borderRadius: 999,
                  }}
                />
                <div className="flex justify-between mt-2 text-[10px] tracking-[0.16em] uppercase text-muted-foreground/70">
                  <span>50%</span>
                  <span>65%</span>
                  <span>80%</span>
                </div>
              </div>
              <div>
                <span className="label-eyebrow block mb-2">Mortgage Type</span>
                <div className="grid grid-cols-2 gap-2">
                  {(["Interest-only", "Repayment"] as MortgageType[]).map((t) => {
                    const active = mortgageType === t;
                    return (
                      <button
                        key={t}
                        onClick={() => setMortgageType(t)}
                        className={`tap press py-3 rounded-sm border text-[11px] uppercase tracking-[0.12em] transition-colors ${
                          active
                            ? "border-primary text-primary bg-primary/10"
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
          {!isMortgage && (
            <p className="text-[12.5px] text-muted-foreground leading-relaxed">
              Cash purchase — mortgage controls are hidden. Change finance to
              model a loan.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function MatchedOpportunities({
  exact,
  stretch,
  budget,
  selectedId,
  confirmingId = null,
  showRoute,
  firstTime,
  onSelect,
  onEditFinance,
  onEditCapital,
  onSpeakToAdvisor,
}: {
  exact: PlanMatch[];
  stretch: PlanMatch[];
  budget: number;
  selectedId: string | null;
  confirmingId?: string | null;
  showRoute: boolean;
  firstTime: boolean;
  onSelect: (match: PlanMatch) => void;
  onEditFinance: () => void;
  onEditCapital: () => void;
  onSpeakToAdvisor: () => void;
}) {
  return (
    <div className="mb-9">
      <div className="mb-4">
        <p className="label-eyebrow mb-1.5">Recommended next property</p>
        <h2 className="font-serif text-xl tracking-tight mb-1.5">
          {exact.length > 0 ? "Best next step" : "No exact match yet"}
        </h2>
        <p className="text-[12px] text-muted-foreground leading-relaxed">
          {exact.length > 0
            ? firstTime
              ? `Properties within ${fmt.currency(budget)}. We'll explain why the top option fits before the detailed numbers.`
              : `Ranked for your goal within ${fmt.currency(budget)}. Tap one to see how it contributes.`
            : "Nothing in the current inventory fits this capital and finance route."}
        </p>
      </div>

      {exact.length === 0 ? (
        <div className="rounded-sm border border-border bg-card/40 px-5 py-6 mb-4">
          <p className="font-serif text-base mb-2">Funding gap</p>
          <p className="text-[12.5px] text-muted-foreground leading-relaxed mb-5">
            No exact matches at your current buying power. Change capital or
            finance, raise LTV under Adjust assumptions, or speak with an
            advisor about the closest route.
          </p>
          <div className="flex flex-col gap-2.5">
            <button
              onClick={onEditCapital}
              className="tap press w-full py-3.5 rounded-sm bg-primary text-primary-foreground text-[12px] tracking-[0.1em] uppercase font-medium active:opacity-90"
            >
              Change capital
            </button>
            <button
              onClick={onEditFinance}
              className="tap press w-full py-3.5 rounded-sm border border-border text-[12px] tracking-[0.1em] uppercase text-muted-foreground active:text-foreground"
            >
              Change finance
            </button>
            <button
              onClick={onSpeakToAdvisor}
              className="tap press w-full py-3.5 rounded-sm border border-border text-[12px] tracking-[0.1em] uppercase text-muted-foreground active:text-foreground"
            >
              Speak to Advisor
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3 mb-5">
          {exact.map((m) => (
            <MatchCard
              key={`${m.route}-${m.opportunity.id}`}
              match={m}
              active={m.opportunity.id === selectedId}
              confirming={m.opportunity.id === confirmingId}
              onSelect={() => onSelect(m)}
              showRoute={showRoute}
            />
          ))}
        </div>
      )}

      {stretch.length > 0 && (
        <div className="mt-6">
          <p className="label-eyebrow mb-2">Near your budget</p>
          <p className="text-[11px] text-muted-foreground mb-3">
            Stretch options — above your current buying power, labelled clearly.
          </p>
          <div className="space-y-3">
            {stretch.map((m) => (
              <MatchCard
                key={`stretch-${m.route}-${m.opportunity.id}`}
                match={m}
                active={m.opportunity.id === selectedId}
                confirming={m.opportunity.id === confirmingId}
                onSelect={() => onSelect(m)}
                stretch
                showRoute={showRoute}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MatchCard({
  match,
  active,
  confirming = false,
  onSelect,
  stretch = false,
  showRoute = false,
}: {
  match: PlanMatch;
  active: boolean;
  confirming?: boolean;
  onSelect: () => void;
  stretch?: boolean;
  showRoute?: boolean;
}) {
  const o = match.opportunity;
  return (
    <button
      onClick={onSelect}
      className={`tap w-full text-left rounded-sm border overflow-hidden min-h-[88px] transition-[border-color,background-color,opacity] duration-300 ${
        active
          ? "border-primary bg-primary/[0.05]"
          : "border-border"
      } ${confirming ? "choice-confirm" : ""}`}
    >
      <div className="flex gap-3.5 p-3">
        <div className="w-20 h-20 rounded-sm overflow-hidden shrink-0 bg-card relative">
          <img src={o.image} alt={o.name} className="w-full h-full object-cover" />
          {active && (
            <div className="absolute inset-0 bg-primary/15 flex items-center justify-center">
              <span className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <Check
                  className={`w-3.5 h-3.5 text-primary-foreground ${
                    confirming ? "choice-check-in" : ""
                  }`}
                  strokeWidth={2.5}
                />
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-serif text-[17px] leading-tight truncate">
                {o.name}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {o.city} · {o.region}
                {showRoute ? ` · ${match.route}` : ""}
              </p>
            </div>
            <span
              className={`shrink-0 text-[9px] tracking-[0.14em] uppercase px-2 py-1 rounded-sm border ${
                stretch
                  ? "border-border text-muted-foreground"
                  : "border-primary/50 bg-primary/8 text-primary"
              }`}
            >
              {stretch ? "Stretch" : match.fitLabel}
            </span>
          </div>
          <div className="mt-2.5 grid grid-cols-3 gap-x-2">
            <MiniStat label="From" value={fmt.currency(o.fromPrice)} />
            <MiniStat
              label="Gross Yield"
              value={`${o.grossYield.toFixed(1)}%`}
              tone="primary"
            />
            <MiniStat
              label="5Y Growth"
              value={`${o.capitalGrowth5Y.toFixed(1)}%`}
            />
          </div>
          {stretch && match.stretchGap != null && (
            <p className="text-[10px] text-muted-foreground mt-2 tabular-nums">
              {fmt.currency(match.stretchGap)} above buying power
            </p>
          )}
          {!stretch && (
            <p className="text-[10px] text-muted-foreground mt-2 tabular-nums">
              Cash required {fmt.currency(match.cashRequired)}
            </p>
          )}
          <ul className="mt-2 space-y-0.5">
            {match.reasons.slice(0, 2).map((r) => (
              <li
                key={r.code}
                className="text-[10.5px] text-muted-foreground/90 leading-snug flex gap-1.5"
              >
                <span className="text-primary/80 shrink-0">·</span>
                <span>{r.copy}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </button>
  );
}

function WhyThisFits({
  reasons,
}: {
  reasons: { code: string; copy: string }[];
}) {
  if (reasons.length === 0) return null;
  return (
    <div className="mb-7">
      <p className="label-eyebrow mb-2">Why this fits</p>
      <ul className="space-y-2 rounded-sm border border-border bg-card/40 px-4 py-4">
        {reasons.map((r) => (
          <li
            key={r.code}
            className="text-[12.5px] text-foreground/85 leading-relaxed flex gap-2"
          >
            <Check
              className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5"
              strokeWidth={2}
            />
            <span>{r.copy}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "primary";
}) {
  return (
    <div className="min-w-0">
      <p className="text-[9px] tracking-[0.14em] uppercase text-muted-foreground/80 mb-0.5">
        {label}
      </p>
      <p
        className={`font-serif text-[13px] tabular-nums truncate ${
          tone === "primary" ? "text-primary" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function QuickReturnSummary({
  oppName,
  oppCity,
  holding,
  totalReturn,
  netMonthlyIncome,
  grossYield,
  monthlyRent,
  firstTime,
  onView,
}: {
  oppName: string;
  oppCity: string;
  holding: HoldingPeriod;
  totalReturn: number;
  netMonthlyIncome: number;
  grossYield: number;
  monthlyRent: number;
  firstTime: boolean;
  onView: () => void;
}) {
  return (
    <div className="border-t border-border pt-7 mb-7">
      <p className="label-eyebrow mb-1.5">Quick look</p>
      <h2 className="font-serif text-xl tracking-tight mb-4">
        {oppName} · {oppCity}
      </h2>
      <p className="text-[14px] text-foreground/85 leading-relaxed mb-1">
        This property could generate
      </p>
      <p className="font-serif num-display tabular-nums leading-none text-primary mb-1.5">
        {fmt.currency(totalReturn)}
      </p>
      <p className="text-[12px] text-muted-foreground leading-relaxed mb-6">
        in total returns over {holding} years.
      </p>
      <div className="grid grid-cols-3 gap-x-3 mb-6">
        <MiniSummary label="Monthly Rent" value={fmt.currency(monthlyRent)} />
        <MiniSummary label="Net Monthly" value={fmt.currency(netMonthlyIncome)} />
        <MiniSummary
          label="Gross Yield"
          value={`${grossYield.toFixed(2)}%`}
          tone="primary"
        />
      </div>
      {firstTime && (
        <p className="text-[11px] text-muted-foreground leading-relaxed mb-5">
          Gross yield is annual rent as a share of the purchase price, before
          costs. Net monthly is what remains after the illustrated costs.
        </p>
      )}
      <button
        onClick={onView}
        className="tap press w-full flex items-center justify-center gap-2 py-3.5 rounded-sm bg-primary text-primary-foreground font-medium tracking-[0.08em] text-[12.5px] uppercase active:opacity-90 transition-opacity"
      >
        <TrendingUp className="w-3.5 h-3.5" strokeWidth={1.75} />
        View Full Projection
      </button>
    </div>
  );
}

function MiniSummary({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "primary";
}) {
  return (
    <div>
      <p className="text-[9.5px] tracking-[0.14em] uppercase text-muted-foreground/85 mb-1.5">
        {label}
      </p>
      <p
        className={`font-serif text-[15px] tabular-nums leading-tight ${
          tone === "primary" ? "text-primary" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function WizardProgress({
  current,
  onSelect,
}: {
  current: JourneyPhase;
  onSelect: (id: JourneyPhase) => void;
}) {
  const currentIdx = JOURNEY_PHASES.findIndex((p) => p.id === current);
  return (
    <div className="pt-3 pb-5">
      <div className="flex items-center gap-1.5 mb-3">
        {JOURNEY_PHASES.map((s, i) => {
          const done = i < currentIdx;
          const active = s.id === current;
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              aria-label={`Go to ${s.title}`}
              className="tap flex-1 group"
            >
              <span
                className={`block h-[3px] rounded-full transition-colors ${
                  done || active ? "bg-primary" : "bg-border"
                }`}
              />
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-between text-[9px] tracking-[0.16em] uppercase">
        {JOURNEY_PHASES.map((s, i) => {
          const active = s.id === current;
          const done = i < currentIdx;
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className={`tap flex-1 text-center truncate transition-colors ${
                active
                  ? "text-primary"
                  : done
                    ? "text-foreground/70"
                    : "text-muted-foreground/60"
              }`}
            >
              {s.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WizardNav({
  screenId,
  canBack,
  canContinue,
  continueLabel,
  onBack,
  onNext,
}: {
  screenId: ScreenId;
  canBack: boolean;
  canContinue: boolean;
  continueLabel: string;
  onBack: () => void;
  onNext: () => void;
}) {
  if (screenId === "projection") return null;

  const showContinue = screenId === "returns";

  if (!canBack && !showContinue) return null;

  return (
    <div className="border-t border-border pt-5 mb-5 mt-2 flex items-center gap-3 animate-fade-up">
      {canBack ? (
        <button
          onClick={onBack}
          className="tap press flex-1 min-h-[52px] rounded-sm border border-border text-[13px] tracking-[0.14em] uppercase text-muted-foreground active:text-foreground transition-colors"
        >
          Back
        </button>
      ) : (
        <div className="flex-1" />
      )}
      {showContinue && (
        <button
          onClick={onNext}
          disabled={!canContinue}
          className={`tap press flex-[2] min-h-[52px] flex items-center justify-center gap-2 rounded-sm bg-primary text-primary-foreground text-[13px] tracking-[0.1em] uppercase font-medium transition-opacity ${
            !canContinue ? "opacity-40 cursor-not-allowed" : "active:opacity-90"
          }`}
        >
          {continueLabel}
          <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
        </button>
      )}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="label-eyebrow block mb-2">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-transparent border-b border-border focus:border-primary/60 outline-none py-2.5 pr-8 font-serif text-base text-foreground tabular-nums transition-colors"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value} className="bg-card text-foreground">
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="absolute right-1 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
          strokeWidth={1.5}
        />
      </div>
    </label>
  );
}

function CityChips({
  value,
  onChange,
  cities,
}: {
  value: string;
  onChange: (v: string) => void;
  cities: string[];
}) {
  const chips = ["All", ...cities];
  return (
    <div className="mb-6">
      <p className="label-eyebrow mb-3">Refine by city</p>
      <div className="flex flex-wrap gap-2">
        {chips.map((c) => {
          const active = value === c;
          return (
            <button
              key={c}
              type="button"
              onClick={() => onChange(c)}
              className={`tap press min-h-[44px] px-3.5 rounded-sm border text-[12px] transition-colors ${
                active
                  ? "border-primary text-primary bg-primary/10"
                  : "border-border text-muted-foreground active:text-foreground"
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CurrencyField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="label-eyebrow block mb-2">{label}</span>
      <div className="flex items-center gap-2 border-b border-border focus-within:border-primary/60 transition-colors py-2 min-h-[48px]">
        <span className="font-serif text-base text-muted-foreground/70">£</span>
        <input
          type="number"
          inputMode="decimal"
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="flex-1 bg-transparent outline-none font-serif text-lg tabular-nums text-foreground"
        />
      </div>
    </label>
  );
}

function PeriodTabs({
  value,
  onChange,
}: {
  value: HoldingPeriod;
  onChange: (v: HoldingPeriod) => void;
}) {
  return (
    <div className="inline-flex border border-border rounded-sm overflow-hidden">
      {HOLDING_PERIODS.map((h) => {
        const active = h === value;
        return (
          <button
            key={h}
            onClick={() => onChange(h)}
            className={`tap press text-[11px] tracking-[0.14em] uppercase px-3.5 min-h-[44px] transition-colors ${
              active
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground active:text-foreground"
            }`}
          >
            {h}Y
          </button>
        );
      })}
    </div>
  );
}

function Output({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone?: "primary";
}) {
  return (
    <div>
      <p className="label-eyebrow mb-2">{label}</p>
      <p
        className={`font-serif text-xl tabular-nums leading-none mb-1.5 ${
          tone === "primary" ? "text-primary" : ""
        }`}
      >
        {value}
      </p>
      <p className="text-[11px] text-muted-foreground/80 tabular-nums">{sub}</p>
    </div>
  );
}

function Assumption({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] tracking-[0.14em] uppercase text-muted-foreground mb-1">
        {label}
      </p>
      <p className="font-serif text-sm tabular-nums">{value}</p>
    </div>
  );
}

function ProjectionMiniChart({
  data,
}: {
  data: { label: string; propertyValue: number; cumulativeIncome: number }[];
}) {
  const allValues = data.flatMap((d) => [d.propertyValue, d.cumulativeIncome]);
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const padding = (max - min) * 0.1 || max * 0.05;

  return (
    <div style={{ width: "100%", height: 170 }}>
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 6, right: 6, bottom: 6, left: 6 }}>
          <defs>
            <linearGradient id="calcGold" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C6A46C" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#C6A46C" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="label" hide />
          <YAxis domain={[Math.max(0, min - padding), max + padding]} hide />
          <Tooltip
            cursor={{
              stroke: "#C6A46C",
              strokeOpacity: 0.4,
              strokeWidth: 1,
              strokeDasharray: "2 3",
            }}
            content={({ active, payload }) => {
              if (!active || !payload || !payload.length) return null;
              const p = payload[0].payload as {
                label: string;
                propertyValue: number;
                cumulativeIncome: number;
              };
              return (
                <div className="bg-card border border-border px-3 py-2 rounded-sm shadow-lg min-w-[140px]">
                  <p className="text-[9px] tracking-[0.16em] uppercase text-muted-foreground mb-2">
                    {p.label}
                  </p>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[10px] text-muted-foreground">Value</span>
                      <span className="font-serif text-[12px] tabular-nums text-primary">
                        {fmt.currency(p.propertyValue)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[10px] text-muted-foreground">Income</span>
                      <span className="font-serif text-[12px] tabular-nums">
                        {fmt.currency(p.cumulativeIncome)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="propertyValue"
            stroke="#C6A46C"
            strokeWidth={1.5}
            fill="url(#calcGold)"
            dot={false}
            activeDot={{ r: 3, fill: "#C6A46C", stroke: "#0A1220", strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="cumulativeIncome"
            stroke="#C6A46C"
            strokeOpacity={0.65}
            strokeWidth={1.25}
            strokeDasharray="3 3"
            dot={false}
            activeDot={{ r: 3, fill: "#C6A46C", stroke: "#0A1220", strokeWidth: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

function FinalOutlook({
  oppName,
  oppCity,
  holding,
  setHolding,
  chartData,
  years,
  annualGrowth,
  totalReturn,
  totalCapitalGain,
  totalNetIncome,
  assumptionsOpen,
  setAssumptionsOpen,
  breakdownOpen,
  setBreakdownOpen,
  isMortgage,
  mortgageRate,
  onSpeakToAdvisor,
}: {
  oppName: string;
  oppCity: string;
  holding: HoldingPeriod;
  setHolding: (v: HoldingPeriod) => void;
  chartData: { label: string; propertyValue: number; cumulativeIncome: number }[];
  years: ProjectionYear[];
  annualGrowth: number;
  totalReturn: number;
  totalCapitalGain: number;
  totalNetIncome: number;
  assumptionsOpen: boolean;
  setAssumptionsOpen: (fn: (s: boolean) => boolean) => void;
  breakdownOpen: boolean;
  setBreakdownOpen: (fn: (s: boolean) => boolean) => void;
  isMortgage: boolean;
  mortgageRate: number;
  onSpeakToAdvisor: () => void;
}) {
  return (
    <div className="border-t border-border pt-7 mt-7 mb-7 animate-fade-up">
      <p className="label-eyebrow mb-1.5">Closing</p>
      <h2 className="font-serif text-xl tracking-tight mb-1">
        {oppName} · {oppCity}
      </h2>
      <p className="text-[12px] text-muted-foreground mb-5">
        How this investment could perform.
      </p>
      <div className="flex justify-end mb-4">
        <PeriodTabs value={holding} onChange={setHolding} />
      </div>
      <ProjectionMiniChart data={chartData} />
      <div className="flex items-center gap-5 text-[10px] tracking-[0.16em] uppercase text-muted-foreground mt-3 mb-6">
        <span className="inline-flex items-center gap-2">
          <span className="w-3 h-px bg-primary" />
          Property value
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="w-3 h-px border-t border-dashed border-primary/60" />
          Cumulative income
        </span>
      </div>
      <div className="rounded-sm border border-primary/40 bg-primary/[0.04] px-5 py-6 mb-5">
        <p className="label-eyebrow !text-primary/85 mb-3">
          Total Return · {holding}Y
        </p>
        <p className="font-serif num-display tabular-nums leading-none text-primary mb-4">
          {fmt.currency(totalReturn)}
        </p>
        <div className="grid grid-cols-2 gap-x-4 pt-4 border-t border-primary/15">
          <Output
            label="Capital Growth"
            value={fmt.currency(totalCapitalGain)}
            sub={`Year ${holding}`}
          />
          <Output
            label="Rental Income"
            value={fmt.currency(totalNetIncome)}
            sub="Cumulative · net"
          />
        </div>
      </div>
      <div className="mb-6">
        <button
          onClick={() => setBreakdownOpen((s: boolean) => !s)}
          className="tap press w-full flex items-center justify-between min-h-[44px] py-3 border-t border-b border-border text-[10px] tracking-[0.18em] uppercase text-muted-foreground active:text-foreground transition-colors"
          aria-expanded={breakdownOpen}
        >
          <span>Year-by-year breakdown</span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform ${
              breakdownOpen ? "rotate-180" : ""
            }`}
            strokeWidth={1.5}
          />
        </button>
        {breakdownOpen && (
          <div className="mt-3 -mx-page page-px overflow-x-auto scrollbar-hide animate-fade-up">
            <table className="w-full min-w-[640px] text-[11px] tabular-nums">
              <thead>
                <tr className="text-left text-muted-foreground/80">
                  <th className="py-2 pr-3 font-normal">Year</th>
                  <th className="py-2 pr-3 font-normal text-right">Value</th>
                  <th className="py-2 pr-3 font-normal text-right">Capital Gain</th>
                  <th className="py-2 pr-3 font-normal text-right">Net Income</th>
                  <th className="py-2 font-normal text-right">Total Return</th>
                </tr>
              </thead>
              <tbody>
                {years.map((y) => (
                  <tr key={y.year} className="border-t border-border/60">
                    <td className="py-2 pr-3 font-medium">{y.year}</td>
                    <td className="py-2 pr-3 text-right">{fmt.currency(y.propertyValue)}</td>
                    <td className="py-2 pr-3 text-right text-primary">
                      +{fmt.currency(y.capitalGain)}
                    </td>
                    <td className="py-2 pr-3 text-right">{fmt.currency(y.netIncome)}</td>
                    <td className="py-2 text-right text-primary">
                      {fmt.currency(y.totalReturn)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="mb-6">
        <button
          onClick={() => setAssumptionsOpen((s: boolean) => !s)}
          className="tap press w-full flex items-center justify-between py-3 border-t border-b border-border text-[10px] tracking-[0.18em] uppercase text-muted-foreground active:text-foreground transition-colors"
          aria-expanded={assumptionsOpen}
        >
          <span>Assumptions</span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform ${
              assumptionsOpen ? "rotate-180" : ""
            }`}
            strokeWidth={1.5}
          />
        </button>
        {assumptionsOpen && (
          <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5 px-4 py-5 rounded-sm border border-dashed border-border animate-fade-up">
            <Assumption
              label="Capital Growth"
              value={`${annualGrowth.toFixed(1)}% / yr`}
            />
            <Assumption label="Rental Growth" value={`${ASSUMPTIONS.rentalGrowth.toFixed(1)}% / yr`} />
            <Assumption
              label="Indicative Mortgage Rate"
              value={isMortgage ? `${mortgageRate.toFixed(2)}%` : "Not applicable"}
            />
            <Assumption
              label="Management Fee"
              value={`${ASSUMPTIONS.managementFeePctOfRent}% of rent`}
            />
            <Assumption
              label="Service Charge"
              value={`${ASSUMPTIONS.serviceChargePctOfValue}% of value / yr`}
            />
            <Assumption
              label="Cost Inflation"
              value={`${ASSUMPTIONS.costGrowth.toFixed(1)}% / yr`}
            />
          </div>
        )}
      </div>
      <button
        onClick={onSpeakToAdvisor}
        className="tap press w-full flex items-center justify-center gap-2 py-4 rounded-sm bg-primary text-primary-foreground text-[12.5px] tracking-[0.1em] uppercase font-medium active:opacity-90 transition-opacity"
      >
        <Sparkle className="w-3.5 h-3.5" strokeWidth={1.75} />
        Speak to Advisor
      </button>
      <p className="text-[11px] text-muted-foreground/75 text-center mt-3">
        Your advisor will walk through these numbers with you.
      </p>
    </div>
  );
}
