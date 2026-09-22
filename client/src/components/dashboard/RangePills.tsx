import type { TimeRange } from "@/lib/data";

const RANGES: { value: TimeRange; label: string }[] = [
  { value: "1M", label: "1M" },
  { value: "3M", label: "3M" },
  { value: "1Y", label: "1Y" },
  { value: "ALL", label: "ALL" },
];

export function RangePills({
  value,
  onChange,
}: {
  value: TimeRange;
  onChange: (v: TimeRange) => void;
}) {
  const activeIndex = Math.max(
    0,
    RANGES.findIndex((r) => r.value === value)
  );

  return (
    <div
      role="radiogroup"
      aria-label="Time range"
      className="range-pills"
    >
      <span
        aria-hidden
        className="range-pills__thumb"
        style={{
          width: "calc((100% - 4px) / 4)",
          transform: `translateX(${activeIndex * 100}%)`,
        }}
      />
      {RANGES.map((r) => {
        const active = r.value === value;
        return (
          <button
            key={r.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(r.value)}
            className={`range-pills__btn tap ${
              active ? "text-foreground" : "text-muted-foreground/80"
            }`}
          >
            {r.label}
          </button>
        );
      })}
    </div>
  );
}
