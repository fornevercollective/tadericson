# Tad Ericson — Cinematic Personal PWA

Dark, atmospheric site for Tad Ericson (filmmaker / camera technician / Fornever Collective).

**Signature feature:** Live Lens — real-time webcam feed with controllable pixelation + blur (GMUNK / aito inspired). Controls now live in a left-top aito-style data panel. The lens is both the interactive signature and a metaphor for the capture/process/create practice.

Fully installable Progressive Web App.

**New research / daily driver mode (per latest direction):** 
- Camera icon next to name in header.
- Thin white search bar under header with left/right dropdowns for tools (LIVE LENS, Research Paper, Audio Notes, Sounding Board, Todos+Reminders, Portfolio) and quick external links (aito, overview, blank, original build chat).
- Left pop-out drawer with the portrait + title (moved from center), chat links (grok share + fornevercollective + aito + overview + blank), and built-in tools for writing research papers, recording audio notes, sounding board for ideas/dev, and todos/weekly reminders (all persisted in localStorage).
- Use the page as your cinematic hub + sounding board while the Live Lens runs.

See COLLAB.md for the full executed spec and prior context.

**Content direction:** Full port of legacy tadericson.com credits (film, TV, VEVO, motion graphics, brands) + living "code world" section that pulls in active Fornever Collective / qbit dev projects (aito AI editor, mustream video, Grok Notes, quantum composer, vwall, blank agent launcher, llm-lab, ancestory tools, etc.). The site itself participates in and reinforces the ongoing work.

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

See [HANDOFF.md](./HANDOFF.md) (fresh restart snapshot + current evolved state) and [COLLAB.md](./COLLAB.md) (full historical thread) for handoff between this terminal environment and the grok.com superheavy planning chat. Start with HANDOFF.md when restarting a session.

## PWA

- Auto-updating service worker
- Install prompt in nav
- Update banner
- Manifest with shortcuts
- All proper icons (including maskable)

## Tech

Vite + React 19 + TypeScript + Tailwind + lucide-react + vite-plugin-pwa.

Content and direction driven from the superheavy chat on grok.com.
