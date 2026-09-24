import { ReactNode, useEffect, useRef, useState } from "react";
import { useRailScroll } from "@/lib/useRailScroll";

export function PhotoRail({
  images,
  label,
  status,
}: {
  images: string[];
  label: string;
  status?: ReactNode;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const moved = useRef(false);
  const [index, setIndex] = useState(0);
  const count = images.length;

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
    <div>
      <div className="photo-rail">
        <div
          ref={scrollerRef}
          className="photo-rail__scroller"
          role="region"
          aria-roledescription="carousel"
          aria-label={`Photos of ${label}`}
        >
          {images.map((src, i) => (
            <div key={`${src}-${i}`} className="photo-rail__slide">
              <img
                src={src}
                alt={i === 0 ? label : `${label}, photo ${i + 1} of ${count}`}
              />
            </div>
          ))}
        </div>
        {status && <div className="photo-rail__chip">{status}</div>}
      </div>
      {count > 1 && (
        <div className="dash-banner__dots" role="tablist" aria-label="Photos">
          {images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Photo ${i + 1} of ${count}`}
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
