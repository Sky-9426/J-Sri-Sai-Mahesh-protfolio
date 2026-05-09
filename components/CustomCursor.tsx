'use client'

import { useEffect, useRef, useState } from 'react'

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const supportsCustomCursor =
      window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!supportsCustomCursor) {
      setVisible(false)
      return
    }

    setVisible(true)
    let targetX = -100, targetY = -100
    let currentX = -100, currentY = -100
    let rafId: number

    const onMove = (e: MouseEvent) => {
      targetX = e.clientX
      targetY = e.clientY
    }

    const onEnter = () => setVisible(true)
    const onLeave = () => setVisible(false)
    
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseenter', onEnter)
    window.addEventListener('mouseleave', onLeave)

    const animate = () => {
      currentX += (targetX - currentX) * 0.2
      currentY += (targetY - currentY) * 0.2

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${currentX - 6}px, ${currentY - 6}px)`
      }
      rafId = requestAnimationFrame(animate)
    }
    
    animate()

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseenter', onEnter)
      window.removeEventListener('mouseleave', onLeave)
      cancelAnimationFrame(rafId)
    }
  }, [])

  if (!visible) return null

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 z-[9999] pointer-events-none"
      style={{
        width: '12px',
        height: '12px',
        background: '#00ff41',
        borderRadius: '50%',
        boxShadow: '0 0 6px rgba(0, 255, 65, 0.8)',
        willChange: 'transform',
      }}
    />
  )
}
