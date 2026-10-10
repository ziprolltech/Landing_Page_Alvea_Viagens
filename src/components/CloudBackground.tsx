'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

/* ─────────────────────────────────────────────────────────────────────────────
   REALISTIC CLOUD SYSTEM

   Technique: stacked, heavily-blurred div layers at varying opacity, size,
   and depth. Multiple overlapping blobs per "formation" create volumetric,
   photographic-quality cloud mass. No SVG shapes — pure CSS blur + opacity.

   Three tint types:
   • white       — sunlit cloud tops / highlights
   • cool-shadow — blue-gray cloud bases (underside, in shade)
   • haze        — very wide atmospheric depth layers near horizon

   Animations are near-imperceptible: scale ±1.5%, translate ±4px, opacity ±10%
   over 110–200 second cycles. The sky "breathes" without noticeably moving.
───────────────────────────────────────────────────────────────────────────── */

type BlobType = 'white' | 'cool-shadow' | 'haze'

interface BlobDef {
  id:    string
  w:     number          // px width
  h:     number          // px height
  top:   string          // % from top
  left:  string          // % from left
  op:    number          // opacity 0–1
  blur:  number          // px blur
  dur:   number          // animation duration (s) — very long for subtlety
  dl:    number          // delay (s)
  type?: BlobType        // default 'white'
  br?:   string          // optional border-radius override
}

/* ── Color map ── */
const BG: Record<BlobType, string> = {
  'white':        'rgb(252, 254, 255)',
  'cool-shadow':  'rgb(190, 210, 232)',
  'haze':         'rgb(210, 228, 245)',
}

/* ────────────────────────────────────────────────────────────────────────────
   BLOB DEFINITIONS

   Organized by zone (distance from top of hero):
   • 10-22%  — cirrus zone (high-altitude, very thin, nearly transparent)
   • 22-42%  — main cumulus formations (cloud bodies + highlights)
   • 42-55%  — lower cloud layer + shadow bases
   • 55-75%  — atmospheric depth haze
────────────────────────────────────────────────────────────────────────────── */
const BLOBS: BlobDef[] = [

  /* ── CIRRUS ZONE — high, thin, horizontal ─────────────────────────────── */
  { id:'ci1', w:1050, h:115, top:'10%', left:'-8%',  op:0.034, blur:118, dur:158, dl:0  },
  { id:'ci2', w:780,  h: 98, top:'16%', left:'32%',  op:0.028, blur:132, dur:172, dl:24 },
  { id:'ci3', w:580,  h: 88, top:'20%', left:'63%',  op:0.030, blur:110, dur:150, dl:14 },

  /* ── LEFT CLOUD FORMATION ─────────────────────────────────────────────── */
  /* Shadow base first (renders below, creates natural cloud underside) */
  { id:'ll0', w:640, h:240, top:'35%', left:'-7%',  op:0.024, blur:108, dur:148, dl:4,  type:'cool-shadow' },
  /* Main body */
  { id:'ll1', w:520, h:370, top:'23%', left:'-7%',  op:0.055, blur:84,  dur:120, dl:7  },
  /* Bright mid-layer */
  { id:'ll2', w:360, h:320, top:'19%', left:'-1%',  op:0.076, blur:58,  dur:110, dl:18 },
  /* Sunlit highlight crown */
  { id:'ll3', w:260, h:240, top:'16%', left:'7%',   op:0.100, blur:42,  dur:125, dl:32 },
  /* Bright accent */
  { id:'ll4', w:160, h:160, top:'14%', left:'12%',  op:0.115, blur:30,  dur:138, dl:48 },

  /* ── RIGHT CLOUD FORMATION ────────────────────────────────────────────── */
  { id:'rl0', w:680, h:230, top:'34%', left:'60%',  op:0.022, blur:112, dur:152, dl:2,  type:'cool-shadow' },
  { id:'rl1', w:560, h:390, top:'21%', left:'61%',  op:0.058, blur:82,  dur:124, dl:15 },
  { id:'rl2', w:390, h:340, top:'16%', left:'68%',  op:0.078, blur:56,  dur:112, dl:28 },
  { id:'rl3', w:290, h:260, top:'14%', left:'75%',  op:0.102, blur:40,  dur:130, dl:44 },
  { id:'rl4', w:180, h:170, top:'12%', left:'80%',  op:0.118, blur:28,  dur:142, dl:58 },

  /* ── CENTER-RIGHT FORMATION (mid-distance) ────────────────────────────── */
  { id:'cl0', w:720, h:250, top:'36%', left:'25%',  op:0.020, blur:115, dur:155, dl:6,  type:'cool-shadow' },
  { id:'cl1', w:640, h:350, top:'26%', left:'28%',  op:0.046, blur:88,  dur:134, dl:22 },
  { id:'cl2', w:460, h:300, top:'22%', left:'35%',  op:0.062, blur:66,  dur:116, dl:36 },
  { id:'cl3', w:320, h:240, top:'19%', left:'42%',  op:0.082, blur:48,  dur:126, dl:50 },

  /* ── LOWER LAYER + ATMOSPHERIC TRANSITION ─────────────────────────────── */
  { id:'lo1', w:900,  h:200, top:'44%', left:'-6%',  op:0.028, blur:105, dur:162, dl:0,  type:'cool-shadow' },
  { id:'lo2', w:750,  h:180, top:'48%', left:'22%',  op:0.022, blur:115, dur:170, dl:18, type:'cool-shadow' },
  { id:'lo3', w:850,  h:190, top:'46%', left:'52%',  op:0.024, blur:108, dur:165, dl:10, type:'cool-shadow' },

  /* ── ATMOSPHERIC DEPTH HAZE (very large, near-invisible) ─────────────── */
  { id:'hz1', w:1400, h:200, top:'54%', left:'-10%', op:0.016, blur:145, dur:185, dl:0,  type:'haze' },
  { id:'hz2', w:1200, h:175, top:'61%', left:'5%',   op:0.013, blur:162, dur:198, dl:28, type:'haze' },
  { id:'hz3', w:1000, h:155, top:'68%', left:'15%',  op:0.010, blur:178, dur:215, dl:16, type:'haze' },
]

