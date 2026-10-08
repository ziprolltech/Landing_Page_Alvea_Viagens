// ─── WhatsApp messages for the /milhas page ───────────────────────────────────
// Pure builders: answers in, message text out. Nothing is stored or sent to a
// server — the text only becomes the `text` parameter of a WhatsApp link.
// A field with no answer is left out entirely (no "undefined", no empty label).

import { EMOJI } from '@/lib/utils/wa-emojis'
import { QUESTIONS, isAnswered, type Answers } from '@/lib/milhas/management-questionnaire'

const RULE = '━━━━━━━━━━━━━━━━━━'

function field(emoji: string, label: string, value: string | undefined): string {
  const text = (value ?? '').trim()
  return text ? `${emoji} *${label}:*\n${text}\n\n` : ''
}

function bulletList(items: string[]): string {
  return items.map((item) => `• ${item}`).join('\n')
}

/* ── Venda de Milhas ────────────────────────────────────────────────────── */

export interface SellMilesAnswers {
  nome:       string
  whatsapp:   string
  programa:   string   // airline/programme name as it should appear (list entry or typed)
  quantidade: string   // already formatted, e.g. "100.000"
}

export function buildSellMilesMessage(a: SellMilesAnswers): string {
  return (
    `${EMOJI.plane} *Olá, Alvea Viagens!*\n\n` +
    `Tenho interesse em *vender minhas milhas* e gostaria de receber uma avaliação.\n\n` +
    `${RULE}\n` +
    `${EMOJI.money} *DADOS DAS MILHAS*\n` +
    `${RULE}\n\n` +
    field(EMOJI.person,  'Nome',               a.nome) +
    field(EMOJI.phone,   'WhatsApp',           a.whatsapp) +
    field(EMOJI.plane,   'Companhia/Programa', a.programa) +
    field(EMOJI.numbers, 'Quantidade',         a.quantidade.trim() ? `${a.quantidade.trim()} milhas` : '') +
    `${RULE}\n\n` +
    `Gostaria de saber como podemos prosseguir com a avaliação.\n\n` +
    `Obrigado!`
  )
}

/* ── Gestão de Milhas ───────────────────────────────────────────────────── */

export interface ManagementContact {
  nome:     string
  email:    string
  telefone: string
}

function plainField(label: string, value: string): string {
  const text = value.trim()
  return text ? `*${label}:*\n${text}\n\n` : ''
}

// Built from the official question list, so the message always follows the
// questionnaire. Questions left unanswered are omitted (numbering is kept).
export function buildManagementMessage(contact: ManagementContact, answers: Answers): string {
  const profile = QUESTIONS.map((q) => {
    const value = answers[q.id]
    if (!isAnswered(value)) return ''
    const text = Array.isArray(value) ? bulletList(value) : (value as string)
    return plainField(`${q.number}. ${q.short}`, text)
  }).join('')

  return (
    `${EMOJI.plane} *Olá, Alvea Viagens!*\n\n` +
    `Tenho interesse em conhecer a *Gestão de Milhas* e gostaria de entender como ela pode se encaixar no meu perfil.\n\n` +
    `${RULE}\n` +
    `${EMOJI.person} *MEUS DADOS*\n` +
    `${RULE}\n\n` +
    plainField('Nome',     contact.nome) +
    plainField('E-mail',   contact.email) +
    plainField('Telefone', contact.telefone) +
    `${RULE}\n` +
    `${EMOJI.clipboard} *MEU PERFIL*\n` +
    `${RULE}\n\n` +
    profile +
    `${RULE}\n\n` +
    `Gostaria de conversar com a equipe da Alvea Viagens sobre meu perfil e entender as possibilidades da Gestão de Milhas.\n\n` +
    `Obrigado!`
  )
}

/* ── Input helpers shared by both forms ─────────────────────────────────── */

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}

// "50000" → "50.000" (digits only, pt-BR thousands)
export function formatMiles(value: string): string {
  const digits = digitsOnly(value).replace(/^0+(?=\d)/, '').slice(0, 10)
  return digits ? Number(digits).toLocaleString('pt-BR') : ''
}

// "16997315748" → "(16) 99731-5748"
export function formatPhone(value: string): string {
  const d = digitsOnly(value).slice(0, 11)
  if (d.length <= 2)  return d
  if (d.length <= 6)  return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export function isValidPhone(value: string): boolean {
  const length = digitsOnly(value).length
  return length === 10 || length === 11
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}
