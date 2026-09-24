import { AppShell } from "@/components/AppShell";
import { fmt, investor } from "@/lib/data";
import { partialPortfolioKpis, partialProperty } from "@/lib/empty-fixtures";
import {
  AdvisorCta,
  BackToHub,
  DashMetric,
  PreviewChip,
} from "./PreviewChrome";
import { useEffect, useState } from "react";

function display(value: number | null, asCurrency = false) {
  if (value === null || value === 0) return "—";
  return asCurrency ? fmt.currency(value) : String(value);
}

export default function PartialDashboard() {
  const [greeting, setGreeting] = useState("Good evening");
  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting("Good morning");
    else if (h < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const p = partialProperty;
  const k = partialPortfolioKpis;

  return (
    <AppShell>
      <div className="page-px">
        <div className="pt-3 pb-2">
          <BackToHub />
          <PreviewChip label="Preview · Partial data" />
        </div>

        <header className="page-intro animate-fade-up">
          <p className="label-eyebrow">{greeting}</p>
          <h1 className="page-intro__title">{investor.firstName}</h1>
        </header>

        <div className="pd-value mb-4 animate-fade-up">
          <p className="label-eyebrow pd-value__label">Total Portfolio Value</p>
          <h2 className="pd-value__amount text-muted-foreground/80">—</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Some data is being completed by your advisor. Available figures are
            shown below; missing values appear as —.
          </p>
        </div>

        <div className="glass stat-grid stat-grid--3 mb-4">
          <DashMetric
            label="Invested"
            value={display(k.totalInvested, true)}
          />
          <DashMetric label="Equity" value="—" />
          <DashMetric label="Loans" value="—" />
        </div>

        <div className="glass-list mb-8">
          <div className="py-3.5">
            <p className="label-eyebrow mb-1">Gross Yield</p>
            <p className="font-serif text-lg tabular-nums">—</p>
          </div>
          <div className="py-3.5">
            <p className="label-eyebrow mb-1">Net Cash Flow</p>
            <p className="font-serif text-lg tabular-nums">—</p>
          </div>
        </div>

        <div className="mb-10">
          <p className="label-eyebrow mb-5">Holdings</p>
          <div className="photo-card mb-4">
            <img
              src={p.image}
              alt={p.name}
              className="photo-card__img opacity-80"
            />
            <span className="photo-card__shade" />
            <span className="photo-card__meta">
              <span className="photo-card__kicker">
                {p.status === "Available" ? `${p.city} · ${p.status}` : p.city}
              </span>
              <span className="photo-card__name">{p.name}</span>
            </span>
          </div>
          <div className="glass stat-grid">
            <div>
              <p className="label-eyebrow mb-1">Purchase</p>
              <p className="font-serif text-sm tabular-nums">
                {fmt.currency(p.purchasePrice)}
              </p>
            </div>
            <div>
              <p className="label-eyebrow mb-1">Current value</p>
              <p className="font-serif text-sm tabular-nums text-muted-foreground">
                —
              </p>
            </div>
            <div>
              <p className="label-eyebrow mb-1">Rent</p>
              <p className="font-serif text-sm tabular-nums text-muted-foreground">
                —
              </p>
            </div>
            <div>
              <p className="label-eyebrow mb-1">Gross Yield</p>
              <p className="font-serif text-sm tabular-nums text-muted-foreground">
                —
              </p>
            </div>
          </div>
        </div>

        <AdvisorCta />
        <div className="h-8" />
      </div>
    </AppShell>
  );
}
