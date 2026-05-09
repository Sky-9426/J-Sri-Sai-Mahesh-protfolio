// lib/data.ts
// Single source of truth for all portfolio content.
// Admin page writes to localStorage under key "portfolio_data".
// View page reads from localStorage (falls back to these defaults).

export interface PortfolioData {
  name: string
  tagline: string
  role: string
  bio: string
  location: string
  email: string
  phone: string
  linkedin: string
  github: string
  gpa: string
  education: { degree: string; school: string; year: string; score: string }[]
  experience: {
    company: string; role: string; period: string; type: string
    project: string; bullets: string[]
  }[]
  projects: {
    id: string; name: string; desc: string
    stack: string[]; status: string; color: string
  }[]
  skills: { label: string; icon: string; items: string[]; color: string }[]
  achievements: { icon: string; title: string; desc: string; badge: string; color: string }[]
}

export const defaultData: PortfolioData = {
  name:     'Jidugu Sri Sai Mahesh',
  tagline:  'ECE Student · Embedded Systems · Deep Learning',
  role:     'ECE Student & Embedded Systems Engineer',
  bio:      'Motivated ECE student with hands-on experience in embedded systems, IoT, and deep learning. Passionate about building innovative solutions — from autonomous surveillance bots and smart recycling systems to scientific deep learning frameworks.',
  location: 'Narsapur, India',
  email:    'jsrisaimahesh@gmail.com',
  phone:    '+91 8008060605',
  linkedin: 'linkedin.com/in/jsrisaimahesh',
  github:   '',
  gpa:      '8.30',

  education: [
    { degree: 'B.Tech — Electronics & Communication Engineering', school: 'B.V. Raju Institute of Technology, Narsapur', year: '2023–present', score: 'GPA 8.30/10.0' },
    { degree: 'Intermediate (MPC)',                               school: 'Narayana Jr. College, IDPL',                 year: '2022',         score: '948/1000'    },
    { degree: 'Secondary School Certificate',                     school: "ST. Anthony's High School, Jeedimetla",      year: '2021',         score: '10.0/10.0 ★' },
  ],

  experience: [
    {
      company: 'IIT Bhubaneswar', role: 'Winter Research Intern',
      period: 'Dec 3 – Dec 28, 2025', type: 'Research',
      project: 'Modelling the Western Shore of Bay of Bengal During Severe Weather Conditions Using a Deep Learning Framework',
      bullets: [
        'Developed a DeepONet-based framework to model and predict coastal behavior along the western Bay of Bengal under cyclones and storm surges.',
        'Trained the model on oceanographic and meteorological datasets to learn solution operators for complex coastal fluid dynamics.',
        'Evaluated predictions against reference simulations for accuracy and generalizability under severe weather scenarios.',
      ],
    },
    {
      company: 'Tropoleap', role: 'Embedded System Design Engineer Intern',
      period: 'July 2025 – present', type: 'Industry',
      project: 'Confidential Embedded Systems Projects (2)',
      bullets: [
        'Developing and debugging embedded C/C++ firmware for ESP32 and ESP32-WROVER microcontrollers.',
        'Assisting in component selection and hardware testing for production-grade systems.',
      ],
    },
  ],

  projects: [
    { id: '001', name: 'Fire Surveillance Bot',                      status: 'PUBLISHED',    color: 'green', desc: 'Autonomous bot for real-time fire and gas detection, streaming live sensor data and video to a web dashboard. Paper communicated at ICOIICS 2025, Nepal.', stack: ['ESP32','ESP32-CAM','Flame Sensor','MQ-2','MQTT','Bluetooth'] },
    { id: '002', name: 'AI-Powered Recycling Vending Machine',       status: 'DEPLOYED',     color: 'amber', desc: 'Smart RVM that identifies and sorts plastic bottles via a deep learning vision model, rewarding users with auto-generated coupons via thermal printer and SMS.', stack: ['Deep Learning','Computer Vision','Firebase','IR Sensor','SMS API'] },
    { id: '003', name: 'Coastal Behaviour Deep Learning Framework',  status: 'RESEARCH',     color: 'cyan',  desc: 'DeepONet-based scientific model predicting coastal dynamics of the western Bay of Bengal during extreme weather.', stack: ['DeepONet','Python','Neural Operators','Fluid Dynamics'] },
    { id: '004', name: 'Confidential Embedded Systems (Tropoleap)',  status: 'IN PROGRESS',  color: 'green', desc: 'Two proprietary production embedded systems actively in development. Full firmware lifecycle on ESP32-WROVER with C/C++.', stack: ['ESP32-WROVER','C','C++','Firmware','Hardware Testing'] },
  ],

  skills: [
    { label: 'programming',       icon: '>_', items: ['C','C++','Python'],                                                         color: 'green' },
    { label: 'microcontrollers',  icon: '⊡',  items: ['ESP32','ESP32-WROVER','ESP32-CAM','Arduino','Particle Photon'],             color: 'amber' },
    { label: 'domains',           icon: '◈',  items: ['Embedded Systems','IoT Development','Deep Learning','Computer Vision','Neural Operators','Sensor Fusion'], color: 'cyan'  },
    { label: 'protocols & cloud', icon: '⋈',  items: ['MQTT','Bluetooth','Firebase','Real-time Systems'],                         color: 'green' },
    { label: 'hardware',          icon: '⊞',  items: ['PCB Design','Firmware Dev','Hardware Testing','Component Selection'],      color: 'amber' },
    { label: 'certifications',    icon: '★',  items: ['PCB Design — AICTE IDEA Lab','HCL Embedded Systems','EPICS Cohort — IEEESB'], color: 'cyan' },
  ],

  achievements: [
    { icon: '🥉', title: 'SIH Internal Hackathon 2025',          desc: 'Smart India Hackathon — Internal Round, BVRIT',                               badge: '3rd Place',     color: 'green' },
    { icon: '🏆', title: 'PALS Innowah 2025–2026',               desc: 'National Innovation Competition',                                             badge: 'Cluster Finals', color: 'amber' },
    { icon: '📄', title: 'Research Paper — ICOIICS 2025, Nepal', desc: '"IoT-Enabled Fire Surveillance" · NCIIT, Lalitpur, Nov 2025',                  badge: 'Communicated',  color: 'cyan'  },
    { icon: '🔬', title: 'IIT Bhubaneswar Research Intern',      desc: 'Deep Learning for Coastal Modelling — Winter 2025',                           badge: 'Research',      color: 'green' },
    { icon: '🎬', title: 'Film Club — Chalana Chithram BVRIT',   desc: 'Core Team Member · 2500+ attendee event · 2023–2024',                         badge: 'Leadership',    color: 'amber' },
    { icon: '⚡', title: 'Failathon · EPICS Cohort',              desc: 'Entrepreneurship Hackathon · IEEE Student Branch, VVLF',                     badge: 'Participant',   color: 'cyan'  },
  ],
}

export const STORAGE_KEY = 'portfolio_data'

export function loadData(): PortfolioData {
  if (typeof window === 'undefined') return defaultData
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultData
    return { ...defaultData, ...JSON.parse(raw) }
  } catch {
    return defaultData
  }
}

export function saveData(data: PortfolioData): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}
