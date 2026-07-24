// Joseph Mews — Project (Opportunity) Detail
// Mirrors the rhythm of PropertyDetail: hero, title, sectioned content,
// ending with a Contact Sales sticky CTA.
import { useRoute } from "wouter";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ContactAdvisorSheet } from "@/components/ContactAdvisorSheet";
import { getOpportunity, type OpportunityStatus } from "@/lib/explore";
import { fmt } from "@/lib/data";
import {
  MORTGAGE_PERSONALISATION_NOTE,
  illustrativeDeposit,
  illustrativeLoan,
  illustrativeMonthlyPayment,
} from "@/lib/paymentPlan";
import { ProjectionSection } from "@/components/ProjectionSection";
import {
  ArrowUpRight,
  TrendingUp,
  MapPin,
  Calendar,
  Building2,
  Phone,
} from "lucide-react";
import NotFound from "./NotFound";

export default function ProjectDetail() {
  const [, params] = useRoute<{ id: string }>("/explore/:id");
  const opp = params?.id ? getOpportunity(params.id) : null;

  const [contactOpen, setContactOpen] = useState(false);

  // Deep-link #contact opens the sheet once (e.g. shared links).
  useEffect(() => {
    if (!opp) return;
    if (window.location.hash === "#contact") {
      setContactOpen(true);
      // Clear hash so close/back stays on this page without re-opening.
      window.history.replaceState(null, "", window.location.pathname);
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
        <Section>
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
        </Section>

        <Divider />

        {/* MORTGAGE PLAN */}
        <Section title="Mortgage Plan">
          {opp.illustrativeMortgage ? (
            <>
              <p className="label-eyebrow mb-1.5">
                {opp.illustrativeMortgage.name}
              </p>
              <p className="text-[12px] text-muted-foreground mb-6">
                Illustrative figures based on starting price{" "}
                {fmt.currency(opp.fromPrice)}
              </p>

              {(() => {
                const m = opp.illustrativeMortgage;
                const loan = illustrativeLoan(opp.fromPrice, m.ltvPercent);
                const deposit = illustrativeDeposit(
                  opp.fromPrice,
                  m.depositPercent
                );
                const monthly = illustrativeMonthlyPayment(
                  loan,
                  m.rate,
                  m.type,
                  m.termYears
                );
                return (
                  <>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-5 mb-7">
                      <DataPoint
                        label="Deposit"
                        value={fmt.currency(deposit)}
                        sub={`${m.depositPercent}%`}
                      />
                      <DataPoint
                        label="Loan"
                        value={fmt.currency(loan)}
                        sub={`${m.ltvPercent}% LTV`}
                      />
                      <DataPoint
                        label="Monthly"
                        value={fmt.currency(monthly)}
                        sub={`${m.type} · ${m.termYears} yr`}
                      />
                      <DataPoint
                        label="Rate"
                        value={`${m.rate.toFixed(2)}%`}
                        sub="Indicative"
                      />
                    </div>
                  </>
                );
              })()}

              <p className="text-[12px] leading-relaxed text-muted-foreground">
                {MORTGAGE_PERSONALISATION_NOTE}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {opp.mortgagePlanSummary}
            </p>
          )}
        </Section>

        <div className="h-6" />

        {/* Spacer so sticky CTA bar never overlaps last content */}
        <div className="h-44" />
      </div>

      {/* STICKY CTA — Contact Sales */}
      <StickyCta onContact={() => setContactOpen(true)} />

      {contactOpen && (
        <ContactAdvisorSheet
          opp={opp}
          onClose={() => setContactOpen(false)}
        />
      )}
    </AppShell>
  );
}

/* ---------- helpers (mirrored from PropertyDetail) ---------- */

function Section({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-7 animate-fade-up">
      {title && (
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <h3 className="font-serif text-xl tracking-tight">{title}</h3>
          </div>
        </div>
      )}
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
