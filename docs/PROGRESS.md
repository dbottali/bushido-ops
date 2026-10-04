# Browser-local progress — version 0.3

Training data lives in `data/courses.json`; `lib/course-engine.ts` computes completion, XP, availability, prerequisites, grading and the next step. The versioned store in `lib/dojo-progress.ts` owns validation, serialization, migrations and persistence. React connects through `useSyncExternalStore`.

## Model and storage

Storage key remains `bushido-ops.progress`. The current envelope is:

```json
{
  "app": "bushido-ops",
  "version": 3,
  "progress": {
    "courses": {
      "white-phishing-pilot": {
        "modules": {
          "warmup": {
            "completed": true,
            "submitted": true,
            "answers": { "pressure": "1" }
          }
        }
      }
    },
    "commitments": ["respect"]
  }
}
```

The example is a partial profile: catalog courses/modules not yet present initialize with empty answers and no completion. Actual exports include the current catalog. Courses, modules and questions use stable IDs. Choice values remain zero-based option indices serialized as strings. Reordering questions does not change their mapping; reordering options or changing assessment meaning needs a content migration or a new module/question ID.

XP comes from completed module rewards in the published catalog, never from backup totals. A retry clears the latest answers/submission but retains previously earned completion and XP. Wrong or incomplete attempts award nothing. Navigation alone awards nothing. Lesson completion requires its explicit button; assessment completion follows its data-defined passing rule. Courses in development cannot be played, and prerequisite courses must be complete before an available successor can be trained.

## Compatibility

Known version-1 and version-2 profiles migrate automatically on hydration. Version 2 retains the pilot's completion, Warm-up answer/check, Quiz drafts/submission and Philosophy choices. A successful save writes version 3 under the same key.

New catalog entries initialize without losing existing progress. Unknown course/module/question IDs, invalid types, invalid choices, foreign envelopes and unsupported formats are rejected and protected rather than silently discarded. A UTF-8 byte cap of 256 KB applies to imports and reads.

Export a backup before updating. A downgrade to the 0.2 app cannot read a version-3 profile; keep a pre-upgrade version-2 backup if rollback is needed. New question IDs added to a submitted assessment require a content migration/new module ID to preserve its meaning, not an automatic regrade.

## Backup controls

My Dojo → Manage Backups provides Export, native file import, paste-JSON import and confirmed reset. The same controls remain in Belts → Your Progress. Both import paths validate before a confirmation preview showing XP, modules and habits. Cancellation leaves the current profile unchanged.

Dialogs start on Keep Current Progress. On closing, focus returns to the initiating control, or Import Backup when the paste form has closed. Reset replaces only this app's profile; it never clears unrelated browser storage.

Backups contain answers, completion and optional habits. They contain no login credentials. Personal, editable practice data is not a tamper-resistant assessment or certification record.

## Failure and synchronization

Storage access and writes are guarded. Denied reads or failed writes keep training usable in memory with a temporary-session notice. A later successful write resumes saved mode.

Unreadable, newer or incompatible saved data stays unchanged while temporary practice continues. Download Saved Copy preserves the raw profile. Only explicit confirmed import/reset replaces a protected copy.

Browser storage events update other open tabs; the latest valid write wins. There is no merge for simultaneous edits, learner-account separation or automatic device synchronization. Clearing site data, changing browsers/origins or private-browsing retention can remove/isolate a profile. Export/import transfers it manually.

## Checks

`pnpm check:pages` runs TypeScript, 22 engine/progress/route tests and the Pages production build, then verifies required assets. `pnpm test:progress` runs the model tests alone. Compilation uses a private temporary directory and cleans it up. No runtime dependency was added.
