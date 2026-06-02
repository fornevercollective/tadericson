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

### GitHub Pages (example)
Add to `vite.config.ts` if deploying to a subpath:
```ts
base: '/tadericson/',
```
Then use a simple deploy action or `gh-pages` package.

Recommended: deploy `dist/` as-is to root of a custom domain (tadericson.com).

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
- [ ] 2D section content population
- [ ] Self-host all images + generate proper responsive sizes

## Original site
The live reference site is still at https://tadericson.com (this PWA is a ground-up modern mobile-first rebuild).

All original imagery and text © Tad Ericson / Fornever Collective.

---

Built continuing the Grok PWA build conversation.
