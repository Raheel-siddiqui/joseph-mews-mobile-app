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

        <header className="page-intro animate-fade-up">
          <p className="label-eyebrow">Library</p>
          <h1 className="page-intro__title">Documents</h1>
          <p className="page-intro__sub">0 files</p>
        </header>

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
