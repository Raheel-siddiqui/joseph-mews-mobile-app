// Joseph Mews — enquiry capture (prototype store for admin Enquiries).
// Production would POST to CRM / admin; here we persist locally so the
// investor + area registration is retained for follow-up.

export type EnquiryType = "Coming Soon Registration";

export interface Enquiry {
  id: string;
  type: EnquiryType;
  investorName: string;
  investorEmail: string;
  areaId: string;
  areaName: string;
  city: string;
  createdAt: string;
}

const STORAGE_KEY = "jm.enquiries";

function canUseStorage() {
  return typeof localStorage !== "undefined";
}

function readAll(): Enquiry[] {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Enquiry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(items: Enquiry[]) {
  if (!canUseStorage()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function listEnquiries(): Enquiry[] {
  return readAll().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function hasComingSoonRegistration(
  areaId: string,
  investorEmail: string,
): boolean {
  const email = investorEmail.trim().toLowerCase();
  return readAll().some(
    (e) =>
      e.type === "Coming Soon Registration" &&
      e.areaId === areaId &&
      e.investorEmail.toLowerCase() === email,
  );
}

export function registerComingSoonInterest(input: {
  investorName: string;
  investorEmail: string;
  areaId: string;
  areaName: string;
  city: string;
}): Enquiry {
  const existing = readAll();
  const email = input.investorEmail.trim().toLowerCase();
  const already = existing.find(
    (e) =>
      e.type === "Coming Soon Registration" &&
      e.areaId === input.areaId &&
      e.investorEmail.toLowerCase() === email,
  );
  if (already) return already;

  const enquiry: Enquiry = {
    id: `ENQ-${Date.now()}`,
    type: "Coming Soon Registration",
    investorName: input.investorName,
    investorEmail: input.investorEmail,
    areaId: input.areaId,
    areaName: input.areaName,
    city: input.city,
    createdAt: new Date().toISOString(),
  };
  writeAll([enquiry, ...existing]);
  return enquiry;
}
