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
- Quiet pixel animation: the white-gi character stays intact in cached whole-character frames. Automatic idle motion is limited to one source pixel, with long pauses, distinct timings, and a still footer character. Mouse entry or keyboard focus triggers one brief role-specific reaction; keeping the pointer in place does not repeat it. Belt characters alternate small breathing or weight-shift motions. Animation honors reduced-motion preferences and pauses offscreen or in hidden tabs.

## Prototype boundaries
This is a working prototype, not a complete course. Progress lives in React state for the currently open page; reloading resets it. No learner accounts, database, analytics, payments, certifications, or external integrations. Belt advancement beyond the pilot is not implemented. The review site is private to its owner. The phrase “No signup” describes the learning interface, not the hosting access. Animation uses complete frames of the existing illustration with small, stepped position changes; the body is never separated into moving parts or rescaled between frames. A dedicated hand-drawn sprite sheet remains future work.

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

## Approved character direction — 3 October 2026

- Main hero: preserve the original Ryu-style white-gi character.
- Warm-up: a boxer with red gloves.
- Quiz: a blue-outfit kung-fu fighter inspired by Chun-Li.
- Idle motion stays very small. Larger gestures require mouse interaction or keyboard focus.

The original hero fix is implemented. The two new character images are pending because image generation is currently usage-limited. They are not included in this update. See `CHARACTERS.md` for the intended sprite specifications.
