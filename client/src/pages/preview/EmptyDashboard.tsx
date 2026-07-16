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

        <div className="pt-1 pb-7 animate-fade-up">
          <p className="label-eyebrow mb-1.5">{greeting}</p>
          <h1 className="font-serif text-[1.375rem] tracking-tight">
            {investor.firstName}
          </h1>
        </div>

        <EmptyCentre
          eyebrow="Portfolio"
          title="Your portfolio is being prepared"
          body="We’re linking your holdings and documents. You’ll see live figures here once your advisor completes set-up."
        />

        <div className="hairline-gold my-8" />

        <div className="grid grid-cols-3 gap-1.5 mb-8 opacity-60">
          <DashMetric label="Invested" value="—" />
          <DashMetric label="Equity" value="—" />
          <DashMetric label="Loans" value="—" />
        </div>

        <div className="space-y-5 mb-4 opacity-60">
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

        <p className="text-xs text-muted-foreground leading-relaxed mb-2">
          Some data is being completed by your advisor.
        </p>

        <AdvisorCta />
        <div className="h-8" />
      </div>
    </AppShell>
  );
}
