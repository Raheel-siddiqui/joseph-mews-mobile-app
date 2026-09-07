// Joseph Mews — Investment Calculator (standalone)
// A primary-nav tool for modelling a *potential* investment independently of
// the Explore flow. Reuses the same projection engine that powers Property
// Detail and Project Detail — so figures stay consistent across the app.
//
// IMPORTANT: All math is delegated to `lib/projection.ts`. Mortgage/cash
// handling, LTV, and stamp duty estimation are layered *on top* of the
// projection engine, never replacing its formulas.

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ContactAdvisorSheet } from "@/components/ContactAdvisorSheet";
import {
  matchOpportunities,
  reasonsForOpportunity,
  type FitReason,
  type InvestmentStyle,
  type MatchResult,
} from "@/lib/calculatorMatching";
import { fmt } from "@/lib/data";
import { opportunities } from "@/lib/explore";
import { projectInvestment } from "@/lib/projection";
import {
  getMortgageRate,
  getSdltRate,
  RESIDENCIES,
  type Residency,
} from "@/lib/residencyRates";
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
  Wallet,
  Landmark,
  Sparkle,
  Check,
  TrendingUp,
} from "lucide-react";

type InvestmentType = "Mortgage" | "Cash";
type MortgageType = "Interest-only" | "Repayment";

const HOLDING_PERIODS = [5, 10, 15] as const;
type HoldingPeriod = (typeof HOLDING_PERIODS)[number];

const INVESTMENT_STYLES: InvestmentStyle[] = [
  "Income Focused",
  "Growth Focused",
  "Balanced",
  "Not Sure",
];

/** Fixed default LTV — style ranks matches only; it must not change leverage. */
const DEFAULT_LTV = 65;

// Assumption defaults (kept centralised so they can be tuned later).
const ASSUMPTIONS = {
  capitalGrowth: 4.5,
  rentalGrowth: 3.0,
  costGrowth: 2.5,
  managementFeePctOfRent: 10, // %
  serviceChargePctOfValue: 0.5, // %
};

