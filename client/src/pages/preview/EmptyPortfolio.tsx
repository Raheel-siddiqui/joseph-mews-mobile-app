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

        <div className="pt-2 pb-6 animate-fade-up">
          <p className="label-eyebrow mb-2">Holdings</p>
          <h1 className="font-serif text-2xl sm:text-3xl tracking-tight mb-1">
            Portfolio
          </h1>
          <p className="text-sm text-muted-foreground">0 properties</p>
        </div>

        <div className="hairline mb-2" />

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
