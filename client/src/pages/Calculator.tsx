// Joseph Mews — Calculator (Run Numbers)
// IMPORTANT: This screen does NOT invent any financial formulas. All
// calculations are delegated to `lib/projection.ts` which encodes the
// predefined Excel-style model:
//   1. Annual Rental Income   = Monthly Rent × 12
//   2. Annual Costs           = Mgmt Fee + Service Charge + Mortgage
//   3. Net Annual Income      = Annual Rental Income − Annual Costs
//   4. Capital Growth (yr)    = Property Value × Growth Rate
//   5. Future Property Value  = compounded annually over holding period
//   6. Rental Growth          = compounded annually
//   7. Cumulative Net Income  = Σ Net Annual Income
//   8. Total Return           = Capital Gain + Cumulative Net Income
//
// UX: 5 visible inputs. Costs are pre-filled and surfaced in a thin
// secondary row so the page reads as a calculator, not a form.

import { useMemo, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { AppShell } from "@/components/AppShell";
import { fmt, getProperty } from "@/lib/data";
import { getOpportunity } from "@/lib/explore";
import { projectInvestment } from "@/lib/projection";
import { ArrowRight, Info, Pencil } from "lucide-react";
import NotFound from "./NotFound";

type Source = "property" | "explore";

interface Seed {
  title: string;
  subtitle: string;
  reference: string;
  // Inputs
  price: number;
  monthlyRent: number;
  growthRate: number;       // % p.a.
  rentalGrowth: number;     // % p.a.
  // Costs (annual)
  managementFee: number;
  serviceCharge: number;
  mortgage: number;
  // Where to deep-link "View Full Projection"
  projectionUrl: string;
}

function getSeed(source: Source, id: string): Seed | null {
  if (source === "property") {
    const p = getProperty(id);
    if (!p) return null;
    return {
      title: p.name,
      subtitle: `${p.location} · ${p.city}`,
      reference: p.reference,
      price: p.currentValue,
      monthlyRent: p.monthlyRent || p.expectedRent,
      growthRate: 4.5,
      rentalGrowth: 3.0,
      managementFee: p.monthlyManagementFee * 12,
      serviceCharge: p.monthlyServiceCharge * 12,
      mortgage: p.monthlyMortgage * 12,
      projectionUrl: `/property/${p.id}#section-projection`,
    };
  }
  const opp = getOpportunity(id);
  if (!opp) return null;
  // Convert published 5-year capital growth forecast to annual rate
  const annualGrowth =
    Math.pow(1 + opp.capitalGrowth5Y / 100, 1 / 5) * 100 - 100;
  const grossAnnualRent = opp.fromPrice * (opp.grossYield / 100);
  return {
    title: opp.name,
    subtitle: `${opp.developer} · ${opp.city}`,
    reference: opp.reference,
    price: opp.fromPrice,
    monthlyRent: Math.round(grossAnnualRent / 12),
    growthRate: Math.round(annualGrowth * 10) / 10,
    rentalGrowth: 3.0,
    managementFee: Math.round(grossAnnualRent * 0.10), // 10% of gross
    serviceCharge: Math.round(opp.fromPrice * 0.005),  // ~0.5% of value
    mortgage: 0,
    projectionUrl: `/explore/${opp.id}`,
  };
}

export default function Calculator() {
  const [, params] = useRoute<{ source: string; id: string }>(
    "/calculator/:source/:id"
  );
  const [, navigate] = useLocation();

  const source = (params?.source as Source) ?? "explore";
  const id = params?.id ?? "";
  const seed = useMemo(() => getSeed(source, id), [source, id]);

  if (!seed) return <NotFound />;

  return (
    <CalculatorBody seed={seed} navigate={navigate} source={source} sourceId={id} />
  );
}

function CalculatorBody({
  seed,
  navigate,
  source,
  sourceId,
}: {
  seed: Seed;
  navigate: (to: string) => void;
  source: Source;
  sourceId: string;
}) {
  // ----- Inputs (visible) -----
  const [price, setPrice] = useState(seed.price);
  const [monthlyRent, setMonthlyRent] = useState(seed.monthlyRent);
  const [growthRate, setGrowthRate] = useState(seed.growthRate);
  const [rentalGrowth, setRentalGrowth] = useState(seed.rentalGrowth);
  const [holdingYears, setHoldingYears] = useState(10);

  // ----- Costs (pre-filled, edit on demand) -----
  const [managementFee, setManagementFee] = useState(seed.managementFee);
  const [serviceCharge, setServiceCharge] = useState(seed.serviceCharge);
  const [mortgage, setMortgage] = useState(seed.mortgage);
  const [costsOpen, setCostsOpen] = useState(false);

  // ----- Run the predefined model -----
  const result = useMemo(
    () =>
      projectInvestment(
        {
          startValue: price,
          annualGrowth: growthRate,
          annualGrossRent: monthlyRent * 12,         // (1)
          rentalGrowth,
          annualServiceCharge: serviceCharge,
          annualManagementFee: managementFee,
          annualMortgage: mortgage,
          costGrowth: 2.5,
        },
        holdingYears
      ),
    [
      price,
      monthlyRent,
      growthRate,
      rentalGrowth,
      holdingYears,
      managementFee,
      serviceCharge,
      mortgage,
    ]
  );

  // ----- Outputs derived from year 1 / horizon -----
  const annualRent = monthlyRent * 12;                                    // (1)
  const annualCosts = managementFee + serviceCharge + mortgage;           // (2)
  const netAnnualIncome = annualRent - annualCosts;                       // (3)
  const grossYieldPct = price > 0 ? (annualRent / price) * 100 : 0;
  const capitalGain = result.totalCapitalGain;                            // (5)
  const capitalGainPct = price > 0 ? (capitalGain / price) * 100 : 0;
  const totalReturn = result.totalReturn;                                 // (8)
  const totalReturnPct = result.totalReturnPct;
  const futureValue = result.endValue;                                    // (5)
  const cumulativeIncome = result.totalNetIncome;                         // (7)

  return (
    <AppShell
      backTo={source === "property" ? `/property/${sourceId}` : `/explore/${sourceId}`}
    >
      <div className="page-px">
        {/* Title */}
        <header className="page-intro animate-fade-up">
          <p className="label-eyebrow">Run Numbers</p>
          <h1 className="page-intro__title">{seed.title}</h1>
          <p className="page-intro__sub">{seed.subtitle}</p>
        </header>

        {/* ----- INPUTS ----- */}
        <section className="border-t border-border pt-6 pb-2">
          <div className="flex items-baseline justify-between mb-5">
            <div>
              <p className="label-eyebrow mb-1.5">Step One</p>
              <h2 className="font-serif text-xl tracking-tight">Inputs</h2>
            </div>
            <button
              onClick={() => {
                setPrice(seed.price);
                setMonthlyRent(seed.monthlyRent);
                setGrowthRate(seed.growthRate);
                setRentalGrowth(seed.rentalGrowth);
                setHoldingYears(10);
                setManagementFee(seed.managementFee);
                setServiceCharge(seed.serviceCharge);
                setMortgage(seed.mortgage);
              }}
              className="tap text-[10px] tracking-[0.16em] uppercase text-muted-foreground active:text-foreground transition-colors"
            >
              Reset
            </button>
          </div>

          <div className="space-y-5">
            <CurrencyField
              label="Property Price"
              value={price}
              onChange={setPrice}
            />
            <CurrencyField
              label="Rental Income (monthly)"
              value={monthlyRent}
              onChange={setMonthlyRent}
            />
            <PercentField
              label="Capital Growth Rate"
              value={growthRate}
              onChange={setGrowthRate}
              hint="Annual"
            />
            <PercentField
              label="Rental Growth Rate"
              value={rentalGrowth}
              onChange={setRentalGrowth}
              hint="Annual"
            />
            <YearsField
              label="Holding Period"
              value={holdingYears}
              onChange={setHoldingYears}
            />
          </div>

          {/* Costs (collapsed by default) */}
          <div className="mt-7">
            <button
              onClick={() => setCostsOpen((s) => !s)}
              className="btn-quiet w-full justify-between"
              aria-expanded={costsOpen}
            >
              <span className="inline-flex items-center gap-2">
                <Pencil className="w-3 h-3" strokeWidth={1.5} />
                Costs · {fmt.currency(annualCosts)}/yr
              </span>
              <span className="text-[10px]">{costsOpen ? "Hide" : "Edit"}</span>
            </button>
            {costsOpen && (
              <div className="mt-5 space-y-5 animate-fade-up">
                <CurrencyField
                  label="Management Fee (annual)"
                  value={managementFee}
                  onChange={setManagementFee}
                />
                <CurrencyField
                  label="Service Charge (annual)"
                  value={serviceCharge}
                  onChange={setServiceCharge}
                />
                <CurrencyField
                  label="Mortgage (annual)"
                  value={mortgage}
                  onChange={setMortgage}
                  hint="Set 0 if not applicable"
                />
              </div>
            )}
          </div>
        </section>

        {/* ----- RESULTS ----- */}
        <section className="mt-9 pt-7 border-t border-border animate-fade-up">
          <p className="label-eyebrow mb-1.5">Step Two</p>
          <h2 className="font-serif text-xl tracking-tight mb-6">Results</h2>

          {/* Headline */}
          <div className="glass-gold glass--pad mb-6">
            <p className="label-eyebrow mb-3">
              Total Return · {holdingYears}Y
            </p>
            <p className="font-serif num-display tabular-nums leading-none text-primary mb-2">
              {fmt.currency(totalReturn)}
            </p>
            <p className="text-[12px] text-muted-foreground tabular-nums">
              +{totalReturnPct.toFixed(0)}% on {fmt.currency(price)} · capital +
              cumulative income
            </p>
          </div>

          {/* Output grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-7">
            <Output
              label="Net Annual Income"
              value={fmt.currency(netAnnualIncome)}
              sub={`Year 1 · ${fmt.currency(annualRent)} gross`}
            />
            <Output
              label="Gross Yield"
              value={`${grossYieldPct.toFixed(2)}%`}
              sub="Year 1 · before costs"
            />
            <Output
              label="Capital Growth"
              value={fmt.currency(capitalGain)}
              sub={`+${capitalGainPct.toFixed(0)}% over ${holdingYears}Y`}
              tone="primary"
            />
            <Output
              label="Projected Future Value"
              value={fmt.currency(futureValue)}
              sub={`At year ${holdingYears}`}
            />
            <Output
              label="Cumulative Income"
              value={fmt.currency(cumulativeIncome)}
              sub={`Across ${holdingYears} years`}
            />
            <Output
              label="Avg. Net Income / Yr"
              value={fmt.currency(Math.round(cumulativeIncome / holdingYears))}
              sub="Smoothed average"
            />
          </div>
        </section>

        {/* ----- CTA ----- */}
        <div className="mt-9 mb-2 animate-fade-up">
          <div className="hairline-gold mb-6" />
          <button
            onClick={() => navigate(seed.projectionUrl)}
            className="tap press btn-gold"
          >
            View Full Projection
            <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 mb-4 flex items-start gap-2.5">
          <Info
            className="w-3.5 h-3.5 text-muted-foreground/70 mt-0.5 shrink-0"
            strokeWidth={1.5}
          />
          <p className="text-[11px] leading-relaxed text-muted-foreground/80">
            Calculations follow Mews One's standard model. Figures are
            estimates based on current assumptions and exclude SDLT, legal fees
            and exit costs.
          </p>
        </div>

        <div className="h-8" />
      </div>
    </AppShell>
  );
}

/* --------------- Field components --------------- */

function CurrencyField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between mb-2">
        <span className="label-eyebrow">{label}</span>
        {hint && (
          <span className="text-[10px] text-muted-foreground/70">{hint}</span>
        )}
      </div>
      <div className="field flex items-center gap-2">
        <span className="font-serif text-base text-muted-foreground/70">£</span>
        <input
          type="number"
          inputMode="decimal"
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="flex-1 bg-transparent outline-none font-serif text-lg tabular-nums text-foreground placeholder:text-muted-foreground/50"
        />
      </div>
    </label>
  );
}

function PercentField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between mb-2">
        <span className="label-eyebrow">{label}</span>
        {hint && (
          <span className="text-[10px] text-muted-foreground/70">{hint}</span>
        )}
      </div>
      <div className="field flex items-center gap-2">
        <input
          type="number"
          inputMode="decimal"
          step="0.1"
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="flex-1 bg-transparent outline-none font-serif text-lg tabular-nums text-foreground placeholder:text-muted-foreground/50"
        />
        <span className="font-serif text-base text-muted-foreground/70">%</span>
      </div>
    </label>
  );
}

function YearsField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const presets = [5, 10, 15, 20];
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="label-eyebrow">{label}</span>
        <span className="text-[10px] text-muted-foreground/70">Years</span>
      </div>
      <div className="flex items-center gap-2">
        {presets.map((y) => {
          const active = y === value;
          return (
            <button
              key={y}
              onClick={() => onChange(y)}
              className={`tap press choice flex-1 !min-h-0 !py-3 text-sm tabular-nums ${
                active ? "choice--on" : ""
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
