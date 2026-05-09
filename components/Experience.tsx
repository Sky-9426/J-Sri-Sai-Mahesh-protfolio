'use client'

import { useEffect, useState } from 'react'
import Section from './Section'
import { loadData, defaultData, type PortfolioData } from '@/lib/data'

const typeColor: Record<string, string> = {
  Research: 'glow-green',
  Industry: 'glow-amber',
}

export default function Experience() {
  const [data, setData] = useState<PortfolioData>(defaultData)
  useEffect(() => { setData(loadData()) }, [])

  return (
    <Section id="experience" label="experience" num="02">
      <div className="space-y-6">
        {data.experience.map((exp, i) => (
          <div key={i} className="gsap-reveal terminal-window hover:border-terminal-green transition-all duration-300 group">
            <div className="terminal-titlebar">
              <div className="dot dot-red"/><div className="dot dot-yellow"/><div className="dot dot-green"/>
              <span className="ml-3 text-xs text-terminal-grey font-mono">
                cat experience/{exp.company.toLowerCase().replace(/\s+/g, '-')}.log
              </span>
            </div>
            <div className="p-5">
              <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={'text-base font-mono font-bold ' + (typeColor[exp.type] ?? 'glow-green')}>
                      {exp.company}
                    </span>
                    <span className="text-xs font-mono text-terminal-grey border border-terminal-border px-2 py-0.5 rounded-full">
                      {exp.type}
                    </span>
                  </div>
                  <div className="text-sm font-mono text-terminal-white mt-1">{exp.role}</div>
                </div>
                <span className="text-xs font-mono text-terminal-grey shrink-0">[{exp.period}]</span>
              </div>
              <div className="font-mono text-xs text-terminal-grey2 mb-3 pl-2 border-l-2 border-terminal-border">
                PROJECT: {exp.project}
              </div>
              <div className="space-y-2">
                {exp.bullets.map((b, j) => (
                  <div key={j} className="flex gap-3 font-mono text-xs text-terminal-grey2 leading-relaxed group-hover:text-terminal-white transition-colors duration-500" style={{ transitionDelay: j * 50 + 'ms' }}>
                    <span className="glow-green shrink-0 mt-0.5">-&gt;</span>
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
