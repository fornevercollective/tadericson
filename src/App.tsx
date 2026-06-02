import { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation, useParams, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Menu, X, Download, ExternalLink, Sun, Moon } from 'lucide-react'
import { toast } from 'sonner'
import {
  navSections,
  homeIntro,
  summaryCredits,
  vevoCredits,
  infoCredits,
  getProjectsByCategory,
  getProject,
  socialLinks,
  type Project,
} from './data/projects'

function useActivePath() {
  const loc = useLocation()
  return (path: string) => loc.pathname === path || (path !== '/' && loc.pathname.startsWith(path))
}

function Nav() {
  const [open, setOpen] = useState(false)
  const isActive = useActivePath()
  const loc = useLocation()

  // Close mobile nav on route change.
  // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional UI reset on navigation
  useEffect(() => { setOpen(false) }, [loc.pathname])

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--nav-bg)] backdrop-blur">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="font-semibold tracking-[2px] text-lg">TAD ERICSON</Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 text-sm tracking-[1px] uppercase">
          {navSections.map(s => (
            <Link
              key={s.path}
              to={s.path}
              className={`nav-link ${isActive(s.path) ? 'active font-medium' : 'opacity-70 hover:opacity-100'}`}
            >
              {s.label}
            </Link>
          ))}
          <a href="https://tadericson.com" target="_blank" rel="noreferrer" className="opacity-60 hover:opacity-100 flex items-center gap-1">
            ORIG <ExternalLink size={14} />
          </a>
        </div>

        <div className="flex items-center gap-3">
          <PWAInstallButton />
          <ThemeToggle />
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 -mr-2"
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--bg)] px-4 py-4 text-sm tracking-widest uppercase">
          {navSections.map(s => (
            <Link key={s.path} to={s.path} className={`block py-2 ${isActive(s.path) ? 'font-medium' : 'opacity-70'}`}>
              {s.label}
            </Link>
          ))}
          <a href="https://tadericson.com" target="_blank" rel="noreferrer" className="block py-2 opacity-60">ORIGINAL SITE →</a>
          <div className="pt-3 mt-2 border-t border-[var(--border)] flex items-center justify-between text-xs normal-case tracking-normal">
            <span className="opacity-70">Theme</span>
            <ThemeToggle />
          </div>
        </div>
      )}
    </nav>
  )
}

// Minimal type for the beforeinstallprompt event (PWA install prompt)
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform?: string }>
}

// Augment the DOM lib so addEventListener accepts the event name with proper type (no any casts needed)
declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}

function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(display-mode: standalone)').matches
  })

  useEffect(() => {
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) {
      toast.info('Use your browser menu to install (Add to Home Screen).')
      return
    }
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      toast.success('Thanks! Tad Ericson PWA installed.')
      setInstalled(true)
    }
    setDeferredPrompt(null)
  }

  if (installed) return null

  return (
    <button
      onClick={handleInstall}
      className="flex items-center gap-1.5 text-xs uppercase tracking-widest px-3 py-1.5 rounded-full border border-[var(--border)] hover:bg-[var(--card-bg)] transition"
      title="Install PWA"
    >
      <Download size={14} /> INSTALL
    </button>
  )
}

