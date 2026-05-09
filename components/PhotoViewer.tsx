'use client'

import { useEffect, useState, useCallback } from 'react'
import { resolvePhotoUrl } from '@/lib/photo'

const ASCII_CHARS = '@#S%?*+;:,. '
const CANVAS_W    = 80
const CANVAS_H    = 50
type Mode = 'ascii' | 'pixel' | 'original'

export default function PhotoViewer() {
  const [mode,    setMode]    = useState<Mode>('original')
  const [ascii,   setAscii]   = useState<string[]>([])
  const [pixels,  setPixels]  = useState<{ r:number;g:number;b:number }[][]>([])
  const [dataUrl, setDataUrl] = useState<string>('')
  const [loaded,  setLoaded]  = useState(false)
  const [error,   setError]   = useState('')

  const process = useCallback((src: string) => {
    const img = new Image()
    img.onload = () => {
      // Same fixed 80×50 canvas for both ASCII and pixel
      const canvas = document.createElement('canvas')
      canvas.width  = CANVAS_W
      canvas.height = CANVAS_H
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, CANVAS_W, CANVAS_H)
      const data = ctx.getImageData(0, 0, CANVAS_W, CANVAS_H).data

      // ASCII
      const lines: string[] = []
      for (let r = 0; r < CANVAS_H; r++) {
        let line = ''
        for (let c = 0; c < CANVAS_W; c++) {
          const i = (r * CANVAS_W + c) * 4
          const lum = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2]
          line += ASCII_CHARS[ASCII_CHARS.length - 1 - Math.floor((lum / 255) * (ASCII_CHARS.length - 1))]
        }
        lines.push(line)
      }
      setAscii(lines)

      // Pixel — same canvas, just read colors
      const grid: { r:number;g:number;b:number }[][] = []
      for (let r = 0; r < CANVAS_H; r++) {
        const row: { r:number;g:number;b:number }[] = []
        for (let c = 0; c < CANVAS_W; c++) {
          const i = (r * CANVAS_W + c) * 4
          row.push({ r: data[i], g: data[i+1], b: data[i+2] })
        }
        grid.push(row)
      }
      setPixels(grid)
      setLoaded(true)
      setError('')
    }
    img.onerror = () => setError('Failed to load photo')
    img.src = src
  }, [])

  useEffect(() => {
    const stored = resolvePhotoUrl()
    setDataUrl(stored)
    process(stored)
  }, [process])

  if (!loaded) return (
    <div className="terminal-window p-8 text-center">
      <div className="text-4xl mb-3">📷</div>
      <p className="font-mono text-xs text-gray-500">
        {error || 'Loading photo...'}
      </p>
    </div>
  )

  return (
    <div className="terminal-window overflow-hidden">
      {/* Titlebar with toggle */}
      <div className="terminal-titlebar">
        <div className="dot dot-red"/><div className="dot dot-yellow"/><div className="dot dot-green"/>
        <span className="flex-1 text-center text-xs font-mono text-gray-400">mahesh.jpg — photo viewer</span>
        <div className="flex items-center gap-1 ml-auto">
          {(['ascii', 'pixel', 'original'] as Mode[]).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={'text-xs font-mono px-2 py-0.5 rounded transition-all ' +
                (mode === m
                  ? m === 'ascii'    ? 'bg-green-900/60 text-green-400 border border-green-700'
                  : m === 'pixel'    ? 'bg-blue-900/60 text-blue-400 border border-blue-700'
                                     : 'bg-gray-800 text-gray-200 border border-gray-600'
                  : 'text-gray-600 hover:text-gray-300')}>
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Display area — fixed size container so all 3 look same */}
      <div className="flex items-center justify-center overflow-auto p-6" style={{ minHeight: 400 }}>
        {mode === 'ascii' && (
          <pre className="font-mono leading-none text-green-400 select-none"
            style={{ fontSize: '7px', letterSpacing: '0.5px', lineHeight: '1.08' }}>
            {ascii.join('\n')}
          </pre>
        )}
        {mode === 'pixel' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${CANVAS_W}, 6px)`,
            gridTemplateRows:    `repeat(${CANVAS_H}, 6px)`,
            gap: 0,
          }}>
            {pixels.map((row, ri) => row.map((px, ci) => (
              <div key={`${ri}-${ci}`} style={{ width: 6, height: 6, background: `rgb(${px.r},${px.g},${px.b})` }} />
            )))}
          </div>
        )}
        {mode === 'original' && (
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              {/* Glowing background effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-emerald-500 to-cyan-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
              
              {/* Photo with border */}
              <div className="relative bg-black rounded-lg p-1">
                <img 
                  src={dataUrl} 
                  alt="Mahesh"
                  style={{ 
                    maxHeight: 320, 
                    maxWidth: '100%', 
                    objectFit: 'cover', 
                    borderRadius: 6,
                    display: 'block'
                  }} 
                  className="transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </div>
            <p className="text-xs font-mono text-gray-500 text-center max-w-xs">
              Professional Profile • High-quality image • Works for all visitors
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 flex items-center justify-between font-mono text-xs text-gray-600 border-t border-white/5">
        <span>
          {mode === 'ascii' ? `ASCII — ${CANVAS_W}×${CANVAS_H} chars`
            : mode === 'pixel' ? `Pixel — ${CANVAS_W}×${CANVAS_H} px (6px each)`
            : 'Original photo'}
        </span>
        <button onClick={() => setMode(m => m === 'ascii' ? 'pixel' : m === 'pixel' ? 'original' : 'ascii')}
          className="text-gray-600 hover:text-gray-400 transition-colors">
          toggle →
        </button>
      </div>
    </div>
  )
}
