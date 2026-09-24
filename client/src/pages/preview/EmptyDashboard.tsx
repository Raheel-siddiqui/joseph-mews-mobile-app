import { AppShell } from "@/components/AppShell";
import { investor } from "@/lib/data";
import {
  AdvisorCta,
  BackToHub,
  DashMetric,
  EmptyCentre,
  PreviewChip,
} from "./PreviewChrome";
import { useEffect, useState } from "react";

export default function EmptyDashboard() {
  const [greeting, setGreeting] = useState("Good evening");
  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting("Good morning");
    else if (h < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  return (
    <AppShell>
      <div className="page-px">
        <div className="pt-3 pb-2">
          <BackToHub />
          <PreviewChip />
        </div>

        <header className="page-intro animate-fade-up">
          <p className="label-eyebrow">{greeting}</p>
          <h1 className="page-intro__title">{investor.firstName}</h1>
        </header>

        <EmptyCentre
          eyebrow="Portfolio"
          title="Your portfolio is being prepared"
          body="We’re linking your holdings and documents. You’ll see live figures here once your advisor completes set-up."
        />

        <div className="glass stat-grid stat-grid--3 mb-4 opacity-70">
          <DashMetric label="Invested" value="—" />
          <DashMetric label="Equity" value="—" />
          <DashMetric label="Loans" value="—" />
        </div>

        <div className="glass-list mb-6 opacity-70">
          <div className="py-3.5">
            <p className="label-eyebrow mb-1">Gross Yield</p>
            <p className="font-serif text-lg tabular-nums">—</p>
          </div>
          <div className="py-3.5">
            <p className="label-eyebrow mb-1">Net Cash Flow</p>
            <p className="font-serif text-lg tabular-nums">—</p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed mb-2">
          Some data is being completed by your advisor.
        </p>

        <AdvisorCta />
        <div className="h-8" />
      </div>
    </AppShell>
  );
}
