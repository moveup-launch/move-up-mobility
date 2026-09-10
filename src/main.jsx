import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { isNativeApp } from './lib/platform'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Le service worker PWA (mise en cache offline, installabilite) n'a de sens
// que sur le vrai site web (moveupapp.com) : dans l'app native iOS/Android,
// les assets sont deja empaquetes localement par Capacitor, donc il
// n'apporte rien, tout en etant un point connu d'instabilite dans les
// WebView iOS (voir rejet Apple Review 2.1(a), erreur de connexion au
// login, iOS/iPadOS 27.0 beta). VitePWA a `injectRegister: false` (voir
// vite.config.js) : on l'enregistre nous-memes ici, uniquement hors app
// native.
if (!isNativeApp() && 'serviceWorker' in navigator) {
  import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({ immediate: true })
  }).catch((err) => console.error('registerSW import error:', err))
}
