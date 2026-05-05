# Cohort Gate — referral-token catalog visibility

Replaces the binary `NEXT_PUBLIC_HIDE_RESTRICTED` env flag with a per-session
cookie. Public unreferred URL → restricted SKUs hidden (Square AUP-scanning
view). URL with valid `?ref=CODE` (affiliate code) or `?cohort=TOKEN`
(allowlisted cohort identifier) → full catalog including GLP-3 + HGH 191AA.

Threat model + design rationale: see `business-context/COHORT-GATE-CONTEXT.md`
(uploaded 2026-05-05).

## How it works

1. Visitor lands on `/`, `/shop`, or any `getServerSideProps` page.
2. `lib/cohort-session.getCohortFromRequest(context, supabaseAdmin)`:
   - Reads existing `opp_cohort` cookie. If valid HMAC → cohort allowed.
   - Else checks `?cohort=TOKEN` against the in-memory allowlist
     (`tris-community`, `tris-launch`, `telegram`, `launch`, `community`,
     `broadcast` — see `lib/cohort-session.js` to add more).
   - Else checks `?ref=CODE` against the `affiliates` table (active codes
     only, single DB roundtrip).
   - On match: writes `Set-Cookie: opp_cohort=...; HttpOnly; Secure;
     SameSite=Lax; Max-Age=7776000` (90 days).
3. `data/products.getVisibleProductsForCohort(cohortAllowed)` returns the
   filtered product list — restricted SKUs included only when allowed.
4. The component renders only what was passed; restricted SKU markup never
   reaches unflagged HTML.

## Three modes via env

Priority order (top wins):

| Env var | Behavior |
|---|---|
| `NEXT_PUBLIC_HIDE_RESTRICTED=true` | Hard hide everywhere. Kill switch for "Bankful pulled, lock down the catalog." Ignores cohort flag. |
| `NEXT_PUBLIC_RESTRICTED_FORCE_SHOW=true` | Show restricted to everyone. Kill switch for "Elite/Numus live, gate is redundant." Ignores cohort flag. |
| Neither set | Cohort gate active. Default operational mode. |

**Current production state:** `NEXT_PUBLIC_HIDE_RESTRICTED=true`. Cohort gate
code is deployed but inert until that env var is unset/flipped to `false`.

## Required env vars

- `COHORT_SESSION_SECRET` — HMAC signing key for the cookie. **If unset, falls
  back to `AFFILIATE_SESSION_SECRET`** (so existing infra continues to work
  without a new secret rotation). Rotate to revoke all cohort cookies.

## Smoke test (run before May 19 launch)

Run all of these after deploying + flipping `NEXT_PUBLIC_HIDE_RESTRICTED` off
on Vercel.

### Public-URL view (the load-bearing case)

1. Open an incognito window. Visit `https://optimizedperformancepeptides.com/`.
2. View source (Cmd+U / Ctrl+U). Search for `GLP-3` and `HGH 191AA`. **Must
   return zero matches.** If anything appears, the gate has a leak.
3. Navigate to `/shop`. Same view-source check.
4. Navigate directly to `/products/glp3-10mg`. Confirm:
   - Page renders the generic "Research Inquiry" view.
   - View source: zero `GLP-3` matches in the body. (URL slug still says
     `glp3-10mg` in `<link rel="canonical">` and `<meta og:url>` — that's
     unavoidable without a redirect, but the page body and title are clean.)
   - `<meta name="robots" content="noindex, nofollow">` is present.
5. Curl `/sitemap.xml`. Confirm no `glp3-*` or `hgh-191aa` URLs.

### Tokenized URL view

1. New incognito window. Visit `?ref=TRIS` (or any active affiliate code).
2. Confirm `opp_cohort` cookie is set in DevTools → Application → Cookies.
3. Navigate to `/shop`. GLP-3 and HGH 191AA cards visible.
4. Navigate to `/products/glp3-10mg`. Normal product page with "Add to cart".
5. Place a real-money smoke test order on a small SKU using the cohort
   session — confirm checkout flows and `orders` row inserts cleanly.

### Cohort token view

Same as above but with `?cohort=telegram`. Should unlock identically.

### Invalid token

1. Visit `?cohort=anything-i-typed`. No cookie set. Restricted still hidden.
2. Visit `?ref=NOTAREALCODE`. Same.

### Persistence

1. With cohort cookie set, close the browser entirely.
2. Reopen, visit `/shop`. Full catalog still visible (cookie persists 90d).

### Kill switch

1. Set `NEXT_PUBLIC_HIDE_RESTRICTED=true` in Vercel → redeploy.
2. Tokenized URL still hides restricted (kill switch beats cohort).
3. Unset → cohort gate active again.

## Known limitations

1. **iOS Safari ITP.** Apple's Intelligent Tracking Prevention may evict the
   cookie after 7 days of inactivity even with `SameSite=Lax`. A real customer
   coming back after 14+ days may see the restricted catalog and need to
   re-click the affiliate link. Acceptable; documented for support.
2. **Tokenized URL leakage.** If Tris's link gets posted to Reddit, anyone
   following it sees the full catalog. The gate is obfuscation against
   automated AUP scanners, not authentication.
3. **URL-only protection.** The gate doesn't stop chargeback investigations
   that surface SKU details through customer correspondence, and doesn't
   change the underlying merchant agreement.
4. **API surface.** Only HTML is gated. `/api/orders/create` will accept a
   restricted SKU regardless of cohort state. Square scans URLs, not APIs,
   so this is a known acceptable boundary.

## Where to extend

- **Add a new cohort token:** push to `COHORT_ALLOWLIST` in
  `src/lib/cohort-session.js`. No DB migration needed.
- **Rate-limit the cohort entry endpoint:** the existing `rateLimit` helper in
  `src/lib/security.js` is API-only. If we want to rate-limit `?cohort=`
  attempts we'd need to wire it into `getCohortFromRequest`. Not done in v1
  because brute-forcing the 6-token allowlist is not a meaningful threat —
  add later if traffic patterns suggest enumeration.
- **Add a `/r/<landing>` path-based entry:** add a `pages/r/[slug].js` that
  reads the slug, validates against `COHORT_ALLOWLIST`, sets the cookie via
  `setCohortCookieResponse(res)`, and 302s to `/shop`.
