'use client'

import { useEffect, useState, useRef } from 'react'

const RM_LINES = [
  { t: 'u-err',    text: 'mahesh@ubuntu:~$ sudo rm -rf /' },
  { t: 'u-yellow', text: '[sudo] password for mahesh: ••••••••' },
  { t: 'u-err',    text: 'rm: it is dangerous to operate recursively on /' },
  { t: 'u-err',    text: 'rm: use --no-preserve-root to override this failsafe' },
  { t: 'white',    text: 'mahesh@ubuntu:~$ sudo rm -rf / --no-preserve-root' },
  { t: 'u-yellow', text: '[sudo] password for mahesh: ••••••••' },
  { t: 'u-err',    text: 'rm: removing /bin/bash' },
  { t: 'u-err',    text: 'rm: removing /usr/bin/python3' },
  { t: 'u-err',    text: 'rm: removing /home/mahesh/projects/fire-surveillance-bot' },
  { t: 'u-err',    text: 'rm: removing /home/mahesh/projects/ai-recycling-rvm' },
  { t: 'u-err',    text: 'rm: removing /home/mahesh/research/coastal-deeponet' },
  { t: 'u-err',    text: 'rm: removing /etc/passwd' },
  { t: 'u-err',    text: 'rm: removing /etc/hosts' },
  { t: 'u-err',    text: 'rm: removing /lib/x86_64-linux-gnu/libc.so.6' },
  { t: 'u-err',    text: 'rm: removing /proc/1' },
  { t: 'u-err',    text: 'rm: cannot remove /proc/1: Permission denied' },
  { t: 'u-err',    text: 'Segmentation fault (core dumped)' },
  { t: 'white',    text: '' },
  { t: 'u-err',    text: '██████████████████████████████████████████████' },
  { t: 'u-err',    text: '  SYSTEM FAILURE — ALL FILES DELETED           ' },
  { t: 'u-err',    text: '  Kernel panic - not syncing: VFS: Unable to   ' },
  { t: 'u-err',    text: '  mount root fs on unknown-block               ' },
  { t: 'u-err',    text: '██████████████████████████████████████████████' },
  { t: 'white',    text: '' },
  { t: 'u-ok',     text: '...just kidding 😄 your system is fine!' },
  { t: 'u-ok',     text: 'mahesh@ubuntu:~$ echo "Portfolio still running 🚀"' },
  { t: 'white',    text: 'Portfolio still running 🚀' },
  { t: 'u-cyan',   text: 'mahesh@ubuntu:~$ _' },
]

interface Props { onDone: () => void }

export default function RmRfOverlay({ onDone }: Props) {
  const [shown, setShown]   = useState(0)
  const [shake, setShake]   = useState(false)
  const bottomRef           = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (shown < RM_LINES.length) {
      // faster for the rm lines, pause at the failure banner
      const delay = shown === 17 ? 600 : shown >= 18 && shown <= 23 ? 250 : 130
      const id = setTimeout(() => setShown(s => s + 1), delay)
      return () => clearTimeout(id)
    } else {
      // Auto-close after showing complete message
      const id = setTimeout(onDone, 3000)
      return () => clearTimeout(id)
    }
  }, [shown, onDone])

  // Shake screen at the SYSTEM FAILURE line
  useEffect(() => {
    if (shown === 20) {
      setShake(true)
      const id = setTimeout(() => setShake(false), 600)
      return () => clearTimeout(id)
    }
  }, [shown])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [shown])

  const colorCls = (t: string) => {
    if (t === 'u-err')    return 'text-red-500'
    if (t === 'u-ok')     return 'text-green-400'
    if (t === 'u-cyan')   return 'text-cyan-400'
    if (t === 'u-yellow') return 'text-yellow-300'
    return 'text-white'
  }

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black flex flex-col justify-end p-6 overflow-hidden"
      style={{
        animation: shake ? 'shake 0.1s ease-in-out 4' : undefined,
      }}
      onClick={onDone}
    >
      <style>{`
        @keyframes shake {
          0%,100%{transform:translate(0,0)}
          25%{transform:translate(-6px,3px)}
          75%{transform:translate(6px,-3px)}
        }
      `}</style>

      {/* Scanlines */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.15) 2px,rgba(0,0,0,0.15) 4px)'
      }} />

      <div className="relative font-mono text-xs sm:text-sm space-y-0.5 max-h-full overflow-hidden">
        {RM_LINES.slice(0, shown).map((l, i) => (
          <div key={i} className={'leading-relaxed whitespace-pre ' + colorCls(l.t)}>
            {l.text || '\u00A0'}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="relative mt-4 text-xs text-gray-600 font-mono text-center">
        click anywhere to dismiss
      </div>
    </div>
  )
}
