# Release 0.1 validation

- TypeScript check passed before final packaging; final source is checked again in the publishing workflow.
- Desktop home visually reviewed against supplied reference. Original dojo artwork and hero/footer lettering are reused. Borders, navigation, and regular text are native UI; this is a faithful reconstruction, not a claim of pixel-for-pixel identity.
- White-belt warm-up: incorrect answer keeps XP at 0; correct answer earns 20; repeat completion remains at 20.
- Lesson completion brings XP to 50.
- Quiz: 2/3 answers earns no quiz XP; a retry with 3/3 brings total to 100 and displays practice-complete feedback.
- Home reflects earned XP during the same open session. A fresh navigation/reload resets session state as documented.
- Mobile home and dojo tested at 390 CSS pixels in a temporary same-origin iframe. Both document widths remained 390 pixels; warm-up interaction awarded 20 XP. The temporary fixture is removed before publishing.
- The earlier split-body animation has been replaced by the quiet whole-character update documented below.
- The preview browser reported no registered WebMCP tools. Page-scoped tool validation is unavailable in that context; WebMCP is optional and was not a user-requested release requirement.
- Browser-console errors inspected were extension metadata errors, not application errors.

Remaining: full curriculum, durable progress, dedicated hand-authored sprite animation, comprehensive accessibility review, and broader device testing.

## GitHub Pages build

- Dedicated Vite client build completed successfully; TypeScript validation passed.
- The static entry mounts the existing React home and pilot, with no server dependency.
- Generated HTML, JavaScript, CSS, artwork, favicon, and both local font URLs returned successfully under the `/bushido-ops/` prefix in a local HTTP verification.
- Both character image references resolve relative to the page directory, including when the page uses a URL hash for training navigation.
- The compiled entry replaces the earlier full-page-image `index.html`.
- Pages browser QA has now been repeated after making the existing dependency tree accessible inside the isolated preview. The Pages adapter continues to mount the same home and white-belt pilot.

## Quiet animation update

- TypeScript check and production Pages build passed.
- Desktop Pages preview visually checked: complete character contours, original layout, no separated head or arm. The current home screenshot is in `home-preview.jpg`.
- With no interaction, all four home fighters reported quiet mode and zero reactions; an observed quiz idle pose moved by only one source pixel.
- Entering the hero with the mouse triggered exactly one attention reaction. After its 900 ms sequence it returned to quiet mode; the reaction count stayed at one while the pointer remained over it.
- Belt CSS was inspected in the running browser: three motion patterns, periods of 5.2/6.1/7 seconds, and staggered delays.
- White-belt warm-up completed in the updated preview and awarded 20 XP. Its training character loaded in quiet mode.
- Inspected browser logs contained an extension metadata error and no application error.
- Reduced-motion behavior is implemented in canvas and CSS and was reviewed in source; OS preference changes were not emulated in this check.
