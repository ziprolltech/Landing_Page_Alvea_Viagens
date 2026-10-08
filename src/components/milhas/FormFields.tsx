'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Check } from 'lucide-react'

/* Shared form primitives for the /milhas questionnaires.
   Every option is a real <input> (radio or checkbox) inside a <label>, so it is
   reachable and operable by keyboard and announced correctly. Selection is shown
   by a check mark as well as by colour. */

const EASE = [0.22, 1, 0.36, 1] as const

const INPUT_CLASS = [
  'w-full min-h-[50px] rounded-xl border bg-white/[0.06] px-4 py-3',
  'text-[15px] text-white placeholder-white/30',
  'transition-colors duration-200',
  'focus:outline-none focus:border-gold/50 focus:bg-white/[0.09]',
  'focus-visible:ring-2 focus-visible:ring-gold/40',
].join(' ')

function Label({ htmlFor, children, optional }: { htmlFor?: string; children: React.ReactNode; optional?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-[13.5px] font-medium text-white/80">
      {children}
      {optional && <span className="ml-1.5 font-normal text-white/40">(opcional)</span>}
    </label>
  )
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} role="alert" className="mt-2 text-[12.5px] text-gold-light">
      {message}
    </p>
  )
}

/* ── Text input / textarea ──────────────────────────────────────────────── */

interface TextFieldProps {
  id:            string
  label:         string
  value:         string
  onChange:      (value: string) => void
  placeholder?:  string
  error?:        string
  optional?:     boolean
  type?:         'text' | 'tel' | 'email'
  inputMode?:    'text' | 'numeric' | 'tel' | 'email'
  autoComplete?: string
  multiline?:    boolean
}

export function TextField({
  id, label, value, onChange, placeholder, error, optional,
  type = 'text', inputMode, autoComplete, multiline,
}: TextFieldProps) {
  const errorId = `${id}-error`
  const shared = {
    id,
    value,
    placeholder,
    'aria-invalid':     error ? true : undefined,
    'aria-describedby': error ? errorId : undefined,
    className: `${INPUT_CLASS} ${error ? 'border-gold/60' : 'border-white/10'}`,
  }

  return (
    <div>
      <Label htmlFor={id} optional={optional}>{label}</Label>
      {multiline ? (
        <textarea
          {...shared}
          rows={4}
          onChange={(e) => onChange(e.target.value)}
          style={{ resize: 'vertical' }}
        />
      ) : (
        <input
          {...shared}
          type={type}
          inputMode={inputMode}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      <FieldError id={errorId} message={error} />
    </div>
  )
}

/* ── Single or multiple choice ──────────────────────────────────────────────
   Options are laid out on a strict grid: two equal columns from `sm`, one below.
   `auto-rows-fr` gives every row the height of the tallest one, so all cards in
   a group are identical in size however their text wraps; an odd option out
   keeps its single cell and the neighbouring cell stays empty.

   The visual marker is always a square check box (also for single-choice
   questions, by design); the input underneath is a radio or a checkbox, so the
   behaviour and what assistive technology announces stay correct. */

interface ChoiceGroupProps {
  name:      string
  legend:    string
  options:   string[]
  value:     string | string[]
  onChange:  (value: string | string[]) => void
  multiple?: boolean
  required?: boolean
  error?:    string
}

export function ChoiceGroup({
  name, legend, options, value, onChange, multiple = false, required = false, error,
}: ChoiceGroupProps) {
  const reduce   = useReducedMotion() ?? false
  const errorId  = `${name}-error`
  const selected = Array.isArray(value) ? value : value ? [value] : []

  function toggle(option: string) {
    if (!multiple) { onChange(option); return }
    onChange(selected.includes(option) ? selected.filter((v) => v !== option) : [...selected, option])
  }

  /* Legend first, then the cards in a quick, subtle cascade */
  const group = {
    hidden: {},
    show:   { transition: { staggerChildren: reduce ? 0 : 0.04, delayChildren: reduce ? 0 : 0.05 } },
  }
  const item = {
    hidden: { opacity: 0, y: reduce ? 0 : 8 },
    show:   { opacity: 1, y: 0, transition: { duration: reduce ? 0.15 : 0.3, ease: EASE } },
  }

  return (
    <motion.fieldset
      variants={group}
      initial="hidden"
      animate="show"
      aria-describedby={error ? errorId : undefined}
      aria-required={required || undefined}
      className="min-w-0"
    >
      <motion.legend variants={item} className="mb-1 block text-[15px] font-semibold leading-snug text-white">
        {legend}
        {required && (
          <span className="ml-2 inline-block align-middle rounded-full border border-gold/30 bg-gold/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-gold">
            Obrigatória
          </span>
        )}
      </motion.legend>

      {multiple && (
        <motion.p variants={item} className="mb-3 text-[12.5px] text-white/50">
          Você pode selecionar mais de uma opção.
        </motion.p>
      )}

      <div className={`grid auto-rows-fr grid-cols-1 gap-2.5 sm:grid-cols-2 ${multiple ? '' : 'mt-3'}`}>
        {options.map((option) => {
          const checked = selected.includes(option)
          return (
            <motion.label key={option} variants={item} className="relative block h-full cursor-pointer">
              <input
                type={multiple ? 'checkbox' : 'radio'}
                name={name}
                value={option}
                checked={checked}
                onChange={() => toggle(option)}
                className="peer sr-only"
              />
              <span
                className={[
                  'flex h-full min-h-[58px] items-center gap-3.5 rounded-xl border px-4 py-3',
                  'text-[14px] leading-snug transition-[background-color,border-color,box-shadow,color] duration-200',
                  'peer-focus-visible:ring-2 peer-focus-visible:ring-gold/60',
                  checked
                    ? 'border-gold/55 bg-gold/10 text-white shadow-[0_0_22px_rgba(212,168,83,0.10)]'
                    : 'border-white/10 bg-white/[0.04] text-white/75 hover:border-white/25 hover:bg-white/[0.06]',
                ].join(' ')}
              >
                <motion.span
                  className={[
                    'flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md border transition-colors duration-200',
                    checked ? 'border-gold bg-gold text-sky-deep' : 'border-white/35 bg-transparent',
                  ].join(' ')}
                  initial={false}
                  animate={reduce ? undefined : { scale: checked ? [1, 1.16, 1] : 1 }}
                  transition={{ duration: 0.28, ease: EASE }}
                  aria-hidden="true"
                >
                  <motion.span
                    className="flex"
                    initial={false}
                    animate={{ opacity: checked ? 1 : 0, scale: checked || reduce ? 1 : 0.5 }}
                    transition={{ duration: reduce ? 0.1 : 0.18, ease: EASE }}
                  >
                    <Check size={14} strokeWidth={3} />
                  </motion.span>
                </motion.span>
                <span className="min-w-0 break-words">{option}</span>
              </span>
            </motion.label>
          )
        })}
      </div>

      <FieldError id={errorId} message={error} />
    </motion.fieldset>
  )
}
