// Joseph Mews — Dashboard
// Design Philosophy: Private Banking Modernism
// - Hero number is the star (Total Portfolio Value in serif)
// - Editorial hierarchy: large serif numbers, small uppercase sans labels
// - Hairline gold dividers between sections
// - Generous vertical rhythm (32-64px between sections)
import { Link } from "wouter";
import { AppShell } from "@/components/AppShell";
import {
  portfolio,
  properties,
  activities,
  investor,
  fmt,
  portfolioHistory,
  filterByRange,
  timeRangeLabels,
  type TimeRange,
} from "@/lib/data";
import { openAdvisorMail } from "@/lib/advisor";
import { intelligence, getRegionInsight } from "@/lib/intelligence";
import { getPortfolioInsights, type Insight } from "@/lib/insights";
import {
  ArrowUpRight,
  ArrowRight,
  Circle,
  ArrowDownRight,
  Sparkle,
  Lightbulb,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { TimeRangeTabs } from "@/components/TimeRangeTabs";
import { TrendLine } from "@/components/TrendLine";

export default function Dashboard() {
  const [greeting, setGreeting] = useState("Good evening");
  const [range, setRange] = useState<TimeRange>("1Y");
  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting("Good morning");
    else if (h < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  // Filter the portfolio time-series by selected range
  const series = useMemo(
    () => filterByRange(portfolioHistory, range),
    [range]
  );

  // Compute return for the selected range from the series
  const rangeReturn = useMemo(() => {
    if (series.length < 2) return { amount: 0, pct: 0 };
    const start = series[0].value;
    const end = series[series.length - 1].value;
    return {
      amount: end - start,
      pct: ((end - start) / start) * 100,
    };
  }, [series]);

  const isAll = range === "ALL";
  const returnAmount = isAll ? portfolio.totalReturn : rangeReturn.amount;
  const returnPct = isAll ? portfolio.totalReturnPct : rangeReturn.pct;

  // Show only top 2 properties as preview
  const previewProperties = properties.slice(0, 2);
  const previewActivities = activities.slice(0, 3);
  const insight = getRegionInsight();

  return (
    <AppShell>
      <div className="page-px">
        {/* Greeting */}
        <div className="pt-3 pb-7 animate-fade-up">
          <p className="label-eyebrow mb-1.5">{greeting}</p>
          <h1 className="font-serif text-[1.375rem] tracking-tight">
            {investor.firstName}
          </h1>
        </div>

        {/* HERO — Total Portfolio Value with explicit Return context */}
        <div className="mb-2 animate-fade-up" style={{ animationDelay: "60ms" }}>
          <p className="label-eyebrow mb-3">Total Portfolio Value</p>
          <div className="flex items-baseline gap-3 mb-5">
            <h2 className="font-serif num-hero">
              {fmt.currency(portfolio.currentValue)}
            </h2>
          </div>

          {/* Capital growth — value change only (not capital + income) */}
          <div className="flex items-baseline gap-5 mb-2">
            <div>
              <p className="text-[10px] tracking-[0.16em] uppercase text-muted-foreground mb-1">
                Capital growth
              </p>
              <p className="inline-flex items-baseline gap-1.5 text-primary font-serif text-lg tabular-nums">
                <ArrowUpRight className="w-3.5 h-3.5 self-center" strokeWidth={1.75} />
                {fmt.currency(returnAmount)}
              </p>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.16em] uppercase text-muted-foreground mb-1">
                Growth %
              </p>
              <p className="text-primary font-serif text-lg tabular-nums">
                {fmt.pct(returnPct)}
              </p>
            </div>
          </div>
          <p className="text-[10px] tracking-[0.14em] uppercase text-muted-foreground mb-5">
            {timeRangeLabels[range]} · value change only
          </p>

          {/* Trend chart */}
          <div className="mb-4 -mx-1">
            <TrendLine data={series} xKey="month" yKey="value" height={120} />
          </div>

          {/* Range tabs — control trend + return values together */}
          <div className="flex items-center justify-between">
            <p className="text-[10px] tracking-[0.16em] uppercase text-muted-foreground">
              Portfolio value over time
            </p>
            <TimeRangeTabs value={range} onChange={setRange} />
          </div>
        </div>

        <div className="hairline-gold my-10" />

        {/* Three-up summary — mobile-tuned with k-format and tight gaps */}
        <div className="grid grid-cols-3 gap-1.5 mb-11 animate-fade-up" style={{ animationDelay: "120ms" }}>
          <SummaryCell
            label="Invested"
            value={kFormat(portfolio.totalInvested)}
            full={fmt.currency(portfolio.totalInvested)}
          />
          <SummaryCell
            label="Equity"
            value={kFormat(portfolio.totalEquity)}
            full={fmt.currency(portfolio.totalEquity)}
          />
          <SummaryCell
            label="Loans"
            value={kFormat(portfolio.totalLoan)}
            full={fmt.currency(portfolio.totalLoan)}
          />
        </div>

        {/* KPI pair — Yield + Net Cash Flow, with change indicators */}
        <div className="space-y-5 mb-11 animate-fade-up" style={{ animationDelay: "180ms" }}>
          <KpiRow
            label="Net Yield"
            sublabel="Annualised · after all costs"
            value={fmt.pctPlain(portfolio.netYield)}
            delta={`+${portfolio.netYieldDelta.toFixed(2)} pts`}
            deltaContext="vs last year"
            positive
          />
          <div className="hairline" />
          <KpiRow
            label="Net Cash Flow"
            sublabel="Per month · after all costs"
            value={fmt.currency(portfolio.netCashFlow)}
            delta={`+${fmt.currency(portfolio.netCashFlowDelta)}`}
            deltaContext="vs last month"
            positive
          />
        </div>

        {/* HIGHLIGHTS — Portfolio Intelligence (subtle, hairline-only) */}
        <div className="mb-12 animate-fade-up" style={{ animationDelay: "210ms" }}>
          <div className="flex items-center gap-2 mb-5">
            <Sparkle className="w-3 h-3 text-primary" strokeWidth={1.5} />
            <p className="label-eyebrow">Highlights</p>
          </div>

          <div className="space-y-4">
            <Link href={`/property/${intelligence.bestPerformer.id}`} className="block group">
              <HighlightRow
                label="Best Performer"
                name={intelligence.bestPerformer.name}
                value={fmt.pct(intelligence.bestPerformer.capitalGrowthPct)}
                meta="capital growth"
              />
            </Link>
            <div className="hairline" />
            <Link href={`/property/${intelligence.highestYield.id}`} className="block group">
              <HighlightRow
                label="Highest Gross Yield"
                name={intelligence.highestYield.name}
                value={fmt.pctPlain(intelligence.highestYield.grossYield)}
                meta="gross yield"
              />
            </Link>
            <div className="hairline" />
            <HighlightRow
              label="Avg Net Yield"
              name="Across all properties"
              value={fmt.pctPlain(intelligence.avgNetYield)}
              meta="net yield"
              static
            />
          </div>

          {insight && (
            <p className="mt-6 text-xs italic text-muted-foreground leading-relaxed">
              {insight}
            </p>
          )}
        </div>

        {/* PORTFOLIO INSIGHTS — advisory layer */}
        <PortfolioInsights />

        {/* PORTFOLIO PREVIEW */}
        <div className="mb-12 animate-fade-up" style={{ animationDelay: "240ms" }}>
          <div className="flex items-baseline justify-between mb-6">
            <div>
              <p className="label-eyebrow mb-1">Portfolio</p>
              <h3 className="font-serif text-xl">
                {portfolio.propertyCount} properties
              </h3>
            </div>
            <Link
              href="/portfolio"
              className="text-xs tracking-widest uppercase text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
            >
              View all
              <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
            </Link>
          </div>

          <div className="space-y-4">
            {previewProperties.map((p, i) => (
              <Link
                key={p.id}
                href={`/property/${p.id}`}
                className="tap press block group"
              >
                <div
                  className="flex gap-3.5 items-center animate-fade-up py-1"
                  style={{ animationDelay: `${300 + i * 60}ms` }}
                >
                  <div className="w-[4.5rem] h-[4.5rem] rounded-sm overflow-hidden bg-card flex-shrink-0">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="label-eyebrow mb-1 truncate">
                      {p.city.split(" ")[0]} · {p.status}
                    </p>
                    <h4 className="font-serif text-base leading-tight truncate mb-1">
                      {p.name}
                    </h4>
                    <p className="text-[11.5px] text-muted-foreground tabular-nums">
                      {fmt.currency(p.currentValue)}
                      {p.monthlyRent > 0 && (
                        <>
                          {" · "}
                          {fmt.currency(p.monthlyRent)}/mo
                        </>
                      )}
                    </p>
                  </div>
                  <ArrowRight
                    className="w-4 h-4 text-muted-foreground shrink-0"
                    strokeWidth={1.5}
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="hairline mb-10" />

        {/* RECENT ACTIVITY */}
        <div className="mb-8 animate-fade-up" style={{ animationDelay: "360ms" }}>
          <div className="flex items-baseline justify-between mb-6">
            <div>
              <p className="label-eyebrow mb-1">Recent</p>
              <h3 className="font-serif text-xl">Activity</h3>
            </div>
          </div>

          <div className="space-y-4">
            {previewActivities.map((a) => (
              <div
                key={a.id}
                className="flex items-start gap-3 py-1"
              >
                <div className="pt-1.5">
                  {a.isNew ? (
                    <Circle
                      className="w-1.5 h-1.5 text-primary fill-primary"
                      strokeWidth={0}
                    />
                  ) : (
                    <Circle
                      className="w-1.5 h-1.5 text-muted-foreground/40 fill-muted-foreground/40"
                      strokeWidth={0}
                    />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium leading-snug">
                    {a.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {a.detail}
                  </p>
                </div>
                <p className="text-[10px] tracking-wider uppercase text-muted-foreground/80 pt-1.5 whitespace-nowrap">
                  {a.timestamp}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Advisor footnote */}
        <div className="mt-11 mb-4 px-5 py-5 border border-border rounded-sm">
          <p className="label-eyebrow mb-3">Your Advisor</p>
          <p className="font-serif text-base mb-1">{investor.advisor}</p>
          <p className="text-xs text-muted-foreground mb-4">
            {investor.advisorTitle}
          </p>
          <button
            onClick={() => {
              openAdvisorMail({
                subject: `Schedule a call — ${investor.firstName}`,
                body: `Hello ${investor.advisor},\n\nI would like to schedule a call to discuss my portfolio.\n\nKind regards,\n${investor.firstName}`,
              });
            }}
            className="tap text-xs tracking-widest uppercase text-primary active:opacity-70 transition-opacity flex items-center gap-1 min-h-[2.75rem] -mb-3"
          >
            Schedule a call
            <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </AppShell>
  );
}

// Compact thousands formatter — always renders within a 3-up grid on 320→430px
function kFormat(n: number): string {
  if (n >= 1_000_000) return "£" + (n / 1_000_000).toFixed(2).replace(/\.?0+$/, "") + "M";
  return "£" + Math.round(n / 1000) + "k";
}

function SummaryCell({ label, value, full }: { label: string; value: string; full: string }) {
  return (
    <div title={full}>
      <p className="text-[10px] tracking-[0.16em] uppercase text-muted-foreground mb-2">
        {label}
      </p>
      <p className="font-serif text-base tabular-nums leading-none">{value}</p>
    </div>
  );
}

function KpiRow({
  label,
  sublabel,
  value,
  delta,
  deltaContext,
  positive = true,
}: {
  label: string;
  sublabel: string;
  value: string;
  delta?: string;
  deltaContext?: string;
  positive?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[15px] font-medium mb-1">{label}</p>
        <p className="label-eyebrow truncate">{sublabel}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="font-serif num-display tabular-nums tracking-tight text-primary mb-1.5">
          {value}
        </p>
        {delta && (
          <p className="inline-flex items-center gap-1 text-[11px] tabular-nums text-muted-foreground">
            {positive ? (
              <ArrowUpRight className="w-3 h-3 text-primary" strokeWidth={1.75} />
            ) : (
              <ArrowDownRight className="w-3 h-3 text-destructive" strokeWidth={1.75} />
            )}
            <span className={positive ? "text-primary" : "text-destructive"}>
              {delta}
            </span>
            {deltaContext && (
              <span className="text-muted-foreground/70">{deltaContext}</span>
            )}
          </p>
        )}
      </div>
    </div>
  );
}

function PortfolioInsights() {
  const insights = useMemo(() => getPortfolioInsights(), []);
  if (!insights.length) return null;
  return (
    <section
      className="mb-12 animate-fade-up"
      style={{ animationDelay: "225ms" }}
    >
      <div className="flex items-center gap-2 mb-5">
        <Lightbulb className="w-3 h-3 text-primary" strokeWidth={1.5} />
        <p className="label-eyebrow">Portfolio Insights</p>
      </div>

      <div className="space-y-3">
        {insights.map((ins, i) => (
          <InsightCard key={ins.id} insight={ins} delay={i * 60} />
        ))}
      </div>

      <Link
        href="/explore"
        className="tap press mt-5 inline-flex items-center gap-1.5 text-[11px] tracking-[0.16em] uppercase text-primary active:opacity-70 transition-opacity"
      >
        Explore opportunities to improve returns
        <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
      </Link>
    </section>
  );
}

function InsightCard({ insight, delay }: { insight: Insight; delay: number }) {
  const Icon =
    insight.tone === "watch"
      ? AlertTriangle
      : insight.tone === "positive"
      ? TrendingUp
      : Sparkle;

  const accent =
    insight.tone === "watch"
      ? "text-amber-400/90"
      : insight.tone === "positive"
      ? "text-primary"
      : "text-foreground/85";

  return (
    <div
      className="px-4 py-4 rounded-sm border border-border bg-card/40 animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start gap-3">
        <Icon
          className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${accent}`}
          strokeWidth={1.5}
        />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] tracking-[0.16em] uppercase text-muted-foreground mb-1.5">
            {insight.category}
          </p>
          <p className="text-[13px] font-medium leading-snug mb-1.5">
            {insight.headline}
          </p>
          <p className="text-[12px] text-muted-foreground/85 leading-relaxed">
            {insight.body}
          </p>
        </div>
        {insight.metric && (
          <p
            className={`font-serif text-base tabular-nums leading-none whitespace-nowrap ${accent}`}
          >
            {insight.metric}
          </p>
        )}
      </div>
    </div>
  );
}

function HighlightRow({
  label,
  name,
  value,
  meta,
  static: isStatic = false,
}: {
  label: string;
  name: string;
  value: string;
  meta: string;
  static?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[10px] tracking-[0.16em] uppercase text-muted-foreground mb-1">
          {label}
        </p>
        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
          {name}
        </p>
      </div>
      <div className="text-right whitespace-nowrap">
        <p className="font-serif text-lg tabular-nums leading-none text-primary mb-1">
          {value}
        </p>
        <p className="text-[10px] tracking-[0.12em] uppercase text-muted-foreground/70">
          {meta}
        </p>
      </div>
      {!isStatic && (
        <ArrowRight
          className="w-3 h-3 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0"
          strokeWidth={1.5}
        />
      )}
    </div>
  );
}


