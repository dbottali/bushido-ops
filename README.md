# Bushido Ops — Pixel-Accurate Prototype

This version solves the visual-detail problem by using the generated pixel-art mockup as the main page artwork.

## Why this exists

Trying to recreate detailed pixel-art sprites, dojo scenery, wooden platforms, bamboo, scrolls, HUD elements, and arcade panels with pure HTML/CSS produces ugly placeholder graphics.

For this level of detail, the correct workflow is:

1. Design the visual language as artwork.
2. Use artwork/assets in the webpage.
3. Build HTML/CSS around those assets.
4. Later, slice the mockup into real reusable assets: background, sprites, buttons, icons, panels, belt characters, etc.

## Files

- `index.html` — static GitHub Pages page.
- `assets/bushido-ops-pixel-page.png` — the detailed pixel-art landing artwork.

## Publish on GitHub Pages

1. Create a GitHub repository.
2. Upload `index.html` and the `assets/` folder.
3. Go to **Settings → Pages**.
4. Select the main branch and `/root`.
5. Save.

## Important note

This is a **visual prototype / presentation landing page**, not the final production implementation.
The next production step is to create a proper asset kit and rebuild the page with real HTML sections.
