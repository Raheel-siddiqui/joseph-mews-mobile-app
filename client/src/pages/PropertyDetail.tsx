// Joseph Mews — Property Detail
// Design: Sectioned breakdown — Overview, Financials (Income & Costs), Performance, Chart
// Progressive disclosure with hairline dividers
import { useRoute } from "wouter";
import { AppShell } from "@/components/AppShell";
import {
  getProperty,
  fmt,
  filterByRange,
  timeRangeLabels,
  type TimeRange,
} from "@/lib/data";
import {
  Bed,
  Bath,
  Maximize2,
  ArrowUpRight,
  Calendar,
  User,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import NotFound from "./NotFound";
import { TimeRangeTabs } from "@/components/TimeRangeTabs";
import { TrendLine } from "@/components/TrendLine";
import { ProjectionSection } from "@/components/ProjectionSection";

export default function PropertyDetail() {
  const [, params] = useRoute<{ id: string }>("/property/:id");
  const property = params?.id ? getProperty(params.id) : null;

  const [chartRange, setChartRange] = useState<TimeRange>("1Y");

  if (!property) return <NotFound />;

  const equityPct = (property.equity / property.currentValue) * 100;
  const isInBuild = property.status === "In Build";

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
    return { amount: end - start, pct: ((end - start) / start) * 100 };
  }, [filteredHistory]);

  /* ----- Section tab navigation ----- */
  const sectionIds = useMemo(() => {
    const base = ["overview", "performance", "income", "projection"];
    return property.tenantName ? [...base, "tenancy"] : base;
  }, [property.tenantName]);
  const [activeSection, setActiveSection] = useState<string>("overview");
  const tabsRef = useRef<HTMLDivElement | null>(null);

  // Track which section is in view to highlight the active tab.
  useEffect(() => {
    const elements = sectionIds
      .map((id) => document.getElementById(`section-${id}`))
      .filter(Boolean) as HTMLElement[];
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the entry closest to the top of the viewport that is intersecting.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          const id = visible[0].target.id.replace("section-", "");
          setActiveSection(id);
        }
      },
      {
        // Header (~56px) + tab bar (~44px) ≈ 100px sticky offset.
        rootMargin: "-110px 0px -55% 0px",
        threshold: 0,
      }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sectionIds]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(`section-${id}`);
    if (!el) return;
    const headerOffset = 108; // header + tab bar
    const top = el.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top, behavior: "smooth" });
    setActiveSection(id);
    // Keep active tab visible inside the horizontal rail.
    const tabBtn = tabsRef.current?.querySelector<HTMLButtonElement>(
      `[data-tab-id="${id}"]`
    );
    tabBtn?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  };

  const tabLabels: Record<string, string> = {
    overview: "Overview",
    performance: "Performance",
    income: "Income",
    projection: "Projection",
    tenancy: "Tenancy",
  };

  return (
    <AppShell backTo="/portfolio">
      {/* Sticky section tabs — sit beneath the global header */}
      <div className="sticky top-14 z-30 bg-background/95 backdrop-blur-md">
        <div
          ref={tabsRef}
          className="flex items-center gap-1 overflow-x-auto scrollbar-hide page-px"
        >
          {sectionIds.map((id) => {
            const active = activeSection === id;
            return (
              <button
                key={id}
                data-tab-id={id}
                onClick={() => scrollToSection(id)}
                className={`tap press relative flex-shrink-0 px-3 py-3 text-[10px] tracking-[0.18em] uppercase transition-colors ${
                  active
                    ? "text-primary"
                    : "text-muted-foreground active:text-foreground"
                }`}
              >
                {tabLabels[id]}
                {active && (
                  <span className="absolute left-3 right-3 bottom-0 h-px bg-primary" />
                )}
              </button>
            );
          })}
        </div>
        <div className="hairline" />
      </div>

      <div className="page-px">
        {/* Hero image — 16/9 reads better than 16/11 on phones */}
        <div className="aspect-[16/9] rounded-sm overflow-hidden bg-card mb-6 -mx-page sm:mx-0 animate-fade-up">
          <img
            src={property.image}
            alt={property.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Title block */}
        <div className="mb-7 animate-fade-up" style={{ animationDelay: "60ms" }}>
          <div className="flex items-center justify-between gap-3 mb-3">
            <p className="label-eyebrow truncate">{property.reference}</p>
            <StatusPill status={property.status} />
          </div>
          <h1 className="font-serif text-2xl leading-tight mb-2">
            {property.name}
          </h1>
          <p className="text-[13px] text-muted-foreground">
            {property.location} · {property.city}
          </p>

          {/* Specs row */}
          <div className="flex items-center gap-5 mt-5 text-xs text-muted-foreground">
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
        </div>

        {/* SECTION 1: VALUE OVERVIEW */}
        <div id="section-overview" />
        <Section title="Value">
          <div className="mb-6">
            <p className="label-eyebrow mb-3">Current Valuation</p>
            <h2 className="font-serif num-hero leading-none tracking-tight tabular-nums mb-3">
              {fmt.currency(property.currentValue)}
            </h2>
            <div className="flex items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-1 text-primary tabular-nums">
                <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.75} />
                {fmt.currency(property.capitalGrowth)}
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground tabular-nums">
                {fmt.pct(property.capitalGrowthPct)}
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">Since purchase</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-5 pt-5 border-t border-border">
            <DataPoint
              label="Purchase Price"
              value={fmt.currency(property.purchasePrice)}
              sub={property.purchaseDate}
            />
            <DataPoint
              label="Current Value"
              value={fmt.currency(property.currentValue)}
              sub="As of May 2026"
            />
            <DataPoint
              label="Equity Position"
              value={fmt.currency(property.equity)}
              sub={`${equityPct.toFixed(0)}% of value`}
            />
            <DataPoint
              label="Outstanding Loan"
              value={fmt.currency(property.loanBalance)}
              sub={`${(100 - equityPct).toFixed(0)}% LTV`}
            />
          </div>
        </Section>

        <Divider />

        {/* SECTION 2: VALUE GROWTH CHART */}
        <div id="section-performance" />
        <Section title="Value Over Time">
          <div className="flex items-baseline justify-between mb-5">
            <div>
              <p className="text-[10px] tracking-[0.16em] uppercase text-muted-foreground mb-1">
                {timeRangeLabels[chartRange]}
              </p>
              <p className="font-serif text-xl tabular-nums text-primary">
                <span className="inline-flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.75} />
                  {fmt.currency(rangeReturn.amount)}
                </span>
                <span className="text-muted-foreground text-sm font-sans ml-2">
                  {fmt.pct(rangeReturn.pct)}
                </span>
              </p>
            </div>
            <TimeRangeTabs value={chartRange} onChange={setChartRange} />
          </div>
          <TrendLine data={filteredHistory} xKey="month" yKey="value" height={150} />
          <div className="flex items-center justify-between mt-3 text-[10px] tracking-[0.14em] uppercase text-muted-foreground/60 tabular-nums">
            <span>{filteredHistory[0]?.month}</span>
            <span>{filteredHistory[filteredHistory.length - 1]?.month}</span>
          </div>
        </Section>

        <Divider />

        {/* SECTION 3: INCOME & COSTS */}
        <div id="section-income" />
        <Section title="Income & Costs">
          {isInBuild ? (
            <div className="py-8 text-center border border-dashed border-border rounded-sm">
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
              <div className="mb-8">
                <div className="flex items-baseline justify-between mb-1">
                  <p className="text-sm font-medium">Monthly Rental Income</p>
                  <p className="font-serif text-2xl tabular-nums text-primary">
                    {fmt.currency(property.monthlyRent)}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Expected · {fmt.currency(property.expectedRent)}
                  {property.monthlyRent > property.expectedRent && (
                    <span className="text-primary ml-2">
                      +{fmt.currency(property.monthlyRent - property.expectedRent)} above
                    </span>
                  )}
                </p>
              </div>

              <div className="hairline mb-8" />

              {/* Costs breakdown */}
              <div className="space-y-5 mb-8">
                <p className="label-eyebrow">Monthly Costs</p>
                <CostRow
                  label="Service Charge"
                  value={fmt.currency(property.monthlyServiceCharge)}
                />
                <CostRow
                  label="Management Fee"
                  value={fmt.currency(property.monthlyManagementFee)}
                />
                <CostRow
                  label="Mortgage Payment"
                  value={fmt.currency(property.monthlyMortgage)}
                />
                <div className="hairline" />
                <div className="flex items-center justify-between pt-1">
                  <p className="text-sm text-muted-foreground">Total Costs</p>
                  <p className="font-serif text-lg tabular-nums">
                    {fmt.currency(
                      property.monthlyServiceCharge +
                        property.monthlyManagementFee +
                        property.monthlyMortgage
                    )}
                  </p>
                </div>
              </div>

              <div className="hairline-gold mb-8" />

              {/* Net income */}
              <div className="bg-card/50 px-5 py-5 rounded-sm border border-border">
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

        {/* SECTION 4: PERFORMANCE */}
        <Section title="Performance">
          <div className="space-y-7">
            <PerformanceRow
              label="Capital Growth"
              sublabel="Since purchase"
              value={fmt.pct(property.capitalGrowthPct)}
              tone="positive"
            />
            <div className="hairline" />
            <PerformanceRow
              label="Gross Yield"
              sublabel={isInBuild ? "Not yet available" : "Actual · Annual rent ÷ value"}
              value={isInBuild ? "—" : fmt.pctPlain(property.grossYield)}
            />
            <div className="hairline" />
            <PerformanceRow
              label="Occupancy"
              sublabel="Last 12 months"
              value={`${property.occupancy}%`}
            />
          </div>
        </Section>

        <Divider />

        {/* SECTION 5: FORWARD PROJECTION */}
        <div id="section-projection" />
        <ProjectionSection
          title="Projection"
          input={{
            startValue: property.currentValue,
            annualGrowth: 4.5,
            annualGrossRent: property.monthlyRent * 12 || property.expectedRent * 12,
            rentalGrowth: 3.0,
            annualServiceCharge: property.monthlyServiceCharge * 12,
            annualManagementFee: property.monthlyManagementFee * 12,
            annualMortgage: property.monthlyMortgage * 12,
            costGrowth: 2.5,
          }}
          hasMortgage={property.monthlyMortgage > 0}
          mortgageRate={5.25}
        />

        {/* Tenant info */}
        {property.tenantName && (
          <>
            <Divider />
            <div id="section-tenancy" />
            <Section title="Current Tenant">
              <div className="space-y-4">
                <InfoRow
                  icon={User}
                  label="Tenant"
                  value={property.tenantName}
                />
                {property.tenancyEnd && (
                  <InfoRow
                    icon={Calendar}
                    label="Tenancy ends"
                    value={property.tenancyEnd}
                  />
                )}
                <InfoRow
                  icon={TrendingUp}
                  label="Occupancy"
                  value={`${property.occupancy}% over 12 months`}
                />
              </div>
            </Section>
          </>
        )}

        <div className="h-8" />
      </div>
    </AppShell>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-7 animate-fade-up">
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <h3 className="font-serif text-xl tracking-tight">{title}</h3>
        </div>
      </div>
      {children}
    </section>
  );
}

function Divider() {
  return <div className="hairline" />;
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
  const styles = {
    Tenanted: "border-primary/40 text-primary",
    "In Build": "border-amber-500/40 text-amber-500/90",
    Vacant: "border-muted-foreground/40 text-muted-foreground",
    Refurbishment: "border-amber-500/40 text-amber-500/90",
  }[status] || "border-muted-foreground/40 text-muted-foreground";

  return (
    <span
      className={`text-[10px] tracking-[0.18em] uppercase px-2.5 py-1 border rounded-sm ${styles}`}
    >
      {status}
    </span>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <div className="flex-1">
        <p className="text-[10px] tracking-[0.14em] uppercase text-muted-foreground mb-0.5">
          {label}
        </p>
        <p className="text-sm">{value}</p>
      </div>
    </div>
  );
}


