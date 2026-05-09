'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { resolvePhotoUrl } from '@/lib/photo'

/* ══════════════════════════════════════════════════════════ TYPES */
type AppId = 'terminal' | 'files' | 'editor' | 'photos' | 'browser' | 'about' | 'settings'
type WinState = { id: AppId; x: number; y: number; w: number; h: number; maximized: boolean }

/* ══════════════════════════════════════════════════════════ CLOCK */
function Clock() {
  const [t, setT] = useState(new Date())
  useEffect(() => { const id = setInterval(() => setT(new Date()), 1000); return () => clearInterval(id) }, [])
  return (
    <span className="text-sm font-medium select-none">
      {t.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
      {'  '}
      {t.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
    </span>
  )
}

/* ══════════════════════════════════════════════════════════ WINDOW CHROME */
interface WinProps {
  id: string; title: string; icon: string; children: React.ReactNode
  winState: WinState
  onClose(id: string): void
  onFocus(id: string): void
  onMinimize(id: string): void
  onToggleMax(id: string): void
  onMove(id: string, x: number, y: number): void
  onResize(id: string, w: number, h: number): void
  zIndex: number; minimized: boolean
}
function AppWindow({ id, title, icon, children, winState, onClose, onFocus, onMinimize, onToggleMax, onMove, onResize, zIndex, minimized }: WinProps) {
  const dragRef   = useRef<{ ox: number; oy: number } | null>(null)
  const resizeRef = useRef<{ ox: number; oy: number; ow: number; oh: number } | null>(null)

  const startDrag = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.no-drag')) return
    if (winState.maximized) return
    onFocus(id)
    dragRef.current = { ox: e.clientX - winState.x, oy: e.clientY - winState.y }
    const move = (e: MouseEvent) => {
      if (!dragRef.current) return
      onMove(id, Math.max(0, e.clientX - dragRef.current.ox), Math.max(28, e.clientY - dragRef.current.oy))
    }
    const up = () => { dragRef.current = null; removeEventListener('mousemove', move); removeEventListener('mouseup', up) }
    addEventListener('mousemove', move); addEventListener('mouseup', up)
  }

  const startResize = (e: React.MouseEvent) => {
    e.stopPropagation()
    resizeRef.current = { ox: e.clientX, oy: e.clientY, ow: winState.w, oh: winState.h }
    const move = (e: MouseEvent) => {
      if (!resizeRef.current) return
      onResize(id,
        Math.max(320, resizeRef.current.ow + e.clientX - resizeRef.current.ox),
        Math.max(240, resizeRef.current.oh + e.clientY - resizeRef.current.oy))
    }
    const up = () => { resizeRef.current = null; removeEventListener('mousemove', move); removeEventListener('mouseup', up) }
    addEventListener('mousemove', move); addEventListener('mouseup', up)
  }

  if (minimized) return null

  const style: React.CSSProperties = winState.maximized
    ? { position: 'fixed', inset: '28px 0 48px 0', zIndex, borderRadius: 0 }
    : { position: 'fixed', left: winState.x, top: winState.y, width: winState.w, height: winState.h, zIndex, borderRadius: 8 }

  return (
    <div style={style} className="flex flex-col shadow-2xl overflow-hidden border border-white/10"
      onMouseDown={() => onFocus(id)}>
      {/* Titlebar */}
      <div className="flex items-center gap-2 px-3 h-9 shrink-0 select-none cursor-grab active:cursor-grabbing"
        style={{ background: '#3c3b37', borderRadius: winState.maximized ? 0 : '8px 8px 0 0' }}
        onMouseDown={startDrag}>
        <span className="text-base leading-none">{icon}</span>
        <span className="text-white text-sm flex-1 truncate font-medium">{title}</span>
        <div className="flex items-center gap-1.5 no-drag">
          {/* Minimize */}
          <button onClick={() => onMinimize(id)} title="Minimize"
            className="w-[14px] h-[14px] rounded-full bg-[#f4bf4f] hover:bg-[#f5d067] flex items-center justify-center transition-colors group">
            <span className="text-black text-[8px] font-black opacity-0 group-hover:opacity-100">─</span>
          </button>
          {/* Maximize */}
          <button onClick={() => onToggleMax(id)} title={winState.maximized ? 'Restore' : 'Maximize'}
            className="w-[14px] h-[14px] rounded-full bg-[#61c554] hover:bg-[#7ed870] flex items-center justify-center transition-colors group">
            <span className="text-black text-[8px] font-black opacity-0 group-hover:opacity-100">{winState.maximized ? '⤡' : '⤢'}</span>
          </button>
          {/* Close */}
          <button onClick={() => onClose(id)} title="Close"
            className="w-[14px] h-[14px] rounded-full bg-[#ed6a5e] hover:bg-[#f08080] flex items-center justify-center transition-colors group">
            <span className="text-black text-[8px] font-black opacity-0 group-hover:opacity-100">✕</span>
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">{children}</div>
      {!winState.maximized && (
        <div onMouseDown={startResize}
          className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize no-drag z-10" />
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════ TERMINAL */
const PROTECTED = ['portfolio', 'projects', 'research', 'resume.pdf', 'README.md', 'skills.txt', '.env', '.ssh']

function TerminalApp() {
  const router = useRouter()
  const [cmdHistory, setCmdHistory] = useState<string[]>([])
  const [histIdx,    setHistIdx]    = useState(-1)
  const [cwd,        setCwd]        = useState('/home/mahesh')
  const [userFiles,  setUserFiles]  = useState<string[]>([]) // user-created files
  const [lines, setLines] = useState<{ text: string; cls: string }[]>([
    { text: '╔═══════════════════════════════════════════╗', cls: 'text-green-500' },
    { text: '║  Mahesh-OS Terminal  v1.0                 ║', cls: 'text-green-400' },
    { text: '║  Type "help" for commands                 ║', cls: 'text-gray-400' },
    { text: '╚═══════════════════════════════════════════╝', cls: 'text-green-500' },
    { text: '', cls: '' },
  ])
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [lines])

  const push = (...ls: { text: string; cls: string }[]) =>
    setLines(p => [...p, ...ls, { text: '', cls: '' }])

  const prompt = `mahesh@ubuntu:${cwd.replace('/home/mahesh', '~')}$ `

  const run = useCallback((raw: string) => {
    const cmd = raw.trim()
    if (!cmd) return
    setCmdHistory(h => [cmd, ...h.slice(0, 99)])
    setHistIdx(-1)

    const pLine = { text: prompt + cmd, cls: 'text-white' }
    const parts  = cmd.split(/\s+/)
    const base   = parts[0].toLowerCase()
    const args   = parts.slice(1)
    const arg1   = args[0] ?? ''

    /* ── clear ── */
    if (base === 'clear' || base === 'cls') { setLines([]); return }

    /* ── cd ── */
    if (base === 'cd') {
      const dest = arg1 === '' || arg1 === '~' ? '/home/mahesh'
        : arg1.startsWith('/') ? arg1
        : cwd + '/' + arg1
      const valid = ['/home/mahesh', '/home/mahesh/Desktop', '/home/mahesh/Documents',
        '/home/mahesh/Downloads', '/home/mahesh/portfolio', '/home/mahesh/projects',
        '/home/mahesh/research', '/tmp', '/etc', '/var', '/usr']
      if (valid.includes(dest)) { setCwd(dest); setLines(p => [...p, pLine]) }
      else push(pLine, { text: `bash: cd: ${arg1}: No such file or directory`, cls: 'text-red-400' })
      return
    }

    /* ── ls ── */
    if (base === 'ls') {
      const showHidden = args.includes('-a') || args.includes('-la') || args.includes('-al')
      const longFmt    = args.includes('-l') || args.includes('-la') || args.includes('-al') || args.includes('-ll')
      const dir = arg1 && !arg1.startsWith('-') ? (arg1.startsWith('/') ? arg1 : cwd + '/' + arg1) : cwd
      const entries = getDir(dir, userFiles, showHidden)
      if (longFmt) {
        push(pLine, { text: `total ${entries.length * 4}`, cls: 'text-gray-400' },
          ...entries.map(e => ({ text: `${e.perm}  mahesh mahesh  ${e.size.padStart(8)} Feb 23 ${e.name}`, cls: e.type === 'dir' ? 'text-blue-300' : 'text-gray-200' })))
      } else {
        push(pLine, { text: entries.map(e => e.name).join('   '), cls: 'text-blue-300' })
      }
      return
    }

    /* ── mkdir ── */
    if (base === 'mkdir') {
      if (!arg1) { push(pLine, { text: 'mkdir: missing operand', cls: 'text-red-400' }); return }
      setUserFiles(f => [...f, `${cwd}/${arg1}:dir`])
      push(pLine, { text: `Directory '${arg1}' created.`, cls: 'text-green-400' }); return
    }

    /* ── touch / new file ── */
    if (base === 'touch') {
      if (!arg1) { push(pLine, { text: 'touch: missing file operand', cls: 'text-red-400' }); return }
      setUserFiles(f => [...f, `${cwd}/${arg1}:file`])
      push(pLine, { text: `File '${arg1}' created.`, cls: 'text-green-400' }); return
    }

    /* ── rm ── */
    if (base === 'rm') {
      if (args.some(a => !a.startsWith('-')) &&
          PROTECTED.some(p => args.some(a => a.includes(p)))) {
        push(pLine, { text: 'rm: cannot remove — portfolio files are protected.', cls: 'text-red-400' },
          { text: 'Tip: You can remove files you created with touch/mkdir.', cls: 'text-yellow-400' })
        return
      }
      if (args.includes('-rf') && args.includes('/')) {
        push(pLine, { text: 'Nice try 😄  The rm -rf / Easter egg is on the main terminal!', cls: 'text-yellow-400' })
        return
      }
      const target = args.find(a => !a.startsWith('-'))
      if (target) {
        const full = `${cwd}/${target}`
        if (userFiles.some(f => f.startsWith(full))) {
          setUserFiles(f => f.filter(x => !x.startsWith(full)))
          push(pLine, { text: `Removed '${target}'.`, cls: 'text-green-400' })
        } else {
          push(pLine, { text: `rm: cannot remove '${target}': File is protected or not found.`, cls: 'text-red-400' })
        }
      }
      return
    }

    /* ── cat ── */
    if (base === 'cat') {
      const FILE_CONTENTS: Record<string, string[]> = {
        'readme.md': [
          '# Jidugu Sri Sai Mahesh',
          '## ECE Student & Embedded Systems Engineer',
          '',
          'Motivated ECE student with hands-on experience in embedded systems, IoT, and deep learning.',
          'Passionate about building innovative solutions — from autonomous surveillance bots to',
          'smart recycling systems and deep learning frameworks for coastal modeling.',
          '',
          '📍 Location: Narsapur, India',
          '📧 Email: jsrisaimahesh@gmail.com',
          '📱 Phone: +91 8008060605',
          '💼 LinkedIn: linkedin.com/in/jsrisaimahesh',
          '🎓 GPA: 8.30/10.0 | B.Tech ECE @ BVRIT Narsapur (2023–present)',
        ],
        'resume.pdf': [
          '╔════════════════════════════════════════════════════════════╗',
          '║  JIDUGU SRI SAI MAHESH - RESUME                           ║',
          '║  ECE Student & Embedded Systems Engineer                  ║',
          '╚════════════════════════════════════════════════════════════╝',
          '',
          '📍 CONTACT INFORMATION',
          '├─ Email: jsrisaimahesh@gmail.com',
          '├─ Phone: +91 8008060605',
          '├─ Location: Narsapur, India',
          '└─ LinkedIn: linkedin.com/in/jsrisaimahesh',
          '',
          '🎓 EDUCATION',
          '├─ B.Tech Electronics & Communication Engineering (2023–present)',
          '│  └─ B.V. Raju Institute of Technology, Narsapur | GPA: 8.30/10.0',
          '├─ Intermediate (MPC) (2022)',
          '│  └─ Narayana Jr. College, IDPL | Score: 948/1000',
          '└─ Secondary School Certificate (2021)',
          '   └─ ST. Anthony\'s High School, Jeedimetla | Score: 10.0/10.0 ★',
          '',
          '💼 EXPERIENCE',
          '├─ IIT Bhubaneswar | Winter Research Intern (Dec 2025)',
          '│  ├─ Project: Coastal Behavior Deep Learning Framework',
          '│  ├─ Developed DeepONet-based framework to model coastal dynamics',
          '│  ├─ Trained on oceanographic/meteorological datasets',
          '│  └─ Evaluated predictions against reference simulations',
          '│',
          '└─ Tropoleap | Embedded Systems Design Engineer (July 2025–present)',
          '   ├─ Developing embedded C/C++ firmware for ESP32',
          '   ├─ Component selection and hardware testing',
          '   └─ Production-grade embedded systems development',
          '',
          '🚀 SKILLS',
          '├─ Programming: C, C++, Python',
          '├─ Microcontrollers: ESP32, ESP32-WROVER, ESP32-CAM, Arduino',
          '├─ Domains: Embedded Systems, IoT, Deep Learning, Computer Vision',
          '├─ Protocols & Cloud: MQTT, Bluetooth, Firebase, Real-time Systems',
          '├─ Hardware: PCB Design, Firmware Development, Hardware Testing',
          '└─ Certifications: PCB Design (AICTE), HCL Embedded Systems, EPICS Cohort',
          '',
          '🏆 ACHIEVEMENTS',
          '├─ SIH Internal Hackathon 2025 — 3rd Place (BVRIT)',
          '├─ PALS Innowah 2025–2026 — Cluster Finals',
          '├─ Research Paper Published — ICOIICS 2025, Nepal (Communicated)',
          '├─ IIT Bhubaneswar Research Intern — Deep Learning for Coastal Modeling',
          '├─ Film Club Leadership — Chalana Chithram Event (2500+ attendees)',
          '└─ Failathon Participant — IEEE Student Branch EPICS Cohort',
          '',
          '🔗 View full portfolio at: /view or mahesh://home',
        ],
        'skills.txt': [
          '╔════════════════════════════════════════════════════════════╗',
          '║  TECHNICAL SKILLS                                          ║',
          '╚════════════════════════════════════════════════════════════╝',
          '',
          '🎯 PROGRAMMING LANGUAGES',
          '├─ C (Firmware development, embedded systems)',
          '├─ C++ (Advanced embedded development)',
          '└─ Python (Deep learning, data processing)',
          '',
          '⊡ MICROCONTROLLERS & BOARDS',
          '├─ ESP32 (Primary development platform)',
          '├─ ESP32-WROVER (Production systems)',
          '├─ ESP32-CAM (Vision-enabled applications)',
          '├─ Arduino (Prototyping)',
          '└─ Particle Photon (IoT connectivity)',
          '',
          '◈ DOMAINS & SPECIALIZATIONS',
          '├─ Embedded Systems Development',
          '├─ Internet of Things (IoT)',
          '├─ Deep Learning & Neural Networks',
          '├─ Computer Vision & Image Processing',
          '├─ Neural Operators (DeepONet)',
          '└─ Sensor Fusion & Real-time Systems',
          '',
          '⋈ PROTOCOLS & CLOUD PLATFORMS',
          '├─ MQTT (Message Queuing Telemetry Transport)',
          '├─ Bluetooth & BLE (Wireless Communication)',
          '├─ Firebase (Backend & Database)',
          '└─ Real-time Communication Systems',
          '',
          '⊞ HARDWARE DESIGN & TESTING',
          '├─ PCB Design & Layout',
          '├─ Firmware Development Lifecycle',
          '├─ Hardware Component Selection',
          '└─ Testing & Validation',
          '',
          '★ CERTIFICATIONS',
          '├─ PCB Design Certification (AICTE IDEA Lab)',
          '├─ HCL Embedded Systems Certification',
          '└─ EPICS Cohort — IEEE Student Branch',
        ],
        'projects.txt': [
          '╔════════════════════════════════════════════════════════════╗',
          '║  PROJECTS PORTFOLIO                                        ║',
          '╚════════════════════════════════════════════════════════════╝',
          '',
          '🔥 PROJECT 001: FIRE SURVEILLANCE BOT',
          '├─ Status: ✓ PUBLISHED',
          '├─ Description:',
          '│  Autonomous bot for real-time fire and gas detection with live',
          '│  sensor data and video streaming to web dashboard.',
          '│  Paper communicated at ICOIICS 2025, Nepal.',
          '├─ Technology Stack:',
          '│  ├─ Hardware: ESP32, ESP32-CAM, Flame Sensor, MQ-2',
          '│  ├─ Communication: MQTT, Bluetooth',
          '│  └─ Backend: Firebase cloud integration',
          '└─ Impact: Research publication at international conference',
          '',
          '♻️ PROJECT 002: AI-POWERED RECYCLING VENDING MACHINE',
          '├─ Status: ✓ DEPLOYED',
          '├─ Description:',
          '│  Smart RVM that identifies and sorts plastic bottles via deep',
          '│  learning vision model. Rewards users with auto-generated coupons',
          '│  via thermal printer and SMS notifications.',
          '├─ Technology Stack:',
          '│  ├─ AI: Deep Learning, Computer Vision, TensorFlow',
          '│  ├─ Hardware: IR Sensor, Thermal Printer',
          '│  ├─ Integration: Firebase, SMS API',
          '│  └─ Platform: ESP32-based embedded system',
          '└─ Impact: Deployed in production for smart waste management',
          '',
          '🌊 PROJECT 003: COASTAL BEHAVIOUR DEEP LEARNING FRAMEWORK',
          '├─ Status: 🔬 RESEARCH',
          '├─ Description:',
          '│  DeepONet-based scientific model predicting coastal dynamics of',
          '│  the western Bay of Bengal during extreme weather conditions',
          '│  (cyclones, storm surges).',
          '├─ Technology Stack:',
          '│  ├─ ML Framework: DeepONet, PyTorch',
          '│  ├─ Mathematics: Neural Operators, Fluid Dynamics',
          '│  └─ Data: Oceanographic & Meteorological Datasets',
          '└─ Impact: IIT Bhubaneswar Winter Research Internship (Dec 2025)',
          '',
          '⚡ PROJECT 004: CONFIDENTIAL EMBEDDED SYSTEMS (TROPOLEAP)',
          '├─ Status: 🔄 IN PROGRESS',
          '├─ Description:',
          '│  Two proprietary production embedded systems actively in',
          '│  development at Tropoleap. Full firmware lifecycle on ESP32-WROVER',
          '│  with industrial-grade C/C++ implementation.',
          '├─ Technology Stack:',
          '│  ├─ Hardware: ESP32-WROVER (Production MCU)',
          '│  ├─ Languages: Advanced C and C++',
          '│  ├─ Development: Complete firmware ecosystem',
          '│  └─ Process: Rigorous hardware testing & validation',
          '└─ Details: Confidential (NDA Protected)',
          '',
          '📊 PROJECT STATISTICS',
          '├─ Total Projects: 4 major initiatives',
          '├─ Status Breakdown: 1 Published, 1 Deployed, 1 Research, 1 In-Progress',
          '├─ Primary Focus: Embedded Systems, IoT, AI Integration',
          '└─ Technologies: 20+ specialized tools & frameworks',
          '',
          '💡 TIP: Type "cat projects.txt" to view this list anytime!',
          'Or open the Browser app and navigate to mahesh://projects',
        ],
      }
      const key = arg1.toLowerCase().replace('/home/mahesh/', '')
      const content = FILE_CONTENTS[key]
      if (content) { push(pLine, ...content.map(t => ({ text: t, cls: 'text-gray-200' }))); return }
      if (userFiles.some(f => f.includes(arg1 + ':file'))) { push(pLine, { text: '(empty file)', cls: 'text-gray-500' }); return }
      push(pLine, { text: `cat: ${arg1}: No such file or directory`, cls: 'text-red-400' }); return
    }

    /* ── echo ── */
    if (base === 'echo') { push(pLine, { text: args.join(' ').replace(/^["']|["']$/g, ''), cls: 'text-gray-200' }); return }

    /* ── pwd ── */
    if (base === 'pwd') { push(pLine, { text: cwd, cls: 'text-gray-200' }); return }

    /* ── whoami ── */
    if (base === 'whoami') { push(pLine, { text: 'mahesh', cls: 'text-green-400' }); return }

    /* ── hostname ── */
    if (base === 'hostname') { push(pLine, { text: 'mahesh-ubuntu', cls: 'text-gray-200' }); return }

    /* ── date ── */
    if (base === 'date') { push(pLine, { text: new Date().toString(), cls: 'text-gray-200' }); return }

    /* ── uname ── */
    if (base === 'uname') { push(pLine, { text: 'Linux mahesh-ubuntu 5.15.0-91-generic #101 SMP x86_64 GNU/Linux', cls: 'text-gray-200' }); return }

    /* ── history ── */
    if (base === 'history') {
      push(pLine, ...cmdHistory.map((h, i) => ({ text: `  ${String(i + 1).padStart(3)}  ${h}`, cls: 'text-gray-300' }))); return
    }

    /* ── env / printenv ── */
    if (base === 'env' || base === 'printenv') {
      push(pLine,
        { text: 'HOME=/home/mahesh', cls: 'text-gray-300' },
        { text: 'USER=mahesh', cls: 'text-gray-300' },
        { text: 'SHELL=/bin/bash', cls: 'text-gray-300' },
        { text: 'PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin', cls: 'text-gray-300' },
        { text: 'EDITOR=nano', cls: 'text-gray-300' }); return
    }

    /* ── ps ── */
    if (base === 'ps') {
      push(pLine,
        { text: 'PID  TTY   TIME     CMD', cls: 'text-yellow-400' },
        { text: '  1  tty1  00:00:01 bash', cls: 'text-gray-200' },
        { text: ' 42  tty1  00:00:00 ps', cls: 'text-gray-200' }); return
    }

    /* ── ps aux ── */
    if (cmd === 'ps aux' || cmd === 'ps -aux') {
      push(pLine,
        { text: 'USER       PID %CPU %MEM COMMAND', cls: 'text-yellow-400' },
        { text: 'mahesh    1001  0.0  0.1 /bin/bash', cls: 'text-gray-200' },
        { text: 'mahesh    1042  3.2  1.4 gnome-shell', cls: 'text-gray-200' },
        { text: 'mahesh    1089  0.0  0.2 portfolio-server', cls: 'text-green-400' },
        { text: 'mahesh    1102  0.0  0.1 mqtt-broker', cls: 'text-green-400' }); return
    }

    /* ── df ── */
    if (base === 'df') {
      push(pLine,
        { text: 'Filesystem      Size  Used Avail Use% Mounted on', cls: 'text-yellow-400' },
        { text: '/dev/sda1       468G   42G  402G  10% /', cls: 'text-gray-200' },
        { text: 'tmpfs           3.9G  1.2M  3.9G   1% /run', cls: 'text-gray-200' }); return
    }

    /* ── free ── */
    if (base === 'free') {
      push(pLine,
        { text: '               total   used   free  shared', cls: 'text-yellow-400' },
        { text: 'Mem:            7.7G   1.2G   5.9G    128M', cls: 'text-gray-200' },
        { text: 'Swap:           2.0G     0B   2.0G        ', cls: 'text-gray-200' }); return
    }

    /* ── top / htop ── */
    if (base === 'top' || base === 'htop') {
      push(pLine,
        { text: 'top - 14:23:01 up 2:14,  1 user,  load average: 0.12, 0.08, 0.05', cls: 'text-white' },
        { text: 'Tasks: 142 total,   1 running, 141 sleeping', cls: 'text-white' },
        { text: '%Cpu(s):  3.2 us,  0.8 sy,  0.0 ni, 95.6 id', cls: 'text-white' },
        { text: 'MiB Mem :   7892.0 total,   5891.2 free,   1228.4 used', cls: 'text-white' },
        { text: '', cls: '' },
        { text: '  PID USER      %CPU %MEM  COMMAND', cls: 'text-yellow-400' },
        { text: ' 1042 mahesh     3.2  1.4  gnome-shell', cls: 'text-gray-200' },
        { text: ' 1089 mahesh     0.2  0.3  portfolio-server', cls: 'text-green-400' },
        { text: ' 1001 mahesh     0.0  0.1  bash', cls: 'text-gray-200' }); return
    }

    /* ── ifconfig / ip addr ── */
    if (base === 'ifconfig' || cmd === 'ip addr' || cmd === 'ip a') {
      push(pLine,
        { text: 'eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>', cls: 'text-white' },
        { text: '        inet 192.168.1.42  netmask 255.255.255.0  broadcast 192.168.1.255', cls: 'text-gray-200' },
        { text: '        ether 02:42:ac:11:00:02  txqueuelen 0  (Ethernet)', cls: 'text-gray-200' },
        { text: 'lo: flags=73<UP,LOOPBACK,RUNNING>', cls: 'text-white' },
        { text: '        inet 127.0.0.1  netmask 255.0.0.0', cls: 'text-gray-200' }); return
    }

    /* ── ping ── */
    if (base === 'ping') {
      const host = arg1 || 'localhost'
      push(pLine,
        { text: `PING ${host}: 56 data bytes`, cls: 'text-white' },
        { text: `64 bytes from ${host}: icmp_seq=1 ttl=64 time=1.23 ms`, cls: 'text-gray-200' },
        { text: `64 bytes from ${host}: icmp_seq=2 ttl=64 time=1.18 ms`, cls: 'text-gray-200' },
        { text: `64 bytes from ${host}: icmp_seq=3 ttl=64 time=1.31 ms`, cls: 'text-gray-200' },
        { text: `--- ${host} ping statistics ---`, cls: 'text-white' },
        { text: '3 packets transmitted, 3 received, 0% packet loss', cls: 'text-green-400' }); return
    }

    /* ── curl ── */
    if (base === 'curl') {
      if (arg1.includes('portfolio') || arg1.includes('mahesh')) {
        push(pLine, { text: '<!DOCTYPE html><html>...Mahesh Portfolio...</html>', cls: 'text-gray-400' }); return
      }
      push(pLine, { text: `Fetching ${arg1}...`, cls: 'text-gray-400' },
        { text: '{"status":"ok","data":"(simulated response)"}', cls: 'text-green-400' }); return
    }

    /* ── wget ── */
    if (base === 'wget') {
      push(pLine, { text: `--2026-02-23 14:23:01--  ${arg1}`, cls: 'text-gray-400' },
        { text: 'Connecting... connected.', cls: 'text-gray-200' },
        { text: '100% [=========================>] downloaded.', cls: 'text-green-400' }); return
    }

    /* ── ssh ── */
    if (base === 'ssh') {
      push(pLine,
        { text: `Connecting to ${arg1}...`, cls: 'text-gray-400' },
        { text: 'Welcome to ESP32 Embedded Shell', cls: 'text-green-400' },
        { text: 'esp32# sensors --all', cls: 'text-white' },
        { text: '[FLAME] NORMAL  [GAS] 142ppm  [TEMP] 31.2°C', cls: 'text-cyan-400' },
        { text: 'Connection closed.', cls: 'text-gray-400' }); return
    }

    /* ── git ── */
    if (base === 'git') {
      if (arg1 === 'status') { push(pLine, { text: 'On branch main\nnothing to commit, working tree clean', cls: 'text-green-400' }); return }
      if (arg1 === 'log') {
        push(pLine,
          { text: 'commit a3f8c2d (HEAD -> main)', cls: 'text-yellow-400' },
          { text: 'Author: Jidugu Sri Sai Mahesh <jsrisaimahesh@gmail.com>', cls: 'text-white' },
          { text: 'Date:   Mon Feb 23 2026', cls: 'text-gray-300' },
          { text: '    feat: coastal deeponet model v2', cls: 'text-gray-200' },
          { text: '', cls: '' },
          { text: 'commit b12e9a1', cls: 'text-yellow-400' },
          { text: '    fix: ESP32 MQTT reconnect on sensor failure', cls: 'text-gray-200' }); return
      }
      if (arg1 === 'branch') { push(pLine, { text: '* main\n  dev\n  feature/deeponet-v3', cls: 'text-green-400' }); return }
      if (arg1 === 'clone') { push(pLine, { text: `Cloning into '${args[1]?.split('/').pop() || 'repo'}'...`, cls: 'text-gray-400' }, { text: 'done.', cls: 'text-green-400' }); return }
      push(pLine, { text: `git: '${arg1}' is not a git command. See 'git --help'.`, cls: 'text-red-400' }); return
    }

    /* ── python3 ── */
    if (base === 'python3') {
      if (arg1 === '--version' || arg1 === '-V') { push(pLine, { text: 'Python 3.10.12', cls: 'text-gray-200' }); return }
      if (arg1 === '-c' && args[1]) { push(pLine, { text: '(simulated output)', cls: 'text-gray-300' }); return }
      push(pLine,
        { text: 'Python 3.10.12 (main, Nov 20 2023, 15:14:05)', cls: 'text-gray-400' },
        { text: "Type 'exit()' to quit.", cls: 'text-gray-400' },
        { text: '>>> _', cls: 'text-green-400' }); return
    }

    /* ── node / npm ── */
    if (base === 'node') { push(pLine, { text: 'v20.11.0', cls: 'text-gray-200' }); return }
    if (base === 'npm') {
      if (arg1 === 'run' && args[1] === 'build') {
        push(pLine,
          { text: '> portfolio@1.0.0 build', cls: 'text-gray-400' },
          { text: '> next build', cls: 'text-gray-400' },
          { text: '  ▲ Next.js 14.2.5', cls: 'text-white' },
          { text: '  ✓ Compiled successfully', cls: 'text-green-400' },
          { text: '  ✓ Generating static pages (6/6)', cls: 'text-green-400' }); return
      }
      push(pLine, { text: 'npm 10.2.4', cls: 'text-gray-200' }); return
    }

    /* ── idf.py ── */
    if (base === 'idf.py') {
      if (arg1 === 'build') { push(pLine, { text: 'Compiling main.c...', cls: 'text-gray-400' }, { text: 'Build complete. Binary: 312 KB', cls: 'text-green-400' }); return }
      push(pLine, { text: 'ESP-IDF v5.1.2', cls: 'text-gray-200' }); return
    }

    /* ── neofetch ── */
    if (base === 'neofetch') {
      push(pLine,
        { text: '            .-/+oossssoo+/-.         mahesh@mahesh-ubuntu', cls: 'text-orange-400' },
        { text: '        `:+ssssssssssssssssss+:`     ──────────────────────', cls: 'text-orange-400' },
        { text: '      -+ssssssssssssssssssyyssss+-   OS: Ubuntu 22.04.3 LTS', cls: 'text-orange-400' },
        { text: '    .ossssssssssssssssssdMMMNysssso. Kernel: 5.15.0-91-generic', cls: 'text-orange-400' },
        { text: '   /ssssssssssshdmmNNmmyNMMMMhssssss/ Shell: bash 5.1.16', cls: 'text-orange-400' },
        { text: '  +ssssssssshmydMMMMMMMNddddyssssssss+ CPU: Intel Core i7-12700H', cls: 'text-orange-400' },
        { text: ' /ssssssssshNMMMyhhyyyyhmNMMMNhssssssss/ RAM: 1.2 GB / 8 GB', cls: 'text-orange-400' },
        { text: '.sssssssssdMMMNhssssssssshNMMMdssssssss. Uptime: 2h 14m', cls: 'text-orange-400' },
        { text: '+sssshhhyNMMNyssssssssssssyNMMMysssssss+ Packages: 2438', cls: 'text-orange-400' },
        { text: 'ossyNMMMNyMMhsssssssssssssshmmmhssssssso Terminal: gnome-terminal', cls: 'text-orange-400' }); return
    }

    /* ── man ── */
    if (base === 'man') {
      push(pLine,
        { text: `${arg1.toUpperCase()}(1)            User Commands            ${arg1.toUpperCase()}(1)`, cls: 'text-white' },
        { text: '', cls: '' },
        { text: 'NAME', cls: 'text-yellow-400' },
        { text: `       ${arg1} - simulated man page`, cls: 'text-gray-200' },
        { text: '', cls: '' },
        { text: 'DESCRIPTION', cls: 'text-yellow-400' },
        { text: `       The ${arg1} command is part of Mahesh-OS.`, cls: 'text-gray-200' },
        { text: '       Press q to quit (simulated).', cls: 'text-gray-400' }); return
    }

    /* ── sudo ── */
    if (base === 'sudo') {
      push(pLine, { text: '[sudo] This is a simulated environment. Admin panel is at /admin', cls: 'text-yellow-400' }); return
    }

    /* ── which / whereis ── */
    if (base === 'which' || base === 'whereis') {
      push(pLine, { text: `/usr/bin/${arg1}`, cls: 'text-gray-200' }); return
    }

    /* ── nano / vim / vi ── */
    if (base === 'nano' || base === 'vim' || base === 'vi') {
      push(pLine, { text: `Opening ${arg1 || 'new file'} in Editor app instead...`, cls: 'text-blue-400' }); return
    }

    /* ── exit ── */
    if (base === 'exit' || base === 'logout') {
      push(pLine, { text: 'To exit the desktop, use the power button in the top bar.', cls: 'text-yellow-400' }); return
    }

    /* ── open / xdg-open ── */
    if (base === 'open' || base === 'xdg-open') {
      if (arg1.includes('http') || arg1.includes('.com')) {
        push(pLine, { text: `Opening ${arg1} in Browser...`, cls: 'text-blue-400' }); return
      }
      push(pLine, { text: `Opening ${arg1}...`, cls: 'text-blue-400' }); return
    }

    /* ── help ── */
    if (base === 'help' || base === '--help') {
      push(pLine,
        { text: 'Available commands:', cls: 'text-yellow-400' },
        { text: '  Navigation:   cd, ls, ls -la, pwd, mkdir, touch, rm, cat, echo', cls: 'text-white' },
        { text: '  System:       ps, ps aux, top, htop, df -h, free -h, uname, date', cls: 'text-white' },
        { text: '  Network:      ping, ifconfig, ip addr, curl, wget, ssh, netstat', cls: 'text-white' },
        { text: '  Dev:          git, python3, node, npm, idf.py, which, man', cls: 'text-white' },
        { text: '  Utils:        neofetch, env, whoami, hostname, history, clear', cls: 'text-white' },
        { text: '  Files:        touch <name>, mkdir <name>, rm <userfile>', cls: 'text-green-400' },
        { text: '  Note:         Portfolio files are protected from deletion', cls: 'text-red-400' }); return
    }

    /* ── unknown ── */
    push(pLine, { text: `bash: ${parts[0]}: command not found`, cls: 'text-red-400' },
      { text: `Try 'help' for available commands.`, cls: 'text-gray-600' })
  }, [cwd, cmdHistory, userFiles, prompt])

  function getDir(path: string, userFiles: string[], hidden: boolean) {
    const base: Record<string, { name: string; perm: string; size: string; type: 'dir' | 'file' }[]> = {
      '/home/mahesh': [
        { name: 'Desktop',    perm: 'drwxr-xr-x', size: '4096',  type: 'dir'  },
        { name: 'Documents',  perm: 'drwxr-xr-x', size: '4096',  type: 'dir'  },
        { name: 'Downloads',  perm: 'drwxr-xr-x', size: '4096',  type: 'dir'  },
        { name: 'portfolio',  perm: 'drwxr-xr-x', size: '4096',  type: 'dir'  },
        { name: 'projects',   perm: 'drwxr-xr-x', size: '4096',  type: 'dir'  },
        { name: 'research',   perm: 'drwxr-xr-x', size: '4096',  type: 'dir'  },
        { name: 'resume.pdf', perm: '-rw-r--r--',  size: '124000', type: 'file' },
        { name: 'README.md',  perm: '-rw-r--r--',  size: '3218',   type: 'file' },
        { name: 'skills.txt', perm: '-rw-r--r--',  size: '1124',   type: 'file' },
        { name: 'mahesh.jpg', perm: '-rw-r--r--',  size: '2400000', type: 'file'},
      ],
      '/home/mahesh/projects': [
        { name: 'fire-surveillance-bot',          perm: 'drwxr-xr-x', size: '4096', type: 'dir' },
        { name: 'ai-recycling-vending-machine',   perm: 'drwxr-xr-x', size: '4096', type: 'dir' },
        { name: 'coastal-behaviour-dl-framework', perm: 'drwxr-xr-x', size: '4096', type: 'dir' },
        { name: 'tropoleap-embedded',             perm: 'drwxr-xr-x', size: '4096', type: 'dir' },
      ],
    }
    const entries = base[path] ?? [{ name: '(empty)', perm: 'drwxr-xr-x', size: '4096', type: 'dir' as const }]
    // Add user-created files in this dir
    const uExtra = userFiles
      .filter(f => f.startsWith(path + '/'))
      .map(f => {
        const parts = f.split('/')
        const name  = parts[parts.length - 1].replace(/:.*$/, '')
        const isDir = f.endsWith(':dir')
        return { name, perm: isDir ? 'drwxr-xr-x' : '-rw-r--r--', size: '0', type: (isDir ? 'dir' : 'file') as 'dir' | 'file' }
      })
    return [...entries, ...uExtra]
  }

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { run(input); setInput('') }
    else if (e.key === 'ArrowUp')   { const ni = Math.min(histIdx + 1, cmdHistory.length - 1); setHistIdx(ni); setInput(cmdHistory[ni] ?? '') }
    else if (e.key === 'ArrowDown') { const ni = Math.max(histIdx - 1, -1); setHistIdx(ni); setInput(ni === -1 ? '' : cmdHistory[ni]) }
    else if (e.key === 'Tab') { e.preventDefault() /* autocomplete placeholder */ }
  }

  return (
    <div className="h-full flex flex-col bg-[#0d0d0d] font-mono text-sm" onClick={() => inputRef.current?.focus()}>
      <div className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {lines.map((l, i) => <div key={i} className={'leading-snug whitespace-pre-wrap break-all ' + l.cls}>{l.text || '\u00A0'}</div>)}
        <div className="flex items-center gap-0">
          <span className="text-green-400 font-bold">mahesh</span>
          <span className="text-white">@ubuntu:</span>
          <span className="text-blue-400 font-bold">{cwd.replace('/home/mahesh', '~')}</span>
          <span className="text-white">$ </span>
          <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKey}
            className="flex-1 bg-transparent outline-none text-white caret-green-400"
            spellCheck={false} autoComplete="off" />
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════ FILES */
function FilesApp() {
  const [path,     setPath]     = useState('/home/mahesh')
  const [selected, setSel]      = useState('')
  const [view,     setView]     = useState<'grid' | 'list'>('grid')
  const [newName,  setNewName]  = useState('')
  const [making,   setMaking]   = useState(false)
  const [userItems,setUserItems]= useState<{ path: string; name: string; type: 'file' | 'dir' }[]>([])
  const [notify,   setNotify]   = useState('')

  const showNotify = (msg: string) => { setNotify(msg); setTimeout(() => setNotify(''), 2500) }

  const TREE: Record<string, { icon: string; name: string; type: 'file' | 'dir'; size?: string; protected?: boolean }[]> = {
    '/home/mahesh': [
      { icon: '📁', name: 'Desktop',    type: 'dir', protected: false },
      { icon: '📁', name: 'Documents',  type: 'dir', protected: false },
      { icon: '📁', name: 'Downloads',  type: 'dir', protected: false },
      { icon: '📁', name: 'portfolio',  type: 'dir', protected: true  },
      { icon: '📁', name: 'projects',   type: 'dir', protected: true  },
      { icon: '📁', name: 'research',   type: 'dir', protected: true  },
      { icon: '📄', name: 'resume.pdf', type: 'file', size: '124 KB', protected: true },
      { icon: '📄', name: 'README.md',  type: 'file', size: '3.2 KB', protected: true },
      { icon: '🖼️', name: 'mahesh.jpg', type: 'file', size: '2.4 MB', protected: true },
      { icon: '📄', name: 'skills.txt', type: 'file', size: '1.1 KB', protected: true },
    ],
    '/home/mahesh/projects': [
      { icon: '📁', name: 'fire-surveillance-bot',          type: 'dir', protected: true },
      { icon: '📁', name: 'ai-recycling-vending-machine',   type: 'dir', protected: true },
      { icon: '📁', name: 'coastal-behaviour-dl-framework', type: 'dir', protected: true },
      { icon: '📁', name: 'tropoleap-embedded',             type: 'dir', protected: true },
    ],
    '/home/mahesh/portfolio': [
      { icon: '📁', name: 'app',        type: 'dir', protected: true },
      { icon: '📁', name: 'components', type: 'dir', protected: true },
      { icon: '📄', name: 'package.json',   type: 'file', size: '1.2 KB', protected: true },
      { icon: '📄', name: 'next.config.js', type: 'file', size: '0.4 KB', protected: true },
    ],
    '/home/mahesh/Desktop':   [],
    '/home/mahesh/Documents': [],
    '/home/mahesh/Downloads': [],
  }

  const baseItems = TREE[path] ?? []
  const extraItems = userItems.filter(u => u.path === path).map(u => ({
    icon: u.type === 'dir' ? '📁' : '📄',
    name: u.name, type: u.type, protected: false,
  }))
  const items = [...baseItems, ...extraItems]
  const SIDEBAR = [
    { label: '📌 Recent',    path: '/home/mahesh' },
    { label: '🏠 Home',      path: '/home/mahesh' },
    { label: '🖥️ Desktop',   path: '/home/mahesh/Desktop' },
    { label: '📄 Documents', path: '/home/mahesh/Documents' },
    { label: '⬇️ Downloads', path: '/home/mahesh/Downloads' },
    { label: '🗑️ Trash',     path: '/home/mahesh' },
  ]

  const tryDelete = (item: typeof items[0]) => {
    if (item.protected) { showNotify('🔒 Portfolio files cannot be deleted.'); return }
    setUserItems(u => u.filter(x => !(x.path === path && x.name === item.name)))
    showNotify(`Deleted '${item.name}'`)
  }

  const createNew = (type: 'file' | 'dir') => {
    if (!newName.trim()) return
    if (PROTECTED.some(p => newName.includes(p))) { showNotify('Name conflicts with protected file.'); return }
    setUserItems(u => [...u, { path, name: newName.trim(), type }])
    setNewName(''); setMaking(false)
    showNotify(`Created '${newName.trim()}'`)
  }

  return (
    <div className="h-full flex flex-col" style={{ background: '#2d2d2d' }}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-white/10 shrink-0" style={{ background: '#3c3b37' }}>
        <button onClick={() => { setPath('/home/mahesh'); setSel('') }} className="text-gray-300 hover:text-white text-xs px-2 py-1 rounded hover:bg-white/10">⬅</button>
        <div className="flex-1 bg-black/30 rounded px-2 py-0.5 text-xs text-gray-300 font-mono truncate">{path}</div>
        <button onClick={() => setMaking(m => !m)} className="text-xs text-green-400 hover:text-green-300 px-2 py-1 rounded hover:bg-white/10 border border-green-800">+ New</button>
        <button onClick={() => setView(v => v === 'grid' ? 'list' : 'grid')} className="text-gray-300 hover:text-white text-xs px-2 py-1 rounded hover:bg-white/10">
          {view === 'grid' ? '☰' : '⊞'}
        </button>
      </div>

      {/* New file/folder bar */}
      {making && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10 bg-black/20">
          <input value={newName} onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') createNew('file') }}
            placeholder="filename.txt or folder/" autoFocus
            className="flex-1 bg-black/40 border border-white/20 rounded px-2 py-1 text-xs text-white font-mono outline-none focus:border-green-500" />
          <button onClick={() => createNew('file')} className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 rounded hover:bg-white/10">📄 File</button>
          <button onClick={() => createNew('dir')}  className="text-xs text-yellow-400 hover:text-yellow-300 px-2 py-1 rounded hover:bg-white/10">📁 Folder</button>
          <button onClick={() => setMaking(false)}  className="text-xs text-gray-500 px-2 py-1">✕</button>
        </div>
      )}

      {/* Notification */}
      {notify && (
        <div className="text-xs text-center py-1 font-mono"
          style={{ background: notify.includes('🔒') ? 'rgba(200,50,50,0.3)' : 'rgba(50,150,50,0.3)', color: notify.includes('🔒') ? '#ff8080' : '#80ff80' }}>
          {notify}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-36 shrink-0 border-r border-white/10 overflow-y-auto" style={{ background: '#252525' }}>
          {SIDEBAR.map(s => (
            <div key={s.label} onClick={() => { setPath(s.path); setSel('') }}
              className={'text-xs px-2 py-1.5 hover:bg-white/10 cursor-pointer truncate ' + (path === s.path ? 'text-white bg-white/5' : 'text-gray-400')}>
              {s.label}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-3">
          {items.length === 0 && (
            <div className="text-center text-gray-600 text-xs font-mono mt-8">
              Empty folder — click "+ New" to create files
            </div>
          )}
          {view === 'grid' ? (
            <div className="grid grid-cols-4 gap-2">
              {items.map(item => (
                <div key={item.name}
                  onClick={() => setSel(item.name)}
                  onDoubleClick={() => { if (item.type === 'dir') setPath(path + '/' + item.name) }}
                  onContextMenu={e => { e.preventDefault(); if (!item.protected) tryDelete(item) }}
                  className={'flex flex-col items-center gap-1 p-2 rounded cursor-pointer transition-colors text-center relative ' +
                    (selected === item.name ? 'bg-blue-600/40' : 'hover:bg-white/10')}>
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-xs text-gray-200 truncate w-full">{item.name}</span>
                  {item.protected && <span className="absolute top-1 right-1 text-[8px] text-yellow-600">🔒</span>}
                </div>
              ))}
            </div>
          ) : (
            <table className="w-full text-xs text-gray-300 font-mono">
              <thead><tr className="border-b border-white/10 text-gray-500 text-left">
                <th className="pb-1 pl-1 w-6" /><th className="pb-1">Name</th><th className="pb-1">Type</th><th className="pb-1">Size</th><th className="pb-1" />
              </tr></thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.name}
                    onClick={() => setSel(item.name)}
                    onDoubleClick={() => { if (item.type === 'dir') setPath(path + '/' + item.name) }}
                    className={'cursor-pointer ' + (selected === item.name ? 'bg-blue-600/30' : 'hover:bg-white/5')}>
                    <td className="py-0.5">{item.icon}</td>
                    <td className="py-0.5 pl-1.5">{item.name}</td>
                    <td className="py-0.5 text-gray-500 capitalize">{item.type}</td>
                    <td className="py-0.5 text-gray-500">{(item as { size?: string }).size ?? '—'}</td>
                    <td className="py-0.5 text-right pr-1">
                      {!item.protected && (
                        <button onClick={e => { e.stopPropagation(); tryDelete(item) }}
                          className="text-red-700 hover:text-red-400 text-xs transition-colors">✕</button>
                      )}
                      {item.protected && <span className="text-yellow-700 text-[10px]">🔒</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="px-3 py-1 text-xs text-gray-500 border-t border-white/10 shrink-0 font-mono flex justify-between" style={{ background: '#252525' }}>
        <span>{items.length} items{selected ? ` · "${selected}" selected` : ''}</span>
        <span className="text-yellow-700 text-[10px]">🔒 = protected</span>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════ TEXT EDITOR */
function TextEditor() {
  const DEFAULT_FILES = [
    { name: 'README.md', content: `# Jidugu Sri Sai Mahesh\n## ECE Student & Embedded Systems Engineer\n\n### Projects\n- Fire Surveillance Bot\n- AI Recycling Vending Machine\n- Coastal Behaviour DL Framework\n\n### Contact\njsrisaimahesh@gmail.com`, editable: false },
    { name: 'skills.txt', content: `C · C++ · Python\nESP32 · Arduino · Particle Photon\nMQTT · Bluetooth · Firebase\nPCB Design · Firmware Dev`, editable: false },
    { name: 'notes.txt', content: `# My Notes\n\nTODO:\n[ ] Update portfolio\n[ ] Apply for internships\n[ ] Push coastal model to prod\n\nIdeas:\n- Smart irrigation ESP32\n- Federated learning edge devices`, editable: true },
  ]
  const [tabs,       setTabs]    = useState(DEFAULT_FILES)
  const [activeTab,  setActive]  = useState(0)
  const [contents,   setContents]= useState(DEFAULT_FILES.map(f => f.content))
  const [newTabName, setNewTabName] = useState('')
  const [creating,   setCreating]= useState(false)

  const addTab = () => {
    if (!newTabName.trim()) return
    const name = newTabName.trim().endsWith('.txt') ? newTabName.trim() : newTabName.trim() + '.txt'
    setTabs(t => [...t, { name, content: '', editable: true }])
    setContents(c => [...c, ''])
    setActive(tabs.length)
    setNewTabName(''); setCreating(false)
  }

  const saveFile = () => {
    const blob = new Blob([contents[activeTab]], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a'); a.href = url; a.download = tabs[activeTab].name; a.click()
    URL.revokeObjectURL(url)
  }

  const [menuOpen, setMenuOpen] = useState<string | null>(null)

  const menuOptions: Record<string, { label: string; action: () => void }[]> = {
    File: [
      { label: 'New File', action: () => { setNewTabName(''); setCreating(true) } },
      { label: 'Save', action: saveFile },
      { label: 'Close Tab', action: () => setTabs(t => t.filter((_, i) => i !== activeTab)) },
    ],
    Edit: [
      { label: 'Undo (Ctrl+Z)', action: () => { } },
      { label: 'Redo (Ctrl+Y)', action: () => { } },
      { label: 'Find (Ctrl+F)', action: () => { } },
      { label: 'Replace (Ctrl+H)', action: () => { } },
    ],
    View: [
      { label: 'Word Wrap', action: () => { } },
      { label: 'Zen Mode', action: () => { } },
      { label: 'Toggle Line Numbers', action: () => { } },
    ],
    Help: [
      { label: 'About', action: () => { setContents([...contents.slice(0, activeTab), 'Text Editor v1.0\nA simple notepad for Mahesh-OS', ...contents.slice(activeTab + 1)]) } },
      { label: 'Keyboard Shortcuts', action: () => setContents([...contents.slice(0, activeTab), 'Ctrl+S: Save\nCtrl+N: New File\nCtrl+Q: Quit', ...contents.slice(activeTab + 1)]) },
    ],
  }

  return (
    <div className="h-full flex flex-col" style={{ background: '#1e1e1e' }}>
      {/* Menu */}
      <div className="flex gap-3 px-3 py-1 text-xs text-gray-400 border-b border-white/10 shrink-0 relative" style={{ background: '#2d2d2d' }}>
        {Object.keys(menuOptions).map(m => (
          <div key={m} className="relative group">
            <button onClick={() => setMenuOpen(menuOpen === m ? null : m)}
              className={'cursor-pointer hover:text-white relative ' + (menuOpen === m ? 'text-white text-orange-400' : '')}>
              {m}
              {menuOpen === m && (
                <div className="absolute top-5 left-0 bg-[#2d2d2d] border border-white/10 rounded shadow-lg z-50 min-w-max">
                  {menuOptions[m].map((opt, i) => (
                    <button key={i} onClick={() => { opt.action(); setMenuOpen(null) }}
                      className="block w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-white/10 hover:text-white whitespace-nowrap">
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </button>
          </div>
        ))}
        <button onClick={saveFile} className="ml-auto text-green-600 hover:text-green-400 text-xs">⬇ Save</button>
      </div>
      {/* Tabs */}
      <div className="flex border-b border-white/10 shrink-0 overflow-x-auto" style={{ background: '#252526' }}>
        {tabs.map((f, i) => (
          <button key={f.name} onClick={() => setActive(i)}
            className={'px-3 py-1.5 text-xs whitespace-nowrap border-r border-white/10 transition-colors ' +
              (activeTab === i ? 'text-white border-t-2 border-t-blue-500 bg-[#1e1e1e]' : 'text-gray-400 hover:text-gray-200')}>
            {f.name}{f.editable ? '' : ' 🔒'}
          </button>
        ))}
        {creating ? (
          <div className="flex items-center gap-1 px-2">
            <input value={newTabName} onChange={e => setNewTabName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addTab(); if (e.key === 'Escape') setCreating(false) }}
              autoFocus placeholder="filename.txt"
              className="w-24 bg-black/40 border border-white/20 rounded px-1 py-0.5 text-xs text-white outline-none focus:border-blue-500" />
            <button onClick={addTab} className="text-xs text-blue-400">✓</button>
            <button onClick={() => setCreating(false)} className="text-xs text-gray-500">✕</button>
          </div>
        ) : (
          <button onClick={() => setCreating(true)} className="px-3 text-gray-500 hover:text-green-400 text-xs">+ New</button>
        )}
      </div>
      {/* Editor */}
      <div className="flex flex-1 overflow-hidden">
        <div className="w-10 text-right pr-2 pt-2 text-xs text-gray-600 overflow-hidden shrink-0 select-none font-mono leading-5" style={{ background: '#1e1e1e' }}>
          {contents[activeTab].split('\n').map((_, i) => <div key={i}>{i + 1}</div>)}
        </div>
        {tabs[activeTab]?.editable ? (
          <textarea className="flex-1 bg-transparent text-gray-200 font-mono text-xs p-2 resize-none outline-none leading-5"
            value={contents[activeTab]}
            onChange={e => { const n = [...contents]; n[activeTab] = e.target.value; setContents(n) }} />
        ) : (
          <div className="flex-1 overflow-auto p-2">
            <pre className="text-gray-400 font-mono text-xs leading-5 whitespace-pre-wrap">{contents[activeTab]}</pre>
            <div className="text-xs text-yellow-700 mt-2 font-mono">🔒 Read-only file</div>
          </div>
        )}
      </div>
      <div className="px-3 py-0.5 text-xs text-white/60 border-t border-white/10 shrink-0 flex justify-between"
        style={{ background: '#007acc' }}>
        <span>{tabs[activeTab]?.name}</span>
        <span>Ln {contents[activeTab].split('\n').length} · UTF-8</span>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════ PHOTO VIEWER */
const ASCII_CHARS = '@#S%?*+;:,. '
const CANVAS_W = 80, CANVAS_H = 50

function PhotoViewerApp() {
  const [mode,   setMode]   = useState<'ascii' | 'pixel' | 'original'>('ascii')
  const [ascii,  setAscii]  = useState<string[]>([])
  const [pixels, setPixels] = useState<{ r:number;g:number;b:number }[][]>([])
  const [dataUrl,setDataUrl]= useState('')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const stored = resolvePhotoUrl()
    setDataUrl(stored)
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = CANVAS_W; canvas.height = CANVAS_H
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, CANVAS_W, CANVAS_H)
      const data = ctx.getImageData(0, 0, CANVAS_W, CANVAS_H).data
      const lines: string[] = []
      const grid: { r:number;g:number;b:number }[][] = []
      for (let r = 0; r < CANVAS_H; r++) {
        let line = ''
        const row: { r:number;g:number;b:number }[] = []
        for (let c = 0; c < CANVAS_W; c++) {
          const i = (r * CANVAS_W + c) * 4
          const lum = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2]
          line += ASCII_CHARS[ASCII_CHARS.length - 1 - Math.floor((lum / 255) * (ASCII_CHARS.length - 1))]
          row.push({ r: data[i], g: data[i+1], b: data[i+2] })
        }
        lines.push(line); grid.push(row)
      }
      setAscii(lines); setPixels(grid); setLoaded(true)
    }
    img.src = stored
  }, [])

  if (!loaded) return (
    <div className="h-full flex flex-col items-center justify-center gap-4" style={{ background: '#1e1e1e' }}>
      <div className="text-5xl">📷</div>
      <div className="text-sm text-gray-400 font-mono">No photo uploaded yet</div>
      <div className="text-xs text-gray-600 font-mono text-center max-w-xs">
        <p>To add your photo:</p>
        <p>1. Visit the Admin panel (/admin)</p>
        <p>2. Go to the Photo section</p>
        <p>3. Upload your photo</p>
        <p className="mt-2">Your photo will appear here once uploaded and will be visible to all visitors.</p>
      </div>
    </div>
  )

  return (
    <div className="h-full flex flex-col" style={{ background: '#1e1e1e' }}>
      <div className="flex gap-1 p-2 border-b border-white/10 shrink-0" style={{ background: '#252525' }}>
        {(['ascii', 'pixel', 'original'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={'text-xs font-mono px-3 py-1 rounded transition-all ' +
              (mode === m ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10')}>
            {m.toUpperCase()}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-600 font-mono self-center">{CANVAS_W}×{CANVAS_H}</span>
      </div>
      <div className="flex-1 overflow-auto flex items-center justify-center p-2">
        {mode === 'ascii' && (
          <pre className="text-green-400 leading-none select-none"
            style={{ fontSize: '7px', letterSpacing: '0.5px', lineHeight: '1.08' }}>
            {ascii.join('\n')}
          </pre>
        )}
        {mode === 'pixel' && (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${CANVAS_W},6px)`, gridTemplateRows: `repeat(${CANVAS_H},6px)`, gap: 0 }}>
            {pixels.map((row, ri) => row.map((px, ci) => (
              <div key={`${ri}-${ci}`} style={{ width: 6, height: 6, background: `rgb(${px.r},${px.g},${px.b})` }} />
            )))}
          </div>
        )}
        {mode === 'original' && (
          <img src={dataUrl} alt="Mahesh" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        )}
      </div>
      <div className="px-3 py-1 text-xs text-gray-600 font-mono border-t border-white/10 shrink-0 text-center" style={{ background: '#252525' }}>
        {mode === 'ascii' ? 'ASCII art — 80×50 grid' : mode === 'pixel' ? 'Pixel art — 80×50 (6px each)' : 'Original'}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════ BROWSER */
function BrowserApp() {
  const router  = useRouter()
  const [url,   setUrl]    = useState('mahesh://home')
  const [input, setInput]  = useState('mahesh://home')
  const [back,  setBack]   = useState<string[]>([])
  const [fwd,   setFwd]    = useState<string[]>([])

  const navigate = (to: string) => {
    setBack(b => [...b, url])
    setFwd([]); setUrl(to); setInput(to)
  }
  const goBack = () => {
    if (!back.length) return
    const prev = back[back.length - 1]
    setFwd(f => [...f, url]); setBack(b => b.slice(0,-1)); setUrl(prev); setInput(prev)
  }
  const goFwd = () => {
    if (!fwd.length) return
    const next = fwd[fwd.length - 1]
    setBack(b => [...b, url]); setFwd(f => f.slice(0,-1)); setUrl(next); setInput(next)
  }

  // Attempt to embed real external URLs (will be limited by CORS but shows intent)
  const isExternal = url.startsWith('http://') || url.startsWith('https://')

  const pages: Record<string, React.ReactNode> = {
    'mahesh://home': (
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="text-4xl">🌐</div>
          <div><div className="text-white font-bold">Mahesh Browser</div><div className="text-gray-500 text-xs">mahesh://home</div></div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon:'🚀', label:'Portfolio',  url:'mahesh://portfolio' },
            { icon:'📂', label:'Projects',   url:'mahesh://projects'  },
            { icon:'👤', label:'About',      url:'mahesh://about'     },
            { icon:'📧', label:'Contact',    url:'mahesh://contact'   },
            { icon:'🔗', label:'GitHub',     url:'https://github.com' },
            { icon:'💼', label:'LinkedIn',   url:'https://linkedin.com' },
          ].map(b => (
            <button key={b.label} onClick={() => navigate(b.url)}
              className="flex flex-col items-center gap-1.5 p-3 rounded-lg hover:bg-white/10 transition-colors border border-white/5">
              <span className="text-2xl">{b.icon}</span>
              <span className="text-xs text-gray-300">{b.label}</span>
            </button>
          ))}
        </div>
      </div>
    ),
    'mahesh://portfolio': (
      <div className="p-5 space-y-3 font-mono text-sm">
        <div className="text-2xl font-bold text-green-400">Jidugu Sri Sai Mahesh</div>
        <div className="text-gray-400 text-xs">ECE Student & Embedded Systems Engineer</div>
        <div className="grid grid-cols-2 gap-2 mt-3">
          {[['04','Projects','text-green-400'],['02','Internships','text-yellow-400'],['01','Paper','text-cyan-400'],['8.30','GPA','text-blue-400']].map(([v,l,c])=>(
            <div key={l} className="border border-white/10 rounded p-3 text-center">
              <div className={`text-xl font-bold ${c}`}>{v}</div>
              <div className="text-xs text-gray-500 mt-1">{l}</div>
            </div>
          ))}
        </div>
        <button onClick={() => router.push('/view')} className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded text-white text-xs transition-colors">
          Open Full Portfolio →
        </button>
      </div>
    ),
    'mahesh://projects': (
      <div className="p-4 space-y-2 font-mono text-sm">
        {[
          ['Fire Surveillance Bot', 'ESP32 · Deep Learning · MQTT', 'PUBLISHED', 'text-green-400'],
          ['AI Recycling Vending Machine', 'CV · IoT · Firebase', 'DEPLOYED', 'text-yellow-400'],
          ['Coastal Behaviour DL Framework', 'Python · DeepONet · NumPy', 'RESEARCH', 'text-cyan-400'],
          ['Tropoleap Embedded Systems', 'ESP32 · Firmware · PCB', 'IN PROGRESS', 'text-gray-400'],
        ].map(([name,stack,status,c]) => (
          <div key={name} className="border border-white/10 rounded p-3 hover:border-white/20 transition-colors">
            <div className={`font-bold text-xs ${c}`}>{name}</div>
            <div className="text-xs text-gray-500 mt-1">{stack}</div>
            <span className={`text-xs ${c}`}>[{status}]</span>
          </div>
        ))}
      </div>
    ),
    'mahesh://about': (
      <div className="p-5 space-y-3 font-mono text-sm">
        <div className="text-lg font-bold text-white">About Mahesh</div>
        {[['Name','Jidugu Sri Sai Mahesh'],['Role','ECE Student & Embedded Systems Engineer'],['College','B.V. Raju Institute of Technology, Narsapur'],['GPA','8.30 / 10.0'],['Internships','IIT Bhubaneswar (Research), Tropoleap (Industry)']].map(([k,v])=>(
          <div key={k} className="flex gap-2 text-xs">
            <span className="text-green-400 w-24 shrink-0">{k}:</span>
            <span className="text-gray-300">{v}</span>
          </div>
        ))}
      </div>
    ),
    'mahesh://contact': (
      <div className="p-5 space-y-3 font-mono">
        {[['✉','Email','jsrisaimahesh@gmail.com'],['☎','Phone','+91 8008060605'],['💼','LinkedIn','linkedin.com/in/jsrisaimahesh']].map(([ic,lb,vl])=>(
          <div key={lb} className="flex items-center gap-3 border border-white/10 rounded p-3">
            <span className="text-xl">{ic}</span>
            <div><div className="text-xs text-gray-500">{lb}</div><div className="text-green-400 text-sm">{vl}</div></div>
          </div>
        ))}
      </div>
    ),
  }

  return (
    <div className="h-full flex flex-col" style={{ background: '#1e1e1e' }}>
      {/* Toolbar */}
      <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-white/10 shrink-0" style={{ background: '#2d2d2d' }}>
        <button onClick={goBack} disabled={!back.length} className="text-gray-400 hover:text-white disabled:opacity-30 px-1.5 py-1 rounded hover:bg-white/10 text-sm">◀</button>
        <button onClick={goFwd}  disabled={!fwd.length}  className="text-gray-400 hover:text-white disabled:opacity-30 px-1.5 py-1 rounded hover:bg-white/10 text-sm">▶</button>
        <button onClick={() => { setUrl(url) }} className="text-gray-400 hover:text-white px-1.5 py-1 rounded hover:bg-white/10 text-sm">⟳</button>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') navigate(input) }}
          className="flex-1 bg-black/30 rounded px-2 py-0.5 text-xs text-gray-200 font-mono outline-none border border-white/10 focus:border-blue-500" />
        <button onClick={() => navigate(input)} className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-white/10">Go</button>
      </div>
      {/* Bookmarks */}
      <div className="flex gap-1 px-2 py-1 border-b border-white/10 overflow-x-auto shrink-0" style={{ background: '#252525' }}>
        {['mahesh://home','mahesh://portfolio','mahesh://projects','mahesh://contact'].map(p => (
          <button key={p} onClick={() => navigate(p)}
            className={'text-xs font-mono px-2 py-0.5 rounded whitespace-nowrap transition-colors ' +
              (url === p ? 'bg-blue-600/40 text-blue-300' : 'text-gray-500 hover:text-gray-300 hover:bg-white/10')}>
            {p.replace('mahesh://','')}
          </button>
        ))}
      </div>
      {/* Content */}
      <div className="flex-1 overflow-auto" style={{ background: '#1a1a2e', color: '#d4d4d4' }}>
        {isExternal ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center p-6">
            <div className="text-4xl">🔗</div>
            <div className="text-white font-mono text-sm font-bold">{url}</div>
            <div className="text-gray-500 text-xs font-mono">External sites can't be embedded here due to browser security.</div>
            <a href={url} target="_blank" rel="noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 border border-blue-800 px-4 py-2 rounded transition-colors">
              Open in real browser →
            </a>
          </div>
        ) : (
          pages[url] ?? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-500 font-mono text-sm">
              <div className="text-4xl">🌐</div>
              <div>Page not found: {url}</div>
              <div className="text-xs">Try: mahesh://home · mahesh://portfolio</div>
            </div>
          )
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════ ABOUT */
function AboutApp() {
  return (
    <div className="h-full overflow-auto p-6 space-y-4 font-mono text-sm" style={{ background: '#1e1e1e', color: '#d4d4d4' }}>
      <div className="text-center space-y-2 pb-4 border-b border-white/10">
        <div className="text-5xl">🐧</div>
        <div className="text-xl font-bold text-white">Ubuntu 22.04.3 LTS</div>
        <div className="text-gray-400 text-xs">Jammy Jellyfish</div>
      </div>
      <div className="space-y-2">
        {[['OS','Ubuntu 22.04.3 LTS'],['Kernel','5.15.0-91-generic'],['Arch','x86_64'],['Desktop','GNOME 42.5'],['Shell','bash 5.1.16'],['User','mahesh'],['RAM','8 GB'],['CPU','Intel Core i7-12700H'],['Storage','512 GB NVMe SSD'],['GPU','NVIDIA GTX 1650 Ti']].map(([k,v]) => (
          <div key={k} className="flex gap-2 text-xs">
            <span className="text-green-400 w-20 shrink-0">{k}:</span>
            <span className="text-gray-300">{v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════ SETTINGS */
function SettingsApp({ onWallpaper }: { onWallpaper: () => void }) {
  const [section, setSec]    = useState('Appearance')
  const [dark,    setDark]   = useState(true)
  const [notif,   setNotif]  = useState(true)
  const [wifi,    setWifi]   = useState(true)
  const [bt,      setBt]     = useState(false)
  const [vol,     setVol]    = useState(75)
  const [bright,  setBright] = useState(80)
  const SECTIONS = ['Appearance','Notifications','Network','Bluetooth','Sound','Display','Users','About']

  const Toggle = ({ v, set }: { v: boolean; set: (x: boolean) => void }) => (
    <button onClick={() => set(!v)} className={'relative w-10 h-5 rounded-full transition-colors ' + (v ? 'bg-green-500' : 'bg-gray-600')}>
      <span className={'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ' + (v ? 'translate-x-5' : 'translate-x-0.5')} />
    </button>
  )

  return (
    <div className="h-full flex" style={{ background: '#2d2d2d' }}>
      <div className="w-44 shrink-0 border-r border-white/10 overflow-y-auto" style={{ background: '#252525' }}>
        {SECTIONS.map(s => (
          <div key={s} onClick={() => setSec(s)}
            className={'text-xs px-3 py-2 cursor-pointer transition-colors ' + (section === s ? 'bg-blue-600/40 text-white' : 'text-gray-300 hover:bg-white/10')}>
            {s}
          </div>
        ))}
      </div>
      <div className="flex-1 p-5 overflow-auto space-y-4 text-sm text-gray-200">
        <h2 className="text-base font-bold text-white">{section}</h2>
        {section === 'Appearance' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between"><span>Dark Mode</span><Toggle v={dark} set={setDark} /></div>
            <div className="mt-3">
              <div className="text-xs text-gray-400 mb-2">Wallpaper</div>
              <button onClick={onWallpaper} className="text-xs bg-blue-600/30 hover:bg-blue-600/50 border border-blue-800 text-blue-300 px-3 py-1.5 rounded transition-colors">
                🎨 Change Wallpaper
              </button>
            </div>
          </div>
        )}
        {section === 'Notifications' && <div className="flex items-center justify-between"><span>Notifications</span><Toggle v={notif} set={setNotif} /></div>}
        {section === 'Network'       && <div className="flex items-center justify-between"><span>Wi-Fi</span><Toggle v={wifi} set={setWifi} /></div>}
        {section === 'Bluetooth'     && <div className="flex items-center justify-between"><span>Bluetooth</span><Toggle v={bt} set={setBt} /></div>}
        {section === 'Sound'   && <div className="flex items-center gap-3"><span className="w-24 text-xs">Volume</span><input type="range" min={0} max={100} value={vol} onChange={e => setVol(+e.target.value)} className="flex-1 accent-blue-500" /><span className="text-xs w-8">{vol}%</span></div>}
        {section === 'Display' && <div className="flex items-center gap-3"><span className="w-24 text-xs">Brightness</span><input type="range" min={0} max={100} value={bright} onChange={e => setBright(+e.target.value)} className="flex-1 accent-blue-500" /><span className="text-xs w-8">{bright}%</span></div>}
        {section === 'Users'   && <div className="text-sm">mahesh <span className="text-xs text-gray-500">(Administrator)</span></div>}
        {section === 'About'   && <div className="text-xs text-gray-400 space-y-1"><div>Ubuntu 22.04.3 LTS</div><div>GNOME 42.5</div><div>Powered by Mahesh-OS</div></div>}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════ APP DEFS */
interface AppDef {
  id: AppId; icon: string; label: string; title: string
  w: number; h: number; x: number; y: number
}

const APP_DEFS: AppDef[] = [
  { id:'terminal', icon:'🖥️', label:'Terminal',     title:'Terminal — bash',          w:640, h:420, x:60,  y:50  },
  { id:'files',    icon:'📂', label:'Files',         title:'Files — /home/mahesh',    w:600, h:400, x:100, y:80  },
  { id:'editor',   icon:'📝', label:'Editor',        title:'Text Editor',             w:580, h:440, x:140, y:70  },
  { id:'photos',   icon:'🖼️', label:'Photo Viewer',  title:'Photo Viewer',            w:560, h:440, x:180, y:60  },
  { id:'browser',  icon:'🌐', label:'Browser',       title:'Mahesh Browser',          w:600, h:420, x:120, y:80  },
  { id:'about',    icon:'🐧', label:'About Ubuntu',  title:'About This Computer',     w:360, h:420, x:300, y:100 },
  { id:'settings', icon:'⚙️', label:'Settings',      title:'System Settings',         w:540, h:400, x:160, y:90  },
]

const WALLPAPERS = [
  'linear-gradient(135deg,#1a1a2e 0%,#16213e 40%,#0f3460 100%)',
  'linear-gradient(135deg,#0d1b0a 0%,#1a3a12 50%,#0a2008 100%)',
  'linear-gradient(160deg,#0f0c29 0%,#302b63 50%,#24243e 100%)',
  'linear-gradient(135deg,#200122 0%,#6f0000 100%)',
  'linear-gradient(to bottom right,#0f2027 0%,#203a43 50%,#2c5364 100%)',
  'radial-gradient(ellipse at 30% 40%,#1e0533 0%,#0d1020 60%,#050810 100%)',
]

/* ══════════════════════════════════════════════════════════ MAIN DESKTOP */
interface Props { onClose: () => void }

export default function UbuntuDesktop({ onClose }: Props) {
  const router = useRouter()
  const [windows,   setWindows]  = useState<WinState[]>(
    APP_DEFS.map(a => ({ id: a.id, x: a.x, y: a.y, w: a.w, h: a.h, maximized: false }))
  )
  const [openWins,  setOpenWins] = useState<Set<AppId>>(new Set<AppId>(['terminal']))
  const [zOrder,    setZOrder]   = useState<AppId[]>(['terminal'])
  const [minimized, setMinimized]= useState<Set<AppId>>(new Set<AppId>())
  const [wallpaper, setWallpaper]= useState(0)
  const [appMenu,   setAppMenu]  = useState(false)
  const [sysMenu,   setSysMenu]  = useState(false)
  const [search,    setSearch]   = useState('')
  const [notify,    setNotify]   = useState<string | null>('Welcome to Mahesh-OS 🐧')

  const photoUrl = resolvePhotoUrl()

  useEffect(() => {
    if (notify) { const id = setTimeout(() => setNotify(null), 3500); return () => clearTimeout(id) }
  }, [notify])

  const showNotify = (msg: string) => setNotify(msg)
  const nextWall   = () => { setWallpaper(w => (w + 1) % WALLPAPERS.length); showNotify('Wallpaper changed!') }

  /* Window management */
  const openApp = useCallback((id: AppId) => {
    setOpenWins(p => new Set<AppId>(Array.from(p).concat(id)))
    setMinimized(p => new Set<AppId>(Array.from(p).filter(x => x !== id)))
    setZOrder(p => [...p.filter(x => x !== id), id])
    setAppMenu(false); setSearch('')
  }, [])

  const closeApp = useCallback((id: string) => {
    const aid = id as AppId
    setOpenWins(p => new Set<AppId>(Array.from(p).filter(x => x !== aid)))
    setZOrder(p => p.filter(x => x !== aid))
  }, [])

  const focusApp = useCallback((id: string) => {
    const aid = id as AppId
    setZOrder(p => [...p.filter(x => x !== aid), aid])
  }, [])

  const minimizeApp = useCallback((id: string) => {
    const aid = id as AppId
    setMinimized(p => new Set<AppId>(Array.from(p).concat(aid)))
  }, [])

  const toggleMax = useCallback((id: string) => {
    setWindows(ws => ws.map(w => w.id === id ? { ...w, maximized: !w.maximized } : w))
    focusApp(id)
  }, [focusApp])

  const moveWin   = useCallback((id: string, x: number, y: number) =>
    setWindows(ws => ws.map(w => w.id === id ? { ...w, x, y } : w)), [])
  const resizeWin = useCallback((id: string, nw: number, nh: number) =>
    setWindows(ws => ws.map(w => w.id === id ? { ...w, w: nw, h: nh } : w)), [])

  const toggleMinFromDock = (id: AppId) => {
    if (minimized.has(id)) {
      setMinimized(p => new Set<AppId>(Array.from(p).filter(x => x !== id)))
      setZOrder(p => [...p.filter(x => x !== id), id])
    } else {
      minimizeApp(id)
    }
  }

  const getZ = (id: AppId) => zOrder.indexOf(id) + 100
  const filteredApps = APP_DEFS.filter(a => !search || a.label.toLowerCase().includes(search.toLowerCase()))

  /* Render app content */
  const renderApp = (id: AppId) => {
    if (id === 'terminal') return <TerminalApp />
    if (id === 'files')    return <FilesApp />
    if (id === 'editor')   return <TextEditor />
    if (id === 'photos')   return <PhotoViewerApp />
    if (id === 'browser')  return <BrowserApp />
    if (id === 'about')    return <AboutApp />
    if (id === 'settings') return <SettingsApp onWallpaper={nextWall} />
    return null
  }

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: WALLPAPERS[wallpaper], cursor: 'default' }}
      onClick={() => { setAppMenu(false); setSysMenu(false) }}>

      {/* ── Toast notification ── */}
      {notify && (
        <div className="absolute top-9 right-3 z-[9999] max-w-xs px-4 py-2.5 rounded-lg shadow-2xl text-sm text-white"
          style={{ background: 'rgba(40,40,40,0.97)', border: '1px solid rgba(255,255,255,0.15)' }}>
          {notify}
        </div>
      )}

      {/* ── Desktop icons ── */}
      <div className="absolute top-10 left-3 flex flex-col gap-2 pt-2">
        {APP_DEFS.map(app => (
          <div key={app.id} onDoubleClick={() => openApp(app.id)}
            className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white/10 cursor-pointer w-16 transition-all group">
            <span className="text-3xl group-hover:scale-110 transition-transform leading-none">{app.icon}</span>
            <span className="text-white text-[10px] text-center leading-tight drop-shadow-lg">{app.label}</span>
          </div>
        ))}
        <div onDoubleClick={() => router.push('/view')}
          className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white/10 cursor-pointer w-16 group">
          <span className="text-3xl group-hover:scale-110 transition-transform leading-none">🚀</span>
          <span className="text-white text-[10px] text-center leading-tight drop-shadow-lg">Portfolio</span>
        </div>
      </div>

      {/* ── Windows ── */}
      {APP_DEFS.map(app => {
        if (!openWins.has(app.id)) return null
        const ws = windows.find(w => w.id === app.id)!
        return (
          <AppWindow key={app.id} id={app.id} title={app.title} icon={app.icon}
            winState={ws} zIndex={getZ(app.id)} minimized={minimized.has(app.id)}
            onClose={closeApp} onFocus={focusApp}
            onMinimize={minimizeApp} onToggleMax={toggleMax}
            onMove={moveWin} onResize={resizeWin}>
            {renderApp(app.id)}
          </AppWindow>
        )
      })}

      {/* ── Top bar ── */}
      <div className="absolute top-0 left-0 right-0 h-7 flex items-center px-3 gap-3 text-white text-sm z-[8999]"
        style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(10px)' }}
        onClick={e => e.stopPropagation()}>

        <button onClick={() => { setAppMenu(m => !m); setSysMenu(false) }}
          className={'font-semibold transition-colors text-sm ' + (appMenu ? 'text-orange-300' : 'hover:text-orange-300')}>
          Activities
        </button>
        <span className="text-white/20">|</span>
        <div className="flex items-center gap-2">
          {photoUrl ? (
            <img src={photoUrl} alt="mahesh" className="w-5 h-5 rounded-full object-cover border border-orange-400" style={{ objectPosition: 'center 18%' }} />
          ) : (
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-xs font-bold text-white">M</div>
          )}
          <span className="text-orange-300 text-xs font-medium">mahesh@ubuntu</span>
        </div>
        <div className="flex-1 flex justify-center"><Clock /></div>
        <div className="flex items-center gap-2 text-xs relative">
          <span>📶</span><span>🔊</span><span>🔋</span>
          <button onClick={() => { setSysMenu(m => !m); setAppMenu(false) }}
            className={'transition-colors text-base ml-1 ' + (sysMenu ? 'text-orange-300' : 'hover:text-orange-300')}>⏻</button>

          {sysMenu && (
            <div className="absolute right-0 top-7 w-56 rounded-xl overflow-hidden shadow-2xl z-[9999]"
              style={{ background: 'rgba(32,32,32,0.98)', border: '1px solid rgba(255,255,255,0.15)' }}
              onClick={e => e.stopPropagation()}>
              {/* Profile */}
              {photoUrl && (
                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
                  <img src={photoUrl} alt="mahesh" className="w-9 h-9 rounded-full object-cover border-2 border-orange-400" style={{ objectPosition: 'center 18%' }} />
                  <div><div className="font-semibold text-sm">mahesh</div><div className="text-xs text-gray-400">jsrisaimahesh@gmail.com</div></div>
                </div>
              )}
              {!photoUrl && (
                <div className="px-4 py-3 border-b border-white/10">
                  <div className="font-semibold text-sm">mahesh</div>
                  <div className="text-xs text-gray-400">jsrisaimahesh@gmail.com</div>
                </div>
              )}
              <div className="p-1 text-sm">
                <button onClick={() => { openApp('settings'); setSysMenu(false) }} className="w-full text-left px-3 py-1.5 rounded hover:bg-white/10 text-gray-200">⚙ Settings</button>
                <button onClick={nextWall} className="w-full text-left px-3 py-1.5 rounded hover:bg-white/10 text-gray-200">🎨 Change Wallpaper</button>
                <button onClick={() => { openApp('about'); setSysMenu(false) }} className="w-full text-left px-3 py-1.5 rounded hover:bg-white/10 text-gray-200">🐧 About Ubuntu</button>
                <div className="my-1 border-t border-white/10" />
                <button onClick={onClose} className="w-full text-left px-3 py-1.5 rounded hover:bg-red-600/40 text-red-400 font-medium">⏻ Log Out…</button>
                <button onClick={() => { showNotify('Restarting…'); setTimeout(onClose, 1500) }} className="w-full text-left px-3 py-1.5 rounded hover:bg-white/10 text-gray-200">↺ Restart…</button>
                <button onClick={() => { showNotify('Powering off…'); setTimeout(onClose, 1500) }} className="w-full text-left px-3 py-1.5 rounded hover:bg-white/10 text-gray-200">⏻ Power Off…</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Activities / App Launcher ── */}
      {appMenu && (
        <div className="absolute inset-0 z-[8998] flex flex-col items-center pt-16"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)' }}
          onClick={() => setAppMenu(false)}>
          <div onClick={e => e.stopPropagation()} className="w-full max-w-2xl px-6">
            {/* Search bar */}
            <input value={search} onChange={e => setSearch(e.target.value)} autoFocus
              placeholder="Type to search apps…"
              className="w-full bg-white/10 border border-white/20 rounded-full px-5 py-2.5 text-white text-sm outline-none focus:border-orange-400 mb-8"
              style={{ backdropFilter: 'blur(10px)' }} />

            {/* Open windows row */}
            {Array.from(openWins).length > 0 && !search && (
              <div className="mb-6">
                <div className="text-xs text-gray-400 mb-3 uppercase tracking-widest font-mono">Open Windows</div>
                <div className="flex gap-3 flex-wrap">
                  {Array.from(openWins).map(id => {
                    const def = APP_DEFS.find(a => a.id === id)!
                    return (
                      <button key={id} onClick={() => { focusApp(id); if (minimized.has(id)) { setMinimized(p => new Set<AppId>(Array.from(p).filter(x => x !== id))); } setAppMenu(false) }}
                        className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-white/15 border border-white/10 transition-all w-20">
                        <span className="text-3xl leading-none">{def.icon}</span>
                        <span className="text-white text-[10px] text-center leading-tight">{def.label}</span>
                        {minimized.has(id) && <span className="text-[8px] text-yellow-400">minimized</span>}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* All apps grid */}
            <div className="text-xs text-gray-400 mb-3 uppercase tracking-widest font-mono">
              {search ? `Results for "${search}"` : 'All Applications'}
            </div>
            <div className="grid grid-cols-6 gap-3">
              {filteredApps.map(app => (
                <button key={app.id} onClick={() => openApp(app.id)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/15 transition-all group">
                  <span className="text-4xl leading-none group-hover:scale-110 transition-transform">{app.icon}</span>
                  <span className="text-white text-xs text-center leading-tight">{app.label}</span>
                </button>
              ))}
              <button onClick={() => { router.push('/view'); setAppMenu(false) }}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/15 transition-all group">
                <span className="text-4xl leading-none group-hover:scale-110 transition-transform">🚀</span>
                <span className="text-white text-xs text-center">Portfolio</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom Dock ── */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-end gap-1.5 px-4 py-2 rounded-2xl z-[8999]"
        style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>
        {APP_DEFS.map(app => {
          const isOpen = openWins.has(app.id)
          const isMin  = minimized.has(app.id)
          const isFoc  = zOrder[zOrder.length - 1] === app.id && isOpen && !isMin
          return (
            <button key={app.id} title={app.label}
              onClick={() => isOpen ? toggleMinFromDock(app.id) : openApp(app.id)}
              className="relative flex flex-col items-center group transition-all duration-150 hover:-translate-y-2">
              <span className={'text-2xl leading-none transition-all ' + (isFoc ? 'drop-shadow-[0_0_8px_rgba(255,165,0,0.9)]' : '')}>
                {app.icon}
              </span>
              {isOpen && (
                <span className={'absolute -bottom-1.5 w-1 h-1 rounded-full ' + (isMin ? 'bg-gray-500' : 'bg-white')} />
              )}
            </button>
          )
        })}

        <div className="w-px h-8 bg-white/15 mx-1" />
        <button title="Change Wallpaper" onClick={nextWall}
          className="text-xl hover:-translate-y-2 transition-transform" style={{ lineHeight: 1 }}>🎨</button>
        <button title="Portfolio" onClick={() => router.push('/view')}
          className="text-xl hover:-translate-y-2 transition-transform" style={{ lineHeight: 1 }}>🚀</button>
        <div className="w-px h-8 bg-white/15 mx-1" />
        <button onClick={onClose} className="text-xs text-gray-400 hover:text-red-400 font-mono transition-colors px-2 py-1 rounded border border-white/10 hover:border-red-500/40">
          exit
        </button>
      </div>
    </div>
  )
}
