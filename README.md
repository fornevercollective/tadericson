# Tad Ericson — Cinematic Personal PWA

Dark, atmospheric site for Tad Ericson (filmmaker / camera technician / Fornever Collective).

**Signature feature:** Live Lens — real-time webcam feed with controllable pixelation + blur (GMUNK / aito inspired) right in the hero.

Fully installable Progressive Web App.

## Quick Start

```bash
npm install
npm run dev:clean   # recommended after any config or dependency changes (clears Rolldown/Vite caches)
```

Or for maximum diagnostics on native issues:

```bash
npm run dev:trace
```

Allow camera when prompted for the Live Lens.

The `dev:clean` script is the best way to recover from the Rolldown "Failed to get current dir" panics we saw (it always starts with a pristine cache). The dev server is also being run under live monitoring in the collaboration session.

## Build

```bash
npm run build
npm run preview
```

## Collaboration

See [COLLAB.md](./COLLAB.md) for the live handoff between this terminal build environment and the grok.com superheavy planning chat.

## PWA

- Auto-updating service worker
- Install prompt in nav
- Update banner
- Manifest with shortcuts
- All proper icons (including maskable)

## Tech

Vite + React 19 + TypeScript + Tailwind + lucide-react + vite-plugin-pwa.

Content and direction driven from the superheavy chat on grok.com.