function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light'
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (stored) return stored
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  // Apply class as a side effect only (avoids set-state-in-effect lint rule)
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const toggle = () => {
    const next: 'light' | 'dark' = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    localStorage.setItem('theme', next)
    // DOM update also happens via the effect above
  }

  const isDark = theme === 'dark'
  return (
    <button
      onClick={toggle}
      className="p-2 rounded-full border border-[var(--border)] hover:bg-[var(--card-bg)] transition flex items-center justify-center"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title="Toggle theme"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 pb-20">
        <AnimatePresence mode="wait">
          {children}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

function Footer() {
  return (
    <footer className="border-t border-[var(--border)] py-10 text-xs text-[var(--fg-muted)]">
      <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row gap-y-4 items-center justify-between">
        <div>
          © {new Date().getFullYear()} Fornever Collective — All images © Tad Ericson. Rebuilt as PWA.
        </div>
        <div className="flex gap-4">
          {socialLinks.map(s => (
            <a key={s.label} href={s.url} target="_blank" rel="noreferrer" className="hover:text-[var(--fg)]">{s.label}</a>
          ))}
          <a href="https://github.com/fornevercollective/tadericson" target="_blank" rel="noreferrer" className="hover:text-[var(--fg)] inline-flex items-center gap-1">Source <ExternalLink size={13}/></a>
        </div>
        <div className="text-[10px] opacity-60">PWA • Offline capable • Installable</div>
      </div>
    </footer>
  )
}

function Home() {
  return (
    <PageTransition>
      <div className="pt-12 pb-8">
        <div className="text-center mb-12">
          <div className="uppercase tracking-[4px] text-xs text-[var(--fg-muted)] mb-2">OREGON USA</div>
          <h1 className="text-6xl md:text-7xl tracking-[-3.2px] font-semibold mb-2">TAD ERICSON</h1>
          <p className="text-lg text-[var(--fg-muted)]">DM for COLABs</p>
        </div>

        <div className="max-w-2xl mx-auto text-center mb-12 text-[15px] leading-relaxed text-[var(--fg-muted)]">
          VFX artist, motion designer, and creative technologist. Credits span feature films, episodic television, music videos, commercials, and motion graphics for major brands.
          <div className="mt-4">
            Currently deep in <Link to="/tree" className="underline">ancestry research</Link> with guidance from elders around the world.
          </div>
        </div>

        {/* Quick nav tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-16">
          {navSections.map(s => (
            <Link
              key={s.path}
              to={s.path}
              className="group border border-[var(--border)] hover:border-[var(--fg)] px-5 py-4 rounded flex items-center justify-between text-sm uppercase tracking-widest transition"
            >
              {s.label}
              <span className="opacity-40 group-hover:opacity-70">→</span>
            </Link>
          ))}
        </div>

        {/* Summary credits */}
        <div className="mb-16">
          <h2 className="section-header">SELECTED CREDITS</h2>
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-8 credit-list">
            {summaryCredits.map(group => (
              <div key={group.title}>
                <div className="font-medium mb-1.5 tracking-wide text-sm text-[var(--fg-muted)]">{group.title}</div>
                <ul className="space-y-px">
                  {group.items.map((item, i) => <li key={i}>• {item}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Ancestry teaser */}
        <div className="border border-[var(--border)] bg-[var(--card-bg)] p-8 md:p-10 rounded mb-10">
          <div className="uppercase text-xs tracking-[2px] mb-2 text-[var(--fg-muted)]">TREE</div>
          <div className="text-2xl tracking-tight mb-3">Ancestry Research</div>
          <p className="text-[var(--fg-muted)] mb-6 max-w-prose">{homeIntro.ancestryNote}</p>
          <Link to="/tree" className="inline-block text-sm border-b border-[var(--fg)] pb-px hover:border-[var(--accent-2)]">Explore the lines →</Link>
        </div>

        <div className="text-center text-xs opacity-50 pt-8">This is a progressive web app rebuild of tadericson.com. Works offline after first load.</div>
      </div>
    </PageTransition>
  )
}

function SectionPage({ category, title, extraCredits }: { category: Project['category']; title: string; extraCredits?: React.ReactNode }) {
  const allProjs = getProjectsByCategory(category)
  const [query, setQuery] = useState('')
  const projs = query
    ? allProjs.filter(p => p.title.toLowerCase().includes(query.toLowerCase()) || (p.description || '').toLowerCase().includes(query.toLowerCase()))
    : allProjs

  return (
    <PageTransition>
      <div className="pt-10">
        <div className="flex items-baseline justify-between mb-1">
          <h1 className="section-header !mb-0 flex-1">{title}</h1>
          <Link to="/" className="text-xs opacity-60 hover:opacity-100 hidden md:block">BACK TO HOME</Link>
        </div>

        {allProjs.length > 0 && (
          <>
            <div className="mb-4 flex items-center gap-3">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${title.toLowerCase()}...`}
                className="flex-1 max-w-sm bg-[var(--card-bg)] border border-[var(--border)] rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--fg)]"
              />
              {query && <button onClick={() => setQuery('')} className="text-xs opacity-60 hover:opacity-100">clear</button>}
            </div>
            <p className="text-sm text-[var(--fg-muted)] mb-6">Click any image for details. Images cached for offline viewing.</p>
            <div className="gallery-grid mb-12">
              {projs.length > 0 ? (
                projs.map(p => (
                  <Link key={p.slug} to={`/${p.category}/${p.slug}`} className="gallery-item group">
                    <img
                      src={p.images[0]}
                      alt={p.title}
                      loading="lazy"
                      className="group-hover:scale-[1.03] transition-transform duration-300"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white text-sm font-medium tracking-wide">
                      {p.title} {p.year && <span className="opacity-70">· {p.year}</span>}
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-[var(--fg-muted)]">No matches for “{query}”.</div>
              )}
            </div>
          </>
        )}

        {extraCredits}

        <div className="pt-4">
          <Link to="/" className="back-link"><ArrowLeft size={16}/> Home</Link>
        </div>
      </div>
    </PageTransition>
  )
}

function TV() {
  return <SectionPage category="tv" title="TV" />
}

function Film() {
  return <SectionPage category="film" title="FILM" />
}

function Vevo() {
  return (
    <SectionPage
      category="vevo"
      title="VEVO & MUSIC"
      extraCredits={
        <div className="mb-12">
          <h2 className="text-sm tracking-[1.5px] uppercase text-[var(--fg-muted)] mb-4">Selected Clients & Projects</h2>
          <div className="grid md:grid-cols-2 gap-x-10 gap-y-8 credit-list">
            {vevoCredits.map(g => (
              <div key={g.title}>
                <div className="font-medium mb-1 tracking-wider text-sm">{g.title}</div>
                <div className="text-[var(--fg-muted)]">{g.items.join(' • ')}</div>
              </div>
            ))}
          </div>
        </div>
      }
    />
  )
}

function ThreeD() {
  return <SectionPage category="3d" title="3D" />
}

function TwoD() {
  return <SectionPage category="2d" title="2D" />
}

function Tree() {
  const treeProjects = getProjectsByCategory('tree')
  const [selected, setSelected] = useState<string | null>(null)

  // Simple radial tree visualization (inspired by spatial/mapping patterns in related qbitOS work)
  const centerX = 200
  const centerY = 140
  const radius = 95

  return (
    <PageTransition>
      <div className="pt-10">
        <h1 className="section-header">TREE — Ancestry</h1>
        <div className="max-w-prose text-[var(--fg-muted)] mb-4">
          Ongoing personal research into deep ancestry, guided by elders and primary records.
          Lines currently under active exploration:
        </div>

        {/* Interactive radial tree / map */}
        <div className="mb-8 flex justify-center">
          <svg
            width="420"
            height="290"
            viewBox="0 0 420 290"
            className="border border-[var(--border)] bg-[var(--card-bg)] rounded cursor-pointer"
            onClick={() => setSelected(null)}
          >
            {/* connections */}
            {treeProjects.map((p, i) => {
              const angle = (i / treeProjects.length) * Math.PI * 2 - Math.PI / 2
              const x = centerX + Math.cos(angle) * radius
              const y = centerY + Math.sin(angle) * radius
              const isSel = selected === p.slug
              return (
                <g key={p.slug}>
                  <line
                    x1={centerX}
                    y1={centerY}
                    x2={x}
                    y2={y}
                    stroke={isSel ? 'var(--fg)' : 'var(--border)'}
                    strokeWidth={isSel ? 2 : 1}
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r={isSel ? 7 : 5}
                    fill={isSel ? 'var(--fg)' : 'var(--bg)'}
                    stroke="var(--fg)"
                    strokeWidth="1.5"
                    onClick={(e) => { e.stopPropagation(); setSelected(p.slug) }}
                    className="hover:stroke-[var(--accent)]"
                  />
                </g>
              )
            })}
            {/* center node */}
            <circle cx={centerX} cy={centerY} r="11" fill="var(--fg)" />
            <text x={centerX} y={centerY + 4} textAnchor="middle" fill="var(--bg)" fontSize="10" fontWeight="600">TAD</text>

            {/* labels */}
            {treeProjects.map((p, i) => {
              const angle = (i / treeProjects.length) * Math.PI * 2 - Math.PI / 2
              const lx = centerX + Math.cos(angle) * (radius + 22)
              const ly = centerY + Math.sin(angle) * (radius + 18)
              const isSel = selected === p.slug
              return (
                <text
                  key={p.slug}
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  fill={isSel ? 'var(--fg)' : 'var(--fg-muted)'}
                  fontSize="11"
                  onClick={(e) => { e.stopPropagation(); setSelected(p.slug) }}
                  className="cursor-pointer select-none hover:fill-[var(--fg)]"
                >
                  {p.title}
                </text>
              )
            })}
          </svg>
        </div>

        {selected && (
          <div className="mb-6 p-4 border border-[var(--border)] bg-[var(--card-bg)] rounded text-sm max-w-prose">
            Selected: <strong>{treeProjects.find(p => p.slug === selected)?.title}</strong>.
            Click a node or the background to explore. Full details and images in the grid below.
          </div>
        )}

        <div className="gallery-grid mb-12">
          {treeProjects.map(p => (
            <Link key={p.slug} to={`/tree/${p.slug}`} className={`gallery-item group ${selected === p.slug ? 'ring-2 ring-[var(--fg)]' : ''}`}>
              <img src={p.images[0]} alt={p.title} loading="lazy" className="group-hover:scale-[1.02] transition" />
              <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/75 text-white text-sm tracking-widest">{p.title}</div>
            </Link>
          ))}
        </div>

        <div className="prose prose-sm max-w-none text-[var(--fg-muted)] mb-12">
          <p>More detailed family histories, documents, and DNA notes will live here as the research expands.</p>
          <p className="text-xs mt-3">All images and stories © Tad Ericson / Fornever Collective.</p>
        </div>

        <Link to="/" className="back-link"><ArrowLeft size={16}/> Home</Link>
      </div>
    </PageTransition>
  )
}

function Info() {
  return (
    <PageTransition>
      <div className="pt-10 max-w-3xl">
        <h1 className="section-header">INFO</h1>
        <p className="mb-8 text-[var(--fg-muted)]">Multi-sector companies and collaborators I have had the privilege of working with.</p>

        <div className="grid md:grid-cols-2 gap-x-10 gap-y-10 credit-list mb-14">
          {infoCredits.map(g => (
            <div key={g.title}>
              <div className="font-semibold tracking-wider mb-2 text-sm">{g.title}</div>
              <ul className="space-y-1 text-[var(--fg-muted)]">
                {g.items.map((it, idx) => <li key={idx}>• {it}</li>)}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-[var(--border)] pt-8 text-sm">
          <div className="mb-2 font-medium">Connect</div>
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-[var(--fg-muted)]">
            {socialLinks.map(s => <a key={s.label} href={s.url} target="_blank" rel="noreferrer" className="hover:text-[var(--fg)]">{s.label}</a>)}
          </div>
          <div className="mt-8 text-xs opacity-60">This PWA can be installed for quick access and works offline for browsing credits and images.</div>
        </div>

        {/* Contact / collab form — replace action with your Formspree endpoint (free at formspree.io) */}
        <div className="mt-10 border border-[var(--border)] p-6 rounded bg-[var(--card-bg)]">
          <div className="font-medium mb-1">DM for collabs / ancestry notes</div>
          <p className="text-sm text-[var(--fg-muted)] mb-4">Send a message. I'll get back to you.</p>
          <form
            action="https://formspree.io/f/REPLACE_WITH_YOUR_ID"
            method="POST"
            className="space-y-3"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input name="name" required placeholder="Name" className="bg-[var(--bg)] border border-[var(--border)] px-3 py-2 rounded text-sm" />
              <input type="email" name="email" required placeholder="Email" className="bg-[var(--bg)] border border-[var(--border)] px-3 py-2 rounded text-sm" />
            </div>
            <textarea name="message" required rows={4} placeholder="Message or collab idea..." className="w-full bg-[var(--bg)] border border-[var(--border)] px-3 py-2 rounded text-sm"></textarea>
            <button type="submit" className="px-5 py-2 text-sm border border-[var(--fg)] rounded hover:bg-[var(--fg)] hover:text-[var(--bg)] transition">Send</button>
          </form>
          <div className="text-[10px] mt-3 opacity-50">Form powered by Formspree (or swap for your preferred service). Update the action URL in the code.</div>
        </div>

        <div className="pt-8">
          <Link to="/" className="back-link"><ArrowLeft size={16}/> Home</Link>
        </div>
      </div>
    </PageTransition>
  )
}

function ProjectDetail() {
  const { category, slug } = useParams()
  const project = getProject(slug || '')

  if (!project || (category && project.category !== category)) {
    return <Navigate to="/" replace />
  }

  return (
    <PageTransition>
      <div className="pt-8 max-w-3xl mx-auto">
        <Link to={`/${project.category}`} className="back-link"><ArrowLeft size={16}/> Back to {project.category.toUpperCase()}</Link>

        <h1 className="text-4xl tracking-[-1.5px] font-semibold mb-1">{project.title}</h1>
        {project.year && <div className="text-[var(--fg-muted)] mb-6">{project.year} {project.role && `· ${project.role}`}</div>}

        <div className="space-y-3 mb-8">
          {project.images.map((img, i) => (
            <img key={i} src={img} alt={project.title} className="w-full rounded border border-[var(--border)]" />
          ))}
        </div>

        {project.description && (
          <p className="text-[var(--fg-muted)] mb-6">{project.description}</p>
        )}

        <div className="flex flex-wrap gap-3 text-sm">
          {project.imdb && (
            <a href={project.imdb} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-4 h-9 border border-[var(--border)] rounded hover:bg-[var(--card-bg)]">
              IMDB <ExternalLink size={15} />
            </a>
          )}
          {project.vimeo && (
            <a href={project.vimeo} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-4 h-9 border border-[var(--border)] rounded hover:bg-[var(--card-bg)]">
              Vimeo <ExternalLink size={15} />
            </a>
          )}
          {project.link && (
            <a href={project.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-4 h-9 border border-[var(--border)] rounded hover:bg-[var(--card-bg)]">
              View Project <ExternalLink size={15} />
            </a>
          )}
          <Link to={`/${project.category}`} className="inline-flex items-center gap-1.5 px-4 h-9 border border-[var(--border)] rounded hover:bg-[var(--card-bg)]">
            More in {project.category.toUpperCase()}
          </Link>
        </div>

        <div className="mt-12 text-xs text-[var(--fg-muted)]">Images served from archive CDN and cached locally by the PWA service worker for offline access.</div>
      </div>
    </PageTransition>
  )
}

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tv" element={<TV />} />
        <Route path="/film" element={<Film />} />
        <Route path="/vevo" element={<Vevo />} />
        <Route path="/3d" element={<ThreeD />} />
        <Route path="/2d" element={<TwoD />} />
        <Route path="/tree" element={<Tree />} />
        <Route path="/info" element={<Info />} />
        <Route path="/:category/:slug" element={<ProjectDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default App
