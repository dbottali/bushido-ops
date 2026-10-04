# Bushido Ops

A pixel-art cybersecurity dojo for practical digital self-defense. This interactive, animated prototype includes a playable white-belt phishing exercise and dedicated About, Belts and Philosophy pages.

![Bushido Ops home](docs/home-preview.jpg)

## What works

- Responsive home page and dojo navigation.
- Belts: eight selectable curriculum previews, practical missions, live White Belt progress and a Continue action that opens the first incomplete pilot module.
- About: the mission, who the dojo is for, an interactive training overview, belt availability and expandable FAQs. Every training preview links to its playable pilot module.
- Philosophy: Order, Respect and Honor, with practical habits, expandable scenarios and a personal dojo code that keeps your choices while navigating the open session.
- 8-bit fighters: a Ryu-style main hero, a boxer for Warm-up, and a Chun-Li-inspired fighter for Quiz. Small idle movements and one complete-body punch on mouse entry or keyboard focus, with no automatic punches.
- Warm-up, short lesson, and three-question quiz with explanations and retries.
- Session XP: 20 for the warm-up, 30 for the lesson, and 50 for a perfect quiz. Each module awards once per session.
- Keyboard-accessible controls and support for reduced-motion preferences.

Only the white-belt pilot is playable. Progress is held in memory and resets when the page reloads. Learner accounts, persistent progress, and the remaining curriculum are future work.

## Run locally

Requirements: Node.js 22.13.0 or later and pnpm 11.25.0, as pinned in `package.json`.

```sh
git clone https://github.com/dbottali/bushido-ops.git
cd bushido-ops
pnpm install --frozen-lockfile
pnpm dev
```

Open the local URL printed by the development server. A clean clone uses the portable development profile.

## Check and build

```sh
pnpm exec tsc --noEmit
pnpm build
pnpm start
```

The production build creates a Cloudflare Worker and browser assets in `dist/`. `pnpm start` previews that build locally through Wrangler.

## Deployment

This repository contains the full application source and a browser-only build for GitHub Pages. The earlier Sites review deployment is separate and is not updated by a GitHub upload.

The Worker build requires a compatible hosting runtime. GitHub Pages uses the dedicated browser-only build, which preserves the animated home and the playable pilot:

```sh
pnpm dev:pages
pnpm build:pages
```

The static build is generated in `dist-pages/`, with asset URLs configured for `https://dbottali.github.io/bushido-ops/`. Copy the contents of that directory into the repository root for branch-based GitHub Pages publishing. [Deployment instructions](docs/PAGES.md).

## Stack and project notes

React 19, TypeScript, Vinext/Vite, Tailwind CSS, Radix UI, and Cloudflare Workers. Artwork and local fonts are included under `public/`.

- [Project brief and roadmap](docs/PROJECT.md)
- [Validation and known limitations](docs/QA.md)
- [Characters and 8-bit animation](docs/CHARACTERS.md)
- [Philosophy content and interactions](docs/PHILOSOPHY.md)
- [About content and navigation](docs/ABOUT.md)
- [Belts curriculum and session progress](docs/BELTS.md)
- [Upload the latest Belts update](docs/BELTS-UPDATE.md)
- [Upload the About update](docs/ABOUT-UPDATE.md)
- [Upload the Philosophy update](docs/PHILOSOPHY-UPDATE.md)
- [Upload this animation update](docs/ANIMATION-UPDATE.md)
- [Platform and runtime details](docs/PLATFORM.md)

The ready-to-upload update preserves the existing project. Committing it to the current branch keeps earlier versions available through Git.
