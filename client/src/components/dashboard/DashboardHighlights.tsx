import { Link } from "wouter";
import { Building2 } from "lucide-react";
import { fmt } from "@/lib/data";
import { propertyImageSrc } from "@/lib/propertyImage";
import type { PortfolioIntelligence } from "@/lib/intelligence";

function relativeFill(value: number, peer: number): number | undefined {
  const top = Math.max(value, peer);
  if (top <= 0) return undefined;
  return Math.min(1, value / top);
}

export function DashboardHighlights({
  intelligence,
}: {
  intelligence: PortfolioIntelligence;
}) {
  const best = intelligence.bestPerformer;
  const highest = intelligence.highestYield;
  const avg = intelligence.avgGrossYield;

  const rows: {
    key: string;
    label: string;
    name: string;
    value: string;
    fill?: number;
    href?: string;
    thumb?: string;
  }[] = [];

  if (best) {
    rows.push({
      key: "best",
      label: "Best Performer",
      name: best.name,
      value: fmt.pct(best.capitalGrowthPct),
      fill: relativeFill(
        best.capitalGrowthPct,
        intelligence.avgCapitalGrowthPct
      ),
      href: `/property/${best.id}`,
      thumb: propertyImageSrc(best),
    });
  }
  if (highest) {
    rows.push({
      key: "highest-yield",
      label: "Highest Gross Yield",
      name: highest.name,
      value: fmt.pctPlain(highest.grossYield),
      fill: relativeFill(highest.grossYield, avg),
      href: `/property/${highest.id}`,
      thumb: propertyImageSrc(highest),
    });
  }
  if (avg > 0) {
    rows.push({
      key: "avg-yield",
      label: "Average Gross Yield",
      name: "Across all properties",
      value: fmt.pctPlain(avg),
      fill: highest
        ? relativeFill(avg, highest.grossYield)
        : relativeFill(avg, avg),
    });
  }

  if (!rows.length) return null;

  return (
    <section
      className="dash-hl animate-fade-up"
      style={{ animationDelay: "210ms" }}
      aria-label="Highlights"
    >
      <p className="label-eyebrow">Highlights</p>
      <div className="dash-hl__list">
        {rows.slice(0, 3).map((row) =>
          row.href ? (
            <Link
              key={row.key}
              href={row.href}
              className="dash-hl__item dash-hl__item--link tap"
            >
              <HighlightCopy
                label={row.label}
                name={row.name}
                thumb={row.thumb}
              />
              <HighlightFig value={row.value} fill={row.fill} />
            </Link>
          ) : (
            <div key={row.key} className="dash-hl__item">
              <HighlightCopy
                label={row.label}
                name={row.name}
                thumb={row.thumb}
              />
              <HighlightFig value={row.value} fill={row.fill} />
            </div>
          )
        )}
      </div>
    </section>
  );
}

function HighlightCopy({
  label,
  name,
  thumb,
}: {
  label: string;
  name: string;
  thumb?: string;
}) {
  return (
    <div className="dash-hl__copy">
      {thumb ? (
        <img src={thumb} alt="" className="dash-hl__thumb" />
      ) : (
        <span className="dash-hl__thumb dash-hl__thumb--icon" aria-hidden>
          <Building2 className="w-3.5 h-3.5" strokeWidth={1.6} />
        </span>
      )}
      <div className="min-w-0">
        <p className="dash-hl__label">{label}</p>
        <p className="dash-hl__name">{name}</p>
      </div>
    </div>
  );
}

function HighlightFig({
  value,
  fill,
}: {
  value: string;
  fill?: number;
}) {
  return (
    <div className="dash-hl__fig">
      <p className="dash-hl__metric">{value}</p>
      {fill != null && (
        <span className="dash-hl__track" aria-hidden>
          <span style={{ width: `${Math.round(fill * 100)}%` }} />
        </span>
      )}
    </div>
  );
}
