'use client'

import { useEffect, useRef } from 'react'

interface SectionProps {
  id: string
  label: string
  num: string
  children: React.ReactNode
  className?: string
}

export default function Section({ id, label, num, children, className = '' }: SectionProps) {
  const ref    = useRef<HTMLElement>(null)
  const header = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Dynamic import to avoid SSR issues
    Promise.all([
      import('gsap').then(m => m.gsap),
      import('gsap/ScrollTrigger').then(m => m.ScrollTrigger),
    ]).then(([gsap, ScrollTrigger]) => {
      gsap.registerPlugin(ScrollTrigger)
      if (!ref.current || !header.current) return

      gsap.fromTo(header.current,
        { x: -40, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: ref.current, start: 'top 80%', once: true } }
      )
      gsap.fromTo(
        ref.current.querySelectorAll('.gsap-reveal'),
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0.08,
          scrollTrigger: { trigger: ref.current, start: 'top 75%', once: true } }
      )
    }).catch(console.warn)
  }, [])

  return (
    <section id={id} ref={ref} className={`relative z-10 py-28 px-6 max-w-5xl mx-auto ${className}`}>
      <div ref={header} className="flex items-center gap-4 mb-14 opacity-0">
        <span className="text-terminal-grey font-mono text-xs">{num}</span>
        <span className="text-terminal-grey">/</span>
        <span className="glow-green font-mono text-xs tracking-widest uppercase">{label}</span>
        <div className="flex-1 h-px bg-terminal-border" />
        <span className="text-terminal-grey font-mono text-xs">──────</span>
      </div>
      {children}
    </section>
  )
}
