# Moon Foods

A mobile-first, fully static Astro website. The only ordering destination is Square: no cart, checkout, accounts, payments, customer data or database are stored here.

## Current status

- Repository: [IqbalHarris/moon-foods](https://github.com/IqbalHarris/moon-foods). The GitHub Pages test deployment targets [iqbalharris.github.io/moon-foods](https://iqbalharris.github.io/moon-foods/).
- Logo concept **05** is integrated from the supplied transparent `assets/Logo.png`. The original is preserved. A light badge keeps the logo’s navy lettering readable against the dark site.
- `[SQUARE_ORDERING_URL]` remains a placeholder. Every ordering button currently leads to a clearly labelled “Ordering link coming soon” notice. Once a valid HTTPS URL is provided, all global ordering buttons open it in the **same tab**, with no JavaScript required.
- Food category descriptions and story text are sample copy. Confirm them before launch. Opening hours, location, pickup and delivery details are explicitly marked as unconfirmed; empty phone, email and social fields are omitted.
- A preview notice keeps search-engine indexing disabled until the owner clears it.

## 1. Run locally

Install Node.js 24 LTS and pnpm 11.25.0. In this folder:

```sh
pnpm install
pnpm dev
```

Open the local address printed in the terminal (normally `http://127.0.0.1:4321`). Leave that terminal running. Press Ctrl+C to stop it.

To check the production version:

```sh
pnpm test
pnpm build
pnpm preview
```

The build validates content and image references, runs Astro’s TypeScript checks, optimizes uploaded images, and produces only static files in `dist/`.

## 2. Set the Square URL

In Pages CMS, open **Business settings → Square ordering URL**, paste the real full HTTPS URL, and save. Locally, edit `squareUrl` in `src/content/business.json`.

Keep the special value `[SQUARE_ORDERING_URL]` until you have the correct address. Do not paste a made-up URL. Section buttons whose destination is `square` automatically use this setting. Food categories can optionally link to specific parts of the Square menu; they contain no pricing or order state.

## 3. Sign into Pages CMS

Pages CMS becomes available **after this project is in a GitHub repository**; it does not edit a local folder.

1. Visit [app.pagescms.org](https://app.pagescms.org/).
2. Sign in using the GitHub account that owns or can edit the repository.
3. Authorize the Pages CMS GitHub app for this repository.
4. Select the repository and its `main` branch.
5. The root `.pages.yml` file creates **Business settings**, **Homepage sections**, **Food categories**, and the media library automatically.

The hosted editor is free. GitHub permissions and app installation must be approved by the account owner. The actual hosted editor has not been connected or end-to-end tested because repository setup is deferred.

## 4. Add, remove, hide or reorder homepage sections

Open **Homepage sections → Sections**.

- **Add:** add a list item and complete its unique ID, style, heading, display order and theme. IDs use lowercase letters and hyphens, such as `summer-special`.
- **Remove:** remove the list item and save.
- **Hide:** turn off **Show this section**. It stays editable but disappears from the page.
- **Reorder:** change **Display order**. Lower numbers come first. Start with 10, 20, 30 so additions can fit between them. Numeric order takes priority over the editor’s list position; equal numbers keep list order.
- **Style:** `hero` is the big introduction; `intro` and `story` are editorial sections; `categories` renders food types; `featured` shows featured category tags; `service` shows pickup/delivery settings; `location` shows location/hours; `cta` is a closing call to action.
- **Theme:** choose `navy`, `gold` or `blue` independently of style.
- **Buttons:** leave both button fields empty for no button. Use `square` as the destination for the global ordering URL, `#section-id` for a visible section, or a full HTTPS address.
- **Images:** choose an upload and give it an accessible description. The build automatically generates WebP sizes for raster images and preserves SVG files. Avoid uploading the nine-concept reference sheet.

The first visible section gets the main page heading. Navigation links adapt when the food, story or location sections are hidden. The animation uses the total rendered story height, so section changes do not create separate timelines or abrupt resets. Keep a hero first for the intended design, but the renderer supports reordering every section.

## 5. Edit food categories

Open **Food categories → Food types**. Add or remove entries, edit their descriptions and images, set a numeric display order, and toggle **Include in featured sections**. The same categories populate all category sections. Featured sections use the selected categories as tags.

These are promotional food types, not a duplicate transactional menu. Manage current dishes, prices, stock, pickup, delivery and payments in Square.

## 6. How edits reach the website

Pages CMS saves content and uploads as commits to the selected GitHub branch. A commit to `main` triggers `.github/workflows/deploy.yml`. It tests and validates the project, runs the production build, and deploys the resulting files to GitHub Pages. A failed build leaves the previous successful deployment live; inspect the repository’s **Actions** tab for the specific content error.

For local editing, change the three JSON files under `src/content/`. The development preview updates automatically. Commit and push changes to `main` to update the online test site. Pages CMS uses the same files once the owner authorizes its GitHub app.

## 7. Deploy to GitHub Pages later

The workflow follows the [official Astro GitHub Pages approach](https://docs.astro.build/en/guides/deploy/github/), using `withastro/action` and `actions/deploy-pages`. No hosting tokens or paid services are required.

1. Create a **public GitHub repository** for free GitHub Pages hosting. Put this project at the repository root on branch `main`. Include the hidden `.github/` directory, `.pages.yml`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, source and public assets. Exclude `node_modules`, `.pnpm-store`, `.astro`, `dist`, and test results using the supplied `.gitignore`.
2. In **Settings → Pages → Build and deployment → Source**, select **GitHub Actions**.
3. If Actions are disabled for the account/repository, enable them. The account must allow the standard Pages deployment permissions in the supplied workflow.
4. In **Actions → Deploy Moon Foods to GitHub Pages**, choose **Run workflow** on `main`, or push a new commit.
5. Once the workflow is green, open the URL shown in **Settings → Pages**. Connect Pages CMS as described above.

The workflow reads the Pages origin and repository base path from `actions/configure-pages`. `astro.config.mjs` uses those values for every generated asset, canonical URL and home link. User/organization root sites and `/repository-name/` sites are both supported; no account name needs to be hard-coded.

Before launching publicly, confirm the Square URL and business details, replace sample food/story text, then clear **Preview notice** in Business settings. This removes the `noindex` directive.

## 8. Custom domain later

1. Add the desired domain in **GitHub repository Settings → Pages → Custom domain**.
2. Configure your domain’s DNS using [GitHub’s custom domain instructions](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site). Exact records depend on whether this is an apex domain or subdomain.
3. Add `public/CNAME` containing only the domain (for example `www.example.com`), without `https://`.
4. Run the deployment again. The workflow reads the updated domain and base path from Pages; project links automatically become root-relative for the custom domain.
5. Enable **Enforce HTTPS** once GitHub provisions the certificate.

For a local build targeting a custom domain, set `SITE_URL` to its full HTTPS origin and `BASE_PATH` to `/`.

## Animation and accessibility

The samosa is a lightweight, layered SVG. GSAP and ScrollTrigger load only on screens at least 768px wide with no reduced-motion preference and no detected low-memory/low-core/data-saving restriction. One timeline, `scrub: true`, maps scroll position to ingredient drift, filling, pastry panels, folding, crisping, steam, chutney and the final crescent composition. CSS sticky keeps the illustration pinned without intercepting clicks.

Phones, constrained devices, JavaScript-disabled browsers and reduced-motion users see a finished static composition. Reduced-motion preferences also disable smooth anchor scrolling and hover transitions. Motion has no essential information. Native links, a semantic navigation disclosure, visible focus rings, a skip link, dynamic heading levels and persistent mobile ordering work independently of GSAP.

Fonts are self-hosted. There are no tracking scripts, third-party font requests, cookie banners, video backgrounds or canvas renderers. Open Graph imagery is derived only from the supplied logo; no generated sharing image is used.

## File guide

| File | Purpose |
| --- | --- |
| `src/content/business.json` | Business, ordering, contact and metadata settings |
| `src/content/homepage.json` | Homepage section list |
| `src/content/food.json` | Promotional food categories |
| `.pages.yml` | Pages CMS editing controls |
| `src/assets/uploads/` | CMS image uploads, optimized during build |
| `src/components/FoodScene.astro` | Layered SVG food illustration |
| `src/scripts/animation.ts` | Reversible scroll timeline |
| `src/styles/global.css` | Design tokens and responsive styling |
| `.github/workflows/deploy.yml` | Automatic GitHub Pages publishing |
| `VALIDATION.md` | Checks completed and remaining external checks |

## Repository-subpath check

In PowerShell:

```powershell
$env:SITE_URL='https://example.github.io'
$env:BASE_PATH='/moon-foods'
pnpm build
node scripts/check-output.mjs /moon-foods
Remove-Item Env:SITE_URL,Env:BASE_PATH
pnpm build
```

This is a build test only; it does not contact or deploy to that example account.
