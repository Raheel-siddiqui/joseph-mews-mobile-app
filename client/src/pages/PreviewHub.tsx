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
        <div className="pt-4 pb-7 animate-fade-up">
          <p className="label-eyebrow mb-2">Client review</p>
          <h1 className="font-serif text-2xl sm:text-3xl tracking-tight mb-3">
            Preview hub
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Compare loaded and empty journeys without changing the live demo.
            Open <span className="text-foreground/85">Loaded</span> for the
            signed-off experience, or{" "}
            <span className="text-foreground/85">Empty</span> for the empty-state
            screen.
          </p>
        </div>

        <div className="hairline mb-2" />

        <div className="divide-y divide-border">
          {JOURNEYS.map((j, i) => (
            <div
              key={j.name}
              className="py-6 animate-fade-up"
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

        <div className="mt-8 mb-10 px-4 py-4 border border-dashed border-border rounded-sm">
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
      className={`tap press inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-sm border text-[11px] tracking-[0.14em] uppercase min-h-[40px] transition-colors ${
        primary
          ? "border-primary/60 text-primary active:bg-primary/5"
          : "border-border text-muted-foreground active:text-foreground active:bg-card/60"
      }`}
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
