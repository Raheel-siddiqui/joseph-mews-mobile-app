// Joseph Mews — Client Preview Hub
// Side-by-side links for Loaded vs Empty (and Partial) journey review.
// Not in investor bottom nav — open /preview during demos.
import { Link } from "wouter";
import { AppShell } from "@/components/AppShell";
import { ArrowRight, ArrowUpRight } from "lucide-react";

type Journey = {
  name: string;
  description: string;
  loaded: string;
  empty: string;
  partial?: string;
};

const JOURNEYS: Journey[] = [
  {
    name: "Dashboard",
    description: "Portfolio overview and KPIs",
    loaded: "/dashboard",
    empty: "/preview/dashboard",
    partial: "/preview/dashboard-partial",
  },
  {
    name: "Portfolio",
    description: "Property holdings list",
    loaded: "/portfolio",
    empty: "/preview/portfolio",
  },
  {
    name: "Documents",
    description: "Document vault library",
    loaded: "/documents",
    empty: "/preview/documents",
  },
  {
    name: "Explore",
    description: "Opportunity catalogue",
    loaded: "/explore",
    empty: "/preview/explore",
  },
  {
    name: "Calculator",
    description: "Goal-led investment plan",
    loaded: "/calculator",
    empty: "/preview/calculator",
  },
];

export default function PreviewHub() {
  return (
    <AppShell showNav={false} backTo="/dashboard" title="Preview">
      <div className="page-px">
        <header className="page-intro animate-fade-up">
          <p className="label-eyebrow">Client review</p>
          <h1 className="page-intro__title">Preview hub</h1>
          <p className="page-intro__sub">
            Compare loaded and empty journeys without changing the live demo.
            Open Loaded for the signed-off experience, or Empty for the
            empty-state screen.
          </p>
        </header>

        <div className="glass-list">
          {JOURNEYS.map((j, i) => (
            <div
              key={j.name}
              className="py-4 animate-fade-up"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="mb-4">
                <h2 className="font-serif text-lg tracking-tight mb-1">
                  {j.name}
                </h2>
                <p className="text-xs text-muted-foreground">{j.description}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <StateLink href={j.loaded} label="Loaded" primary />
                <StateLink href={j.empty} label="Empty" />
                {j.partial && (
                  <StateLink href={j.partial} label="Partial" />
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="glass glass--pad mt-6 mb-10">
          <p className="text-[12.5px] text-muted-foreground leading-relaxed">
            Tip: Empty screens show a{" "}
            <span className="text-primary">Preview · Empty</span> chip so they
            are never confused with a live broken account. This hub is not in
            the investor bottom navigation.
          </p>
        </div>
      </div>
    </AppShell>
  );
}

function StateLink({
  href,
  label,
  primary,
}: {
  href: string;
  label: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`tap press pill ${primary ? "pill--on" : ""}`}
    >
      {label}
      {primary ? (
        <ArrowUpRight className="w-3 h-3" strokeWidth={1.5} />
      ) : (
        <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
      )}
    </Link>
  );
}
