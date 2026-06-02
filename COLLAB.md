# Tad Ericson Site — Superheavy Chat (grok.com) + Terminal Collaboration

> **For quick restart / handoff:** See the fresher [HANDOFF.md](./HANDOFF.md) first. This COLLAB.md contains the long historical thread and earlier states.

**Dir:** /Users/qbit/dev/tadericson-site  
**Current Vision (from superheavy chat):** Dark cinematic / atmospheric "GMUNK-inspired" personal PWA. Signature feature = full-bleed **Live Lens** (real getUserMedia webcam → canvas with realtime pixelation + blur post effect, sliders for intensity, "aito style"). High-end film / tech-art aesthetic.

## Current State (rich content + code reinforcement integrated; built cleanly)

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
- Dynamic sections (controlled by activeSection state + goToSection helper for auto-scroll past lens):
  - Work: full ported legacy credits (summary groups + project cards from tadericson.com film/TV/VEVO/motion) using structured data.
  - Code: new "code world" section pulling current active projects (aito + tethered AI editing, mustream-desktop, Grok Notes, quantum composer, vwall, blank, llm-lab, ancestory tools...) with live/demo + GitHub links. This is the key evolution to re-enforce all ongoing work.
  - Collective: brands + multi-sector partners + note that Fornever code work extends the same principles.
  - Tree: expanded lineages + explicit code/research tool parallels.
  - Contact: full socials including fornevercollective GitHub.
- Footer.

**Tech:** React 19 + TS + Vite 8 + Tailwind 3 + lucide-react + full PWA stack. No extra router (state + anchors sufficient for now).

**Build:** `npm run build` succeeds cleanly. Dist has sw.js, manifest, all icons, hashed assets.

## Files of Note
- `vite.config.ts` — PWA + manifest (shortcuts, icons).
- `src/App.tsx` — the entire experience + camera logic + PWA hooks.
- `tailwind.config.ts`, `postcss.config.js`, `src/index.css`.
- `public/` — all pwa-*.png + favicon.ico + source jpg.

## Current Direction & Next Collaboration Steps
The cinematic Live Lens hero + full port of old tadericson.com content (film/TV/VEVO credits, tree lineages, brands) + new "Code & Systems" section (aito, mustream, Grok Notes, quantum composer, vwall, blank, llm-lab, ancestory, etc.) is now live in the local branch. This directly addresses "pull in all the content I am creating in the code world now moving forward to make my personal site help re-enforce all that i am working on" (based on the grok share build chat + this query).

Priorities / feedback needed on:
1. Polish the pixel/blur algorithm further? (more film grain, different composite, WebGL for performance, or keep cheap 2d as-is? "code lens" variant?)
2. Real hero portrait instead of picsum (provide asset or describe).
3. Deep links / sharing: add minimal react-router or enhance hash so /#code etc. land correctly on load?
4. Images & assets: continue myportfolio CDN (with runtime cache) for legacy, or add self-hosted in public/ + generator script?
5. Further reinforcement: project detail views, small interactive embeds (e.g. LUT or processing controls that also affect a code canvas), "Now / Active" highlights, search across film+code?
6. PWA: add screenshots to manifest, test installed behavior on the new sections, update prompt language.
7. Nav/IA + aesthetics: Work vs Code split feel right? More filmic details (grain overlay, typography, reduced motion)?
8. Deploy path: this cinematic version (tadericson-site branch) vs upstream main? Root domain vs subpath? Custom domain setup?

**How to continue the loop:**
- Run the site locally and describe / screenshot what you see.
- Paste this COLLAB.md (or diffs) into the grok.com superheavy chat.
- Reply here with specific instructions ("add X to the work section", "change the blur to use this technique", "make the nav do Y", "add a new control Z").
- Terminal will edit, generate, build, and report back.

Terminal is synced and ready for the next round of direction from the superheavy chat.

## Latest change: wisper captions replace camera feed button (this iteration)
- Removed the prominent "ACTIVATE CAMERA FEED" / "STOP FEED" button from the left-top floating lens-controls section.
- Replaced with live transcription/captions UI powered by the local wisper engine:
  - Uses the downloaded models in ~/models/audio/whisper/ggml (ggml-base.en.bin available; large-v3-turbo-q5_0 preferred if you ran download-whisper.sh).
  - `~/models/audio/local-grok-audio.py transcribe <chunk> --model base.en` (via the new `transcribe-server.cjs` companion).
- The **whole section is now vertically collapsible**:
  - Default (collapsed): small info "caption box" showing the last 1-2 live caption lines + buffer info (buf XXXms, last latency, chunk count).
  - Click the strip header (or the +/-) to expand vertically and reveal the pixel/blur sliders + MIX LOOK controls (still useful for the visual lens effects while captions run).
