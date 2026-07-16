// Joseph Mews — TimeRangeTabs
// Editorial-minimal pill row: 1M · 3M · 1Y · All
// Used on Dashboard and PropertyDetail for consistent UX
import type { TimeRange } from "@/lib/data";

const RANGES: { value: TimeRange; label: string }[] = [
  { value: "1M", label: "1M" },
  { value: "3M", label: "3M" },
  { value: "1Y", label: "1Y" },
  { value: "ALL", label: "All" },
];

export function TimeRangeTabs({
  value,
  onChange,
}: {
  value: TimeRange;
  onChange: (v: TimeRange) => void;
}) {
  return (
    <div className="inline-flex items-center gap-0.5 border border-border rounded-sm p-0.5 bg-card/40">
      {RANGES.map((r) => {
        const active = r.value === value;
        return (
          <button
            key={r.value}
            onClick={() => onChange(r.value)}
            className={`px-3 py-2 text-[10px] tracking-[0.16em] uppercase rounded-[2px] transition-all tabular-nums tap min-w-[36px] ${
              active
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground active:text-foreground"
            }`}
          >
            {r.label}
          </button>
        );
      })}
    </div>
  );
}
