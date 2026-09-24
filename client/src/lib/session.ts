// Joseph Mews — demo session (email → investor / single-holding / prospect)
import { investor } from "@/lib/data";

export type Persona = "investor" | "single" | "prospect";

export const INVESTOR_EMAIL = "alexander.whitfield@example.com";
/** Demo email for the single-property investor journey. */
export const SINGLE_EMAIL = "charlotte.ashford@example.com";
/** Demo email for the non-investor (discovery) journey. */
export const PROSPECT_EMAIL = "oliver.hartley@example.com";

const PERSONA_KEY = "jm_persona";
const EMAIL_KEY = "jm_email";
const NAME_KEY = "jm_name";
const PHOTO_KEY = "jm_photo";

function photoKey(email: string) {
  return `${PHOTO_KEY}:${email.trim().toLowerCase()}`;
}

export function readProfilePhoto(email: string): string | null {
  try {
    return localStorage.getItem(photoKey(email));
  } catch {
    return null;
  }
}

export function saveProfilePhoto(email: string, dataUrl: string) {
  localStorage.setItem(photoKey(email), dataUrl);
}

function withStoredPhoto<T extends { email: string; photo?: string }>(user: T): T {
  const stored = readProfilePhoto(user.email);
  return stored ? { ...user, photo: stored } : user;
}

export const prospect = {
  name: "Oliver Hartley",
  firstName: "Oliver",
  email: PROSPECT_EMAIL,
  memberSince: "—",
  tier: "Guest",
  photo: undefined as string | undefined,
  advisor: investor.advisor,
  advisorTitle: investor.advisorTitle,
  advisorPhoto: investor.advisorPhoto,
};

export const singleInvestor = {
  name: "Charlotte Ashford",
  firstName: "Charlotte",
  email: SINGLE_EMAIL,
  memberSince: "March 2022",
  tier: "Silver",
  photo: "/people/charlotte.jpg",
  advisor: investor.advisor,
  advisorTitle: investor.advisorTitle,
  advisorPhoto: investor.advisorPhoto,
};

export type ActiveUser =
  | typeof investor
  | typeof singleInvestor
  | typeof prospect;

export function resolvePersona(email: string): Persona {
  const normalised = email.trim().toLowerCase();
  if (normalised === INVESTOR_EMAIL) return "investor";
  if (normalised === SINGLE_EMAIL) return "single";
  return "prospect";
}

function canUseSession(): boolean {
  return typeof sessionStorage !== "undefined";
}

export function setSession(email: string, name?: string): Persona {
  const persona = resolvePersona(email);
  const normalised = email.trim().toLowerCase();
  if (canUseSession()) {
    sessionStorage.setItem(PERSONA_KEY, persona);
    sessionStorage.setItem(EMAIL_KEY, normalised);
    if (name?.trim()) sessionStorage.setItem(NAME_KEY, name.trim());
    else sessionStorage.removeItem(NAME_KEY);
  }
  return persona;
}

export function clearSession() {
  if (!canUseSession()) return;
  sessionStorage.removeItem(PERSONA_KEY);
  sessionStorage.removeItem(EMAIL_KEY);
  sessionStorage.removeItem(NAME_KEY);
}

export function getPersona(): Persona {
  if (!canUseSession()) return "investor";
  const stored = sessionStorage.getItem(PERSONA_KEY);
  if (stored === "investor" || stored === "single" || stored === "prospect") {
    return stored;
  }
  return "investor";
}

export function getSessionEmail(): string | null {
  if (!canUseSession()) return null;
  return sessionStorage.getItem(EMAIL_KEY);
}

export function isInvestor(): boolean {
  const persona = getPersona();
  return persona === "investor" || persona === "single";
}

export function getActiveUser(): ActiveUser {
  const persona = getPersona();
  if (persona === "investor") return withStoredPhoto(investor);
  if (persona === "single") return withStoredPhoto(singleInvestor);
  const email = getSessionEmail();
  const storedName = canUseSession() ? sessionStorage.getItem(NAME_KEY) : null;
  const named = storedName
    ? {
        name: storedName,
        firstName: storedName.split(" ")[0] || storedName,
      }
    : {};
  const user = email
    ? { ...prospect, email, ...named }
    : { ...prospect, ...named };
  return withStoredPhoto(user);
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
  return persona === "prospect" ? "/explore" : "/dashboard";
}
