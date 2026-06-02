// src/data/siteContent.ts
// Unified content for tadericson.com cinematic PWA
// Ported/adapted from https://tadericson.com (old Adobe Portfolio site)
// + extended with current "code world" work from Fornever Collective / qbit dev ecosystem
// Images for legacy film/TV/VEVO use public myportfolio CDN (cached in prod PWA via workbox if configured).
// For code projects: use descriptive cards + external links (screenshots can be added to /public later or referenced from gh-pages).

export type Project = {
  title: string
  year?: string
  role?: string
  note?: string // category tag e.g. Feature, TV, Code, Ongoing
  description?: string
  link?: string // external detail or live demo
  github?: string
  imdb?: string
  vimeo?: string
  images?: string[] // first used as thumb if present
  tags?: string[]
}

export type CreditGroup = {
  title: string
  items: string[]
}

export const homeIntro = {
  location: 'OREGON USA',
  tagline: 'DM for COLABs',
  roles: 'Filmmaker • Camera Technician • Fornever Collective • Code & Systems',
  ancestryNote: 'Working on my interesting ancestry research with amazing help from elders of the world.',
  codeNote: 'Building live tools for capture, computation, and creative research — AI editors, video systems, quantum experiments, agentic terminals.',
}

export const navSections = [
  'Work', 'Code', 'Collective', 'Tree', 'Contact'
] as const

// Legacy film/TV/VEVO summary groups (from old site + upstream)
export const summaryCredits: CreditGroup[] = [
  {
    title: 'FEATURE FILMS',
    items: ['A.C.O.D. • Adult Children Of Divorce', 'First Winter'],
  },
  {
    title: 'EPISODIC',
    items: ['Unbreakable Kimmy Schmidt', 'Smash', 'Borgia', 'Royal Pains', 'The Fuzz'],
  },
  {
    title: 'MUSIC VIDEOS',
    items: ['Kanye West – Mercy', 'Pit Bull – Penguins of Madagascar Soundtrack', 'Jimmy Eat World – My Best Theory'],
  },
  {
    title: 'COMMERCIALS',
    items: ['Tom Ford – Noir'],
  },
  {
    title: 'MOTION GRAPHICS',
    items: ["55th GRAMMY's – presented by PEPSI", 'WANDERLUST – Peace Love Car 50 State Tour', 'PENNZOIL – Turn Up The Music & Drive'],
  },
]

export const vevoBrands: CreditGroup[] = [
  {
    title: 'BRANDS',
    items: ['VEVO', '55th Grammys', 'PEPSI', 'McDonalds', 'Miracle Whip', 'NIKE', 'Toyota', 'Pennzoil', 'Virgin America', 'SXSW', 'Universal Music Group', 'Sony Music Entertainment', 'Abu Dhabi Media', 'VW'],
  },
  {
    title: 'ASK:REPLY',
    items: ['Thalia', 'Alejandro Sanz', 'David Bisbal', 'Bridgit Mendler', 'J King y Maximan', 'The Saturdays', 'Austin Mahone', 'Krewella', 'Joan Sebastian', 'Florida Georgia Line', 'The Neighbourhood', 'Prince Royce'],
  },
  {
    title: 'LIFT',
    items: ['Paloma Faith', 'Kacey Musgraves', 'The Saturdays', 'Austin Mahone', 'Krewella', 'Florida Georgia Line', 'Avicii'],
  },
  {
    title: 'CAM-OPP',
    items: ['A$AP Rocky', 'Sierra Noble', 'Mindless Behavior', 'Brian McKnight', 'Seal', 'Bullet For My Valentine', 'Krissy Krissy', 'Joell Ortiz', 'Nico Vega', 'YG', 'Everything Everything', 'Gin Wigmore', 'Selena Gomez', 'Guinevere', 'Mathew Koma', 'French Montana', 'Michael Franti', 'Ashanti', 'Nyzzy Nyce', 'Scotty Rebel', 'YoGotti', 'Bonnie Mckee'],
  },
]

