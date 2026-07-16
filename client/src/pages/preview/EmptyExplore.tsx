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

        <div className="pt-2 pb-6 animate-fade-up">
          <p className="label-eyebrow mb-2">Marketplace</p>
          <h1 className="font-serif text-2xl sm:text-3xl tracking-tight mb-1">
            Explore
          </h1>
          <p className="text-sm text-muted-foreground">
            Curated opportunities
          </p>
        </div>

        <div className="hairline mb-2" />

        <EmptyCentre
          eyebrow="No opportunities"
          title="Nothing available right now"
          body="New developments will appear here when Joseph Mews publishes them. Speak with your advisor if you’d like an early briefing."
        />

        <AdvisorCta />
        <div className="h-8" />
      </div>
    </AppShell>
  );
}
