# Validation record

Checked locally on 27 September 2026. No deployment was attempted after the owner requested local-only work.

## Passed

- Production static build and Astro/TypeScript checks: zero application errors, warnings or hints. Rollup reports two harmless annotation warnings from an upstream Zod dependency; its comments are stripped during bundling.
- Six automated tests: valid content, section additions/hiding/removal/reordering, category reordering, URL/subpath handling, rejection of duplicate IDs and unsafe URLs, Pages CMS field coverage and workflow structure.
- Production builds at `/` and `/moon-foods/`: all internal anchors, image paths, responsive image candidates, CSS and font references resolve to generated files. Canonical URLs include the repository subpath.
- Browser layout checks at 320×568, 390×844, 820×1180 and 1440×900. No horizontal document overflow. Persistent mobile Order Now remains visible at the narrowest tested width.
- Mobile navigation opens, follows its section links and closes. Ordering buttons reach the honest pending-link notice. Internal anchors exist, and there is one H1.
- Desktop scroll forward assembles the samosa; returning to the top restores zero pastry opacity and zero progress. A single scrubbed timeline avoids independently triggered section animations.
- Static finished illustration, text and links remain usable when all JavaScript is blocked by a local test server’s Content Security Policy.
- Reduced-motion client branch exercised using a local fixture that supplies a reduced-motion media-query result before application scripts load. GSAP does not mount; the completed illustration remains visible. The fixture applies the matching static CSS rules. This is a simulated preference test, not a change to the user’s OS settings.
- Keyboard Tab reaches the visible skip link. Links and the native navigation disclosure are keyboard-operable; Escape closes the enhanced mobile disclosure.
- Uploaded logo loads correctly. Header image is optimized to approximately 7 KB WebP instead of loading the 264 KB original. The larger supplied logo is used only for sharing metadata.
- Production HTML is approximately 5 KB gzipped. Initial application JavaScript is approximately 2 KB uncompressed. The GSAP/ScrollTrigger animation chunk is separate (approximately 114 KB uncompressed) and is skipped on small, reduced-motion, low-resource or data-saving devices. Fonts are served locally.

## External checks still pending

- The real Square URL has not been supplied. Same-tab URL handling and the placeholder state are verified, but an actual Square menu, pickup or delivery flow cannot be tested yet.
- GitHub repository, Pages deployment, and hosted Pages CMS login/save/rebuild checks are deferred at the owner’s request. Configuration is validated locally; the account-side integration is not claimed as tested.
- Business address, hours, pickup/delivery details, contact channels and final food/story copy still need owner confirmation. The preview notice and `noindex` remain enabled.

## Repeatable checks

```sh
pnpm test
pnpm build
node scripts/check-output.mjs
node scripts/check-subpath.mjs
```

`node scripts/qa-server.mjs` serves the built site on `http://127.0.0.1:4322/` with two temporary local test routes: `/__qa/reduced/` and `/__qa/no-js/`. These fixtures are part of the local testing script, never part of the deployed site. Stop the server with Ctrl+C.
