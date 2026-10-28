// Joseph Mews — Explore (Curated Investment Marketplace)
// Design language: matches the rest of the app (warm charcoal, hairlines,
// champagne gold). Tabs: All · Recommended · Coming Soon. Filters stay
// compact so listings lead. Coming Soon areas are visually separate from
// live opportunities, with Register Interest → enquiry capture.
import { AppShell } from "@/components/AppShell";
import { ModalShell, SuccessState } from "@/components/ModalShell";
import {
  opportunities,
  opportunityCities,
  budgetBands,
  yieldBands,
  comingSoonAreas,
  type Opportunity,
  type OpportunityStatus,
  type ComingSoonArea,
} from "@/lib/explore";
import {
  hasComingSoonRegistration,
  registerComingSoonInterest,
} from "@/lib/enquiries";
import { fmt } from "@/lib/data";
import { opportunityImageSrc } from "@/lib/propertyImage";
import { getActiveUser } from "@/lib/session";
import { Link } from "wouter";
import { useMemo, useState } from "react";
import { SlidersHorizontal, ChevronDown, X, Check } from "lucide-react";

type ExploreTab = "all" | "recommended" | "coming-soon";

const TABS: { id: ExploreTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "recommended", label: "Recommended" },
  { id: "coming-soon", label: "Coming Soon" },
];

