> Historical 0.4 design/documentation. The 0.5 implementation and its required three-question guest → free account → premium funnel supersede the earlier optional-account proposal. See [SETUP-0.5.md](SETUP-0.5.md), [CLOUD-ARCHITECTURE.md](CLOUD-ARCHITECTURE.md) and [PROJECT.md](PROJECT.md) for current behavior.

# Learning engine — v0.3

The actual practice is defined in `data/courses.json`. `CoursePlayer` renders its modules; My Dojo, routes and the store share pure selectors and rules. Only the existing phishing pilot is published. The other seven course entries remain planned and empty.

## Adding content later

1. Choose stable, lowercase IDs made of letters, digits and hyphens. Course IDs are unique across the catalog; module IDs within a course; question IDs within a module. IDs must start with a letter and contain at most 80 characters.
2. Add or update a course entry: `id`, `belt`, `title`, `summary`, `availability`, `prerequisites` (course IDs) and ordered `modules`.
3. Keep `availability: "planned"` until reviewed content is ready. Publishing requires at least one valid module; changing it to `"available"` makes the course appear in My Dojo. Dependencies still prevent training until prerequisite courses are complete.
4. Each module has `id`, `kind`, `title`, `intro`, integer `reward` (0–10000), and its kind-specific fields below.
5. Run `pnpm check:pages`, exercise the new course, export a backup and verify reload/retry. Rebuild and upload the compiled Pages files as well as the changed source.

| Kind | Content fields | Completion rule |
| --- | --- | --- |
| `warmup` | `scenario`: from/title/body/action; `question` | Correct answer explicitly checked |
| `lesson` | `sections`: title/body; optional `lead` and `note`: title/body | Explicit Mark Lesson Complete |
| `quiz` | `questions`; `passingScore` | All questions answered and at least passingScore correct |

A question contains `id`, `prompt`, `options`, zero-based integer `correct` and `explanation`. Supply 2–10 options. Quiz thresholds must be between 1 and the question count. Learners can navigate between steps without completing them; prerequisites are course-level, not enforced lesson ordering.

## Source responsibilities

| File | Responsibility |
| --- | --- |
| `data/courses.json` | Actual content, grading, rewards and prerequisite declarations |
| `lib/course-types.ts` | Module/course/progress types |
| `lib/course-engine.ts` | Catalog validation and pure selectors/rules |
| `lib/course-catalog.ts` | One validated shared catalog and stable pilot identity |
| `lib/dojo-progress.ts` | Reducer, backups, migrations and browser-local store |
| `lib/dojo-routes.ts` | Canonical and legacy training route resolution |
| `components/course-player.tsx` | Generic exercise UI, previous/next steps and answer review |
| `components/my-dojo-page.tsx` | Resume, course states, available-only totals and backup entry point |

About and the belt curriculum previews remain editorial content in their own files. Their availability and pilot rewards come from the catalog, but descriptions/FAQs must be reviewed when releasing new teaching material.

## Stable content and saved learners

Do not rename existing IDs to rearrange a course. Question order can change because answers use question IDs. Answer choices still use indices: preserve option order and assessment meaning, or add an explicit migration/new ID. Likewise, change module identity or migrate when replacing a completed assessment; do not reinterpret an earned result silently.

Rewards are derived from the current catalog. Changing a reward changes displayed totals for previously completed modules; treat it as a versioned product decision. Removing IDs protects existing profiles as incompatible rather than dropping learner data. Adding a fresh course or module is supported without losing old progress.

Unknown prerequisites, cycles, duplicate IDs, empty available courses and invalid question/threshold data fail validation. Never turn missing teaching material into an XP-unlocked placeholder.

## Routes

- `#my-dojo`: personal dashboard.
- `#my-dojo/backups`: backup controls.
- `#dojo`: next incomplete step in an accessible practice; revisit if all are complete.
- `#dojo/<course-id>/<module-id>`: exact step.
- `#dojo/<course-id>`: next step in that course, or its unavailability/prerequisite screen.
- Existing `#dojo/warmup`, `#dojo/lesson`, `#dojo/quiz` links still open the pilot.
- Unknown courses/steps show a clear missing-link screen; they never silently open another exercise.

## Extension proof

The automated tests build a second course entirely from a cloned data fixture: four modules (including two lessons), custom rewards, two quiz questions, a one-correct-answer threshold and a pilot prerequisite. It remains locked before completion, then works through the same reducer/selectors and reaches the correct total without changing player code. The fixture is test-only and is not published learning material.
