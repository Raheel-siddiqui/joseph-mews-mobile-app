import { AppShell } from "@/components/AppShell";
import {
  AdvisorCta,
  BackToHub,
  EmptyCentre,
  PreviewChip,
} from "./PreviewChrome";

export default function EmptyExplore() {
  return (
    <AppShell>
      <div className="page-px">
        <div className="pt-4 pb-2">
          <BackToHub />
          <PreviewChip />
        </div>

        <header className="page-intro animate-fade-up">
          <p className="label-eyebrow">Marketplace</p>
          <h1 className="page-intro__title">Explore</h1>
          <p className="page-intro__sub">Curated opportunities</p>
        </header>

        <EmptyCentre
          eyebrow="No opportunities"
          title="Nothing available right now"
          body="New developments will appear here when Mews One publishes them. Speak with your advisor if you’d like an early briefing."
        />

        <AdvisorCta />
        <div className="h-8" />
      </div>
    </AppShell>
  );
}
