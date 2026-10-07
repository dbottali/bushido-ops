# Cloud architecture — 0.5

## Responsibility boundaries

| Layer | Responsibility | What it cannot authorize |
|---|---|---|
| React browser | Accessible UI, public guest preview, session, provisional drafts | Cloud grades, XP, belt awards, owner role or premium rights |
| Supabase Auth | Email/password identities, confirmation, recovery, fresh user verification | Teaching-content editing through user metadata |
| Cloudflare `/api/*` | Verify identity/origin, strict DTOs, authorize content, owner import, Stripe calls | A learner-supplied user ID or a checkout success query |
| PostgreSQL `dojo_*` | Row isolation, transactions, revisions, grading, unique rewards, prerequisites, expiry | Direct authenticated writes to protected tables/RPCs |
| Stripe sandbox | Hosted test Checkout, portal and subscription truth | Belt completion or learning XP |

Private service/Stripe keys are server bindings. `/api/config` sends only public configuration and refuses a private key mistakenly entered as a publishable key. `/api/catalog` exposes safe metadata. `/api/courses/:id` checks access then strips answer keys and explanations; grading feedback is returned after submission.

## Learning and synchronization

Course/module/question IDs are stable. Each module update includes its expected revision and a request UUID. SQL locks the account row, rejects stale revisions, validates answer choices and prerequisite order, computes the grade and appends one reward per module. Retries of the same UUID replay the result. Previously completed modules stay completed during practice retries.

A belt-awarding course requires lessons and a final exam; all its modules must be complete. The previous belt's award course is a prerequisite. White is free for verified accounts; all other available courses also require a White award and an active/trialing subscription whose current period has not expired.

The client refreshes on sign-in, return/focus/connection and approximately every minute while visible. Pending answer drafts are isolated by user/course/module and remain on the device until saved. A revision conflict asks the learner to review and load the cloud answers rather than silently overwrite. The 0.5 is not a fully offline app: authorization and submission require a connection.

Guest transfer is an explicit first-pilot import, once per account, regraded on the server. Existing local completion, XP and subscription flags are never trusted. Switching accounts discards old responses from pending requests; explicit sign-out removes provisional cloud drafts on the device.

## Content owner

`OWNER_USER_IDS` is a server-side UUID allowlist. There is no self-assignable role in signup or metadata. The owner API validates a catalog, then a separate reviewed publish action commits it using a catalog revision. Versions and an audit entry are kept. Any change/removal to an entire course with recorded progress is rejected; use a new course ID for a revised teaching version.

Real paid material and keys must not be committed to a public repository or placed under public assets. Only synthetic examples and the intentional public preview belong in the delivered archive.

## Billing

Only staging and `sk_test_` keys are supported. One active recurring price is configured server-side. Checkout requires White and published premium training; database checkout reservations reuse one request UUID/parameter set for 23 hours to avoid duplicate sessions from repeated clicks.

Stripe signatures are verified against the raw bounded request body with timestamp tolerance. Allowed events trigger a refetch of the current customer subscriptions, then a deduplicated, timestamp-ordered SQL update. Checkout redirects never grant rights. Failed/unpaid/incomplete/canceled or expired subscriptions do not open premium. Scheduled cancellation retains access until the period ends; progress remains.

Account deletion requires the exact word DELETE and a recent password sign-in. The API stops the sandbox subscriptions/open checkouts, removes the sandbox customer and then deletes the Auth user; foreign keys remove that user's progress. A provider error stops deletion and is shown rather than reporting false success. Connected acceptance testing is still required.

## Deployment and recovery

Cloudflare Pages serves `dist-cloud` and runs `functions/api/[[path]].ts`. The unconfigured browser-only GitHub Pages profile remains a guest demonstration. No paid content should depend on client-side hiding.

Database backup, Auth/SMTP settings and service secrets need independent recovery procedures. Own-account export and owner catalog download are useful subsets, not full database backups. The commercial 1.0 needs a separate production project, live billing implementation/review, real curriculum and a successful restore exercise.
