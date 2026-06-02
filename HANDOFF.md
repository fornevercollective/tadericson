# HANDOFF / RESTART DOC — tadericson-site (as of latest session)

**Project root:** `/Users/qbit/dev/tadericson-site` (branch `tadericson-site`)  
**Goal of the site:** Cinematic personal PWA + daily-driver research/sounding station. Full-bleed processed video (Live Lens / feed) as immersive background. Translucent/iridescent glass work surfaces over it. Reinforces both legacy film work + current "code world" (aito, mustream, Grok Notes, blank, quantum, ancestry, llm-lab, etc.). Single source of truth = `src/data/siteContent.ts`.

**Last user direction (this session):** 
- Make pixelization + color effects "affect light" and feel awesome like the bg on https://lambda.ai (holographic, prismatic, caustics, moving light on the blocks).
- Make the overlay areas (drawer, tool-pane, search-bar, floating lens-controls) iridescent / holographic crystal-like and **less like plain "Translucent glass over live video bg"** (reference: the attached iridescent glass cube photo with deep purple/cyan/gold refraction, speculars, internal flows, light play).
- Support the 3 new local test videos in the bg for easy effect testing: `/Users/qbit/Downloads/fd30a1ff-... .mp4`, `3ea4523a-..._1080_hd.mp4`, `4ce06eb2-..._1080_hd.mp4`. (They were copied into `public/videos/test1/2/3.mp4` for quick access.)

All previous explicit requirements from the long thread remain (exact header layout with 32x32 live preview + waveform right of name + specific pills "code work tree chat | live paper audio sboad todo", ^ for uiVisible / pure feed, + for floating, overview-style left dropdown, full original sections restored, wisper captions replacing old activate button + collapsible, coverflow in drawer, localStorage tools, etc.).

---

## Current Working State (builds clean, usable)

- **Video as always-on full-bleed bg** (`fixed inset-0 z-0 <canvas>` + hidden `<video>`). Processing pipeline always runs when a feed is active.
  - Sources (controlled via floating BG SOURCE):
    - `camera` (getUserMedia video+audio)
    - `stream` / URL (external http or relative like `/videos/testN.mp4`)
    - `file` (user-picked via native file input; object URL)
  - Pipeline (all 1280x720 internal):
    1. Offscreen: horizontal flip (mirror movement), pixelation (block downscale + nearest upscale with `imageSmoothingEnabled=false`).
    2. Main: draw the processed, cheap post-blur via CSS `filter`.
    3. `applyTrackingEffects` (get/putImageData): thermal false-color ramp, fax (threshold + scanlines + invert), **mixed-seg** (red dark-luma highlights + accumulating COM for green "TRACK" circle + label). 
    4. **Recent light/iridescent enhancement** (to satisfy lambda.ai + crystal request): cheap animated `hue-rotate` + `saturate` canvas filter composite passes (one right after pixelation on the blocky data, one post-effects). Phase-driven so colors "breathe" and light moves across the quantized pixel blocks. This is the "pixelization color effect affect light" part — no more heavy per-pixel sin in the JS loop.
  - 32x32 header preview canvas (top-left group) always draws the *current fully processed frame* (scaled). Click it to toggle the current source.
  - Gesture layer (when `uiVisible=false`): pointer drag on pure bg adjusts pixel/blur live.
  - Local test clips are pre-copied to `public/videos/test1.mp4` etc. so they survive dev server restarts.

