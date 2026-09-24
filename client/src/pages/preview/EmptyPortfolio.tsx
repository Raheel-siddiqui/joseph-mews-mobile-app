import { AppShell } from "@/components/AppShell";
import {
  AdvisorCta,
  BackToHub,
  EmptyCentre,
  PreviewChip,
} from "./PreviewChrome";

export default function EmptyPortfolio() {
  return (
    <AppShell>
      <div className="page-px">
        <div className="pt-4 pb-2">
          <BackToHub />
          <PreviewChip />
        </div>

        <header className="page-intro animate-fade-up">
          <p className="label-eyebrow">Holdings</p>
          <h1 className="page-intro__title">Portfolio</h1>
          <p className="page-intro__sub">0 properties</p>
        </header>

        <EmptyCentre
          eyebrow="No holdings yet"
          title="Your properties will appear here"
          body="Once your advisor links your investments, you’ll see each property with value, yield and status in this list."
        />

        <AdvisorCta />
        <div className="h-8" />
      </div>
    </AppShell>
  );
}
