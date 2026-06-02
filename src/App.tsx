import { useState, useRef, useEffect } from 'react'
import { Film, TreePine, ExternalLink, Camera, Download, RefreshCw } from 'lucide-react'
import { useRegisterSW } from 'virtual:pwa-register/react'

// Type for beforeinstallprompt
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function App() {
  const [activeSection, setActiveSection] = useState<'home' | 'work' | 'awards' | 'collective' | 'tree' | 'contact'>('home')
  const [isCameraOn, setIsCameraOn] = useState(false)
  const [pixelSize, setPixelSize] = useState(8)
  const [blurAmount, setBlurAmount] = useState(4)

  // Live values for the animation loop (avoids stale closure)
  const pixelSizeRef = useRef(pixelSize)
  const blurAmountRef = useRef(blurAmount)

  // PWA install state
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstall, setShowInstall] = useState(false)
  const [isInstalled, setIsInstalled] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches
  )

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const offscreenRef = useRef<HTMLCanvasElement | null>(null)

  // keep parameter refs fresh for the rAF loop
  useEffect(() => { pixelSizeRef.current = pixelSize }, [pixelSize])
  useEffect(() => { blurAmountRef.current = blurAmount }, [blurAmount])

  // PWA SW + update
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r?: ServiceWorkerRegistration) { console.log('SW registered for live lens PWA', r) },
    onRegisterError(error?: Error) { console.error('SW error', error) },
  })

  // PWA install prompt handling
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstall(true)
    }
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowInstall(false)
      setDeferredPrompt(null)
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setShowInstall(false)
  }

  // Improved Live Camera + Pixel + Blur (uses offscreen for clean passes)
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setIsCameraOn(true)
        processVideo()
      }
    } catch (err) {
      console.error("Camera access denied", err)
      alert("Camera access is required for the Live Lens experience. Please allow it in your browser settings.")
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop())
    }
    setIsCameraOn(false)
    if (animationRef.current) cancelAnimationFrame(animationRef.current)
  }

  const processVideo = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    // Create offscreen once
    if (!offscreenRef.current) {
      offscreenRef.current = document.createElement('canvas')
    }
    const off = offscreenRef.current
    const offCtx = off.getContext('2d', { willReadFrequently: true })
    if (!offCtx) return

    const draw = () => {
      const w = 1280
      const h = 720
      canvas.width = w
      canvas.height = h
      off.width = w
      off.height = h

      // Base draw
      offCtx.drawImage(video, 0, 0, w, h)

      // Pixelation pass (cheap aito/GMUNK style) — live values
      const px = pixelSizeRef.current
      const bl = blurAmountRef.current
      if (px > 1) {
        const pw = Math.floor(w / px)
        const ph = Math.floor(h / px)
        offCtx.imageSmoothingEnabled = false
        offCtx.drawImage(off, 0, 0, pw, ph)
        offCtx.drawImage(off, 0, 0, pw, ph, 0, 0, w, h)
      }

      // Main canvas gets the processed
      ctx.imageSmoothingEnabled = true
      ctx.drawImage(off, 0, 0, w, h)

      // Cheap blur pass (post)
      if (bl > 0) {
        ctx.filter = `blur(${bl}px)`
        ctx.drawImage(canvas, 0, 0)
        ctx.filter = 'none'
      }

      animationRef.current = requestAnimationFrame(draw)
    }

    draw()
  }

  // Re-process when sliders change (while running)
  useEffect(() => {
    if (isCameraOn && animationRef.current) {
      // The draw loop reads the state live, so just let it continue
    }
  }, [pixelSize, blurAmount, isCameraOn])

  // Projects / Work data
  const projects = [
    { title: "Accident", year: "2017", role: "Camera / Production", note: "Feature" },
    { title: "A.C.O.D.", year: "2013", role: "Camera Department", note: "Feature" },
    { title: "First Winter", year: "2010", role: "Camera", note: "Feature" },
    { title: "YogaSlackers - Slackasana", year: "2010", role: "Camera / Tech", note: "Doc" },
    { title: "Unbreakable Kimmy Schmidt", year: "—", role: "Episodic", note: "TV" },
    { title: "Smash / Borgia / Royal Pains / The Fuzz", year: "—", role: "Episodic", note: "TV" },
  ]

  const navItems = ['Work', 'Awards', 'Collective', 'Tree', 'Contact'] as const

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* Fixed cinematic nav */}
      <nav className="fixed top-0 w-full bg-black/80 backdrop-blur-xl z-[100] border-b border-white/10">
        <div className="max-w-6xl mx-auto px-8 h-20 flex items-center justify-between">
          <div 
            className="text-2xl font-light tracking-[-1.5px] cursor-pointer" 
            onClick={() => { setActiveSection('home'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
          >
            TAD ERICSON
          </div>

          <div className="flex items-center gap-9 text-xs uppercase tracking-[3px] text-white/60">
            {navItems.map((label) => {
              const key = label.toLowerCase() as any
              return (
                <button
                  key={label}
                  onClick={() => setActiveSection(key)}
                  className={`hover:text-white transition ${activeSection === key ? 'text-white nav-active' : ''}`}
                >
                  {label}
                </button>
              )
            })}

            {/* PWA Install control in nav */}
            {showInstall && !isInstalled && (
              <button 
                onClick={handleInstallClick}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-black text-[10px] tracking-widest hover:bg-zinc-200 transition"
              >
                <Download className="w-3.5 h-3.5" /> INSTALL
              </button>
            )}
            {isInstalled && (
              <span className="text-[10px] px-3 py-1 rounded-full border border-white/30 text-white/50">INSTALLED</span>
            )}

            {needRefresh && (
              <button 
                onClick={() => updateServiceWorker(true)}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/30 text-[10px] hover:bg-white/10"
              >
                <RefreshCw className="w-3.5 h-3.5" /> UPDATE
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* HERO — Live Camera Lens (the signature feature) */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden pt-20">
        <canvas
          ref={canvasRef}
          className="live-lens absolute inset-0 w-full h-full object-cover"
        />
        <video ref={videoRef} className="hidden" muted playsInline />

        {/* Dark atmospheric overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/60 to-black/95" />

        {/* Live Lens control panel */}
        <div className="absolute top-28 right-8 bg-black/70 backdrop-blur-2xl p-7 rounded-3xl border border-white/10 z-10 w-72">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-xl bg-white/10">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <div className="uppercase tracking-[2px] text-xs text-white/60">LIVE LENS</div>
              <div className="text-sm -mt-0.5">Real-time capture</div>
            </div>
          </div>

          <button
            onClick={isCameraOn ? stopCamera : startCamera}
            className="w-full mb-6 py-4 rounded-2xl bg-white text-black font-medium flex items-center justify-center gap-3 active:scale-[0.985] transition"
          >
            {isCameraOn ? "Stop Live Feed" : "Activate Camera Feed"}
          </button>

          {isCameraOn && (
            <div className="space-y-7 text-sm">
              <div>
                <div className="flex justify-between text-[10px] tracking-widest text-white/50 mb-2">
                  <div>PIXELATE</div><div className="font-mono">{pixelSize}px</div>
                </div>
                <input 
                  type="range" min="1" max="32" step="1"
                  value={pixelSize} 
                  onChange={(e) => setPixelSize(parseInt(e.target.value))}
                  className="w-full accent-white"
                />
              </div>
              <div>
                <div className="flex justify-between text-[10px] tracking-widest text-white/50 mb-2">
                  <div>BLUR</div><div className="font-mono">{blurAmount}px</div>
                </div>
                <input 
                  type="range" min="0" max="18" step="1"
                  value={blurAmount} 
                  onChange={(e) => setBlurAmount(parseInt(e.target.value))}
                  className="w-full accent-white"
                />
              </div>
              <div className="text-[10px] text-white/40 pt-1">Aito / GMUNK style realtime processing</div>
            </div>
          )}
        </div>

        {/* Center title block */}
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <div className="mx-auto mb-6 w-44 h-44 rounded-3xl overflow-hidden border border-white/20 shadow-2xl">
            <img 
              src="https://picsum.photos/id/1005/600/600" 
              alt="Tad Ericson" 
              className="w-full h-full object-cover grayscale-[0.2]"
            />
          </div>

          <h1 className="text-7xl md:text-8xl font-light tracking-[-4.5px] mb-3">Tad Ericson</h1>
          <p className="text-2xl text-white/70 mb-9 tracking-tight">Filmmaker • Camera Technician • Fornever Collective</p>

          <div className="flex flex-wrap gap-4 justify-center">
            <button 
              onClick={() => setActiveSection('work')}
              className="group px-10 py-4 rounded-3xl border border-white/30 hover:bg-white hover:text-black flex items-center gap-3 text-sm tracking-widest transition"
            >
              EXPLORE WORK <Film className="w-4 h-4 group-hover:rotate-12 transition" />
            </button>
            <button 
              onClick={() => setActiveSection('tree')}
              className="px-10 py-4 rounded-3xl border border-white/30 hover:bg-white/5 flex items-center gap-3 text-sm tracking-widest transition"
            >
              THE TREE <TreePine className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="absolute bottom-10 text-[10px] tracking-[4px] text-white/30">MOVE • LIGHT • CAPTURE • LIVE</div>
      </section>

      {/* DYNAMIC SECTIONS */}
      {activeSection !== 'home' && (
        <div className="max-w-5xl mx-auto px-8 pb-24">
          {activeSection === 'work' && (
            <div className="pt-16">
              <div className="flex items-center gap-4 mb-10">
                <Film className="w-6 h-6" />
                <h2 className="text-6xl font-light tracking-tighter">Selected Work</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {projects.map((p, i) => (
                  <div key={i} className="group border border-white/10 hover:border-white/30 p-8 rounded-3xl flex justify-between items-start transition">
                    <div>
                      <div className="text-3xl tracking-tight">{p.title}</div>
                      <div className="text-white/50 mt-1">{p.role} • {p.year}</div>
                    </div>
                    <div className="text-right text-xs uppercase tracking-widest text-white/40 group-hover:text-white/70">{p.note}</div>
                  </div>
                ))}
              </div>
              <p className="mt-8 text-white/50 text-sm">Full credits on IMDB • Additional motion graphics, commercials &amp; music videos available on request.</p>
            </div>
          )}

          {activeSection === 'tree' && (
            <div className="pt-16 max-w-3xl">
              <div className="flex items-center gap-4 mb-8">
                <TreePine className="w-6 h-6" />
                <h2 className="text-6xl font-light tracking-tighter">The Tree</h2>
              </div>
              <p className="text-2xl leading-tight text-white/80">
                Working on my interesting ancestry research with amazing help from elders of the world.
              </p>
              <div className="mt-8 flex flex-wrap gap-3 text-sm">
                {['/tree', '/firstnation', '/powhatan', '/lenapehoking', '/dunkeld'].map((p, i) => (
                  <a key={i} href={`https://tadericson.com${p}`} target="_blank" className="px-5 py-2 border border-white/20 rounded-2xl hover:bg-white/5 flex items-center gap-2">
                    {p.replace('/', '')} <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'contact' && (
            <div className="pt-16">
              <h2 className="text-6xl font-light tracking-tighter mb-8">Contact</h2>
              <p className="text-xl text-white/70">DM for COLABs • Oregon, USA</p>
              <div className="mt-8 flex gap-4">
                <a href="https://www.linkedin.com/in/tadericson/" target="_blank" className="flex items-center gap-2 px-6 py-3 border border-white/20 rounded-2xl hover:bg-white/5">LinkedIn</a>
                <a href="https://www.imdb.com/name/nm2460024/" target="_blank" className="flex items-center gap-2 px-6 py-3 border border-white/20 rounded-2xl hover:bg-white/5">IMDB</a>
                <a href="https://vimeo.com/fornever" target="_blank" className="flex items-center gap-2 px-6 py-3 border border-white/20 rounded-2xl hover:bg-white/5">Vimeo / Fornever</a>
              </div>
            </div>
          )}

          {/* Add more sections as directed by superheavy chat */}
          {['awards', 'collective'].includes(activeSection) && (
            <div className="pt-20 text-white/60">More content coming — see superheavy chat for exact direction on this section.</div>
          )}
        </div>
      )}

      <footer className="border-t border-white/10 py-8 text-center text-[10px] tracking-widest text-white/40">
        © FORNEVER COLLECTIVE • TAD ERICSON — THIS IS A PROGRESSIVE WEB APP
      </footer>
    </div>
  )
}

export default App
