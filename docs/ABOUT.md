# About — the digital dojo

The home’s About navigation now opens a dedicated page at `#about`. The existing “Why Bushido Ops” home section keeps its content and is available at `#why-bushido-ops`.

## Page content

- A beginner-focused introduction, the approved Ryu-style hero and direct entry to White Belt practice.
- The dojo’s mission: welcoming questions, clear explanations and steady practice.
- Three learner cards: new to security, everyday digital life and curious learners.
- A selectable Warm-up, Lesson and Quiz overview. Each preview explains the task and reward condition, then links to the corresponding playable module.
- The eight-belt path, with White marked as a ready pilot and the remaining belts marked planned. Every belt card links to its dedicated Belts preview.
- A link to Philosophy and the shared dojo code.
- Five expandable FAQs covering experience, accounts, available practice, XP/retries and certification.

The copy describes the current product. There are no invented learner statistics, testimonials, founder credentials or release dates.

## Navigation and behavior

- `#about/warmup`, `#about/lesson` and `#about/quiz` select a preview. Browser back/forward restore the preview encoded in each URL.
- `#about/how` jumps to the training overview and focuses its heading. The link works again when that hash is already active. Tab reaches the selected preview tab; arrow keys select another step.
- `#about-content` is the skip-link target and focuses the main content.
- About has its own document title and active navigation state.
- Preview selection and FAQ expansion do not award XP. Rewards remain in the actual training modules.
- Home, Dojo, My Dojo, About, Belts and Philosophy share the header in `components/dojo-page-chrome.tsx`. The three content pages also share its footer.
- XP, unfinished answers and Philosophy choices survive reload when browser storage is available. My Dojo and Belts provide backup export/import and confirmed reset.

## Current scope

The first White Belt phishing practice is playable. The full curriculum, persistent accounts and belt advancement remain in development. The current 100 XP is pilot completion, not an accredited certification.

The intro and previews reuse existing artwork and fighters: Ryu-style main hero, boxer for Warm-up and blue-outfit fighter for Quiz. No animation behavior or sprite palette is changed by this update. The layout reflows for narrow screens, including a two-column navigation layout on the smallest widths.

## Source files

- `lib/about-content.ts`: learner cards, module previews and FAQs.
- `components/about-page.tsx`: the dedicated page.
- `components/dojo-page-chrome.tsx`: shared content-page navigation.
- `app/page.tsx`: routes, focus and shared progress-store integration.
- `app/globals.css`: About layout and shared frame styles.

Preview screenshots: `about-preview.jpg`, `about-training-preview.jpg` and `about-mobile-preview.jpg`.
