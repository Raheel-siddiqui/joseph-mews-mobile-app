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
          <p className="label-eyebrow mb-2">
            Step 3 of 5 · Matched opportunities
          </p>
          <h1 className="font-serif text-2xl tracking-tight mb-2">
            No matches for this budget
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Try adjusting your deposit or LTV to see investment options that
            fit your buying power.
          </p>
        </div>

        <div className="hairline mb-2" />

        <EmptyCentre
          eyebrow="Calculator"
          title="Widen your search"
          body="A higher deposit or lower LTV often unlocks more opportunities. Your advisor can also help refine your criteria."
        />

        <Link
          href="/calculator"
          className="tap press mt-4 w-full flex items-center justify-center gap-2 py-3.5 rounded-sm border border-primary/60 text-primary text-[12px] tracking-[0.12em] uppercase active:bg-primary/5 transition-colors"
        >
          Adjust deposit
          <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
        </Link>

        <div className="h-8" />
      </div>
    </AppShell>
  );
}
