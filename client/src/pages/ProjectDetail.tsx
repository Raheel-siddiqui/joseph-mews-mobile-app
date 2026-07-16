// Joseph Mews — Project (Opportunity) Detail
// Mirrors the rhythm of PropertyDetail: hero, title, sectioned content,
// and ends with two premium CTAs (View Projection · Run Numbers).
import { useLocation, useRoute } from "wouter";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ModalShell, SuccessState } from "@/components/ModalShell";
import { getOpportunity, type Opportunity, type OpportunityStatus, type UnitOption } from "@/lib/explore";
import { fmt, investor } from "@/lib/data";
import { advisorEmail } from "@/lib/advisor";
import { ProjectionSection } from "@/components/ProjectionSection";
import {
  ArrowUpRight,
  TrendingUp,
  Calculator,
  MapPin,
  Calendar,
  Building2,
  Check,
  Phone,
  Mail,
  CalendarDays,
  ShieldCheck,
} from "lucide-react";
import NotFound from "./NotFound";

export default function ProjectDetail() {
  const [, params] = useRoute<{ id: string }>("/explore/:id");
  const [, navigate] = useLocation();
  const opp = params?.id ? getOpportunity(params.id) : null;

  const [reserveOpen, setReserveOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  // Calculator "Speak to Advisor" lands on #contact — open the sheet once.
  useEffect(() => {
    if (!opp) return;
    if (window.location.hash === "#contact") {
      setContactOpen(true);
    }
  }, [opp?.id]);

  if (!opp) return <NotFound />;

  const isInactive = opp.status === "Sold Out";
  const isComingSoon = opp.status === "Coming Soon";

  const handleViewProjection = () => {
    const el = document.getElementById("projection-anchor");
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  const handleRunNumbers = () => {
    navigate(`/calculator/explore/${opp.id}`);
  };

  return (
    <AppShell backTo="/explore" showNav={false}>
      <div className="page-px">
        {/* Hero image */}
        <div className="aspect-[16/9] rounded-sm overflow-hidden bg-card mb-6 -mx-page sm:mx-0 animate-fade-up relative">
          <img
            src={opp.image}
            alt={opp.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3">
            <StatusPill status={opp.status} />
          </div>
        </div>

        {/* Title block */}
        <div className="mb-7 animate-fade-up" style={{ animationDelay: "60ms" }}>
          <p className="label-eyebrow mb-3">{opp.reference}</p>
          <h1 className="font-serif text-2xl leading-tight mb-2">{opp.name}</h1>
          <p className="text-[13px] text-muted-foreground">
            {opp.developer} · {opp.city}, {opp.region}
          </p>

          <p className="text-[13px] leading-relaxed text-foreground/80 mt-5 italic">
            {opp.tagline}
          </p>
        </div>

        {/* SECTION 1: AT A GLANCE */}
        <Section eyebrow="Section One" title="At a Glance">
          <div className="mb-6">
            <p className="label-eyebrow mb-3">Starting Price</p>
            <h2 className="font-serif num-hero leading-none tracking-tight tabular-nums mb-3">
              {fmt.currency(opp.fromPrice)}
            </h2>
            <div className="flex items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-1 text-primary tabular-nums">
                <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.75} />
                +{opp.capitalGrowth5Y.toFixed(0)}%
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">5-year capital growth (forecast)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-5 pt-5 border-t border-border">
            <DataPoint label="Gross Yield" value={`${opp.grossYield.toFixed(1)}%`} sub="Estimated" />
            <DataPoint label="Net Yield" value={`${opp.netYield.toFixed(1)}%`} sub="Estimated · After costs" />
            <DataPoint label="Completion" value={opp.expectedCompletion} sub={opp.tenure} />
            <DataPoint
              label="Availability"
              value={`${opp.unitsAvailable}/${opp.totalUnits}`}
              sub={isInactive ? "Sold out" : "Units remaining"}
            />
          </div>
        </Section>

        <Divider />

        {/* SECTION 2: FORWARD PROJECTION */}
        <div id="projection-anchor" />
        <ProjectionSection
          eyebrow="Section Two"
          title="Projection"
          input={{
            startValue: opp.fromPrice,
            // Convert the headline 5-yr forecast into a per-annum growth rate
            annualGrowth: Math.pow(1 + opp.capitalGrowth5Y / 100, 1 / 5) * 100 - 100,
            annualGrossRent: opp.fromPrice * (opp.grossYield / 100),
            rentalGrowth: 3.0,
            annualServiceCharge: opp.fromPrice * 0.005,  // ~0.5% of value
            annualManagementFee: opp.fromPrice * (opp.grossYield / 100) * 0.10, // 10% of gross
            annualMortgage: 0,
            costGrowth: 2.5,
          }}
          hasMortgage={false}
        />

        <Divider />

        {/* SECTION 3: AVAILABLE UNITS */}
        <Section eyebrow="Section Three" title="Available Units">
          <div className="space-y-3">
            {opp.unitTypes.map((u) => (
              <UnitRow key={u.type} unit={u} disabled={isInactive || isComingSoon} />
            ))}
          </div>
        </Section>

        <Divider />

        {/* SECTION 4: HIGHLIGHTS */}
        <Section eyebrow="Section Four" title="Why This Opportunity">
          <ul className="space-y-5">
            {opp.highlights.map((h, i) => (
              <li
                key={i}
                className="flex items-start gap-4 animate-fade-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span className="mt-1.5 w-3 h-px bg-primary shrink-0" />
                <p className="text-[13px] leading-relaxed text-foreground/85">
                  {h}
                </p>
              </li>
            ))}
          </ul>
        </Section>

        <Divider />

        {/* SECTION 5: KEY FACTS */}
        <Section eyebrow="Section Five" title="Key Facts">
          <div className="space-y-4">
            <InfoRow icon={Building2} label="Developer" value={opp.developer} />
            <InfoRow icon={MapPin} label="Location" value={`${opp.city} · ${opp.postcode}`} />
            <InfoRow icon={Calendar} label="Expected Completion" value={opp.expectedCompletion} />
            <InfoRow
              icon={TrendingUp}
              label="Tenure"
              value={
                opp.tenure === "Leasehold" && opp.leaseYears
                  ? `${opp.tenure} · ${opp.leaseYears} years`
                  : opp.tenure
              }
            />
          </div>

          <div className="hairline mt-6 mb-5" />

          <p className="label-eyebrow mb-2">Payment Plan</p>
          <p className="text-sm text-foreground/85 leading-relaxed">
            {opp.paymentPlan}
          </p>
        </Section>

        <div className="h-6" />

        {/* Secondary actions — keep projection / calculator inline */}
        <div className="hairline mb-6" />
        <div className="grid grid-cols-2 gap-3 mb-2 animate-fade-up">
          <button
            onClick={handleViewProjection}
            disabled={isInactive}
            className={`tap press flex items-center justify-center gap-2 py-3.5 rounded-sm border border-border text-foreground/85 text-[12px] tracking-[0.12em] uppercase transition-opacity ${
              isInactive ? "opacity-40 cursor-not-allowed" : "active:bg-card/60"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
            Projection
          </button>

          <button
            onClick={handleRunNumbers}
            disabled={isInactive}
            className={`tap press flex items-center justify-center gap-2 py-3.5 rounded-sm border border-border text-foreground/85 text-[12px] tracking-[0.12em] uppercase transition-opacity ${
              isInactive ? "opacity-40 cursor-not-allowed" : "active:bg-card/60"
            }`}
          >
            <Calculator className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
            Run Numbers
          </button>
        </div>

        {/* Spacer so sticky CTA bar never overlaps last content */}
        <div className="h-44" />
      </div>

      {/* STICKY CONVERSION CTA — Buy Now (primary) + Contact Sales */}
      <StickyCta
        opp={opp}
        isInactive={isInactive}
        isComingSoon={isComingSoon}
        onBuy={() => setReserveOpen(true)}
        onContact={() => setContactOpen(true)}
      />

      {reserveOpen && (
        <ReserveSheet
          opp={opp}
          isComingSoon={isComingSoon}
          onClose={() => setReserveOpen(false)}
        />
      )}
      {contactOpen && (
        <ContactSheet opp={opp} onClose={() => setContactOpen(false)} />
      )}
    </AppShell>
  );
}

/* ---------- helpers (mirrored from PropertyDetail) ---------- */

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-7 animate-fade-up">
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <p className="label-eyebrow mb-1.5">{eyebrow}</p>
          <h3 className="font-serif text-xl tracking-tight">{title}</h3>
        </div>
      </div>
      {children}
    </section>
  );
}

function Divider() {
  return <div className="hairline" />;
}

function DataPoint({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div>
      <p className="label-eyebrow mb-2">{label}</p>
      <p className="font-serif text-lg tabular-nums leading-none mb-1">
        {value}
      </p>
      {sub && (
        <p className="text-[11px] text-muted-foreground/80 tabular-nums">
          {sub}
        </p>
      )}
    </div>
  );
}

function UnitRow({ unit, disabled }: { unit: UnitOption; disabled: boolean }) {
  const isSold = unit.available === 0;
  return (
    <div
      className={`flex items-center justify-between gap-4 px-4 py-4 rounded-sm border ${
        isSold || disabled ? "border-border opacity-70" : "border-border bg-card/40"
      }`}
    >
      <div className="min-w-0">
        <p className="text-sm font-medium mb-1">{unit.type}</p>
        <p className="text-[11px] text-muted-foreground tabular-nums">
          From {unit.sqftFrom} sq ft
          {!disabled && !isSold && (
            <>
              {" · "}
              <span className="text-foreground/70">
                {unit.available} of {unit.total} available
              </span>
            </>
          )}
          {isSold && (
            <>
              {" · "}
              <span className="text-muted-foreground">Fully reserved</span>
            </>
          )}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="label-eyebrow mb-1">From</p>
        <p className="font-serif text-base tabular-nums">
          {fmt.currency(unit.fromPrice)}
        </p>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: OpportunityStatus }) {
  const styles =
    status === "Available"
      ? "border-primary/40 text-primary bg-background/85"
      : status === "Coming Soon"
      ? "border-amber-500/40 text-amber-500/90 bg-background/85"
      : "border-muted-foreground/40 text-muted-foreground bg-background/85";

  return (
    <span
      className={`text-[10px] tracking-[0.18em] uppercase px-2.5 py-1 border rounded-sm backdrop-blur-sm ${styles}`}
    >
      {status}
    </span>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <div className="flex-1">
        <p className="text-[10px] tracking-[0.14em] uppercase text-muted-foreground mb-0.5">
          {label}
        </p>
        <p className="text-sm">{value}</p>
      </div>
    </div>
  );
}


/* ---------- Sticky conversion CTA ---------- */

function StickyCta({
  opp,
  isInactive,
  isComingSoon,
  onBuy,
  onContact,
}: {
  opp: Opportunity;
  isInactive: boolean;
  isComingSoon: boolean;
  onBuy: () => void;
  onContact: () => void;
}) {
  const buyLabel = isInactive
    ? "Sold Out"
    : isComingSoon
    ? "Request Allocation"
    : "Buy Now";

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 pointer-events-none">
      {/* gradient fade so content doesn't slam into the bar */}
      <div className="h-6 bg-gradient-to-t from-background to-transparent" />
      <div className="bg-background/95 backdrop-blur-md border-t border-border pointer-events-auto">
        <div className="page-px pt-3.5 pb-3">
          <div className="flex gap-2.5">
            <button
              onClick={onBuy}
              disabled={isInactive}
              className={`tap press flex-1 flex items-center justify-center gap-2 py-3.5 rounded-sm font-medium tracking-[0.08em] text-[12.5px] uppercase transition-opacity ${
                isInactive
                  ? "bg-muted/40 text-muted-foreground cursor-not-allowed"
                  : "bg-primary text-primary-foreground active:opacity-90"
              }`}
            >
              <Check className="w-3.5 h-3.5" strokeWidth={2} />
              {buyLabel}
            </button>
            <button
              onClick={onContact}
              className="tap press flex items-center justify-center gap-2 py-3.5 px-5 rounded-sm border border-primary/60 text-primary text-[12.5px] tracking-[0.08em] uppercase active:bg-primary/5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" strokeWidth={1.75} />
              Contact
            </button>
          </div>
          <p className="text-[10.5px] text-muted-foreground/75 text-center mt-2.5 leading-snug">
            Reservations handled by your advisor
          </p>
        </div>
        <div className="pb-safe" />
      </div>
    </div>
  );
}

/* ---------- Reserve / Allocation sheet ---------- */

function ReserveSheet({
  opp,
  isComingSoon,
  onClose,
}: {
  opp: Opportunity;
  isComingSoon: boolean;
  onClose: () => void;
}) {
  const [selectedUnit, setSelectedUnit] = useState<string>(
    opp.unitTypes.find((u) => u.available > 0)?.type ?? opp.unitTypes[0].type,
  );
  const [submitted, setSubmitted] = useState(false);

  const headline = isComingSoon ? "Request Allocation" : "Reserve a Unit";
  const cta = isComingSoon ? "Request priority access" : "Submit reservation";

  return (
    <ModalShell onClose={onClose} title={headline}>
      {!submitted ? (
        <>
          <p className="text-[12.5px] text-muted-foreground leading-relaxed mb-6">
            {isComingSoon
              ? `Join the priority list for ${opp.name}. Allocations open before public release.`
              : `Place a soft reservation on a unit at ${opp.name}. No payment is taken until contracts are issued.`}
          </p>

          <p className="label-eyebrow mb-3">Preferred Unit Type</p>
          <div className="space-y-2 mb-6">
            {opp.unitTypes.map((u) => {
              const sold = u.available === 0;
              const active = selectedUnit === u.type;
              return (
                <button
                  key={u.type}
                  onClick={() => !sold && setSelectedUnit(u.type)}
                  disabled={sold}
                  className={`tap press w-full flex items-center justify-between gap-3 px-3.5 py-3 rounded-sm border text-left transition-colors ${
                    sold
                      ? "border-border opacity-40 cursor-not-allowed"
                      : active
                      ? "border-primary bg-primary/8"
                      : "border-border active:bg-card/60"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium mb-0.5">{u.type}</p>
                    <p className="text-[10.5px] tracking-[0.1em] uppercase text-muted-foreground">
                      {sold ? "Fully reserved" : `${u.available} available`}
                    </p>
                  </div>
                  <p className="font-serif text-[13px] tabular-nums whitespace-nowrap">
                    From {fmt.currency(u.fromPrice)}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="rounded-sm border border-dashed border-border px-3.5 py-3 mb-6 flex items-start gap-2.5">
            <ShieldCheck
              className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0"
              strokeWidth={1.5}
            />
            <p className="text-[11.5px] text-muted-foreground/85 leading-relaxed">
              Your advisor <span className="text-foreground/85">{investor.advisor}</span>{" "}
              will confirm your reservation within 24 hours and walk you through next steps.
            </p>
          </div>

          <button
            onClick={() => setSubmitted(true)}
            className="tap press w-full py-3.5 rounded-sm bg-primary text-primary-foreground font-medium tracking-[0.08em] text-[12.5px] uppercase active:opacity-90 transition-opacity"
          >
            {cta}
          </button>
          <button
            onClick={onClose}
            className="tap w-full py-3 mt-2 text-[12px] tracking-[0.12em] uppercase text-muted-foreground active:text-foreground transition-colors"
          >
            Cancel
          </button>
        </>
      ) : (
        <SuccessState
          headline={isComingSoon ? "You're on the priority list" : "Reservation received"}
          body={
            isComingSoon
              ? `${investor.advisor} will be in touch as soon as allocations open.`
              : `${investor.advisor} will confirm your reservation within 24 hours.`
          }
          onClose={onClose}
        />
      )}
    </ModalShell>
  );
}

/* ---------- Contact Sales sheet ---------- */

type ContactChannel = "schedule" | "callback" | "email";

const CONTACT_SUCCESS: Record<
  ContactChannel,
  { headline: string; body: string }
> = {
  schedule: {
    headline: "Call request received",
    body: `${investor.advisor} will offer times for a 20-minute consultation within one business day.`,
  },
  callback: {
    headline: "Callback requested",
    body: `${investor.advisor} will call you today between 9am and 6pm GMT.`,
  },
  email: {
    headline: "Email ready to send",
    body: `We've prepared a message to ${investor.advisor}. Check your inbox for a copy, or they will reply directly.`,
  },
};

function ContactSheet({
  opp,
  onClose,
}: {
  opp: Opportunity;
  onClose: () => void;
}) {
  const [submitted, setSubmitted] = useState<ContactChannel | null>(null);
  const email = advisorEmail();

  const handleChannel = (channel: ContactChannel) => {
    if (channel === "email") {
      const subject = encodeURIComponent(`Enquiry — ${opp.name}`);
      const body = encodeURIComponent(
        `Hello ${investor.advisor},\n\nI would like to discuss ${opp.name} (${opp.reference}), including pricing, payment plans and allocation timing.\n\nKind regards,\n${investor.firstName}`,
      );
      window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    }
    setSubmitted(channel);
  };

  const success = submitted ? CONTACT_SUCCESS[submitted] : null;

  return (
    <ModalShell onClose={onClose} title="Speak with your advisor">
      {!submitted || !success ? (
        <>
          <p className="text-[12.5px] text-muted-foreground leading-relaxed mb-6">
            Discuss <span className="text-foreground/85">{opp.name}</span> with your dedicated
            advisor — including pricing, payment plans and allocation timing.
          </p>

          <div className="rounded-sm border border-border px-4 py-4 mb-5">
            <p className="label-eyebrow mb-2">Your Advisor</p>
            <p className="font-serif text-lg leading-tight">{investor.advisor}</p>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              {investor.advisorTitle}
            </p>
          </div>

          <div className="space-y-2.5">
            <ContactAction
              icon={CalendarDays}
              label="Schedule a call"
              sub="Book a 20-min consultation"
              onClick={() => handleChannel("schedule")}
            />
            <ContactAction
              icon={Phone}
              label="Request a callback"
              sub="Today, between 9am – 6pm GMT"
              onClick={() => handleChannel("callback")}
            />
            <ContactAction
              icon={Mail}
              label={`Email ${investor.advisor.split(" ")[0]}`}
              sub={email}
              onClick={() => handleChannel("email")}
            />
          </div>

          <button
            onClick={onClose}
            className="tap w-full py-3 mt-6 text-[12px] tracking-[0.12em] uppercase text-muted-foreground active:text-foreground transition-colors"
          >
            Close
          </button>
        </>
      ) : (
        <SuccessState
          headline={success.headline}
          body={success.body}
          onClose={onClose}
        />
      )}
    </ModalShell>
  );
}

function ContactAction({
  icon: Icon,
  label,
  sub,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="tap press w-full flex items-center gap-3.5 px-4 py-3.5 rounded-sm border border-border active:bg-card/60 transition-colors text-left"
    >
      <div className="w-9 h-9 rounded-full border border-border flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium leading-snug">{label}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
      </div>
    </button>
  );
}
