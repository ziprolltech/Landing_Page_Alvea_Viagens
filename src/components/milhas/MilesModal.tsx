'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, ChevronLeft, MessageCircle, X } from 'lucide-react'
import { WHATSAPP_NUMBER } from '@/lib/config/links'

/* MilesModal — shared shell for the two /milhas questionnaires.

   Owns everything that is not form content: portal, backdrop, dialog semantics,
   Esc to close, focus trap + focus return, body scroll lock, step indicator,
   progress bar, and the animated swap between steps. The parent decides what a
   step contains and what the footer buttons do. */

const EASE = [0.22, 1, 0.36, 1] as const
const GOLD_GRADIENT = 'linear-gradient(135deg, #D4A853 0%, #ECC96A 50%, #E8824A 100%)'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

interface MilesModalProps {
  titleId:    string
  title:      string
  subtitle:   string
  stepLabels: string[]
  step:       number          // zero-based
  direction:  number          // 1 forward · -1 back
  size?:      'md' | 'lg'
  onClose:    () => void
  footer:     React.ReactNode
  children:   React.ReactNode // content of the current step
}

export default function MilesModal({
  titleId, title, subtitle, stepLabels, step, direction, size = 'md', onClose, footer, children,
}: MilesModalProps) {
  const reduce    = useReducedMotion() ?? false
  const panelRef  = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  /* Latest onClose without re-running the mount effect (which would steal focus while typing) */
  const onCloseRef = useRef(onClose)
  useEffect(() => { onCloseRef.current = onClose }, [onClose])

  /* Scroll lock, Esc, focus trap, and focus return — once per open */
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null
    const previousOverflow  = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') { e.stopPropagation(); onCloseRef.current(); return }
      if (e.key !== 'Tab' || !panelRef.current) return

      const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE))
        .filter((el) => el.offsetParent !== null || el.classList.contains('sr-only'))
      if (items.length === 0) { e.preventDefault(); return }

      const first  = items[0]
      const last   = items[items.length - 1]
      const active = document.activeElement
      if (e.shiftKey && (active === first || active === panelRef.current)) {
        e.preventDefault(); last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault(); first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus?.()
    }
  }, [])

  /* Each step starts at the top */
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
  }, [step])

  if (typeof document === 'undefined') return null

  const stepVariants = {
    enter:  (dir: number) => ({ opacity: 0, x: reduce ? 0 : dir > 0 ? 28 : -28 }),
    center: { opacity: 1, x: 0, transition: { duration: reduce ? 0.2 : 0.32, ease: EASE } },
    exit:   (dir: number) => ({ opacity: 0, x: reduce ? 0 : dir > 0 ? -28 : 28, transition: { duration: reduce ? 0.15 : 0.22 } }),
  }

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-6"
      style={{
        background:           'rgba(5,13,26,0.88)',
        backdropFilter:       'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.28 } }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`relative flex h-[calc(100dvh-16px)] w-full flex-col overflow-hidden rounded-3xl focus:outline-none sm:h-auto sm:max-h-[calc(100dvh-48px)] ${
          size === 'lg' ? 'sm:max-w-[720px]' : 'sm:max-w-[600px]'
        }`}
        style={{
          background: 'rgba(7,16,34,0.98)',
          border:     '1px solid rgba(212,168,83,0.20)',
          boxShadow:  '0 48px 140px rgba(0,0,0,0.85), 0 0 0 1px rgba(212,168,83,0.05) inset',
        }}
        initial={{ opacity: 0, scale: reduce ? 1 : 0.96, y: reduce ? 0 : 16 }}
        animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: reduce ? 0.2 : 0.4, ease: EASE } }}
        exit={{ opacity: 0, scale: reduce ? 1 : 0.97, y: reduce ? 0 : 10, transition: { duration: 0.2 } }}
      >
        {/* ── Header ── */}
        <div className="shrink-0 px-5 pt-5 sm:px-8 sm:pt-7">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 id={titleId} className="text-[21px] font-black leading-tight tracking-[-0.01em] text-white sm:text-[24px]">
                {title}
              </h2>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-white/55">{subtitle}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white/80 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
            >
              <X size={17} aria-hidden="true" />
            </button>
          </div>

          {/* Step indicator + progress */}
          <div className="mt-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold" aria-live="polite">
              Etapa {step + 1} de {stepLabels.length}
              <span className="text-white/45"> · {stepLabels[step]}</span>
            </p>
            <div
              className="mt-2.5 flex gap-1.5"
              role="progressbar"
              aria-label="Progresso do questionário"
              aria-valuemin={1}
              aria-valuemax={stepLabels.length}
              aria-valuenow={step + 1}
            >
              {stepLabels.map((label, i) => (
                <div key={label} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #D4A853, #ECC96A)' }}
                    initial={false}
                    animate={{ width: i <= step ? '100%' : '0%' }}
                    transition={{ duration: reduce ? 0 : 0.38, ease: EASE }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Step content ── */}
        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-5 py-6 sm:px-8">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={step}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Footer ── */}
        <div className="shrink-0 border-t border-white/10 px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">{footer}</div>
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  )
}

/* ── Footer buttons ─────────────────────────────────────────────────────── */

const PRIMARY_CLASS =
  'btn-shimmer flex min-h-[50px] flex-1 items-center justify-center gap-2 rounded-full px-6 text-[14px] font-semibold text-sky-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70'

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[50px] items-center justify-center gap-1.5 rounded-full border border-white/15 bg-white/[0.05] px-5 text-[14px] font-semibold text-white/75 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
    >
      <ChevronLeft size={16} aria-hidden="true" />
      Voltar
    </button>
  )
}

export function ContinueButton({ onClick, label = 'Continuar' }: { onClick: () => void; label?: string }) {
  return (
    <button type="button" onClick={onClick} className={PRIMARY_CLASS} style={{ background: GOLD_GRADIENT }}>
      {label}
      <ArrowRight size={16} aria-hidden="true" />
    </button>
  )
}

/* Final action: opens WhatsApp in a new tab with the message written out.
   The message carries what the visitor typed (name, phone), so it is kept out
   of the link's own address: the `href` is the plain WhatsApp chat and the full
   address is opened on click. That way tools that record clicked links — such
   as Google Analytics' outbound-click measurement — never see personal data. */
export function WhatsAppButton({ href, label, onSend }: { href: string; label: string; onSend?: () => void }) {
  function open(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault()
    onSend?.()
    window.open(href, '_blank', 'noopener,noreferrer')
  }

  return (
    <a
      href={`https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}`}
      onClick={open}
      data-track-location="milhas_form"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} — abre o WhatsApp em nova aba`}
      className={`${PRIMARY_CLASS} cta-glow`}
      style={{ background: GOLD_GRADIENT }}
    >
      <MessageCircle size={16} strokeWidth={2} aria-hidden="true" />
      {label}
    </a>
  )
}
