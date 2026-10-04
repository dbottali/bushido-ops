# Browser-local dojo progress

The first infrastructure sprint saves the playable pilot on this browser, without requiring an account or backend. `#dojo` resumes the first incomplete module; explicit module links still open that module. Completing all three modules makes Revisit open Warm-up.

## Model and storage

`lib/dojo-progress.ts` owns the pure reducer, validation, serialization and store. `components/use-dojo-progress.ts` connects it to React through `useSyncExternalStore`, hydrates in an effect and listens for browser storage events. Hydration reads existing data before exercise actions become available.

Storage key: `bushido-ops.progress`. Current backup envelope: `{ "app": "bushido-ops", "version": 2, "progress": { "courses": { "white-phishing-pilot": { ... } }, "commitments": [] } }`.

The pilot stores unique completed module IDs, the Warm-up answer/check state, three Quiz answers/submission state and Philosophy commitments. XP is derived as 20 + 30 + 50 from completion; backups cannot supply an arbitrary XP total. Retries preserve earned completion and cannot award twice. A fresh profile contains no completed modules and empty answers.

The known flat version-1 envelope is migrated when encountered. This is format compatibility; previous published prototypes did not save a profile. Unknown course IDs, malformed fields, foreign app envelopes and unsupported versions are rejected. The file picker caps import at 256 KB.

## Backup controls

Belts → Your Progress provides a native JSON download link, an import file picker and Reset Progress. Import validates first, then previews XP/modules/habits in a confirmation dialog. Cancellation leaves the current profile unchanged. Reset also requires confirmation. Dialogs start on Keep Current Progress and restore focus to the initiating control.

Backups contain progress and answers. They contain no login credentials. This profile is personal, editable practice data, not proof of certification or a tamper-resistant assessment record.

## Failure behavior

Storage access and writes are guarded. If the browser denies access or cannot write, training stays usable in memory and shows a temporary-session notice with backup controls. A later successful write resumes saved mode.

Unreadable or newer saved data is preserved unchanged while temporary practice continues. Download Saved Copy can preserve that raw data. Only an explicit confirmed import or reset replaces it. No other browser storage keys are cleared.

Storage events update other open tabs after a valid change; the latest write wins. There is no merging across simultaneous edits, learner account separation or automatic synchronization across devices. Clearing site data, changing browsers/origins or private-browsing retention can remove or isolate the saved profile. Use export/import to move it manually.

## Validation

Run `pnpm test:progress` and `pnpm exec tsc --noEmit`. `scripts/test-progress.mjs` compiles the pure model into a temporary directory, runs Node's meaningful store tests and cleans up. No runtime dependency was added.
