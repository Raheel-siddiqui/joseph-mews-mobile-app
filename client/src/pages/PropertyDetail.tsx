// Joseph Mews — Property Detail
// Design: Sectioned breakdown — Overview, Financials (Income & Costs), Performance, Chart
// Progressive disclosure with hairline dividers
import { Link, useRoute } from "wouter";
import { AppShell } from "@/components/AppShell";
import {
  getProperty,
  fmt,
  filterByRange,
  timeRangeLabels,
  type TimeRange,
} from "@/lib/data";
import { ownsProperty } from "@/lib/holdings";
import { propertyGallery } from "@/lib/propertyImage";
import { PhotoRail } from "@/components/PhotoRail";
import {
  nextMortgagePayment,
  type MortgageInstallment,
  type MortgageInstallmentStatus,
} from "@/lib/paymentPlan";
import {
  Bed,
  Bath,
  Maximize2,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import NotFound from "./NotFound";
import { RangePills } from "@/components/dashboard/RangePills";
import { TrendLine } from "@/components/TrendLine";
import { ProjectionSection } from "@/components/ProjectionSection";

export default function PropertyDetail() {
  const [, params] = useRoute<{ id: string }>("/property/:id");
  const property =
    params?.id && ownsProperty(params.id) ? getProperty(params.id) : null;

  const [chartRange, setChartRange] = useState<TimeRange>("1Y");
  const [scheduleFilter, setScheduleFilter] =
    useState<ScheduleFilter>("all");

  if (!property) return <NotFound />;

  const equityPct = (property.equity / property.currentValue) * 100;
  const isInBuild = property.status === "In Build";
  const plan = property.mortgagePlan;
  const paidStages = plan
    ? plan.schedule.filter((item) => item.status === "paid")
    : [];
  const paidToDate = paidStages.reduce((sum, item) => sum + item.amount, 0);
  const planProgress = plan?.schedule.length
    ? (paidStages.length / plan.schedule.length) * 100
    : 0;
  const planNext = plan ? nextMortgagePayment(plan) : undefined;

  // Filter property's value history by selected range,
  // ensure at least 2 points so chart still renders for short ranges.
  const filteredHistory = useMemo(() => {
    const filtered = filterByRange(property.valueHistory, chartRange);
    if (filtered.length < 2 && property.valueHistory.length >= 2) {
      return property.valueHistory.slice(-2);
    }
    return filtered;
  }, [property.valueHistory, chartRange]);

  const rangeReturn = useMemo(() => {
    if (filteredHistory.length < 2) return { amount: 0, pct: 0 };
    const start = filteredHistory[0].value;
    const end = filteredHistory[filteredHistory.length - 1].value;
    const amount = end - start;
    const pct =
      amount === property.capitalGrowth
        ? property.capitalGrowthPct
        : start
          ? (amount / start) * 100
          : 0;
    return { amount, pct };
  }, [filteredHistory, property.capitalGrowth, property.capitalGrowthPct]);

  /* ----- Section tab navigation ----- */
  const sectionIds = useMemo(() => {
    const ids = ["overview"];
    if (property.mortgagePlan) ids.push("payments");
    ids.push("performance", "income", "projection", "content");
    return ids;
  }, [property.mortgagePlan]);
  const [activeSection, setActiveSection] = useState<string>("overview");
  const tabsRef = useRef<HTMLDivElement | null>(null);

  // Track which section is in view to highlight the active tab.
  useEffect(() => {
    const elements = sectionIds
      .map((id) => document.getElementById(`section-${id}`))
      .filter(Boolean) as HTMLElement[];
    if (elements.length === 0) return;

    const markActive = () => {
      const atEnd =
        window.scrollY > 0 &&
        window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 8;
      if (atEnd) {
        const last = sectionIds[sectionIds.length - 1];
        setActiveSection(last);
        revealTab(last, "auto");
        return;
      }
      const line = 120;
      let current = sectionIds[0];
      for (const id of sectionIds) {
        const el = document.getElementById(`section-${id}`);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      setActiveSection(current);
      revealTab(current, "auto");
    };
    const observer = new IntersectionObserver(markActive, {
      rootMargin: "-110px 0px -40% 0px",
      threshold: 0,
    });
    elements.forEach((el) => observer.observe(el));
    window.addEventListener("scroll", markActive, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", markActive);
    };
  }, [sectionIds]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(`section-${id}`);
    if (!el) return;
    const headerOffset = 104; // header + section rail
    const top = el.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top, behavior: "smooth" });
    setActiveSection(id);
    revealTab(id, "smooth");
  };

  const revealTab = (id: string, behavior: ScrollBehavior) => {
    const rail = tabsRef.current;
    const tabBtn = rail?.querySelector<HTMLButtonElement>(
      `[data-tab-id="${id}"]`
    );
    if (!rail || !tabBtn) return;
    const pad = 16;
    let target = rail.scrollLeft;
    const left = tabBtn.offsetLeft - pad;
    const right = tabBtn.offsetLeft + tabBtn.offsetWidth + pad;
    if (left < target) target = left;
    else if (right > target + rail.clientWidth) {
      target = right - rail.clientWidth;
    }

    for (const btn of rail.querySelectorAll<HTMLButtonElement>("button")) {
      if (btn === tabBtn) continue;
      const edge = btn.offsetLeft + btn.offsetWidth;
      const sliced = btn.offsetLeft < target + 2 && edge > target + 2;
      if (sliced) target = Math.max(target, edge);
    }

    const activeRight = tabBtn.offsetLeft + tabBtn.offsetWidth + pad;
    if (activeRight > target + rail.clientWidth) {
      target = activeRight - rail.clientWidth;
    }
    target = Math.max(0, target);
    if (Math.abs(target - rail.scrollLeft) < 2) return;
    rail.scrollTo({ left: target, behavior });
  };

  const tabLabels: Record<string, string> = {
    overview: "Overview",
    payments: "Payment Plan",
    performance: "Performance",
    income: "Income",
    projection: "Projection",
    content: "Updates",
  };

  return (
    <AppShell backTo="/portfolio">
      <nav className="section-nav" aria-label="Property sections">
        <div ref={tabsRef} className="section-nav__rail">
          {sectionIds.map((id) => {
            const active = activeSection === id;
            return (
              <button
                key={id}
                type="button"
                data-tab-id={id}
                aria-current={active ? "location" : undefined}
                onClick={() => scrollToSection(id)}
                className={`tap section-nav__btn ${
                  active ? "section-nav__btn--on" : ""
                }`}
              >
                {tabLabels[id]}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="page-px">
        <div id="section-overview" />
        <div className="mt-3 mb-4 animate-fade-up">
          <PhotoRail
            images={propertyGallery(property)}
            label={property.name}
            status={
              property.status === "Available" ? (
                <StatusPill status={property.status} />
              ) : undefined
            }
          />
          <div className="mt-3">
            <p className="label-eyebrow">{property.reference}</p>
            <h1 className="page-intro__title">{property.name}</h1>
            <p className="page-intro__sub">
              {[property.location, property.city].filter(Boolean).join(" · ")}
            </p>
          </div>
        </div>

        <div
          className="glass glass--pad mb-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground animate-fade-up"
          style={{ animationDelay: "60ms" }}
        >
          <span className="flex items-center gap-1.5">
            <Bed className="w-3.5 h-3.5" strokeWidth={1.5} />
            {property.bedrooms} bed
          </span>
          <span className="flex items-center gap-1.5">
            <Bath className="w-3.5 h-3.5" strokeWidth={1.5} />
            {property.bathrooms} bath
          </span>
          <span className="flex items-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5" strokeWidth={1.5} />
            {property.sqft} sq ft
          </span>
        </div>

        <Section>
          <ValueCard
            currentValue={property.currentValue}
            rangeReturn={{
              amount: property.capitalGrowth,
              pct: property.capitalGrowthPct,
            }}
            rangeLabel="Since purchase"
            series={filteredHistory}
            range={chartRange}
            onRangeChange={setChartRange}
            showChart={false}
          />

          <div className="glass stat-grid mt-4">
            <DataPoint
              label="Purchase Price"
              value={fmt.currency(property.purchasePrice)}
              sub={property.purchaseDate}
            />
            <DataPoint
              label="Current Value"
              value={fmt.currency(property.currentValue)}
            />
            <DataPoint
              label="Equity Position"
              value={fmt.currency(property.equity)}
              sub={`${equityPct.toFixed(2)}% of value`}
            />
            <DataPoint
              label="Remaining to pay"
              value={fmt.currency(property.loanBalance)}
              sub={purchaseShare(property.loanBalance, property.purchasePrice)}
            />
          </div>
        </Section>

        {plan && (
          <>
            <Divider />

            <div id="section-payments" />
            <Section title="Payment Plan">
              {plan.lender.startsWith("Developer") && (
                <p className="text-[12px] text-muted-foreground mb-6">
                  {plan.lender}
                </p>
              )}

              <div className="glass stat-grid mb-5">
                <DataPoint
                  label="Purchase Price"
                  value={fmt.currency(property.purchasePrice)}
                />
                <DataPoint label="Paid to date" value={fmt.currency(paidToDate)} />
                <DataPoint
                  label="Remaining"
                  value={fmt.currency(plan.outstandingBalance)}
                />
                <DataPoint
                  label="Stages"
                  value={`${paidStages.length} of ${plan.schedule.length} paid`}
                />
              </div>

              <div className="mb-7">
                <div className="flex items-center justify-between mb-2">
                  <p className="label-eyebrow">Paid to date</p>
                  <p className="text-[11px] tabular-nums text-muted-foreground">
                    {planProgress.toFixed(0)}%
                  </p>
                </div>
                <div className="h-[2px] bg-border relative overflow-hidden rounded-full">
                  <div
                    className="absolute inset-y-0 left-0 bg-primary rounded-full"
                    style={{ width: `${Math.min(100, planProgress)}%` }}
                  />
                </div>
              </div>

              {planNext && (
                <div className="glass-gold glass--pad mb-7">
                  <p className="label-eyebrow mb-2 text-primary">Next payment</p>
                  <p className="font-serif text-2xl tabular-nums leading-none mb-2">
                    {fmt.currency(planNext.amount)}
                  </p>
                  <p className="text-[13px] text-foreground/85">
                    {planNext.label}
                  </p>
                  <p className="text-[12px] text-muted-foreground mt-1 tabular-nums">
                    Due {planNext.dueDate}
                  </p>
                </div>
              )}

              <div className="space-y-0">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <p className="label-eyebrow shrink-0">Schedule</p>
                  <ScheduleFilterTabs
                    value={scheduleFilter}
                    onChange={setScheduleFilter}
                  />
                </div>
                {(() => {
                  const rows = (
                    scheduleFilter === "all"
                      ? plan.schedule
                      : plan.schedule.filter(
                          (i) => i.status === scheduleFilter
                        )
                  ).slice();
                  if (rows.length === 0) {
                    return (
                      <p className="text-sm text-muted-foreground py-2">
                        No {scheduleFilter} payments in this schedule
                      </p>
                    );
                  }
                  return (
                    <div className="glass-list">
                      {rows.map((inst) => (
                        <div key={inst.id} className="py-3.5">
                          <MortgageInstallmentRow installment={inst} />
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </Section>
          </>
        )}

        <Divider />

        <div id="section-performance" />
        <Section title="Value over time">
          <ValueCard
            currentValue={property.currentValue}
            rangeReturn={rangeReturn}
            rangeLabel={timeRangeLabels[chartRange]}
            series={filteredHistory}
            range={chartRange}
            onRangeChange={setChartRange}
            showChart
            chartOnly
          />
        </Section>

        <Divider />

        {/* SECTION 2: INCOME & COSTS */}
        <div id="section-income" />
        <Section title="Income & Costs">
          {isInBuild ? (
            <div className="glass glass--pad py-8 text-center">
              <p className="label-eyebrow mb-3">Property In Build</p>
              <p className="text-sm text-muted-foreground mb-2">
                Income generation begins post-completion
              </p>
              <p className="text-xs text-muted-foreground tabular-nums">
                Expected rent · {fmt.currency(property.expectedRent)}/mo
              </p>
            </div>
          ) : (
            <>
              {/* Income */}
              <div className="glass-gold glass--pad mb-4">
                <div className="flex items-baseline justify-between mb-1">
                  <p className="text-sm font-medium">Monthly Rental Income</p>
                  <p className="font-serif text-2xl tabular-nums text-primary">
                    {fmt.currency(property.monthlyRent)}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Expected · {fmt.currency(property.expectedRent)}
                </p>
              </div>

              <p className="label-eyebrow mb-3">Monthly Costs</p>
              <div className="glass-list mb-4">
                <div className="py-3.5">
                  <CostRow
                    label="Service Charge"
                    value={fmt.currency(property.monthlyServiceCharge)}
                  />
                </div>
                <div className="py-3.5">
                  <CostRow
                    label="Management Fee"
                    value={fmt.currency(property.monthlyManagementFee)}
                  />
                </div>
                <div className="py-3.5 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Total Costs</p>
                  <p className="font-serif text-lg tabular-nums">
                    {fmt.currency(
                      property.monthlyServiceCharge +
                        property.monthlyManagementFee
                    )}
                  </p>
                </div>
              </div>

              <div className="glass glass--pad">
                <p className="label-eyebrow mb-2">Net Monthly Income</p>
                <p className="font-serif num-display tabular-nums leading-none mb-1">
                  {fmt.currency(property.netMonthlyIncome)}
                </p>
                <p className="text-xs text-muted-foreground tabular-nums">
                  Annual · {fmt.currency(property.annualNetIncome)}
                </p>
              </div>
            </>
          )}
        </Section>

        <Divider />

        <div id="section-returns" />
        <Section title="Performance">
          <div className="glass-list">
            <div className="py-3.5">
              <PerformanceRow
                label="Capital Growth"
                sublabel="Since purchase"
                value={`${property.capitalGrowthPct >= 0 ? "+" : ""}${property.capitalGrowthPct.toFixed(2)}%`}
                tone="positive"
              />
            </div>
            <div className="py-3.5">
              <PerformanceRow
                label="Gross Yield"
                sublabel={isInBuild ? "Not yet available" : "Annualised · before costs"}
                value={isInBuild ? "—" : fmt.pctPlain(property.grossYield)}
              />
            </div>
            <div className="py-3.5">
              <PerformanceRow
                label="Occupancy"
                sublabel="Last 12 months"
                value={`${property.occupancy}%`}
              />
            </div>
          </div>
        </Section>

        <Divider />

        {/* SECTION 5: FORWARD PROJECTION */}
        <div id="section-projection" />
        <ProjectionSection
          title="Projection"
          input={{
            startValue: property.currentValue,
            annualGrowth: property.id === "JM-PENNY" ? 4 : 4.5,
            annualGrossRent: property.monthlyRent * 12 || property.expectedRent * 12,
            rentalGrowth: property.id === "JM-PENNY" ? 0 : 3.0,
            annualServiceCharge: property.monthlyServiceCharge * 12,
            annualManagementFee: property.monthlyManagementFee * 12,
            annualMortgage: property.monthlyMortgage * 12,
            costGrowth: property.id === "JM-PENNY" ? 0 : 2.5,
          }}
          hasMortgage={property.id === "JM-PENNY" || property.monthlyMortgage > 0}
          mortgageRate={property.id === "JM-PENNY" ? 2.9 : 5.25}
        />

        <Divider />
        <div id="section-content" />
        <Section title="Updates">
          <Link
            href={`/property/${property.id}/content`}
            className="glass glass--pad flex items-center gap-3"
          >
            <img
              src={propertyGallery(property)[0]}
              alt=""
              className="h-14 w-14 shrink-0 rounded-md object-cover"
            />
            <span className="min-w-0 flex-1">
              <span className="block font-serif text-lg leading-tight">
                {property.name}
              </span>
              {property.id === "JM-PENNY" && (
                <span className="mt-1 block text-[12px] text-muted-foreground">
                  15 Sep 2026
                </span>
              )}
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Link>
        </Section>

        <div className="h-8" />
      </div>
    </AppShell>
  );
}

function purchaseShare(balance: number, purchase: number) {
  if (!purchase) return undefined;
  const pct = Math.floor((balance / purchase) * 10000) / 100;
  return `${pct.toFixed(2)}% of purchase`;
}

function ValueCard({
  currentValue,
  rangeReturn,
  rangeLabel,
  series,
  range,
  onRangeChange,
  showChart = true,
  chartOnly = false,
}: {
  currentValue: number;
  rangeReturn: { amount: number; pct: number };
  rangeLabel: string;
  series: { month: string; value: number; monthsAgo: number }[];
  range: TimeRange;
  onRangeChange: (v: TimeRange) => void;
  showChart?: boolean;
  chartOnly?: boolean;
}) {
  const positive = rangeReturn.amount >= 0;
  const GrowthIcon = positive ? ArrowUpRight : ArrowDownRight;

  return (
    <div className="pd-value">
      {!chartOnly && (
        <>
          <p className="label-eyebrow pd-value__label">Current Valuation</p>
          <h2 className="pd-value__amount">{fmt.currency(currentValue)}</h2>
        </>
      )}
      <div className="pd-value__growth">
        <p
          className={`inline-flex items-center gap-2.5 ${
            positive ? "text-positive" : "text-destructive"
          }`}
        >
          <span className="inline-flex items-center gap-0.5">
            <GrowthIcon className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span className="text-[14px] font-medium tabular-nums">
              {fmt.currency(rangeReturn.amount)}
            </span>
          </span>
          <span className="text-[14px] font-medium tabular-nums">
            {rangeReturn.pct >= 0 ? "+" : ""}
            {rangeReturn.pct.toFixed(2)}%
          </span>
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground/70">
          {rangeLabel}
        </p>
      </div>
      {showChart && (
        <>
          <TrendLine
            data={series}
            xKey="month"
            yKey="value"
            height={168}
            animate={false}
            hero
          />
          <div className="pd-value__pills">
            <RangePills value={range} onChange={onRangeChange} />
          </div>
        </>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10 animate-fade-up">
      {title && <h3 className="section-kicker">{title}</h3>}
      {children}
    </section>
  );
}

function Divider() {
  return null;
}

function DataPoint({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div>
      <p className="label-eyebrow mb-2">{label}</p>
      <p className="font-serif text-lg tabular-nums leading-none mb-1">
        {value}
      </p>
      {sub && (
        <p className="text-[11px] text-muted-foreground/80 tabular-nums">
          {sub}
        </p>
      )}
    </div>
  );
}

function CostRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-sm tabular-nums">{value}</p>
    </div>
  );
}

type ScheduleFilter = "all" | MortgageInstallmentStatus;

const SCHEDULE_FILTERS: { value: ScheduleFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "paid", label: "Paid" },
  { value: "due", label: "Due" },
  { value: "upcoming", label: "Upcoming" },
];

function ScheduleFilterTabs({
  value,
  onChange,
}: {
  value: ScheduleFilter;
  onChange: (v: ScheduleFilter) => void;
}) {
  return (
    <div className="seg max-w-full">
      {SCHEDULE_FILTERS.map((r) => {
        const active = r.value === value;
        return (
          <button
            key={r.value}
            type="button"
            onClick={() => onChange(r.value)}
            className={`tap seg__btn ${active ? "seg__btn--on" : ""}`}
          >
            {r.label}
          </button>
        );
      })}
    </div>
  );
}

function MortgageInstallmentRow({
  installment,
}: {
  installment: MortgageInstallment;
}) {
  const statusLabel =
    installment.status === "paid"
      ? "Paid"
      : installment.status === "due"
      ? "Due"
      : "Upcoming";
  const statusTone =
    installment.status === "paid" || installment.status === "due"
      ? "text-primary"
      : "text-muted-foreground";

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium mb-0.5">{installment.label}</p>
        <p className="text-[11px] text-muted-foreground tabular-nums">
          {installment.status === "paid" && installment.paidAt
            ? `Paid ${installment.paidAt}`
            : installment.dueDate}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="font-serif text-base tabular-nums leading-none mb-1">
          {fmt.currency(installment.amount)}
        </p>
        <p
          className={`text-[10px] tracking-[0.14em] uppercase ${statusTone}`}
        >
          {statusLabel}
        </p>
      </div>
    </div>
  );
}

function PerformanceRow({
  label,
  sublabel,
  value,
  tone,
}: {
  label: string;
  sublabel: string;
  value: string;
  tone?: "positive";
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-medium mb-1">{label}</p>
        <p className="label-eyebrow truncate">{sublabel}</p>
      </div>
      <p
        className={`font-serif text-xl tabular-nums tracking-tight shrink-0 ${
          tone === "positive" ? "text-primary" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const tone =
    status === "Tenanted" || status === "Available"
      ? "chip chip--gold chip--on-photo"
      : status === "In Build" || status === "Refurbishment"
        ? "chip chip--warn chip--on-photo"
        : "chip chip--muted chip--on-photo";

  return <span className={tone}>{status}</span>;
}


