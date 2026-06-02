import { useState, useRef, useEffect } from 'react'
import { 
  Download, RefreshCw, 
  Menu, X, Mic, FileText, ListChecks, MessageSquare, Link as LinkIcon 
} from 'lucide-react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import * as site from './data/siteContent'

// Type for beforeinstallprompt
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function App() {
  const [isFeedOn, setIsFeedOn] = useState(false)
  const [feedMode, setFeedMode] = useState<'camera' | 'stream' | 'file'>('camera')
  const [streamUrl, setStreamUrl] = useState('')
  const [isMicActive, setIsMicActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pixelSize, setPixelSize] = useState(8)
  const [blurAmount, setBlurAmount] = useState(4)
  const [lookMode, setLookMode] = useState<'normal' | 'thermal' | 'fax' | 'mixed-seg'>('mixed-seg')

  // Live values for the animation loop (avoids stale closure)
  const pixelSizeRef = useRef(pixelSize)
  const blurAmountRef = useRef(blurAmount)
  const lookModeRef = useRef<'normal' | 'thermal' | 'fax' | 'mixed-seg'>('mixed-seg')
  useEffect(() => { lookModeRef.current = lookMode }, [lookMode])

  // For animated iridescent / light-refracting shifts in the pixel color effects (to mimic lambda.ai holographic light + the crystal image aesthetic)
  const effectPhaseRef = useRef(0)

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

  // Waveform viewer (header, right of name) + audio analyser for Live Feed mic (cam bundled or separate for stream)
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const waveformAnimRef = useRef<number | null>(null)

  // 32x32 live feed preview in header (replaces static icon; shows processed bg from cam or stream when active)
  const headerPreviewCanvasRef = useRef<HTMLCanvasElement>(null)

  // Initial flat waveform line in header (clean placeholder until Live Feed activated)
  // Use dark stroke because header is now white
  useEffect(() => {
    const c = waveformCanvasRef.current
    if (c) {
      const ctx = c.getContext('2d', { alpha: true })!
      ctx.clearRect(0, 0, c.width, c.height)
      ctx.strokeStyle = 'rgba(0,0,0,0.25)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, c.height / 2)
      ctx.lineTo(c.width, c.height / 2)
      ctx.stroke()
    }
  }, [])

  // Initial placeholder for 32x32 header feed preview (static until activated; works for cam or external stream)
  useEffect(() => {
    const c = headerPreviewCanvasRef.current
    if (c) {
      const ctx = c.getContext('2d', { alpha: false })!
      ctx.fillStyle = '#1a1a1a'
      ctx.fillRect(0, 0, 32, 32)
      ctx.strokeStyle = '#444'
      ctx.lineWidth = 1
      ctx.strokeRect(2, 2, 28, 28)
      ctx.fillStyle = '#666'
      ctx.font = '8px system-ui'
      ctx.fillText('LIVE', 5, 20)
    }
  }, [])

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

  // --- Audio helpers (decoupled from video so external streams like ffmpeg/blank can still drive captions + waveform via mic) ---
  const setupAudioAnalyserAndWaveform = (audioSourceStream: MediaStream) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      const ac = audioContextRef.current!
      if (ac.state === 'suspended') ac.resume().catch(() => {})
      if (sourceRef.current) sourceRef.current.disconnect()
      const source = ac.createMediaStreamSource(audioSourceStream)
      sourceRef.current = source
      const analyser = ac.createAnalyser()
      analyser.fftSize = 128
      analyser.minDecibels = -90
      analyser.maxDecibels = -10
      analyser.smoothingTimeConstant = 0.82
      source.connect(analyser)
      analyserRef.current = analyser

      if (waveformAnimRef.current) cancelAnimationFrame(waveformAnimRef.current)
      drawWaveform()
    } catch (audioErr) {
      console.warn('Audio waveform setup skipped:', audioErr)
    }
  }

  const startMicOnly = async () => {
    if (isMicActive) return
    // Used for external stream video sources (ffplay/ffmpeg/blank feed) so you still get live waveform + wisper captions from mic
    try {
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setupAudioAnalyserAndWaveform(micStream)
      startLiveCaptions(micStream)
      setIsMicActive(true)
    } catch (e) {
      console.warn('Separate mic for waveform/captions failed (external stream mode):', e)
    }
  }

  const pickFile = () => fileInputRef.current?.click()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      if (selectedFileUrl) {
        URL.revokeObjectURL(selectedFileUrl)
      }
      setSelectedFile(f)
      const url = URL.createObjectURL(f)
      setSelectedFileUrl(url)
      setFeedMode('file')
    }
    if (e.target) e.target.value = ''
  }

  // Live Feed (camera OR url/stream (incl. /videos/test*.mp4 local) OR picked file)
  // The 3 new test videos from user are pre-copied to public/videos/ and loadable via quick buttons or URL mode with /videos/test1.mp4 etc.
  // Processing (flip/pixel/blur/mixed-seg etc) + 32x32 preview + gestures always apply to whatever is in the <video>.
  // For cam: bundled video+audio. For stream/file: video from url or objectURL, mic separate for audio features.
  const startFeed = async () => {
    const videoEl = videoRef.current
    if (!videoEl) return
    try {
      if (feedMode === 'camera') {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true
        })
        videoEl.srcObject = stream
        await videoEl.play()
        setIsFeedOn(true)
        processVideo()

        // bundled audio for cam
        setupAudioAnalyserAndWaveform(stream)
        startLiveCaptions(stream)
        setIsMicActive(true)
      } else if (feedMode === 'stream') {
        const url = streamUrl.trim()
        if (!url) {
          alert('Enter a live stream URL first (ffmpeg example: http://localhost:PORT/live.webm or .m3u8 ; or a CORS-enabled endpoint from blank etc.  You can also use /videos/test1.mp4 etc for local test clips.)')
          return
        }
        videoEl.srcObject = null
        videoEl.crossOrigin = url.startsWith('/') ? '' : 'anonymous'
        videoEl.src = url
        videoEl.muted = true
        videoEl.loop = url.includes('/videos/')
        // wait for playable frames (important for live streams)
        await new Promise<void>((resolve, reject) => {
          const onReady = () => {
            videoEl.removeEventListener('canplay', onReady)
            videoEl.removeEventListener('error', onErr)
            resolve()
          }
          const onErr = () => {
            videoEl.removeEventListener('canplay', onReady)
            videoEl.removeEventListener('error', onErr)
            reject(new Error('Stream load error'))
          }
          videoEl.addEventListener('canplay', onReady, { once: true })
          videoEl.addEventListener('error', onErr, { once: true })
          videoEl.play().catch(reject)
        })
        setIsFeedOn(true)
        processVideo()

        // external visual stream (into bg) + independent mic for the lens audio features (waveform + wisper)
        if (!isMicActive) await startMicOnly()
      } else if (feedMode === 'file') {
        let src = selectedFileUrl
        if (!src && selectedFile) {
          src = URL.createObjectURL(selectedFile)
          setSelectedFileUrl(src)
        }
        if (!src) {
          alert('Pick a local video file first (use the PICK button in the BG SOURCE controls). The 3 new test clips are also available via the quick test buttons or by entering /videos/test1.mp4 etc in URL mode.')
          return
        }
        videoEl.srcObject = null
        videoEl.crossOrigin = ''
        videoEl.src = src
        videoEl.muted = true
        videoEl.loop = true
        // wait for playable frames
        await new Promise<void>((resolve, reject) => {
          const onReady = () => {
            videoEl.removeEventListener('canplay', onReady)
            videoEl.removeEventListener('error', onErr)
            resolve()
          }
          const onErr = () => {
            videoEl.removeEventListener('canplay', onReady)
            videoEl.removeEventListener('error', onErr)
            reject(new Error('Video file load error'))
          }
          videoEl.addEventListener('canplay', onReady, { once: true })
          videoEl.addEventListener('error', onErr, { once: true })
          videoEl.play().catch(reject)
        })
        setIsFeedOn(true)
        processVideo()

        if (!isMicActive) await startMicOnly()
      }
    } catch (err) {
      console.error('Feed start failed', err)
      alert('Could not start live feed. Check camera perms or stream URL (must be playable by <video>, CORS headers for cross-origin blank etc).')
      setIsFeedOn(false)
    }
  }

  const stopFeed = () => {
    const v = videoRef.current
    if (v) {
      if (v.srcObject) {
        (v.srcObject as MediaStream).getTracks().forEach(t => t.stop())
        v.srcObject = null
      }
      if (v.src) {
        v.pause()
        v.src = ''
        v.srcObject = null
      }
    }
    if (selectedFileUrl) {
      try { URL.revokeObjectURL(selectedFileUrl) } catch {}
      setSelectedFileUrl(null)
    }
    setIsFeedOn(false)
    if (animationRef.current) cancelAnimationFrame(animationRef.current)

    // Cleanup audio + header waveform + captions (shared for cam + stream+mic modes)
    if (waveformAnimRef.current) {
      cancelAnimationFrame(waveformAnimRef.current)
      waveformAnimRef.current = null
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect()
      sourceRef.current = null
    }
    analyserRef.current = null
    // draw a flat line in the header canvas when off
    const c = waveformCanvasRef.current
    if (c) {
      const ctx = c.getContext('2d', { alpha: true })!
      ctx.clearRect(0, 0, c.width, c.height)
      ctx.strokeStyle = 'rgba(0,0,0,0.25)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, c.height / 2)
      ctx.lineTo(c.width, c.height / 2)
      ctx.stroke()
    }

    // stop wisper captions
    stopLiveCaptions()
    setIsMicActive(false)

    // placeholder for small 32x32 header preview when feed off
    const sp = headerPreviewCanvasRef.current
    if (sp) {
      const ctx = sp.getContext('2d', { alpha: false })!
      ctx.fillStyle = '#1a1a1a'
      ctx.fillRect(0, 0, 32, 32)
      ctx.strokeStyle = '#444'
      ctx.lineWidth = 1
      ctx.strokeRect(2, 2, 28, 28)
      ctx.fillStyle = '#666'
      ctx.font = '8px system-ui'
      ctx.fillText('LIVE', 5, 20)
    }
  }

  const processVideo = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    // Set sizes first (once per feed start)
    const w = 1280
    const h = 720
    canvas.width = w
    canvas.height = h

    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    // Create offscreen once
    if (!offscreenRef.current) {
      offscreenRef.current = document.createElement('canvas')
    }
    const off = offscreenRef.current
    off.width = w
    off.height = h
    const offCtx = off.getContext('2d', { willReadFrequently: true })
    if (!offCtx) return

    const draw = () => {
      if (!video || video.readyState < 2) {
        // wait for stream frames (esp. external ffmpeg/blank live urls)
        animationRef.current = requestAnimationFrame(draw)
        return
      }

      // Advance phase for animated light/iridescence (cheap)
      effectPhaseRef.current = (effectPhaseRef.current + 0.012) % (Math.PI * 2)

      // Base draw - HORIZONTALLY FLIPPED so movement matches (mirror like real mirror / selfie cam)
      offCtx.save()
      offCtx.translate(w, 0)
      offCtx.scale(-1, 1)
      offCtx.drawImage(video, 0, 0, w, h)
      offCtx.restore()

      // Pixelation pass (cheap aito/GMUNK style) — live values
      const px = pixelSizeRef.current
      const bl = blurAmountRef.current
      if (px > 1) {
        const pw = Math.floor(w / px)
        const ph = Math.floor(h / px)
        offCtx.imageSmoothingEnabled = false
        offCtx.drawImage(off, 0, 0, pw, ph)
        offCtx.drawImage(off, 0, 0, pw, ph, 0, 0, w, h)

        // Cheap iridescent light tint directly on the low-res pixel blocks (before upscale + effects).
        // This makes the "pixelization color effect" itself carry the moving holographic light.
        // One filter draw on the blocky data is very cheap.
        offCtx.save();
        offCtx.globalAlpha = 0.08;
        offCtx.filter = `hue-rotate(${(effectPhaseRef.current * 40) % 360}deg) saturate(1.3)`;
        offCtx.drawImage(off, 0, 0, w, h);
        offCtx.restore();
      }

      // Main canvas gets the processed (flipped)
      ctx.imageSmoothingEnabled = true
      ctx.drawImage(off, 0, 0, w, h)

      // Cheap blur pass (post)
      if (bl > 0) {
        ctx.filter = `blur(${bl}px)`
        ctx.drawImage(canvas, 0, 0)
        ctx.filter = 'none'
      }

      // Mix the looks (color/thermal/{decode:fax, invert:1, scan:1}) for live seg + tattoo/mark tracking
      // phase makes the pixel blocks + colors "breathe" with moving light/refraction (lambda.ai + crystal aesthetic)
      applyTrackingEffects(ctx, w, h, lookModeRef.current, effectPhaseRef.current)

      animationRef.current = requestAnimationFrame(draw)

      // Update 32x32 header feed preview (throttled to every 4th frame to reduce main-thread drawImage cost)
      // (includes flip, pixel, blur, mixed looks/thermal/fax/seg for the small live thumbnail)
      if ((effectPhaseRef.current * 100 | 0) % 4 === 0) {
        const smallPrevCanvas = headerPreviewCanvasRef.current
        if (smallPrevCanvas) {
          const spctx = smallPrevCanvas.getContext('2d', { alpha: false })!
          spctx.imageSmoothingEnabled = true
          spctx.drawImage(canvas, 0, 0, 1280, 720, 0, 0, 32, 32)
        }
      }
    }

    draw()
  }

  // Re-process when sliders/look change (while running)
  useEffect(() => {
    if (isFeedOn && animationRef.current) {
      // The draw loop reads live via refs (pixel/blur/lookModeRef), so just let it continue
    }
  }, [pixelSize, blurAmount, lookMode, isFeedOn])

  // Draw real-time waveform into the small header canvas (right of name)
  // Uses time-domain data from the mic (bundled with cam, or separate for external stream bg). Click waveform canvas to activate mic (starts live waveform + caption readouts in header).
  const drawWaveform = () => {
    const canvas = waveformCanvasRef.current
    const analyser = analyserRef.current
    if (!canvas || !analyser) {
      // no analyser (mic not active) - do not spin an empty rAF loop (was causing unnecessary CPU)
      waveformAnimRef.current = null
      return
    }
    const ctx = canvas.getContext('2d', { alpha: true })!
    const w = canvas.width
    const h = canvas.height
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    analyser.getByteTimeDomainData(dataArray)

    ctx.clearRect(0, 0, w, h)

    // subtle center reference (dark for white header)
    ctx.strokeStyle = 'rgba(0,0,0,0.15)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, h / 2)
    ctx.lineTo(w, h / 2)
    ctx.stroke()

    // main waveform (clean oscilloscope style)
    ctx.strokeStyle = 'rgba(0,0,0,0.85)'
    ctx.lineWidth = 1.25
    ctx.beginPath()
    const sliceWidth = w / bufferLength
    let x = 0
    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0
      const y = (v * h) / 2
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
      x += sliceWidth
    }
    ctx.stroke()

    waveformAnimRef.current = requestAnimationFrame(drawWaveform)
  }

  // Mix color / thermal / fax(decode, invert, scan) for live segmentation + mark/tattoo tracking
  // Enhanced with animated iridescent light shifts + prismatic color fringing on the pixelated blocks.
  // This makes the pixelization "affect light" in a holographic/caustic way (inspired by lambda.ai bg + the iridescent crystal reference).
  const applyTrackingEffects = (finalCtx: CanvasRenderingContext2D, W: number, H: number, mode: 'normal' | 'thermal' | 'fax' | 'mixed-seg', phase: number = 0) => {
    if (mode === 'normal') return;
    const id = finalCtx.getImageData(0, 0, W, H);
    const d = id.data;
    let sumX = 0, sumY = 0, count = 0;
    const isMixed = mode === 'mixed-seg';
    const doThermal = mode === 'thermal' || isMixed;
    const doFax = mode === 'fax' || isMixed;

    for (let i = 0; i < d.length; i += 4) {
      let r = d[i], g = d[i + 1], b = d[i + 2];
      const y = (0.299 * r + 0.587 * g + 0.114 * b) | 0;
      let nr = r, ng = g, nb = b;

      if (doThermal) {
        const t = y / 255;
        // thermal false-color ramp (blue cold -> cyan -> yellow -> red hot)
        if (t < 0.25) { nr = 0; ng = (t * 4 * 180) | 0; nb = 255; }
        else if (t < 0.5) { nr = ((t - 0.25) * 4 * 255) | 0; ng = 180 + ((t - 0.25) * 4 * 75) | 0; nb = 255 - ((t - 0.25) * 4 * 255) | 0; }
        else if (t < 0.75) { nr = 255; ng = 255 - ((t - 0.5) * 4 * 180) | 0; nb = ((t - 0.5) * 4 * 100) | 0; }
        else { nr = 255; ng = ((t - 0.75) * 4 * 120) | 0; nb = 0; }
        // keep a bit of original color
        nr = (nr * 0.75 + r * 0.25) | 0;
        ng = (ng * 0.75 + g * 0.25) | 0;
        nb = (nb * 0.75 + b * 0.25) | 0;
      }

      if (doFax) {
        let v = y > 105 ? 255 : 30;
        const row = ((i / 4) / W) | 0;
        if (row % 3 === 0) v = (v * 0.25) | 0; // scan:1
        if (true /*invert:1*/) v = 255 - v;
        if (isMixed) {
          // for mixed-seg: don't fully clobber to fax b/w (so thermal color base shows);
          // instead use fax for subtle scanline texture darkening on the (thermal) result
          if (row % 3 === 0) {
            nr = (nr * 0.55) | 0;
            ng = (ng * 0.55) | 0;
            nb = (nb * 0.55) | 0;
          }
          // light threshold pop for marks (darks get boosted contrast before red seg)
          if (y <= 105) {
            nr = (nr * 0.6) | 0;
            ng = (ng * 0.6) | 0;
            nb = (nb * 0.6) | 0;
          }
        } else {
          nr = ng = nb = v;
        }
      }

      // simple "segmentation" highlight for marks/tattoos (dark after fax-like)
      if (isMixed && y < 95) {
        const px = (i / 4) % W;
        const py = ((i / 4) / W) | 0;
        sumX += px; sumY += py; count++;
        // highlight marks in red for easy tracking
        nr = 220; ng = 30; nb = 30;
      }

      // Keep a modest saturation boost (cheap, no trig) - the fancy animated holographic light
      // is now done with a fast canvas filter composite pass after putImageData (GPU accelerated).
      const sat = 1.08;
      const avg = (nr + ng + nb) / 3;
      nr = Math.min(255, avg + (nr - avg) * sat);
      ng = Math.min(255, avg + (ng - avg) * sat);
      nb = Math.min(255, avg + (nb - avg) * sat);

      d[i] = nr; d[i + 1] = ng; d[i + 2] = nb;
    }
    finalCtx.putImageData(id, 0, 0);

    // Cheap post-process for "pixelization color effect affect light" (lambda.ai style holographic/caustic moving light).
    // Uses canvas filter + drawImage (GPU, ~100x faster than per-pixel sin in JS loop at 1280x720).
    // This tints the already-pixelated blocks with shifting iridescent color/light without killing framerate.
    finalCtx.save();
    finalCtx.globalAlpha = 0.11;
    finalCtx.filter = `hue-rotate(${(phase * 55) % 360}deg) saturate(1.45) brightness(1.03)`;
    finalCtx.drawImage(finalCtx.canvas, 0, 0);
    finalCtx.restore();

    // Live tracking marker for marks/tattoos (center of mass of segmented darks)
    if (isMixed && count > 20) {
      const tx = sumX / count;
      const ty = sumY / count;
      finalCtx.save();
      finalCtx.strokeStyle = '#0f0';
      finalCtx.lineWidth = 2.5;
      finalCtx.beginPath();
      finalCtx.arc(tx, ty, 14, 0, Math.PI * 2);
      finalCtx.stroke();
      finalCtx.fillStyle = 'rgba(0,255,0,0.15)';
      finalCtx.fill();
      finalCtx.fillStyle = '#0f0';
      finalCtx.font = '9px ui-sans-serif';
      finalCtx.fillText('TRACK', tx + 16, ty - 10);
      finalCtx.restore();
    }
  }

  // --- Live transcription/captions via the local wisper (whisper.cpp) engine ---
  // Triggered when feed starts (for cam: from same gUM; for stream: separate micOnly).
  // Sends short audio chunks to the companion server (transcribe-server.cjs)
  // which shells out to ~/models/audio/local-grok-audio.py (the downloaded wisper).
  const sendChunkForCaption = async (blob: Blob) => {
    const t0 = Date.now()
    try {
      const res = await fetch('http://localhost:8765/transcribe-chunk', {
        method: 'POST',
        headers: { 'Content-Type': 'audio/webm' },
        body: blob
      })
      const data = await res.json()
      const latency = Date.now() - t0
      if (data && data.text) {
        const txt = (data.text || '').trim()
        if (txt) {
          setLiveCaptions(prev => [...prev.slice(-5), txt])
        }
      }
      setCaptionInfo(prev => ({
        ...prev,
        lastLatencyMs: latency,
        bufferMs: Math.max(200, Math.round(blob.size / 12)), // rough for webm/opus
        chunks: prev.chunks + 1
      }))
    } catch (e) {
      // server not running is expected until user does `node transcribe-server.cjs`
      if (Math.random() < 0.05) console.debug('[captions] server not reachable — start with: node transcribe-server.cjs')
    }
  }

  const startLiveCaptions = (stream: MediaStream) => {
    try {
      const audioTracks = stream.getAudioTracks()
      if (!audioTracks.length) return
      const audioOnly = new MediaStream(audioTracks)
      const mr = new MediaRecorder(audioOnly, { mimeType: 'audio/webm;codecs=opus' })
      captionRecorderRef.current = mr as any // MediaRecorder from browser API
      mr.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 3000) {
          sendChunkForCaption(ev.data)
        }
      }
      mr.start(1350) // ~1.35s chunks → responsive live captions
      setCaptionInfo({ bufferMs: 0, lastLatencyMs: 0, chunks: 0, model: 'base.en' })
      setLiveCaptions([])
    } catch (e) {
      console.warn('live captions recorder failed to start', e)
    }
  }

  const stopLiveCaptions = () => {
    if (captionRecorderRef.current) {
      try { (captionRecorderRef.current as MediaRecorder).stop() } catch {}
      captionRecorderRef.current = null
    }
    setLiveCaptions([])
    setCaptionInfo({ bufferMs: 0, lastLatencyMs: 0, chunks: 0, model: 'base.en' })
  }

  // === Drawer + Tools for research / notes / sounding board (inspired by overview + blank) ===
  const [isDrawerOpen, setIsDrawerOpen] = useState(true)
  const [toolMode, setToolMode] = useState<'lens' | 'research' | 'audio' | 'sounding' | 'todos' | 'sections'>('sections')

  // Live captions / transcription state (replaces the old "activate camera feed" button; now works with cam or stream bg)
  const [liveCaptions, setLiveCaptions] = useState<string[]>([])
  const [captionInfo, setCaptionInfo] = useState({ bufferMs: 0, lastLatencyMs: 0, chunks: 0, model: 'base.en' })
  const [isCaptionsExpanded, setIsCaptionsExpanded] = useState(false)

  const captionRecorderRef = useRef<MediaRecorder | null>(null)

  // Toggle for other content / work surface visibility. When false, video feed is pure full background, UI (sections, tools, captions box, search, most header) hidden.
  // Translucent glass surfaces appear over the live feed bg when visible.
  const [uiVisible, setUiVisible] = useState(true)
  const [floatingControlsVisible, setFloatingControlsVisible] = useState(true)

  // For custom left dropdown like overview with sub collapsability
  const [showLeftMenu, setShowLeftMenu] = useState(false)

  // Mobile detection for adaptive layout (drawer overlay, condensed header, lens panel width/pos)
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const updateMobile = () => setIsMobile(typeof window !== 'undefined' && window.innerWidth < 640)
    updateMobile()
    window.addEventListener('resize', updateMobile)
    return () => window.removeEventListener('resize', updateMobile)
  }, [])

  // Coverflow for the (moved) main photo in drawer: left/right click-through like Andrew Coulter Enright's coverflow photo browser.
  // Photos: varied set (portrait + work/ancestry themed via picsum for demo; replace with real assets/ cdn from tadericson.com tree/projects as needed).
  const coverflowPhotos = [
    'https://picsum.photos/id/1005/600/600', // main portrait
    'https://picsum.photos/id/1011/600/600',
    'https://picsum.photos/id/1006/600/600',
    'https://picsum.photos/id/160/600/600',
    'https://picsum.photos/id/201/600/600',
    'https://picsum.photos/id/29/600/600',
    'https://picsum.photos/id/1009/600/600',
  ]
  const [coverflowIndex, setCoverflowIndex] = useState(0)
  const prevPhoto = () => setCoverflowIndex(i => (i - 1 + coverflowPhotos.length) % coverflowPhotos.length)
  const nextPhoto = () => setCoverflowIndex(i => (i + 1) % coverflowPhotos.length)

  // Research papers (local persisted)
  const [paperContent, setPaperContent] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('tadericson-paper') || '# Research Paper\n\nStart writing here...'
    return '# Research Paper\n\nStart writing here...'
  })
  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('tadericson-paper', paperContent)
  }, [paperContent])

  // Sounding board (dev ideas, reminders, thoughts - local persisted)
  const [soundingEntries, setSoundingEntries] = useState<Array<{id: number, text: string, ts: string}>>(() => {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('tadericson-sounding')
      return raw ? JSON.parse(raw) : []
    }
    return []
  })
  const [soundingInput, setSoundingInput] = useState('')
  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('tadericson-sounding', JSON.stringify(soundingEntries))
  }, [soundingEntries])

  const addToSoundingBoard = () => {
    if (!soundingInput.trim()) return
    const entry = {
      id: Date.now(),
      text: soundingInput.trim(),
      ts: new Date().toLocaleString()
    }
    setSoundingEntries(prev => [entry, ...prev].slice(0, 50)) // cap
    setSoundingInput('')
  }
  const clearSounding = () => setSoundingEntries([])

  // Todos / Weekly Reminders (persisted)
  const [todos, setTodos] = useState<Array<{id: number, text: string, done: boolean, category: 'dev' | 'todo' | 'reminder'}>>(() => {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('tadericson-todos')
      return raw ? JSON.parse(raw) : [
        {id: 1, text: 'Weekly: review ancestry lines', done: false, category: 'reminder'},
        {id: 2, text: 'Dev: integrate blank phrase search into drawer', done: false, category: 'dev'},
      ]
    }
    return []
  })
  const [newTodoText, setNewTodoText] = useState('')
  const [newTodoCat, setNewTodoCat] = useState<'dev'|'todo'|'reminder'>('dev')
  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('tadericson-todos', JSON.stringify(todos))
  }, [todos])

  const addTodo = () => {
    if (!newTodoText.trim()) return
    setTodos(prev => [...prev, { id: Date.now(), text: newTodoText.trim(), done: false, category: newTodoCat }])
    setNewTodoText('')
  }
  const toggleTodo = (id: number) => setTodos(prev => prev.map(t => t.id === id ? {...t, done: !t.done} : t))
  const deleteTodo = (id: number) => setTodos(prev => prev.filter(t => t.id !== id))

  // Audio notes recorder (session only for blobs; download to keep)
  const [isRecording, setIsRecording] = useState(false)
  const [recordings, setRecordings] = useState<Array<{id: number, label: string, url: string, ts: string}>>([])
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      mediaRecorderRef.current = mr
      audioChunksRef.current = []
      mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data) }
      mr.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        const rec = {
          id: Date.now(),
          label: `Note ${new Date().toLocaleTimeString()}`,
          url,
          ts: new Date().toISOString()
        }
        setRecordings(prev => [rec, ...prev])
        // stop tracks
        stream.getTracks().forEach(t => t.stop())
        setIsRecording(false)
      }
      mr.start()
      setIsRecording(true)
    } catch (err) {
      alert('Microphone access needed for audio notes.')
      console.error(err)
    }
  }
  const stopAudioRecording = () => {
    mediaRecorderRef.current?.stop()
  }
  const deleteRecording = (id: number) => {
    setRecordings(prev => {
      const rec = prev.find(r => r.id === id)
      if (rec) URL.revokeObjectURL(rec.url)
      return prev.filter(r => r.id !== id)
    })
  }
  const renameRecording = (id: number, newLabel: string) => {
    setRecordings(prev => prev.map(r => r.id === id ? {...r, label: newLabel} : r))
  }

  return (
    <div className="app-shell">
      {/* VIDEO FEED AS FULL BACKGROUND ELEMENT.
          The processed feed — local cam OR external live stream (ffplay/ffmpeg local http, fornevercollective.github.io/blank/ etc) —
          with flip + pixelation + blur + mixed thermal/fax/invert/scan/seg effects — is the immersive bg.
          Internal res 1280x720 with CSS cover. Hidden <video> is the source (srcObject or .src). */}
      <div className="fixed inset-0 z-0 bg-black">
        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover"
        />
        <video ref={videoRef} className="hidden" muted playsInline />
        {/* Subtle live badge only when UI hidden, so pure feed has minimal chrome */}
        {isFeedOn && !uiVisible && (
          <div className="absolute top-3 right-3 text-[9px] tracking-[2px] text-white/30 pointer-events-none">LIVE FEED — CLICK HEADER 32x32 TO TOGGLE UI</div>
        )}
      </div>

      {/* Transparent gesture layer above bg for drag-to-adjust lens params (pixel/blur) directly on the feed surface.
          Lower z than UI so clicks on translucent work surfaces take precedence; exposed fully when ui hidden. */}
      <div
        className="fixed inset-0 z-[5]"
        onPointerMove={(e) => {
          if (!isFeedOn) return;
          // Map screen position to params for "working" gesture directly on the translucent-over-feed or pure bg
          const x = Math.max(0, Math.min(1, e.clientX / window.innerWidth));
          const y = Math.max(0, Math.min(1, e.clientY / window.innerHeight));
          setPixelSize(Math.max(1, Math.min(32, 1 + Math.floor(x * 31))));
          setBlurAmount(Math.max(0, Math.min(18, Math.floor(y * 18))));
        }}
        style={{ pointerEvents: uiVisible ? 'none' : 'auto' }} // when UI visible, rely on explicit controls in glass; full gesture when pure bg
        title="Drag anywhere on feed (when UI hidden) or over glass: horizontal=pixelate, vertical=blur (works for cam or stream)"
      />

      {/* Live captions / lens controls (floating glass, aito-style data rows).
          Includes BG SOURCE switch (CAM / STREAM url + LOAD) so you can pipe ffplay/ffmpeg or fornevercollective.github.io/blank/ live video into the processing bg.
          Rendered here (gated only by floatingControlsVisible +) so it works even when "everything is hidden"
          via ^ (uiVisible=false for pure full-bleed feed + minimal header).
          Uses dynamic fixed position: just under header when pure; below search + offset for drawer when surfaces shown.
          This ensures .caption-strip hover + click-to-expand/collapse always functions in immersive mode.
          The box sits over video bg (higher z than gesture layer). */}
      {floatingControlsVisible && (
      <div
        className={`lens-controls iridescent-glass-dark ${isCaptionsExpanded ? 'expanded' : 'collapsed'}`}
        style={{
          position: 'fixed',
          top: uiVisible ? (isMobile ? 86 : 90) : (isMobile ? 50 : 52),
          left: isMobile ? 8 : (uiVisible && isDrawerOpen ? 312 : 12),
          zIndex: 60,
        }}
      >
        {/* Always-visible small caption box (the replacement UI) */}
        <div
          className="caption-strip flex items-start justify-between gap-2 cursor-pointer select-none"
          onClick={() => setIsCaptionsExpanded(!isCaptionsExpanded)}
          title={isCaptionsExpanded ? 'Collapse to small caption box' : 'Expand for lens controls + more captions'}
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/60">
              LIVE CAPTIONS <span className="normal-case tracking-normal text-emerald-400/70">wisper</span>
              <span className="font-mono text-[9px] text-white/40">buf {captionInfo.bufferMs}ms</span>
            </div>
            <div className="text-[12px] leading-tight text-white/90 mt-0.5 pr-1 h-[2.1em] overflow-hidden">
              {liveCaptions.length
                ? liveCaptions.slice(-2).join(' ')
                : ((isFeedOn || isMicActive) ? '— listening for speech —' : 'activate feed (header 32x32) or click waveform for live captions')}
            </div>
          </div>
          <div className="text-right text-[10px] font-mono text-white/50 pt-0.5 whitespace-nowrap">
            {captionInfo.lastLatencyMs}ms<br />
            <span className="text-[8px]">{captionInfo.chunks} chunks</span>
          </div>
          <div className="text-lg leading-none text-white/50 pt-0.5">{isCaptionsExpanded ? '−' : '+'}</div>
        </div>

        {/* Expanded content: lens params (only when feed active) + BG SOURCE (always choosable when expanded, so you can pick before starting) + MIX */}
        {isCaptionsExpanded && (
          <div className="pt-2 mt-2 border-t border-white/15">
            {isFeedOn && (
              <>
                <div className="data-row">
                  <label>PIXELATE</label>
                  <span className="font-mono text-[10px]">{pixelSize}px</span>
                </div>
                <input type="range" min="1" max="32" step="1" value={pixelSize} onChange={e=>setPixelSize(parseInt(e.target.value))} className="w-full accent-white mb-2" />

                <div className="data-row">
                  <label>BLUR</label>
                  <span className="font-mono text-[10px]">{blurAmount}px</span>
                </div>
                <input type="range" min="0" max="18" step="1" value={blurAmount} onChange={e=>setBlurAmount(parseInt(e.target.value))} className="w-full accent-white" />

                <div className="text-[9px] text-white/40 mt-1">aito / GMUNK realtime processing</div>
              </>
            )}

            {/* BG SOURCE chooser - works before/after feed start. Supports the new local test vids. */}
            <div className="mt-2 pt-2 border-t border-white/15">
              <div className="label mb-1">BG SOURCE — the pixelization + color/light effects process whatever is here</div>
              <div className="flex flex-wrap gap-1 mb-1">
                <button
                  onClick={() => {
                    const prev = feedMode
                    setFeedMode('camera')
                    if (isFeedOn && prev !== 'camera') {
                      stopFeed()
                      setTimeout(() => startFeed(), 30)
                    }
                  }}
                  className={`text-[9px] px-1.5 py-0.5 rounded border ${feedMode === 'camera' ? 'bg-white text-black border-white' : 'border-white/30 hover:bg-white/10'}`}
                >
                  CAM
                </button>
                <button
                  onClick={() => setFeedMode('stream')}
                  className={`text-[9px] px-1.5 py-0.5 rounded border ${feedMode === 'stream' ? 'bg-white text-black border-white' : 'border-white/30 hover:bg-white/10'}`}
                >
                  URL
                </button>
                <button
                  onClick={() => setFeedMode('file')}
                  className={`text-[9px] px-1.5 py-0.5 rounded border ${feedMode === 'file' ? 'bg-white text-black border-white' : 'border-white/30 hover:bg-white/10'}`}
                >
                  FILE
                </button>
              </div>

              {feedMode === 'stream' && (
                <div className="flex gap-1 items-center">
                  <input
                    value={streamUrl}
                    onChange={(e) => setStreamUrl(e.target.value)}
                    placeholder="http://... or /videos/test1.mp4 (local tests)"
                    className="flex-1 text-[9px] bg-black/40 border border-white/20 rounded px-1 py-0.5 font-mono"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && streamUrl.trim()) {
                        if (isFeedOn) stopFeed()
                        setTimeout(() => startFeed(), 10)
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (isFeedOn) stopFeed()
                      setTimeout(() => startFeed(), 10)
                    }}
                    disabled={!streamUrl.trim()}
                    className="text-[9px] px-1.5 py-0.5 rounded border border-white/30 hover:bg-white/10 disabled:opacity-40"
                    title="Load URL (or relative /videos/testN.mp4) as bg source"
                  >
                    LOAD
                  </button>
                </div>
              )}

              {feedMode === 'file' && (
                <div className="flex gap-1 items-center flex-wrap">
                  <button onClick={pickFile} className="text-[9px] px-1.5 py-0.5 rounded border border-white/30 hover:bg-white/10">PICK VIDEO FILE</button>
                  {selectedFile && <span className="text-[8px] text-white/60 max-w-[110px] truncate">{selectedFile.name}</span>}
                  <button
                    onClick={() => {
                      if (isFeedOn) stopFeed()
                      setTimeout(() => startFeed(), 10)
                    }}
                    disabled={!selectedFileUrl}
                    className="text-[9px] px-1.5 py-0.5 rounded border border-white/30 hover:bg-white/10 disabled:opacity-40"
                    title="Load the picked file into the processed bg (effects + preview apply)"
                  >
                    LOAD
                  </button>
                </div>
              )}

              {/* Quick buttons for the 3 new test videos (copied to public/videos/ for easy local testing of the pixel/color/light effects) */}
              <div className="mt-1.5">
                <div className="text-[8px] text-white/35 mb-0.5">Quick test vids (new user clips):</div>
                <div className="flex gap-1 flex-wrap">
                  {[1,2,3].map(n => (
                    <button
                      key={n}
                      onClick={() => {
                        setFeedMode('stream')
                        setStreamUrl(`/videos/test${n}.mp4`)
                        if (isFeedOn) stopFeed()
                        setTimeout(() => startFeed(), 25)
                      }}
                      className="text-[8px] px-1 py-0.5 rounded border border-white/20 hover:bg-white/10 active:bg-white/20"
                    >
                      TEST {n}
                    </button>
                  ))}
                </div>
              </div>
              <div className="text-[7px] text-white/25 mt-1 leading-none">All sources (cam/url/file) get the same flip + pixelization + color/light effects + iridescent overlays. Waveform click (by name) starts mic for captions.</div>
            </div>

            {/* Mix looks (only when feed running) */}
            {isFeedOn && (
              <div className="mt-2 pt-2 border-t border-white/15">
                <div className="label mb-1">MIX LOOK (seg/track)</div>
                <div className="flex flex-wrap gap-1">
                  {(['normal','thermal','fax','mixed-seg'] as const).map(l => (
                    <button
                      key={l}
                      onClick={() => setLookMode(l)}
                      className={`text-[9px] px-1.5 py-0.5 rounded border ${lookMode === l ? 'bg-white text-black border-white' : 'border-white/30 hover:bg-white/10'}`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
                <div className="text-[8px] text-white/30 mt-1 leading-none">color + thermal + fax(invert+scan) mixed for marks/tattoos</div>
              </div>
            )}

            {/* Hidden file picker for FILE source mode */}
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        )}

        <div className="text-[9px] text-white/30 mt-1">Click strip to collapse/expand • header 32x32 starts visual feed (cam/stream) • click waveform starts mic (waveform + caption readouts) (run: node transcribe-server.cjs)</div>
      </div>
      )}

      {/* Header: name + 32x32 live feed preview next to it (cam / url / file) + drawer toggle + PWA bits. Overlays below use iridescent crystal styling. */}
      <header className="header fixed top-0 left-0 right-0 flex items-center px-2 sm:px-4 z-[200]">
        <button
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          className="mr-1 sm:mr-3 p-1.5 rounded hover:bg-zinc-100"
          title={isDrawerOpen ? 'Close drawer' : 'Open research drawer'}
        >
          {isDrawerOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <div className="flex items-center gap-1 sm:gap-1.5 cursor-pointer select-none" onClick={() => { setToolMode('lens'); setIsDrawerOpen(true); }}>
          {/* + button to toggle floating controls (lens-controls / captions box) visibility, placed left of the ^ */}
          <button
            onClick={(e) => { e.stopPropagation(); setFloatingControlsVisible(!floatingControlsVisible); }}
            className="text-xs sm:text-sm leading-none px-1 py-0.5 rounded hover:bg-zinc-100 active:bg-zinc-200"
            title={floatingControlsVisible ? "Hide floating controls (the lens/captions box over the video feed)" : "Show floating controls (lens params + captions over the video feed)"}
          >
            +
          </button>
          {/* Toggle for other content visibility (now a ^ caret), placed left of the 32x32 preview.
              Hides/shows sections/tools/captions-box/search/drawer etc.
              Leaves pure video feed as full immersive background + minimal header (preview + name + this toggle).
              When shown: the tool-pane, editors, sections etc act as translucent work surfaces over the live feed. */}
          <button
            onClick={(e) => { e.stopPropagation(); setUiVisible(!uiVisible); }}
            className="text-xs sm:text-sm leading-none px-1 py-0.5 rounded hover:bg-zinc-100 active:bg-zinc-200"
            title={uiVisible ? "Hide other content (pure video feed background)" : "Show translucent work surfaces & other content over the live feed"}
          >
            ^
          </button>
          {/* The 32x32 canvas IS the live preview (replaces static icon).
              Shows real-time processed feed (flipped + effects) scaled to 32x32, for cam OR external stream.
              Continues the live from Overview "live button". Click to toggle feed (source chosen in floating BG SOURCE). */}
          <canvas
            ref={headerPreviewCanvasRef}
            width={32}
            height={32}
            className="rounded border border-zinc-400 bg-black cursor-pointer hover:border-emerald-500 active:scale-[0.95] transition flex-shrink-0"
            style={{ imageRendering: 'pixelated' }}
            onClick={(e) => { e.stopPropagation(); isFeedOn ? stopFeed() : startFeed(); }}
            title={isFeedOn ? "Stop Live Feed (32x32 header preview of processed bg)" : "Activate Live Feed — 32x32 preview in header (CAM or STREAM url); start from Overview live button"}
            aria-label="32x32 live feed preview - click to toggle (cam or external stream)"
          />
          <span className="header-name text-[18px] sm:text-[21px] text-zinc-950">TAD ERICSON</span>
          <canvas 
            ref={waveformCanvasRef} 
            width={isMobile ? 60 : 92} 
            height={isMobile ? 12 : 15} 
            className="align-middle opacity-75 cursor-pointer hover:opacity-100 active:opacity-60" 
            style={{ imageRendering: 'pixelated' as any }}
            title="Audio waveform — click to activate mic (enables live waveform + captions readouts)"
            onClick={(e) => { e.stopPropagation(); if (!isMicActive) startMicOnly(); setFloatingControlsVisible(true); }}
          />
          {/* Live caption readout (redout) inline next to waveform in header, for quick glance without opening floating panel. Hidden on mobile to save space. */}
          {!isMobile && (isMicActive || liveCaptions.length > 0) && (
            <span
              className="ml-1.5 text-[9px] leading-none text-zinc-600/80 font-mono align-middle max-w-[100px] truncate select-none"
              title={liveCaptions.length ? liveCaptions.slice(-3).join(' ') : 'mic active — wisper live captions'}
            >
              {liveCaptions.length ? liveCaptions[liveCaptions.length - 1] : '— listening —'}
            </span>
          )}
        </div>

        <div className="flex-1" />

        {/* Right header controls: hidden when ui hidden for pure minimal header (preview + name + toggle only) */}
        {uiVisible && (
        <div className="flex items-center gap-1 sm:gap-2 text-[8px] sm:text-[10px] uppercase tracking-widest text-zinc-600 pr-1 sm:pr-2 overflow-x-auto">
          {showInstall && !isInstalled && (
            <button onClick={handleInstallClick} className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-zinc-900 text-white hover:bg-black flex items-center gap-1 text-[8px] sm:text-[10px]">
              <Download className="w-3 h-3" /> INSTALL
            </button>
          )}
          {isInstalled && <span className="px-1.5 py-0.5 border border-white/30 rounded text-[8px] sm:text-[10px]">INSTALLED</span>}
          {needRefresh && (
            <button onClick={() => updateServiceWorker(true)} className="px-2 py-0.5 sm:px-3 sm:py-1 border border-zinc-300 rounded flex items-center gap-1 hover:bg-zinc-100 text-[8px] sm:text-[10px]">
              <RefreshCw className="w-3 h-3" /> UPDATE
            </button>
          )}
          {/* quick-nav pills exactly "code work tree chat | live paper audio sboad todo" (no SECS per spec)
              left subgroup: code/work/tree -> sections view (full original+code content), chat -> open grok share link
              right subgroup: live (activates lens bg + ensures floatingControlsVisible + captions + cam), paper->research, audio, sboad->sounding, todo->todos
              compact upper pills + active black styling when matching current toolMode (or floating for live). On mobile: tighter + scrollable. */}
          <div className="flex items-center gap-0.5 flex-shrink-0">
            {(['code','work','tree','chat'] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  if (m === 'chat') {
                    window.open('https://grok.com/share/bGVnYWN5LWNvcHk_4da5b936-1d90-489b-855a-411f442f1060', '_blank');
                  } else {
                    setToolMode('sections');
                  }
                }}
                className={`px-1 py-0.5 rounded text-[7px] sm:text-[9px] uppercase tracking-[1px] ${toolMode === 'sections' && m !== 'chat' ? 'bg-black text-white' : 'hover:bg-zinc-100 text-zinc-600'}`}
                title={m}
              >
                {m.toUpperCase()}
              </button>
            ))}
            <span className="mx-0.5 text-zinc-300 select-none text-[9px] sm:text-[10px]">|</span>
            <button
              onClick={() => {
                setFloatingControlsVisible(true);
                if (!isFeedOn) startFeed();
                setToolMode('lens');
              }}
              className={`px-1 py-0.5 rounded text-[7px] sm:text-[9px] uppercase tracking-[1px] ${(toolMode === 'lens' || floatingControlsVisible) ? 'bg-black text-white' : 'hover:bg-zinc-100 text-zinc-600'}`}
              title="Activate Live Feed (cam or stream url into bg + 32x32 preview + wisper captions); show floating controls"
            >
              LIVE
            </button>
            {(['paper','audio','sboad','todo'] as const).map((m) => {
              const targetMode = (m === 'paper' ? 'research' : m === 'audio' ? 'audio' : m === 'sboad' ? 'sounding' : 'todos') as 'research' | 'audio' | 'sounding' | 'todos';
              const label = m === 'sboad' ? 'SBOAD' : m.toUpperCase();
              return (
                <button
                  key={m}
                  onClick={() => setToolMode(targetMode)}
                  className={`px-1 py-0.5 rounded text-[7px] sm:text-[9px] uppercase tracking-[1px] ${toolMode === targetMode ? 'bg-black text-white' : 'hover:bg-zinc-100 text-zinc-600'}`}
                  title={m}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
        )}
      </header>

      {/* Thin white search bar under header — left dropdown now like overview (categorized with sub-collapsability via details) */}
      {uiVisible && (
      <div className="search-bar iridescent-glass" style={{ marginTop: isMobile ? 48 : 52 }}>
        {/* Custom LEFT "dropdown" / sections menu with sub collapsability (overview style cats + details/summary) */}
        <div className="relative" style={{ minWidth: isMobile ? '92px' : '120px' }}>
          <button
            onClick={() => setShowLeftMenu(!showLeftMenu)}
            className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 border border-zinc-300 rounded bg-white hover:bg-zinc-50 flex items-center gap-1 w-full justify-between"
            title="Sections & Tools (click for collapsible categories like Overview's tool hub)"
          >
            {isMobile ? 'Secs ▾' : 'Sections ▾'}
          </button>
          {showLeftMenu && (
            <div className="absolute left-0 top-full mt-1 bg-white border border-zinc-300 rounded shadow z-50 text-xs p-1 max-h-[60vh] overflow-auto" style={{ width: isMobile ? 'min(240px, 92vw)' : '256px' }}>
              {/* Cinematic / Live */}
              <details open className="mb-1">
                <summary className="cursor-pointer px-1 py-0.5 font-medium text-zinc-700 hover:bg-zinc-100 rounded">Cinematic / Live</summary>
                <div className="pl-3 py-0.5">
                  <button onClick={() => { setToolMode('lens'); setShowLeftMenu(false); }} className="block w-full text-left px-1 py-0.5 hover:bg-zinc-100 rounded">Live Feed + Captions (cam or stream)</button>
                </div>
              </details>

              {/* Original sections we started with (full, not just early portfolio stub) */}
              <details open className="mb-1">
                <summary className="cursor-pointer px-1 py-0.5 font-medium text-zinc-700 hover:bg-zinc-100 rounded">Original Sections (from start)</summary>
                <div className="pl-3 py-0.5 space-y-0.5">
                  <button onClick={() => { setToolMode('sections'); setShowLeftMenu(false); }} className="block w-full text-left px-1 py-0.5 hover:bg-zinc-100 rounded font-medium">All Sections (Work • Code • Tree • Collective • Contact)</button>
                  <button onClick={() => { setToolMode('sections'); setShowLeftMenu(false); }} className="block w-full text-left px-1 py-0.5 hover:bg-zinc-100 rounded text-xs">— Work (Film/TV/VEVO)</button>
                  <button onClick={() => { setToolMode('sections'); setShowLeftMenu(false); }} className="block w-full text-left px-1 py-0.5 hover:bg-zinc-100 rounded text-xs">— Code &amp; Systems</button>
                  <button onClick={() => { setToolMode('sections'); setShowLeftMenu(false); }} className="block w-full text-left px-1 py-0.5 hover:bg-zinc-100 rounded text-xs">— The Tree + Ancestry</button>
                  <button onClick={() => { setToolMode('sections'); setShowLeftMenu(false); }} className="block w-full text-left px-1 py-0.5 hover:bg-zinc-100 rounded text-xs">— Collective &amp; Brands</button>
                  <button onClick={() => { setToolMode('sections'); setShowLeftMenu(false); }} className="block w-full text-left px-1 py-0.5 hover:bg-zinc-100 rounded text-xs">— Contact</button>
                </div>
              </details>

              {/* Research tools (additions) */}
              <details className="mb-1">
                <summary className="cursor-pointer px-1 py-0.5 font-medium text-zinc-700 hover:bg-zinc-100 rounded">Research Tools</summary>
                <div className="pl-3 py-0.5 space-y-0.5">
                  <button onClick={() => { setToolMode('research'); setShowLeftMenu(false); }} className="block w-full text-left px-1 py-0.5 hover:bg-zinc-100 rounded">Papers</button>
                  <button onClick={() => { setToolMode('audio'); setShowLeftMenu(false); }} className="block w-full text-left px-1 py-0.5 hover:bg-zinc-100 rounded">Audio Notes</button>
                  <button onClick={() => { setToolMode('sounding'); setShowLeftMenu(false); }} className="block w-full text-left px-1 py-0.5 hover:bg-zinc-100 rounded">Sounding Board</button>
                  <button onClick={() => { setToolMode('todos'); setShowLeftMenu(false); }} className="block w-full text-left px-1 py-0.5 hover:bg-zinc-100 rounded">Todos + Reminders</button>
                </div>
              </details>

              <div className="border-t my-1" />
              <button onClick={() => { setToolMode('sections'); setShowLeftMenu(false); }} className="block w-full text-left px-1 py-0.5 hover:bg-zinc-100 rounded text-xs text-zinc-500">Show All Original Sections on page</button>
            </div>
          )}
        </div>

        {/* Search input (central, white bar) */}
        <input
          type="search"
          placeholder={isMobile ? "Search…" : "Search notes, todos, transcripts, ideas…"}
          className={isMobile ? "" : "min-w-[140px]"}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
              // quick add to sounding board as example
              setSoundingInput(e.currentTarget.value.trim())
              setTimeout(() => {
                if ((e.target as HTMLInputElement).value) {
                  const val = (e.target as HTMLInputElement).value
                  const entry = { id: Date.now(), text: val, ts: new Date().toLocaleString() }
                  setSoundingEntries(p => [entry, ...p].slice(0,50))
                  ;(e.target as HTMLInputElement).value = ''
                }
              }, 0)
            }
          }}
        />

        {/* RIGHT dropdown for "other tools" (blank/overview inspired, quick actions) */}
        <select
          defaultValue=""
          onChange={(e) => {
            const v = e.target.value
            if (v === 'aito') window.open('https://fornevercollective.github.io/aito/', '_blank')
            if (v === 'overview') window.open('https://fornevercollective.github.io/overview/', '_blank')
            if (v === 'blank') window.open('https://fornevercollective.github.io/blank/', '_blank')
            if (v === 'chat') window.open('https://grok.com/share/bGVnYWN5LWNvcHk_4da5b936-1d90-489b-855a-411f442f1060', '_blank')
            if (v === 'phrase') {
              // stub: focus drawer + add example
              setIsDrawerOpen(true)
              setToolMode('sounding')
              setSoundingInput('phrase search from blank: "live" "scene"')
            }
            e.target.value = ''
          }}
          title="Other tools & links (blank / overview / chats)"
          className="max-w-[90px] sm:max-w-none"
        >
          <option value="" disabled>{isMobile ? 'Tools…' : 'Other tools…'}</option>
          <option value="aito">aito</option>
          <option value="overview">overview</option>
          <option value="blank">blank</option>
          <option value="chat">chat</option>
          <option value="phrase">phrase</option>
        </select>

        <div className="text-[9px] text-neutral-500 ml-auto pr-1 hidden md:block">Drop downs for tools • search adds to sounding board</div>
      </div>
      )}

      {/* BODY: drawer (pop-out) + main area. Hidden when uiVisible=false for pure video bg. Overlays now use iridescent crystal glass (not plain translucent). */}
      {uiVisible && (
      <>
      <div className="flex flex-1 overflow-hidden" style={{ paddingTop: 0 }}>
        {/* Mobile backdrop for drawer overlay (tap anywhere to close) */}
        {isMobile && isDrawerOpen && (
          <div
            className="fixed inset-0 z-[185] bg-black/25"
            style={{ top: 82 }}
            onClick={() => setIsDrawerOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* LEFT POP-OUT DRAWER: main pic + title moved here + original chat links + tools from overview/blank built-in.
            On mobile (<640) CSS makes it a fixed overlay (slides over main content); on desktop it participates in the flex row. */}
        <div className={`drawer iridescent-glass ${isDrawerOpen ? '' : 'closed'}`} style={{ marginTop: isMobile ? 0 : 0 }}>
          <div className="p-4">
            {/* Coverflow for the photo (replaces static portrait).
                Left/right click-through on the photo (or arrows) like Andrew Coulter Enright coverflow.
                Click left half/side photo = prev, right = next. 3D-ish perspective with scale/rotate/opacity for prev/current/next.
                The "main photo" area now browses a set (extend coverflowPhotos with real tree/project images). */}
            <div className="relative mx-auto mb-3" style={{ width: isMobile ? '108px' : '140px', height: isMobile ? '86px' : '112px' }}>
              {/* Click zones for left/right through on the photo itself */}
              <div
                className="absolute left-0 top-0 w-2/5 h-full z-30 cursor-w-resize"
                onClick={prevPhoto}
                title="Previous (left click through coverflow)"
              />
              <div
                className="absolute right-0 top-0 w-2/5 h-full z-30 cursor-e-resize"
                onClick={nextPhoto}
                title="Next (right click through coverflow)"
              />

              {/* Coverflow layers: prev / current / next with transforms */}
              {(() => {
                const cfOff = isMobile ? 12 : 18
                const cfMainW = isMobile ? '86px' : '112px'
                const cfSideW = isMobile ? '72px' : '92px'
                const cfH = isMobile ? '86px' : '112px'
                return [-1, 0, 1].map((off) => {
                  const idx = (coverflowIndex + off + coverflowPhotos.length) % coverflowPhotos.length
                  const isCurrent = off === 0
                  return (
                    <img
                      key={off}
                      src={coverflowPhotos[idx]}
                      alt={`Photo ${idx + 1}`}
                      className="absolute top-0 object-cover rounded-2xl border border-zinc-300 shadow-xl transition-all duration-300"
                      style={{
                        left: `calc(50% + ${off * cfOff}px)`,
                        transform: `translateX(-50%) scale(${isCurrent ? 1 : 0.72}) rotateY(${off * -28}deg)`,
                        zIndex: 10 - Math.abs(off),
                        width: isCurrent ? cfMainW : cfSideW,
                        height: cfH,
                        opacity: isCurrent ? 1 : 0.55,
                      }}
                      onClick={isCurrent ? undefined : (off < 0 ? prevPhoto : nextPhoto)}
                    />
                  )
                })
              })()}

              {/* Small arrows for explicit left/right */}
              <button
                onClick={prevPhoto}
                className={`absolute left-0 top-1/2 -translate-y-1/2 z-40 ${isMobile ? 'text-[14px] px-0.5' : 'text-[18px] px-1'} text-white/70 hover:text-white bg-black/30 rounded`}
                title="Previous photo"
              >‹</button>
              <button
                onClick={nextPhoto}
                className={`absolute right-0 top-1/2 -translate-y-1/2 z-40 ${isMobile ? 'text-[14px] px-0.5' : 'text-[18px] px-1'} text-white/70 hover:text-white bg-black/30 rounded`}
                title="Next photo"
              >›</button>
            </div>

            <div className="text-center mb-3">
              <div className="font-light tracking-tight text-lg">Tad Ericson</div>
              <div className="text-[11px] text-zinc-600">Oregon, USA • Fornever Collective • click sides/arrows to coverflow</div>
            </div>

            {/* Original chat links + socials + code world links */}
            <div className="mb-4">
              <div className="uppercase text-[9px] tracking-[1.5px] text-zinc-500 mb-1.5">CHATS &amp; LINKS</div>
              <div className="space-y-1 text-xs">
                <a href="https://grok.com/share/bGVnYWN5LWNvcHk_4da5b936-1d90-489b-855a-411f442f1060" target="_blank" className="flex items-center gap-1.5 hover:text-zinc-800 text-zinc-700">
                  <LinkIcon className="w-3 h-3" /> Grok Share — PWA Build Chat
                </a>
                <a href="https://fornevercollective.github.io/aito/" target="_blank" className="flex items-center gap-1.5 hover:text-zinc-800 text-zinc-700">aito live</a>
                <a href="https://fornevercollective.github.io/overview/" target="_blank" className="flex items-center gap-1.5 hover:text-zinc-800 text-zinc-700">overview research</a>
                <a href="https://fornevercollective.github.io/blank/" target="_blank" className="flex items-center gap-1.5 hover:text-zinc-800 text-zinc-700">blank (scene + phrase)</a>
                <a href="https://github.com/fornevercollective" target="_blank" className="flex items-center gap-1.5 hover:text-zinc-800 text-zinc-700">fornevercollective (code)</a>
                {site.socialLinks.slice(0,3).map((s,i) => (
                  <a key={i} href={s.url} target="_blank" className="flex items-center gap-1.5 hover:text-zinc-800 text-zinc-700">{s.label}</a>
                ))}
              </div>
            </div>

            {/* BUILT-IN TOOLS (from overview/blank + for writing papers, audio notes, sounding board, todos/weekly reminders) */}
            <div>
              <div className="uppercase text-[9px] tracking-[1.5px] text-zinc-500 mb-2">IN-DRAWER TOOLS</div>

              {/* Research Papers writer (compact) */}
              <div className="mb-3">
                <div className="flex items-center gap-1 text-xs mb-1 text-emerald-700"><FileText className="w-3.5 h-3.5" /> Research Papers</div>
                <textarea
                  className="note-input h-16 text-xs"
                  value={paperContent.slice(0, 280)}
                  onChange={e => setPaperContent(e.target.value)}
                  placeholder="Write paper here..."
                />
                <div className="text-[10px] text-white/50 mt-0.5">Saved to localStorage • switch to "Research Paper" in top bar for full focus</div>
              </div>

              {/* Audio Notes recorder */}
              <div className="mb-3">
                <div className="flex items-center gap-1 text-xs mb-1 text-emerald-700"><Mic className="w-3.5 h-3.5" /> Audio Notes</div>
                <button
                  onClick={isRecording ? stopAudioRecording : startAudioRecording}
                  className={`text-xs px-3 py-1 rounded border ${isRecording ? 'bg-red-600 text-white border-red-500' : 'border-zinc-300 hover:bg-zinc-100'}`}
                >
                  {isRecording ? '■ STOP' : '● RECORD MIC'}
                </button>
                <div className="mt-1 space-y-0.5 max-h-[72px] overflow-auto text-[11px]">
                  {recordings.length === 0 && <div className="text-zinc-400 text-[10px]">Recordings (session) — download to keep</div>}
                  {recordings.slice(0,3).map(r => (
                    <div key={r.id} className="recording-item">
                      <button onClick={() => { const a = new Audio(r.url); a.play() }} className="underline">▶</button>
                      <input className="bg-transparent text-xs flex-1" defaultValue={r.label} onBlur={e=>renameRecording(r.id, e.target.value)} />
                      <button onClick={() => deleteRecording(r.id)} className="text-red-400/70">×</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sounding board (dev ideas / reminders) */}
              <div className="mb-3">
                <div className="flex items-center gap-1 text-xs mb-1 text-emerald-700"><MessageSquare className="w-3.5 h-3.5" /> Sounding Board</div>
                <div className="flex gap-1">
                  <input className="note-input flex-1 text-xs h-7" placeholder="Idea or note..." value={soundingInput} onChange={e=>setSoundingInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addToSoundingBoard()} />
                  <button onClick={addToSoundingBoard} className="text-xs px-2 border border-zinc-300 rounded">Add</button>
                </div>
                <button onClick={clearSounding} className="text-[10px] text-zinc-400 mt-0.5">clear</button>
                <div className="max-h-24 overflow-auto text-[10px] mt-1 space-y-1">
                  {soundingEntries.slice(0,4).map(e => <div key={e.id} className="text-zinc-700">• {e.text} <span className="text-zinc-400">({e.ts})</span></div>)}
                </div>
              </div>

              {/* Todos / Weekly Reminders */}
              <div>
                <div className="flex items-center gap-1 text-xs mb-1 text-emerald-700"><ListChecks className="w-3.5 h-3.5" /> Todos &amp; Reminders</div>
                <div className="flex gap-1 mb-1">
                  <input className="note-input flex-1 text-xs h-7" placeholder="New item..." value={newTodoText} onChange={e=>setNewTodoText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addTodo()} />
                  <select className="text-xs bg-white border border-zinc-300 rounded" value={newTodoCat} onChange={e=>setNewTodoCat(e.target.value as any)}>
                    <option value="dev">dev</option>
                    <option value="todo">todo</option>
                    <option value="reminder">remind</option>
                  </select>
                  <button onClick={addTodo} className="text-xs px-2 border border-white/20 rounded">+</button>
                </div>
                <div className="max-h-28 overflow-auto text-xs">
                  {todos.map(t => (
                    <div key={t.id} className="todo-item text-[11px]">
                      <input type="checkbox" checked={t.done} onChange={() => toggleTodo(t.id)} />
                      <span className={t.done ? 'line-through text-zinc-400' : ''}>{t.text}</span>
                      <span className="ml-auto text-[9px] text-zinc-400">{t.category}</span>
                      <button onClick={() => deleteTodo(t.id)} className="text-red-500">×</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-200 text-[9px] text-zinc-500">
              Drawer tools persist in localStorage. Use top bar dropdowns + search for focus modes.
            </div>
          </div>
        </div>

        {/* MAIN AREA: tool content (the translucent work surfaces). The floating LIVE CAPTIONS lens-controls
            (wisper strip + sliders + MIX + BG SOURCE for cam/stream) is now rendered at app-shell level with fixed positioning (see above, after gesture layer).
            This lets the caption-strip hover + click-to-toggle-expanded work even when uiVisible=false (pure feed mode, ^ hides other content).
            + in header independently toggles its visibility. */}
        <div className="main-area flex-1 flex flex-col overflow-hidden">
          {/* Tool content pane — switches based on top dropdown. Editors for writing papers etc live here when selected; drawer has the quick versions + pic/links */}
          <div className="tool-pane iridescent-glass">
            {toolMode === 'lens' && (
              <div>
                <div className="text-sm text-zinc-600 mb-2">Live Feed + wisper captions (header 32x32 or LIVE pill activates cam or external stream into bg + audio transcription). Use BG SOURCE in floating controls for ffmpeg/blank streams. All original site sections in "sections" view. Drag on feed (or sliders) to tweak pixel/blur/looks.</div>
                <div className="text-xs text-zinc-500">MOVE • LIGHT • CAPTURE • CODE • LIVE — original sections back on page. UI toggle (^) for pure feed bg.</div>
              </div>
            )}

            {toolMode === 'research' && (
              <div>
                <h3 className="text-lg tracking-tight mb-2 flex items-center gap-2"><FileText className="w-4 h-4" /> Research Paper Editor (full focus)</h3>
                <textarea
                  className="paper-textarea h-[420px] font-mono text-sm"
                  value={paperContent}
                  onChange={e => setPaperContent(e.target.value)}
                />
                <div className="text-[10px] text-white/50 mt-1">Auto-saved. Also editable in the left drawer. Export via browser print → Save as PDF.</div>
              </div>
            )}

            {toolMode === 'audio' && (
              <div>
                <h3 className="text-lg tracking-tight mb-2 flex items-center gap-2"><Mic className="w-4 h-4" /> Audio Notes — full recorder</h3>
                <button onClick={isRecording ? stopAudioRecording : startAudioRecording} className={`mb-3 px-4 py-2 rounded-xl text-sm ${isRecording ? 'bg-red-600' : 'bg-white text-black'}`}>
                  {isRecording ? 'STOP RECORDING' : 'START MIC RECORDING'}
                </button>
                <div className="space-y-2">
                  {recordings.length === 0 && <p className="text-white/50 text-sm">No recordings yet. Use the mic. Recordings are session-only (download to persist).</p>}
                  {recordings.map(r => (
                    <div key={r.id} className="recording-item">
                      <button onClick={() => new Audio(r.url).play()}>▶ Play</button>
                      <input value={r.label} onChange={e => renameRecording(r.id, e.target.value)} className="bg-transparent flex-1" />
                      <a href={r.url} download={`${r.label}.webm`} className="underline text-xs">DL</a>
                      <button onClick={() => deleteRecording(r.id)} className="text-red-400">×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {toolMode === 'sounding' && (
              <div>
                <h3 className="text-lg tracking-tight mb-2 flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Sounding Board — dev ideas, reminders, thoughts</h3>
                <div className="flex gap-2 mb-3">
                  <input className="note-input flex-1" placeholder="Drop a thought, quote, or reminder..." value={soundingInput} onChange={e=>setSoundingInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addToSoundingBoard()} />
                  <button onClick={addToSoundingBoard} className="px-4 rounded bg-white text-black text-sm">Add</button>
                </div>
                <button onClick={clearSounding} className="text-xs text-white/40 mb-2">clear all</button>
                <div className="space-y-2 text-sm">
                  {soundingEntries.map(e => <div key={e.id} className="border-l-2 border-white/20 pl-2 text-white/80">{e.text} <span className="text-white/30 text-xs">— {e.ts}</span></div>)}
                </div>
              </div>
            )}

            {toolMode === 'todos' && (
              <div>
                <h3 className="text-lg tracking-tight mb-2 flex items-center gap-2"><ListChecks className="w-4 h-4" /> Todos, Dev Tasks &amp; Weekly Reminders</h3>
                <div className="flex gap-2 mb-3">
                  <input className="note-input flex-1" value={newTodoText} onChange={e=>setNewTodoText(e.target.value)} placeholder="New task or reminder..." onKeyDown={e=>e.key==='Enter'&&addTodo()} />
                  <button onClick={addTodo} className="px-3 text-sm border border-white/30 rounded">Add</button>
                </div>
                <div>
                  {todos.map(t => (
                    <div key={t.id} className="todo-item">
                      <input type="checkbox" checked={t.done} onChange={()=>toggleTodo(t.id)} />
                      <span className={t.done ? 'line-through opacity-50' : ''}>{t.text}</span>
                      <span className="ml-auto text-[10px] opacity-40">{t.category}</span>
                      <button onClick={()=>deleteTodo(t.id)} className="text-red-400/70 text-xs">del</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {toolMode === 'sections' && (
              <div className="max-w-6xl space-y-10">
                <div className="text-sm text-zinc-700">All original sections from the start of the site (tadericson.com port + code world) — full content back on the page, alongside the Live Feed (cam/url/file incl. new test vids) + captions above and research tools in drawer/search. (Iridescent holographic overlays over the processed bg.)</div>

                {/* WORK — full original from early port (not stub) */}
                <div>
                  <div className="flex items-center gap-3 mb-3 border-b border-zinc-200 pb-1">
                    <span className="text-lg text-zinc-900">Work</span>
                    <span className="text-xs uppercase tracking-widest text-zinc-500">Film • TV • VEVO • Motion</span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-x-8 gap-y-4 mb-4 text-sm">
                    {site.summaryCredits.map((group, gi) => (
                      <div key={gi}>
                        <div className="uppercase tracking-[2px] text-xs text-zinc-500 mb-1">{group.title}</div>
                        <div className="text-zinc-800">{group.items.join(' • ')}</div>
                      </div>
                    ))}
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    {site.legacyProjects.map((p, i) => (
                      <div key={i} className="border border-zinc-200 p-4 rounded text-sm bg-white/40">
                        <div className="font-medium tracking-tight text-zinc-900">{p.title}</div>
                        <div className="text-zinc-600 text-xs">{p.role} {p.year ? `• ${p.year}` : ''} • {p.note}</div>
                        {p.description && <div className="text-zinc-700 mt-1 text-xs">{p.description}</div>}
                        <div className="mt-1 flex gap-2 text-xs">
                          {p.imdb && <a href={p.imdb} target="_blank" className="underline">IMDB</a>}
                          {p.vimeo && <a href={p.vimeo} target="_blank" className="underline">Vimeo</a>}
                          {p.link && <a href={p.link} target="_blank" className="underline">Details</a>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CODE — full from early code world addition */}
                <div>
                  <div className="flex items-center gap-3 mb-3 border-b border-zinc-200 pb-1">
                    <span className="text-lg text-zinc-900">Code &amp; Systems</span>
                    <span className="text-xs uppercase tracking-widest text-emerald-700">Fornever Collective • qbit dev</span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    {site.codeProjects.map((p, i) => (
                      <div key={i} className="border border-emerald-200 p-4 rounded bg-emerald-50/40 text-sm">
                        <div className="flex justify-between">
                          <div className="font-medium tracking-tight text-zinc-900">{p.title}</div>
                          <div className="text-[10px] text-emerald-700">{p.note}</div>
                        </div>
                        <div className="text-zinc-600 text-xs">{p.role} {p.year ? `• ${p.year}` : ''}</div>
                        <div className="text-zinc-700 mt-1 text-xs leading-snug">{p.description}</div>
                        <div className="mt-2 flex gap-2 text-xs">
                          {p.link && <a href={p.link} target="_blank" className="underline">LIVE</a>}
                          {p.github && <a href={p.github} target="_blank" className="underline">CODE</a>}
                        </div>
                        {p.tags && <div className="mt-1 flex gap-1 text-[10px] text-emerald-600">{p.tags.map(t => <span key={t}>#{t}</span>)}</div>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* TREE full */}
                <div>
                  <div className="flex items-center gap-3 mb-3 border-b border-white/10 pb-1">
                    <span className="text-lg">The Tree</span>
                  </div>
                  <p className="text-zinc-700 mb-3 text-sm">{site.homeIntro.ancestryNote} Code research tools extend this work.</p>
                  <div className="flex flex-wrap gap-2 text-sm mb-2">
                    {site.treeLinks.map((p, i) => (
                      <a key={i} href={`https://tadericson.com${p.path}`} target="_blank" className="px-3 py-1 border border-zinc-200 rounded hover:bg-zinc-100">{p.label}</a>
                    ))}
                  </div>
                  <div className="text-xs text-zinc-500">Code parallels: ancestory tools, fornevercollective org research.</div>
                </div>

                {/* COLLECTIVE full */}
                <div>
                  <div className="flex items-center gap-3 mb-3 border-b border-zinc-200 pb-1">
                    <span className="text-lg text-zinc-900">Collective &amp; Brands</span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                    {site.infoCredits.map((group, gi) => (
                      <div key={gi}>
                        <div className="uppercase tracking-[2px] text-xs text-zinc-500 mb-1">{group.title}</div>
                        <div className="text-zinc-800">{group.items.join(' • ')}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-xs text-zinc-500">VEVO/Brands also in early data — see full history in siteContent.</div>
                </div>

                {/* CONTACT full */}
                <div>
                  <div className="flex items-center gap-3 mb-3 border-b border-zinc-200 pb-1">
                    <span className="text-lg text-zinc-900">Contact</span>
                  </div>
                  <p className="text-zinc-700 mb-2 text-sm">DM for COLABs • Oregon, USA — Film, camera tech, AI tooling, systems, ancestry, live creative computation.</p>
                  <div className="flex flex-wrap gap-2 text-sm">
                    {site.socialLinks.map((s, i) => (
                      <a key={i} href={s.url} target="_blank" className="px-4 py-1.5 border border-zinc-200 rounded hover:bg-zinc-100">{s.label}</a>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="text-[10px] text-center py-1 text-white/30 border-t border-white/10 flex-shrink-0">
        © FORNEVER COLLECTIVE • TAD ERICSON — CINEMATIC PWA + RESEARCH TOOLS (drawer + search bar)
      </footer>
      </>
      )}
    </div>
  )
}

export default App
