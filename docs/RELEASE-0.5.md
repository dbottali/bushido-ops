# Bushido Ops 0.5 — account and learning infrastructure

Prepared 7 October 2026. Source, database migration, pilot seed, email templates, setup instructions and a compiled guest demo are included. No external account was created or configured, no remote repository was overwritten and no deployment or real payment was made.

## Result

A guest tries three White questions. To continue, the learner creates a free email/password account and confirms the email. White training stays free. A full White award, an active subscription and the preceding course unlock Yellow and higher. Paying never awards a belt.

Accounts, own-data settings/export/delete, synced course progress, local pending drafts, conflict handling, retry-safe XP, server grading and belt awards are implemented. Supabase users cannot write learning content, reward records or subscriptions directly. The owner is authorized by a server-side UUID allowlist and can validate/review/import a private catalog.

Stripe integration is sandbox-only, including Checkout, customer portal, renewal/expiry state and verified/deduplicated webhooks. Access is evaluated with expiry each time; an old active flag or a Checkout success URL is insufficient.

## Material and migration

The original White phishing pilot is still sample training with no full belt award. The guest preview can transfer its three answers explicitly; SQL checks them again. The 0.4 profile and backups remain separate historical practice, and cannot supply cloud XP or paid rights.

The optional `content/staging-smoke-catalog.json` adds synthetic courses for all eight belts while retaining the original pilot/planned entries. It is for test awards and Stripe verification only. Real material belongs in new stable course IDs and in a separate production database. Existing courses with recorded progress cannot be silently rewritten or removed.

## Preserved design

Approved ivory/red/navy dojo, 8-bit whole-body poses, subtle idle, interaction-only punches, shared five-item navigation and touch-friendly layout. New account, owner and cloud learning pages use the same header and footer. No native app, analytics, public profile, student editor or preferences panel was added.

## Evidence and limits

47 automated tests passed: 22 local progress/engine regressions and 25 cloud tests. The migration ran in actual PostgreSQL through PGlite; the API tests use the real Supabase and Stripe SDKs with external transport fixtures. TypeScript, pilot validation, Vite production builds and Cloudflare Functions compilation passed. The real provider networks were not used.

Eight routes were checked at requested widths 320, 390, 768, 1024 and 1280 px in Chrome, with no body horizontal overflow and an ivory background. Guest grading reached 3/3 and 20 provisional XP; the account gate and configuration notice were verified. Mobile menu keyboard open/Escape/focus were checked. Physical iPad/Safari/Brave, external email delivery, two-device accounts and real Stripe sandbox events remain on the setup checklist.

The release is **ready to configure and test**, not a commercially launched, fully populated learning service.
