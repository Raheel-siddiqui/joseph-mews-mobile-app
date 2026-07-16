// Joseph Mews — advisor contact helpers (shared across journeys)
import { investor } from "@/lib/data";

export function advisorEmail(): string {
  const domain = investor.email.split("@")[1] || "example.com";
  return `advisor@${domain}`;
}

/** Open device mail with a pre-filled advisor message. */
export function openAdvisorMail(opts?: {
  subject?: string;
  body?: string;
}) {
  const subject = encodeURIComponent(
    opts?.subject ?? `Enquiry — Joseph Mews`
  );
  const body = encodeURIComponent(
    opts?.body ??
      `Hello ${investor.advisor},\n\nI would like to discuss my portfolio.\n\nKind regards,\n${investor.firstName}`
  );
  window.location.href = `mailto:${advisorEmail()}?subject=${subject}&body=${body}`;
}
