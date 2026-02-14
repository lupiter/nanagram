import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.tsx'

export const THEME_STORAGE_KEY = 'nanagram-theme'
export const THEMES = ['light', 'dark', 'high-contrast-dark', 'high-contrast-light'] as const
export type ThemeId = (typeof THEMES)[number]

const THEME_COLOR: Record<ThemeId, string> = {
  light: '#f0dac5',
  dark: '#1e1d2a',
  'high-contrast-dark': '#000000',
  'high-contrast-light': '#ffffff',
}

function applyTheme(): void {
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  const theme: ThemeId = stored && THEMES.includes(stored as ThemeId) ? (stored as ThemeId) : 'light'
  document.documentElement.setAttribute('data-theme', theme)
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', THEME_COLOR[theme])
}

applyTheme()

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Failed to find root element')
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
