import {
  ArrowDownRight,
  ArrowUpRight,
  Landmark,
  Percent,
  PiggyBank,
  Scale,
  Wallet,
} from "lucide-react";
import { TrendLine } from "@/components/TrendLine";
import {
  PropertyBanner,
  type BannerSlide,
} from "@/components/dashboard/PropertyBanner";
import { RangePills } from "@/components/dashboard/RangePills";
import { fmt, type TimeRange } from "@/lib/data";
import type { PortfolioPoint } from "@/lib/data";

export function DashboardHero({
  greeting,
  firstName,
  single,
  slides,
  currentValue,
  returnAmount,
  returnPct,
  rangeLabel,
  series,
  range,
  onRangeChange,
  invested,
  equity,
  loans,
  grossYield,
  grossYieldDelta,
  netCashFlow,
  netCashFlowDelta,
}: {
  greeting: string;
  firstName: string;
  single: boolean;
  slides: BannerSlide[];
  currentValue: number;
  returnAmount: number;
  returnPct: number;
  rangeLabel: string;
  series: PortfolioPoint[];
  range: TimeRange;
  onRangeChange: (v: TimeRange) => void;
  invested: number;
  equity: number;
  loans: number;
  grossYield: number;
  grossYieldDelta: number;
  netCashFlow: number;
  netCashFlowDelta: number;
}) {
  const positive = returnAmount >= 0;
  const GrowthIcon = positive ? ArrowUpRight : ArrowDownRight;

  return (
    <section className="dash-hero animate-fade-up" aria-label="Portfolio overview">
      <div className="dash-hero__intro">
        <div className="min-w-0">
          <p className="label-eyebrow">{greeting}</p>
          <h1 className="dash-hero__name">{firstName}</h1>
        </div>
      </div>

      <PropertyBanner slides={slides} />

      <div className="dash-hero__account">
        <p className="label-eyebrow dash-hero__value-label">
          {single ? "Property value" : "Portfolio value"}
        </p>
        <h2 className="dash-hero__value">{fmt.currency(currentValue)}</h2>

        <div className="dash-hero__growth">
          <p
            className={`inline-flex items-center gap-2.5 ${
              positive ? "text-positive" : "text-destructive"
            }`}
          >
            <span className="inline-flex items-center gap-0.5">
              <GrowthIcon className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span className="text-[14px] font-medium tabular-nums">
                {fmt.currency(returnAmount)}
              </span>
            </span>
            <span className="text-[14px] font-medium tabular-nums">
              {fmt.pct(returnPct)}
            </span>
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground/70">
            {rangeLabel} · value change only
          </p>
        </div>

        <div className="dash-hero__stage">
          <TrendLine
            data={series}
            xKey="month"
            yKey="value"
            height={168}
            animate={false}
            hero
          />
          <div className="dash-hero__pills">
            <RangePills value={range} onChange={onRangeChange} />
          </div>
        </div>
      </div>

      <div className="dash-hero__mix">
        <MixStat
          icon={Wallet}
          label="Invested"
          value={fmt.currency(invested)}
          align="left"
        />
        <MixStat
          icon={Landmark}
          label="Equity"
          value={fmt.currency(equity)}
          align="center"
        />
        <MixStat
          icon={Scale}
          label="Loans"
          value={fmt.currency(loans)}
          align="right"
        />
      </div>

      <div className="dash-hero__secondary">
        <QuietMetric
          icon={Percent}
          label="Gross Yield"
          hint="Annualised · before costs"
          value={fmt.pctPlain(grossYield)}
          delta={`+${grossYieldDelta.toFixed(2)} pts`}
          deltaContext="vs last year"
        />
        <QuietMetric
          icon={PiggyBank}
          label="Net Cash Flow"
          hint="Per month · after all costs"
          value={fmt.currency(netCashFlow)}
          delta={`+${fmt.currency(netCashFlowDelta)}`}
          deltaContext="vs last month"
        />
      </div>
    </section>
  );
}

function MixStat({
  icon: Icon,
  label,
  value,
  align,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  align: "left" | "center" | "right";
}) {
  const alignClass =
    align === "left"
      ? "items-start text-left"
      : align === "right"
        ? "items-end text-right"
        : "items-center text-center";
  return (
    <div className={`min-w-0 flex flex-col ${alignClass}`}>
      <Icon
        className="w-3.5 h-3.5 text-primary/80 mb-1.5"
        strokeWidth={1.6}
        aria-hidden
      />
      <p className="text-[10px] tracking-[0.12em] uppercase text-muted-foreground/80 mb-1">
        {label}
      </p>
      <p className="text-[13px] font-medium tabular-nums tracking-tight text-foreground whitespace-nowrap">
        {value}
      </p>
    </div>
  );
}

function QuietMetric({
  icon: Icon,
  label,
  hint,
  value,
  delta,
  deltaContext,
}: {
  icon: typeof Percent;
  label: string;
  hint: string;
  value: string;
  delta: string;
  deltaContext: string;
}) {
  return (
    <div className="min-w-0">
      <p className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.12em] uppercase text-muted-foreground/80 mb-1">
        <Icon className="w-3 h-3 text-primary/80" strokeWidth={1.6} aria-hidden />
        {label}
      </p>
      <p className="text-[17px] font-medium tabular-nums leading-none text-foreground">
        {value}
      </p>
      <p className="mt-1 text-[10px] leading-snug text-muted-foreground/70">
        {hint}
      </p>
      <p className="mt-0.5 inline-flex flex-wrap items-center gap-x-1 text-[10px] tabular-nums">
        <ArrowUpRight className="w-2.5 h-2.5 text-primary/70" strokeWidth={1.75} />
        <span className="text-foreground/75">{delta}</span>
        <span className="text-muted-foreground/55">{deltaContext}</span>
      </p>
    </div>
  );
}
