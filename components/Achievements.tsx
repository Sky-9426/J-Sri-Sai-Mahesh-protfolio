'use client'

import { useEffect, useState } from 'react'
import Section from './Section'
import { loadData, defaultData, type PortfolioData } from '@/lib/data'

const badgeCls: Record<string, string> = {
  green: 'border-green-800/50 text-terminal-green',
  amber: 'border-yellow-800/50 text-terminal-amber',
  cyan:  'border-cyan-800/50 text-terminal-cyan',
}

export default function Achievements() {
  const [data, setData] = useState<PortfolioData>(defaultData)
  useEffect(() => { setData(loadData()) }, [])

  return (
    <Section id="achievements" label="recognition" num="05">
      <div className="space-y-2">
        {data.achievements.map((a, i) => (
          <div key={i} className="gsap-reveal terminal-window flex items-center justify-between gap-4 px-5 py-4 hover:border-terminal-green transition-all duration-300 group">
            <div className="flex items-center gap-4 min-w-0">
              <span className="text-lg shrink-0">{a.icon}</span>
              <div className="min-w-0">
                <div className="font-mono text-sm text-terminal-white truncate group-hover:text-terminal-green transition-colors duration-300">
                  {a.title}
                </div>
                <div className="font-mono text-xs text-terminal-grey mt-0.5 truncate">{a.desc}</div>
              </div>
            </div>
            <div className={'shrink-0 text-xs font-mono px-2.5 py-1 border rounded-full ' + (badgeCls[a.color] ?? badgeCls.green)}>
              {a.badge}
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
