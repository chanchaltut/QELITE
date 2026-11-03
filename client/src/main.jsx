import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.jsx'
import { isPreview } from './lib/content.js'
import './index.css'

const app = (
    <React.StrictMode>
        <HelmetProvider>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </HelmetProvider>
    </React.StrictMode>
)

const root = document.getElementById('root')

// Prerendered pages (scripts/prerender.mjs) arrive with their HTML already in place:
// attach to it instead of redrawing. Start fresh if that HTML belongs to another URL
// (a host fallback) or in preview mode, which shows draft content.
const path = window.location.pathname.replace(/\/+$/, '') || '/'
if (root.hasChildNodes() && root.dataset.path === path && !isPreview) {
    ReactDOM.hydrateRoot(root, app)
} else {
    root.textContent = ''
    ReactDOM.createRoot(root).render(app)
}
