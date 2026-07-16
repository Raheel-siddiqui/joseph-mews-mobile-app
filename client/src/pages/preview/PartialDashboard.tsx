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

        <div className="pt-1 pb-7 animate-fade-up">
          <p className="label-eyebrow mb-1.5">{greeting}</p>
          <h1 className="font-serif text-[1.375rem] tracking-tight">
            {investor.firstName}
          </h1>
        </div>

        <div className="mb-2 animate-fade-up">
          <p className="label-eyebrow mb-3">Total Portfolio Value</p>
          <h2 className="font-serif num-hero text-muted-foreground/80 mb-4">
            —
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed mb-6">
            Some data is being completed by your advisor. Available figures are
            shown below; missing values appear as —.
          </p>
        </div>

        <div className="hairline-gold my-8" />

        <div className="grid grid-cols-3 gap-1.5 mb-10">
          <DashMetric
            label="Invested"
            value={display(k.totalInvested, true)}
          />
          <DashMetric label="Equity" value="—" />
          <DashMetric label="Loans" value="—" />
        </div>

        <div className="space-y-5 mb-10">
          <div>
            <p className="text-[10px] tracking-[0.16em] uppercase text-muted-foreground mb-1">
              Gross Yield
            </p>
            <p className="font-serif text-lg tabular-nums">—</p>
          </div>
          <div className="hairline" />
          <div>
            <p className="text-[10px] tracking-[0.16em] uppercase text-muted-foreground mb-1">
              Net Cash Flow
            </p>
            <p className="font-serif text-lg tabular-nums">—</p>
          </div>
        </div>

        <div className="mb-10">
          <p className="label-eyebrow mb-5">Holdings</p>
          <div className="border border-border rounded-sm overflow-hidden">
            <div className="aspect-[16/9] bg-card">
              <img
                src={p.image}
                alt={p.name}
                className="w-full h-full object-cover opacity-80"
              />
            </div>
            <div className="px-4 py-4">
              <p className="font-serif text-base mb-1">{p.name}</p>
              <p className="text-xs text-muted-foreground mb-4">
                {p.city} · {p.status}
              </p>
              <div className="grid grid-cols-2 gap-4">
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
          </div>
        </div>

        <AdvisorCta />
        <div className="h-8" />
      </div>
    </AppShell>
  );
}
