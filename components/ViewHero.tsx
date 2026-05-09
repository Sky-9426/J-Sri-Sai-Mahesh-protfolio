'use client'

import { useState, useEffect } from 'react'
import { loadData } from '@/lib/data'
import { resolvePhotoUrl, getFallbackPhotoUrl } from '@/lib/photo'

const CANVAS_W    = 80
const CANVAS_H    = 50
const ASCII_CHARS = '@#S%?*+;:,. '

type PhotoMode = 'ascii' | 'pixel' | 'photo'

/* ── Circular photo widget ── */
function CircularPhoto() {
  const [mode,    setMode]    = useState<PhotoMode>('photo')
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [ascii,   setAscii]   = useState<string[]>([])
  const [pixels,  setPixels]  = useState<{r:number;g:number;b:number}[][]>([])
  const [loaded,  setLoaded]  = useState(false)
  const [pulse,   setPulse]   = useState(false)

  useEffect(() => {
    const stored = resolvePhotoUrl()
    setDataUrl(stored)
    
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    const loadTimeout = setTimeout(() => {
      if (!loaded) {
        // Use fallback if timeout
        setDataUrl(getFallbackPhotoUrl())
        setLoaded(true)
      }
    }, 3000)

    const processImage = (imgToProcess: HTMLImageElement) => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = CANVAS_W; canvas.height = CANVAS_H
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        
        ctx.drawImage(imgToProcess, 0, 0, CANVAS_W, CANVAS_H)
        const data = ctx.getImageData(0, 0, CANVAS_W, CANVAS_H).data
        const lines: string[] = []
        const grid: {r:number;g:number;b:number}[][] = []
        
        for (let r = 0; r < CANVAS_H; r++) {
          let line = ''
          const row: {r:number;g:number;b:number}[] = []
          for (let c = 0; c < CANVAS_W; c++) {
            const i = (r * CANVAS_W + c) * 4
            const lum = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2]
            line += ASCII_CHARS[ASCII_CHARS.length - 1 - Math.floor((lum / 255) * (ASCII_CHARS.length - 1))]
            row.push({ r: data[i], g: data[i+1], b: data[i+2] })
          }
          lines.push(line); grid.push(row)
        }
        setAscii(lines); setPixels(grid); setLoaded(true)
      } catch (e) {
        setLoaded(true)
      }
    }

    img.onload = () => {
      clearTimeout(loadTimeout)
      processImage(img)
    }
    
    img.onerror = () => {
      clearTimeout(loadTimeout)
      const fallback = new Image()
      fallback.crossOrigin = 'anonymous'
      fallback.onload = () => {
        setDataUrl(getFallbackPhotoUrl())
        processImage(fallback)
      }
      fallback.onerror = () => {
        setDataUrl(getFallbackPhotoUrl())
        setLoaded(true)
      }
      fallback.src = getFallbackPhotoUrl()
    }
    
    img.src = stored
    
    return () => clearTimeout(loadTimeout)
  }, [])

  const cycleMode = () => {
    setPulse(true)
    setTimeout(() => setPulse(false), 400)
    setMode(m => m === 'photo' ? 'ascii' : m === 'ascii' ? 'pixel' : 'photo')
  }

  if (!loaded || !dataUrl) return null

  const BORDER_COLORS: Record<PhotoMode, string> = {
    photo: 'rgba(0,255,65,0.7)',
    ascii: 'rgba(0,200,50,0.6)',
    pixel: 'rgba(52,101,164,0.8)',
  }
  const LABEL: Record<PhotoMode, string> = { photo: 'photo', ascii: 'ASCII', pixel: 'pixel' }

  return (
    <div className="absolute top-0 right-0 flex flex-col items-center gap-2 select-none">
      {/* Circular frame */}
      <button
        onClick={cycleMode}
        title={`Click to switch: ${LABEL[mode]}`}
        className="relative group cursor-pointer"
        style={{
          width: 160, height: 160,
          borderRadius: '50%',
          border: `2px solid ${BORDER_COLORS[mode]}`,
          boxShadow: `0 0 20px ${BORDER_COLORS[mode]}, 0 0 40px ${BORDER_COLORS[mode].replace('0.7','0.2')}`,
          transition: 'all 0.4s ease',
          overflow: 'hidden',
          background: '#000',
          transform: pulse ? 'scale(0.95)' : 'scale(1)',
        }}>

        {/* Photo mode */}
        {mode === 'photo' && (
          <img src={dataUrl} alt="Mahesh"
            className="w-full h-full object-cover"
            style={{ objectPosition: 'center 18%', filter: 'brightness(0.97) contrast(1.08) saturate(1.04)' }} />
        )}

        {/* ASCII mode — rendered in circle clip */}
        {mode === 'ascii' && (
          <div className="w-full h-full flex items-center justify-center overflow-hidden bg-black"
            style={{ padding: 4 }}>
            <pre style={{
              fontSize: '4.2px', lineHeight: '1.06', letterSpacing: '0.3px',
              color: '#4e9a06', fontFamily: 'monospace', whiteSpace: 'pre',
              transform: 'scale(1)', transformOrigin: 'center',
            }}>
              {ascii.join('\n')}
            </pre>
          </div>
        )}

        {/* Pixel mode */}
        {mode === 'pixel' && (
          <div className="w-full h-full flex items-center justify-center overflow-hidden bg-black">
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${CANVAS_W}, ${(160 / CANVAS_W).toFixed(2)}px)`,
              gridTemplateRows:    `repeat(${CANVAS_H}, ${(160 / CANVAS_H).toFixed(2)}px)`,
              gap: 0, width: '100%', height: '100%',
            }}>
              {pixels.map((row, ri) => row.map((px, ci) => (
                <div key={`${ri}-${ci}`}
                  style={{ background: `rgb(${px.r},${px.g},${px.b})` }} />
              )))}
            </div>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ background: 'rgba(0,0,0,0.55)' }}>
          <span className="text-white text-xs font-mono">click to cycle</span>
        </div>
      </button>

      {/* Mode pills below circle */}
      <div className="flex items-center gap-1">
        {(['photo','ascii','pixel'] as PhotoMode[]).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className="text-[9px] font-mono px-1.5 py-0.5 rounded transition-all"
            style={{
              background: mode === m ? BORDER_COLORS[m].replace(/[\d.]+\)$/, '0.2)') : 'transparent',
              color: mode === m ? '#fff' : 'rgba(255,255,255,0.3)',
              border: `1px solid ${mode === m ? BORDER_COLORS[m] : 'transparent'}`,
            }}>
            {m}
          </button>
        ))}
      </div>

      {/* Rotating ring decoration */}
      <div className="absolute" style={{
        width: 168, height: 168,
        borderRadius: '50%',
        border: '1px dashed rgba(0,255,65,0.15)',
        top: -4, left: -4,
        pointerEvents: 'none',
        animation: 'spin 12s linear infinite',
      }} />
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  )
}

/* ── Main ViewHero ── */
const STATIC_LINES = [
  { text: 'BIOS: Portfolio loaded.',          green: false },
  { text: '',                                  green: false },
  { text: '=====================================================', green: true  },
  { text: '  JIDUGU SRI SAI MAHESH                             ', green: true  },
  { text: '  ECE | Embedded Systems | Deep Learning            ', green: false },
  { text: '=====================================================', green: true  },
  { text: '',                                  green: false },
]

export default function ViewHero() {
  const [name,     setName]     = useState('Jidugu Sri Sai Mahesh')
  const [role,     setRole]     = useState('ECE Student & Embedded Systems Engineer')
  const [location, setLocation] = useState('Narsapur, India')
  const [gpa,      setGpa]      = useState('8.30')
  const [shown,    setShown]    = useState(0)
  const [stats,    setStats]    = useState(false)

  useEffect(() => {
    try {
      const d = loadData()
      if (d.name)     setName(d.name)
      if (d.role)     setRole(d.role)
      if (d.location) setLocation(d.location)
      if (d.gpa)      setGpa(d.gpa)
    } catch {}
  }, [])

  const allLines = [
    ...STATIC_LINES,
    { text: 'USER: ' + name,             green: true  },
    { text: 'ROLE: ' + role,             green: false },
    { text: 'LOC:  ' + location,         green: false },
    { text: 'GPA:  ' + gpa + ' / 10.0', green: false },
    { text: '',                           green: false },
  ]

  useEffect(() => {
    if (shown < allLines.length) {
      const id = setTimeout(() => setShown(s => s + 1), 90)
      return () => clearTimeout(id)
    } else {
      const id = setTimeout(() => setStats(true), 200)
      return () => clearTimeout(id)
    }
  }, [shown, allLines.length])

  return (
    <section
      id="hero"
      className="relative z-10 min-h-screen flex flex-col justify-center px-4 sm:px-6 pt-24 pb-16 max-w-5xl mx-auto"
    >
      {/* ── Terminal card ── */}
      <div className="terminal-window w-full" style={{ paddingRight: '0' }}>
        <div className="terminal-titlebar">
          <div className="dot dot-red"/>
          <div className="dot dot-yellow"/>
          <div className="dot dot-green"/>
          <span className="ml-3 text-xs text-gray-500 font-mono">portfolio — viewer — read only</span>
          <a href="/" className="ml-auto text-xs text-gray-500 hover:text-green-400 transition-colors font-mono">[terminal]</a>
        </div>

        {/* Content — no right padding, content flows normally */}
        <div className="p-5 min-h-[300px] font-mono text-xs sm:text-sm space-y-0.5">
          {allLines.slice(0, shown).map((line, i) => (
            <div key={i} className={'leading-relaxed whitespace-pre ' + (line.green ? 'text-green-400' : 'text-gray-400')}>
              {line.text === '' ? '\u00A0' : line.text}
            </div>
          ))}
          {shown >= allLines.length && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-green-400">viewer@mahesh:~$</span>
              <span className="text-white">scroll to explore</span>
              <span className="text-green-400 animate-blink ml-1">|</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Circular photo — moved below terminal ── */}
      <div className="mt-8 flex justify-center" style={{ width: '100%' }}>
        <CircularPhoto />
      </div>

      {/* ── Stats cards ── */}
      {stats && (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'internships', value: '02', c: 'text-green-400' },
            { label: 'projects',    value: '04', c: 'text-yellow-400' },
            { label: 'paper',       value: '01', c: 'text-cyan-400'  },
            { label: 'hackathons',  value: '04', c: 'text-green-400' },
          ].map(s => (
            <div key={s.label} className="terminal-window p-4 text-center">
              <div className={'text-3xl font-bold font-mono ' + s.c}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-1 font-mono">{s.label}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
