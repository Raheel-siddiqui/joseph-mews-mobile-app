// Joseph Mews — shared "Speak with your advisor" contact sheet
import { useState } from "react";
import { ModalShell, SuccessState } from "@/components/ModalShell";
import { advisorEmail } from "@/lib/advisor";
import { getActiveUser } from "@/lib/session";
import type { Opportunity } from "@/lib/explore";
import { CalendarDays, Mail, MessageCircle, Phone } from "lucide-react";

const ADVISOR_WHATSAPP = "03127766363";

type ContactChannel = "schedule" | "callback" | "email" | "whatsapp";

export function ContactAdvisorSheet({
  opp,
  onClose,
}: {
  opp?: Opportunity;
  onClose: () => void;
}) {
  const user = getActiveUser();
  const advisorName = user.advisor;
  const advisorTitle = user.advisorTitle;
  const advisorMail = advisorEmail();
  const [submitted, setSubmitted] = useState<ContactChannel | null>(null);

  const contactSuccess: Record<
    ContactChannel,
    { headline: string; body: string }
  > = {
    schedule: {
      headline: "Call request received",
      body: `${advisorName} will offer times for a 20-minute consultation within one business day.`,
    },
    callback: {
      headline: "Callback requested",
      body: `${advisorName} will call you today, 9am – 6pm · Karachi · UTC.`,
    },
    email: {
      headline: "Email ready to send",
      body: `We've prepared a message to ${advisorName}. Check your inbox for a copy, or they will reply directly.`,
    },
    whatsapp: {
      headline: "WhatsApp ready",
      body: `A chat with ${advisorName} is ready on ${ADVISOR_WHATSAPP}.`,
    },
  };

  const handleChannel = (channel: ContactChannel) => {
    if (channel === "email") {
      const subject = encodeURIComponent(
        opp ? `Enquiry — ${opp.name}` : `Schedule a call — ${user.firstName}`,
      );
      const body = encodeURIComponent(
        `Hello ${advisorName},\n\nI would like to discuss my portfolio.\n\nKind regards,\n${user.firstName}`,
      );
      window.location.href = `mailto:${advisorMail}?subject=${subject}&body=${body}`;
    }
    if (channel === "whatsapp") {
      window.open(`https://wa.me/92${ADVISOR_WHATSAPP.slice(1)}`, "_blank");
    }
    setSubmitted(channel);
  };

  const success = submitted ? contactSuccess[submitted] : null;

  return (
    <ModalShell onClose={onClose} title="Speak with your advisor">
      {!submitted || !success ? (
        <>
          <p className="text-[12.5px] text-muted-foreground leading-relaxed mb-6">
            Speak with your dedicated advisor about your portfolio — including
            performance, next steps and new opportunities.
          </p>

          <div className="rounded-lg border border-border px-4 py-4 mb-5">
            <p className="label-eyebrow mb-2">Your advisor</p>
            <p className="font-serif text-lg leading-tight">{advisorName}</p>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              {advisorTitle}
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
              sub="Today, 9am – 6pm · Karachi · UTC"
              onClick={() => handleChannel("callback")}
            />
            <ContactAction
              icon={Mail}
              label={`Email ${advisorName.split(" ")[0]}`}
              sub={advisorMail}
              onClick={() => handleChannel("email")}
            />
            <ContactAction
              icon={MessageCircle}
              label="WhatsApp"
              sub={ADVISOR_WHATSAPP}
              onClick={() => handleChannel("whatsapp")}
            />
          </div>

          <button
            onClick={onClose}
            className="btn-quiet w-full mt-6"
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
      className="tap press glass glass--pad w-full flex items-center gap-3.5 text-left"
    >
      <span className="icon-well w-9 h-9">
        <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium leading-snug">{label}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
      </div>
    </button>
  );
}
