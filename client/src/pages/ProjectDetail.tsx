// Joseph Mews — Project (Opportunity) Detail
// Mirrors the rhythm of PropertyDetail: hero, title, sectioned content,
// ending with a Contact Sales sticky CTA.
import { useRoute } from "wouter";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ModalShell, SuccessState } from "@/components/ModalShell";
import { getOpportunity, type Opportunity, type OpportunityStatus } from "@/lib/explore";
import { fmt, investor } from "@/lib/data";
import { advisorEmail } from "@/lib/advisor";
import { ProjectionSection } from "@/components/ProjectionSection";
import {
  ArrowUpRight,
  TrendingUp,
  MapPin,
  Calendar,
  Building2,
  Phone,
  Mail,
  CalendarDays,
} from "lucide-react";
import NotFound from "./NotFound";

export default function ProjectDetail() {
  const [, params] = useRoute<{ id: string }>("/explore/:id");
  const opp = params?.id ? getOpportunity(params.id) : null;

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
        <Section title="At a Glance">
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

        {/* HIGHLIGHTS */}
        <Section title="Why This Opportunity">
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
        <Section title="Key Facts">
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

        {/* Spacer so sticky CTA bar never overlaps last content */}
        <div className="h-44" />
      </div>

      {/* STICKY CTA — Contact Sales */}
      <StickyCta onContact={() => setContactOpen(true)} />

      {contactOpen && (
        <ContactSheet opp={opp} onClose={() => setContactOpen(false)} />
      )}
    </AppShell>
  );
}

/* ---------- helpers (mirrored from PropertyDetail) ---------- */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-7 animate-fade-up">
      <div className="flex items-baseline justify-between mb-6">
        <div>
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

function StickyCta({ onContact }: { onContact: () => void }) {
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 pointer-events-none">
      <div className="h-6 bg-gradient-to-t from-background to-transparent" />
      <div className="bg-background/95 backdrop-blur-md border-t border-border pointer-events-auto">
        <div className="page-px pt-3.5 pb-3">
          <button
            onClick={onContact}
            className="tap press w-full flex items-center justify-center gap-2 py-3.5 rounded-sm bg-primary text-primary-foreground font-medium tracking-[0.08em] text-[12.5px] uppercase active:opacity-90 transition-opacity"
          >
            <Phone className="w-3.5 h-3.5" strokeWidth={1.75} />
            Contact Sales
          </button>
          <p className="text-[10.5px] text-muted-foreground/75 text-center mt-2.5 leading-snug">
            Your advisor will handle next steps
          </p>
        </div>
        <div className="pb-safe" />
      </div>
    </div>
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
