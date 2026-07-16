// Joseph Mews — shared "Speak with your advisor" contact sheet
import { useState } from "react";
import { ModalShell, SuccessState } from "@/components/ModalShell";
import { advisorEmail } from "@/lib/advisor";
import { investor } from "@/lib/data";
import type { Opportunity } from "@/lib/explore";
import { CalendarDays, Mail, Phone } from "lucide-react";

type ContactChannel = "schedule" | "callback" | "email";

const CONTACT_SUCCESS: Record<
  ContactChannel,
  { headline: string; body: string }
> = {
  schedule: {
    headline: "Call request received",
    body: `${investor.advisor} will offer times for a 20-minute consultation within one business day.`,
  },
  callback: {
    headline: "Callback requested",
    body: `${investor.advisor} will call you today between 9am and 6pm GMT.`,
  },
  email: {
    headline: "Email ready to send",
    body: `We've prepared a message to ${investor.advisor}. Check your inbox for a copy, or they will reply directly.`,
  },
};

export function ContactAdvisorSheet({
  opp,
  onClose,
}: {
  opp: Opportunity;
  onClose: () => void;
}) {
  const [submitted, setSubmitted] = useState<ContactChannel | null>(null);
  const email = advisorEmail();

  const handleChannel = (channel: ContactChannel) => {
    if (channel === "email") {
      const subject = encodeURIComponent(`Enquiry — ${opp.name}`);
      const body = encodeURIComponent(
        `Hello ${investor.advisor},\n\nI would like to discuss ${opp.name} (${opp.reference}), including pricing, payment plans and allocation timing.\n\nKind regards,\n${investor.firstName}`,
      );
      window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    }
    setSubmitted(channel);
  };

  const success = submitted ? CONTACT_SUCCESS[submitted] : null;

  return (
    <ModalShell onClose={onClose} title="Speak with your advisor">
      {!submitted || !success ? (
        <>
          <p className="text-[12.5px] text-muted-foreground leading-relaxed mb-6">
            Discuss <span className="text-foreground/85">{opp.name}</span> with
            your dedicated advisor — including pricing, payment plans and
            allocation timing.
          </p>

          <div className="rounded-sm border border-border px-4 py-4 mb-5">
            <p className="label-eyebrow mb-2">Your Advisor</p>
            <p className="font-serif text-lg leading-tight">{investor.advisor}</p>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              {investor.advisorTitle}
            </p>
          </div>

          <div className="space-y-2.5">
            <ContactAction
              icon={CalendarDays}
              label="Schedule a call"
              sub="Book a 20-min consultation"
              onClick={() => handleChannel("schedule")}
            />
            <ContactAction
              icon={Phone}
              label="Request a callback"
              sub="Today, between 9am – 6pm GMT"
              onClick={() => handleChannel("callback")}
            />
            <ContactAction
              icon={Mail}
              label={`Email ${investor.advisor.split(" ")[0]}`}
              sub={email}
              onClick={() => handleChannel("email")}
            />
          </div>

          <button
            onClick={onClose}
            className="tap w-full py-3 mt-6 text-[12px] tracking-[0.12em] uppercase text-muted-foreground active:text-foreground transition-colors"
          >
            Close
          </button>
        </>
      ) : (
        <SuccessState
          headline={success.headline}
          body={success.body}
          onClose={onClose}
        />
      )}
    </ModalShell>
  );
}

function ContactAction({
  icon: Icon,
  label,
  sub,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="tap press w-full flex items-center gap-3.5 px-4 py-3.5 rounded-sm border border-border active:bg-card/60 transition-colors text-left"
    >
      <div className="w-9 h-9 rounded-full border border-border flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium leading-snug">{label}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
      </div>
    </button>
  );
}
