// Joseph Mews — advisor contact helpers (shared across journeys)
import { getActiveUser } from "@/lib/session";

export function advisorEmail(): string {
  const user = getActiveUser();
  const domain = user.email.split("@")[1] || "example.com";
  return `advisor@${domain}`;
}

/** Open device mail with a pre-filled advisor message. */
export function openAdvisorMail(opts?: {
  subject?: string;
  body?: string;
}) {
  const user = getActiveUser();
  const subject = encodeURIComponent(
    opts?.subject ?? `Enquiry — Joseph Mews`
  );
  const body = encodeURIComponent(
    opts?.body ??
      `Hello ${user.advisor},\n\nI would like to discuss my portfolio.\n\nKind regards,\n${user.firstName}`
  );
  window.location.href = `mailto:${advisorEmail()}?subject=${subject}&body=${body}`;
}
