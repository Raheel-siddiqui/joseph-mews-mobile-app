import { AppShell } from "@/components/AppShell";
import {
  AdvisorCta,
  BackToHub,
  EmptyCentre,
  PreviewChip,
} from "./PreviewChrome";

export default function EmptyDocuments() {
  return (
    <AppShell>
      <div className="page-px">
        <div className="pt-4 pb-2">
          <BackToHub />
          <PreviewChip />
        </div>

        <div className="pt-2 pb-6 animate-fade-up">
          <p className="label-eyebrow mb-2">Library</p>
          <h1 className="font-serif text-2xl sm:text-3xl tracking-tight mb-1">
            Documents
          </h1>
          <p className="text-sm text-muted-foreground">0 files</p>
        </div>

        <div className="hairline mb-2" />

        <EmptyCentre
          eyebrow="Document vault"
          title="No documents yet"
          body="Contracts, tenancy agreements and statements will appear here when your advisor uploads them to your account."
        />

        <AdvisorCta />
        <div className="h-8" />
      </div>
    </AppShell>
  );
}
