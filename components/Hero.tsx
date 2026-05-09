'use client'

import { useEffect, useState } from 'react'

type BootLine = { text: string; cls: string }

const BOOT: BootLine[] = [
  { text: 'BIOS v2.1.4 -- POST complete',                             cls: 'text-terminal-grey'  },
  { text: 'Loading mahesh.portfolio kernel...     [  OK  ]',          cls: 'glow-green'           },
  { text: 'Mounting encrypted filesystem...       [  OK  ]',          cls: 'glow-green'           },
  { text: 'Starting secure shell daemon...        [  OK  ]',          cls: 'glow-green'           },
  { text: 'Authenticating user: mahesh...         [  OK  ]',          cls: 'glow-amber'           },
  { text: '',                                                          cls: ''                     },
  { text: '=================================================',        cls: 'text-terminal-grey'  },
  { text: '  JIDUGU SRI SAI MAHESH -- SYSTEM ONLINE        ',         cls: 'glow-green'           },
  { text: '  ECE | Embedded Systems | Deep Learning        ',         cls: 'text-terminal-grey2' },
  { text: '  GPA 8.30 | BVRIT, Narsapur                   ',         cls: 'text-terminal-grey2' },
  { text: '=================================================',        cls: 'text-terminal-grey'  },
  { text: '',                                                          cls: ''                     },
  { text: "Type 'help' for commands or scroll to explore.",           cls: 'glow-cyan'            },
]

export default function Hero() {
  const [shown, setShown]   = useState(0)
  const [prompt, setPrompt] = useState(false)
  const [stats,  setStats]  = useState(false)

  useEffect(() => {
    if (shown < BOOT.length) {
      const id = setTimeout(() => setShown(s => s + 1), 110)
      return () => clearTimeout(id)
    } else {
      const t1 = setTimeout(() => setPrompt(true), 200)
      const t2 = setTimeout(() => setStats(true),  400)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }
  }, [shown])

  return (
    <section id="hero" className="relative z-10 min-h-screen flex flex-col justify-center px-4 sm:px-6 pt-24 pb-16 max-w-5xl mx-auto">
      <div className="terminal-window w-full">
        <div className="terminal-titlebar">
          <div className="dot dot-red"/>
          <div className="dot dot-yellow"/>
          <div className="dot dot-green"/>
          <span className="ml-3 text-xs text-terminal-grey font-mono">mahesh@portfolio -- viewer -- read only</span>
          <a href="/" className="ml-auto text-xs text-terminal-grey hover:text-terminal-green transition-colors font-mono">[terminal]</a>
        </div>
        <div className="p-5 min-h-[360px] font-mono text-xs sm:text-sm space-y-0.5">
          {BOOT.slice(0, shown).map((line, i) => (
            <div key={i} className={'leading-relaxed whitespace-pre ' + (line.cls || 'text-transparent select-none')}>
              {line.text || '\u00A0'}
            </div>
          ))}
          {prompt && (
            <div className="flex items-center gap-2 mt-2">
              <span className="glow-green">viewer@mahesh-portfolio:~$</span>
              <span className="text-terminal-white">scroll to explore</span>
              <span className="glow-green animate-blink">|</span>
            </div>
          )}
        </div>
      </div>

      {stats && (
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'internships', value: '02', c: 'glow-green' },
            { label: 'projects',    value: '04', c: 'glow-amber' },
            { label: 'paper',       value: '01', c: 'glow-cyan'  },
            { label: 'hackathons',  value: '04', c: 'glow-green' },
          ].map(s => (
            <div key={s.label} className="terminal-window p-4 text-center">
              <div className={'text-3xl font-bold font-mono ' + s.c}>{s.value}</div>
              <div className="text-xs text-terminal-grey mt-1 font-mono">{s.label}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
