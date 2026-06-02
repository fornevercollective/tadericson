# Tad Ericson Site — Superheavy Chat (grok.com) + Terminal Collaboration

**Dir:** /Users/qbit/dev/tadericson-site  
**Current Vision (from superheavy chat):** Dark cinematic / atmospheric "GMUNK-inspired" personal PWA. Signature feature = full-bleed **Live Lens** (real getUserMedia webcam → canvas with realtime pixelation + blur post effect, sliders for intensity, "aito style"). High-end film / tech-art aesthetic.

## Current State (just built successfully)

### Core PWA
- Full `vite-plugin-pwa` setup with autoUpdate SW.
- Rich manifest (name, shortcuts to Live Lens + Tree, categories, proper icons + maskable).
- Icons generated from custom dark cinematic source mark.
- Install button integrated into the fixed nav (appears when eligible).
- "INSTALLED" badge.
- New version "UPDATE" button when SW has update (via useRegisterSW).
- Theme color dark (#111).

### UI / Experience
- Fixed glass nav (black/80 + blur) with section buttons + PWA controls.
- Hero: full viewport live camera canvas (hidden video element feeds it). 
  - Toggle "Activate Camera Feed".
  - While active: two sliders (PIXELATE 1-32px, BLUR 0-18px).
  - Improved processing using offscreen canvas for cleaner pixel then blur passes.
  - Atmospheric gradient overlay + tagline "MOVE • LIGHT • CAPTURE • LIVE".
- Center hero content with portrait placeholder + big title + CTA buttons that drive the section state.
- Dynamic sections (controlled by activeSection state):
  - Work: grid of real project credits.
  - Tree: ancestry text + links to original subpages.
  - Contact: links + "DM for COLABs".
  - Awards / Collective: placeholder ready for superheavy chat direction.
- Footer.

**Tech:** React 19 + TS + Vite 8 + Tailwind 3 + lucide-react + full PWA stack. No extra router (state + anchors sufficient for now).

**Build:** `npm run build` succeeds cleanly. Dist has sw.js, manifest, all icons, hashed assets.

## Files of Note
- `vite.config.ts` — PWA + manifest (shortcuts, icons).
- `src/App.tsx` — the entire experience + camera logic + PWA hooks.
- `tailwind.config.ts`, `postcss.config.js`, `src/index.css`.
- `public/` — all pwa-*.png + favicon.ico + source jpg.

## Next Collaboration Steps (for superheavy chat to decide)
Please review the live lens effect (try `npm run dev` → allow camera). 
Priorities / feedback needed on:
1. Polish the pixel/blur algorithm further? (more film grain, different composite, WebGL for performance, or keep cheap 2d as-is?)
2. Fill in "Awards" and "Collective" sections with exact content from original site or new direction.
3. Add more GMUNK / cinematic details (subtle noise, better typography, film burn edges, sound? — note camera has no audio).
4. Real hero portrait instead of picsum (provide asset or describe).
5. Should we add React Router for real /work /tree routes (for sharing deep links)?
6. More PWA: screenshots in manifest? offline.html? periodic sync for new work?
7. Performance / permissions notes for the camera in installed PWA.
8. Any changes to the nav or overall information architecture?

**How to continue the loop:**
- Run the site locally and describe / screenshot what you see.
- Paste this COLLAB.md (or diffs) into the grok.com superheavy chat.
- Reply here with specific instructions ("add X to the work section", "change the blur to use this technique", "make the nav do Y", "add a new control Z").
- Terminal will edit, generate, build, and report back.

Terminal is synced and ready for the next round of direction from the superheavy chat.

### Launching & Monitoring the Dev Server (Rolldown stability)
The dev server has been launched under persistent monitoring (using the available `monitor` tool). All stdout (including optimizer logs, HMR, reloads, and any Rolldown panics with full `RUST_BACKTRACE`) will stream as events in this conversation.

**New convenience scripts in package.json:**
- `npm run dev:clean` — clears `.vite` and `node_modules/.vite` (the most common trigger for the "Failed to get current dir" Rolldown transform panic after config edits, cache clears, or aborted runs) then starts Vite.
- `npm run dev:trace` — launches with `RUST_BACKTRACE=full` for maximum diagnostics on native panics.
- `npm run dev` — normal fast start (use `:clean` after any vite.config.ts / tsconfig / dependency changes).

The monitored instance is currently using the clean + traced launch and came up cleanly on http://localhost:5173/.

If a panic occurs again, the full backtrace will appear here automatically. You can then report it (with the backtrace) to https://github.com/rolldown/rolldown/issues/new?template=panic_report.yml as the crash message requests.

This setup lets us keep the Live Lens + full PWA experience running reliably while we iterate on the rest of the site per the superheavy chat's direction.

---
Built in collaboration — live terminal execution for the web heavy planning chat.
