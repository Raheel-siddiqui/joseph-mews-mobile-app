// Joseph Mews — Project (Opportunity) Detail
// Mirrors the rhythm of PropertyDetail: hero, title, sectioned content,
// ending with a Contact Sales sticky CTA.
import { Link, useRoute } from "wouter";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ContactAdvisorSheet } from "@/components/ContactAdvisorSheet";
import { getOpportunity, type OpportunityStatus } from "@/lib/explore";
import { fmt } from "@/lib/data";
import { opportunityGallery } from "@/lib/propertyImage";
import { PhotoRail } from "@/components/PhotoRail";
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
  ChevronRight,
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

  return (
    <AppShell backTo="/explore" showNav={false}>
      <div className="page-px">
        {/* Hero image */}
        <div className="mt-3 mb-4 animate-fade-up">
          <PhotoRail
            images={opportunityGallery(opp)}
            label={opp.name}
            status={
              opp.status === "Available" ? (
                <StatusPill status={opp.status} />
              ) : undefined
            }
          />
          <div className="mt-3">
            <p className="label-eyebrow">{opp.reference}</p>
            <h1 className="page-intro__title">{opp.name}</h1>
            <p className="page-intro__sub">
              {opp.developer} · {opp.city}, {opp.region}
            </p>
          </div>
        </div>

        <p
          className="text-[13px] leading-relaxed text-foreground/80 mb-6 animate-fade-up"
          style={{ animationDelay: "60ms" }}
        >
          {opp.tagline}
        </p>

        {/* SECTION 1: AT A GLANCE */}
        <Section>
          <div className="pd-value mb-4">
            <p className="label-eyebrow pd-value__label">Starting Price</p>
            <h2 className="pd-value__amount">{fmt.currency(opp.fromPrice)}</h2>
            <p className="inline-flex items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-1 text-positive tabular-nums">
                <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.75} />
                +{opp.capitalGrowth5Y.toFixed(0)}%
              </span>
              <span className="text-muted-foreground">
                · expected capital growth (forecast)
              </span>
            </p>
          </div>

          <div className="glass stat-grid">
            <DataPoint label="Gross Yield" value={`${opp.grossYield.toFixed(1)}%`} sub="Estimated" />
            <DataPoint label="Completion" value={opp.expectedCompletion} sub={opp.tenure} />
            <DataPoint
              label="Available Units"
              value={`${opp.unitsAvailable}`}
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
          hasMortgage={opp.illustrativeMortgage != null}
          mortgageRate={opp.illustrativeMortgage?.rate}
        />

        <Divider />

        {/* HIGHLIGHTS */}
        <Section title="Why This Opportunity">
          <ul className="glass-list">
            {opp.highlights.map((h, i) => (
              <li
                key={i}
                className="flex items-start gap-3 py-3.5 animate-fade-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span className="dash-ins__mark mt-1.5" />
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
          <div className="glass-list">
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

        <Section title="Payment Plan">
          <p className="label-eyebrow mb-1.5">Developer payment schedule</p>
          <p className="text-[12px] text-muted-foreground mb-6">
            Developer staged schedule based on starting price{" "}
            {fmt.currency(opp.fromPrice)}
          </p>
          <div className="glass-list">
            {[
              { label: "Reservation Fee", when: "Now", percent: 1 },
              { label: "Exchange Deposit", when: "On exchange", percent: 19 },
            ].map((stage) => (
              <div
                key={stage.label}
                className="flex items-start justify-between gap-4 py-3.5"
              >
                <div>
                  <p className="text-sm">{stage.label}</p>
                  <p className="text-[12px] text-muted-foreground mt-0.5">
                    {stage.when}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm tabular-nums">
                    {fmt.currency(
                      Math.round((opp.fromPrice * stage.percent) / 100)
                    )}
                  </p>
                  <p className="text-[12px] text-muted-foreground mt-0.5 tabular-nums">
                    {stage.percent}%
                  </p>
                </div>
              </div>
            ))}
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
                    <div className="glass stat-grid mb-7">
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

        <Divider />

        <Section title="Updates">
          <Link
            href={`/explore/${opp.id}/content`}
            className="glass glass--pad flex items-center gap-3"
          >
            <img
              src={opportunityGallery(opp)[0]}
              alt=""
              className="h-14 w-14 shrink-0 rounded-md object-cover"
            />
            <span className="min-w-0 flex-1">
              <span className="block font-serif text-lg leading-tight">
                {opp.name}
              </span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Link>
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
    <section className="mb-10 animate-fade-up">
      {title && <h3 className="section-kicker">{title}</h3>}
      {children}
    </section>
  );
}

function Divider() {
  return null;
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
  const tone =
    status === "Available"
      ? "chip chip--gold chip--on-photo"
      : status === "Coming Soon"
        ? "chip chip--warn chip--on-photo"
        : "chip chip--muted chip--on-photo";

  return <span className={tone}>{status}</span>;
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
    <div className="flex items-center gap-4 py-3.5">
      <span className="icon-well">
        <Icon className="w-4 h-4" strokeWidth={1.5} />
      </span>
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
    <div className="sticky-cta">
      <button onClick={onContact} className="tap press btn-gold">
        <Phone className="w-3.5 h-3.5" strokeWidth={1.75} />
        Contact Sales
      </button>
      <p className="text-[10.5px] text-muted-foreground/75 text-center mt-2 leading-snug">
        Your advisor will handle next steps
      </p>
    </div>
  );
}