// Multi-sector companies (from /info + old site)
export const infoCredits: CreditGroup[] = [
  {
    title: 'Retail',
    items: ['Apple (Fifth Avenue)', 'Discovery Cove Orlando', 'Queen Meb', 'Urban Outfitters', 'FTC Orlando – Steadicam'],
  },
  {
    title: 'Manufacturing',
    items: ['Bumble and bumble', 'Will Leather Goods', 'Stretch Shapes', 'Kəvən™ (Keven Craft Rituals)', 'Aaron Goodman Studios'],
  },
  {
    title: 'Entertainment / VFX',
    items: ['The Molecule VFX', 'Fireshot Productions', 'Omega Darling', 'Greencard Pictures', 'Ghost Robot', 'Capture This NYC', 'Driver Digital', 'D.O. Cariñena SPAIN Tourism Board', 'Tom Ford Noir'],
  },
  {
    title: 'Learning',
    items: ['Ghetto Film School', 'Yoga Slackers', 'The House Of Twigs'],
  },
  {
    title: 'Fundraising',
    items: ['American Lung Association', 'NASA Kennedy Space Center'],
  },
]

// Core legacy projects (expanded from old site + upstream for Work section)
export const legacyProjects: Project[] = [
  // Film
  { title: "Accident", year: "2017", role: "Camera / Production", note: "Feature", description: "Feature film work.", tags: ["film"] },
  { title: "A.C.O.D. (Adult Children of Divorce)", year: "2013", role: "Camera Department / VFX", note: "Feature", imdb: "https://www.imdb.com/title/tt1935896/", tags: ["film"] },
  { title: "First Winter", year: "", role: "Camera", note: "Feature", tags: ["film"] },
  { title: "Yoga Slackers - Slackasana", year: "2010", role: "Camera / Tech", note: "Doc", tags: ["film"] },
  // TV / Episodic
  { title: "Unbreakable Kimmy Schmidt", year: "", role: "Episodic / Graphics", note: "TV", tags: ["tv"] },
  { title: "Smash", year: "2012", role: "VFX / Graphics", note: "TV", imdb: "https://www.imdb.com/title/tt2320807/", description: "NBC musical drama. Motion graphics and visual effects support.", tags: ["tv"] },
  { title: "Borgia", year: "", role: "Episodic", note: "TV", tags: ["tv"] },
  { title: "Royal Pains", year: "", role: "Episodic", note: "TV", tags: ["tv"] },
  { title: "The Fuzz", year: "", role: "Episodic", note: "TV", tags: ["tv"] },
  { title: "Bates Motel", year: "", role: "TV", note: "TV", tags: ["tv"] },
  // VEVO / Music / Commercials / MG
  { title: "Kanye West – Mercy", year: "", role: "VEVO / Music Video", note: "VEVO", tags: ["vevo"] },
  { title: "Tom Ford – Noir", year: "", role: "Commercial / VFX", note: "Commercial", vimeo: "https://vimeo.com/52254724", tags: ["commercial"] },
  { title: "55th GRAMMYs – PEPSI", year: "", role: "Motion Graphics", note: "MG", tags: ["motion"] },
  { title: "Pit Bull – Penguins of Madagascar", year: "", role: "Music Video", note: "VEVO", tags: ["vevo"] },
]

