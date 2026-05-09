'use client'

import { useEffect, useRef } from 'react'

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const initRef = useRef(false)

  useEffect(() => {
    if (initRef.current) return
    initRef.current = true

    // Native smooth scroll — no heavy GSAP/Lenis overhead
    // This avoids the "laggy mousewheel" feel from JS-hijacked scroll
    document.documentElement.style.scrollBehavior = 'smooth'

    // Optionally wire up GSAP ScrollTrigger without Lenis to keep animations
    Promise.all([
      import('gsap').then(m => m.gsap),
      import('gsap/ScrollTrigger').then(m => m.ScrollTrigger),
    ]).then(([gsap, ScrollTrigger]) => {
      gsap.registerPlugin(ScrollTrigger)
      ScrollTrigger.refresh()
    }).catch(console.warn)
  }, [])

  return <>{children}</>
}
