'use client'

import { useEffect, useState } from 'react'
import Section from './Section'
import { loadData, defaultData, type PortfolioData } from '@/lib/data'

const colorCls: Record<string, string> = {
  green: 'border-green-900/40 hover:border-green-500/70 hover:text-terminal-green hover:shadow-md hover:shadow-green-500/30',
  amber: 'border-yellow-900/40 hover:border-yellow-500/70 hover:text-terminal-amber hover:shadow-md hover:shadow-yellow-500/30',
  cyan:  'border-cyan-900/40 hover:border-cyan-500/70 hover:text-terminal-cyan hover:shadow-md hover:shadow-cyan-500/30',
}
const iconCls: Record<string, string> = {
  green: 'glow-green',
  amber: 'glow-amber',
  cyan:  'glow-cyan',
}

export default function Skills() {
  const [data, setData] = useState<PortfolioData>(defaultData)
  useEffect(() => { setData(loadData()) }, [])

  return (
    <Section id="skills" label="skills" num="04">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.skills.map((g) => (
          <div 
            key={g.label} 
            className="gsap-reveal terminal-window p-5 hover:border-terminal-green hover:shadow-lg transition-all duration-300 group hover:bg-opacity-100 cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className={'font-mono text-base transition-transform group-hover:scale-110 ' + (iconCls[g.color] ?? 'glow-green')}>{g.icon}</span>
              <span className="text-xs font-mono text-terminal-grey tracking-widest uppercase group-hover:text-emerald-300 transition-colors">{g.label}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {g.items.map(item => (
                <span 
                  key={item} 
                  className={'text-xs font-mono px-2.5 py-1 border rounded transition-all duration-200 text-terminal-grey2 hover:scale-105 transform ' + (colorCls[g.color] ?? colorCls.green)}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
