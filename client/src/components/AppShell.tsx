// Joseph Mews — App Shell with phone-style frame and bottom navigation
// Design: warm charcoal background, hairline dividers, champagne gold accents
import { Link, useLocation } from "wouter";
import {
  LayoutGrid,
  Building2,
  FileText,
  ChevronLeft,
  Compass,
  Calculator as CalculatorIcon,
  Mail,
} from "lucide-react";
import { investor, LOGO_URL } from "@/lib/data";
import { advisorEmail, openAdvisorMail } from "@/lib/advisor";
import { ModalShell } from "@/components/ModalShell";
import { ReactNode, useState } from "react";

interface AppShellProps {
  children: ReactNode;
  showNav?: boolean;
  showHeader?: boolean;
  backTo?: string;
  title?: string;
}

export function AppShell({
  children,
  showNav = true,
  showHeader = true,
  backTo,
  title,
}: AppShellProps) {
  const [location] = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background grain">
      <div className="phone-shell bg-background relative">
        {showHeader && (
          <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md pt-safe">
            <div className="flex items-center justify-between page-px h-14">
              {backTo ? (
                <Link
                  href={backTo}
                  className="tap flex items-center gap-1.5 text-muted-foreground active:text-foreground transition-colors -ml-2 px-2 h-11"
                >
                  <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
                  <span className="text-sm">Back</span>
                </Link>
              ) : (
                <Link href="/dashboard" className="tap flex items-center gap-2.5 -ml-1 h-11 px-1">
                  <img
                    src={LOGO_URL}
                    alt="Joseph Mews"
                    className="w-8 h-8 rounded-[22%] shrink-0"
                  />
                  <span className="font-serif text-base tracking-tight">Joseph Mews</span>
                </Link>
              )}
              {title && (
                <span className="font-serif text-base">{title}</span>
              )}
              {!title && !backTo && (
                <button
                  onClick={() => setProfileOpen(true)}
                  className="tap w-11 h-11 -mr-2 rounded-full flex items-center justify-center active:opacity-70 transition-opacity"
                  aria-label="Profile"
                >
                  <span className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-xs font-medium text-foreground/80">
                    AW
                  </span>
                </button>
              )}
            </div>
            <div className="hairline" />
          </header>
        )}

        <main className={showNav ? "pb-32" : "pb-8"}>{children}</main>

        {showNav && (
          <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50">
            <div className="hairline" />
            <div className="bg-background/95 backdrop-blur-md">
              <div className="flex items-stretch px-2 pt-2">
                <NavItem
                  href="/dashboard"
                  label="Overview"
                  icon={LayoutGrid}
                  active={location === "/dashboard" || location === "/"}
                />
                <NavItem
                  href="/portfolio"
                  label="Portfolio"
                  icon={Building2}
                  active={
                    location === "/portfolio" || location.startsWith("/property")
                  }
                />
                <NavItem
                  href="/explore"
                  label="Explore"
                  icon={Compass}
                  active={location.startsWith("/explore")}
                />
                <NavItem
                  href="/calculator"
                  label="Calc"
                  icon={CalculatorIcon}
                  active={location.startsWith("/calculator")}
                />
                <NavItem
                  href="/documents"
                  label="Docs"
                  icon={FileText}
                  active={location === "/documents"}
                />
              </div>
              <div className="pb-safe">
                <div className="h-2" />
              </div>
            </div>
          </nav>
        )}

        {profileOpen && (
          <ProfileSheet onClose={() => setProfileOpen(false)} />
        )}
      </div>
    </div>
  );
}

function ProfileSheet({ onClose }: { onClose: () => void }) {
  return (
    <ModalShell onClose={onClose} title="Your profile">
      <p className="text-[12.5px] text-muted-foreground leading-relaxed mb-6">
        Profile details are managed by your advisor. Contact them to request
        an update.
      </p>

      <div className="rounded-sm border border-border px-4 py-4 mb-4 space-y-4">
        <ProfileRow label="Name" value={investor.name} />
        <div className="hairline" />
        <ProfileRow label="Email" value={investor.email} />
        <div className="hairline" />
        <ProfileRow label="Member since" value={investor.memberSince} />
        <div className="hairline" />
        <ProfileRow label="Tier" value={investor.tier} />
      </div>

      <div className="rounded-sm border border-border px-4 py-4 mb-6">
        <p className="label-eyebrow mb-2">Your Advisor</p>
        <p className="font-serif text-lg leading-tight">{investor.advisor}</p>
        <p className="text-[12px] text-muted-foreground mt-0.5">
          {investor.advisorTitle}
        </p>
        <p className="text-[12px] text-muted-foreground mt-2">{advisorEmail()}</p>
      </div>

      <button
        onClick={() =>
          openAdvisorMail({
            subject: `Profile enquiry — ${investor.name}`,
            body: `Hello ${investor.advisor},\n\nI would like to discuss my profile details.\n\nKind regards,\n${investor.firstName}`,
          })
        }
        className="tap press w-full flex items-center justify-center gap-2 py-3.5 rounded-sm bg-primary text-primary-foreground font-medium tracking-[0.08em] text-[12.5px] uppercase active:opacity-90 transition-opacity"
      >
        <Mail className="w-3.5 h-3.5" strokeWidth={1.75} />
        Contact advisor
      </button>
      <button
        onClick={onClose}
        className="tap w-full py-3 mt-2 text-[12px] tracking-[0.12em] uppercase text-muted-foreground active:text-foreground transition-colors"
      >
        Close
      </button>
    </ModalShell>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] tracking-[0.14em] uppercase text-muted-foreground mb-0.5">
        {label}
      </p>
      <p className="text-sm">{value}</p>
    </div>
  );
}

function NavItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className="tap flex-1 min-w-0 flex flex-col items-center justify-center gap-1 py-2.5 px-1 min-h-[3.25rem] active:opacity-70 transition-opacity"
    >
      <Icon
        className={`w-[1.125rem] h-[1.125rem] transition-colors ${
          active ? "text-primary" : "text-muted-foreground"
        }`}
        strokeWidth={1.5}
      />
      <span
        className={`text-[11px] tracking-[0.1em] uppercase whitespace-nowrap transition-colors ${
          active ? "text-primary" : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
    </Link>
  );
}
