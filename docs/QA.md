# Validation — Bushido Ops 0.5

Date: 7 October 2026. See `RELEASE-0.5.md` and `SETUP-0.5.md` for scope.

## Passed locally

- TypeScript compile without emit.
- 22 existing meaningful progress, migration, course engine and route tests.
- 25 cloud tests: actual PostgreSQL migration/RLS/functions, private catalog validation/redaction, verified identity, strict input and origins, grading/order, revision conflicts, unique XP, prerequisites/awards, subscription expiry/cancellation, deduplicated/stale events, guest import, immutable used courses, checkout reservations and account deletion.
- API tests use real Supabase/Stripe SDK code with Auth/Stripe HTTP fixtures and the PGlite database. Stripe signatures are checked with actual SDK crypto, including missing/tampered/stale/live events.
- Pilot catalog validation and synthetic eight-belt catalog validation.
- Vite cloud and static Pages production builds, artwork/fonts/asset reference checks and Cloudflare Pages Functions compilation.
- Browser: Home, Guest Preview, Account, My Dojo, Belts, About, Philosophy and Owner gate at requested widths 320, 390, 768, 1024 and 1280 px. No body horizontal overflow; background `rgb(252, 250, 245)`; consistent five-item menu. An iframe scrollbar reduces its content width by 15 px in most checks.
- Guest flow: three correct answers → 3/3, 20 provisional XP → free-account prompt. Unconfigured account notice is explicit; no simulated account is reported as real.
- Mobile menu keyboard open, Escape close and returned focus.

## Pending on configured providers

No Cloudflare/Supabase/Resend/Stripe user credentials were supplied or used. External email deliverability, provider settings, two physical devices with an account, live sandbox webhooks/portal/renewals and a Supabase backup restore must be tested after setup. SQL compatibility with the selected hosted Supabase project must be verified by applying the migration there.

No physical iPad/Safari/Brave test was performed. The earlier brown background was reported in Brave and Safari was reported correct; its cause was not established. Chrome width checks cannot certify that Brave behavior.

## Product limits

Material is still sample/pending; the original pilot awards no full belt. Synthetic staging awards are only tests. Premium remains unavailable until actual available courses, White and sandbox billing are configured. Staging-only implementation; production payments are intentionally outside 0.5. No native app, PWA offline cache, analytics, editor for students or preferences panel.
