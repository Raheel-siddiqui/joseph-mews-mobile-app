// Shared chrome for Preview empty / partial screens — matches product tokens only.
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { investor } from "@/lib/data";
import { openAdvisorMail } from "@/lib/advisor";

export function PreviewChip({ label = "Preview · Empty" }: { label?: string }) {
  return (
    <p className="label-eyebrow mb-3 text-primary/90">
      {label}
    </p>
  );
}

export function AdvisorCta() {
  return (
    <div className="glass glass--pad mt-10">
      <p className="label-eyebrow mb-3">Your Advisor</p>
      <p className="font-serif text-base mb-1">{investor.advisor}</p>
      <p className="text-xs text-muted-foreground mb-2">
        {investor.advisorTitle}
      </p>
      <button
        type="button"
        onClick={() =>
          openAdvisorMail({
            subject: `Enquiry — ${investor.firstName}`,
            body: `Hello ${investor.advisor},\n\nI would like to discuss my portfolio.\n\nKind regards,\n${investor.firstName}`,
          })
        }
        className="btn-quiet"
      >
        Contact advisor
        <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
      </button>
    </div>
  );
}

export function EmptyCentre({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="glass glass--pad py-12 text-center">
      <p className="label-eyebrow mb-3">{eyebrow}</p>
      <h2 className="font-serif text-xl tracking-tight mb-3">{title}</h2>
      <p className="text-sm text-muted-foreground leading-relaxed max-w-[300px] mx-auto">
        {body}
      </p>
    </div>
  );
}

export function DashMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[10px] tracking-[0.16em] uppercase text-muted-foreground mb-1">
        {label}
      </p>
      <p className="font-serif text-lg tabular-nums text-muted-foreground/80">
        {value}
      </p>
    </div>
  );
}

export function BackToHub() {
  return (
    <Link
      href="/preview"
      className="tap text-[11px] tracking-[0.14em] uppercase text-muted-foreground active:text-foreground transition-colors inline-flex items-center gap-1 mb-4"
    >
      ← Preview hub
    </Link>
  );
}
