export const THEME_BASE_KEY = 'nanagram-theme-base'
export const THEME_HIGH_CONTRAST_KEY = 'nanagram-theme-high-contrast'

export type ThemeBase = 'light' | 'dark'

export const THEME_BASES: ThemeBase[] = ['light', 'dark']

export const PLAY_MODE_STORAGE_KEY = 'nanagram-game-mode'

export type ThemeId =
  | 'light'
  | 'dark'
  | 'high-contrast-dark'
  | 'high-contrast-light'

const THEME_COLOR: Record<ThemeId, string> = {
  light: '#f0dac5',
  dark: '#1e1d2a',
  'high-contrast-dark': '#000000',
  'high-contrast-light': '#ffffff',
}

function themeIdFrom(base: ThemeBase, highContrast: boolean): ThemeId {
  if (highContrast) return base === 'dark' ? 'high-contrast-dark' : 'high-contrast-light'
  return base
}

export function getStoredThemeBase(): ThemeBase {
  if (typeof localStorage === 'undefined') return 'light'
  const stored = localStorage.getItem(THEME_BASE_KEY)
  return stored === 'dark' ? 'dark' : 'light'
}

export function getStoredThemeHighContrast(): boolean {
  if (typeof localStorage === 'undefined') return false
  return localStorage.getItem(THEME_HIGH_CONTRAST_KEY) === 'true'
}

/** Migrate from legacy single-key theme if present */
function migrateThemeFromLegacy(): void {
  const legacy = localStorage.getItem('nanagram-theme')
  if (!legacy) return
  if (legacy === 'dark' || legacy === 'light') {
    localStorage.setItem(THEME_BASE_KEY, legacy)
    localStorage.setItem(THEME_HIGH_CONTRAST_KEY, 'false')
  } else if (legacy === 'high-contrast-dark') {
    localStorage.setItem(THEME_BASE_KEY, 'dark')
    localStorage.setItem(THEME_HIGH_CONTRAST_KEY, 'true')
  } else if (legacy === 'high-contrast-light') {
    localStorage.setItem(THEME_BASE_KEY, 'light')
    localStorage.setItem(THEME_HIGH_CONTRAST_KEY, 'true')
  }
  localStorage.removeItem('nanagram-theme')
}

export function applyTheme(): void {
  migrateThemeFromLegacy()
  const base = getStoredThemeBase()
  const highContrast = getStoredThemeHighContrast()
  const theme = themeIdFrom(base, highContrast)
  document.documentElement.setAttribute('data-theme', theme)
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', THEME_COLOR[theme])
}
