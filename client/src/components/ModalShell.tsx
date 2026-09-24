// Joseph Mews — shared bottom sheet (Private Banking modal pattern)
import { X, Check } from "lucide-react";
import { ReactNode, useEffect } from "react";

export function ModalShell({
  onClose,
  title,
  children,
}: {
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.dataset.modal = String(
      Number(document.body.dataset.modal ?? 0) + 1
    );
    return () => {
      document.body.style.overflow = prev;
      const next = Number(document.body.dataset.modal ?? 1) - 1;
      if (next <= 0) delete document.body.dataset.modal;
      else document.body.dataset.modal = String(next);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-black/65 backdrop-blur-sm animate-fade-up"
        style={{ animationDuration: "200ms" }}
        onClick={onClose}
      />
      <div
        className="sheet-panel page-px animate-fade-up"
        style={{ animationDuration: "260ms" }}
      >
        <div className="flex justify-center mb-4">
          <span className="w-10 h-1 rounded-full bg-border" />
        </div>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-serif text-lg leading-tight pr-4">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="tap w-9 h-9 -mr-2 rounded-full flex items-center justify-center text-muted-foreground active:text-foreground transition-colors shrink-0"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function SuccessState({
  headline,
  body,
  onClose,
}: {
  headline: string;
  body: string;
  onClose: () => void;
}) {
  return (
    <div className="text-center py-3">
      <div className="icon-well w-12 h-12 rounded-full mx-auto mb-5">
        <Check className="w-5 h-5 text-primary" strokeWidth={1.75} />
      </div>
      <h4 className="font-serif text-lg leading-tight mb-2">{headline}</h4>
      <p className="text-[12.5px] text-muted-foreground leading-relaxed max-w-[280px] mx-auto mb-6">
        {body}
      </p>
      <button
        onClick={onClose}
        className="tap press btn-gold"
      >
        Done
      </button>
    </div>
  );
}
