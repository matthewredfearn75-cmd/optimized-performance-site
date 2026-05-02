# Affiliate Dashboard — Deployment Steps

## 1. Apply migration v5 to Supabase

The migration adds `parent_affiliate_id`, `is_flat_rate`, `recruiter_override_pct`, `login_password_hash` columns plus the `affiliate_payouts` table.

1. Open Supabase project → SQL Editor → New query
2. Paste contents of `optimized-performance-site/supabase-migration-v5.sql`
3. Run
4. Verify:
   ```sql
   SELECT column_name FROM information_schema.columns WHERE table_name='affiliates'
     AND column_name IN ('parent_affiliate_id','is_flat_rate','recruiter_override_pct','login_password_hash');
   SELECT count(*) FROM affiliate_payouts;
   ```

The migration is idempotent — safe to re-run.

## 2. Set environment variables in Vercel

Two new env vars required for the dashboard:

| Var | Purpose | Where to set | Example |
|---|---|---|---|
| `AFFILIATE_SESSION_SECRET` | HMAC secret for affiliate login tokens. Rotating it invalidates all existing affiliate sessions. | Vercel Production (Sensitive) | Generate: `openssl rand -hex 32` |
| `CRON_SECRET` | Already exists for `/api/inventory/check-stock` cron. Same secret reused for `/api/cron/affiliate-monthly` manual triggers. | Verify present | (already set) |

Existing env vars confirmed in use (no change):
- `NEXT_PUBLIC_SITE_URL` — used to compose the affiliate login URL displayed in the admin password modal.
- `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` — all already set.

## 3. Deploy

`bankful-scaffold` was the last merge to master; this dashboard work goes on top. Standard flow:
1. Commit changes to `master`
2. Vercel auto-deploys
3. Confirm `/affiliate/login` resolves and `/affiliate` redirects to login when unauthed

## 4. First-affiliate setup

For each existing affiliate (and any new one):

1. Open `/admin` → Affiliates tab
2. Click **Set PW** on the affiliate's row
3. Confirm the dialog → modal shows email + generated password + login URL
4. Click **Copy all** (paste-ready handoff format) and DM/email it to the affiliate
5. Affiliate goes to `/affiliate/login`, signs in with email + password
6. They land on `/affiliate` dashboard

If they lose the password: admin clicks **Reset PW** to generate a new one (invalidates the old).

## 5. Cron job

`/api/cron/affiliate-monthly` is registered in `vercel.json` to run on the 1st of each month at 09:00 UTC.

**Manual trigger** for testing or backfill:
```
curl -X POST https://optimizedperformancepeptides.com/api/cron/affiliate-monthly \
  -H "x-cron-secret: $CRON_SECRET" \
  -d 'period=2026-04'
```
Period query param overrides the default (which is the previous calendar month).

The cron is idempotent — re-running for the same period is safe; the UNIQUE constraint on `affiliate_payouts(affiliate_id, payout_type, period, trigger_affiliate_id)` rejects duplicates.

## 6. Operational notes

- **Token lifetime:** 30 days from issue (in `lib/affiliate-session.js`). Frontend stores in `sessionStorage` so closing the tab forces re-login regardless. Switch to `localStorage` if that's too aggressive.
- **Session revocation:** rotate `AFFILIATE_SESSION_SECRET` in Vercel → re-deploy → all affiliate sessions invalidated. Per-affiliate revocation requires resetting their password (clears the hash).
- **Rate limits:** 10 login attempts / minute / IP, 60 dashboard fetches / minute / IP. See `lib/security.js`.
- **Password reveal:** plaintext password is shown once at set/reset time — not stored anywhere on the server (only the scrypt hash). If admin closes the modal without copying, click Reset PW again.

## 7. Where things live

| File | Role |
|---|---|
| `src/lib/affiliate-session.js` | HMAC token sign/validate + scrypt password hash/verify |
| `src/pages/api/affiliates/login.js` | POST email+password → token |
| `src/pages/api/affiliates/me.js` | Affiliate data + MTD/last-month/YTD stats + pending payouts |
| `src/pages/api/affiliates/network.js` | Recruits view (only when `recruiter_override_pct > 0`) |
| `src/pages/api/affiliates/payouts.js` | 12-month payout history + monthly volume |
| `src/pages/api/admin/affiliate-password.js` | Admin generates/rotates affiliate password |
| `src/pages/api/cron/affiliate-monthly.js` | Tier ratchet + override + royalty payouts |
| `src/pages/affiliate/login.js` | Login form |
| `src/pages/affiliate/index.js` | Dashboard |
| `src/pages/admin/AffiliatesTab.js` | Admin tab — adds Set/Reset PW button + modal |
| `src/components/Footer.js` | Public footer — adds "Affiliate Login" link |
| `vercel.json` | Cron registration |
| `supabase-migration-v5.sql` | DB schema |
| `docs/affiliate-program-spec.md` | Program rules + cron pseudocode |

## 8. Out of scope (v1.1+)

- Per-order commission rate snapshotting (currently uses affiliate's current rate for historical estimates — note shown in payouts table)
- Admin Payouts tab with bulk Mark-Paid workflow (currently payouts visible only on each affiliate's row + the cron-driven entries)
- Email notification when a payout is marked paid
- Magic link login via SendGrid (deferred until SendGrid API key set on Vercel)
- Custom-discount-per-flat-rate-affiliate UI in admin (Tris's customer discount is currently set via the standard discount_pct field)
