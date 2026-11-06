// Pages CMS can omit blank fields or store them as null. Normalize at the
// boundary so templates never depend on the current JSON file's inferred shape.

/** @typedef {{label: string, url: string}} SocialLink */
/** @typedef {{name: string, logo: string, logoAlt: string, squareUrl: string, phone: string, email: string, socialLinks: SocialLink[], openingHours: string, pickupInfo: string, deliveryInfo: string, locationText: string, footerText: string, pageTitle: string, description: string, socialImage: string, draftNotice: string}} Business */
/** @typedef {{id: string, enabled: boolean, order: number, type: string, label: string, heading: string, body: string, image: string, imageAlt: string, buttonLabel: string, buttonUrl: string, theme: string}} Section */
/** @typedef {{name: string, description: string, image: string, imageAlt: string, squareUrl: string, featured: boolean, order: number}} FoodCategory */
/** @template T @typedef {{[K in keyof T]?: T[K] | null}} CmsInput */

/** @param {CmsInput<Business>} [input] @returns {Business} */
export function normalizeBusiness(input = {}) {
  return {
    name: input.name ?? '',
    logo: input.logo ?? '',
    logoAlt: input.logoAlt ?? '',
    squareUrl: input.squareUrl ?? '',
    phone: input.phone ?? '',
    email: input.email ?? '',
    socialLinks: input.socialLinks ?? [],
    openingHours: input.openingHours ?? '',
    pickupInfo: input.pickupInfo ?? '',
    deliveryInfo: input.deliveryInfo ?? '',
    locationText: input.locationText ?? '',
    footerText: input.footerText ?? '',
    pageTitle: input.pageTitle ?? '',
    description: input.description ?? '',
    socialImage: input.socialImage ?? '',
    draftNotice: input.draftNotice ?? '',
  };
}

/** @param {CmsInput<Section>} [input] @returns {Section} */
export function normalizeSection(input = {}) {
  return {
    id: input.id ?? '',
    enabled: input.enabled ?? true,
    order: input.order ?? Number.NaN,
    type: input.type ?? '',
    label: input.label ?? '',
    heading: input.heading ?? '',
    body: input.body ?? '',
    image: input.image ?? '',
    imageAlt: input.imageAlt ?? '',
    buttonLabel: input.buttonLabel ?? '',
    buttonUrl: input.buttonUrl ?? '',
    theme: input.theme ?? '',
  };
}

/** @param {{sections?: CmsInput<Section>[] | null}} [input] */
export function normalizeHomepage(input = {}) {
  return { sections: (input.sections ?? []).map(normalizeSection) };
}

/** @param {CmsInput<FoodCategory>} [input] @returns {FoodCategory} */
export function normalizeCategory(input = {}) {
  return {
    name: input.name ?? '',
    description: input.description ?? '',
    image: input.image ?? '',
    imageAlt: input.imageAlt ?? '',
    squareUrl: input.squareUrl ?? '',
    featured: input.featured ?? false,
    order: input.order ?? Number.NaN,
  };
}

/** @param {{categories?: CmsInput<FoodCategory>[] | null}} [input] */
export function normalizeFood(input = {}) {
  return { categories: (input.categories ?? []).map(normalizeCategory) };
}
