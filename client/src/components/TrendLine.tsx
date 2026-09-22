// Joseph Mews — TrendLine
// Minimal area chart: gold stroke, soft gold-to-transparent fill
import {
  Area,
  AreaChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useId } from "react";
import { fmt } from "@/lib/data";

interface TrendLineProps<T> {
  data: T[];
  xKey: keyof T;
  yKey: keyof T;
  height?: number;
  animate?: boolean;
  hero?: boolean;
}

function pickXTicks<T>(data: T[], xKey: keyof T): string[] {
  const n = data.length;
  if (n === 0) return [];
  const count = Math.min(4, n);
  if (count === 1) return [String(data[0][xKey])];
  const ticks: string[] = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.round((i * (n - 1)) / (count - 1));
    ticks.push(String(data[idx][xKey]));
  }
  return ticks;
}

function niceNum(range: number, round: boolean): number {
  const exp = Math.floor(Math.log10(range));
  const frac = range / 10 ** exp;
  let nice: number;
  if (round) {
    if (frac < 1.5) nice = 1;
    else if (frac < 3) nice = 2;
    else if (frac < 7) nice = 5;
    else nice = 10;
  } else if (frac <= 1) nice = 1;
  else if (frac <= 2) nice = 2;
  else if (frac <= 5) nice = 5;
  else nice = 10;
  return nice * 10 ** exp;
}

function niceYScale(min: number, max: number) {
  let lo = min;
  let hi = max;
  if (hi === lo) {
    const bump = Math.max(hi * 0.004, 4000);
    lo -= bump;
    hi += bump;
  }
  const pad = (hi - lo) * 0.16;
  lo -= pad;
  hi += pad;

  let step = niceNum((hi - lo) / 3, true);
  let yMin = Math.floor(lo / step) * step;
  let yMax = Math.ceil(hi / step) * step;

  const tickCount = Math.round((yMax - yMin) / step) + 1;
  if (tickCount > 5) {
    step = niceNum(step * 2, true);
    yMin = Math.floor(lo / step) * step;
    yMax = Math.ceil(hi / step) * step;
  }

  const ticks: number[] = [];
  for (let v = yMin; v <= yMax + step / 2; v += step) {
    ticks.push(Math.round(v));
  }
  return { yMin, yMax, ticks, step };
}

function yAxisLabel(n: number, step: number): string {
  if (n >= 1_000_000 && step >= 10_000) {
    const decimals = step >= 100_000 ? 1 : 2;
    return "£" + (n / 1_000_000).toFixed(decimals) + "m";
  }
  if (n >= 1_000_000) {
    return "£" + (n / 1_000_000).toFixed(3) + "m";
  }
  return fmt.currency(n);
}

