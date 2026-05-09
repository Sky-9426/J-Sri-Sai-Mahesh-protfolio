'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated, logout } from '@/lib/auth'
import { loadData, saveData, defaultData, type PortfolioData } from '@/lib/data'
import { PHOTO_KEY, resolvePhotoUrl } from '@/lib/photo'

// ── Tiny reusable field components ───────────────────────────────────────────
function Field({ label, value, onChange, area = false }: {
  label: string; value: string; onChange: (v: string) => void; area?: boolean
}) {
  const base = "w-full bg-terminal-surface border border-terminal-border rounded px-3 py-2 font-mono text-xs text-terminal-white focus:outline-none focus:border-terminal-green transition-colors resize-none"
  return (
    <div>
      <label className="block text-xs font-mono text-terminal-grey mb-1 tracking-widest uppercase">{label}</label>
      {area
        ? <textarea className={base} rows={3} value={value} onChange={e => onChange(e.target.value)} />
        : <input   className={base}          value={value} onChange={e => onChange(e.target.value)} />
      }
    </div>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="terminal-window mb-4">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full terminal-titlebar hover:bg-white/5 transition-colors text-left"
      >
        <div className="dot dot-red"/><div className="dot dot-yellow"/><div className="dot dot-green"/>
        <span className="ml-3 text-xs font-mono text-terminal-grey">{title}</span>
        <span className="ml-auto text-terminal-grey font-mono text-xs">{open ? '▼' : '▶'}</span>
      </button>
      {open && <div className="p-5 space-y-4">{children}</div>}
    </div>
  )
}

