'use client'

import { useEffect, useState } from 'react'
import Section from './Section'
import { loadData, defaultData } from '@/lib/data'

export default function Contact() {
  const [d, setD] = useState(defaultData)
  useEffect(() => { setD(loadData()) }, [])

  const contacts = [
    { label: 'email',    value: d.email,    href: 'mailto:' + d.email,          icon: '✉' },
    { label: 'phone',    value: d.phone,    href: 'tel:' + d.phone.replace(/\s/g,''), icon: '☎' },
    { label: 'linkedin', value: d.linkedin, href: 'https://' + d.linkedin,       icon: '⌁' },
    ...(d.github ? [{ label: 'github', value: d.github, href: 'https://' + d.github, icon: '⌥' }] : []),
  ]

  return (
    <Section id="contact" label="contact" num="06">
      <div className="terminal-window gsap-reveal">
        <div className="terminal-titlebar">
          <div className="dot dot-red"/><div className="dot dot-yellow"/><div className="dot dot-green"/>
          <span className="ml-3 text-xs text-terminal-grey font-mono">send --message</span>
        </div>
        <div className="p-6 sm:p-8 space-y-6">
          <div className="font-mono text-xs text-terminal-grey2 space-y-1">
            <div><span className="glow-green">$</span> whoami --contact</div>
            <div className="text-terminal-grey">Open to: research collaborations · embedded systems roles · engineering challenges</div>
          </div>
          <div className="space-y-3 pt-2">
            {contacts.map((c) => (
              <a
                key={c.label}
                href={c.href}
                target={c.label !== 'email' && c.label !== 'phone' ? '_blank' : undefined}
                rel="noreferrer"
                className="flex items-center gap-4 p-4 border border-terminal-border rounded hover:border-terminal-green group transition-all duration-300"
              >
                <span className="text-terminal-grey font-mono text-base group-hover:glow-green transition-all">{c.icon}</span>
                <div>
                  <div className="text-xs font-mono text-terminal-grey tracking-widest uppercase">{c.label}</div>
                  <div className="text-sm font-mono text-terminal-white group-hover:text-terminal-green transition-colors">{c.value}</div>
                </div>
                <span className="ml-auto text-terminal-grey group-hover:glow-green font-mono">-&gt;</span>
              </a>
            ))}
          </div>
          <div className="pt-4 border-t border-terminal-border font-mono text-xs text-terminal-grey">
            <span className="glow-green">$</span> <span className="text-terminal-grey2 cursor-blink">Ready for new connections</span>
          </div>
        </div>
      </div>
    </Section>
  )
}
