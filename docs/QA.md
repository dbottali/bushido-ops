# Bushido Ops validation — 4 October 2026

## Fighter loading fix

- Root cause: Home and About rendered the original Ryu card artwork until the fighter became ready. Warm-up and Quiz now render only the clean scene from the first render. The obsolete readiness-gated card overlay was removed.
- A temporary fixture held the actual application’s sprite image loads indefinitely. Home Warm-up and Quiz stayed on the clean scene with hidden canvases and the correct boxer/quiz character roles. About’s two matching previews did the same.
- Releasing the held images loaded the correct 8-bit fighters. A separate run failed sprite loads deliberately: Home and About retained the clean scene, with `data-load-error="sprite"` and no original Ryu card image in the DOM. Lesson retains its original illustration.
- Normal Home was visually checked with both correct fighters ready; inspected browser warning/error logs contained no application messages. Proof: `loading-fix-preview.jpg`.
- Animation logic, atlas files, timing, interaction, palette and responsive geometry were unchanged. The loading fixture and temporary preview package change were removed before packaging.
- TypeScript and the GitHub Pages production build passed. The cumulative archive retains About, Belts, Philosophy and the pilot, and includes the new compiled entry point and its referenced assets. This is prepared for manual upload and is not claimed to be live.

## Belts update

- Desktop introduction, original 8-bit belt miniatures, ready Ryu-style fighter and navy mission panels were visually checked. All eight selections showed the matching topic, outcomes and mission, with a selected-tab URL. Only White is available; the other seven remain planned.
- Home’s Green link opened its preview, focused the Green tab and placed the path at a 20-pixel top margin. About’s Black link opened and focused Black. Shared page navigation opened About and Philosophy and returned to Belts while retaining 100 XP.
- Left/right arrow navigation retained tab focus. Tab from the path heading reached White. Skip focused `belts-content`. The path jump worked again at the same hash. The training header’s Belts link focused the current-practice heading.
- Browser back/forward restored Yellow and Black while preserving 100 XP and planned availability. Native mission disclosures and the FAQ about Yellow Belt opened with Enter.
- The actual pilot was completed through Belts continuation links. Correct Warm-up showed 20 XP and resumed Lesson; completing Lesson showed 50 XP and resumed Quiz; a perfect Quiz showed 100 XP, 3/3 and three completed module cards. Revisit opened Warm-up, and checking it again retained 100 XP. Selecting previews did not award XP.
- Responsive review used same-origin iframes with measured usable CSS widths of 390 and 320 pixels. Client and scroll widths matched. The two-column path, narrow navigation, Yellow mission and expanded approach were visually checked. Tab navigation also changed the mobile selection. These are browser responsive checks, not physical-device tests.
- Proof: `belts-preview.jpg`, `belts-path-preview.jpg`, `belts-progress-preview.jpg`, `belts-mobile-preview.jpg`. Inspected browser error logs contained extension metadata messages and no application errors. One screenshot export timed out; the normal viewport capture succeeded.
- Fighter timing, palette and reduced-motion behavior are inherited unchanged. OS motion preferences were not emulated. The temporary responsive fixture and preview package change were removed before packaging.
- Final TypeScript check and GitHub Pages production build passed. Package CRC and compiled asset references were checked. This update is prepared for manual GitHub upload and is not claimed to be live.

## About update

- About opens as a dedicated page from the home navigation, with its own document title and active header link. The mission, learner cards, original dojo artwork and ready Ryu-style fighter were visually checked on desktop.
- Warm-up, Lesson and Quiz previews changed their content and selected-tab URL. Each preview CTA opened the corresponding live pilot module. About interactions left XP at zero before training.
- Browser back/forward restored the previews encoded in `#about/lesson` and `#about/warmup`.
- The “See how it works” jump focused the overview heading; Tab reached the selected tab and ArrowRight switched steps. Repeating the jump at the same hash worked. The skip link focused `about-content`.
- Native FAQs opened with Enter on desktop and mobile. The account answer correctly describes current-session behavior.
- Warm-up awarded 20 XP for the correct answer. The 20 XP and a chosen Philosophy habit survived About, Philosophy, training and home navigation.
- At the About release, “Explore the belts” returned to the existing home belt path; the Belts release replaces that destination with the dedicated page. About marks only White as pilot ready and the remaining seven belts planned.
- Responsive review used same-origin iframes with 390 and 320 usable CSS pixels. Document client width and scroll width matched at both widths. The intro, training controls, fighter previews and expanded FAQ were visually checked. Shared Philosophy navigation also fit at 320 pixels. This was a browser responsive review, not a physical-device test.
- Screenshots: `about-preview.jpg`, `about-training-preview.jpg`, `about-mobile-preview.jpg`. Inspected browser logs contained no application warnings or errors.
- No fighter timing or palette changes were made. Existing reduced-motion behavior remains; OS motion preferences were not emulated.
- TypeScript and the final GitHub Pages production build passed. The responsive review fixture and temporary preview package change were removed before packaging.

