import { useRef } from "react";
import { Link } from "wouter";
import { fmt, type Property } from "@/lib/data";
import { propertyImageSrc } from "@/lib/propertyImage";
import { propertyCountLabel } from "@/lib/holdings";
import { useRailScroll } from "@/lib/useRailScroll";

export function HoldingsRail({
  properties,
  single,
  soleId,
  count,
}: {
  properties: Property[];
  single: boolean;
  soleId?: string;
  count: number;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const moved = useRef(false);
  useRailScroll(scrollerRef, moved, properties.length > 1);

  if (!properties.length) return null;

  const allHref = single && soleId ? `/property/${soleId}` : "/portfolio";

  return (
    <section
      className="dash-hold animate-fade-up"
      style={{ animationDelay: "240ms" }}
      aria-label="Holdings"
    >
      <div className="dash-hold__head">
        <div>
          <p className="label-eyebrow">Holdings</p>
          <p className="dash-hold__count">{propertyCountLabel(count)}</p>
        </div>
        <Link href={allHref} className="dash-hold__all tap">
          {single ? "View details" : "View all"}
        </Link>
      </div>

      <div ref={scrollerRef} className="dash-hold__scroller">
        {properties.map((p) => (
          <Link
            key={p.id}
            href={`/property/${p.id}`}
            className="dash-hold__card tap press"
            onClick={(e) => {
              if (moved.current) e.preventDefault();
            }}
          >
            <img
              src={propertyImageSrc(p)}
              alt={p.name}
              className="dash-hold__photo"
            />
            <div className="dash-hold__shade" />
            <div className="dash-hold__meta">
              {p.status === "Available" && (
                <p className="dash-hold__status">{p.status}</p>
              )}
              <p className="dash-hold__loc">{p.location}</p>
              <h3 className="dash-hold__name">{p.name}</h3>
              <p className="dash-hold__figs">
                <span>{fmt.currency(p.currentValue)}</span>
                {p.monthlyRent > 0 && (
                  <span>{fmt.currency(p.monthlyRent)}/mo</span>
                )}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
