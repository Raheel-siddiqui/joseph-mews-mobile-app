// Joseph Mews — Projection Section (shared)
// Chart-first 5/10/15-year forecast with optional yearly breakdown,
// assumptions panel, and disclaimer. Designed to feel calm and trustworthy.
import { useMemo, useState } from "react";
import { fmt } from "@/lib/data";
import {
  projectInvestment,
  type ProjectionHorizon,
  type ProjectionInput,
} from "@/lib/projection";
import {
  Area,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChevronDown, Info } from "lucide-react";

interface Props {
  input: ProjectionInput;
  // Display label for assumption labels (e.g. "Mortgage rate" only shows if relevant)
  mortgageRate?: number; // % — pass when relevant
  hasMortgage?: boolean;
  title?: string;
}

const HORIZONS: ProjectionHorizon[] = [5, 10, 15];

export function ProjectionSection({
  input,
  mortgageRate,
  hasMortgage,
  title = "Projection",
}: Props) {
  const [horizon, setHorizon] = useState<ProjectionHorizon>(10);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const result = useMemo(() => projectInvestment(input, horizon), [input, horizon]);

  // Chart data: include Year 0 baseline for both series
  const chartData = useMemo(() => {
    const base = [
      {
        label: "Now",
        propertyValue: input.startValue,
        cumulativeIncome: 0,
      },
      ...result.years.map((y) => ({
        label: `Yr ${y.year}`,
        propertyValue: y.propertyValue,
        cumulativeIncome: y.cumulativeNetIncome,
      })),
    ];
    return base;
  }, [input.startValue, result.years]);

  return (
    <section className="py-7 animate-fade-up">
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <h3 className="font-serif text-xl tracking-tight">{title}</h3>
        </div>
        <HorizonTabs value={horizon} onChange={setHorizon} />
      </div>

      {/* Plain-English summary — above the chart so the projection is
          instantly understandable without reading the graph */}
      <div className="mb-7">
        <p className="text-[12px] text-muted-foreground/90 leading-snug mb-4">
          In {horizon} years, this property could generate:
        </p>
        <div className="space-y-3.5">
          <SummaryLine
            label="Capital growth"
            value={fmt.currency(result.totalCapitalGain)}
            tone="primary"
          />
          <div className="hairline" />
          <SummaryLine
            label="Cumulative income"
            value={fmt.currency(result.totalNetIncome)}
          />
          <div className="hairline" />
          <SummaryLine
            label="Total return (capital + income)"
            value={fmt.currency(result.totalReturn)}
            sub={`+${result.totalReturnPct.toFixed(0)}% on start value · illustrative`}
            tone="primary"
            big
          />
        </div>
      </div>

      {/* Chart */}
      <div className="mb-3">
        <ProjectionChart data={chartData} />
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 text-[10px] tracking-[0.16em] uppercase text-muted-foreground mb-1">
        <span className="inline-flex items-center gap-2">
          <span className="w-3 h-px bg-primary" />
          Property value
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="w-3 h-px border-t border-dashed border-primary/60" />
          Cumulative income
        </span>
      </div>

      <div className="mt-6 mb-7" />

      {/* Yearly breakdown (collapsed) */}
      <button
        onClick={() => setShowBreakdown((s) => !s)}
        className="tap press w-full flex items-center justify-between py-3 border-t border-b border-border text-[10px] tracking-[0.18em] uppercase text-muted-foreground active:text-foreground transition-colors"
        aria-expanded={showBreakdown}
      >
        <span>Year-by-year breakdown</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${
            showBreakdown ? "rotate-180" : ""
          }`}
          strokeWidth={1.5}
        />
      </button>

      {showBreakdown && (
        <div className="mt-3 -mx-page page-px overflow-x-auto scrollbar-hide animate-fade-up">
          <table className="w-full min-w-[640px] text-[11px] tabular-nums">
            <thead>
              <tr className="text-left text-muted-foreground/80">
                <Th>Year</Th>
                <Th className="text-right">Value</Th>
                <Th className="text-right">Capital Gain</Th>
                <Th className="text-right">Gross Rent</Th>
                <Th className="text-right">Costs</Th>
                <Th className="text-right">Net Income</Th>
                <Th className="text-right">Cum. Income</Th>
                <Th className="text-right">Total Return</Th>
              </tr>
            </thead>
            <tbody>
              {result.years.map((y) => (
                <tr
                  key={y.year}
                  className="border-t border-border/60"
                >
                  <Td className="font-medium text-foreground">{y.year}</Td>
                  <Td className="text-right">{fmt.currency(y.propertyValue)}</Td>
                  <Td className="text-right text-primary">
                    +{fmt.currency(y.capitalGain)}
                  </Td>
                  <Td className="text-right">{fmt.currency(y.grossRent)}</Td>
                  <Td className="text-right text-muted-foreground">
                    −{fmt.currency(y.totalCosts)}
                  </Td>
                  <Td className="text-right">{fmt.currency(y.netIncome)}</Td>
                  <Td className="text-right">{fmt.currency(y.cumulativeNetIncome)}</Td>
                  <Td className="text-right text-primary">
                    {fmt.currency(y.totalReturn)}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Assumptions */}
      <div className="mt-7">
        <p className="label-eyebrow mb-3">Assumptions</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-4 px-4 py-4 rounded-sm border border-dashed border-border">
          <Assumption label="Capital Growth" value={`${input.annualGrowth.toFixed(1)}% / yr`} />
          <Assumption label="Rental Growth" value={`${input.rentalGrowth.toFixed(1)}% / yr`} />
          {hasMortgage && typeof mortgageRate === "number" && (
            <Assumption label="Mortgage Rate" value={`${mortgageRate.toFixed(2)}%`} />
          )}
          <Assumption
            label="Cost Inflation"
            value={`${(input.costGrowth ?? 2.5).toFixed(1)}% / yr`}
          />
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-5 flex items-start gap-2.5">
        <Info
          className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0"
          strokeWidth={1.5}
        />
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Illustrative projection based on stated assumptions — not a forecast
          of guaranteed returns, and not financial advice. Actual results will
          vary. Past performance is not a reliable indicator of future
          performance. Speak with your advisor before making decisions.
        </p>
      </div>
    </section>
  );
}

/* ---------- Sub-components ---------- */

function HorizonTabs({
  value,
  onChange,
}: {
  value: ProjectionHorizon;
  onChange: (v: ProjectionHorizon) => void;
}) {
  return (
    <div className="inline-flex border border-border rounded-sm overflow-hidden">
      {HORIZONS.map((h) => {
        const active = value === h;
        return (
          <button
            key={h}
            onClick={() => onChange(h)}
            className={`tap press text-[11px] tracking-[0.14em] uppercase px-3.5 min-h-[40px] transition-colors ${
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

function SummaryLine({
  label,
  value,
  sub,
  tone,
  big = false,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "primary";
  big?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <div className="min-w-0">
        <p
          className={`${
            big ? "text-[13px] font-medium" : "text-[12px] text-muted-foreground"
          } leading-snug`}
        >
          {label}
        </p>
        {sub && (
          <p className="text-[10px] tracking-[0.14em] uppercase text-muted-foreground mt-1">
            {sub}
          </p>
        )}
      </div>
      <p
        className={`font-serif tabular-nums leading-none whitespace-nowrap ${
          big ? "text-[28px]" : "text-[22px]"
        } ${tone === "primary" ? "text-primary" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

function ProjectionChart({
  data,
}: {
  data: { label: string; propertyValue: number; cumulativeIncome: number }[];
}) {
  const allValues = data.flatMap((d) => [d.propertyValue, d.cumulativeIncome]);
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const padding = (max - min) * 0.1 || max * 0.05;

  return (
    <div style={{ width: "100%", height: 180 }}>
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 6, right: 6, bottom: 6, left: 6 }}>
          <defs>
            <linearGradient id="projGold" x1="0" y1="0" x2="0" y2="1">
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
            fill="url(#projGold)"
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

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={`py-2 px-2 text-[9px] tracking-[0.16em] uppercase font-normal whitespace-nowrap ${className}`}
    >
      {children}
    </th>
  );
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={`py-2.5 px-2 whitespace-nowrap ${className}`}>{children}</td>
  );
}
