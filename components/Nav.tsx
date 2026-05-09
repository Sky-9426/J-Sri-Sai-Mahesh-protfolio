'use client'

import { useState, useEffect } from 'react'

const LINKS = [
  { label: 'about',      href: '#about'      },
  { label: 'experience', href: '#experience' },
  { label: 'projects',   href: '#projects'   },
  { label: 'skills',     href: '#skills'     },
  { label: 'photo',      href: '#photo'      },
  { label: 'contact',    href: '#contact'    },
]

interface NavProps { onRmRf?: () => void }

export default function Nav({ onRmRf }: NavProps) {
  const [scrolled, setScrolled] = useState(false)
  const [time,     setTime]     = useState('')
  const [mounted,  setMounted]  = useState(false)

  useEffect(() => {
    setMounted(true)
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    const tick = () => setTime(new Date().toLocaleTimeString('en-US', { hour12: false }))
    tick()
    const id = setInterval(tick, 1000)
    return () => { window.removeEventListener('scroll', onScroll); clearInterval(id) }
  }, [])

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-[500] transition-all duration-300"
      style={scrolled ? { background: 'rgba(44,0,30,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.08)' } : {}}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div className="font-mono text-xs flex items-center shrink-0">
          <span className="text-green-400 font-bold">mahesh@ubuntu</span>
          <span className="text-white">:</span>
          <span className="text-blue-400 font-bold">~</span>
          <span className="text-white">$&nbsp;</span>
          <span className="text-white animate-blink">_</span>
        </div>

        <ul className="hidden md:flex items-center gap-5">
          {LINKS.map((l, i) => (
            <li key={l.href}>
              <a href={l.href} className="text-xs text-gray-400 hover:text-green-400 transition-colors font-mono group">
                <span className="text-gray-600 group-hover:text-green-700">[</span>
                {String(i + 1).padStart(2,'0')}
                <span className="text-gray-600 group-hover:text-green-700">]</span>
                {' '}{l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          {onRmRf && (
            <button
              onClick={onRmRf}
              className="hidden lg:block text-xs font-mono text-red-900 hover:text-red-400 transition-all border border-red-900/20 hover:border-red-700/40 px-2 py-1 rounded"
            >
              rm -rf /
            </button>
          )}
          {mounted && time && (
            <span className="hidden lg:block text-xs text-gray-600 font-mono">[{time}]</span>
          )}
        </div>
      </div>
    </nav>
  )
}
