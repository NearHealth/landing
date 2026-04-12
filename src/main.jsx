import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './App.css'

const root = document.getElementById('root')

if (root.children.length > 0) {
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
