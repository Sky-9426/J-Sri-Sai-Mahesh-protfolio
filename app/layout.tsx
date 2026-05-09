import type { Metadata } from 'next'
import './globals.css'
import SmoothScroll from '@/components/SmoothScroll'

export const metadata: Metadata = {
  title: 'Jidugu Sri Sai Mahesh — Portfolio',
  description: 'ECE Student · Embedded Systems · IoT · Deep Learning',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-terminal-bg antialiased overflow-x-hidden" style={{ cursor: 'default' }}>
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  )
}