// Current code world projects (Fornever Collective / qbit dev ecosystem)
// These reinforce the capture/process/create/research continuum: camera+AI, video systems, agentic tools, quantum, viz, ancestry tooling.
export const codeProjects: Project[] = [
  {
    title: "aito",
    year: "2025–",
    role: "Creator / Systems",
    note: "CODE • PWA • AI",
    description: "AI photo editing for tethered, high-end workflows. Desktop pro + mobile PWA. Real-time Grok commands, live camera tethering (Canon/Sony/Phase One), film-accurate LUTs + .cube, SAM-powered masking + pressure brush, hatch export. Direct evolution of camera tech + artistic processing.",
    link: "https://fornevercollective.github.io/aito/",
    github: "https://github.com/fornevercollective/aito",
    tags: ["ai", "camera", "pwa", "film", "lut"],
  },
  {
    title: "aito-living-canvas",
    year: "2025–",
    role: "Creator",
    note: "CODE • WebGL",
    description: "Visual core for AI retouching: before/after with six controllable WebGL effect layers (sampling, burn, glass, magnifier, crack...). WebSocket inference channel + mock. Orchestrated via StageForge TUI.",
    link: "https://fornevercollective.github.io/aito/",
    tags: ["webgl", "ai", "canvas", "effects"],
  },
  {
    title: "mustream-desktop",
    year: "2025–",
    role: "Creator / Rust",
    note: "CODE • RUST • ML",
    description: "Rust + egui desktop shell for video: yt-dlp resolve, ffmpeg in-window preview, ffplay/mpv playback, captions lab, optional Python ML sidecar (SAM2 + pose estimation on local files).",
    github: "https://github.com/fornevercollective/mustream-desktop",
    tags: ["rust", "video", "ffmpeg", "ml", "desktop"],
  },
  {
    title: "Grok Notes (grok-cli)",
    year: "2025–",
    role: "Creator",
    note: "CODE • AI • OFFLINE",
    description: "Advanced AI-powered notebook. React/TS + Node. Collaborative, offline-capable for coding, data analysis, ML. Integrated Grok AI assistance. Terminal REPL version too. The meta-tool for agentic workflows (this site itself built inside similar loops).",
    link: "https://github.com/fornevercollective/grok-cli-main",
    tags: ["ai", "notebook", "offline", "terminal", "agent"],
  },
  {
    title: "composer (Quantum Composer)",
    year: "2025–",
    role: "Creator",
    note: "CODE • QUANTUM",
    description: "Offline Quantum Composer inspired by IBM Quantum Composer, for fast iteration before QPU time. μgrad R0 integration, QASM 3.0 VQC export. Part of mueee / quantum-gutter research stack.",
    link: "https://fornevercollective.github.io/composer/",
    github: "https://github.com/fornevercollective/composer",
    tags: ["quantum", "composer", "mugrad", "wasm"],
  },
  {
    title: "vwall",
    year: "2025–",
    role: "Creator",
    note: "CODE • GPU • VIZ",
    description: "GPU image wall (PixiJS) with open image search (no API keys). Fast visual browsing and exploration surface.",
    link: "https://fornevercollective.github.io/vwall/",
    tags: ["gpu", "pixijs", "search", "viz"],
  },
  {
    title: "blank (agent launcher)",
    year: "2025–",
    role: "Creator",
    note: "CODE • AGENT • TUI",
    description: "Download-and-launch terminal for live develop-and-iterate with AI CLI running. Captions/transcript phrase search, scene-linked intel, multi-layout keyboard spiral viz, shadow paths.",
    tags: ["terminal", "agent", "search", "keyboard"],
  },
  {
    title: "ancestory / ancestory1",
    year: "2025–",
    role: "Creator",
    note: "CODE • RESEARCH • VIZ",
    description: "Visual/exploratory interfaces for ancestry research — 'HISTORY ALWAYS HAD OPTIONS - NOW WE BELONG'. Direct code counterpart to the TREE research.",
    tags: ["ancestry", "viz", "research"],
  },
  {
    title: "llm-lab",
    year: "ongoing",
    role: "Creator",
    note: "CODE • LOCAL AI",
    description: "Local LLM workspace: ollama, llama.cpp server, qwen/granite/hermes models, aichat, aider pair-programming, GGUF management. Foundation for all the AI tooling above.",
    tags: ["llm", "ollama", "local", "aider"],
  },
]

// Tree / ancestry lineages (from tadericson.com/tree + subpages)
export const treeLinks = [
  { path: '/tree', label: 'Ancestry' },
  { path: '/firstnation', label: 'First Nation' },
  { path: '/powhatan', label: 'Powhatan' },
  { path: '/lenapehoking', label: 'Lenapehoking' },
  { path: '/roskelyn', label: 'Roskelyn' },
  { path: '/dunkeld', label: 'Dunkeld' },
  { path: '/hauteville', label: 'Hauteville' },
  { path: '/lodbrock', label: 'Lodbrock' },
]

// Code + research tools that parallel or extend the tree work
export const treeCodeLinks = [
  { label: 'ancestory tools', url: 'https://github.com/qbit/ancestory' },
  { label: 'code lineage notes', url: 'https://github.com/fornevercollective' },
]

// Social / contact (extended)
export const socialLinks = [
  { label: 'LinkedIn', url: 'https://www.linkedin.com/in/tadericson/' },
  { label: 'IMDB', url: 'http://www.imdb.com/name/nm2460024/' },
  { label: 'Vimeo / Fornever', url: 'https://vimeo.com/fornever' },
  { label: 'Instagram', url: 'https://www.instagram.com/tadericson/' },
  { label: 'Fornever Collective (code)', url: 'https://github.com/fornevercollective' },
]

// Combined work for simple rendering or filtering
export const allWork = [...legacyProjects, ...codeProjects]

// Helper to get by tag or note
export function getProjectsByTag(tag: string) {
  return allWork.filter(p => p.tags?.includes(tag) || p.note?.toLowerCase().includes(tag))
}
