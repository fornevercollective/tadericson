import { useState, useRef, useCallback, useEffect } from 'react'
import { ExternalLink, Camera, Play, Pause } from 'lucide-react'

function App() {
  const [isCameraOn, setIsCameraOn] = useState(false)
  const [pixelSize, setPixelSize] = useState(8)
  const [blurAmount, setBlurAmount] = useState(2)

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
      alert("Camera access needed for the live lens demo")
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

      // Clean pixelation effect
      if (pixelSize > 1) {
        const tempW = Math.floor(canvas.width / pixelSize)
        const tempH = Math.floor(canvas.height / pixelSize)
        ctx.imageSmoothingEnabled = false
        ctx.drawImage(canvas, 0, 0, tempW, tempH)
        ctx.drawImage(canvas, 0, 0, tempW, tempH, 0, 0, canvas.width, canvas.height)
      }

      // Subtle blur
      if (blurAmount > 0) {
        ctx.filter = `blur(${blurAmount}px)`
        ctx.drawImage(canvas, 0, 0)
        ctx.filter = 'none'
      }

      animationRef.current = requestAnimationFrame(draw)
    }

    draw()
  }, [pixelSize, blurAmount])

  // Video concept: Media rotator for high-res images/videos/gifs
  // Controlled via in-browser "terminal server" for testing/deployment simulation
  const [mediaItems, setMediaItems] = useState([
    { id: 1, type: 'image', url: 'https://picsum.photos/id/1015/1920/1080', title: 'High Res Landscape' },
    { id: 2, type: 'image', url: 'https://picsum.photos/id/160/1920/1080', title: 'Mountain Study' },
    { id: 3, type: 'gif', url: 'https://media.giphy.com/media/3oEjI6SIIHBdRxz40w/giphy.gif', title: 'Abstract Motion' },
    { id: 4, type: 'video', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', title: 'Elephants Dream (sample video)' },
    { id: 5, type: 'image', url: 'https://picsum.photos/id/201/1920/1080', title: 'Urban Texture' },
  ])
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const [isRotating, setIsRotating] = useState(false)
  const [rotationInterval, setRotationInterval] = useState(4000)
  const [terminalLines, setTerminalLines] = useState([
    '[TERMINAL SERVER v0.1] Small media rotator server activated.',
    'Type "help" for available commands. For local testing: run "npm run rotator-server" in terminal.',
    'High-res media rotation ready. Add your files via "add <url>".'
  ])
  const [terminalInput, setTerminalInput] = useState('')
  const rotatorTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Rotation timer
  useEffect(() => {
    if (rotatorTimerRef.current) {
      clearInterval(rotatorTimerRef.current)
      rotatorTimerRef.current = null
    }
    if (isRotating && mediaItems.length > 0) {
      rotatorTimerRef.current = setInterval(() => {
        setCurrentMediaIndex((prev) => (prev + 1) % mediaItems.length)
      }, rotationInterval)
    }
    return () => {
      if (rotatorTimerRef.current) clearInterval(rotatorTimerRef.current)
    }
  }, [isRotating, rotationInterval, mediaItems.length])

  const currentMedia = mediaItems[currentMediaIndex] || mediaItems[0]

  const executeTerminalCommand = (rawCmd: string) => {
    const cmd = rawCmd.trim()
    if (!cmd) return

    const parts = cmd.toLowerCase().split(/\s+/)
    const command = parts[0]
    let output = `> ${cmd}`

    switch (command) {
      case 'help':
        output += '\nAvailable commands:\n  next / prev\n  play / pause\n  speed <ms>\n  list\n  status\n  add <url> [image|video|gif]\n  activate / server  (start small terminal server simulation)\n  deploy  (deploy rotator to local server for testing)\n  clear'
        break
      case 'next':
        setCurrentMediaIndex(i => (i + 1) % mediaItems.length)
        output += '\nNext media loaded.'
        break
      case 'prev':
        setCurrentMediaIndex(i => (i - 1 + mediaItems.length) % mediaItems.length)
        output += '\nPrevious media loaded.'
        break
      case 'play':
        setIsRotating(true)
        output += '\nRotation activated.'
        break
      case 'pause':
        setIsRotating(false)
        output += '\nRotation paused.'
        break
      case 'speed':
        const ms = parseInt(parts[1])
        if (ms >= 1000) {
          setRotationInterval(ms)
          output += `\nRotation interval set to ${ms}ms.`
        } else {
          output += '\nMinimum speed 1000ms.'
        }
        break
      case 'list':
        output += '\n' + mediaItems.map((m, i) => `  ${i}: [${m.type}] ${m.title}`).join('\n')
        break
      case 'status':
        output += `\nIndex: ${currentMediaIndex} | Rotating: ${isRotating} | Interval: ${rotationInterval}ms | Items: ${mediaItems.length}`
        break
      case 'add':
        if (parts[1]) {
          const url = parts[1]
          const type = parts[2] || 'image'
          const newItem = { id: Date.now(), type, url, title: url.split('/').pop() || 'Custom Media' }
          setMediaItems(prev => [...prev, newItem])
          output += `\nAdded ${type}: ${url} (session only; for persistent add to media list in code)`
        } else {
          output += '\nUsage: add <url> [image|video|gif]'
        }
        break
      case 'activate':
      case 'server':
        output += '\n[TERMINAL SERVER] Activating small terminal server...'
        output += '\n[SERVER] localhost:8080 ready for media rotation.'
        output += '\n[SERVER] High-res images/videos/gifs will cycle here.'
        output += '\n[SERVER] Use "deploy" to test deployment from this build.'
        setIsRotating(true)
        break
      case 'deploy':
        output += '\n[DEPLOY] Packaging current rotator for local server...'
        output += '\n[DEPLOY] Deployed to terminal server. Test at http://localhost:8080 (run npm run rotator-server in your terminal for real local server).'
        output += '\n[DEPLOY] For high-res: place files in public/media/ and update list or use "add".'
        break
      case 'clear':
        setTerminalLines(['[TERMINAL SERVER] Output cleared.'])
        setTerminalInput('')
        return
      default:
        output += '\nUnknown command. Type "help".'
    }

    setTerminalLines(prev => [...prev.slice(-12), output]) // keep recent
  }

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (terminalInput.trim()) {
      executeTerminalCommand(terminalInput)
      setTerminalInput('')
    }
  }

  const projects = [
    { title: "Accident", year: "2017", role: "Camera / Tech", imdb: "https://www.imdb.com/title/tt5719706/" },
    { title: "A.C.O.D.", year: "2013", role: "Camera Department", imdb: "https://www.imdb.com/title/tt2416374/" },
    { title: "YogaSlackers - Slackasana", year: "2010", role: "Camera / Production" },
    { title: "First Winter", year: "", role: "Camera" },
    { title: "Carter", year: "2009", role: "Camera" },
  ]

  const scrollToSection = (section: string) => {
    const el = document.getElementById(section)
    if (el) {
      const navHeight = 80
      const y = el.getBoundingClientRect().top + window.scrollY - navHeight
      window.scrollTo({ top: y, behavior: 'smooth' })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-white text-zinc-950">
      {/* Clean elegant nav */}
      <nav className="fixed top-0 z-50 w-full bg-white/95 backdrop-blur border-b border-zinc-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div 
            onClick={() => scrollToSection('home')}
            className="text-xl font-light tracking-[-1px] cursor-pointer hover:text-zinc-500 transition"
          >
            TAD ERICSON
          </div>
          <div className="flex gap-7 text-sm uppercase tracking-[1.5px] text-zinc-500">
            {['work', 'awards', 'collective', 'tree', 'video', 'contact'].map(s => (
              <button 
                key={s} 
                onClick={() => scrollToSection(s)} 
                className="hover:text-black transition"
              >
                {s}
              </button>
            ))}
          </div>
          <a 
            href="https://tadericson.com" 
            target="_blank" 
            className="text-xs tracking-widest text-zinc-400 hover:text-black flex items-center gap-1"
          >
            ORIG <ExternalLink size={13} />
          </a>
        </div>
      </nav>

      {/* Active Camera moved to the right side of the screen */}
      <div className="fixed right-4 top-24 z-50 w-72 bg-white border border-zinc-200 rounded-3xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="uppercase text-xs tracking-[2px] text-emerald-600 mb-0.5">LIVE</div>
            <div className="text-lg font-light tracking-tight">Pixel Camera</div>
          </div>
          <button
            onClick={isCameraOn ? stopLiveFeed : startLiveFeed}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-zinc-300 rounded-full hover:bg-zinc-50 active:bg-zinc-100 transition"
          >
            {isCameraOn ? (
              <><Pause size={14} /> Stop</>
            ) : (
              <><Play size={14} /> Start</>
            )}
          </button>
        </div>

        <div className="relative rounded-xl overflow-hidden border border-zinc-200 bg-zinc-950">
          <canvas
            ref={canvasRef}
            className="w-full"
            style={{ aspectRatio: '16 / 9' }}
          />
          <video ref={videoRef} className="hidden" />

          {!isCameraOn && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/90 text-center p-4">
              <div>
                <Camera className="mx-auto mb-2 text-emerald-600" size={22} />
                <p className="text-[10px] text-zinc-500 leading-tight">Real-time<br />pixel + blur</p>
              </div>
            </div>
          )}
        </div>

        {isCameraOn && (
          <div className="mt-3 space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-zinc-400 mb-1">
                <span>PIXELATE</span>
                <span>{pixelSize}</span>
              </div>
              <input
                type="range"
                min="1"
                max="18"
                step="1"
                value={pixelSize}
                onChange={(e) => setPixelSize(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>
            <div>
              <div className="flex justify-between text-zinc-400 mb-1">
                <span>BLUR</span>
                <span>{blurAmount}</span>
              </div>
              <input
                type="range"
                min="0"
                max="12"
                step="0.5"
                value={blurAmount}
                onChange={(e) => setBlurAmount(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>
          </div>
        )}
      </div>

      {/* CLEAN HERO - restored to before live camera was added */}
      <section id="home" className="pt-20 pb-16 max-w-5xl mx-auto px-6">
        <div className="text-center">
          <div className="mx-auto mb-6 w-48 h-48 rounded-2xl overflow-hidden border border-zinc-200 shadow-sm">
            <img 
              src="https://picsum.photos/id/64/800/800" 
              alt="Tad Ericson" 
              className="w-full h-full object-cover" 
            />
          </div>
          <h1 className="text-6xl md:text-7xl font-light tracking-[-3px] mb-3">Tad Ericson</h1>
          <p className="text-xl text-zinc-500">Filmmaker • Camera • Fornever Collective • Oregon</p>
          <p className="mt-3 text-sm text-zinc-400 max-w-xs mx-auto">DM for collabs. Working on deep ancestry research with elders.</p>
        </div>
      </section>

      {/* WORK */}
      <section id="work" className="border-t border-zinc-100 py-16 max-w-5xl mx-auto px-6">
        <div className="uppercase tracking-[2px] text-xs text-emerald-600 mb-2">WORK</div>
        <h2 className="text-4xl font-light tracking-tight mb-10">Selected Projects</h2>
        
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-10">
          {projects.map((p, i) => (
            <div key={i} className="group">
              <div className="font-light text-2xl mb-1">{p.title}</div>
              <div className="text-sm text-zinc-500 mb-3">{p.year} • {p.role}</div>
              {p.imdb && (
                <a href={p.imdb} target="_blank" rel="noreferrer" 
                   className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700">
                  View on IMDb <ExternalLink size={14} />
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* AWARDS / CREDITS */}
      <section id="awards" className="border-t border-zinc-100 py-16 max-w-5xl mx-auto px-6 bg-zinc-50">
        <div className="uppercase tracking-[2px] text-xs text-emerald-600 mb-2">CREDITS</div>
        <h2 className="text-4xl font-light tracking-tight mb-8">Selected Credits</h2>
        
        <div className="max-w-3xl text-[15px] leading-relaxed text-zinc-600 space-y-6">
          <div>
            <strong className="text-black">Feature Films</strong><br />
            A.C.O.D. • Adult Children of Divorce • First Winter
          </div>
          <div>
            <strong className="text-black">Episodic</strong><br />
            Unbreakable Kimmy Schmidt • Smash • Borgia • Royal Pains • The Fuzz
          </div>
          <div>
            <strong className="text-black">Music Videos & Commercials</strong><br />
            Kanye West – Mercy • Tom Ford Noir • 55th GRAMMYs (PEPSI) • and many more for VEVO, Nike, Pennzoil, etc.
          </div>
        </div>
        <a href="http://www.imdb.com/name/nm2460024/" target="_blank" className="mt-8 inline-block text-sm text-emerald-600 hover:underline">Full credits on IMDb →</a>
      </section>

      {/* COLLECTIVE */}
      <section id="collective" className="border-t border-zinc-100 py-16 max-w-5xl mx-auto px-6">
        <div className="uppercase tracking-[2px] text-xs text-emerald-600 mb-2">FORNEVER COLLECTIVE</div>
        <h2 className="text-4xl font-light tracking-tight mb-6">Media & Design in Motion</h2>
        <p className="max-w-2xl text-lg text-zinc-600">Creative practice based in Oregon. Film, VFX, experimental work, and personal research.</p>
      </section>

      {/* TREE */}
      <section id="tree" className="border-t border-zinc-100 py-16 max-w-5xl mx-auto px-6 bg-zinc-50">
        <div className="uppercase tracking-[2px] text-xs text-emerald-600 mb-2">TREE</div>
        <h2 className="text-4xl font-light tracking-tight mb-6">Ancestry Research</h2>
        <p className="max-w-2xl text-lg text-zinc-600 mb-6">
          Ongoing exploration of deep ancestry with guidance from elders around the world. 
          Active lines include First Nation, Powhatan, Lenapehoking, Roskelyn, Dunkeld, Hauteville, and Lodbrock.
        </p>
        <a href="https://tadericson.com/tree" target="_blank" className="text-emerald-600 hover:underline text-sm">Explore the original tree archive →</a>
      </section>

      {/* VIDEO / TERMINAL SERVER - for high res images/videos/gifs rotation */}
      <section id="video" className="border-t border-zinc-100 py-16 max-w-5xl mx-auto px-6">
        <div className="uppercase tracking-[2px] text-xs text-emerald-600 mb-2">VIDEO CONCEPT</div>
        <h2 className="text-4xl font-light tracking-tight mb-6">Terminal Media Server</h2>
        <p className="max-w-2xl text-lg text-zinc-600 mb-8">
          Activate the small terminal server to control rotation of high-res images, videos and gifs. 
          For local testing: use the terminal below or run <code className="bg-zinc-100 px-1">npm run rotator-server</code> in your terminal (see package.json).
          Deploy your build to the local server for testing the rotator with your own high-res files.
        </p>

        {/* Media Rotator Display */}
        <div className="mb-8 border border-zinc-200 rounded-3xl overflow-hidden bg-black aspect-video relative flex items-center justify-center">
          {currentMedia && (
            currentMedia.type === 'video' ? (
              <video 
                key={currentMedia.id}
                src={currentMedia.url} 
                className="max-h-full max-w-full object-contain" 
                autoPlay 
                muted 
                loop 
                playsInline
              />
            ) : (
              <img 
                key={currentMedia.id}
                src={currentMedia.url} 
                alt={currentMedia.title} 
                className="max-h-full max-w-full object-contain" 
              />
            )
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 p-4 text-white text-sm flex justify-between items-end">
            <div>
              <div className="font-light">{currentMedia?.title}</div>
              <div className="text-xs opacity-70">{currentMedia?.type} • {currentMediaIndex + 1} / {mediaItems.length}</div>
            </div>
            <div className="text-xs opacity-70">
              {isRotating ? 'ROTATING' : 'PAUSED'} @ {rotationInterval}ms
            </div>
          </div>
        </div>

        {/* Terminal Server Interface */}
        <div className="border border-zinc-200 rounded-3xl bg-zinc-950 text-green-400 font-mono text-sm p-4">
          <div className="flex items-center gap-2 mb-2 text-green-500 text-xs uppercase tracking-widest">
            <span>TERMINAL SERVER</span> 
            <span className="text-green-400">●</span> 
            <span>localhost:8080</span>
          </div>

          <div className="h-48 overflow-auto bg-black p-3 mb-3 text-green-300 whitespace-pre-wrap text-xs leading-relaxed border border-green-900">
            {terminalLines.map((line, i) => <div key={i}>{line}</div>)}
          </div>

          <form onSubmit={handleTerminalSubmit} className="flex gap-2">
            <span className="text-green-500 pt-1">$</span>
            <input
              type="text"
              value={terminalInput}
              onChange={(e) => setTerminalInput(e.target.value)}
              placeholder="Type command (help, play, next, activate, deploy, add ...)"
              className="flex-1 bg-transparent border-none focus:outline-none text-green-400 placeholder-green-800"
              autoComplete="off"
            />
            <button type="submit" className="px-4 py-1 border border-green-800 text-green-400 hover:bg-green-900/30 text-xs">EXEC</button>
          </form>
          <div className="text-[10px] text-green-800 mt-2">
            Pro tip: "activate" or "server" starts the rotator server simulation. "deploy" simulates deploying the rotator for testing. Add your high-res URLs with "add".
          </div>
        </div>

        <div className="mt-4 text-xs text-zinc-500">
          For real local server with your high-res media: place files in a <code>public/media</code> folder (or serve from elsewhere) and update the mediaItems array. 
          Run <code>npm run rotator-server</code> (add the script if not present) to host a small terminal-style server for testing the deployment.
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="border-t border-zinc-100 py-16 max-w-5xl mx-auto px-6">
        <div className="uppercase tracking-[2px] text-xs text-emerald-600 mb-2">CONTACT</div>
        <h2 className="text-4xl font-light tracking-tight mb-8">Let's talk</h2>
        
        <div className="flex flex-wrap gap-x-8 gap-y-2 text-lg">
          <a href="https://www.linkedin.com/in/tadericson/" target="_blank" className="hover:text-emerald-600 flex items-center gap-2">LinkedIn <ExternalLink size={16} /></a>
          <a href="http://www.imdb.com/name/nm2460024/" target="_blank" className="hover:text-emerald-600 flex items-center gap-2">IMDb <ExternalLink size={16} /></a>
          <a href="https://vimeo.com/fornever" target="_blank" className="hover:text-emerald-600 flex items-center gap-2">Vimeo <ExternalLink size={16} /></a>
          <a href="https://www.instagram.com/tadericson/" target="_blank" className="hover:text-emerald-600 flex items-center gap-2">Instagram <ExternalLink size={16} /></a>
        </div>
        <p className="mt-8 text-sm text-zinc-500">DMs open for collaborations and research notes.</p>
      </section>

      <footer className="py-10 text-center text-xs text-zinc-400 border-t border-zinc-100">
        © 2026 Tad Ericson / Fornever Collective • All images copyright the artist
      </footer>
    </div>
  )
}

export default App
