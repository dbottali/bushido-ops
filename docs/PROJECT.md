# Bushido Ops — project brief and delivery plan

Product owner: Damiano. Initial release: 0.1, interactive prototype.

## Product
Practical, welcoming cybersecurity training in a pixel-art dojo. A session consists of a warm-up, a short lesson, and a quiz. The eight-belt path describes the learning journey. Copy and visual direction follow the supplied English-language reference.

## Design contract
`public/art/dojo-reference.png` is the approved layout reference. Preserve its ivory, red, and navy palette, pixel frames, Japanese dojo, section order, and content. The approved character update adds complete sprite poses and matching clean background crops. Other regions, including lesson art, lettering and belt characters, continue to use the original. Text, navigation, buttons, exercises, progress bars, and dialogs are accessible UI. Desktop follows the reference proportions. Smaller screens reflow the same content so text and controls remain usable.

## Release 0.1 — implemented
- Home navigation, hero, warm-up/lesson/quiz cards, why, eight belts, three principles, and final CTA.
- White-belt phishing practice: interactive warm-up, three-part lesson, three-question quiz, and feedback.
- XP: 20 + 30 + 50. A module awards once per session. Repeated completions cannot inflate XP.
- Eight belt previews; only the white-belt pilot is playable. Future content is explicitly marked.
- Responsive layout, keyboard-accessible controls, local fonts, and custom favicon.
- Optional page-scoped agent actions: read session progress and open a training module.
- Three animated fighters rendered on a 64 × 56 grid with sixteen opaque colors and nearest-neighbor scaling. Each cached frame is a complete redrawn body. Calm idle uses small breathing and bobbing movements, distinct periods and pauses. Mouse entry or card keyboard focus triggers one brief punch without repeating while the pointer remains in place. The footer is still at rest and briefly changes guard on interaction. Belts retain small breathing or weight shifts. Motion honors reduced-motion preferences and pauses offscreen or in hidden tabs.

## Prototype boundaries
This is a working prototype, not a complete course. Progress lives in React state for the currently open page; reloading resets it. No learner accounts, database, analytics, payments, certifications, or external integrations. Belt advancement beyond the pilot is not implemented. “No signup” describes the learning interface. Dedicated generated sprite sheets use complete-body poses, a fixed per-character scale and a shared 8-bit palette; the head and arm are never animated as separate cutouts.

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

All three characters and the matching clean background are included. The latest approved style is 8-bit pixel art. See `CHARACTERS.md` for assets, timing and frame layout.
