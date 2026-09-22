import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { useRailScroll } from "@/lib/useRailScroll";

export type BannerSlide = {
  id: string;
  href: string;
  image: string;
  loc: string;
  name: string;
  value?: string;
};

export function PropertyBanner({ slides }: { slides: BannerSlide[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const moved = useRef(false);
  const [index, setIndex] = useState(0);
  const count = slides.length;

  useRailScroll(scrollerRef, moved, count > 1);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const sync = () => {
      const width = el.clientWidth;
      if (width <= 0) return;
      setIndex(Math.round(el.scrollLeft / width));
    };
    el.addEventListener("scroll", sync, { passive: true });
    return () => el.removeEventListener("scroll", sync);
  }, []);

  if (count === 0) return null;

  const goTo = (i: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="dash-banner">
      <div
        ref={scrollerRef}
        className="dash-banner__scroller"
        role="region"
        aria-roledescription="carousel"
        aria-label="Featured properties"
      >
        {slides.map((slide) => (
          <Link
            key={slide.id}
            href={slide.href}
            className="dash-hero__still dash-banner__slide tap"
            aria-label={`${slide.name}, ${slide.loc}. Open property details`}
            onClick={(e) => {
              if (moved.current) e.preventDefault();
            }}
          >
            <img
              src={slide.image}
              alt=""
              className="dash-hero__still-img"
            />
            <span className="dash-hero__still-shade" aria-hidden />
            <span className="dash-hero__still-caption">
              <span className="dash-hero__still-loc">{slide.loc}</span>
              <span className="dash-hero__still-name">{slide.name}</span>
              {slide.value && (
                <span className="dash-hero__still-value">{slide.value}</span>
              )}
            </span>
          </Link>
        ))}
      </div>

      {count > 1 && (
        <div className="dash-banner__dots" role="tablist" aria-label="Property slides">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Show ${slide.name}`}
              className={`dash-banner__dot tap ${
                i === index ? "dash-banner__dot--on" : ""
              }`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
