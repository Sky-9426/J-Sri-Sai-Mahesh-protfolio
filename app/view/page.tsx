'use client'

import { useState } from 'react'
import Nav from '@/components/Nav'
import ViewHero from '@/components/ViewHero'
import About from '@/components/About'
import Experience from '@/components/Experience'
import Projects from '@/components/Projects'
import Skills from '@/components/Skills'
import Achievements from '@/components/Achievements'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'
import PhotoViewer from '@/components/PhotoViewer'
import RmRfOverlay from '@/components/RmRfOverlay'
import Section from '@/components/Section'

export default function ViewPage() {
  const [showRm, setShowRm] = useState(false)

  return (
    <main className="relative min-h-screen" style={{ background: 'radial-gradient(ellipse at 30% 50%, #001a0d 0%, #000d07 40%, #000500 100%)' }}>
      {showRm && <RmRfOverlay onDone={() => setShowRm(false)} />}
      <Nav onRmRf={() => setShowRm(true)} />
      <ViewHero />
      <About />
      <Experience />
      <Projects />
      <Skills />

      {/* Photo section — ASCII / Pixel toggle */}
      <Section id="photo" label="profile.jpg" num="04.5">
        <div className="max-w-2xl mx-auto">
          <div className="gsap-reveal mb-4 font-mono text-xs text-gray-500">
            <span className="text-green-400">mahesh@ubuntu:~$</span> display mahesh.jpg --render ascii|pixel
          </div>
          <div className="gsap-reveal">
            <PhotoViewer />
          </div>
        </div>
      </Section>

      <Achievements />
      <Contact />

      {/* Easter egg trigger at bottom */}
      <div className="relative z-10 flex justify-center py-6">
        <button
          onClick={() => setShowRm(true)}
          className="font-mono text-xs text-gray-700 hover:text-red-500 transition-all duration-300 border border-transparent hover:border-red-900/50 px-4 py-2 rounded group"
        >
          <span className="text-green-600 group-hover:text-green-400">mahesh@ubuntu:~$</span>
          <span className="text-red-800 group-hover:text-red-400 ml-2">sudo rm -rf /</span>
        </button>
      </div>

      <Footer />
    </main>
  )
}