export default function Explore() {
  const [tab, setTab] = useState<ExploreTab>("all");
  const [city, setCity] = useState<string>("All");
  const [budget, setBudget] = useState<string>("any");
  const [yld, setYld] = useState<string>("any");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [interestArea, setInterestArea] = useState<ComingSoonArea | null>(null);
  const [registeredTick, setRegisteredTick] = useState(0);

  const available = useMemo(() => {
    return opportunities
      .filter((o) => o.status === "Available")
      .filter((o) => {
        const matchCity = city === "All" || o.city === city;
        const band = budgetBands.find((b) => b.id === budget);
        const matchBudget =
          budget === "any" ||
          (band ? o.fromPrice >= band.min && o.fromPrice <= band.max : true);
        const yBand = yieldBands.find((y) => y.id === yld);
        const matchYield = yBand ? o.grossYield >= yBand.min : true;
        return matchCity && matchBudget && matchYield;
      })
      .sort((a, b) => Number(!!b.recommended) - Number(!!a.recommended));
  }, [city, budget, yld]);

  const recommended = useMemo(
    () => available.filter((o) => o.recommended),
    [available],
  );

  const comingSoon = useMemo(() => {
    return comingSoonAreas.filter(
      (a) => city === "All" || a.city === city,
    );
  }, [city]);

  // Active-filter summary chips for the collapsed state
  const activeChips: { id: string; label: string; clear: () => void }[] = [];
  if (city !== "All") {
    activeChips.push({ id: "city", label: city, clear: () => setCity("All") });
  }
  if (budget !== "any" && tab !== "coming-soon") {
    const b = budgetBands.find((b) => b.id === budget);
    if (b) activeChips.push({ id: "budget", label: b.label, clear: () => setBudget("any") });
  }
  if (yld !== "any" && tab !== "coming-soon") {
    const y = yieldBands.find((y) => y.id === yld);
    if (y) activeChips.push({ id: "yield", label: y.label, clear: () => setYld("any") });
  }
  const activeCount = activeChips.length;

  const availableCount = opportunities.filter((o) => o.status === "Available").length;

  const resetAll = () => {
    setCity("All");
    setBudget("any");
    setYld("any");
  };

  const listForTab =
    tab === "recommended" ? recommended : tab === "all" ? available : [];

  return (
    <AppShell>
      <div className="page-px">
        {/* Header */}
        <header className="page-intro animate-fade-up">
          <p className="label-eyebrow">Marketplace</p>
          <h1 className="page-intro__title">Explore Investments</h1>
          <p className="page-intro__sub">
            {opportunities.length} curated developments
            {availableCount > 0 && (
              <>
                {" · "}
                <span className="text-primary">{availableCount} available</span>
              </>
            )}
          </p>
        </header>

        {/* Tabs */}
        <div
          className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1 mb-4 animate-fade-up"
          role="tablist"
          aria-label="Explore views"
          style={{ animationDelay: "40ms" }}
        >
          {TABS.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(item.id)}
                className={`tap press pill shrink-0 ${active ? "pill--on" : ""}`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Compact filter bar — budget/yield only for live inventory */}
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

            {!filtersOpen && activeChips.length > 0 && (
              <button onClick={resetAll} className="btn-quiet shrink-0">
                Reset
              </button>
            )}
          </div>

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
              {tab !== "coming-soon" && (
                <>
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
                    options={yieldBands.map((y) => ({
                      id: y.id,
                      label: y.label,
                    }))}
                    onChange={setYld}
                  />
                </>
              )}

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
                  {tab === "coming-soon"
                    ? `Show ${comingSoon.length} ${comingSoon.length === 1 ? "area" : "areas"}`
                    : `Show ${listForTab.length} ${listForTab.length === 1 ? "result" : "results"}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tab content */}
        <div className="mt-5">
          {tab === "coming-soon" ? (
            <ComingSoonList
              areas={comingSoon}
              registeredTick={registeredTick}
              onRegister={setInterestArea}
            />
          ) : (
            <>
              {listForTab.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="label-eyebrow mb-2">No matches</p>
                  <p className="text-sm text-muted-foreground">
                    {tab === "recommended"
                      ? "No recommended properties match your filters"
                      : "Adjust your filters to see more opportunities"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {listForTab.map((o, i) => (
                    <OpportunityCard key={o.id} opp={o} index={i} />
                  ))}
                </div>
              )}

              {/* ALL: Coming Soon remains reachable even with recommended assigned */}
              {tab === "all" && comingSoon.length > 0 && (
                <ComingSoonSection
                  areas={comingSoon}
                  registeredTick={registeredTick}
                  onRegister={setInterestArea}
                />
              )}
            </>
          )}
        </div>

        <div className="h-8" />
      </div>

      {interestArea && (
        <RegisterInterestSheet
          area={interestArea}
          onClose={() => setInterestArea(null)}
          onRegistered={() => setRegisteredTick((n) => n + 1)}
        />
      )}
    </AppShell>
  );
}

function ComingSoonSection({
  areas,
  registeredTick,
  onRegister,
}: {
  areas: ComingSoonArea[];
  registeredTick: number;
  onRegister: (area: ComingSoonArea) => void;
}) {
  return (
    <section className="mt-10 pt-8 border-t border-border/60 animate-fade-up">
      <p className="section-kicker">Coming Soon</p>
      <p className="text-[12.5px] text-muted-foreground leading-relaxed mb-5 -mt-2 max-w-[34ch]">
        Upcoming areas — separate from live opportunities. Register interest
        before properties are released.
      </p>
      <ComingSoonList
        areas={areas}
        registeredTick={registeredTick}
        onRegister={onRegister}
      />
    </section>
  );
}

function ComingSoonList({
  areas,
  registeredTick,
  onRegister,
}: {
  areas: ComingSoonArea[];
  registeredTick: number;
  onRegister: (area: ComingSoonArea) => void;
}) {
  if (areas.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="label-eyebrow mb-2">No areas</p>
        <p className="text-sm text-muted-foreground">
          No coming soon areas match your filters
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {areas.map((area, i) => (
        <ComingSoonCard
          key={area.id}
          area={area}
          index={i}
          registeredTick={registeredTick}
          onRegister={() => onRegister(area)}
        />
      ))}
    </div>
  );
}

function ComingSoonCard({
  area,
  index,
  registeredTick,
  onRegister,
}: {
  area: ComingSoonArea;
  index: number;
  registeredTick: number;
  onRegister: () => void;
}) {
  const user = getActiveUser();
  // registeredTick forces re-read after a successful registration
  void registeredTick;
  const registered = hasComingSoonRegistration(area.id, user.email);

  return (
    <article
      className="coming-soon-card animate-fade-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="coming-soon-card__media">
        <img src={area.image} alt={area.name} className="coming-soon-card__img" />
        <span className="photo-card__chip">
          <span className="chip chip--warn chip--on-photo">Coming Soon</span>
        </span>
      </div>
      <div className="coming-soon-card__body">
        <p className="label-eyebrow mb-1.5">
          {area.city} · {area.region}
        </p>
        <h3 className="font-serif text-xl tracking-tight leading-tight mb-2">
          {area.name}
        </h3>
        <p className="text-[13px] text-muted-foreground leading-relaxed mb-2">
          {area.summary}
        </p>
        <p className="text-[11px] text-primary/90 mb-4">{area.expectedWindow}</p>
        {registered ? (
          <p className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
            <Check className="w-3.5 h-3.5 text-primary" strokeWidth={2} />
            Interest registered
          </p>
        ) : (
          <button
            type="button"
            onClick={onRegister}
            className="tap press btn-gold w-full"
          >
            Register Interest
          </button>
        )}
      </div>
    </article>
  );
}

function RegisterInterestSheet({
  area,
  onClose,
  onRegistered,
}: {
  area: ComingSoonArea;
  onClose: () => void;
  onRegistered: () => void;
}) {
  const user = getActiveUser();
  const already = hasComingSoonRegistration(area.id, user.email);
  const [done, setDone] = useState(already);

  const handleRegister = () => {
    registerComingSoonInterest({
      investorName: user.name,
      investorEmail: user.email,
      areaId: area.id,
      areaName: area.name,
      city: area.city,
    });
    setDone(true);
    onRegistered();
  };

  return (
    <ModalShell onClose={onClose} title="Register Interest">
      {!done ? (
        <>
          <p className="text-[12.5px] text-muted-foreground leading-relaxed mb-5">
            We’ll note your interest in this area and follow up when relevant
            properties become available.
          </p>
          <div className="rounded-lg border border-border px-4 py-4 mb-5 space-y-3">
            <div>
              <p className="label-eyebrow mb-1">Area</p>
              <p className="font-serif text-lg leading-tight">{area.name}</p>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                {area.city} · {area.region}
              </p>
            </div>
            <div className="hairline" />
            {/* <div>
              <p className="label-eyebrow mb-1">Investor</p>
              <p className="text-sm">{user.name}</p>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                {user.email}
              </p>
            </div> */}
            {/* <div className="hairline" /> */}
            {/* <div>
              <p className="label-eyebrow mb-1">Enquiry type</p>
              <p className="text-sm">Coming Soon Registration</p>
            </div> */}
          </div>
          <button
            type="button"
            onClick={handleRegister}
            className="tap press btn-gold w-full"
          >
            Confirm registration
          </button>
          <button onClick={onClose} className="btn-quiet w-full mt-3">
            Cancel
          </button>
        </>
      ) : (
        <SuccessState
          headline="Interest registered"
          body={`Your interest in ${area.name} is with the JM team. We’ll follow up when properties in this area become available.`}
          onClose={onClose}
        />
      )}
    </ModalShell>
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
      {opp.recommended ? (
        <span className="photo-card__flag">Recommended</span>
      ) : (
        opp.status === "Available" && (
          <span className="photo-card__chip">
            <StatusPill status={opp.status} />
          </span>
        )
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
