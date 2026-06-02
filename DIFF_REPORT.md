# Diff Report: /Users/qbit/dev/tadericson-site (tadericson-site branch) vs https://github.com/fornevercollective/tadericson/ (origin/main) + deployed https://fornevercollective.github.io/tadericson/

**Date:** Updated in current session (mobile fixes + comparison refresh)  
**Local branch:** tadericson-site (working tree has mobile responsiveness fixes applied)  
**Upstream:** origin/main (commit c709122a511da743750a3de81e7418718e0900d0)  
**Deployed site:** GitHub Pages served from builds of `main` (subpath `/tadericson/`) — **still the pre-cinematic-rotator/terminal version**

---

## Executive Summary

The local workspace (`tadericson-site` branch) contains a **parallel cinematic redesign** of the Tad Ericson PWA (much more advanced than when the original report was generated). It is **not merged** into `origin/main`.

- **Local (tadericson-site + current dist/):** Dark, atmospheric, GMUNK/aito-inspired "Live Lens" as the **signature full-bleed hero feature** + daily-driver research station. Real-time webcam/stream/file → canvas with controllable pixelation + blur + thermal/fax/mixed looks + iridescent holographic light effects. Wisper live captions (requires companion transcribe-server). Extensive UI: header w/ live 32x32 preview + waveform mic activator + inline captions, thin search bar w/ categorized sections dropdown + quick tools, left research drawer w/ coverflow photo browser + built-in paper/audio/sounding/todos (LS persisted), floating aito-style lens controls panel (BG SOURCE: cam/url/file + TEST vids + sliders + MIX). Sections port full legacy credits + code world. SPA React state nav. Minimal deps (no router/framer/sonner). Tailwind 3 + PostCSS. Root-deployment oriented (ready for tadericson.com). Strong PWA (shortcuts, install/update). **Mobile fixes applied in this session** (see below). **No CI/deploy workflows** (focused dev workspace).

- **Upstream main + deployed site:** Lighter, elegant, more "classic portfolio" aesthetic (default white/light with dark support). Uses scroll-to-section navigation (long single-page). Includes a **media rotator + interactive terminal emulator** (with commands for next/prev/play/speed/add etc.) in addition to live lens. Separate `src/data/projects.ts`. Has GitHub Actions for CI (lint+build) and deploy to Pages. Configured for subpath deployment (`/tadericson/`). Caches original myportfolio.com images at runtime via Workbox. Includes `rotator-server.cjs`. Uses Tailwind v4 via Vite plugin, framer-motion, react-router-dom, sonner. More complete sections including a "video" section.

- **Upstream main + deployed site:** Lighter, elegant, more "classic portfolio" aesthetic (default white/light with dark support). Uses scroll-to-section navigation (long single-page). Includes a **media rotator + interactive terminal emulator** (with commands for next/prev/play/speed/add etc.) in addition to live lens. Separate `src/data/projects.ts`. Has GitHub Actions for CI (lint+build) and deploy to Pages. Configured for subpath deployment (`/tadericson/`). Caches original myportfolio.com images at runtime via Workbox. Includes `rotator-server.cjs`. Uses Tailwind v4 via Vite plugin, framer-motion, react-router-dom, sonner. More complete sections including a "video" section.

- **Live deployed vs local dist:** Completely different experiences because built from different source trees. Live uses `/tadericson/` base + light theme + rotator/terminal + registerSW.js script. Local dist/ is root-based, dark cinematic live-lens + research tools primary (wisper, iridescent, drawer, search, coverflow, test clips), no separate registerSW (hook), different icons + manifest + description.

**Mobile:** Local now has dedicated fixes (see "Mobile Fixes Applied" section). Upstream deployed not inspected for mobile in this pass but uses traditional scroll + router.

