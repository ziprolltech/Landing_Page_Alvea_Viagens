'use client'

import { useState } from 'react'
import MilesModal, { BackButton, ContinueButton, WhatsAppButton } from './MilesModal'
import { TextField } from './FormFields'
import ProgramCombobox from './ProgramCombobox'
import { buildWhatsAppUrl } from '@/lib/config/links'
import {
  buildSellMilesMessage, formatMiles, formatPhone, isValidPhone,
} from '@/lib/milhas/whatsapp-messages'

/* Venda de Milhas — 3-step questionnaire that ends in a pre-filled WhatsApp
   message. Nothing is sent to a server or stored. */

const STEP_LABELS = ['Seus dados', 'Suas milhas', 'Revisão e envio']

const PROGRAMS = [
  'Azul',
  'LATAM Pass',
  'Smiles',
  'TudoAzul',
  'TAP Miles&Go',
  'Iberia Plus',
  'AAdvantage',
  'MileagePlus',
  'Flying Blue',
  'Avios',
  'Aeroplan',
  'Emirates Skywards',
  'Qatar Airways Privilege Club',
  'British Airways Executive Club',
  'Delta SkyMiles',
  'Miles & More',
  'Turkish Airlines Miles&Smiles',
  'Etihad Guest',
  'LifeMiles',
  'ConnectMiles',
  'Livelo',
  'Esfera',
]
const OTHER_PROGRAM = 'Outra companhia/programa'

interface FormState {
  nome:          string
  whatsapp:      string
  programa:      string   // an entry of PROGRAMS, or OTHER_PROGRAM
  outroPrograma: string   // typed name, used when programa === OTHER_PROGRAM
  quantidade:    string
}

const EMPTY: FormState = { nome: '', whatsapp: '', programa: '', outroPrograma: '', quantidade: '' }

type Errors = Partial<Record<keyof FormState, string>>

function validate(step: number, f: FormState): Errors {
  const e: Errors = {}
  if (step === 0) {
    if (!f.nome.trim())                 e.nome = 'Informe seu nome.'
    if (!f.whatsapp.trim())             e.whatsapp = 'Informe seu WhatsApp.'
    else if (!isValidPhone(f.whatsapp)) e.whatsapp = 'Informe o WhatsApp com DDD, por exemplo (16) 99999-9999.'
  }
  if (step === 1) {
    if (!f.programa) e.programa = 'Informe a companhia ou o programa de milhas.'
    else if (f.programa === OTHER_PROGRAM && !f.outroPrograma.trim()) {
      e.outroPrograma = 'Informe qual é a companhia ou o programa.'
    }
    if (!f.quantidade) e.quantidade = 'Informe a quantidade de milhas.'
  }
  return e
}

export default function SellMilesModal({ onClose }: { onClose: () => void }) {
  const [step,      setStep]      = useState(0)
  const [direction, setDirection] = useState(1)
  const [form,      setForm]      = useState<FormState>(EMPTY)
  const [errors,    setErrors]    = useState<Errors>({})

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev))
  }

  function next() {
    const found = validate(step, form)
    setErrors(found)
    if (Object.keys(found).length > 0) return
    setDirection(1)
    setStep((s) => s + 1)
  }

  function back() {
    setErrors({})
    setDirection(-1)
    setStep((s) => s - 1)
  }

  const isLast      = step === STEP_LABELS.length - 1
  const programName = form.programa === OTHER_PROGRAM ? form.outroPrograma.trim() : form.programa
  const message     = buildSellMilesMessage({
    nome: form.nome, whatsapp: form.whatsapp, programa: programName, quantidade: form.quantidade,
  })

  return (
    <MilesModal
      titleId="venda-milhas-title"
      title="Venda suas milhas"
      subtitle="Preencha algumas informações e envie sua solicitação diretamente para nossa equipe."
      stepLabels={STEP_LABELS}
      step={step}
      direction={direction}
      onClose={onClose}
      footer={
        <>
          {step > 0 && <BackButton onClick={back} />}
          {isLast
            ? <WhatsAppButton href={buildWhatsAppUrl(message)} label="Enviar para a Alvea" />
            : <ContinueButton onClick={next} />}
        </>
      }
    >
      {step === 0 && (
        <div className="flex flex-col gap-5">
          <TextField
            id="venda-nome" label="Nome" value={form.nome} error={errors.nome}
            placeholder="Seu nome" autoComplete="name"
            onChange={(v) => set('nome', v)}
          />
          <TextField
            id="venda-whatsapp" label="WhatsApp" value={form.whatsapp} error={errors.whatsapp}
            placeholder="(16) 99999-9999" type="tel" inputMode="tel" autoComplete="tel"
            onChange={(v) => set('whatsapp', formatPhone(v))}
          />
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-col gap-6">
          <ProgramCombobox
            id="venda-programa"
            label="Companhia/programa de milhas"
            placeholder="Selecione a companhia/programa"
            options={PROGRAMS}
            otherOption={OTHER_PROGRAM}
            value={form.programa}
            error={errors.programa}
            onChange={(v) => set('programa', v)}
          />
          {form.programa === OTHER_PROGRAM && (
            <TextField
              id="venda-outro-programa" label="Qual companhia ou programa?"
              value={form.outroPrograma} error={errors.outroPrograma}
              placeholder="Ex.: Etihad Guest"
              onChange={(v) => set('outroPrograma', v)}
            />
          )}
          <TextField
            id="venda-quantidade" label="Quantidade de milhas" value={form.quantidade} error={errors.quantidade}
            placeholder="Ex.: 100.000" inputMode="numeric"
            onChange={(v) => set('quantidade', formatMiles(v))}
          />
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold">Resumo da solicitação</p>
            <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              {[
                ['Nome',               form.nome],
                ['WhatsApp',           form.whatsapp],
                ['Companhia/programa', programName],
                ['Quantidade',         `${form.quantidade} milhas`],
              ].map(([term, detail]) => (
                <div key={term}>
                  <dt className="text-[12px] text-white/45">{term}</dt>
                  <dd className="text-[14px] font-medium text-white break-words">{detail}</dd>
                </div>
              ))}
            </dl>
          </div>

          <p className="text-[13px] leading-relaxed text-white/55">
            Confira os dados acima. Ao enviar, o WhatsApp será aberto com uma mensagem pronta contendo
            essas informações, e nossa equipe continuará a conversa por lá.
          </p>
        </div>
      )}
    </MilesModal>
  )
}
