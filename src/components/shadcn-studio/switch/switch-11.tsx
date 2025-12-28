'use client'

import { useId, useEffect, useState } from 'react'
import { useTheme } from 'next-themes'

import { IconSun, IconMoon } from '@/lib/icons'
import { Switch } from '@/components/ui/switch'

const ThemeSwitch = () => {
  const id = useId()
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className='group inline-flex items-center gap-2'>
        <span className='text-muted-foreground/70 text-sm font-medium'>
          <IconSun className='size-4' aria-hidden='true' />
        </span>
        <Switch disabled aria-label='Toggle between dark and light mode' />
        <span className='text-muted-foreground/70 text-sm font-medium'>
          <IconMoon className='size-4' aria-hidden='true' />
        </span>
      </div>
    )
  }

  const isDark = resolvedTheme === 'dark'

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  const handleLightClick = () => setTheme('light')
  const handleDarkClick = () => setTheme('dark')

  return (
    <div className='group inline-flex items-center gap-2' data-state={isDark ? 'checked' : 'unchecked'}>
      <button
        type='button'
        id={`${id}-light`}
        className='group-data-[state=checked]:text-muted-foreground/70 cursor-pointer text-left text-sm font-medium transition-colors hover:text-foreground'
        aria-controls={id}
        onClick={handleLightClick}
        aria-label='Switch to light mode'
      >
        <IconSun className='size-4' aria-hidden='true' />
      </button>
      <Switch
        id={id}
        checked={isDark}
        onCheckedChange={toggleTheme}
        aria-labelledby={`${id}-dark ${id}-light`}
        aria-label='Toggle between dark and light mode'
      />
      <button
        type='button'
        id={`${id}-dark`}
        className='group-data-[state=unchecked]:text-muted-foreground/70 cursor-pointer text-right text-sm font-medium transition-colors hover:text-foreground'
        aria-controls={id}
        onClick={handleDarkClick}
        aria-label='Switch to dark mode'
      >
        <IconMoon className='size-4' aria-hidden='true' />
      </button>
    </div>
  )
}

export { ThemeSwitch }
export default ThemeSwitch