- **Header (solid white #fff, no glass on header itself — per history):**
  - Left group (clicking the whole name area sets `toolMode='lens'` + opens drawer):
    - Menu (drawer toggle)
    - `+` (toggle `floatingControlsVisible` — hides the left-top lens/captions panel)
    - `^` (toggle `uiVisible` — hides search + drawer + tool-pane for pure full-bleed feed vs. translucent surfaces mode)
    - 32x32 processed preview canvas (the "camera" / live icon)
    - "TAD ERICSON"
    - Waveform canvas (right of name, 92x15, dark stroke for white header). **Click the waveform to activate the mic** (starts waveform animation + wisper captions even if feed is off or stream-only).
    - **Inline live caption readout** (small mono text next to waveform): shows last wisper caption or "— listening —" when mic active. Truncated, hover for full. Updates live.
  - Right: PWA install/update bits + compact upper pills **exactly "code work tree chat | live paper audio sboad todo"** (no SECS).
    - Left subgroup (code/work/tree → `sections` mode with full ported content; chat → opens the original grok share link).
    - `|` separator.
    - Right subgroup (live → activates feed + floating + mic; paper→research, audio, sboad→sounding, todo→todos).
    - Active styling (black pill on current toolMode or floating).

- **Thin white search bar** (under header, always white flex):
  - Left: custom "Sections ▾" button that opens a positioned menu with `<details><summary>` collapsible categories (Cinematic / Live, Original Sections with subs, Research Tools). Clicking items sets `toolMode`.
  - Central search input (Enter adds to sounding board as quick capture).
  - Right: native `<select>` for "other tools" (aito, overview, blank, chat, phrase stub).

- **Body (only when `uiVisible`):**
  - Left drawer (300px, white glass, toggleable, marginTop 0):
    - Coverflow photo browser (140px container, 3-layer absolute imgs with dynamic translate/scale/rotateY + opacity + click zones on left/right halves of the image + small arrow buttons. Like Andrew Coulter Enright style. Photos currently picsum placeholders — easy to swap real assets).
    - Title + location.
    - CHATS & LINKS (grok share, aito, overview, blank, fornevercollective gh, socials).
    - Compact versions of the research tools (paper textarea LS-synced with main, audio recorder list, sounding board, todos).
  - Right flex-1 main-area:
    - The floating lens-controls (fixed, left-top, aito data-row style, dark iridescent glass, z-50ish):
      - Always-visible collapsed strip: "LIVE CAPTIONS wisper" + buf/latency/chunks + last 1-2 captions. Click to toggle expand.
      - Expanded (when `isCaptionsExpanded`): PIXELATE/BLUR sliders (live refs), aito/GMUNK note, **BG SOURCE** (CAM / URL / FILE buttons + conditional inputs + quick TEST 1/2/3 buttons that load the local clips), MIX LOOK buttons (normal/thermal/fax/mixed-seg with active styling).
      - Bottom note about click-to-collapse + server.
    - `.tool-pane` (iridescent glass): content switches on `toolMode`.
      - `sections` (default): full stacked original content — Work (legacy full cards + summaryCredits), Code & Systems (full codeProjects), The Tree, Collective & Brands, Contact. All from `siteContent.ts`. Readable dark text on the glass.
      - `research` / paper: full textarea (LS auto).
      - `audio`: recorder + list + DL.
      - `sounding`: input + list + clear.
      - `todos`: add/check/delete with categories.
      - `lens`: small placeholder text.

- **Iridescent overlays (the big visual request):**
  - `.iridescent-glass` (light): multi-gradient bg, high blur + saturate + brightness, colorful low-opacity flowing `::before` pseudo (screen blend, slow 45s animation), inset speculars, box-shadows. Applied to search-bar, drawer, tool-pane.
  - `.iridescent-glass-dark` (for floating lens-controls): dark base + vibrant conic refraction pseudo, slower 55s anim.
  - Caption strip has extra top highlight line.
  - Labels in dark glass get bluish tint + glow.
  - Header deliberately kept solid white (history requirement) with the new readout fitting in.
  - Feels much more "thick refractive crystal catching light" (purple/cyan/gold flows, highlights) and less flat white/gray glass. Works over the now-colorful processed bg.

- **Live captions (wisper):**
  - Replaces old "activate camera feed" primary action.
  - Mic audio → MediaRecorder chunks (~1.35s webm) → POST localhost:8765/transcribe-chunk → python wisper wrapper → text appended to `liveCaptions` state.
  - Buffer/latency/chunks shown in strip.
  - Works with cam (bundled) or stream/file (separate `startMicOnly`).
  - Collapsible by default to small info box.
  - Header waveform click also activates the mic path.
  - Requires the companion server running (see run section).

- **State (all in App.tsx, no router):**
  - `toolMode`, `feedMode` ('camera'|'stream'|'file'), `streamUrl`, `selectedFile`/`selectedFileUrl`, `isFeedOn`, `isMicActive`, `isCaptionsExpanded`, `floatingControlsVisible`, `uiVisible`, `lookMode`, pixel/blur refs, liveCaptions + captionInfo, various LS-backed research tools, coverflowIndex, drawer open, etc.
  - Refs for live values in rAF (pixel/blur/look/phase) + media streams/analyser/recorder.

- **Persistence:** localStorage for paper, sounding, todos (and drawer versions).

- **PWA:** full (manifest with shortcuts, beforeinstallprompt, useRegisterSW, icons in public + generated).

- **Tech:** React 19 + TS + Vite 8 + Tailwind + lucide-react + pure Canvas 2D + browser Media (getUserMedia, MediaRecorder, AudioContext/Analyser, <video>). No framer, no router, no sonner. Minimal.

- **Perf recovery (after "super slow and glitchy"):** 
  - Canvas sizes set **once** per feed start.
  - No more heavy per-pixel trig in the main loop (replaced by 2 cheap filter drawImage passes for the light/holo effect).
  - Throttled 32x32.
  - Waveform rAF no longer spins when idle.
  - CSS iridescent animations slowed to 45-55s + smaller footprints + will-change.
  - Test videos excluded from SW precache via workbox globIgnores + .gitignore.
  - The "awesome" visuals are preserved but now run at reasonable FPS.

**Build output:** clean `npm run build`. dist has the videos (for local testing) but they are not precached.

---

## How to Run / Restart Tomorrow

1. `cd /Users/qbit/dev/tadericson-site`
2. `npm run dev:clean` (recommended — clears Rolldown/Vite caches that often cause "Failed to get current dir" panics after edits).
3. In **another terminal**: `node transcribe-server.cjs` (or `npm run captions:server`). This is required for live wisper captions + the header readout. It listens on :8765, expects the python wisper wrapper at `~/models/audio/local-grok-audio.py` + ggml models.
4. Browser: allow camera + microphone when prompted.
5. To test the new videos + light effects:
   - Click `+` or the LIVE CAPTIONS strip to show/expand the floating panel.
   - BG SOURCE → click **TEST 1**, **TEST 2**, or **TEST 3** (instantly loads the local clips as bg with full processing, pixel light, etc.).
   - Or FILE → PICK VIDEO FILE (can pick the originals from Downloads or anything else) → LOAD.
   - Or URL mode and type `/videos/test1.mp4` then LOAD.
6. Click the **waveform** (right of TAD ERICSON) to start mic/captions independently (header readout appears, floating panel pops, captions flow).
7. `^` in header → pure full-bleed feed (minimal header + bg + gesture drag still works).
8. `+` → hide the floating lens/captions panel.
9. Header 32x32 or the top **LIVE** pill → toggle the current feed source.
10. Left menu (hamburger) → toggle drawer.
11. Research tools live in both drawer (compact) and main tool-pane (full when selected via dropdown or pills).
12. `npm run build && npm run preview` for production-like test (PWA installable).

**Wisper model note:** base.en is fast for chunks. The server is pure Node + child_process + temp files + CORS.

**Test clips location (in this workspace):** `public/videos/test1.mp4` (etc.). The quick buttons use these relative paths.

---

## Key Architecture / Files to Touch

- **src/App.tsx** — 95% of the logic. Look for:
  - State + refs at top (feedMode, isFeedOn, isMicActive, liveCaptions, effectPhaseRef, etc.).
  - `startFeed` / `stopFeed` + the three branches (camera gUM, stream .src, file objectURL).
  - `processVideo` → inner `draw` rAF (flip, pixel on off, main draw, blur, applyTrackingEffects, throttled 32x32, phase advance). **Sizes set once here now.**
  - `applyTrackingEffects` (the get/put + thermal/fax/mixed + the cheap post filter light passes using phase).
  - `setupAudioAnalyserAndWaveform` + `startMicOnly` + `startLiveCaptions` (decoupled).
  - `drawWaveform`.
  - Header JSX (the name group + waveform + inline readout + onClick for mic).
  - Floating lens-controls JSX (the strip + expanded with BG SOURCE + quick tests + hidden file input).
  - The big conditional for tool-pane content.
  - useEffects for LS, initial flat lines, etc.

- **src/data/siteContent.ts** — all the ported legacy + code content. Used verbatim in sections mode.

- **src/index.css** — `.iridescent-glass`, `.iridescent-glass-dark`, their ::before + keyframes, overrides for search/drawer/tool, caption extras, data-row, live-badge, etc. Header white rules. Old "translucent glass" comments updated in spirit.

- **vite.config.ts** — PWA config (manifest shortcuts, workbox globIgnores for videos, icons).

- **transcribe-server.cjs** — the wisper companion (http, /transcribe-chunk, exec python, temp .webm, CORS).

- **public/videos/** — the 3 test MP4s (gitignored for size).

- **COLLAB.md** + **README.md** — older history / high-level. HANDOFF.md is the fresh restart snapshot.

- No other major deps or files.

---

## Open Items / Things User Has Mentioned in History (for restart)

- The 3 specific new videos for effect testing (now supported + pre-copied + quick buttons).
- Iridescent overlays + light-in-pixelization (implemented with the crystal image + lambda.ai as direct inspiration; perf-tuned).
- Exact header structure and "no SECS" pill text (locked in).
- Waveform as mic activator + caption readout next to it (done).
- Wisper integration details (server still external, chunk size, buf reporting).
- Performance (we just recovered from the "super slow and glitchy" after the fancy effects).
- Full sections vs early stubs (restored).
- LocalStorage for all research tools.
- Coverflow photo interaction in drawer.
- Future ideas from older COLLAB: real portrait asset, deep links, more embeds, "now" highlights, code-lens variant, WebGL for effects, self-hosted images, router?, deploy strategy (this branch vs upstream).

**When restarting tomorrow:** 
- Read this HANDOFF.md first (then COLLAB.md + README for older color).
- `npm run dev:clean` + the captions server.
- Open the floating panel and try the TEST buttons + the new light effects on the clips.
- Describe what you see / what feels slow/glitchy/broken vs. the request.
- Give the next concrete instruction (e.g. "tweak the hue phase speed", "make the iridescent stronger on the drawer only", "add drag to load local video directly onto the bg", "change the TRACK marker style", etc.).

Terminal is ready. Paste this HANDOFF + any new screenshots/direction into the grok.com chat as needed.

**Last successful build:** clean (tsc + vite + PWA). Dist contains the test videos for convenience in this workspace.

---

*Created for handoff / restart. Update this file at the end of future sessions.*