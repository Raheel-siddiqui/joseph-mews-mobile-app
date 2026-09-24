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

        <header className="page-intro animate-fade-up">
          <p className="label-eyebrow">Your investment plan</p>
          <h1 className="page-intro__title">No exact match yet</h1>
          <p className="page-intro__sub">
            Nothing in the current inventory fits this capital and finance
            route. Change the plan, or speak with an advisor about the closest
            option.
          </p>
        </header>

        <EmptyCentre
          eyebrow="Funding gap"
          title="Widen the route"
          body="A higher capital band, a mortgage route, or a higher LTV under Adjust assumptions usually unlocks matches. Your advisor can also help refine the plan."
        />

        <Link
          href="/calculator"
          className="tap press btn-gold mt-4"
        >
          Change capital
          <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
        </Link>

        <div className="h-8" />
      </div>
    </AppShell>
  );
}
