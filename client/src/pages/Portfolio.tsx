// Joseph Mews — Portfolio List
// Design: One property per row, large image, editorial typography
import { Link } from "wouter";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { fmt } from "@/lib/data";
import {
  getActivePortfolio,
  getActiveProperties,
  isSingleHolding,
  propertyCountLabel,
} from "@/lib/holdings";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { ContactAdvisorSheet } from "@/components/ContactAdvisorSheet";

export default function Portfolio() {
  const [contactOpen, setContactOpen] = useState(false);
  const properties = getActiveProperties();
  const portfolio = getActivePortfolio();
  const single = isSingleHolding();

  return (
    <AppShell>
      <div className="page-px">
        {/* Header */}
        <div className="pt-3 pb-7 animate-fade-up">
          <p className="label-eyebrow mb-2">Holdings</p>
          <h1 className="font-serif text-[1.75rem] tracking-tight mb-1">
            {single ? "Your Property" : "Portfolio"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {propertyCountLabel(portfolio.propertyCount)} ·{" "}
            {fmt.currency(portfolio.currentValue)}
          </p>
        </div>

        <div className="hairline mb-7" />

        {/* Property list */}
        <div className="space-y-9">
          {properties.map((p, i) => (
            <Link
              key={p.id}
              href={`/property/${p.id}`}
              className="tap press block animate-fade-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {/* Image */}
              <div className="aspect-[16/10] rounded-sm overflow-hidden bg-card mb-4">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="label-eyebrow truncate">
                    {p.reference} · {p.status}
                  </p>
                  <ArrowRight
                    className="w-4 h-4 text-muted-foreground shrink-0"
                    strokeWidth={1.5}
                  />
                </div>
                <h2 className="font-serif text-xl leading-tight mb-1">
                  {p.name}
                </h2>
                <p className="text-[13px] text-muted-foreground mb-5">
                  {p.location} · {p.city}
                </p>

                {/* Stats row — mobile: k-format Value to avoid clipping at 320px */}
                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border">
                  <Stat
                    label="Value"
                    value={kFmt(p.currentValue)}
                    growth={p.capitalGrowthPct}
                  />
                  <Stat
                    label="Rent"
                    value={p.monthlyRent > 0 ? kFmt(p.monthlyRent) : "—"}
                  />
                  <Stat
                    label="Gross Yield"
                    value={p.grossYield > 0 ? fmt.pctPlain(p.grossYield) : "—"}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="hairline mt-14 mb-8" />

        <div className="text-center pb-4">
          <p className="label-eyebrow mb-3">
            {single
              ? "Ready to grow beyond one holding?"
              : "Considering an additional investment?"}
          </p>
          <button
            onClick={() => setContactOpen(true)}
            className="tap text-sm text-primary active:opacity-70 transition-opacity inline-flex items-center gap-1.5 min-h-[2.75rem] px-4"
          >
            Speak with your advisor
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {contactOpen && (
        <ContactAdvisorSheet onClose={() => setContactOpen(false)} />
      )}
    </AppShell>
  );
}

// Compact thousands formatter for property stat cells (Value, Rent)
function kFmt(n: number): string {
  if (n >= 1_000_000) return "£" + (n / 1_000_000).toFixed(2).replace(/\.?0+$/, "") + "M";
  if (n >= 10_000) return "£" + Math.round(n / 1000) + "k";
  return "£" + n.toLocaleString("en-GB");
}

function Stat({
  label,
  value,
  growth,
}: {
  label: string;
  value: string;
  growth?: number;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] tracking-[0.14em] uppercase text-muted-foreground mb-1.5">
        {label}
      </p>
      <p className="font-serif text-[15px] tabular-nums leading-none mb-1 truncate">
        {value}
      </p>
      {growth !== undefined && growth > 0 && (
        <p className="inline-flex items-center gap-0.5 text-[11px] text-primary tabular-nums">
          <ArrowUpRight className="w-2.5 h-2.5" strokeWidth={2} />
          {fmt.pct(growth)}
        </p>
      )}
    </div>
  );
}
