import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

function initialTheme(): Theme {
  const saved = window.localStorage.getItem('wepoop-theme')
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(initialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('wepoop-theme', theme)
  }, [theme])

  const nextTheme = theme === 'light' ? 'dark' : 'light'
  return <button className="theme-toggle" type="button" onClick={() => setTheme(nextTheme)} aria-label={`Switch to ${nextTheme} mode`}>
    <span aria-hidden="true">{theme === 'light' ? '☾' : '☀'}</span>
  </button>
}
