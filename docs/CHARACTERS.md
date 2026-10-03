# Bushido Ops — 8-bit characters

The approved cast is implemented: a Ryu-style white-gi main hero, a boxer in Warm-up, and a Chun-Li-inspired fighter in Quiz. The main hero is also used in training and the footer.

| Role | Sprite sheet | Appearance |
| --- | --- | --- |
| Main hero | `public/art/fighters/ryu-frames.png` | White gi, dark belt, red headband |
| Warm-up | `public/art/fighters/boxer-frames.png` | Red gloves, navy shorts, boxing shoes |
| Quiz | `public/art/fighters/quiz-frames.png` | Blue training outfit, hair buns, ivory boots |

Each transparent PNG has eight complete poses in a 4 × 2 sheet. The top row contains guard, knee bend, breathing return and neutral poses; the bottom row contains windup, traveling punch, extended punch and recovery. `lib/fighter-atlases.json` records crop rectangles and foot anchors. All frames of a character share one scale.

`AnimatedFighter` caches each complete pose on a 192 × 168 canvas, samples it onto a 64 × 56 grid, maps opaque pixels to a shared sixteen-color palette and enlarges with nearest-neighbor scaling. No smoothing or dithering is used.

## Movement

- At rest, only calm poses are used. The deeper knee bend is excluded from automatic idle animation. Bobbing is at most two pixels on the 192 × 168 drawing canvas, with pauses and separate rhythms per role.
- Mouse entry triggers one punch lasting 780–900 ms. The complete shoulder, torso, head and arm change together; no detached limb is translated across a static body.
- Keyboard focus on Warm-up or Quiz triggers the same reaction. A 1.8-second cooldown prevents rapid retriggers.
- The footer stays still at rest and changes guard briefly on interaction.
- Reduced-motion mode displays a static guard. Offscreen and hidden-tab animation pauses.

## Background

`public/art/dojo-background-clean.png` has the same 1672 × 941 dimensions as the original reference. Only hero, Warm-up, Quiz and footer-left scene crops use it. Lesson art, lettering, belt characters, icons and other regions still use `dojo-reference.png`.

The clean scene is a fixed layer rather than stretched rectangles following the character. The old illustration remains visible until both the sprite and background have loaded. Sprite frames contain no floor, wall or shadow pixels.

Generation prompts are recorded in `ART-GENERATION.md`; validation is in `QA.md`.
