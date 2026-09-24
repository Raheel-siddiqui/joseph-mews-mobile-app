// Joseph Mews — Portfolio List
// Same photo-card language as the dashboard holdings rail.
import { Link } from "wouter";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AdvisorBar } from "@/components/dashboard/AdvisorBar";
import { ContactAdvisorSheet } from "@/components/ContactAdvisorSheet";
import { fmt } from "@/lib/data";
import { propertyImageSrc } from "@/lib/propertyImage";
import {
  getActivePortfolio,
  getActiveProperties,
  isSingleHolding,
  propertyCountLabel,
} from "@/lib/holdings";
import { getActiveUser } from "@/lib/session";

export default function Portfolio() {
  const [contactOpen, setContactOpen] = useState(false);
  const properties = getActiveProperties();
  const portfolio = getActivePortfolio();
  const single = isSingleHolding();
  const user = getActiveUser();

  return (
    <AppShell>
      <div className="page-px">
        <header className="page-intro animate-fade-up">
          <p className="label-eyebrow">Holdings</p>
          <h1 className="page-intro__title">
            {single ? "Your Property" : "Portfolio"}
          </h1>
          <p className="page-intro__sub">
            {propertyCountLabel(portfolio.propertyCount)} ·{" "}
            {fmt.currency(portfolio.currentValue)}
          </p>
        </header>

        <div className="space-y-4">
          {properties.map((p, i) => (
            <Link
              key={p.id}
              href={`/property/${p.id}`}
              className="photo-card photo-card--caption tap press animate-fade-up"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <img
                src={propertyImageSrc(p)}
                alt={p.name}
                className="photo-card__img"
              />
              <span className="photo-card__shade" />
              {p.status === "Available" && (
                <span className="photo-card__chip chip chip--on-photo">
                  {p.status}
                </span>
              )}
              <span className="photo-card__meta">
                <span className="photo-card__kicker">{p.reference}</span>
                <span className="photo-card__name">{p.name}</span>
                <span className="photo-card__loc">
                  {[p.location, p.city].filter(Boolean).join(" · ")}
                </span>
                <span className="photo-card__figs">
                  <span>{fmt.currency(p.currentValue)}</span>
                  <span>
                    {p.monthlyRent > 0 ? `${fmt.currency(p.monthlyRent)}/mo` : "—"}
                  </span>
                  <span>
                    {p.grossYield > 0 ? fmt.pctPlain(p.grossYield) : "—"}
                  </span>
                </span>
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-8">
          {single && (
            <p className="label-eyebrow mb-3">
              Ready to grow beyond one holding?
            </p>
          )}
          <AdvisorBar
            name={user.advisor}
            title={user.advisorTitle}
            photo={user.advisorPhoto}
            onContact={() => setContactOpen(true)}
          />
        </div>
      </div>

      {contactOpen && (
        <ContactAdvisorSheet onClose={() => setContactOpen(false)} />
      )}
    </AppShell>
  );
}
