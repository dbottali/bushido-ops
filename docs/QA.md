# Release 0.1 validation

- TypeScript check passed before final packaging; final source is checked again in the publishing workflow.
- Desktop home visually reviewed against supplied reference. Original dojo artwork and hero/footer lettering are reused. Borders, navigation, and regular text are native UI; this is a faithful reconstruction, not a claim of pixel-for-pixel identity.
- White-belt warm-up: incorrect answer keeps XP at 0; correct answer earns 20; repeat completion remains at 20.
- Lesson completion brings XP to 50.
- Quiz: 2/3 answers earns no quiz XP; a retry with 3/3 brings total to 100 and displays practice-complete feedback.
- Home reflects earned XP during the same open session. A fresh navigation/reload resets session state as documented.
- Mobile home and dojo tested at 390 CSS pixels in a temporary same-origin iframe. Both document widths remained 390 pixels; warm-up interaction awarded 20 XP. The temporary fixture is removed before publishing.
- Original-pixel canvas characters visually reviewed. Idle motion uses four stepped upper-body poses, with a brief jab and hover reaction. Belt characters have staggered idle motion. This is a small rig, not a complete arcade spritesheet.
- The preview browser reported no registered WebMCP tools. Page-scoped tool validation is unavailable in that context; WebMCP is optional and was not a user-requested release requirement.
- Browser-console errors inspected were extension metadata errors, not application errors.

Remaining: full curriculum, durable progress, dedicated hand-authored sprite animation, comprehensive accessibility review, and broader device testing.

## GitHub Pages build

- Dedicated Vite client build completed successfully; TypeScript validation passed.
- The static entry mounts the existing React home and pilot, with no server dependency.
- Generated HTML, JavaScript, CSS, artwork, favicon, and both local font URLs returned successfully under the `/bushido-ops/` prefix in a local HTTP verification.
- Both character image references resolve relative to the page directory, including when the page uses a URL hash for training navigation.
- The compiled entry replaces the earlier full-page-image `index.html`.
- Browser QA could not be repeated for the Pages build because the isolated preview could not access the linked dependency directory. The shared home, pilot, and animation components retain the earlier interactive validation; the Pages adapter changes mounting and asset paths.
