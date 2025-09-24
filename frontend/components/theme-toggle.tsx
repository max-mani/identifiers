"use client"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = useMemo(() => resolvedTheme === "dark", [resolvedTheme])

  const handleToggle = () => {
    setTheme(isDark ? "light" : "dark")
    // Safety: ensure no lingering scroll lock from any UI libs
    try {
      const htmlEl = document.documentElement
      const bodyEl = document.body
      if (htmlEl) {
        htmlEl.style.overflow = ''
        htmlEl.classList.remove('overflow-hidden')
      }
      if (bodyEl) {
        bodyEl.style.overflow = ''
        bodyEl.classList.remove('overflow-hidden')
      }
    } catch {}
  }

  return (
    <Button
      type="button"
      onClick={handleToggle}
      variant="outline"
      size="icon"
      className="h-9 w-9 bg-transparent"
      aria-label="Toggle theme"
    >
      {mounted ? (isDark ? (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      )) : (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
