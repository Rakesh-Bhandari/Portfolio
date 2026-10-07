// ALL site content lives here. Edit this file; components never hard-code copy.

const BASE = import.meta.env.BASE_URL
export const asset = (p: string) => BASE + p.replace(/^\//, '')

export interface Project {
  id: string
  designator: string
  title: string
  tags: string[]
  summary: string[]
  links: { label: string; href: string }[]
  visual: 'layers' | 'v2x' | 'scope'
  image?: string
}

export const portfolio = {
  name: 'B Rakeshkumar',
  short: 'Rakesh',
  title: 'Embedded Systems Engineer · ECE Undergraduate',
  tagline:
    'From schematic to silicon to firmware. I design boards, write the code that runs on them, and make them talk.',
  location: 'Mangaluru, Karnataka, India',
  email: 'rakeshbhandari041@gmail.com',
  phone: '+91 9481288157',
  linkedin: 'https://linkedin.com/in/b-rakesh-kumar',
  github: 'https://github.com/Rakesh-Bhandari',
  resume: asset('resume/Rakesh_Resume.pdf'),
  status: 'Open to internships & embedded roles · Graduating 2027',

  about: {
    summary:
      'Embedded Systems Engineer (fresher) with hands-on experience in real-time sensor systems (I2C/SPI/UART), RF communication protocol design (NRF24L01), and 4-layer custom PCB design in KiCad. Comfortable across the full embedded stack — from schematic capture and hardware bring-up to firmware in Embedded C and PlatformIO.',
    stats: ['CGPA 8.45 / 10', '4-layer PCB designed', '3 hardware projects', '1st place, Blind Coding (national fest)'],
    // Optional headshot: drop a file in public/images and set e.g. asset('images/rakesh.webp'). Empty = omitted.
    headshot: '',
  },

  education: [
    {
      title: 'Bachelor of Engineering — Electronics and Communication',
      org: 'Shree Devi Institute of Technology, Mangaluru (VTU)',
      period: '2023–2027',
      score: 'CGPA 8.45/10.0',
    },
    {
      title: 'Pre-University Course — PCMCs',
      org: 'Government PU College',
      period: '2021–2023',
      score: '82.22%',
    },
    {
      title: 'SSLC',
      org: 'Pragathi Vidyalaya English Medium High School, Muroor',
      period: '2021',
      score: '86.77%',
    },
  ],

  experience: [
    {
      title: '1st Place — Blind Coding, Envision 2026',
      org: 'National Techno-Cultural Fest, Srinivas Institute of Technology, Mangaluru',
      date: 'April 2026',
      badge: '',
      body: 'Secured 1st place in a blind-coding competition at a national-level techno-cultural fest, solving programming problems under time pressure without visual code feedback.',
    },
    {
      title: "Sankalp'25 — 24-Hour National Hackathon",
      org: 'IEEE Student Branch, AJ Institute of Engineering and Technology, Mangaluru',
      date: 'April 2025',
      badge: 'Team shortlisted',
      body: "Owned hardware and firmware for a 3-member team's Smart Parking Management System: Arduino Nano + ESP8266 over UART with Blynk-based remote monitoring.",
    },
    {
      title: 'Code Meet 2025 — Hackathon',
      org: 'Srinivas University Institute of Engineering & Technology, Mukka, Mangaluru',
      date: 'October 2025',
      badge: '',
      body: 'Built the frontend and AI chatbot module for Learnly, an AI-tutoring learning platform for students, as part of a 4-member team.',
    },
  ],

  projects: [
    {
      id: 'esp32s3',
      designator: 'P1',
      title: 'Custom ESP32-S3 Development Board',
      tags: ['KiCad', '4-Layer PCB', 'ESP32-S3', 'Power Design', 'DRC'],
      summary: [
        'Designed a 4-layer ESP32-S3 dev board in KiCad from scratch, spanning schematic capture across 3 hierarchical subsystem sheets, component selection, BOM generation, and power-path design; verified with KiCad DRC prior to fabrication.',
      ],
      links: [
        {
          label: 'View on GitHub',
          href: 'https://github.com/Rakesh-Bhandari/ESP32-S3-Mini-Development-Board',
        },
      ],
      visual: 'layers',
      // Drop a KiCad 3D render at public/images/projects/esp32-s3-board.webp and set this path.
      image: '',
    },
    {
      id: 'v2x',
      designator: 'P2',
      title: 'Emergency Vehicle Priority System (V2X)',
      tags: ['ESP32', 'NRF24L01', 'SPI', 'IR', 'PlatformIO', 'C++', 'State Machine'],
      summary: [
        'Built a 3-node V2X-style system (Ambulance, Roadside Unit, Vehicle ECU) on ESP32 using NRF24L01 (SPI) for RF broadcast and IR receivers for signal detection, to preempt traffic signals for approaching ambulances; designed the RF packet protocol and node state machine (broadcast, ACK, retry) in PlatformIO/C++.',
      ],
      // TODO(Rakesh): replace with the repo link once public.
      links: [{ label: 'GitHub profile', href: 'https://github.com/Rakesh-Bhandari' }],
      visual: 'v2x',
    },
    {
      id: 'shm',
      designator: 'P3',
      title: 'IoT-Based Smart Bridge Health Monitoring System',
      tags: ['ESP32', 'MPU6050 (I2C)', 'Flex Sensor', 'Computer Vision', 'React', 'Flask', 'MySQL'],
      summary: [
        'Developed a real-time structural health monitoring system on ESP32 integrating an MPU6050 IMU (I2C), flex, and water-level sensors to detect vibration and stress anomalies, with image-processing-assisted crack detection for automated visual inspection.',
        'Built a full-stack monitoring platform (React, Flask, MySQL) delivering live data visualization, automated threshold alerting, and historical trend analysis for predictive maintenance.',
      ],
      links: [
        {
          label: 'Monitoring system',
          href: 'https://github.com/Rakesh-Bhandari/Structural-Health-Monitoring-System-using-IoT',
        },
        {
          label: 'Crack detection',
          href: 'https://github.com/Rakesh-Bhandari/computer_vision_crack_detection',
        },
      ],
      visual: 'scope',
    },
  ] as Project[],

  moreOnGithub: [
    {
      repo: 'Learnly',
      blurb: 'AI tutoring platform for college students: chat-based tutor, subject modules and a progress dashboard. Built at Code Meet 2025.',
      stack: 'HTML · Tailwind · Express · Firebase',
    },
    {
      repo: 'Aptric',
      blurb: 'Daily aptitude platform with short challenges, focused practice and friendly leagues, on a verified AI-generated question bank.',
      stack: 'React · TypeScript · Express · Postgres',
    },
    {
      repo: 'Weather_App',
      blurb: 'Desktop weather app with live OpenWeatherMap data and backgrounds and icons that follow the conditions.',
      stack: 'Python · CustomTkinter',
    },
  ],

  skills: [
    { designator: 'U2', name: 'Languages', items: ['C/C++', 'Embedded C', 'Python (basics)', 'HTML & CSS'] },
    { designator: 'U3', name: 'Protocols & Comms', items: ['I2C', 'SPI', 'UART', 'RF (NRF24L01)', 'IR communication'] },
    {
      designator: 'U4',
      name: 'Tools & Software',
      items: ['Arduino IDE', 'PlatformIO', 'STM32CubeIDE', 'KiCad', 'VS Code', 'Git & GitHub', 'Linux (basics)'],
    },
    {
      designator: 'U5',
      name: 'Hardware & Electronics',
      items: [
        'Digital Electronics',
        'Circuit Design & Debugging',
        'Sensor Interfacing',
        'Multi-layer PCB Design',
        'Soldering & Wiring',
      ],
    },
    {
      designator: 'U6',
      name: 'Soft skills',
      items: ['Problem Solving', 'Teamwork', 'Analytical Thinking', 'Critical Thinking', 'Leadership', 'Time Management'],
    },
  ],

  certifications: [
    { title: 'Embedded System Design with ARM', issuer: 'NPTEL', link: '' },
    { title: 'Introduction to RISC-V', issuer: 'The Linux Foundation', link: '' },
    { title: 'Git & GitHub Bootcamp', issuer: 'LetsUpgrade', link: '' },
  ],

  contact: {
    heading: "Let's build something that ships.",
    footer: 'Designed & built by B Rakeshkumar · Mangaluru · 2026',
    rev: 'REV 1.0 · RK-PORTFOLIO',
  },
}

export type Portfolio = typeof portfolio
