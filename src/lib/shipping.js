// Shipping cost calculation. Single source of truth for both the server-side
// /api/orders/create handler and the client-side checkout + cart drawer.
//
// Pricing rule (Option B, finalized 2026-05-06 after costing real Uline +
// USPS rates):
//   - Vial-only base: $16.95 — ships USPS Ground Advantage in a Uline S-7887
//     insulated foam shipper with a full-sheet phase-change gel pack.
//     Ground transit (2-5 day) + 48+ hr cold-hold from the full sheet keeps
//     vials in the 2-8 °C storage window across all zones.
//   - Cold-pack surcharge: +$17 when cart contains any kit SKU. Kits ship
//     USPS Priority Mail in a Uline S-13391 (1.5"-wall insulated box) with
//     full-sheet gel. Priority is required because the larger thermal mass
//     in a kit needs the faster transit to stay in spec. Total kit
//     shipping = $33.95.
//   - Free standard shipping over $250 (post-discount) — vial-only carts
//     ONLY. Carts containing any kit always pay the cold-pack surcharge,
//     regardless of subtotal.

export const SHIPPING_BASE = 16.95
export const COLD_PACK_SURCHARGE = 17
export const FREE_SHIPPING_THRESHOLD = 250

export function cartRequiresColdPack(items) {
  if (!Array.isArray(items)) return false
  return items.some((it) => it && it.isKit === true)
}

export function calcShipping({ items, discountedSubtotal }) {
  const coldPack = cartRequiresColdPack(items)
  if (!coldPack && discountedSubtotal >= FREE_SHIPPING_THRESHOLD) {
    return { base: 0, coldPack: 0, total: 0, hasColdPack: false, freeShipApplied: true }
  }
  return {
    base: SHIPPING_BASE,
    coldPack: coldPack ? COLD_PACK_SURCHARGE : 0,
    total: SHIPPING_BASE + (coldPack ? COLD_PACK_SURCHARGE : 0),
    hasColdPack: coldPack,
    freeShipApplied: false,
  }
}