- How it works:
  - Click the **camera icon next to name in the (white) header** → starts the Live Lens visual feed (flipped, mixed effects for seg/tracking) + audio waveform + live wisper captions.
  - Browser records short (~1.35s) audio chunks from the same mic stream.
  - POSTs to http://localhost:8765 (the node server you start with `npm run captions:server` or `node transcribe-server.cjs`).
  - Server writes temp webm, shells out to the python wisper wrapper, returns text → appended to the caption box in real time.
  - Buffer/latency info is shown live in the small box.
- Run both:
  - `npm run dev:clean`
  - In another terminal: `npm run captions:server`
- The visual lens canvas remains (with all prior flip + thermal/fax/mixed effects + gesture drag + header waveform).
- The floating panel is now primarily a live caption + buffer info surface (as requested), collapsible to the "smal info caption box".

Update COLLAB or the share chat with screenshots of the small caption box + expanded state if desired. The server is pure node (no extra deps) and re-uses the exact wisper setup from the models dir.

## Latest UI direction executed (this session)
- Camera icon (lucide) placed immediately next to "TAD ERICSON" in the fixed header.
- Floating Live Lens bubble controls moved to **left top** of the main content area and restyled with aito-like data rows + pulsing LIVE badge (mimics the clean left/top data + tether/live indicators in fornevercollective.github.io/aito + its ControlPanel / top bar).
- Thin **white search bar** directly under the header, with **left dropdown** (switches main focus: LIVE LENS / Research Paper / Audio Notes / Sounding Board / Todos+Reminders / Portfolio) and **right dropdown** (quick links to aito, overview, blank, original grok build chat, phrase-search stub from blank).
- **Main pic + title** relocated from old hero center into the **left pop-out drawer** (toggle via menu icon or DRAWER button). Drawer also contains the original chat links (grok share + aito/overview/blank/fornever) + built-in compact + focusable tools:
  - Research Papers (textarea, auto localStorage saved; full editor in main when selected).
  - Audio Notes (mic record via MediaRecorder, list with play/rename/download; session blobs).
  - Sounding Board (quick capture for dev ideas, sounding board thoughts, reminders — Enter in search bar also feeds it).
  - Todos & Weekly Reminders (add with category dev/todo/reminder, check, delete, persisted).
- These make the page immediately usable as a research paper writer, audio note recorder, and sounding board for dev/todos/weekly reminders while keeping the cinematic Live Lens (canvas + processing) always accessible in a variable-size stage with the aito-style controls.
- Old rich portfolio content accessible via "portfolio" mode in the top dropdown (stub cards) + full data still in src/data.
- Layout is now a full-viewport dashboard (header + white search + flex drawer | main) while preserving PWA, SW update, install, and the exact Live Lens pixel/blur real-time offscreen processing.
- `npm run build` succeeds cleanly. Run `npm run preview` (or dev) to experience.

Next steps from user direction can iterate on the editors, add real blank phrase-search viz into a mode, wire real overview components, make lens a persistent small widget, etc.

## Reinforcement Strategy (how the site now pulls in + amplifies code world work)
- Legacy film/TV/VEVO/brand content fully ported into structured data + rendered in cinematic cards + summary lists (sourced from tadericson.com + upstream main data model).
- New dedicated "Code" nav + section surfaces the active ecosystem (aito is the clearest bridge — AI tethered camera/LUT/masking directly continues the camera + processing practice; mustream for video systems; Grok Notes/blank for the agentic terminal loops used to build this very site; quantum, gpu viz, llm stack, ancestry code tools).
- Hero tagline, bottom motto, manifest, shortcuts, descriptions, and CTAs now explicitly name the code + systems dimension.
- Live Lens comment "Aito / GMUNK style" already nods to the aito project.
- BG feed generalized: header 32x32 / LIVE pill / floating controls now support switching "BG SOURCE" between local CAM (original) and STREAM (paste URL from ffmpeg/ffplay local server, or fornevercollective.github.io/blank/ video endpoint etc). The full pixel/blur/mixed-seg/thermal/fax processing, 32x32 preview, gestures, and (via separate mic) waveform + wisper captions all apply to the external stream in the full-bleed bg. Makes it trivial to composite your live code-world video tools into the personal site "reinforcement hub".
- All external links point to fornevercollective GitHub Pages deploys and repos so the PWA acts as the hub that re-enforces and narrates the current work.
- Content lives in src/data/siteContent.ts — easy to keep extending as new code projects ship (add to codeProjects array, it appears immediately).
- Auto-scroll helper makes browsing the rich content after the tall lens practical.

Next concrete experiments (when directed): code-lens mode, embedded mini demos, self-hosted image pipeline, router for shareable deep links, or more grain/film treatment.

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
