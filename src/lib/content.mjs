export const sectionTypes = [
  "hero",
  "intro",
  "categories",
  "featured",
  "story",
  "service",
  "location",
  "cta",
];
export const themes = ["navy", "gold", "blue"];
export const ordered = (items) => [...items].sort((a, b) => a.order - b.order);
export const visibleSections = (sections) =>
  ordered(sections.filter((section) => section.enabled));
export function localUrl(value, base = "/") {
  if (!value) return "";
  if (/^(https?:|mailto:|tel:|#)/i.test(value)) return value;
  return `${base.replace(/\/$/, "")}/${value.replace(/^\/+/, "")}`;
}
export function isSquareReady(value) {
  return /^https:\/\//i.test(value || "") && !value.includes("[");
}
export function validateContent(business, homepage, food) {
  const errors = [];
  if (!business.name?.trim()) errors.push("Business name is required.");
  if (
    business.squareUrl !== "[SQUARE_ORDERING_URL]" &&
    !isSquareReady(business.squareUrl)
  )
    errors.push(
      "Square URL must be a full HTTPS URL or [SQUARE_ORDERING_URL].",
    );
  const ids = new Set();
  for (const section of homepage.sections) {
    if (!/^[a-z][a-z0-9-]*$/.test(section.id) || ids.has(section.id))
      errors.push(
        `Section ID must be unique and use lowercase letters/hyphens: ${section.id}`,
      );
    ids.add(section.id);
    if (!sectionTypes.includes(section.type))
      errors.push(`Unknown section type: ${section.type}`);
    if (!themes.includes(section.theme))
      errors.push(`Unknown theme: ${section.theme}`);
    if (typeof section.enabled !== "boolean" || !Number.isFinite(section.order))
      errors.push(`Invalid visibility/order: ${section.id}`);
    if (!section.heading?.trim())
      errors.push(`Heading required: ${section.id}`);
    if (section.image && !section.imageAlt?.trim())
      errors.push(`Image description required: ${section.id}`);
    if (
      section.buttonUrl &&
      !/^(square$|https:\/\/|\/[^/]|#[a-z]|mailto:|tel:)/i.test(
        section.buttonUrl,
      )
    )
      errors.push(`Unsafe button URL: ${section.id}`);
  }
  for (const category of food.categories) {
    if (!category.name?.trim() || !Number.isFinite(category.order))
      errors.push("Food category requires a name and numeric order.");
    if (category.image && !category.imageAlt?.trim())
      errors.push(`Image description required: ${category.name}`);
    if (category.squareUrl && !isSquareReady(category.squareUrl))
      errors.push(`Food ordering URL must use HTTPS: ${category.name}`);
  }
  for (const social of business.socialLinks)
    if (!social.label || !/^https:\/\//.test(social.url))
      errors.push("Social links require a label and HTTPS URL.");
  for (const section of visibleSections(homepage.sections)) {
    if (
      section.buttonUrl?.startsWith("#") &&
      !visibleSections(homepage.sections).some(
        (s) => `#${s.id}` === section.buttonUrl,
      ) &&
      section.buttonUrl !== "#ordering"
    )
      errors.push(`Button points to a hidden/missing section: ${section.id}`);
  }
  return errors;
}
