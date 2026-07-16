// Joseph Mews — TrendLine
// Minimal area chart: gold stroke, soft gold-to-transparent fill
// No axes, no legend, no grid — only the line and a subtle hover dot
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fmt } from "@/lib/data";

interface TrendLineProps<T> {
  data: T[];
  xKey: keyof T;
  yKey: keyof T;
  height?: number;
}

export function TrendLine<T extends Record<string, any>>({
  data,
  xKey,
  yKey,
  height = 140,
}: TrendLineProps<T>) {
  if (data.length === 0) return null;

  const values = data.map((d) => Number(d[yKey]));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = (max - min) * 0.15 || max * 0.02;

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <AreaChart
          data={data}
          margin={{ top: 4, right: 4, bottom: 4, left: 4 }}
        >
          <defs>
            <linearGradient id="trendGold" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C6A46C" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#C6A46C" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey={xKey as string}
            hide
          />
          <YAxis
            domain={[min - padding, max + padding]}
            hide
          />
          <Tooltip
            cursor={{
              stroke: "#C6A46C",
              strokeOpacity: 0.4,
              strokeWidth: 1,
              strokeDasharray: "2 3",
            }}
            content={({ active, payload }) => {
              if (!active || !payload || !payload.length) return null;
              const p = payload[0].payload;
              return (
                <div className="bg-card border border-border px-3 py-2 rounded-sm shadow-lg">
                  <p className="text-[9px] tracking-[0.16em] uppercase text-muted-foreground mb-1">
                    {p[xKey as string]}
                  </p>
                  <p className="font-serif text-sm tabular-nums text-primary">
                    {fmt.currency(Number(p[yKey as string]))}
                  </p>
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey={yKey as string}
            stroke="#C6A46C"
            strokeWidth={1.5}
            fill="url(#trendGold)"
            dot={false}
            activeDot={{
              r: 3,
              fill: "#C6A46C",
              stroke: "#0F0F0F",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
