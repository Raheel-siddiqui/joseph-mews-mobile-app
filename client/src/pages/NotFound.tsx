import { AppShell } from "@/components/AppShell";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <AppShell showNav={false} backTo="/dashboard">
      <div className="page-px">
        <header className="page-intro">
          <p className="label-eyebrow">Mews One</p>
          <h1 className="page-intro__title">Page not found</h1>
          <p className="page-intro__sub">
            This screen isn’t available. Head back to your overview.
          </p>
        </header>
        <Link href="/dashboard" className="tap press btn-gold">
          Back to overview
        </Link>
      </div>
    </AppShell>
  );
}
