// Joseph Mews — demo session (email → investor vs non-investor journey)
import { investor } from "@/lib/data";

export type Persona = "investor" | "prospect";

export const INVESTOR_EMAIL = "alexander.whitfield@example.com";
/** Demo email for the non-investor (discovery) journey. */
export const PROSPECT_EMAIL = "oliver.hartley@example.com";

const PERSONA_KEY = "jm_persona";
const EMAIL_KEY = "jm_email";

export const prospect = {
  name: "Oliver Hartley",
  firstName: "Oliver",
  email: PROSPECT_EMAIL,
  memberSince: "—",
  tier: "Guest",
  advisor: investor.advisor,
  advisorTitle: investor.advisorTitle,
};

export type ActiveUser = typeof investor | typeof prospect;

export function resolvePersona(email: string): Persona {
  return email.trim().toLowerCase() === INVESTOR_EMAIL
    ? "investor"
    : "prospect";
}

function canUseSession(): boolean {
  return typeof sessionStorage !== "undefined";
}

export function setSession(email: string): Persona {
  const persona = resolvePersona(email);
  const normalised = email.trim().toLowerCase();
  if (canUseSession()) {
    sessionStorage.setItem(PERSONA_KEY, persona);
    sessionStorage.setItem(EMAIL_KEY, normalised);
  }
  return persona;
}

export function clearSession() {
  if (!canUseSession()) return;
  sessionStorage.removeItem(PERSONA_KEY);
  sessionStorage.removeItem(EMAIL_KEY);
}

export function getPersona(): Persona {
  if (!canUseSession()) return "investor";
  const stored = sessionStorage.getItem(PERSONA_KEY);
  if (stored === "investor" || stored === "prospect") return stored;
  return "investor";
}

export function getSessionEmail(): string | null {
  if (!canUseSession()) return null;
  return sessionStorage.getItem(EMAIL_KEY);
}

export function isInvestor(): boolean {
  return getPersona() === "investor";
}

export function getActiveUser(): ActiveUser {
  if (isInvestor()) return investor;
  const email = getSessionEmail();
  return email ? { ...prospect, email } : prospect;
}

export function userInitials(user: ActiveUser = getActiveUser()): string {
  return user.name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function homePathForPersona(persona: Persona = getPersona()): string {
  return persona === "investor" ? "/dashboard" : "/explore";
}
