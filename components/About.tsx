'use client'
import { useEffect, useState } from 'react'
import Section from './Section'
import { loadData, defaultData, type PortfolioData } from '@/lib/data'

export default function About() {
  const [d, setD] = useState<PortfolioData>(defaultData)
  useEffect(() => { setD(loadData()) }, [])

  return (
    <Section id="about" label="about" num="01">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="gsap-reveal terminal-window">
          <div className="terminal-titlebar">
            <div className="dot dot-red"/><div className="dot dot-yellow"/><div className="dot dot-green"/>
            <span className="ml-3 text-xs text-terminal-grey font-mono">cat bio.txt</span>
          </div>
          <div className="p-6 space-y-4">
            <div className="font-mono text-xs text-terminal-grey2"><span className="glow-green">$</span> cat bio.txt</div>
            <p className="font-mono text-sm text-terminal-white leading-relaxed">{d.bio}</p>
            <div className="pt-2 border-t border-terminal-border text-xs text-terminal-grey font-mono">
              <span className="glow-green">$</span> <span className="text-terminal-grey2">EOF</span>
            </div>
          </div>
        </div>

        <div className="gsap-reveal terminal-window">
          <div className="terminal-titlebar">
            <div className="dot dot-red"/><div className="dot dot-yellow"/><div className="dot dot-green"/>
            <span className="ml-3 text-xs text-terminal-grey font-mono">ls education/</span>
          </div>
          <div className="p-6">
            <div className="font-mono text-xs text-terminal-grey2 mb-4"><span className="glow-green">$</span> ls -la education/</div>
            <div className="space-y-3">
              {d.education.map((e, i) => (
                <div key={i} className="border border-terminal-border rounded p-3 hover:border-terminal-green transition-colors duration-300 group">
                  <div className="flex justify-between items-start gap-2 flex-wrap">
                    <span className="text-xs font-mono text-terminal-green">{e.degree}</span>
                    <span className="text-xs font-mono glow-amber shrink-0">{e.score}</span>
                  </div>
                  <div className="mt-1 text-xs font-mono text-terminal-grey2">{e.school}</div>
                  <div className="mt-1 text-xs font-mono text-terminal-grey">[{e.year}]</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