## Philosophy update

- Dedicated page visually checked on desktop, including original dojo artwork, the clean background and the ready 8-bit Ryu-style fighter. Proof: `philosophy-preview.jpg`.
- Home navigation opens Philosophy; Order, Respect and Honor home cards open the matching tab. Selected-tab URLs and browser back/forward were checked.
- Tab arrow-key navigation changes the selected principle while retaining tab focus. The skip link focuses the Philosophy main content; the code jump focuses its heading and Tab reaches the first checkbox. Repeating the code jump also works.
- Native scenario disclosures were opened with Enter, showing the correct next move.
- Checking all three habits displays 3/3 and completion feedback. Unchecking one updates the count. Choices survived home, Philosophy and training navigation within the open page.
- Start white belt opened Warm-up. Its correct answer awarded 20 XP; navigation back retained the chosen habit. No Philosophy action awards XP.
- Responsive layouts were checked in same-origin iframes with 390 and 320 usable CSS pixels. Document client width and scroll width matched at both widths. Expanded examples, checkboxes and the practice CTA were visually checked. Mobile selection updated the count. Proof: `philosophy-mobile-preview.jpg`.
- Browser logs inspected for this update contained extension metadata errors and no application errors. This was a desktop-browser responsive review, not a physical-device test.
- Reduced-motion support is inherited from the existing fighter and CSS. OS motion preferences were not emulated.
- Final TypeScript check and GitHub Pages production build passed. The temporary responsive fixture and preview-only package change are excluded from the update.

## Current 8-bit character update

- TypeScript and production GitHub Pages build passed after the final character and responsive changes.
- All three sprite sheets were inspected visually and checked for transparency, eight complete poses and foot anchors. Sheets are 1774 × 887; crops use actual coordinates rather than assuming equal integer cell dimensions.
- Render code was reviewed: each displayed frame is one complete body, sampled onto a 64 × 56 grid, sixteen opaque colors and nearest-neighbor scaling. Head, neck, chest and arms are not transformed independently.
- Desktop preview visually checked: Ryu-style hero and footer, boxer in Warm-up, blue-outfit fighter in Quiz, connected contours and clean hero/card backgrounds. Lesson art and belt characters use the original reference. Proof: `home-preview.jpg`.
- Hero idle was observed in quiet mode with different calm frames and a one-pixel bob. Card fighters reported zero reactions before interaction.
- Mouse entry on the hero triggered one punch, which returned to quiet mode. The reaction count remained one while the pointer stayed in place.
- Keyboard focus on Warm-up and Quiz triggered independent complete-frame reactions. Both reported punch mode and a windup frame; Warm-up returned to quiet before the Quiz reaction.
- Mobile layout was visually checked in a same-origin iframe with 390 usable CSS pixels. Document client width and scroll width were both 390. Boxer and Quiz fighter feet align with scene ground despite SVG letterboxing. Obsolete narrow-screen actor-position overrides were removed. Proof: `mobile-characters-preview.jpg`.
- Updated Warm-up awarded 20 XP for the correct answer and loaded the 8-bit Ryu-style training character.
- Inspected browser logs contained extension metadata errors and no application errors.
- Reduced-motion and offscreen/hidden-tab behavior were reviewed in source. OS motion-preference changes were not emulated.
- The temporary mobile fixture is removed before packaging. This package is for manual GitHub upload; the update is not claimed to be live.

## Existing pilot validation

Previously verified, with learning logic unchanged by this visual update:

- Incorrect Warm-up earns no XP; correct answer earns 20; repeat completion does not award twice.
- Lesson completion brings XP to 50.
- A 2/3 quiz earns no quiz XP. A retry with 3/3 brings the total to 100 and displays practice-complete feedback.
- Home reflects earned XP during the open session. Reloading resets the session.
- Local Pages URLs work under `/bushido-ops/`, including hash navigation, artwork and fonts.

The desktop is a faithful reconstruction of the design, not a claim of pixel-for-pixel identity. Full curriculum, durable progress, comprehensive accessibility review and broader device testing remain future work.
