'use client'

import { useEffect, useRef, useState } from 'react'

// Fake Ubuntu bash command history scrolling in background
const BG_COMMANDS = [
  { prompt: 'mahesh@ubuntu:~$', cmd: 'ls -la projects/', out: ['drwxr-xr-x  fire-surveillance-bot', 'drwxr-xr-x  ai-recycling-rvm', 'drwxr-xr-x  coastal-deeponet', 'drwxr-xr-x  tropoleap-embedded'] },
  { prompt: 'mahesh@ubuntu:~$', cmd: 'git status', out: ['On branch main', 'nothing to commit, working tree clean'] },
  { prompt: 'mahesh@ubuntu:~/projects$', cmd: 'python3 train.py --model deeponet', out: ['Epoch 1/100 -- loss: 0.4821', 'Epoch 50/100 -- loss: 0.0312', 'Epoch 100/100 -- loss: 0.0091', 'Model saved: coastal_model.pt'] },
  { prompt: 'mahesh@ubuntu:~$', cmd: 'idf.py build', out: ['Compiling main.c...', 'Linking firmware.elf', 'Build complete. Binary: 312KB'] },
  { prompt: 'mahesh@ubuntu:~$', cmd: 'cat /proc/cpuinfo | grep "model name"', out: ['model name : ESP32 @ 240MHz'] },
  { prompt: 'mahesh@ubuntu:~$', cmd: 'ping -c 3 mqtt.broker.local', out: ['64 bytes from 192.168.1.10: icmp_seq=1 time=2.1ms', '64 bytes from 192.168.1.10: icmp_seq=2 time=1.9ms', '3 packets transmitted, 3 received, 0% packet loss'] },
  { prompt: 'mahesh@ubuntu:~$', cmd: 'npm run build', out: ['Creating optimized production build...', 'Compiled successfully!', 'Route / 142 kB'] },
  { prompt: 'mahesh@ubuntu:~/research$', cmd: './run_simulation.sh --weather cyclone', out: ['Loading oceanographic dataset...', 'Running DeepONet inference...', 'Accuracy: 97.3% -- surge prediction: 4.2m'] },
  { prompt: 'mahesh@ubuntu:~$', cmd: 'ssh root@192.168.4.1', out: ['Welcome to ESP32 shell', 'esp32# '] },
  { prompt: 'mahesh@ubuntu:~$', cmd: 'tail -f /var/log/iot-sensor.log', out: ['[INFO] Flame sensor: NORMAL', '[INFO] Gas MQ-2: 142 ppm', '[ALERT] Temperature spike detected: 89C', '[INFO] Alert sent via MQTT'] },
]

export default function ParticleField() {
  const ref = useRef<HTMLDivElement>(null)
  const [lines, setLines] = useState<{ text: string; cls: string; id: number }[]>([])
  const counter = useRef(0)

  useEffect(() => {
    let cmdIdx = 0
    let outIdx = 0
    let phase: 'cmd' | 'out' = 'cmd'

    const mk = (text: string, cls: string) => ({ text, cls, id: counter.current++ })

    const addNext = () => {
      const entry = BG_COMMANDS[cmdIdx % BG_COMMANDS.length]

      if (phase === 'cmd') {
        setLines(p => [...p.slice(-80), mk(entry.prompt + ' ' + entry.cmd, 'bg-cmd-line')])
        phase = 'out'
        outIdx = 0
        setTimeout(addNext, 180)
      } else {
        if (outIdx < entry.out.length) {
          setLines(p => [...p.slice(-80), mk(entry.out[outIdx], 'bg-out-line')])
          outIdx++
          setTimeout(addNext, 120)
        } else {
          setLines(p => [...p.slice(-80), mk('', 'bg-blank')])
          cmdIdx++
          phase = 'cmd'
          setTimeout(addNext, 600)
        }
      }
    }

    // Start after slight delay
    setTimeout(addNext, 800)
  }, [])

  return (
    <div
      ref={ref}
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
      style={{ opacity: 0.18 }}
      aria-hidden="true"
    >
      <div className="p-4 font-mono text-xs leading-relaxed">
        {lines.map(l => (
          <div
            key={l.id}
            className={
              l.cls === 'bg-cmd-line'
                ? 'text-white'
                : l.cls === 'bg-out-line'
                ? 'text-gray-400'
                : ''
            }
            style={{ whiteSpace: 'pre' }}
          >
            {l.text || '\u00A0'}
          </div>
        ))}
      </div>
    </div>
  )
}
