// ─── WhatsApp oficial da Alvea (atendimento) ──────────────────────────────────
// Número oficial, o mesmo usado no restante do site. A página de Milhas lê o
// número daqui; os fluxos mais antigos (reservas, rodapé, atendimento) ainda o
// têm escrito diretamente nos próprios arquivos.
export const WHATSAPP_NUMBER = '5516997315748'

// Monta o link com mensagem pronta. Usa api.whatsapp.com/send (e não wa.me,
// que corrompia emojis) e codifica o texto uma única vez.
export function buildWhatsAppUrl(message: string): string {
  return `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`
}

// ─── Grupo de Ofertas (WhatsApp) ──────────────────────────────────────────────
// Link oficial de convite do grupo de ofertas da Alvea Viagens.
// Para trocar o grupo no futuro, altere SOMENTE esta linha.
export const WHATSAPP_GROUP_URL = 'https://chat.whatsapp.com/BzUhRCfOMebDQ95Uzk22j6'

// Proteção: se o valor acima deixar de ser um link https://, os botões
// "Entrar no Grupo de Ofertas" continuam visíveis, mas não navegam.
export const isWhatsAppGroupConfigured = WHATSAPP_GROUP_URL.startsWith('https://')

// ─── Vídeo de divulgação do grupo (vertical, 9:16) ────────────────────────────
// Arquivo esperado: public/videos/grupo-ofertas.mp4
export const OFFERS_GROUP_VIDEO_SRC  = '/videos/grupo-ofertas.mp4'
export const OFFERS_GROUP_VIDEO_FILE = 'public/videos/grupo-ofertas.mp4'
