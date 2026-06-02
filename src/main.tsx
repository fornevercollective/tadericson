import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// PWA service worker auto-update (best effort)
const updateSW = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.getRegistration()
      if (reg) {
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                const doUpdate = window.confirm('New version of the site is available. Reload now?')
                if (doUpdate) newWorker.postMessage({ type: 'SKIP_WAITING' })
              }
            })
          }
        })
      }
    } catch {
      // ignore
    }
  }
}
updateSW()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
