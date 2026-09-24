// Joseph Mews — Explore (Curated Investment Marketplace)
// Design language: matches the rest of the app (warm charcoal, hairlines,
// champagne gold). Filters live inside a compact collapsible bar so listings
// always lead. Active filters appear as small inline chips when collapsed.
import { AppShell } from "@/components/AppShell";
import {
  opportunities,
  opportunityCities,
  budgetBands,
  yieldBands,
  type Opportunity,
  type OpportunityStatus,
} from "@/lib/explore";
import { fmt } from "@/lib/data";
import { opportunityImageSrc } from "@/lib/propertyImage";
import { Link } from "wouter";
import { useMemo, useState } from "react";
import { SlidersHorizontal, ChevronDown, X } from "lucide-react";

export default function Explore() {
  const [city, setCity] = useState<string>("All");
  const [budget, setBudget] = useState<string>("any");
  const [yld, setYld] = useState<string>("any");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    return opportunities.filter((o) => {
      const matchCity = city === "All" || o.city === city;
      const band = budgetBands.find((b) => b.id === budget);
      const matchBudget =
        budget === "any" ||
        (band ? o.fromPrice >= band.min && o.fromPrice <= band.max : true);
      const yBand = yieldBands.find((y) => y.id === yld);
      const matchYield = yBand ? o.grossYield >= yBand.min : true;
      return matchCity && matchBudget && matchYield;
    });
  }, [city, budget, yld]);

  // Active-filter summary chips for the collapsed state
  const activeChips: { id: string; label: string; clear: () => void }[] = [];
  if (city !== "All") {
    activeChips.push({ id: "city", label: city, clear: () => setCity("All") });
  }
  if (budget !== "any") {
    const b = budgetBands.find((b) => b.id === budget);
    if (b) activeChips.push({ id: "budget", label: b.label, clear: () => setBudget("any") });
  }
  if (yld !== "any") {
    const y = yieldBands.find((y) => y.id === yld);
    if (y) activeChips.push({ id: "yield", label: y.label, clear: () => setYld("any") });
  }
  const activeCount = activeChips.length;

  const newCount = opportunities.filter((o) => o.status === "Available").length;

  const resetAll = () => {
    setCity("All");
    setBudget("any");
    setYld("any");
  };

  return (
    <AppShell>
      <div className="page-px">
        {/* Header */}
        <header className="page-intro animate-fade-up">
          <p className="label-eyebrow">Marketplace</p>
          <h1 className="page-intro__title">Explore Investments</h1>
          <p className="page-intro__sub">
            {opportunities.length} curated developments
            {newCount > 0 && (
              <>
                {" · "}
                <span className="text-primary">{newCount} available</span>
              </>
            )}
          </p>
        </header>

        {/* Compact filter bar */}
        <div className="animate-fade-up" style={{ animationDelay: "60ms" }}>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFiltersOpen((s) => !s)}
              className={`tap press pill ${filtersOpen ? "pill--on" : ""}`}
              aria-expanded={filtersOpen}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Filters</span>
              {activeCount > 0 && (
                <span className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary/15 text-primary text-[10px] tabular-nums">
                  {activeCount}
                </span>
              )}
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${
                  filtersOpen ? "rotate-180" : ""
                }`}
                strokeWidth={1.5}
              />
            </button>

            {/* Active filter chips (collapsed view) */}
            {!filtersOpen && activeChips.length > 0 && (
              <div className="flex-1 flex items-center gap-1.5 overflow-x-auto scrollbar-hide -mr-page pr-page">
                {activeChips.map((chip) => (
                  <button
                    key={chip.id}
                    onClick={chip.clear}
                    className="tap press pill pill--on h-8 min-h-0"
                  >
                    <span className="truncate max-w-[120px]">{chip.label}</span>
                    <X className="w-3 h-3" strokeWidth={1.75} />
                  </button>
                ))}
              </div>
            )}

            {/* Reset (only when something is active and panel closed) */}
            {!filtersOpen && activeChips.length > 0 && (
              <button
                onClick={resetAll}
                className="btn-quiet shrink-0"
              >
                Reset
              </button>
            )}

          </div>

          {/* Expandable filter panel */}
          {filtersOpen && (
            <div className="glass glass--pad mt-3 space-y-4 animate-fade-up">
              <FilterRow
                label="City"
                activeId={city}
                options={[
                  { id: "All", label: "All" },
                  ...opportunityCities.map((c) => ({ id: c, label: c })),
                ]}
                onChange={setCity}
              />
              <div className="hairline" />
              <FilterRow
                label="Budget"
                activeId={budget}
                options={[
                  { id: "any", label: "Any" },
                  ...budgetBands.map((b) => ({ id: b.id, label: b.label })),
                ]}
                onChange={setBudget}
              />
              <div className="hairline" />
              <FilterRow
                label="Gross Yield"
                activeId={yld}
                options={yieldBands.map((y) => ({ id: y.id, label: y.label }))}
                onChange={setYld}
              />

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={resetAll}
                  className="btn-quiet"
                  disabled={activeCount === 0}
                >
                  Reset all
                </button>
                <button
                  onClick={() => setFiltersOpen(false)}
                  className="tap press pill pill--on"
                >
                  Show {filtered.length} {filtered.length === 1 ? "result" : "results"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 space-y-4">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="label-eyebrow mb-2">No matches</p>
              <p className="text-sm text-muted-foreground">
                Adjust your filters to see more opportunities
              </p>
            </div>
          ) : (
            filtered.map((o, i) => (
              <OpportunityCard key={o.id} opp={o} index={i} />
            ))
          )}
        </div>

        <div className="h-8" />
      </div>
    </AppShell>
  );
}

function OpportunityCard({ opp, index }: { opp: Opportunity; index: number }) {
  const isInactive = opp.status === "Sold Out";
  const unitSummary = opp.unitTypes.map((u) => u.type).join(" · ");

  return (
    <Link
      href={`/explore/${opp.id}`}
      className={`photo-card photo-card--caption tap press animate-fade-up ${
        isInactive ? "opacity-70" : ""
      }`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <img src={opportunityImageSrc(opp)} alt={opp.name} className="photo-card__img" />
      <span className="photo-card__shade" />
      {opp.status === "Available" && (
        <span className="photo-card__chip">
          <StatusPill status={opp.status} />
        </span>
      )}
      <span className="photo-card__meta">
        <span className="photo-card__kicker">
          {opp.reference} · {opp.city}
        </span>
        <span className="photo-card__name">{opp.name}</span>
        <span className="photo-card__loc">
          {unitSummary} · {opp.expectedCompletion}
        </span>
        <span className="photo-card__figs">
          <span>{fmt.currency(opp.fromPrice)}</span>
          <span>{opp.grossYield.toFixed(1)}% yield</span>
          <span>+{opp.capitalGrowth5Y.toFixed(0)}%</span>
        </span>
      </span>
    </Link>
  );
}

function StatusPill({ status }: { status: OpportunityStatus }) {
  const tone =
    status === "Available"
      ? "chip chip--gold chip--on-photo"
      : status === "Coming Soon"
        ? "chip chip--warn chip--on-photo"
        : "chip chip--muted chip--on-photo";

  return <span className={tone}>{status}</span>;
}

function FilterRow({
  label,
  options,
  activeId,
  onChange,
}: {
  label: string;
  options: { id: string; label: string }[];
  activeId: string;
  onChange: (id: string) => void;
}) {
  return (
    <div>
      <p className="text-[10px] tracking-[0.16em] uppercase text-muted-foreground mb-2">
        {label}
      </p>
      <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
        {options.map((opt) => {
          const active = activeId === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onChange(opt.id)}
              className={`tap press pill ${active ? "pill--on" : ""}`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
