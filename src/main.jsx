import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/global.css'

const root = document.getElementById('root')

// Standalone animations lab at <base>/animations — a side-by-side Lottie vs CSS
// comparison tool. Not part of the prerendered site, so always client-render
// into a clean root. Lazy-imported so it stays out of the main bundle.
const isAnimationsLab = window.location.pathname.replace(/\/+$/, '').endsWith('/animations')

if (isAnimationsLab) {
  import('./pages/AnimationsLab').then(({ default: AnimationsLab }) => {
    root.innerHTML = ''
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <AnimationsLab />
      </React.StrictMode>
    )
  })
} else if (root.children.length > 0) {
  ReactDOM.hydrateRoot(root,
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
} else {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}
