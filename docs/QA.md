# Bushido Ops validation — 3 October 2026

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
