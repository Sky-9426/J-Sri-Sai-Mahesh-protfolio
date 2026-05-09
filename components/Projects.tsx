'use client'

import { useState, useEffect } from 'react'
import Section from './Section'
import { loadData, defaultData, type PortfolioData } from '@/lib/data'

const statusColor: Record<string, string> = {
  'PUBLISHED':   'glow-green',
  'DEPLOYED':    'glow-amber',
  'RESEARCH':    'glow-cyan',
  'IN PROGRESS': 'text-terminal-grey2',
}

export default function Projects() {
  const [data, setData]     = useState<PortfolioData>(defaultData)
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => { setData(loadData()) }, [])

  return (
    <Section id="projects" label="projects" num="03">
      <div className="space-y-3">
        {data.projects.map((p) => (
          <div key={p.id} className="gsap-reveal group">
            <button
              onClick={() => setActive(active === p.id ? null : p.id)}
              className="w-full terminal-window text-left hover:border-terminal-green hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 group-hover:bg-opacity-100"
            >
              <div className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <span className="text-terminal-grey font-mono text-xs shrink-0 group-hover:glow-green transition-all">{p.id}</span>
                  <span className={
                    'font-mono text-sm font-medium truncate transition-all ' +
                    (p.color === 'green' ? 'text-terminal-green group-hover:glow-green' : p.color === 'amber' ? 'text-terminal-amber group-hover:glow-amber' : 'text-terminal-cyan group-hover:glow-cyan')
                  }>
                    {p.name}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={'text-xs font-mono hidden sm:block transition-all ' + (statusColor[p.status] ?? 'text-terminal-grey2')}>
                    [{p.status}]
                  </span>
                  <span className="text-terminal-grey font-mono text-xs transition-transform duration-300 group-hover:text-emerald-400" style={{ display: 'inline-block', transform: active === p.id ? 'rotate(90deg)' : 'none' }}>
                    ▶
                  </span>
                </div>
              </div>
            </button>

            {active === p.id && (
              <div className="terminal-window border-t-0 rounded-t-none p-5 space-y-4 animate-fadeIn bg-opacity-95">
                <p className="font-mono text-sm text-terminal-grey2 leading-relaxed">{p.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {p.stack.map(s => (
                    <span 
                      key={s} 
                      className="text-xs font-mono px-3 py-1.5 border border-terminal-border text-terminal-grey2 hover:border-terminal-green hover:text-terminal-green hover:shadow-md hover:shadow-emerald-500/20 transition-all rounded cursor-pointer transform hover:scale-105"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Section>
  )
}
