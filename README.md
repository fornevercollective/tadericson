# tadericson.com — PWA

Progressive Web App rebuild of [tadericson.com](https://tadericson.com), the personal site of Tad Ericson (Fornever Collective).

## Features
- **Full SPA** with client-side routing for TV / FILM / VEVO / 3D / 2D / TREE / INFO sections
- **Image galleries** with detail views (images from archive + cached by SW for offline)
- **Structured credits** pulled from the original site
- **Ancestry TREE** section with research lines
- **PWA**: Installable, offline-first (via vite-plugin-pwa + Workbox), auto update prompt
- **Elegant minimal UI** matching the spirit of the original artistic/portfolio site
- Responsive, keyboard friendly, fast

## Tech
- Vite + React 19 + TypeScript
- Tailwind CSS v4
- React Router
- Framer Motion (subtle transitions)
- Lucide icons
- Sonner toasts
- vite-plugin-pwa (generateSW, manifest, runtime cache for external portfolio images)

## Getting started

```bash
npm install
npm run dev
```

Build + PWA output:

```bash
npm run build
npm run preview
```

The `dist/` folder is a fully static PWA ready for any static host (Vercel, Netlify, GitHub Pages, Cloudflare Pages, etc.).

## PWA specifics
- Manifest + icons in `/public`
- Service worker precaches app shell + recent images
- `beforeinstallprompt` captured for custom Install button
- Works fully offline after initial visit (browse sections + view cached images)

## Deploy

GitHub Actions are set up for this repo:

- **`.github/workflows/ci.yml`** — Runs on every push/PR to `main`: `npm ci`, lint, full TypeScript + Vite build (including PWA service worker + manifest generation), and verifies the PWA output files exist.
- **`.github/workflows/deploy.yml`** — On push to `main` (or manual `workflow_dispatch`): builds the site and deploys the `dist/` folder to **GitHub Pages** using the official `actions/deploy-pages` flow (OIDC, no long-lived tokens).

### Enabling GitHub Pages deployment
1. Push this repo (including the `.github/workflows` files).
2. Go to the repository **Settings → Pages**.
3. Under "Build and deployment", set **Source** to **GitHub Actions** (this is what "Actions enabled" usually refers to).
4. (Optional) Add your custom domain `tadericson.com` in the same Pages settings and configure DNS (CNAME or A records as documented by GitHub). The PWA manifest is already configured for root scope.

The deploy workflow will then automatically publish on every push to `main`.

### Subpath deploys (e.g. GitHub user/org site preview)
If you ever deploy to a sub-directory like `https://fornevercollective.github.io/tadericson`:
- Set the `VITE_BASE` environment variable in the deploy workflow (or as a Repository Variable).
- Update `vite.config.ts` to respect it (already partially wired):
  ```ts
  const base = process.env.VITE_BASE || '/'
  ```
- The PWA plugin will pick up the correct base for the manifest and service worker scope.

For the real `tadericson.com` (custom domain), leave base as `/` (current default).

### Other hosts
The plain `npm run build` output in `dist/` works on Vercel, Netlify, Cloudflare Pages, any static host, or even direct S3/CloudFront. Just point the host at the `dist` folder contents. The included service worker will still provide offline + installable PWA behavior.

## Content & Images
- All project/credit data lives in `src/data/projects.ts`
- Thumbnails currently reference the original myportfolio CDN (publicly accessible)
- **Replace images** with your own optimized assets (WebP preferred) in `/public` or a CDN when ready for production. Update the `images` arrays in the data file.
- Add richer descriptions, additional photos, video embeds per project as desired.

## Next steps (ideas)
- [ ] Interactive ancestry tree visualization (D3 / SVG / react-flow)
- [ ] Search + filter across all credits
- [ ] Lightbox with swipe for project images
- [ ] Dark mode toggle persisted
- [ ] Contact / collab form (Formspree or similar)
- [ ] RSS or simple blog for ancestry updates
- [ ] 2D section: flesh out with more real projects and descriptions (stubs exist)
- [ ] Self-host all images + generate proper responsive sizes

## Original site
The live reference site is still at https://tadericson.com (this PWA is a ground-up modern mobile-first rebuild).

All original imagery and text © Tad Ericson / Fornever Collective.

---

Built continuing the Grok PWA build conversation.
