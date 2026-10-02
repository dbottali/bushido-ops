# Bushido Ops — project brief and delivery plan

Product owner: Damiano. Initial release: 0.1, interactive prototype.

## Product
Practical, welcoming cybersecurity training in a pixel-art dojo. A session consists of a warm-up, a short lesson, and a quiz. The eight-belt path describes the learning journey. Copy and visual direction follow the supplied English-language reference.

## Design contract
`public/art/dojo-reference.png` is the approved reference. Preserve its ivory, red, and navy palette, pixel frames, Japanese dojo, characters, section order, and content. Use original illustration regions without redrawing them. Text, navigation, buttons, exercises, progress bars, and dialogs are accessible UI. Desktop follows the reference proportions. Smaller screens reflow the same content so text and controls remain usable. Future visual changes require the product owner's direction.

## Release 0.1 — implemented
- Home navigation, hero, warm-up/lesson/quiz cards, why, eight belts, three principles, and final CTA.
- White-belt phishing practice: interactive warm-up, three-part lesson, three-question quiz, and feedback.
- XP: 20 + 30 + 50. A module awards once per session. Repeated completions cannot inflate XP.
- Eight belt previews; only the white-belt pilot is playable. Future content is explicitly marked.
- Responsive layout, keyboard-accessible controls, local fonts, and custom favicon.
- Optional page-scoped agent actions: read session progress and open a training module.
- Arcade animation: original white-gi pixels are separated into a small canvas rig. The torso, head, and front arm use stepped poses at 8 updates per second; characters guard, jab, and react to hover. Smaller belt characters have staggered idle motion. Animation honors reduced-motion preferences and skips drawing offscreen actors.

## Prototype boundaries
This is a working prototype, not a complete course. Progress lives in React state for the currently open page; reloading resets it. No learner accounts, database, analytics, payments, certifications, or external integrations. Belt advancement beyond the pilot is not implemented. The review site is private to its owner. The phrase “No signup” describes the learning interface, not the hosting access. Animation uses a rig of existing illustration pixels; it is not a newly authored sprite-sheet animation. A single image-generation attempt for a full eight-frame sheet returned usage_limit_reached, so no generated sprite asset is used.

## Next milestones
1. **Approve the interface and pilot.** Compare desktop with the reference and review mobile, keyboard use, explanations, and XP behavior. Resolve design deviations before expanding.
2. **Define learners and a complete white belt.** Select independent beginners, UniHackers students, or both. Define learning outcomes, lessons, duration, assessment, and what a belt means. A belt must not imply an accredited certification.
3. **Save learner progress.** Decide guest versus account-based learning and privacy/retention expectations. Add durable persistence; test reloads, repeated completions, and independent learners.
4. **Test with a small learner group.** Observe comprehension, completion, and whether learners can apply the skill. Fix the difficulties observed.
5. **Release to learners.** Review all content, finish accessibility and mobile QA, provide essential privacy information, and explicitly select the audience before changing access.

## Acceptance criteria
- Desktop section order, illustration regions, palette, and proportions match the reference.
- Every navigation item, belt, card, and CTA has a meaningful destination or preview.
- A beginner can complete the three pilot modules without coaching.
- Wrong answers explain the principle; retries do not award duplicate XP.
- Mobile has no horizontal overflow, and controls remain readable and reachable.
- Prototype limitations are visible, and unfinished content is not presented as available.

## Decisions still open
Primary learner audience; full white-belt curriculum; persistent progress; belt advancement rules; when and whether to make the review site public.
