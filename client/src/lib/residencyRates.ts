// Indicative mortgage rates by residency band.
// Single source of truth for the calculator — replace with admin/API later.
// Do not scatter rate literals in UI components.

export const RESIDENCIES = [
  "GCC",
  "UK",
  "APAC",
  "Mainland Europe",
  "Africa",
] as const;

export type Residency = (typeof RESIDENCIES)[number];

/** Indicative annual mortgage rates (%). Editable later via admin. */
export const INDICATIVE_MORTGAGE_RATES: Record<Residency, number> = {
  GCC: 5.4,
  UK: 4.5,
  APAC: 5.49,
  "Mainland Europe": 5.49,
  Africa: 5.99,
};

export function getMortgageRate(residency: Residency): number {
  return INDICATIVE_MORTGAGE_RATES[residency];
}

/** Illustrative SDLT: UK 3%, all other residencies 5%. */
export function getSdltRate(residency: Residency): number {
  return residency === "UK" ? 0.03 : 0.05;
}