/* ── Very sparse, barely-visible stars in the dark upper atmosphere ── */
const STARS = Array.from({ length: 45 }, (_, i) => ({
  id:    i,
  x:     (i * 97.3 + 11) % 100,
  y:     (i * 53.7 + 3)  % 38,   // only upper 38% — dark sky zone
  size:  i % 4 === 0 ? 1.5 : 1,
  delay: (i * 0.31) % 6,
  dur:   3 + (i % 3) * 0.8,
}))

/* ── Should the clouds "breathe"? ─────────────────────────────────────────────
   Only on large screens with a mouse. On phones the clouds are drawn still.

   Why: each animated blob is its own GPU layer (will-change) holding a blurred
   surface far larger than a phone screen — up to 1400px wide plus the blur
   radius, times the device pixel ratio — and there are 23 of them, each updated
   on every frame, forever. Phones, and in-app browsers such as Instagram's in
   particular, have a small graphics-memory budget; when it is exceeded the
   browser keeps discarding and redrawing those layers, which shows as the top
   of the page flickering. The movement itself is ±1.5% over two minutes, so a
   still cloud looks the same.

   Starts `false` so the server and the first client render agree. */
function useBreathingClouds(): boolean {
  const [breathing, setBreathing] = useState(false)
  useEffect(() => {
    const query = window.matchMedia('(min-width: 1024px) and (pointer: fine)')
    const update = () => setBreathing(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  return breathing
}

/* A w×h ellipse blurred by `blur` px, as a plain radial gradient */
function erf(x: number): number {
  const t = 1 / (1 + 0.3275911 * x)
  return 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x)
}

function softEllipse(def: BlobDef, color: string): React.CSSProperties {
  const spread = def.blur * 2
  const edge = (size: number) => size / 2 / (size / 2 + spread)          // where the original edge falls
  const core = (size: number) => Math.max(0, size / 2 - spread) / (size / 2 + spread)
  /* a blur wider than the shape also dilutes its centre */
  const peak = erf(def.w / 2 / (def.blur * Math.SQRT2)) * erf(def.h / 2 / (def.blur * Math.SQRT2))
  const rgb = color.replace('rgb(', '').replace(')', '')
  const pct = (n: number) => `${(n * 100).toFixed(1)}%`
  const e = (edge(def.w) + edge(def.h)) / 2
  const c = (core(def.w) + core(def.h)) / 2
  return {
    position:   'absolute',
    width:      def.w + spread * 2,
    height:     def.h + spread * 2,
    top:        def.top,
    left:       def.left,
    marginTop:  -spread,
    marginLeft: -spread,
    opacity:    +(def.op * peak).toFixed(4),
    background: `radial-gradient(ellipse closest-side, rgba(${rgb},1) ${pct(c)}, rgba(${rgb},0.5) ${pct(e)}, rgba(${rgb},0) 100%)`,
  }
}

/* ── Single cloud blob component ── */
function Blob({ def, breathing }: { def: BlobDef; breathing: boolean }) {
  const type = def.type ?? 'white'
  const style: React.CSSProperties = {
    position:     'absolute',
    width:        def.w,
    height:       def.h,
    top:          def.top,
    left:         def.left,
    borderRadius: def.br ?? '50%',
    background:   BG[type],
    filter:       `blur(${def.blur}px)`,
    opacity:      def.op,
  }

  /* Still cloud (phones): no filter at all. A blurred ellipse is drawn as the
     radial gradient it looks like, which costs nothing to repaint — blur
     filters this large are what breaks painting when a phone zooms in. */
  if (!breathing) return <div style={softEllipse(def, BG[type])} />

  return (
    <motion.div
      style={{ ...style, willChange: 'transform, opacity' }}
      animate={{
        opacity: [
          def.op,
          def.op * 1.10,
          def.op * 0.91,
          def.op * 1.06,
          def.op,
        ],
        scale: [1, 1.014, 0.988, 1.009, 1],
        x:     [0,  3,    -2,    4,     0],
        y:     [0, -3,     2,   -2,     0],
      }}
      transition={{
        duration: def.dur,
        ease:     'easeInOut',
        repeat:   Infinity,
        delay:    def.dl,
      }}
    />
  )
}

export default function CloudBackground() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const breathing = useBreathingClouds()

  /* Parallax — far layer moves slower, near layer moves faster */
  const yFar   = useTransform(scrollYProgress, [0, 1], ['0%',  '22%'])
  const yNear  = useTransform(scrollYProgress, [0, 1], ['0%',  '40%'])
  const opaque = useTransform(scrollYProgress, [0, 0.72], [1, 0])

  /* Split blobs into two parallax groups */
  const farBlobs  = BLOBS.filter(b => ['ci1','ci2','ci3','ll0','ll1','rl0','rl1','cl0','cl1','hz1','hz2','hz3','lo1','lo2','lo3'].includes(b.id))
  const nearBlobs = BLOBS.filter(b => !farBlobs.find(f => f.id === b.id))

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden pointer-events-none select-none">

      {/* ── Photographic sky gradient ── */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(
            180deg,
            #020810 0%,
            #03101E 8%,
            #061826 18%,
            #0A2340 33%,
            #112D52 50%,
            #173965 66%,
            #1F4674 80%,
            #285383 90%,
            #305C8C 100%
          )`,
        }}
      />

      {/* ── Directional sunlight scatter — upper-right, cold blue-white ── */}
      <div
        className="absolute max-lg:!blur-none"
        style={{
          top:        '-8%',
          right:      '5%',
          width:      '55%',
          height:     '48%',
          background: 'radial-gradient(ellipse, rgba(165,210,255,0.065) 0%, transparent 62%)',
          filter:     'blur(55px)',
        }}
      />

      {/* ── Horizon warm glow — sunlight on distant atmosphere ── */}
      <div
        className="absolute bottom-0 inset-x-0"
        style={{
          height:     '32%',
          background: 'linear-gradient(0deg, rgba(38,78,130,0.28) 0%, transparent 100%)',
        }}
      />

      {/* ── Subtle gold warmth — brand atmosphere ── */}
      <div
        className="absolute animate-pulse-soft max-lg:!blur-none"
        style={{
          top:        '18%',
          left:       '28%',
          width:      '44%',
          height:     '28%',
          background: 'radial-gradient(ellipse, rgba(212,168,83,0.045) 0%, transparent 68%)',
          filter:     'blur(45px)',
        }}
      />

      {/* ── Star field — upper atmosphere ── */}
      <div className="absolute inset-0">
        {STARS.map((s) => (
          <span
            key={s.id}
            className="absolute rounded-full bg-white"
            style={{
              left:      `${s.x}%`,
              top:       `${s.y}%`,
              width:     s.size,
              height:    s.size,
              opacity:   0.18,
              animation: `starTwinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* ── Far cloud layer (parallax slower) ── */}
      <motion.div className="absolute inset-0" style={{ y: yFar, opacity: opaque }}>
        {farBlobs.map((b) => <Blob key={b.id} def={b} breathing={breathing} />)}
      </motion.div>

      {/* ── Near cloud layer (parallax faster) ── */}
      <motion.div className="absolute inset-0" style={{ y: yNear, opacity: opaque }}>
        {nearBlobs.map((b) => <Blob key={b.id} def={b} breathing={breathing} />)}
      </motion.div>

      {/* ── Upper vignette — deepens the near-space feel ── */}
      <div
        className="absolute top-0 inset-x-0"
        style={{
          height:     '14%',
          background: 'linear-gradient(180deg, rgba(2,8,16,0.55) 0%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
