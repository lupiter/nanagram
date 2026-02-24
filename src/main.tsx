import React from 'react'
import ReactDOM from 'react-dom/client'
import { enableMapSet } from 'immer'
import './index.css'
import App from './App.tsx'
import { applyTheme, applyCellSize, subscribeToSystemTheme } from './themeStorage'

enableMapSet()
applyTheme()
applyCellSize()
subscribeToSystemTheme()

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Failed to find root element')
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
