'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/lib/auth'
import RmRfOverlay from '@/components/RmRfOverlay'
import UbuntuDesktop from '@/components/UbuntuDesktop'

/* ── Background removed for stability ─────────────────────────────── */

/* ── Boot lines & commands ────────────────────────────────────────── */
const BOOT: { text: string; cls: string }[] = [
  { text: 'Linux mahesh-os 5.15.0-91-generic #101 SMP x86_64 GNU/Linux', cls: 'text-green-500' },
  { text: '', cls: '' },
  { text: '[    0.000] Initializing kernel...                      [  OK  ]', cls: 'text-gray-400' },
  { text: '[    0.132] Loading network interface eth0...           [  OK  ]', cls: 'text-gray-400' },
  { text: '[    0.244] Mounting encrypted filesystem...            [  OK  ]', cls: 'text-gray-400' },
  { text: '[    0.389] Starting SSH daemon (sshd)...               [  OK  ]', cls: 'text-gray-400' },
  { text: '[    0.502] Loading portfolio modules...                [  OK  ]', cls: 'text-green-400' },
  { text: '[    0.614] Starting GNOME display manager (gdm3)...    [  OK  ]', cls: 'text-green-400' },
  { text: '', cls: '' },
  { text: '┌──────────────────────────────────────────────────────┐', cls: 'text-green-600' },
  { text: '│  MAHESH-OS  v1.0  —  Powered by Linux & Passion      │', cls: 'text-green-400' },
  { text: '│  User: mahesh  |  GPA: 8.30  |  Status: Available    │', cls: 'text-green-300' },
  { text: '└──────────────────────────────────────────────────────┘', cls: 'text-green-600' },
  { text: '', cls: '' },
  { text: "Commands: help · view · desktop · sudo rm -rf /", cls: 'text-gray-600' },
  { text: '', cls: '' },
]

const CMDS: Record<string, { text: string; cls: string }[]> = {
  help: [
    { text: '┌─────────────────────────────────────────────────┐', cls: 'text-green-600' },
    { text: '│  AVAILABLE COMMANDS                             │', cls: 'text-green-400' },
    { text: '├─────────────────────────────────────────────────┤', cls: 'text-green-600' },
    { text: '│  whoami        → identity info                  │', cls: 'text-white' },
    { text: '│  ls projects   → list all projects              │', cls: 'text-white' },
    { text: '│  cat skills    → technical skills               │', cls: 'text-white' },
    { text: '│  cat bio       → about me                       │', cls: 'text-white' },
    { text: '│  contact       → contact details                │', cls: 'text-white' },
    { text: '│  view          → open full portfolio            │', cls: 'text-cyan-400' },
    { text: '│  desktop       → launch Ubuntu desktop          │', cls: 'text-blue-400' },
    { text: '│  clear         → clear screen                   │', cls: 'text-white' },
    { text: '│  sudo rm -rf / → try it... 😈                  │', cls: 'text-red-400' },
    { text: '└─────────────────────────────────────────────────┘', cls: 'text-green-600' },
  ],
  whoami: [
    { text: 'uid=1000(mahesh) gid=1000(mahesh) groups=1000,4,27,sudo', cls: 'text-gray-400' },
    { text: '', cls: '' },
    { text: 'Name     : Jidugu Sri Sai Mahesh', cls: 'text-green-400' },
    { text: 'Role     : ECE Student & Embedded Systems Engineer', cls: 'text-white' },
    { text: 'College  : B.V. Raju Institute of Technology, Narsapur', cls: 'text-white' },
    { text: 'GPA      : 8.30 / 10.0', cls: 'text-yellow-400' },
    { text: 'Status   : Open to opportunities', cls: 'text-green-400' },
  ],
  'ls projects': [
    { text: 'total 4', cls: 'text-gray-500' },
    { text: 'drwxr-xr-x  001  fire-surveillance-bot          [PUBLISHED]  ', cls: 'text-green-400' },
    { text: 'drwxr-xr-x  002  ai-recycling-vending-machine   [DEPLOYED]   ', cls: 'text-yellow-400' },
    { text: 'drwxr-xr-x  003  coastal-behaviour-dl-framework [RESEARCH]   ', cls: 'text-cyan-400' },
    { text: 'drwxr-xr-x  004  tropoleap-embedded-systems     [IN PROGRESS]', cls: 'text-gray-400' },
    { text: '', cls: '' },
    { text: "→ type 'view' to explore in detail", cls: 'text-gray-500' },
  ],
  'cat skills': [
    { text: 'Programming     : C, C++, Python', cls: 'text-white' },
    { text: 'MCUs            : ESP32, ESP32-WROVER, Arduino, Particle Photon', cls: 'text-white' },
    { text: 'Domains         : Embedded Systems, IoT, Deep Learning, CV', cls: 'text-white' },
    { text: 'Protocols       : MQTT, Bluetooth, Firebase', cls: 'text-white' },
    { text: 'Hardware        : PCB Design, Firmware, Component Selection', cls: 'text-white' },
  ],
  'cat bio': [
    { text: 'Motivated ECE student with hands-on experience in embedded', cls: 'text-white' },
    { text: 'systems, IoT, and deep learning. Passionate about building', cls: 'text-white' },
    { text: 'innovative solutions — from fire surveillance bots and smart', cls: 'text-white' },
    { text: 'recycling systems to coastal deep learning frameworks.', cls: 'text-white' },
    { text: '', cls: '' },
    { text: 'Research Intern @ IIT Bhubaneswar  |  Engineer @ Tropoleap', cls: 'text-green-400' },
  ],
  contact: [
    { text: 'Email    : jsrisaimahesh@gmail.com', cls: 'text-white' },
    { text: 'Phone    : +91 8008060605', cls: 'text-white' },
    { text: 'LinkedIn : linkedin.com/in/jsrisaimahesh', cls: 'text-cyan-400' },
  ],
}

