import { useEffect, type RefObject } from "react";

/** Native horizontal rail: mouse wheel and click-drag both move the strip. */
export function useRailScroll(
  ref: RefObject<HTMLElement | null>,
  moved: RefObject<boolean>,
  enabled = true
) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    let active = false;
    let startX = 0;
    let startLeft = 0;

    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth + 1) return;
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (!delta) return;
      const atStart = el.scrollLeft <= 0 && delta < 0;
      const atEnd =
        el.scrollLeft + el.clientWidth >= el.scrollWidth - 1 && delta > 0;
      if (atStart || atEnd) return;
      e.preventDefault();
      el.scrollLeft += delta;
    };

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      active = true;
      startX = e.clientX;
      startLeft = el.scrollLeft;
      moved.current = false;
    };

    const onMove = (e: PointerEvent) => {
      if (!active) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) < 6) return;
      moved.current = true;
      el.setPointerCapture(e.pointerId);
      el.scrollLeft = startLeft - dx;
    };

    const onUp = () => {
      active = false;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
    };
  }, [ref, moved, enabled]);
}
