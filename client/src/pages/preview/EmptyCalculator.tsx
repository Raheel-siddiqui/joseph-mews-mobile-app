import { AppShell } from "@/components/AppShell";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import {
  BackToHub,
  EmptyCentre,
  PreviewChip,
} from "./PreviewChrome";

export default function EmptyCalculator() {
  return (
    <AppShell>
      <div className="page-px">
        <div className="pt-4 pb-2">
          <BackToHub />
          <PreviewChip />
        </div>

        <div className="pt-2 pb-6 animate-fade-up">
          <p className="label-eyebrow mb-2">Your investment plan</p>
          <h1 className="font-serif text-2xl tracking-tight mb-2">
            No exact match yet
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Nothing in the current inventory fits this capital and finance
            route. Change the plan, or speak with an advisor about the closest
            option.
          </p>
        </div>

        <div className="hairline mb-2" />

        <EmptyCentre
          eyebrow="Funding gap"
          title="Widen the route"
          body="A higher capital band, a mortgage route, or a higher LTV under Adjust assumptions usually unlocks matches. Your advisor can also help refine the plan."
        />

        <Link
          href="/calculator"
          className="tap press mt-4 w-full flex items-center justify-center gap-2 py-3.5 rounded-sm border border-primary/60 text-primary text-[12px] tracking-[0.12em] uppercase active:bg-primary/5 transition-colors"
        >
          Change capital
          <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
        </Link>

        <div className="h-8" />
      </div>
    </AppShell>
  );
}