export function TrendLine<T extends Record<string, any>>({
  data,
  xKey,
  yKey,
  height = 140,
  animate = true,
  hero = false,
}: TrendLineProps<T>) {
  const uid = useId().replace(/:/g, "");
  const fillId = `trendGold-${uid}`;
  const lastIndex = data.length - 1;

  if (data.length === 0) return null;

  const values = data.map((d) => Number(d[yKey]));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = (max - min) * 0.15 || max * 0.02;
  const scale = niceYScale(min, max);
  const xTicks = pickXTicks(data, xKey);

  const tooltip = (
    <Tooltip
      isAnimationActive={false}
      cursor={
        hero
          ? { stroke: "#F5F1E8", strokeOpacity: 0.28, strokeWidth: 1 }
          : {
              stroke: "#C6A46C",
              strokeOpacity: 0.32,
              strokeWidth: 1,
              strokeDasharray: "2 3",
            }
      }
      content={({ active, payload }) => {
        if (!active || !payload || !payload.length) return null;
        const p = payload[0].payload;
        return (
          <div
            className={
              hero
                ? "dash-chart-tip"
                : "bg-card border border-border px-3 py-2 rounded-sm shadow-lg"
            }
          >
            <p
              className={
                hero
                  ? "dash-chart-tip__date"
                  : "text-[11px] text-muted-foreground mb-0.5"
              }
            >
              {p[xKey as string]}
            </p>
            <p
              className={
                hero
                  ? "dash-chart-tip__value"
                  : "font-serif text-sm tabular-nums text-primary"
              }
            >
              {fmt.currency(Number(p[yKey as string]))}
            </p>
          </div>
        );
      }}
    />
  );

  return (
    <div className="relative w-full min-w-0" style={{ height }}>
      <div className="absolute inset-0">
        <ResponsiveContainer width="100%" height="100%">
          {hero ? (
            <ComposedChart
              data={data}
              margin={{ top: 8, right: 22, bottom: 2, left: 2 }}
            >
              <defs>
                <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C6A46C" stopOpacity={0.38} />
                  <stop offset="55%" stopColor="#C6A46C" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#C6A46C" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                stroke="#F5F1E8"
                strokeOpacity={0.1}
              />
              <XAxis
                dataKey={xKey as string}
                ticks={xTicks}
                interval={0}
                axisLine={{ stroke: "#F5F1E8", strokeOpacity: 0.12 }}
                tickLine={false}
                padding={{ left: 6, right: 14 }}
                tick={{
                  fill: "#C8C0B4",
                  fontSize: 11,
                  fontFamily: "Inter, sans-serif",
                }}
                dy={8}
              />
              <YAxis
                domain={[scale.yMin, scale.yMax]}
                ticks={scale.ticks}
                axisLine={false}
                tickLine={false}
                width={50}
                tick={{
                  fill: "#C8C0B4",
                  fontSize: 11,
                  fontFamily: "Inter, sans-serif",
                }}
                tickFormatter={(n: number) => yAxisLabel(n, scale.step)}
              />
              {tooltip}
              <Area
                type="linear"
                dataKey={yKey as string}
                baseValue={scale.yMin}
                stroke="none"
                fill={`url(#${fillId})`}
                isAnimationActive={false}
                tooltipType="none"
                legendType="none"
                dot={false}
                activeDot={false}
              />
              <Line
                type="linear"
                dataKey={yKey as string}
                stroke="#C6A46C"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                dot={false}
                activeDot={{
                  r: 4.5,
                  fill: "#C6A46C",
                  stroke: "#0A1220",
                  strokeWidth: 1.5,
                }}
                isAnimationActive={false}
              />
              <Scatter
                data={data}
                dataKey={yKey as string}
                isAnimationActive={false}
                legendType="none"
                tooltipType="none"
                shape={(props: {
                  cx?: number;
                  cy?: number;
                  index?: number;
                  payload?: { month?: string };
                }) => {
                  const { cx, cy, index } = props;
                  if (cx == null || cy == null) {
                    return <g key={`pt-${index ?? "x"}`} />;
                  }
                  const last = index === lastIndex;
                  const r = last ? 3.7 : data.length > 16 ? 2.45 : 3.15;
                  return (
                    <g key={props.payload?.month ?? `pt-${index}`}>
                      {last && (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={8}
                          fill="#C6A46C"
                          fillOpacity={0.2}
                        />
                      )}
                      <circle
                        cx={cx}
                        cy={cy}
                        r={r}
                        fill="#C6A46C"
                        stroke="#0A1220"
                        strokeWidth={last ? 1.6 : 1.4}
                      />
                    </g>
                  );
                }}
              />
            </ComposedChart>
          ) : (
            <AreaChart
              data={data}
              margin={{ top: 4, right: 4, bottom: 4, left: 4 }}
            >
              <defs>
                <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C6A46C" stopOpacity={0.28} />
                  <stop offset="22%" stopColor="#C6A46C" stopOpacity={0.08} />
                  <stop offset="58%" stopColor="#C6A46C" stopOpacity={0.03} />
                  <stop offset="100%" stopColor="#C6A46C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey={xKey as string} hide />
              <YAxis domain={[min - padding, max + padding]} hide />
              {tooltip}
              <Area
                type="monotone"
                dataKey={yKey as string}
                stroke="#C6A46C"
                strokeWidth={1.5}
                fill={`url(#${fillId})`}
                dot={false}
                isAnimationActive={animate}
                activeDot={{
                  r: 3,
                  fill: "#C6A46C",
                  stroke: "#0A1220",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
