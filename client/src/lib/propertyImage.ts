// Local stills. Remote CloudFront URLs 404 in this prototype.
const LOCAL_BY_ID: Record<string, string> = {
  "JM-001": "/properties/mayfair.jpg",
  "JM-002": "/properties/deansgate.jpg",
  "JM-003": "/properties/hawthorn.jpg",
  "JM-004": "/properties/liverpool.jpg",
};

const OPP_LOCAL_BY_ID: Record<string, string> = {
  "OPP-209": "/properties/deansgate.jpg",
  "OPP-184": "/properties/birchwood.jpg",
  "OPP-221": "/properties/liverpool.jpg",
  "OPP-176": "/properties/mayfair.jpg",
  "OPP-152": "/properties/leeds.jpg",
};

export function propertyImageSrc(property: { id: string; image: string }) {
  return LOCAL_BY_ID[property.id] ?? property.image;
}

export function opportunityImageSrc(opportunity: { id: string; image: string }) {
  return OPP_LOCAL_BY_ID[opportunity.id] ?? opportunity.image;
}