The original reference site (https://tadericson.com) is still the Adobe Portfolio site (classic artist template with background video, separate from these PWAs).

---

## Branch / Git Divergence

```sh
git diff --stat tadericson-site origin/main -- ':(exclude)package-lock.json'
```

29 files changed, 1017 insertions(+), 557 deletions(-)  [excluding lockfile noise]

### Files only in origin/main (added on main side)
- `.github/workflows/ci.yml`
- `.github/workflows/deploy.yml`
- `public/apple-touch-icon.png`
- `public/favicon.png`
- `rotator-server.cjs`
- `src/data/projects.ts`

### Files only in tadericson-site (present locally, absent upstream)
- `COLLAB.md`
- `postcss.config.js`
- `public/apple-touch-icon-180x180.png`
- `public/favicon.ico`
- `public/maskable-icon-512x512.png`
- `public/pwa-64x64.png`
- `public/pwa-icon-source.jpg`
- `src/vite-env.d.ts`
- `tailwind.config.ts`

### Modified (both exist, content differs)
- `.gitignore`, `README.md`, `eslint.config.js`, `index.html`
- `package.json` + huge `package-lock.json`
- `public/favicon.svg`, `public/pwa-192x192.png`, `public/pwa-512x512.png`
- `src/App.tsx` (major rewrite, ~772 lines unified diff)
- `src/index.css`
- `src/main.tsx`
- `tsconfig.app.json`, `tsconfig.node.json`, `vite.config.ts`

**No `dist/` committed** on either (correctly ignored).

---

## Key Feature / UX Differences (Live Lens + Overall)

### Live Lens (common feature but implemented differently)
- **Both** have real-time getUserMedia camera feed with pixelation + blur post-processing on canvas.
- **Local (cinematic focus):** 
  - Full-viewport hero always prominent.
  - Refined processing loop using offscreen canvas for clean sequential pixel-then-blur passes.
  - Refs to avoid stale closures in rAF.
  - Prominent floating control panel (top-right) with "Activate Camera Feed" big button + live sliders for PIXELATE (1-32) and BLUR (0-18).
  - Atmospheric dark overlays, tagline "MOVE • LIGHT • CAPTURE • LIVE".
  - "Live Lens" is the hero experience; nav switches other content while lens can stay visible?
- **Upstream/main (embedded):**
  - Live lens present but part of a richer home section.
  - Also has pixel/blur (slightly different defaults: blur 2 vs local 4).
  - Integrated alongside other media/rotator UI.

### Navigation & Page Structure
- **Local:** Fixed glassmorphic dark nav. Buttons set `activeSection` state. Hero (lens) + conditional content blocks for work/tree/contact (awards/collective are stubs). Feels more "app-like" or modal sections. CTAs in hero jump to sections.
- **Upstream/main + live:** Traditional fixed light nav with `scrollToSection()` smooth anchor scrolling. Long page with distinct `<section id="...">` for home/work/awards/collective/tree/video/contact. "video" section exists upstream (absent in local).

### Additional Interactive Features (upstream only)
- Media rotator (images/videos/gifs cycling).
- Full terminal emulator in the UI:
  - Commands: help, next/prev, play/pause, speed <ms>, list, status, add <url> [type], activate/server, deploy, clear.
  - Simulates "terminal server" for media.
  - `rotator-server.cjs` companion script (`npm run rotator-server`).
- These appear to be experimental features for media/3D/2D sections (per README ideas).

### Content
- **Local:** Projects list is hardcoded inside `App.tsx`. Limited sections populated (work has real credits, tree links back to tadericson.com subpaths, contact links).
- **Upstream:** `src/data/projects.ts` (structured, exported). Awards, collective, video sections have more placeholder or specific content (e.g. VEVO, GRAMMYs mentions). Links to original tree archive.

### Theming & Aesthetic
- **Local:** Dark-first (#111, #0a0a0a backgrounds), cinematic/atmospheric, high contrast text, "live lens" as art piece. Tailwind 3 + custom `.live-lens` filter.
- **Upstream/live:** Light default (white/ zinc), elegant minimal. Has `.dark` CSS vars (README mentions dark mode toggle was implemented). Uses Tailwind 4. More "portfolio site" than "interactive art piece".
- Deployed manifest: light theme_color/background. Local manifest: dark.

### PWA Specifics
| Aspect              | Local (tadericson-site + dist)                  | Upstream main + deployed live                     |
|---------------------|------------------------------------------------|--------------------------------------------------|
| Base / Scope        | `/` (root)                                     | `/tadericson/` (subpath, via VITE_BASE)          |
| Icons in public     | Many variants + source .jpg (pwa-icon-source) + old apple-touch-180 + favicon.ico | Minimal: favicon.png, apple-touch-icon.png, pwa-*.png |
| Manifest colors     | dark (#111111 / #0a0a0a)                       | light (#000000 / #ffffff)                        |
| Description         | "Cinematic personal site PWA featuring a live real-time pixel + blur lens." | "Tad Ericson — Oregon USA. VFX, Film, TV, 3D, Ancestry research. DM for collabs." |
| Shortcuts           | Live Lens, The Tree                            | None in manifest                                 |
| Registration        | `useRegisterSW` hook (virtual:pwa-register/react) inside App | `registerSW.js` script injected + custom listener in main.tsx |
| SW update UX        | "UPDATE" button appears in nav when needRefresh | Confirm dialog on updatefound                    |
| Install UX          | Custom "INSTALL" button in nav (beforeinstallprompt) + INSTALLED badge | (presumably present but not inspected)           |
| Runtime caching     | Not configured (only precache)                 | Caches https://cdn.myportfolio.com/* (original site images) |
| Built index.html    | No registerSW script (hook handles it)         | Includes `<script id="vite-plugin-pwa:register-sw" ...>` |
| 404.html copy       | No (build script doesn't)                      | Yes (`cp dist/index.html dist/404.html`)         |

**Local dist/ is ready for root static hosting.** Live is subpath for org GitHub Pages.

---

## Package / Tooling / Config Differences

**Local package.json name:** `tadericson-site`  
**Upstream:** `tadericson`

**Scripts local:**
- `dev`, `dev:clean` (rm -rf .vite caches), `dev:trace` (RUST_BACKTRACE), `build`, `lint`, `preview`
- Emphasis on recovering from Rolldown/Vite cache panics.

**Scripts upstream:**
- `dev`, `build` (with 404.html copy), `lint`, `preview`, `pwa:build`, `rotator-server`

**Deps local (minimal):**
- react, react-dom, lucide-react
- dev: vite, @vitejs/plugin-react, vite-plugin-pwa, workbox-window, tailwindcss@3, postcss, autoprefixer, @vite-pwa/assets-generator, eslint etc. **No router, no framer, no sonner.**

**Deps upstream (richer):**
- + framer-motion, react-router-dom, sonner
- @tailwindcss/vite (v4), no postcss/autoprefixer in package (v4 handles)

**Vite config:**
- Local: no `base`, Tailwind via postcss + config file, PWA includeAssets lists specific old icons, no runtimeCaching, devOptions enabled.
- Upstream: `base = process.env.VITE_BASE || '/tadericson/'`, Tailwind v4 plugin, PWA has globPatterns + runtimeCaching for myportfolio CDN, different includeAssets.

**Other:**
- Local keeps `tailwind.config.ts` + `postcss.config.js` (Tailwind 3 setup) + `src/vite-env.d.ts`.
- Upstream removed tailwind.config (v4), postcss, vite-env.
- .gitignore differs (details in diff).
- tsconfig.* differ slightly.
- eslint.config.js differs.

---

## Deploy / CI

- **Upstream only:** `.github/workflows/ci.yml` (on push/PR to main: npm ci, lint, tsc build + verify PWA outputs) and `deploy.yml` (on push to main: build + deploy-pages using OIDC).
- Local workspace intentionally omits them (per COLLAB.md context of terminal + superheavy chat iteration).
- README upstream has detailed "Enabling GitHub Pages", subpath notes, custom domain advice.
- Local README is shorter, focused on dev:clean, live lens, collaboration.

---

## Built Artifacts (local dist/ vs live site)

**Local `npm run build` output (dist/):**
- Root paths.
- Dark manifest + icons (includes pwa-64 + maskable + source jpg + favicon.ico + apple-touch-180).
- sw.js + workbox (no registerSW.js because hook-based).
- index.html meta: cinematic live lens description, theme #111111.
- Current asset hashes e.g. index-DW88__jg.js, index-DxXfxRMz.css.

**Live https://fornevercollective.github.io/tadericson/:**
- Subpath `/tadericson/*` everywhere.
- Light manifest (white/black, pwa-192/512 only, no shortcuts).
- Includes registerSW.js.
- index.html references `/tadericson/assets/index-CL0t0KHS.js` + `index-j5hHSx2b.css`.
- Built from main (has "rotator", "terminal", "video" strings in JS).

To reproduce live exactly you would need to checkout main, set VITE_BASE if needed, npm ci, npm run build.

---

## Original Site (for context)
https://tadericson.com — Adobe Portfolio (myportfolio) hosted. Background video, classic nav, separate from the PWA rebuilds. Imagery served from cdn.myportfolio.com (which the upstream PWA caches).

---

## Recommendations / Notes (if action is desired later)

- The two PWAs are **divergent experiments**:
  - `main` = more complete "feature-rich portfolio PWA" with terminal/media experiments + proper deploy pipeline + subpath support + data separation.
  - `tadericson-site` = focused "cinematic live lens art piece PWA" with strong PWA polish (install/update), simpler stack, dark aesthetic, ready for root domain.
- Merging would require choosing aesthetic + deciding what to keep (terminal/rotator? router? framer? live lens prominence?).
- For custom domain tadericson.com, the local dist style (base=/) + perhaps the cinematic version would be suitable.
- Icons need unification; upstream has slimmer set, local has generator + source.
- Live lens code could be extracted/shared if both branches want it.

---

## How to Explore Further (commands run in this workspace)

```sh
# High level
git diff --stat tadericson-site origin/main -- ':(exclude)package-lock.json'

# Core experience diff
git diff tadericson-site origin/main -- src/App.tsx | less
git diff tadericson-site origin/main -- src/index.css

# Config
git diff tadericson-site origin/main -- vite.config.ts package.json

# See what upstream has that local doesn't
git show origin/main:src/data/projects.ts
git show origin/main:rotator-server.cjs
cat .github/workflows/deploy.yml   # (will fail on this branch; use git show origin/main:.github/...)

# To temporarily preview upstream version
# git checkout origin/main -- .   # (destructive to working tree; use worktree instead)
```

---

## Mobile Fixes Applied (this session, to local tadericson-site cinematic branch)

The local version's complex chrome (dense header with name+32px live preview+waveform+inline captions + 10+ nav pills + install/update, search bar w/ dropdown+input+select, 300px left drawer w/ coverflow + compact tools, 260px fixed-position floating lens/captions panel with dynamic left/top) was **not mobile-friendly** (overflow, clipped controls, hard-coded px assuming desktop, tiny taps, no wrapping).

**Fixes implemented + built:**

- Added `isMobile` state + resize listener (<640px).
- **Header:** responsive px, smaller name (18/21), compact waveform on mobile (60x12), hide long caption readout on mobile, smaller text/gaps on pills (7-9px), INSTALL/UPDATE tighter, right pills container scrollable (overflow-x-auto) + flex-shrink, +/^ buttons smaller.
- **Search bar:** dynamic marginTop, narrower left "Secs ▾" on mobile, shorter placeholders, compact select options, input flex/min-w reduced.
- **Left dropdown menu:** dynamic width (min(240px,92vw)).
- **Drawer:** media-query driven overlay on mobile (position:fixed, top~82, width ~78vw capped, shadow) while remaining in-flow 300px pusher on desktop. Added mobile backdrop (tap to close). Height calc(100dvh - ...).
- **Lens controls (floating):** dynamic top/left in style (mobile always left~8, adjusted tops), CSS forces full-width ~calc(100vw-16px) on mobile, reduced max-h, font.
- **Coverflow (in drawer):** dynamic smaller base sizes (108x86 container, scaled imgs 86/72, offsets 12px) + smaller arrows.
- **General CSS media (max-640 + max-380):** app 100dvh, header auto/min-h + name override, search auto/h-wrap, drawer overlay rules, lens full-w rules, tool padding tighter, .max-w-6xl 100%, larger min tap 28px, body overflow-x:hidden. Iridescent preserved.
- Sections grids (md: already) stack on mobile; content constrained.
- Rebuilt successfully (tsc + vite + PWA).

Result: no whole-page horizontal scroll, controls usable/visible on small portrait (e.g. iPhone), drawer overlays content cleanly w/ dismiss, lens panel usable full-width at top, header/search compact without losing function. Desktop experience unchanged. Pure-feed (^) and gestures still work.

Tested via `npm run build` (clean, fresh dist with media queries + logic in bundle).

---

## Current Comparison Outcome / Recommendation

- **To push local to git:** the tadericson-site branch (cinematic + research tools + now mobile-fixed) can be pushed as `git push -u origin tadericson-site` (note: remote currently only has main; this branch was previously initialized as a single "Initial commit" snapshot of the redesign).
- **Vs online:** Deployed remains the upstream main (rotator/terminal/light + subpath). Merging the two experiments would be a large product decision (aesthetic + feature set + deploy target: root vs /tadericson/ + stack).
- **For mobile users of live site:** the online version may need its own audit (traditional long page + router likely more forgiving, but live lens embedded + terminal may have own small-screen issues).
- **Next for local:** run the captions server for wisper, test on real devices (drag gestures, mic, TEST video buttons, drawer coverflow, search add, LS tools all persist), consider real portrait assets, then either PR the branch or set up custom domain deploy of dist/ (root base ready).

*This report was refreshed in current session. Mobile fixes are the actionable output for "fix for mobile".*
