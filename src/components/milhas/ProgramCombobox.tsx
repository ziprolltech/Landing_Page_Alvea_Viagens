'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Check, ChevronDown, Search } from 'lucide-react'

/* ProgramCombobox — searchable single-select used by the "Venda de Milhas"
   questionnaire. A trigger shows the current choice; opening it reveals a
   search box and a scrollable list, inline (not floating), so nothing is
   clipped by the modal's scroll area and it stays comfortable on mobile.

   `otherOption` is always listed last, whatever is typed, so someone whose
   programme is not in the list can still continue. */

interface ProgramComboboxProps {
  id:           string
  label:        string
  placeholder:  string
  options:      string[]
  otherOption:  string
  value:        string
  onChange:     (value: string) => void
  error?:       string
}

function normalize(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

export default function ProgramCombobox({
  id, label, placeholder, options, otherOption, value, onChange, error,
}: ProgramComboboxProps) {
  const reduce = useReducedMotion() ?? false
  const [open,   setOpen]   = useState(false)
  const [query,  setQuery]  = useState('')
  const [active, setActive] = useState(0)

  const triggerRef = useRef<HTMLButtonElement>(null)
  const searchRef  = useRef<HTMLInputElement>(null)
  const listRef    = useRef<HTMLUListElement>(null)

  const labelId = `${id}-label`
  const listId  = `${id}-list`
  const errorId = `${id}-error`

  const visible = useMemo(() => {
    const q = normalize(query.trim())
    const matches = q ? options.filter((option) => normalize(option).includes(q)) : options
    return [...matches, otherOption]
  }, [options, otherOption, query])

  /* Focus the search box when the list opens */
  useEffect(() => {
    if (open) searchRef.current?.focus()
  }, [open])

  /* Keep the keyboard-highlighted option in view */
  useEffect(() => {
    if (!open) return
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active, open])

  function openList() {
    setQuery('')
    setActive(Math.max(0, [...options, otherOption].indexOf(value)))
    setOpen(true)
  }

  function close(returnFocus: boolean) {
    setOpen(false)
    if (returnFocus) triggerRef.current?.focus()
  }

  function select(option: string) {
    onChange(option)
    close(true)
  }

  function onSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(i + 1, visible.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (visible[active]) select(visible[active])
    } else if (e.key === 'Escape') {
      /* Close only the list — not the whole modal */
      e.preventDefault()
      e.stopPropagation()
      close(true)
    } else if (e.key === 'Tab') {
      close(false)
    }
  }

  return (
    <div>
      <span id={labelId} className="mb-2 block text-[13.5px] font-medium text-white/80">{label}</span>

      <button
        ref={triggerRef}
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-labelledby={`${labelId} ${id}`}
        aria-describedby={error ? errorId : undefined}
        onClick={() => (open ? close(false) : openList())}
        className={[
          'flex min-h-[50px] w-full items-center justify-between gap-3 rounded-xl border bg-white/[0.06] px-4 py-3 text-left text-[15px]',
          'transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40',
          open ? 'border-gold/50 bg-white/[0.09]' : error ? 'border-gold/60' : 'border-white/10',
          value ? 'text-white' : 'text-white/30',
        ].join(' ')}
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown
          size={17}
          aria-hidden="true"
          className={`shrink-0 text-gold/80 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="mt-2 overflow-hidden rounded-xl"
            style={{
              background: 'rgba(10,22,40,0.96)',
              border:     '1px solid rgba(212,168,83,0.24)',
              boxShadow:  '0 18px 48px rgba(0,0,0,0.45)',
              transformOrigin: 'top center',
            }}
            initial={{ opacity: 0, scale: reduce ? 1 : 0.98, y: reduce ? 0 : -4 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: reduce ? 0.12 : 0.18, ease: [0.22, 1, 0.36, 1] } }}
            exit={{ opacity: 0, scale: reduce ? 1 : 0.98, transition: { duration: 0.12 } }}
          >
            <div className="flex items-center gap-2.5 border-b border-white/10 px-4">
              <Search size={15} className="shrink-0 text-gold/70" aria-hidden="true" />
              <input
                ref={searchRef}
                type="text"
                role="combobox"
                aria-expanded="true"
                aria-controls={listId}
                aria-autocomplete="list"
                aria-activedescendant={visible[active] ? `${id}-option-${active}` : undefined}
                aria-label="Pesquisar companhia ou programa"
                placeholder="Pesquisar companhia ou programa"
                autoComplete="off"
                spellCheck={false}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setActive(0) }}
                onKeyDown={onSearchKeyDown}
                className="min-h-[48px] w-full bg-transparent text-[14.5px] text-white placeholder-white/30 focus:outline-none"
              />
            </div>

            <ul
              ref={listRef}
              id={listId}
              role="listbox"
              aria-labelledby={labelId}
              className="max-h-[240px] overflow-y-auto overscroll-contain py-1"
            >
              {visible.map((option, index) => {
                const selected = option === value
                const isOther  = option === otherOption
                return (
                  <li
                    key={option}
                    id={`${id}-option-${index}`}
                    data-index={index}
                    role="option"
                    aria-selected={selected}
                    onMouseEnter={() => setActive(index)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => select(option)}
                    className={[
                      'flex min-h-[46px] cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-[14px]',
                      index === active ? 'bg-gold/10 text-white' : 'text-white/80',
                      isOther ? 'border-t border-white/10 font-medium text-gold-light' : '',
                    ].join(' ')}
                  >
                    <span>{option}</span>
                    {selected && <Check size={15} strokeWidth={2.5} className="shrink-0 text-gold" aria-hidden="true" />}
                  </li>
                )
              })}
            </ul>

            {visible.length === 1 && (
              <p className="border-t border-white/10 px-4 py-2.5 text-[12px] text-white/45">
                Não encontramos esse nome na lista. Selecione “{otherOption}” para informar.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p id={errorId} role="alert" className="mt-2 text-[12.5px] text-gold-light">
          {error}
        </p>
      )}
    </div>
  )
}