// ── Main admin page ───────────────────────────────────────────────────────────
export default function AdminPage() {
  const router = useRouter()
  const [authed, setAuthed]   = useState(false)
  const [data,   setData]     = useState<PortfolioData>(defaultData)
  const [saved,  setSaved]    = useState(false)
  const [tab,    setTab]      = useState<'info' | 'experience' | 'projects' | 'skills' | 'achievements' | 'photo'>('info')
  const [photo,  setPhoto]    = useState<string | null>(null)
  const [photoSaved, setPhotoSaved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auth guard
  useEffect(() => {
    if (!isAuthenticated()) { router.replace('/'); return }
    setAuthed(true)
    setData(loadData())
    setPhoto(resolvePhotoUrl())
  }, [router])

  if (!authed) return (
    <div className="min-h-screen bg-terminal-bg flex items-center justify-center font-mono text-terminal-grey text-sm">
      Verifying session...
    </div>
  )

  // ── Helpers ──────────────────────────────────────────────────────────────
  const update = (patch: Partial<PortfolioData>) => setData(d => ({ ...d, ...patch }))

  const handleSave = () => {
    saveData(data)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleLogout = () => { logout(); router.push('/') }

  const handleReset = () => {
    if (confirm('Reset all data to defaults?')) { setData(defaultData); saveData(defaultData) }
  }

  // ── Experience helpers ────────────────────────────────────────────────────
  const updateExp = (i: number, patch: Partial<PortfolioData['experience'][0]>) =>
    update({ experience: data.experience.map((e, idx) => idx === i ? { ...e, ...patch } : e) })
  const updateBullet = (ei: number, bi: number, val: string) =>
    updateExp(ei, { bullets: data.experience[ei].bullets.map((b, bi2) => bi2 === bi ? val : b) })
  const addBullet = (ei: number) =>
    updateExp(ei, { bullets: [...data.experience[ei].bullets, ''] })
  const removeBullet = (ei: number, bi: number) =>
    updateExp(ei, { bullets: data.experience[ei].bullets.filter((_, bi2) => bi2 !== bi) })
  const addExp = () =>
    update({ experience: [...data.experience, { company: '', role: '', period: '', type: '', project: '', bullets: [''] }] })
  const removeExp = (i: number) =>
    update({ experience: data.experience.filter((_, idx) => idx !== i) })

  // ── Project helpers ───────────────────────────────────────────────────────
  const updateProj = (i: number, patch: Partial<PortfolioData['projects'][0]>) =>
    update({ projects: data.projects.map((p, idx) => idx === i ? { ...p, ...patch } : p) })
  const addProj = () =>
    update({ projects: [...data.projects, { id: String(data.projects.length + 1).padStart(3,'0'), name: '', desc: '', stack: [], status: 'IN PROGRESS', color: 'green' }] })
  const removeProj = (i: number) =>
    update({ projects: data.projects.filter((_, idx) => idx !== i) })

  // ── Achievement helpers ───────────────────────────────────────────────────
  const updateAch = (i: number, patch: Partial<PortfolioData['achievements'][0]>) =>
    update({ achievements: data.achievements.map((a, idx) => idx === i ? { ...a, ...patch } : a) })
  const addAch = () =>
    update({ achievements: [...data.achievements, { icon: '🏅', title: '', desc: '', badge: '', color: 'green' }] })
  const removeAch = (i: number) =>
    update({ achievements: data.achievements.filter((_, idx) => idx !== i) })

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { alert('Please upload an image file'); return }
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      setPhoto(dataUrl)
      localStorage.setItem(PHOTO_KEY, dataUrl)
      setPhotoSaved(true)
      setTimeout(() => setPhotoSaved(false), 2500)
    }
    reader.readAsDataURL(file)
  }

  const handlePhotoRemove = () => {
    setPhoto(resolvePhotoUrl())
    localStorage.removeItem(PHOTO_KEY)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const tabs = ['info', 'experience', 'projects', 'skills', 'achievements', 'photo'] as const

  return (
    <div className="min-h-screen bg-terminal-bg text-terminal-white">
      {/* Top bar */}
      <div className="sticky top-0 z-50 bg-black/90 backdrop-blur border-b border-terminal-border">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="font-mono text-xs flex items-center gap-2">
            <span className="glow-green">root@mahesh-portfolio</span>
            <span className="text-terminal-grey">:</span>
            <span className="text-blue-400">~/admin</span>
            <span className="text-terminal-grey">$</span>
            <span className="text-terminal-white animate-pulse ml-1">ADMIN MODE</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <a
              href="/view"
              target="_blank"
              className="text-xs font-mono px-3 py-1.5 border border-terminal-border text-terminal-grey hover:text-terminal-cyan hover:border-terminal-cyan transition-colors rounded"
            >
              ↗ preview
            </a>
            <button
              onClick={handleReset}
              className="text-xs font-mono px-3 py-1.5 border border-terminal-border text-terminal-grey hover:text-red-400 hover:border-red-800 transition-colors rounded"
            >
              reset defaults
            </button>
            <button
              onClick={handleSave}
              className={`text-xs font-mono px-4 py-1.5 rounded border transition-all ${
                saved
                  ? 'bg-green-900/40 border-terminal-green glow-green'
                  : 'bg-terminal-green/10 border-terminal-green text-terminal-green hover:bg-terminal-green/20'
              }`}
            >
              {saved ? '✓ saved!' : '⟳ save changes'}
            </button>
            <button
              onClick={handleLogout}
              className="text-xs font-mono px-3 py-1.5 border border-red-900 text-red-400 hover:bg-red-900/20 transition-colors rounded"
            >
              logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-4 flex gap-1 pb-2 overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-xs font-mono px-4 py-1.5 rounded transition-all whitespace-nowrap ${
                tab === t
                  ? 'bg-terminal-green/15 text-terminal-green border border-terminal-green/40'
                  : 'text-terminal-grey hover:text-terminal-white border border-transparent'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* ── INFO tab ── */}
        {tab === 'info' && (
          <div className="grid md:grid-cols-2 gap-4">
            <SectionCard title="cat identity.txt — Basic Info">
              <Field label="Full Name"  value={data.name}     onChange={v => update({ name: v })} />
              <Field label="Role"       value={data.role}     onChange={v => update({ role: v })} />
              <Field label="Tagline"    value={data.tagline}  onChange={v => update({ tagline: v })} />
              <Field label="Location"   value={data.location} onChange={v => update({ location: v })} />
              <Field label="GPA"        value={data.gpa}      onChange={v => update({ gpa: v })} />
              <Field label="Bio"        value={data.bio}      onChange={v => update({ bio: v })} area />
            </SectionCard>

            <SectionCard title="cat contact.json — Contact">
              <Field label="Email"    value={data.email}    onChange={v => update({ email: v })} />
              <Field label="Phone"    value={data.phone}    onChange={v => update({ phone: v })} />
              <Field label="LinkedIn" value={data.linkedin} onChange={v => update({ linkedin: v })} />
              <Field label="GitHub"   value={data.github}   onChange={v => update({ github: v })} />
            </SectionCard>

            <SectionCard title="ls education/ — Education">
              {data.education.map((e, i) => (
                <div key={i} className="border border-terminal-border rounded p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono text-terminal-grey">Entry {i + 1}</span>
                    <button
                      onClick={() => update({ education: data.education.filter((_, idx) => idx !== i) })}
                      className="text-xs text-red-400 hover:text-red-300 font-mono"
                    >✕</button>
                  </div>
                  <Field label="Degree" value={e.degree} onChange={v => update({ education: data.education.map((ed, idx) => idx === i ? { ...ed, degree: v } : ed) })} />
                  <Field label="School" value={e.school} onChange={v => update({ education: data.education.map((ed, idx) => idx === i ? { ...ed, school: v } : ed) })} />
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Year"  value={e.year}  onChange={v => update({ education: data.education.map((ed, idx) => idx === i ? { ...ed, year: v } : ed) })} />
                    <Field label="Score" value={e.score} onChange={v => update({ education: data.education.map((ed, idx) => idx === i ? { ...ed, score: v } : ed) })} />
                  </div>
                </div>
              ))}
              <button
                onClick={() => update({ education: [...data.education, { degree: '', school: '', year: '', score: '' }] })}
                className="w-full text-xs font-mono py-2 border border-dashed border-terminal-border text-terminal-grey hover:border-terminal-green hover:text-terminal-green transition-colors rounded"
              >
                + add education
              </button>
            </SectionCard>
          </div>
        )}

        {/* ── EXPERIENCE tab ── */}
        {tab === 'experience' && (
          <div className="space-y-4">
            {data.experience.map((exp, i) => (
              <SectionCard key={i} title={`cat experience/${exp.company || 'new'}.log`}>
                <div className="grid md:grid-cols-2 gap-3">
                  <Field label="Company" value={exp.company} onChange={v => updateExp(i, { company: v })} />
                  <Field label="Role"    value={exp.role}    onChange={v => updateExp(i, { role: v })} />
                  <Field label="Period"  value={exp.period}  onChange={v => updateExp(i, { period: v })} />
                  <Field label="Type"    value={exp.type}    onChange={v => updateExp(i, { type: v })} />
                </div>
                <Field label="Project" value={exp.project} onChange={v => updateExp(i, { project: v })} />
                <div>
                  <label className="block text-xs font-mono text-terminal-grey mb-2 tracking-widest uppercase">Bullets</label>
                  {exp.bullets.map((b, bi) => (
                    <div key={bi} className="flex gap-2 mb-2">
                      <span className="glow-green font-mono text-xs mt-2 shrink-0">→</span>
                      <input
                        className="flex-1 bg-terminal-surface border border-terminal-border rounded px-3 py-2 font-mono text-xs text-terminal-white focus:outline-none focus:border-terminal-green transition-colors"
                        value={b}
                        onChange={e => updateBullet(i, bi, e.target.value)}
                      />
                      <button onClick={() => removeBullet(i, bi)} className="text-red-400 font-mono text-xs px-2 hover:text-red-300">✕</button>
                    </div>
                  ))}
                  <button onClick={() => addBullet(i)} className="text-xs font-mono text-terminal-grey hover:text-terminal-green transition-colors">+ add bullet</button>
                </div>
                <button onClick={() => removeExp(i)} className="text-xs font-mono text-red-400 hover:text-red-300 border border-red-900/40 px-3 py-1.5 rounded hover:border-red-800 transition-colors">
                  remove experience
                </button>
              </SectionCard>
            ))}
            <button
              onClick={addExp}
              className="w-full text-xs font-mono py-3 border border-dashed border-terminal-border text-terminal-grey hover:border-terminal-green hover:text-terminal-green transition-colors rounded"
            >
              + add experience
            </button>
          </div>
        )}

        {/* ── PROJECTS tab ── */}
        {tab === 'projects' && (
          <div className="space-y-4">
            {data.projects.map((p, i) => (
              <SectionCard key={i} title={`cat projects/${p.id || 'new'}.json`}>
                <div className="grid md:grid-cols-3 gap-3">
                  <Field label="ID"     value={p.id}     onChange={v => updateProj(i, { id: v })} />
                  <Field label="Status" value={p.status} onChange={v => updateProj(i, { status: v })} />
                  <div>
                    <label className="block text-xs font-mono text-terminal-grey mb-1 tracking-widest uppercase">Color</label>
                    <select
                      className="w-full bg-terminal-surface border border-terminal-border rounded px-3 py-2 font-mono text-xs text-terminal-white focus:outline-none focus:border-terminal-green transition-colors"
                      value={p.color}
                      onChange={e => updateProj(i, { color: e.target.value })}
                    >
                      <option value="green">Green</option>
                      <option value="amber">Amber</option>
                      <option value="cyan">Cyan</option>
                    </select>
                  </div>
                </div>
                <Field label="Name"        value={p.name} onChange={v => updateProj(i, { name: v })} />
                <Field label="Description" value={p.desc} onChange={v => updateProj(i, { desc: v })} area />
                <div>
                  <label className="block text-xs font-mono text-terminal-grey mb-1 tracking-widest uppercase">Stack (comma-separated)</label>
                  <input
                    className="w-full bg-terminal-surface border border-terminal-border rounded px-3 py-2 font-mono text-xs text-terminal-white focus:outline-none focus:border-terminal-green transition-colors"
                    value={p.stack.join(', ')}
                    onChange={e => updateProj(i, { stack: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  />
                </div>
                <button onClick={() => removeProj(i)} className="text-xs font-mono text-red-400 hover:text-red-300 border border-red-900/40 px-3 py-1.5 rounded hover:border-red-800 transition-colors">
                  remove project
                </button>
              </SectionCard>
            ))}
            <button
              onClick={addProj}
              className="w-full text-xs font-mono py-3 border border-dashed border-terminal-border text-terminal-grey hover:border-terminal-green hover:text-terminal-green transition-colors rounded"
            >
              + add project
            </button>
          </div>
        )}

        {/* ── SKILLS tab ── */}
        {tab === 'skills' && (
          <div className="space-y-4">
            {data.skills.map((g, i) => (
              <SectionCard key={i} title={`skills/${g.label}`}>
                <div className="grid md:grid-cols-3 gap-3">
                  <Field label="Label" value={g.label} onChange={v => update({ skills: data.skills.map((s, si) => si === i ? { ...s, label: v } : s) })} />
                  <Field label="Icon"  value={g.icon}  onChange={v => update({ skills: data.skills.map((s, si) => si === i ? { ...s, icon:  v } : s) })} />
                  <div>
                    <label className="block text-xs font-mono text-terminal-grey mb-1 tracking-widest uppercase">Color</label>
                    <select
                      className="w-full bg-terminal-surface border border-terminal-border rounded px-3 py-2 font-mono text-xs text-terminal-white focus:outline-none focus:border-terminal-green transition-colors"
                      value={g.color}
                      onChange={e => update({ skills: data.skills.map((s, si) => si === i ? { ...s, color: e.target.value } : s) })}
                    >
                      <option value="green">Green</option>
                      <option value="amber">Amber</option>
                      <option value="cyan">Cyan</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-mono text-terminal-grey mb-1 tracking-widest uppercase">Items (comma-separated)</label>
                  <input
                    className="w-full bg-terminal-surface border border-terminal-border rounded px-3 py-2 font-mono text-xs text-terminal-white focus:outline-none focus:border-terminal-green transition-colors"
                    value={g.items.join(', ')}
                    onChange={e => update({ skills: data.skills.map((s, si) => si === i ? { ...s, items: e.target.value.split(',').map(x => x.trim()).filter(Boolean) } : s) })}
                  />
                </div>
              </SectionCard>
            ))}
          </div>
        )}

        {/* ── ACHIEVEMENTS tab ── */}
        {tab === 'achievements' && (
          <div className="space-y-4">
            {data.achievements.map((a, i) => (
              <SectionCard key={i} title={`achievements/${i + 1}`}>
                <div className="grid md:grid-cols-3 gap-3">
                  <Field label="Icon"  value={a.icon}  onChange={v => updateAch(i, { icon: v })} />
                  <Field label="Badge" value={a.badge} onChange={v => updateAch(i, { badge: v })} />
                  <div>
                    <label className="block text-xs font-mono text-terminal-grey mb-1 tracking-widest uppercase">Color</label>
                    <select
                      className="w-full bg-terminal-surface border border-terminal-border rounded px-3 py-2 font-mono text-xs text-terminal-white focus:outline-none focus:border-terminal-green transition-colors"
                      value={a.color}
                      onChange={e => updateAch(i, { color: e.target.value })}
                    >
                      <option value="green">Green</option>
                      <option value="amber">Amber</option>
                      <option value="cyan">Cyan</option>
                    </select>
                  </div>
                </div>
                <Field label="Title"       value={a.title} onChange={v => updateAch(i, { title: v })} />
                <Field label="Description" value={a.desc}  onChange={v => updateAch(i, { desc: v })} />
                <button onClick={() => removeAch(i)} className="text-xs font-mono text-red-400 hover:text-red-300 border border-red-900/40 px-3 py-1.5 rounded hover:border-red-800 transition-colors">
                  remove achievement
                </button>
              </SectionCard>
            ))}
            <button
              onClick={addAch}
              className="w-full text-xs font-mono py-3 border border-dashed border-terminal-border text-terminal-grey hover:border-terminal-green hover:text-terminal-green transition-colors rounded"
            >
              + add achievement
            </button>
          </div>
        )}

        {/* ── PHOTO tab ── */}
        {tab === 'photo' && (
          <div className="space-y-4">
            <SectionCard title="upload --photo mahesh.jpg">
              <div className="space-y-4">
                <div className="font-mono text-xs text-gray-400 leading-relaxed">
                  <p>Upload your photo here. It will be displayed on the portfolio as:</p>
                  <p className="text-green-400 mt-1">→ ASCII art (text characters forming your face)</p>
                  <p className="text-blue-400">→ Pixel art (8-bit blocky colored squares)</p>
                  <p className="text-gray-500 mt-1">Visitors can toggle between both modes.</p>
                  <p className="text-gray-600 mt-1">Uploaded image is a local browser override. Global fallback image comes from deployment config.</p>
                </div>

                {/* Upload area */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-700 hover:border-green-700 rounded-lg p-8 text-center cursor-pointer transition-all duration-300 group"
                >
                  {photo ? (
                    <div className="space-y-3">
                      <img
                        src={photo}
                        alt="Uploaded"
                        className="w-32 h-32 object-cover rounded-lg mx-auto border border-gray-600"
                      />
                      <p className="text-xs font-mono text-green-400">Photo uploaded!</p>
                      <p className="text-xs font-mono text-gray-500">Click to replace</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-4xl">📷</div>
                      <p className="text-sm font-mono text-gray-400 group-hover:text-green-400 transition-colors">
                        Click to upload your photo
                      </p>
                      <p className="text-xs font-mono text-gray-600">JPG, PNG, WEBP supported</p>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />

                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={
                      'text-xs font-mono px-4 py-2 rounded border transition-all ' +
                      (photoSaved
                        ? 'bg-green-900/40 border-green-700 text-green-400'
                        : 'border-green-900 text-green-600 hover:bg-green-900/20 hover:text-green-400')
                    }
                  >
                    {photoSaved ? '✓ photo saved!' : '↑ upload photo'}
                  </button>

                  {photo && (
                    <button
                      onClick={handlePhotoRemove}
                      className="text-xs font-mono px-4 py-2 rounded border border-red-900/40 text-red-500 hover:bg-red-900/20 transition-all"
                    >
                      ✕ remove photo
                    </button>
                  )}

                  {photo && (
                    <a
                      href="/view#photo"
                      target="_blank"
                      className="text-xs font-mono px-4 py-2 rounded border border-blue-900/40 text-blue-400 hover:bg-blue-900/20 transition-all"
                    >
                      ↗ preview on portfolio
                    </a>
                  )}
                </div>

                {photo && (
                  <div className="border border-gray-800 rounded p-3 font-mono text-xs text-gray-500 space-y-1">
                    <p className="text-gray-400">Preview — ASCII render (actual render is on /view#photo):</p>
                    <div className="mt-2 overflow-hidden rounded" style={{ maxHeight: 120 }}>
                      <img src={photo} alt="preview" className="w-full object-cover opacity-60 grayscale" />
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>

            <div className="terminal-window p-4 font-mono text-xs text-gray-500 space-y-1">
              <p className="text-yellow-400">Tips for best results:</p>
              <p>→ Use a clear face/portrait photo with good lighting</p>
              <p>→ Square or portrait orientation works best</p>
              <p>→ High contrast photos produce better ASCII art</p>
              <p>→ Uploads here override this browser only</p>
              <p>→ Set NEXT_PUBLIC_DEFAULT_PHOTO_URL for a global image on all devices</p>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
