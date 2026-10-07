# Static GitHub Pages demo — 0.5

The root `index.html`, `assets/`, `art/`, fonts and icon are a compiled guest demo for `https://dbottali.github.io/bushido-ops/`. It preserves the approved design and public pages and offers three guest questions.

**Account learning, cloud progress and Stripe require the Cloudflare setup in [SETUP-0.5.md](SETUP-0.5.md).** Uploading this demo to GitHub Pages does not create those services. The account page explains the unconfigured state.

The archive also contains the complete source. For full 0.5 staging, publish the source on a staging branch and connect that branch to Cloudflare Pages with output `dist-cloud`. Keep the existing GitHub Pages deployment while testing, if desired. No remote upload was performed for this release.

To rebuild the static demo:

```sh
pnpm install --frozen-lockfile
pnpm check:pages
```

This emits `dist-pages`. For manual GitHub Pages branch deployment, copy its contents to the repository root, including every emitted JavaScript chunk; do not copy only the illustration. Preserve `.nojekyll` in the root. The hash routes stay within the same static HTML page.

To run it locally with the source, use `pnpm dev:pages`. Do not double-click the HTML with a file URL: the app uses browser modules and HTTP asset paths.

GitHub Pages is the historical demo host, not the selected host for the commercial 1.0 service.