export default function CalculatorHome() {
  // ----- Step 1: Deposit-led intent -----
  const [deposit, setDeposit] = useState<number>(50_000);
  const [advisorOpen, setAdvisorOpen] = useState(false);
  const [style, setStyle] = useState<InvestmentStyle | null>(null);

  // ----- Step 3: Investment selection -----
  const [oppId, setOppId] = useState<string>(opportunities[0].id);
  const [hasSelectedMatch, setHasSelectedMatch] = useState(false);
  const opp = useMemo(
    () => opportunities.find((o) => o.id === oppId) ?? opportunities[0],
    [oppId]
  );
  const [unitType, setUnitType] = useState<string>(opp.unitTypes[0].type);
  const [price, setPrice] = useState<number>(opp.unitTypes[0].fromPrice);

  // Optional Step 3 filters
  const [filterCity, setFilterCity] = useState<string>("All");
  const [filterDevelopment, setFilterDevelopment] = useState<string>("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // ----- Step 2: Investment setup -----
  const [investmentType, setInvestmentType] =
    useState<InvestmentType>("Mortgage");
  const [residency, setResidency] = useState<Residency | null>(null);
  const [ltv, setLtv] = useState<number>(DEFAULT_LTV);
  const [mortgageType, setMortgageType] =
    useState<MortgageType>("Interest-only");
  const [holding, setHolding] = useState<HoldingPeriod>(10);

  const isMortgage = investmentType === "Mortgage";
  const effectiveStyle: InvestmentStyle = style ?? "Not Sure";
  // Rates need a residency; fall back to UK for display math until selected.
  const rateResidency: Residency = residency ?? "UK";
  const mortgageRate = getMortgageRate(rateResidency);
  const sdltRate = getSdltRate(rateResidency);

  // Buying power budget (mirrors BuyingPowerCard math) so downstream rails can
  // filter by it. budget = deposit / (1 − LTV%).
  const budget = useMemo(() => {
    if (!isMortgage) return deposit;
    if (ltv >= 100) return deposit;
    const equityPct = 1 - ltv / 100;
    if (equityPct <= 0) return deposit;
    return Math.round(deposit / equityPct);
  }, [deposit, ltv, isMortgage]);

  // ----- Derived inputs for the projection engine -----
  const monthlyRent = useMemo(() => {
    // Year-1 gross rent derived from gross yield × price
    const annual = price * (opp.grossYield / 100);
    return Math.round(annual / 12);
  }, [price, opp.grossYield]);

  const annualGrossRent = monthlyRent * 12;
  const annualServiceCharge = Math.round(
    price * (ASSUMPTIONS.serviceChargePctOfValue / 100)
  );
  const annualManagementFee = Math.round(
    annualGrossRent * (ASSUMPTIONS.managementFeePctOfRent / 100)
  );

  const loanAmount = isMortgage ? Math.round(price * (ltv / 100)) : 0;
  const annualMortgageInterest = isMortgage
    ? Math.round(loanAmount * (mortgageRate / 100))
    : 0;
  // Repayment ≈ 25-year amortising at the same rate. Illustrative only.
  const annualMortgageRepayment = useMemo(() => {
    if (!isMortgage || loanAmount === 0) return 0;
    const r = mortgageRate / 100;
    const n = 25;
    if (r === 0) return Math.round(loanAmount / n);
    const annual = (loanAmount * r) / (1 - Math.pow(1 + r, -n));
    return Math.round(annual);
  }, [isMortgage, loanAmount, mortgageRate]);
  const annualMortgage =
    mortgageType === "Repayment"
      ? annualMortgageRepayment
      : annualMortgageInterest;

  // ----- Run the model -----
  const result = useMemo(
    () =>
      projectInvestment(
        {
          startValue: price,
          annualGrowth: ASSUMPTIONS.capitalGrowth,
          annualGrossRent,
          rentalGrowth: ASSUMPTIONS.rentalGrowth,
          annualServiceCharge,
          annualManagementFee,
          annualMortgage,
          costGrowth: ASSUMPTIONS.costGrowth,
        },
        holding
      ),
    [
      price,
      annualGrossRent,
      annualServiceCharge,
      annualManagementFee,
      annualMortgage,
      holding,
    ]
  );

  // ----- Headline outputs -----
  const annualCosts =
    annualServiceCharge + annualManagementFee + annualMortgage;
  const netAnnualIncome = annualGrossRent - annualCosts;
  const netMonthlyIncome = Math.round(netAnnualIncome / 12);
  const grossYieldPct = price > 0 ? (annualGrossRent / price) * 100 : 0;

  // SDLT illustrative: UK 3%, all other residencies 5%.
  const sdlt = Math.round(price * sdltRate);
  const legalFees = 2500;
  const cashDeposit = price - loanAmount;
  const initialCashRequired = cashDeposit + sdlt + legalFees;

  const matchInput = useMemo(
    () => ({
      opportunities,
      budget,
      deposit,
      style: effectiveStyle,
      horizonYears: holding,
      isMortgage,
      ltv,
      sdltRate,
      legalFees,
      cityFilter: filterCity,
      developmentFilter: filterDevelopment || null,
    }),
    [
      budget,
      deposit,
      effectiveStyle,
      holding,
      isMortgage,
      ltv,
      sdltRate,
      legalFees,
      filterCity,
      filterDevelopment,
    ],
  );

  const { exact: exactMatches, stretch: stretchMatches } = useMemo(
    () => matchOpportunities(matchInput),
    [matchInput],
  );

  const selectedFitReasons = useMemo(
    () => reasonsForOpportunity(opp, matchInput),
    [opp, matchInput],
  );

  // Clear selection if upstream edits knock the property out of exact eligibility.
  useEffect(() => {
    if (!hasSelectedMatch) return;
    const stillExact = exactMatches.some((m) => m.opportunity.id === oppId);
    if (!stillExact) {
      setHasSelectedMatch(false);
    }
  }, [exactMatches, oppId, hasSelectedMatch]);

  // ----- Mini chart data -----
  const chartData = useMemo(() => {
    const base = [
      { label: "Now", propertyValue: price, cumulativeIncome: 0 },
      ...result.years.map((y) => ({
        label: `Yr ${y.year}`,
        propertyValue: y.propertyValue,
        cumulativeIncome: y.cumulativeNetIncome,
      })),
    ];
    return base;
  }, [price, result.years]);

  const [outlookAssumptionsOpen, setOutlookAssumptionsOpen] = useState(false);

  // ---- 5-step wizard state ----
  const STEPS = [
    { id: 1, key: "deposit", title: "Deposit", caption: "Your liquidity" },
    { id: 2, key: "affordability", title: "Affordability", caption: "Estimated budget" },
    { id: 3, key: "options", title: "Options", caption: "Matched properties" },
    { id: 4, key: "returns", title: "Returns", caption: "Quick summary" },
    { id: 5, key: "projection", title: "Projection", caption: "Long-term view" },
  ] as const;

  const [step, setStep] = useState<number>(1);
  const currentStep = STEPS.find((s) => s.id === step)!;
  const totalSteps = STEPS.length;
  const canBack = step > 1;
  const canNext = step < totalSteps;

  function goNext() {
    if (!canNext) return;
    if (step === 1 && style === null) setStyle("Not Sure");
    if (step === 2 && isMortgage && !residency) return;
    setStep((s) => s + 1);
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  }
  function goBack() {
    if (canBack) {
      setStep((s) => s - 1);
      requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
    }
  }

  function selectMatch(match: MatchResult) {
    const o = match.opportunity;
    const firstUnit = o.unitTypes[0];
    setOppId(o.id);
    setUnitType(firstUnit.type);
    setPrice(o.fromPrice);
    setHasSelectedMatch(true);
    setStep(4);
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  return (
    <AppShell>
      <div className="page-px">
        {/* ---- Wizard Progress ---- */}
        <WizardProgress steps={STEPS} current={step} onSelect={(n) => setStep(n)} />

        {/* ---- Header ---- */}
        <div className="pt-2 pb-7 animate-fade-up" key={`hdr-${step}`}>
          <p className="label-eyebrow mb-3">
            Step {step} of {totalSteps} · {currentStep.caption}
          </p>
          <h1 className="font-serif text-2xl leading-tight mb-2">
            {step === 1 && "How much would you like to invest?"}
            {step === 2 && "Your Estimated Buying Power"}
            {step === 3 && "Matched Investment Opportunities"}
            {step === 4 && `Quick Look · ${opp.name}`}
            {step === 5 && `Your ${holding}-Year Investment Outlook`}
          </h1>
          <p className="text-[13px] text-muted-foreground leading-relaxed max-w-[36ch]">
            {step === 1 &&
              "Tell us your deposit, investment style and how long you'd like to hold."}
            {step === 2 &&
              "Based on your deposit, here's what you can comfortably invest."}
            {step === 3 &&
              "Auto-matched to your buying power. Tap one to model returns."}
            {step === 4 &&
              "A quick decision snapshot before the deep dive."}
            {step === 5 &&
              "How this investment could perform over the long run."}
          </p>
        </div>

        {/* ============== STEP 1 · Deposit ============== */}
        {step === 1 && (
        <div key="step-1" className="animate-fade-up">
        <div className="space-y-7 mb-3">
          <CurrencyField
            label="Deposit Amount"
            value={deposit}
            onChange={setDeposit}
            hint="Available cash"
            big
          />

          <div>
            <div className="flex items-baseline justify-between mb-2">
              <span className="label-eyebrow">Investment Style</span>
              <span className="text-[10px] text-muted-foreground/70">
                Ranks matches only
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {INVESTMENT_STYLES.map((s) => {
                const active = style === s;
                return (
                  <button
                    key={s}
                    onClick={() => setStyle(s)}
                    className={`tap press py-3 rounded-sm border text-[11px] uppercase tracking-[0.12em] transition-colors ${
                      active
                        ? "border-primary text-primary bg-primary/10"
                        : "border-border text-muted-foreground active:text-foreground"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          <YearsField
            label="Investment Horizon"
            value={holding}
            onChange={setHolding}
          />
        </div>

        <p className="text-[11px] text-muted-foreground/75 leading-relaxed mb-9 italic">
          This helps us estimate your buying power and match you with suitable properties.
        </p>
        </div>
        )}

        {/* ============== STEP 2 · Affordability ============== */}
        {step === 2 && (
        <div key="step-2" className="animate-fade-up">
        <BuyingPowerCard
          deposit={deposit}
          ltv={ltv}
          setLtv={setLtv}
          investmentType={investmentType}
          setInvestmentType={setInvestmentType}
          mortgageType={mortgageType}
          setMortgageType={setMortgageType}
          mortgageRate={mortgageRate}
          residency={residency}
          setResidency={setResidency}
        />
        </div>
        )}

        {/* ============== STEP 3 · Options ============== */}
        {step === 3 && (
        <div key="step-3" className="animate-fade-up">
        <MatchedOpportunities
          exact={exactMatches}
          stretch={stretchMatches}
          budget={budget}
          selectedId={hasSelectedMatch ? oppId : null}
          onSelect={selectMatch}
          onEditFinance={() => {
            setStep(2);
            requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
          }}
          onSpeakToAdvisor={() => setAdvisorOpen(true)}
        />

        {/* Optional refinements */}
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
                    .filter((o) => o.status !== "Sold Out")
                    .map((o) => ({
                      value: o.id,
                      label: `${o.name} · ${o.city}`,
                    })),
                ]}
              />
              {hasSelectedMatch && (
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
              )}
            </div>
          )}
        </div>
        </div>
        )}

        {/* ============== STEP 4 · Returns ============== */}
        {step === 4 && (
        <div key="step-4" className="animate-fade-up">
        <QuickReturnSummary
          oppName={opp.name}
          oppCity={opp.city}
          holding={holding}
          totalReturn={result.totalReturn}
          netMonthlyIncome={netMonthlyIncome}
          grossYield={grossYieldPct}
          monthlyRent={monthlyRent}
          onView={() => {
            setStep(5);
            requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
          }}
        />

        <WhyThisFits reasons={selectedFitReasons} />

        {/* ---- Detailed Results ---- */}
        <div className="border-t border-border pt-7 mb-7 animate-fade-up">
          <p className="label-eyebrow mb-1.5">Detail</p>
          <h2 className="font-serif text-xl tracking-tight mb-6">Detailed Results</h2>

          {/* Headline */}
          <div className="px-5 py-6 rounded-sm border border-border bg-card/40 mb-6">
            <p className="label-eyebrow mb-3">Total Return · {holding}Y</p>
            <p className="font-serif num-display tabular-nums leading-none text-primary mb-2">
              {fmt.currency(result.totalReturn)}
            </p>
            <p className="text-[12px] text-muted-foreground tabular-nums">
              +{result.totalReturnPct.toFixed(0)}% on {fmt.currency(price)} · capital
              + cumulative income
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
              sub="Year 1"
            />
            <Output
              label="Initial Cash Required"
              value={fmt.currency(initialCashRequired)}
              sub={
                isMortgage
                  ? `Deposit + SDLT + fees`
                  : `Price + SDLT + fees`
              }
            />
            <Output
              label="Projected Future Value"
              value={fmt.currency(result.endValue)}
              sub={`Year ${holding}`}
              tone="primary"
            />
          </div>
        </div>

        </div>
        )}

        {/* ============== STEP 5 · Projection ============== */}
        {step === 5 && (
        <div key="step-5" className="animate-fade-up">
        {/* ---- Projection Preview ---- */}
        <div id="calc-projection" className="animate-fade-up">
          <div className="flex items-baseline justify-between mb-5">
            <div>
              <p className="label-eyebrow mb-1.5">Long-term outlook</p>
              <h2 className="font-serif text-xl tracking-tight">{holding}-year curve</h2>
            </div>
            <PeriodTabs value={holding} onChange={setHolding} />
          </div>

          <ProjectionMiniChart data={chartData} />

          <div className="flex items-center gap-5 text-[10px] tracking-[0.16em] uppercase text-muted-foreground mt-3 mb-4">
            <span className="inline-flex items-center gap-2">
              <span className="w-3 h-px bg-primary" />
              Property value
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="w-3 h-px border-t border-dashed border-primary/60" />
              Cumulative income
            </span>
          </div>

        </div>

        {/* ---- Final Step: Your N-Year Investment Outlook ---- */}
        <FinalOutlook
          oppName={opp.name}
          oppCity={opp.city}
          holding={holding}
          setHolding={setHolding}
          chartData={chartData}
          totalReturn={result.totalReturn}
          totalCapitalGain={result.totalCapitalGain}
          totalNetIncome={result.totalNetIncome}
          assumptionsOpen={outlookAssumptionsOpen}
          setAssumptionsOpen={setOutlookAssumptionsOpen}
          isMortgage={isMortgage}
          mortgageRate={mortgageRate}
          onSpeakToAdvisor={() => setAdvisorOpen(true)}
        />
        </div>
        )}

        {/* ---- Wizard navigation ---- */}
        <WizardNav
          step={step}
          total={totalSteps}
          canBack={canBack}
          canNext={canNext}
          deposit={deposit}
          residencyRequired={isMortgage && !residency}
          onBack={goBack}
          onNext={goNext}
        />

        {/* Disclaimer */}
        <div className="mt-5 mb-4 flex items-start gap-2.5">
          <Info
            className="w-3.5 h-3.5 text-muted-foreground/70 mt-0.5 shrink-0"
            strokeWidth={1.5}
          />
          <p className="text-[11px] leading-relaxed text-muted-foreground/80">
            Projections are estimates based on current assumptions and are for
            illustrative purposes only. SDLT and fees are indicative — your
            advisor will provide a precise quote.
          </p>
        </div>

        <div className="h-8" />
      </div>

      {advisorOpen && (
        <ContactAdvisorSheet
          opp={opp}
          onClose={() => setAdvisorOpen(false)}
        />
      )}
    </AppShell>
  );
}

/* ---------- sub-components ---------- */

function Step({ number, title }: { number: string; title: string }) {
  return (
    <div className="mb-5 animate-fade-up">
      <p className="label-eyebrow mb-1.5">Step {number}</p>
      <h2 className="font-serif text-xl tracking-tight">{title}</h2>
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

function CurrencyField({
  label,
  value,
  onChange,
  hint,
  big = false,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
  big?: boolean;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between mb-2">
        <span className="label-eyebrow">{label}</span>
        {hint && (
          <span className="text-[10px] text-muted-foreground/70">{hint}</span>
        )}
      </div>
      <div
        className={`flex items-center gap-2 border-b border-border focus-within:border-primary/60 transition-colors ${
          big ? "py-3" : "py-2"
        }`}
      >
        <span
          className={`font-serif text-muted-foreground/70 ${
            big ? "text-2xl" : "text-base"
          }`}
        >
          £
        </span>
        <input
          type="number"
          inputMode="decimal"
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className={`flex-1 bg-transparent outline-none font-serif tabular-nums text-foreground placeholder:text-muted-foreground/50 ${
            big ? "text-[28px]" : "text-lg"
          }`}
        />
      </div>
    </label>
  );
}

function SegmentField({
  label,
  value,
  onChange,
  options,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: {
    value: string;
    label: string;
    icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  }[];
  hint?: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="label-eyebrow">{label}</span>
        {hint && (
          <span className="text-[10px] text-muted-foreground/70 tabular-nums">
            {hint}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {options.map((o) => {
          const active = o.value === value;
          const Icon = o.icon;
          return (
            <button
              key={o.value}
              onClick={() => onChange(o.value)}
              className={`tap press flex items-center justify-center gap-2 py-3 rounded-sm border text-[12px] uppercase tracking-[0.14em] transition-colors ${
                active
                  ? "border-primary text-primary bg-primary/10"
                  : "border-border text-muted-foreground active:text-foreground"
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />}
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function YearsField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: HoldingPeriod;
  onChange: (v: HoldingPeriod) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="label-eyebrow">{label}</span>
        <span className="text-[10px] text-muted-foreground/70">Years</span>
      </div>
      <div className="flex items-center gap-2">
        {HOLDING_PERIODS.map((y) => {
          const active = y === value;
          return (
            <button
              key={y}
              onClick={() => onChange(y)}
              className={`tap press flex-1 py-3 rounded-sm border text-sm tabular-nums transition-colors ${
                active
                  ? "border-primary text-primary bg-primary/10"
                  : "border-border text-muted-foreground active:text-foreground"
              }`}
            >
              {y}
            </button>
          );
        })}
      </div>
    </div>
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
        const active = value === h;
        return (
          <button
            key={h}
            onClick={() => onChange(h)}
            className={`tap press text-[10px] tracking-[0.16em] uppercase px-3 py-1.5 transition-colors ${
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
            activeDot={{ r: 3, fill: "#C6A46C", stroke: "#0F0F0F", strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="cumulativeIncome"
            stroke="#C6A46C"
            strokeOpacity={0.65}
            strokeWidth={1.25}
            strokeDasharray="3 3"
            dot={false}
            activeDot={{ r: 3, fill: "#C6A46C", stroke: "#0F0F0F", strokeWidth: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}


/* ---------- Step 2: Estimated Buying Power ---------- */

function BuyingPowerCard({
  deposit,
  ltv,
  setLtv,
  investmentType,
  setInvestmentType,
  mortgageType,
  setMortgageType,
  mortgageRate,
  residency,
  setResidency,
}: {
  deposit: number;
  ltv: number;
  setLtv: (n: number) => void;
  investmentType: InvestmentType;
  setInvestmentType: (v: InvestmentType) => void;
  mortgageType: MortgageType;
  setMortgageType: (v: MortgageType) => void;
  mortgageRate: number;
  residency: Residency | null;
  setResidency: (v: Residency) => void;
}) {
  const isMortgage = investmentType === "Mortgage";

  // budget = deposit / (1 - ltv/100), assuming deposit funds the equity portion.
  const budget = useMemo(() => {
    if (!isMortgage) return deposit;
    if (ltv >= 100) return deposit;
    const equityPct = 1 - ltv / 100;
    if (equityPct <= 0) return deposit;
    return Math.round(deposit / equityPct);
  }, [deposit, ltv, isMortgage]);

  const loanAmount = isMortgage ? Math.max(0, budget - deposit) : 0;

  const monthlyMortgage = useMemo(() => {
    if (!isMortgage || loanAmount === 0) return 0;
    const r = mortgageRate / 100;
    if (mortgageType === "Interest-only") {
      return Math.round((loanAmount * r) / 12);
    }
    // 25-year repayment, illustrative
    const i = r / 12;
    const n = 25 * 12;
    if (i === 0) return Math.round(loanAmount / n);
    const m = (loanAmount * i) / (1 - Math.pow(1 + i, -n));
    return Math.round(m);
  }, [isMortgage, loanAmount, mortgageRate, mortgageType]);

  const ltvFill = ((ltv - 50) / 30) * 100;

  return (
    <div className="mb-9 animate-fade-up">
      <Step number="Two" title="Your Estimated Buying Power" />

      <div className="rounded-sm border border-primary/40 bg-primary/[0.04] px-5 py-6 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkle className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
          <p className="label-eyebrow !text-primary/85">Based on your deposit</p>
        </div>
        <p className="text-[12.5px] text-muted-foreground leading-relaxed mb-4 max-w-[36ch]">
          Your estimated property budget is
        </p>
        <p className="font-serif num-display tabular-nums leading-none text-primary mb-1">
          {fmt.currency(budget)}
        </p>
        <p className="text-[11px] text-muted-foreground/80 tabular-nums">
          {isMortgage
            ? `${fmt.currency(deposit)} deposit · ${ltv}% LTV`
            : `Cash purchase · no financing`}
        </p>

        {/* Compact breakdown */}
        <div className="mt-5 grid grid-cols-3 gap-x-3">
          <BPItem label="Deposit" value={fmt.currency(deposit)} />
          <BPItem
            label="Loan"
            value={isMortgage ? fmt.currency(loanAmount) : "—"}
          />
          <BPItem
            label="LTV"
            value={isMortgage ? `${ltv}%` : "0%"}
            tone={isMortgage ? "primary" : undefined}
          />
        </div>
      </div>

      {/* Investment type toggle */}
      <div className="mb-6">
        <SegmentField
          label="Investment Type"
          value={investmentType}
          onChange={(v) => setInvestmentType(v as InvestmentType)}
          options={[
            { value: "Mortgage", label: "Mortgage", icon: Landmark },
            { value: "Cash", label: "Cash", icon: Wallet },
          ]}
        />
      </div>

      {isMortgage && (
        <>
          {/* Residency → indicative mortgage rate */}
          <div className="mb-6">
            <div className="flex items-baseline justify-between mb-2">
              <span className="label-eyebrow">Where are you currently resident?</span>
              {residency && (
                <span className="text-[10px] text-muted-foreground/70 tabular-nums">
                  Indicative · {mortgageRate.toFixed(2)}%
                </span>
              )}
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
                        : "border-border text-muted-foreground active:text-foreground"
                    }`}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-muted-foreground/75 leading-relaxed mt-2.5">
              Residency sets your indicative mortgage rate. Rates are illustrative
              and may be updated by Joseph Mews.
            </p>
            {!residency && (
              <p className="text-[11px] text-primary/90 mt-2">
                Select residency to continue.
              </p>
            )}
          </div>

          {/* LTV slider */}
          <div className="mb-6">
            <div className="flex items-baseline justify-between mb-3">
              <span className="label-eyebrow">Loan to Value</span>
              <span className="font-serif text-sm tabular-nums text-primary">
                {ltv}%
              </span>
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

          {/* Mortgage type */}
          <div className="mb-5">
            <SegmentField
              label="Mortgage Type"
              value={mortgageType}
              onChange={(v) => setMortgageType(v as MortgageType)}
              options={[
                { value: "Interest-only", label: "Interest-only" },
                { value: "Repayment", label: "Repayment" },
              ]}
              hint={
                residency
                  ? `Indicative rate · ${mortgageRate.toFixed(2)}%`
                  : undefined
              }
            />
          </div>

          {/* Monthly mortgage estimate */}
          <div className="rounded-sm border border-border bg-card/40 px-4 py-3.5 flex items-center justify-between">
            <div>
              <p className="label-eyebrow mb-1">Monthly Mortgage</p>
              <p className="text-[10.5px] text-muted-foreground/75">
                {mortgageType} · 25 yr term
              </p>
            </div>
            <p className="font-serif text-xl tabular-nums">
              {fmt.currency(monthlyMortgage)}
              <span className="text-[11px] text-muted-foreground/70 ml-1">/mo</span>
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function BPItem({
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
      <p className="text-[9.5px] tracking-[0.14em] uppercase text-muted-foreground/80 mb-1.5">
        {label}
      </p>
      <p
        className={`font-serif text-[15px] tabular-nums ${
          tone === "primary" ? "text-primary" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}


/* ---------- Matched Investment Opportunities ---------- */

function MatchedOpportunities({
  exact,
  stretch,
  budget,
  selectedId,
  onSelect,
  onEditFinance,
  onSpeakToAdvisor,
}: {
  exact: MatchResult[];
  stretch: MatchResult[];
  budget: number;
  selectedId: string | null;
  onSelect: (match: MatchResult) => void;
  onEditFinance: () => void;
  onSpeakToAdvisor: () => void;
}) {
  return (
    <div className="mb-9 animate-fade-up">
      <div className="mb-4">
        <p className="label-eyebrow mb-1.5">Step Three</p>
        <h2 className="font-serif text-xl tracking-tight mb-1.5">
          Matched Investment Opportunities
        </h2>
        <p className="text-[12px] text-muted-foreground leading-relaxed">
          {exact.length > 0
            ? `Up to 3 exact matches within ${fmt.currency(budget)} · tap to model returns.`
            : `No exact matches at your current buying power.`}
        </p>
      </div>

      {exact.length === 0 ? (
        <div className="rounded-sm border border-border bg-card/40 px-5 py-6 mb-4">
          <p className="font-serif text-base mb-2">No exact matches</p>
          <p className="text-[12.5px] text-muted-foreground leading-relaxed mb-5">
            No exact matches at your current buying power. Adjust your deposit or
            finance settings, or speak with an advisor.
          </p>
          <div className="flex flex-col gap-2.5">
            <button
              onClick={onEditFinance}
              className="tap press w-full py-3.5 rounded-sm bg-primary text-primary-foreground text-[12px] tracking-[0.1em] uppercase font-medium active:opacity-90"
            >
              Edit Deposit / Finance
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
              key={m.opportunity.id}
              match={m}
              active={m.opportunity.id === selectedId}
              onSelect={() => onSelect(m)}
            />
          ))}
        </div>
      )}

      {stretch.length > 0 && (
        <div className="mt-6">
          <p className="label-eyebrow mb-2">Near your budget</p>
          <p className="text-[11px] text-muted-foreground mb-3">
            Stretch options — above your current buying power.
          </p>
          <div className="space-y-3">
            {stretch.map((m) => (
              <MatchCard
                key={m.opportunity.id}
                match={m}
                active={m.opportunity.id === selectedId}
                onSelect={() => onSelect(m)}
                stretch
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
  onSelect,
  stretch = false,
}: {
  match: MatchResult;
  active: boolean;
  onSelect: () => void;
  stretch?: boolean;
}) {
  const o = match.opportunity;
  return (
    <button
      onClick={onSelect}
      className={`tap press w-full text-left rounded-sm border transition-colors overflow-hidden ${
        active
          ? "border-primary bg-primary/[0.05]"
          : "border-border active:bg-card/60"
      }`}
    >
      <div className="flex gap-3.5 p-3">
        <div className="w-20 h-20 rounded-sm overflow-hidden shrink-0 bg-card relative">
          <img
            src={o.image}
            alt={o.name}
            className="w-full h-full object-cover"
          />
          {active && (
            <div className="absolute inset-0 bg-primary/15 flex items-center justify-center">
              <span className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <Check
                  className="w-3.5 h-3.5 text-primary-foreground"
                  strokeWidth={2.5}
                />
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-serif text-[15px] leading-tight truncate">
                {o.name}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {o.city} · {o.region}
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
              label="Cash req."
              value={fmt.currency(match.cashRequired)}
            />
            <MiniStat
              label="Gross Yield"
              value={`${o.grossYield.toFixed(1)}%`}
              tone="primary"
            />
          </div>
          {stretch && match.stretchGap != null && (
            <p className="text-[10px] text-muted-foreground mt-2 tabular-nums">
              {fmt.currency(match.stretchGap)} above buying power
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

function WhyThisFits({ reasons }: { reasons: FitReason[] }) {
  if (reasons.length === 0) return null;
  return (
    <div className="mb-7 animate-fade-up">
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

/* ---------- Quick Return Summary ---------- */

function QuickReturnSummary({
  oppName,
  oppCity,
  holding,
  totalReturn,
  netMonthlyIncome,
  grossYield,
  monthlyRent,
  onView,
}: {
  oppName: string;
  oppCity: string;
  holding: HoldingPeriod;
  totalReturn: number;
  netMonthlyIncome: number;
  grossYield: number;
  monthlyRent: number;
  onView: () => void;
}) {
  return (
    <div className="border-t border-border pt-7 mb-7 animate-fade-up">
      <p className="label-eyebrow mb-1.5">Quick Look</p>
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
        <MiniSummary
          label="Monthly Rent"
          value={fmt.currency(monthlyRent)}
        />
        <MiniSummary
          label="Net Monthly"
          value={fmt.currency(netMonthlyIncome)}
        />
        <MiniSummary
          label="Gross Yield"
          value={`${grossYield.toFixed(2)}%`}
          tone="primary"
        />
      </div>

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


/* ---------- Wizard chrome ---------- */

interface WizardStep {
  readonly id: number;
  readonly key: string;
  readonly title: string;
  readonly caption: string;
}

function WizardProgress({
  steps,
  current,
  onSelect,
}: {
  steps: readonly WizardStep[];
  current: number;
  onSelect: (id: number) => void;
}) {
  return (
    <div className="pt-3 pb-5">
      {/* Segmented bar */}
      <div className="flex items-center gap-1.5 mb-3">
        {steps.map((s) => {
          const done = s.id < current;
          const active = s.id === current;
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              aria-label={`Go to step ${s.id}: ${s.title}`}
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

      {/* Step labels */}
      <div className="flex items-center justify-between text-[9px] tracking-[0.16em] uppercase">
        {steps.map((s) => {
          const active = s.id === current;
          const done = s.id < current;
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
  step,
  total,
  canBack,
  canNext,
  deposit,
  residencyRequired,
  onBack,
  onNext,
}: {
  step: number;
  total: number;
  canBack: boolean;
  canNext: boolean;
  deposit: number;
  residencyRequired: boolean;
  onBack: () => void;
  onNext: () => void;
}) {
  // Hide on the final step — the FinalOutlook owns its own CTAs.
  if (step === total) return null;

  // Options step: selection is via match cards — Back only.
  if (step === 3) {
    return (
      <div className="border-t border-border pt-5 mb-5 mt-2 flex items-center gap-3 animate-fade-up">
        <button
          onClick={onBack}
          className="tap press flex-1 py-3.5 rounded-sm border border-border text-[12px] tracking-[0.14em] uppercase text-muted-foreground active:text-foreground transition-colors"
        >
          Back
        </button>
      </div>
    );
  }

  // Continue button label and gate
  const labels: Record<number, string> = {
    1: "See My Buying Power",
    2: "Find My Matches",
    4: "View Long-Term Outlook",
  };
  const label = labels[step] ?? "Continue";
  const disabled =
    (step === 1 && deposit < 1000) || (step === 2 && residencyRequired);

  return (
    <div className="border-t border-border pt-5 mb-5 mt-2 flex items-center gap-3 animate-fade-up">
      {canBack ? (
        <button
          onClick={onBack}
          className="tap press flex-1 py-3.5 rounded-sm border border-border text-[12px] tracking-[0.14em] uppercase text-muted-foreground active:text-foreground transition-colors"
        >
          Back
        </button>
      ) : (
        <div className="flex-1" />
      )}
      <button
        onClick={onNext}
        disabled={!canNext || disabled}
        className={`tap press flex-[2] flex items-center justify-center gap-2 py-3.5 rounded-sm bg-primary text-primary-foreground text-[12.5px] tracking-[0.1em] uppercase font-medium transition-opacity ${
          !canNext || disabled ? "opacity-40 cursor-not-allowed" : "active:opacity-90"
        }`}
      >
        {label}
        <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
      </button>
    </div>
  );
}

/* ---------- Final Outlook (Step 5 closing card) ---------- */

function FinalOutlook({
  oppName,
  oppCity,
  holding,
  setHolding,
  chartData,
  totalReturn,
  totalCapitalGain,
  totalNetIncome,
  assumptionsOpen,
  setAssumptionsOpen,
  isMortgage,
  mortgageRate,
  onSpeakToAdvisor,
}: {
  oppName: string;
  oppCity: string;
  holding: HoldingPeriod;
  setHolding: (v: HoldingPeriod) => void;
  chartData: { label: string; propertyValue: number; cumulativeIncome: number }[];
  totalReturn: number;
  totalCapitalGain: number;
  totalNetIncome: number;
  assumptionsOpen: boolean;
  setAssumptionsOpen: (fn: (s: boolean) => boolean) => void;
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

      {/* Chart */}
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

      {/* Headline outputs */}
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

      {/* Assumptions */}
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
              value={`${ASSUMPTIONS.capitalGrowth.toFixed(1)}% / yr`}
            />
            <Assumption
              label="Rental Growth"
              value={`${ASSUMPTIONS.rentalGrowth.toFixed(1)}% / yr`}
            />
            <Assumption
              label="Indicative Mortgage Rate"
              value={
                isMortgage ? `${mortgageRate.toFixed(2)}%` : "Not applicable"
              }
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

      {/* Closing CTA */}
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
