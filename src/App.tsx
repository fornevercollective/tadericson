import { useState, useRef, useCallback } from 'react'
import { Award, Users, TreePine, Mail, ExternalLink, Camera, Play, Pause } from 'lucide-react'

function App() {
  const [activeSection, setActiveSection] = useState('home')
  const [isCameraOn, setIsCameraOn] = useState(false)
  const [pixelSize, setPixelSize] = useState(6)
  const [blurAmount, setBlurAmount] = useState(3)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationRef = useRef<number | undefined>(undefined)

  const startLiveFeed = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: "user" }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setIsCameraOn(true)
        processFrame()
      }
    } catch (err) {
      console.error(err)
      alert("Camera access needed for live effect")
    }
  }

  const stopLiveFeed = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    if (animationRef.current != null) cancelAnimationFrame(animationRef.current)
    setIsCameraOn(false)
  }

  const processFrame = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    canvas.width = 1280
    canvas.height = 720

    const draw = () => {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Aito-style Pixelation
      if (pixelSize > 1) {
        const tempW = canvas.width / pixelSize
        const tempH = canvas.height / pixelSize
        ctx.imageSmoothingEnabled = false
        ctx.drawImage(canvas, 0, 0, tempW, tempH)
        ctx.drawImage(canvas, 0, 0, tempW, tempH, 0, 0, canvas.width, canvas.height)
      }

      // Blur
      if (blurAmount > 0) {
        ctx.filter = `blur(${blurAmount}px)`
        ctx.drawImage(canvas, 0, 0)
        ctx.filter = 'none'
      }

      animationRef.current = requestAnimationFrame(draw)
    }

    draw()
  }, [pixelSize, blurAmount])

  // Projects from IMDb + your old site
  const projects = [
    { title: "Accident", year: "2017", role: "Camera / Tech", imdb: "https://www.imdb.com/title/tt5719706/" },
    { title: "A.C.O.D.", year: "2013", role: "Camera Department", imdb: "https://www.imdb.com/title/tt2416374/" },
    { title: "YogaSlackers - Slackasana", year: "2010", role: "Camera / Production" },
    { title: "First Winter", year: "", role: "Camera" },
    { title: "Carter", year: "2009", role: "Camera" },
  ]

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <nav className="fixed top-0 z-50 w-full bg-black/90 backdrop-blur-lg border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-8 py-5 flex justify-between items-center">
          <div className="text-2xl font-light tracking-tighter">TAD ERICSON</div>
          <div className="flex gap-8 text-sm uppercase tracking-widest">
            {['home', 'work', 'awards', 'collective', 'tree', 'contact'].map(s => (
              <button key={s} onClick={() => setActiveSection(s)} className={`hover:text-emerald-400 transition ${activeSection === s ? 'text-white' : 'text-zinc-400'}`}>
                {s.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* LIVE GMUNK-INSPIRED HERO */}
      <section className="relative h-screen flex items-center justify-center">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover opacity-75 scale-105" />
        <video ref={videoRef} className="hidden" />

        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/70 to-black" />

        {/* Live Controls - Top Right */}
        <div className="absolute top-28 right-8 z-20 bg-zinc-950/80 backdrop-blur-xl p-6 rounded-3xl border border-zinc-700 w-72">
          <div className="flex items-center gap-3 mb-5">
            <Camera className="w-5 h-5 text-emerald-400" />
            <span className="uppercase text-xs tracking-[2px]">Live Lens Feed</span>
          </div>

          <button
            onClick={isCameraOn ? stopLiveFeed : startLiveFeed}
            className="w-full py-4 rounded-2xl bg-white text-black font-medium flex items-center justify-center gap-3 hover:bg-zinc-200 mb-6"
          >
            {isCameraOn ? <><Pause className="w-5 h-5" /> Stop Feed</> : <><Play className="w-5 h-5" /> Activate Camera</>}
          </button>

          {isCameraOn && (
            <div className="space-y-6">
              <div>
                <div className="text-xs text-zinc-400 mb-1">PIXELATE</div>
                <input type="range" min="1" max="20" value={pixelSize} onChange={e => setPixelSize(+e.target.value)} className="w-full accent-emerald-400" />
              </div>
              <div>
                <div className="text-xs text-zinc-400 mb-1">BLUR</div>
                <input type="range" min="0" max="15" value={blurAmount} onChange={e => setBlurAmount(+e.target.value)} className="w-full accent-emerald-400" />
              </div>
            </div>
          )}
        </div>

        {/* Center Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <div className="mx-auto mb-8 w-56 h-56 rounded-3xl overflow-hidden border-4 border-white/30 shadow-2xl">
            <img src="https://picsum.photos/id/64/800/800" alt="Tad" className="object-cover w-full h-full" />
          </div>
          <h1 className="text-7xl md:text-8xl font-light tracking-[-4px] mb-4">Tad Ericson</h1>
          <p className="text-2xl text-zinc-300 mb-10">Filmmaker • Camera • Fornever Collective</p>
        </div>
      </section>

      {/* WORK SECTION */}
      {activeSection === 'work' && (
        <section className="max-w-6xl mx-auto px-8 py-24">
          <h2 className="text-6xl font-light mb-16">Selected Projects</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {projects.map((p, i) => (
              <div key={i} className="bg-zinc-900 p-10 rounded-3xl hover:bg-zinc-800 transition group">
                <h3 className="text-4xl font-light">{p.title}</h3>
                <p className="text-zinc-400 mt-2">{p.year} • {p.role}</p>
                {p.imdb && (
                  <a href={p.imdb} target="_blank" className="text-emerald-400 text-sm mt-6 inline-flex items-center gap-2 hover:underline">
                    View on IMDb <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* AWARDS / CREDITS */}
      {activeSection === 'awards' && (
        <section className="max-w-6xl mx-auto px-8 py-24">
          <h2 className="text-6xl font-light mb-16 flex items-center gap-4"><Award className="w-10 h-10" /> Credits & Recognition</h2>
          <div className="prose prose-invert max-w-none text-lg text-zinc-300">
            <p>Feature films, episodic TV, music videos, commercials for brands including VEVO, Pepsi, Nike, Tom Ford, and more.</p>
            <p>Additional credits available on <a href="http://www.imdb.com/name/nm2460024/" target="_blank" className="text-emerald-400">IMDb</a>.</p>
          </div>
        </section>
      )}

      {/* COLLECTIVE */}
      {activeSection === 'collective' && (
        <section className="max-w-6xl mx-auto px-8 py-24">
          <h2 className="text-6xl font-light mb-16 flex items-center gap-4"><Users className="w-10 h-10" /> Fornever Collective</h2>
          <p className="max-w-2xl text-xl text-zinc-300">Media & design in motion. Portland / Oregon based creative practice focused on film, VFX, and experimental work.</p>
        </section>
      )}

      {/* TREE / ANCESTRY */}
      {activeSection === 'tree' && (
        <section className="max-w-6xl mx-auto px-8 py-24">
          <h2 className="text-6xl font-light mb-16 flex items-center gap-4"><TreePine className="w-10 h-10" /> Ancestry Research</h2>
          <p className="max-w-prose text-xl text-zinc-300">Ongoing deep ancestry work with guidance from elders. Lines include First Nation, Powhatan, Lenapehoking, Roskelyn, Dunkeld, Hauteville, Lodbrock and more. Details expanding.</p>
          <a href="https://tadericson.com/tree" target="_blank" className="mt-8 inline-block text-emerald-400">View original tree →</a>
        </section>
      )}

      {/* CONTACT */}
      {activeSection === 'contact' && (
        <section className="max-w-6xl mx-auto px-8 py-24">
          <h2 className="text-6xl font-light mb-16 flex items-center gap-4"><Mail className="w-10 h-10" /> Contact</h2>
          <div className="max-w-md">
            <p className="text-xl mb-8 text-zinc-300">DM for collabs, ancestry notes, or camera work.</p>
            <a href="https://www.linkedin.com/in/tadericson/" target="_blank" className="flex items-center gap-2 text-emerald-400 hover:underline">LinkedIn <ExternalLink /></a>
            <a href="http://www.imdb.com/name/nm2460024/" target="_blank" className="flex items-center gap-2 text-emerald-400 hover:underline mt-2">IMDb <ExternalLink /></a>
            <a href="https://vimeo.com/fornever" target="_blank" className="flex items-center gap-2 text-emerald-400 hover:underline mt-2">Vimeo <ExternalLink /></a>
          </div>
        </section>
      )}

      <footer className="py-12 text-center text-zinc-500 text-sm border-t border-zinc-900">
        © 2026 Tad Ericson • <a href="https://github.com/fornevercollective" className="hover:text-white">Fornever Collective</a>
      </footer>
    </div>
  )
}

export default App
