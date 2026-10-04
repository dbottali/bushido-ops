# Belts — one path, eight belts

The dedicated Belts page opens at `#belts`. Home belt characters and About belt cards now link to the selected belt’s full preview. The home section keeps its original artwork and is available at `#home-belt-path`.

## Learning path

| Belt | Focus | Availability |
| --- | --- | --- |
| White | Everyday digital self-defense | Playable phishing-awareness pilot |
| Yellow | Accounts and identity | Planned curriculum |
| Orange | Devices and data | Planned curriculum |
| Green | Networks and the web | Planned curriculum |
| Blue | Defensive thinking | Planned curriculum |
| Purple | Investigation and detection | Planned curriculum |
| Brown | Incident response | Planned curriculum |
| Black | Practice and mentorship | Planned curriculum |

Each selected preview includes the belt’s focus, three learning outcomes and a practice mission with an expandable approach. White describes the actual pilot. The seven future missions are explicitly identified as planned exercises, and their training CTA opens the available White Belt practice.

The page keeps the approved 8-bit fighters, original belt miniatures, pixel frames and local fonts. A Ryu-style fighter appears in the current-practice panel with the existing quiet animation profile. No new sprites or fighter timing changes are introduced.

## Actual saved progress

- Warm-up: a correct response earns 20 XP.
- Lesson: marking the lesson complete earns 30 XP.
- Quiz: all three answers correct earn 50 XP.
- Belts shows earned XP and completion for each module. Preview selection and mission disclosures award no XP.
- Start/Continue opens the first incomplete module in the order Warm-up, Lesson, Quiz. Once all three are complete, Revisit opens Warm-up.
- Completing the pilot shows 100 XP, 3/3 and “First practice complete.” It does not unlock unfinished curriculum or issue a certification.
- Progress, unfinished answers and Philosophy choices save on this browser and survive reload. Storage failures show a temporary-session notice. XP is derived from unique completed modules.
- Your Progress provides JSON export/import and reset. Import previews the backup and requires confirmation before replacement. Reset also requires confirmation.

Home, training, About, Belts and Philosophy use the same header. The three content pages also share its footer. Enter the Dojo resumes the first incomplete module.

## URLs and keyboard behavior

- `#belts/white`, `#belts/yellow`, `#belts/orange`, `#belts/green`, `#belts/blue`, `#belts/purple`, `#belts/brown`, `#belts/black`: select a preview.
- Entering from another page with a belt URL scrolls to the path and focuses that belt tab. Back/forward restore the belt encoded in the URL.
- Left/right arrow keys change tabs and keep tab focus. Tab from the path heading reaches the selected tab.
- `#belts/path` and `#belts/progress` scroll to their sections and focus their headings. Repeated jumps also work when the hash is already active.
- `#belts-content`: skip link to the main content.
- Mission approaches and FAQs are native disclosures and open with Enter.
- Unknown belt names fall back to White.

## Source and proof

- `lib/dojo-content.ts`: shared belt identities and actual training rewards.
- `lib/belts-content.ts`: planned outcomes, missions, pilot-step descriptions and FAQs.
- `components/belts-page.tsx`: previews, progress and continuation links.
- `components/dojo-page-chrome.tsx`: shared page navigation.
- `lib/dojo-progress.ts`: validated, versioned store and pure progress reducer.
- `components/use-dojo-progress.ts`: hydration, external-store subscription and browser-tab updates.
- `components/progress-manager.tsx`: backup controls and replacement confirmations.
- `app/page.tsx`: routes, focus and shared progress-store integration.
- `app/globals.css`: responsive page layout.

Screenshots: `belts-preview.jpg`, `belts-path-preview.jpg`, `belts-progress-preview.jpg`, `belts-mobile-preview.jpg`.
