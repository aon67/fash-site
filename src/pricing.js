// Single source of truth for every price on the site. Nothing else holds a
// number — the tier cards, the calculator and the copy all resolve through
// here, so a price refresh is a one-file edit.

export const UNITS = [
  { id: 'stills', label: 'Campaign Stills', price: 2200, per: 'sku' },
  {
    id: 'renders',
    label: 'Body-Type Renders',
    price: 4300,
    per: 'sku',
    note: 'Adds Petite / Slim / Curvy / Tall',
  },
  { id: 'video', label: 'Short Videos', price: 4200, per: 'video' },
  { id: 'captions', label: 'Thai Captions', price: 900, per: 'sku' },
]

// Ordered cheapest first — matchTier() relies on it to find the smallest
// package that covers a build.
export const TIERS = [
  {
    id: 'taste-test',
    name: 'Taste Test',
    price: 7400,
    billing: 'once',
    skus: 1,
    videos: 0,
    includes: ['stills', 'renders', 'captions'],
    recommended: false,
    blurb: 'One product, all four body types. The lowest-commitment way to see the output.',
    cta: 'Start a Taste Test',
  },
  {
    id: 'launch-kit',
    name: 'Launch Kit',
    price: 26100,
    billing: 'once',
    skus: 3,
    videos: 2,
    includes: ['stills', 'renders', 'video', 'captions'],
    recommended: true,
    ribbon: '72-hour campaign engine',
    blurb: 'A full launch: three products, four bodies each, plus video for the feed.',
    cta: 'Book a Launch Kit',
  },
  {
    id: 'brand-partner',
    name: 'Brand Partner',
    price: 59300,
    billing: 'monthly',
    skus: 8,
    videos: 4,
    includes: ['stills', 'renders', 'video', 'captions'],
    recommended: false,
    blurb: 'A standing pipeline for brands shipping new product every month.',
    cta: 'Talk to us about a retainer',
    terms: 'Billed monthly · minimum term TBC',
  },
]

// Keeps the homepage hero pills and the pricing list from ever drifting apart.
export const DELIVERABLE_LABELS = UNITS.map((unit) => unit.label)

const thb = new Intl.NumberFormat('th-TH')

export function formatTHB(amount) {
  return thb.format(amount)
}

export function quantityFor(unit, skus, videos) {
  return unit.per === 'video' ? videos : skus
}

export function buildLineItems(selectedIds, skus, videos) {
  return UNITS.filter((unit) => selectedIds.includes(unit.id)).map((unit) => {
    const quantity = quantityFor(unit, skus, videos)
    return { unit, quantity, subtotal: unit.price * quantity }
  })
}

export function buildTotal(selectedIds, skus, videos) {
  return buildLineItems(selectedIds, skus, videos).reduce((sum, line) => sum + line.subtotal, 0)
}

// What a tier would cost if you bought its contents à la carte. Savings are
// always derived from this — never written down by hand.
export function tierAlaCarte(tier) {
  return UNITS.filter((unit) => tier.includes.includes(unit.id)).reduce(
    (sum, unit) => sum + unit.price * quantityFor(unit, tier.skus, tier.videos),
    0,
  )
}

export function tierSaving(tier) {
  return tierAlaCarte(tier) - tier.price
}

// The cheapest package that covers everything the buyer has selected.
export function matchTier(selectedIds, skus, videos) {
  const needsVideo = selectedIds.includes('video')
  return (
    TIERS.find(
      (tier) =>
        selectedIds.every((id) => tier.includes.includes(id)) &&
        tier.skus >= skus &&
        (!needsVideo || tier.videos >= videos),
    ) ?? null
  )
}
