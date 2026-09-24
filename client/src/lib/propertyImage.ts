// Local stills. Remote CloudFront URLs 404 in this prototype.
const LOCAL_BY_ID: Record<string, string> = {
  "JM-001": "/properties/mayfair.jpg",
  "JM-002": "/properties/deansgate.jpg",
  "JM-003": "/properties/hawthorn.jpg",
  "JM-004": "/properties/liverpool.jpg",
  "JM-PENNY": "/properties/penny-place.jpg",
};

const OPP_LOCAL_BY_ID: Record<string, string> = {
  "OPP-209": "/properties/deansgate.jpg",
  "OPP-184": "/properties/birchwood.jpg",
  "OPP-176": "/properties/mayfair.jpg",
};

export function propertyImageSrc(property: { id: string; image: string }) {
  return LOCAL_BY_ID[property.id] ?? property.image;
}

export function opportunityImageSrc(opportunity: { id: string; image: string }) {
  return OPP_LOCAL_BY_ID[opportunity.id] ?? opportunity.image;
}

const STILLS = [
  "/properties/mayfair.jpg",
  "/properties/deansgate.jpg",
  "/properties/hawthorn.jpg",
  "/properties/liverpool.jpg",
  "/properties/leeds.jpg",
  "/properties/birchwood.jpg",
];

function galleryFrom(primary: string) {
  const rest = STILLS.filter((src) => src !== primary);
  return [primary, rest[0], rest[1]].filter(Boolean);
}

export function propertyGallery(property: { id: string; image: string }) {
  const primary = propertyImageSrc(property);
  if (property.id === "JM-PENNY") return [primary];
  return galleryFrom(primary);
}

export function opportunityGallery(opportunity: { id: string; image: string }) {
  return galleryFrom(opportunityImageSrc(opportunity));
}
