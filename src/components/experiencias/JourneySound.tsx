'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Volume2, VolumeX } from 'lucide-react'
import { motion, useMotionValueEvent, useReducedMotion, useTransform, type MotionValue } from 'framer-motion'
import { SOUND_FILES } from '@/data/experiencias-audio'
import { JourneySoundEngine, soundSupported } from '@/lib/experiencias/sound-engine'
import { FIRST_CHAPTER_END, cuesBetween, locate, mixAt } from '@/lib/experiencias/sound-score'
import { EASE } from './scene'

/* The sound of the journey — optional, and off every time the page is entered.

   Behaviour
   ─────────
   · Nothing is created and nothing plays until the visitor asks for it: the
     audio engine is built inside the click that switches the sound on (which
     is also what browsers' autoplay rules require).
   · The invitation only appears once the visitor has started to scroll, as a
     small piece of the interface in the corner. After a few seconds, or once
     the sound is on, it shrinks to a round control; its label comes back on
     hover, on keyboard focus, and for a moment after each toggle.
   · The sound follows the scroll: this component listens to the journey's
     existing Framer Motion progress (no scroll listener of its own), turns it
     into "chapter + progress inside the chapter", asks the score for the mix
     at that point and hands it to the engine, which glides to it.
   · Switching on in the middle of a scene starts from that scene's sound.
   · Leaving the route unmounts this component, which disposes of the engine:
     every source is stopped and the AudioContext is closed. The choice is not
     stored anywhere, so coming back starts silent again.
   · While the tab is hidden the sound is held; it returns with the tab.

   Rendered through a portal on <body> for the same reason as the progress
   dots: the page-transition wrapper keeps a `filter`, which would turn
   `position: fixed` into absolute. */

const INVITE_AFTER = 0.008   // journey progress at which the invitation appears
const SHRINK_AFTER = 9000    // ms the full invitation stays before becoming a small control …
const SHRINK_SOON  = 3000    // … or this long once the visitor is past the first chapter, where there is more on screen

