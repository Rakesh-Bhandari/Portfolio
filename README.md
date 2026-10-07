# Signal Path — B Rakeshkumar's portfolio

A single-page portfolio that is a scroll-driven flight across a procedural 3D PCB. Each section lives on a region of the board; signal pulses travel along 45° copper traces toward the active section.

**Stack:** Vite · React 18 · TypeScript · three.js (@react-three/fiber, drei) · GSAP ScrollTrigger · Lenis · Tailwind · postprocessing (subtle bloom, desktop only).

## Setup
```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-check + static build into dist/
npm run preview
```

## Edit content
Everything lives in [`src/data/portfolio.ts`](src/data/portfolio.ts). Placeholders to replace:
- `public/images/projects/` render for project 1 (set `image` on the project, e.g. `asset('images/projects/esp32-s3-board.webp')`)
- V2X project repo link (`projects[1].links`)
- certification `link` fields (hidden when empty)
- optional `about.headshot`
- `public/resume/Rakesh_Resume.pdf` is a generated stand-in: replace it with the real resume.
- `.env`: `VITE_SITE_URL` (canonical / Open Graph) and optional `VITE_FORMSPREE_ID` (otherwise the form opens a `mailto:`).

## Deploy
- **Vercel / Netlify:** import the repo; build `npm run build`, output `dist`.
- **GitHub Pages:** `.github/workflows/deploy.yml` builds with `VITE_BASE=/Portfolio/` and publishes `dist` (enable Pages → Source: GitHub Actions).

## How it works
- `src/three/layout.ts` – board anchors, section→trace routing (`chain45` guarantees 45° bends; `npx esbuild scripts/check-routing.ts …` style checks live in `scripts/`).
- `src/three/keyframes.ts` – camera keyframes per section; `CameraRig` eases between them with damping, adds ≤2° pointer parallax (desktop) and offsets the focal point away from the text column.
- `src/hooks/useScrollProgress.ts` – maps scroll to the journey; the 3D reads a mutable store each frame (no React state per frame).
- Reduced motion or no WebGL: the 3D canvas is not mounted; a static render (`public/images/board-hero.jpg`) is used and reveals are instant.
- Dev-only helpers: `?capture=hero|og|p<section.progress>` renders just the scene (used to produce the static images); `?fast` removes the camera dt clamp for slow software GL.
