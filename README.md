# Bushido Ops — 0.5

An 8-bit cybersecurity dojo with a three-question guest preview, free account-based White training and server-controlled premium access. Product owner: Damiano. UI: English. Commercial launch: 1.0.

**This package is staging infrastructure, ready to connect.** External services are not configured by the archive. Without them, the guest preview and public pages work; the account screen explains the missing connection. The existing White pilot is sample content and does not award a full belt. Higher belts remain planned. Stripe supports sandbox payments only.

## What's implemented

- Approved ivory/red/navy design, consistent five-item menu, phone navigation and full-pose 8-bit fighters: white-gi hero, boxer and blue quiz fighter. Subtle idle; larger moves only on interaction.
- Three guest questions, explanations and provisional progress. A free account is required for the lesson/exam and cloud progress. Existing 0.4 browser progress remains a separate archive; local XP cannot become a cloud belt or subscription.
- Email/password signup, confirmation, sign-in/out, recovery, account settings, own-data export and confirmed account deletion.
- Supabase-backed progress and resume, answer drafts, conflict detection and retries. SQL grades assessments, awards XP once and records belts only after the required course and final exam.
- White remains free. Yellow and above need White, an active unexpired subscription and course prerequisites. Cancellation retains progress. Unavailable courses cannot be sold as ready.
- Cloudflare Pages Functions authenticate each request against Supabase. Database RLS isolates users; students cannot modify content, grading, XP, belts or subscription records.
- Stripe sandbox Checkout, subscription portal, status refresh and signed webhooks. Replayed notifications and checkout return URLs cannot grant extra access. Live keys/events are rejected.
- Owner-only JSON validation, reviewed publication, catalog backup and audit history. Used courses are protected from silent replacement. No student editor.
- A separate synthetic staging catalog exercises White → Black and billing before the real curriculum is written. Test awards are labelled.

## Start here

**[Italian service signup and setup guide](docs/SETUP-0.5.md)** covers Cloudflare, Supabase, email templates, Resend SMTP, owner authorization, Stripe sandbox, deployment, backups and connected acceptance checks.

No domain purchase is needed for the first owner-only test on `pages.dev`. Email to external testers requires a verified sending domain and custom SMTP.

## Local development

Node.js ≥22.13.0 and pnpm 11.25.0:

```sh
pnpm install --frozen-lockfile
pnpm dev:cloud
```

The unconfigured preview is usable immediately. For connected staging, copy `config.example.txt` to `.env.local`, fill it locally and set `APP_URL` to the local server origin. Keep private credentials out of Git, public assets and `VITE_*` variables.

```sh
pnpm check:cloud
pnpm preview:cloud
```

`check:cloud` verifies TypeScript, 22 existing progress/engine tests, 25 cloud API/PostgreSQL/guest tests, content validation, frontend assets and the Cloudflare Functions bundle. Wrangler uses local `.dev.vars` bindings for the bundled preview; it does not automatically read Vite's `.env.local`.

## Deploy staging

Cloudflare Pages Git integration: source at the repository root; branch `staging-0.5`; build `pnpm install --frozen-lockfile && pnpm build:cloud`; output `dist-cloud`. Pin `NODE_VERSION=22.16.0`, `PNPM_VERSION=11.25.0` and `SKIP_DEPENDENCY_INSTALL=true`. Follow the setup guide for runtime secrets and database initialization.

The root `index.html`, `assets/`, artwork and fonts are a prebuilt **GitHub Pages guest demo**, using `/bushido-ops/` URLs. They do not provide accounts or payments. `pnpm check:pages` rebuilds/checks this static profile. [Static demo instructions](docs/PAGES.md).

No remote deployment or repository overwrite was performed while creating this release.

## Documentation

- [0.5 changes and boundaries](docs/RELEASE-0.5.md)
- [Cloud architecture and permissions](docs/CLOUD-ARCHITECTURE.md)
- [Preparing and importing learning content](docs/CONTENT-0.5.md)
- [Validation and remaining connected tests](docs/QA.md)
- [Project direction](docs/PROJECT.md)
- [Roadmap to 1.0](docs/PLAN-1.0.md)
- [Characters and 8-bit animation](docs/CHARACTERS.md)

Earlier release notes and browser-progress documentation are retained as historical references. They do not describe the new cloud permissions or signup funnel.