export default function JourneySound({ progress }: { progress: MotionValue<number> }) {
  const reduced = useReducedMotion() ?? false
  const [mounted, setMounted]     = useState(false)
  const [supported, setSupported] = useState(false)
  const [invited, setInvited]     = useState(false)
  const [compact, setCompact]     = useState(false)
  const [activated, setActivated] = useState(false)  // has been switched on at least once
  const [enabled, setEnabled]     = useState(false)
  const [hint, setHint]           = useState(false)  // the label, shown for a moment after a toggle
  const [deep, setDeep]           = useState(false)  // past the first chapter

  const engine     = useRef<JourneySoundEngine | null>(null)
  const enabledRef = useRef(false)
  const place      = useRef<number | null>(null)

  useEffect(() => {
    setMounted(true)
    setSupported(soundSupported())
    /* already scrolled when the page became interactive (reload mid-journey) */
    if (progress.get() > INVITE_AFTER) setInvited(true)
    if (progress.get() > FIRST_CHAPTER_END) setDeep(true)
  }, [progress])

  /* Glide the engine to the mix for the current scroll position */
  const follow = useCallback((journeyProgress: number, snap = false) => {
    const sound = engine.current
    if (!sound) return
    const position = locate(journeyProgress)
    sound.apply(mixAt(position.id, position.progress), snap)
    if (!snap && place.current !== null) {
      for (const { cue, backwards } of cuesBetween(place.current, position.place)) sound.cue(cue, backwards)
    }
    place.current = position.place
  }, [])

  useMotionValueEvent(progress, 'change', (value) => {
    if (!invited && value > INVITE_AFTER) setInvited(true)
    if (!deep && value > FIRST_CHAPTER_END) setDeep(true)
    if (enabledRef.current) follow(value)
  })

  /* The full invitation gives way to a small control after a while */
  useEffect(() => {
    if (!invited || compact) return
    const timer = setTimeout(() => setCompact(true), deep ? SHRINK_SOON : SHRINK_AFTER)
    return () => clearTimeout(timer)
  }, [invited, compact, deep])

  /* After a toggle the state is spelled out briefly — touch screens have no hover */
  useEffect(() => {
    if (!hint) return
    const timer = setTimeout(() => setHint(false), 2400)
    return () => clearTimeout(timer)
  }, [hint, enabled])

  /* Hold the sound while the tab is hidden */
  useEffect(() => {
    const onVisibility = () => engine.current?.hold(document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  /* Leaving /experiencias: stop everything and release the audio resources */
  useEffect(() => {
    return () => {
      enabledRef.current = false
      engine.current?.dispose()
      engine.current = null
      if (process.env.NODE_ENV !== 'production') delete (window as unknown as Record<string, unknown>).__journeySound
    }
  }, [])

  const toggle = () => {
    const next = !enabledRef.current
    enabledRef.current = next
    setEnabled(next)
    setCompact(true)
    setHint(true)
    if (next) {
      setActivated(true)
      if (!engine.current) {
        try {
          engine.current = new JourneySoundEngine(SOUND_FILES)
          /* development only: lets the levels be inspected from the console */
          if (process.env.NODE_ENV !== 'production') (window as unknown as Record<string, unknown>).__journeySound = engine.current
        } catch {
          enabledRef.current = false
          setEnabled(false)
          setSupported(false)
          return
        }
      }
      place.current = null
      follow(progress.get(), true)       // start from the sound of this exact moment
      void engine.current.start()
    } else {
      void engine.current?.setEnabled(false)
    }
  }

  /* Like the progress dots, it steps aside before the footer */
  const visibility = useTransform(progress, [0.985, 1], [1, 0])
  const pointer    = useTransform(progress, (p) => (p < 0.99 ? 'auto' : 'none'))

  if (!mounted || !supported || !invited) return null

  const label  = enabled ? 'Som ligado' : activated ? 'Som desligado' : 'Experiência sonora'
  const action = enabled ? 'Desligar a experiência sonora' : 'Ativar a experiência sonora'
  const Icon   = enabled || !activated ? Volume2 : VolumeX

  return createPortal(
    <motion.div
      /* Bottom-right corner, inside the safe areas. On small screens it sits a
         little higher, clear of the lines some scenes set along the bottom edge. */
      className="fixed z-40 right-[max(12px,env(safe-area-inset-right))] bottom-[calc(118px+env(safe-area-inset-bottom))] lg:right-[max(16px,env(safe-area-inset-right))] lg:bottom-[max(16px,env(safe-area-inset-bottom))]"
      style={{ opacity: visibility, pointerEvents: pointer }}
    >
      <motion.button
        type="button"
        onClick={toggle}
        aria-pressed={enabled}
        aria-label={action}
        title={action}
        initial={{ opacity: 0, y: reduced ? 0 : 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduced ? 0.3 : 0.9, ease: EASE }}
        className="group flex h-10 items-center rounded-full border border-white/10 px-[11px] lg:h-11 lg:px-[13px] text-white/80 backdrop-blur-md transition-colors duration-300 hover:border-gold/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
        style={{
          background: 'rgba(5,13,26,0.6)',
          boxShadow: enabled
            ? '0 10px 30px rgba(0,0,0,0.35), 0 0 22px rgba(212,168,83,0.16)'
            : '0 10px 30px rgba(0,0,0,0.35)',
        }}
      >
        <span className="relative flex h-[18px] w-[18px] shrink-0 items-center justify-center">
          <Icon size={17} strokeWidth={1.75} className={enabled || !activated ? 'text-gold-light' : 'text-white/55'} aria-hidden="true" />
        </span>

        {/* Label: open as an invitation, then only on hover / keyboard focus */}
        <span
          className={`block overflow-hidden transition-[max-width,opacity] duration-500 ease-out motion-reduce:transition-none ${
            compact && !hint
              ? 'max-w-0 opacity-0 [@media(hover:hover)]:group-hover:max-w-[300px] [@media(hover:hover)]:group-hover:opacity-100 group-focus-visible:max-w-[300px] group-focus-visible:opacity-100'
              : 'max-w-[300px] opacity-100'
          }`}
          aria-hidden="true"
        >
          <span className="flex items-center gap-2.5 whitespace-nowrap pl-2.5 pr-1">
            <span className="text-[10px] font-semibold uppercase tracking-[0.24em]">{label}</span>
            {!activated && (
              <>
                <span className="h-3 w-px bg-white/20" />
                <span className="text-[11px] font-medium text-gold">Ativar som</span>
              </>
            )}
          </span>
        </span>
      </motion.button>

      {/* Announces the change to assistive technology */}
      <span className="sr-only" role="status" aria-live="polite">
        {activated ? (enabled ? 'Experiência sonora ligada' : 'Experiência sonora desligada') : ''}
      </span>
    </motion.div>,
    document.body,
  )
}