type LK = 'boot' | 'in' | 'out' | 'err' | 'ok'
interface Line { id: number; text: string; cls: string; k: LK }
let _n = 0
const mk = (text: string, cls: string, k: LK = 'out'): Line => ({ id: ++_n, text, cls, k })

export default function Terminal() {
  const router = useRouter()
  const [lines,       setLines]      = useState<Line[]>([])
  const [input,       setInput]      = useState('')
  const [ready,       setReady]      = useState(false)
  const [pwMode,      setPwMode]     = useState(false)
  const [attempts,    setAttempts]   = useState(0)
  const [locked,      setLocked]     = useState(false)
  const [showRm,      setShowRm]     = useState(false)
  const [showDesktop, setShowDesktop] = useState(false)
  const inputRef  = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let i = 0
    const tick = () => {
      if (i < BOOT.length) {
        const item = BOOT[i]
        setLines(p => [...p, mk(item.text, item.cls, 'boot')])
        i++
        setTimeout(tick, 75)
      } else { setReady(true) }
    }
    setTimeout(tick, 200)
  }, [])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [lines])
  useEffect(() => { if (ready) setTimeout(() => inputRef.current?.focus(), 80) }, [ready])
  const push = useCallback((nl: Line[]) => setLines(p => [...p.slice(-200), ...nl]), [])

  const handleEnter = useCallback(() => {
    const raw = input.trim(); setInput('')
    if (!raw) return

    if (pwMode) {
      push([mk('[sudo] password: ••••••••', 'text-white', 'in')])
      if (locked) { push([mk('Session locked. Refresh to retry.', 'text-red-400', 'err')]); setPwMode(false); return }
      if (login(raw)) {
        push([mk('[sudo] Authentication successful. ✓', 'text-green-400', 'ok'), mk('Redirecting to admin panel...', 'text-green-400', 'ok')])
        setPwMode(false)
        setTimeout(() => router.push('/admin'), 900)
      } else {
        const n = attempts + 1; setAttempts(n)
        if (n >= 3) { setLocked(true); push([mk('sudo: 3 incorrect attempts — session locked.', 'text-red-400', 'err')]) }
        else push([mk(`[sudo] Wrong password. ${3 - n} attempt(s) left.`, 'text-red-400', 'err')])
        setPwMode(false)
      }
      return
    }

    const cmd = raw.toLowerCase()
    push([mk(`mahesh@ubuntu:~$ ${raw}`, 'text-white', 'in')])

    if (cmd.includes('rm -rf') || (cmd.includes('rm') && cmd.includes('-rf'))) { setShowRm(true); return }
    if (cmd.includes('sudo') || cmd.includes('admin') || cmd === 'login') {
      push([mk('[sudo] password for mahesh:', 'text-gray-300', 'out')]); setPwMode(true); return
    }
    if (cmd === 'view' || cmd === 'open' || cmd === 'portfolio') {
      push([mk('→ Launching portfolio viewer...', 'text-cyan-400', 'ok')])
      setTimeout(() => router.push('/view'), 500); return
    }
    if (cmd === 'desktop' || cmd === 'gnome' || cmd === 'startx' || cmd === 'gui') {
      push([
        mk('→ Starting GNOME session...', 'text-blue-400', 'ok'),
        mk('→ Loading Ubuntu 22.04 desktop environment...', 'text-blue-400', 'ok'),
        mk('→ Mounting /home/mahesh...', 'text-blue-400', 'ok'),
      ])
      setTimeout(() => setShowDesktop(true), 900); return
    }
    if (cmd === 'clear' || cmd === 'cls') { setLines([]); return }

    const key = Object.keys(CMDS).find(k => cmd === k || cmd.startsWith(k))
    if (key) { push(CMDS[key].map(l => mk(l.text, l.cls, 'out'))); return }

    push([
      mk(`bash: ${raw}: command not found`, 'text-red-400', 'err'),
      mk("Try 'help' for available commands.", 'text-gray-600', 'out'),
    ])
  }, [input, pwMode, locked, attempts, push, router])

  if (showDesktop) return <UbuntuDesktop onClose={() => setShowDesktop(false)} />

  return (
    <>
      {showRm && <RmRfOverlay onDone={() => setShowRm(false)} />}

      {/* Deep dark green hacker terminal — not violet */}
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
        style={{ background: '#000902' }}>

        {/* Subtle centre glow */}
        <div className="absolute inset-0 pointer-events-none z-[1]"
          style={{ background: 'radial-gradient(ellipse at 50% 60%, rgba(0,255,65,0.05) 0%, transparent 65%)' }} />

        <div className="relative z-10 w-full max-w-2xl">
          {/* Terminal window */}
          <div className="rounded-lg overflow-hidden shadow-2xl"
            style={{ border: '1px solid rgba(0,255,65,0.25)', background: 'rgba(0,6,2,0.97)' }}>

            {/* Titlebar */}
            <div className="flex items-center gap-2 px-3 py-2.5 border-b"
              style={{ background: 'rgba(0,12,4,0.99)', borderColor: 'rgba(0,255,65,0.15)' }}>
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="flex-1 text-center text-xs font-mono" style={{ color: 'rgba(0,255,65,0.5)' }}>
                mahesh@mahesh-os: ~
              </span>
              <a href="/view" className="text-xs font-mono transition-colors"
                style={{ color: 'rgba(0,255,65,0.4)' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#00ff41')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(0,255,65,0.4)')}>
                [portfolio →]
              </a>
            </div>

            {/* Output */}
            <div className="p-4 h-[64vh] overflow-y-auto font-mono text-xs sm:text-sm"
              style={{ color: '#00ff41' }}
              onClick={() => inputRef.current?.focus()}>
              {lines.map(line => (
                <div key={line.id} className={'leading-relaxed whitespace-pre-wrap break-all ' + line.cls}>
                  {line.text === '' ? '\u00A0' : line.text}
                </div>
              ))}

              {ready && (
                <div className="flex items-center flex-wrap mt-0.5">
                  {pwMode
                    ? <span className="text-gray-300">[sudo] password for mahesh:&nbsp;</span>
                    : <>
                        <span className="text-green-400 font-bold">mahesh</span>
                        <span className="text-white">@</span>
                        <span className="text-green-400 font-bold">mahesh-os</span>
                        <span className="text-white">:</span>
                        <span className="text-blue-400 font-bold">~</span>
                        <span className="text-white">$&nbsp;</span>
                      </>
                  }
                  <input
                    ref={inputRef} value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleEnter() }}
                    type={pwMode ? 'password' : 'text'}
                    className="flex-1 min-w-[40px] bg-transparent outline-none text-white caret-transparent font-mono text-xs sm:text-sm"
                    spellCheck={false} autoComplete="off" autoCorrect="off" autoCapitalize="off"
                    disabled={locked}
                  />
                  <span className="text-green-400 animate-blink">█</span>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </div>

          <p className="mt-3 text-center font-mono text-xs" style={{ color: 'rgba(0,255,65,0.3)' }}>
            <span style={{ color: 'rgba(0,255,65,0.6)' }}>help</span>
            {' · '}
            <span className="text-cyan-700">view</span>
            {' · '}
            <span className="text-blue-700">desktop</span>
            {' · '}
            <span className="text-red-900">sudo rm -rf /</span>
          </p>
        </div>
      </div>
    </>
  )
}
