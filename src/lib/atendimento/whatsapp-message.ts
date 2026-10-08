// ─── WhatsApp message for the "Envie sua solicitação" form (/atendimento) ─────
// Pure helpers: form values in, validation errors or message text out. Nothing
// is sent or stored — the text only pre-fills the WhatsApp message box, and the
// visitor still has to press "Enviar" there.

import { EMOJI } from '@/lib/utils/wa-emojis'

const RULE = '━━━━━━━━━━━━━━━━━━'

export interface ContactRequest {
  nome:     string
  email:    string
  telefone: string
  destino:  string
  mensagem: string
}

export type ContactRequestErrors = Partial<Record<keyof ContactRequest, string>>

export function validateContactRequest(form: ContactRequest): ContactRequestErrors {
  const errors: ContactRequestErrors = {}
  if (!form.nome.trim())     errors.nome = 'Informe seu nome.'
  if (!form.email.trim())    errors.email = 'Informe seu e-mail.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = 'Confira o e-mail informado, por exemplo nome@email.com.'
  }
  if (!form.telefone.trim()) errors.telefone = 'Informe seu telefone.'
  if (!form.destino.trim())  errors.destino = 'Informe o destino desejado.'
  if (!form.mensagem.trim()) errors.mensagem = 'Escreva uma mensagem.'
  return errors
}

function field(emoji: string, label: string, value: string): string {
  const text = value.trim()
  return text ? `${emoji} *${label}:*\n${text}\n\n` : ''
}

export function buildContactRequestMessage(form: ContactRequest): string {
  return (
    `${EMOJI.plane} *Olá, Alvea Viagens!*\n\n` +
    `Gostaria de solicitar atendimento e gostaria de conversar com um especialista sobre minha viagem.\n\n` +
    `${RULE}\n` +
    `${EMOJI.clipboard} *DADOS DA SOLICITAÇÃO*\n` +
    `${RULE}\n\n` +
    field(EMOJI.person, 'Nome',             form.nome) +
    field(EMOJI.email,  'E-mail',           form.email) +
    field(EMOJI.phone,  'Telefone',         form.telefone) +
    field(EMOJI.globe,  'Destino desejado', form.destino) +
    field(EMOJI.speech, 'Mensagem',         form.mensagem) +
    `${RULE}\n\n` +
    `Aguardo o contato da equipe da Alvea Viagens.\n\n` +
    `Obrigado!`
  )
}
