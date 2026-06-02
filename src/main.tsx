import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import './index.css'
import App from './App.tsx'

// PWA service worker auto-update + reload prompt (works with vite-plugin-pwa)
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
                // New content available
                const doUpdate = window.confirm('New version of the site is available. Reload now?')
                if (doUpdate) newWorker.postMessage({ type: 'SKIP_WAITING' })
              }
            })
          }
        })
      }
    } catch (e) {}
  }
}
updateSW()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
      <Toaster position="top-center" richColors closeButton />
    </BrowserRouter>
  </StrictMode>,
)
