'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Mail, Phone, MapPin, MessageSquare, User, Send } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import SectionReveal from '@/components/ui/SectionReveal'
import GlassCard from '@/components/ui/GlassCard'
import { buildWhatsAppUrl } from '@/lib/config/links'
import { track } from '@/lib/analytics/gtag'
import {
  buildContactRequestMessage, validateContactRequest,
  type ContactRequest, type ContactRequestErrors,
} from '@/lib/atendimento/whatsapp-message'

const CONTACT_METHODS = [
  {
    icon: MessageCircle,
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-400/12',
    title: 'WhatsApp',
    desc: 'Atendimento rápido e direto com nossos especialistas.',
    info: '+55 (16) 99731-5748',
    cta: 'Iniciar conversa →',
    href: 'https://wa.me/5516997315748',
  },
  {
    icon: Mail,
    iconColor: 'text-gold',
    iconBg: 'bg-gold/12',
    title: 'E-mail',
    desc: 'Envie sua solicitação e receba resposta em até 2 horas úteis.',
    info: 'alveaviagens@gmail.com',
    cta: 'Enviar e-mail →',
    href: 'mailto:alveaviagens@gmail.com',
  },
]

const FIELD_CLASS =
  'bg-white/[0.06] border border-white/12 rounded-xl px-4 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-gold/40 focus:bg-white/[0.08] transition-all duration-200 w-full'

const LABEL_CLASS = 'text-white/65 text-[13px] font-medium mb-2 flex items-center gap-2'

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} role="alert" className="mt-2 text-[12.5px] text-gold-light">
      {message}
    </p>
  )
}

export default function AtendimentoPage() {
  const [form, setForm] = useState<ContactRequest>({
    nome: '',
    email: '',
    telefone: '',
    destino: '',
    mensagem: '',
  })
  const [errors, setErrors] = useState<ContactRequestErrors>({})

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const name = e.target.name as keyof ContactRequest
    setForm((prev) => ({ ...prev, [name]: e.target.value }))
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev))
  }

  /* Validates, then opens WhatsApp with the message pre-filled. Nothing is sent
     from here: the visitor reviews the text and presses "Enviar" in WhatsApp. */
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const found = validateContactRequest(form)
    setErrors(found)
    if (Object.keys(found).length > 0) return
    /* Analytics: the fact that the form was used — never what was typed */
    track('contact_form_submit', { form_name: 'atendimento' })
    track('whatsapp_click', { link_location: 'atendimento_form' })
    window.open(buildWhatsAppUrl(buildContactRequestMessage(form)), '_blank', 'noopener,noreferrer')
  }

  return (
    <main className="relative min-h-screen pt-28 pb-24 px-6">
      {/* Ambient orbs — kept inside a clipped layer: they are wider than a phone
          screen (700px) and would otherwise make the whole page wider than the
          viewport, which mobile browsers answer by zooming the page out. */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full"
          style={{
            background: 'radial-gradient(ellipse, rgba(26,95,160,0.08) 0%, transparent 70%)',
            filter: 'blur(70px)',
          }}
        />
        <div
          className="absolute bottom-40 right-0 w-[400px] h-[400px] rounded-full"
          style={{
            background: 'radial-gradient(ellipse, rgba(212,168,83,0.05) 0%, transparent 70%)',
            filter: 'blur(65px)',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Page header */}
        <SectionReveal className="mb-16">
          <PageHeader
            tag="Atendimento"
            title={
              <>
                Estamos prontos para planejar{' '}
                <span className="text-gold-gradient">sua próxima viagem</span>
              </>
            }
            subtitle="Fale com nossos especialistas e descubra o melhor caminho para a viagem dos seus sonhos."
          />
        </SectionReveal>

        {/* Contact method cards */}
        <SectionReveal delay={0.08}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14 max-w-3xl mx-auto">
            {CONTACT_METHODS.map((method) => {
              const Icon = method.icon
              return (
                <GlassCard key={method.title} className="p-7 flex flex-col gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${method.iconBg}`}>
                    <Icon size={22} className={method.iconColor} strokeWidth={1.8} />
                  </div>
                  <div>
                    <h3 className="text-white text-[17px] font-bold mb-1">{method.title}</h3>
                    <p className="text-white/50 text-[13.5px] leading-relaxed">{method.desc}</p>
                  </div>
                  <p className="text-white/65 text-[14px] font-medium">{method.info}</p>
                  <a
                    href={method.href}
                    data-track-location="atendimento_card"
                    className="text-gold text-[13.5px] font-medium hover:text-gold-light transition-colors duration-200"
                  >
                    {method.cta}
                  </a>
                </GlassCard>
              )
            })}
          </div>
        </SectionReveal>

        {/* Contact form */}
        <SectionReveal delay={0.12}>
          <div
            className="rounded-2xl border border-white/10 p-8 md:p-10 max-w-3xl mx-auto"
            style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(16px)' }}
          >
            <h2 className="text-white text-[22px] font-bold mb-8">Envie sua solicitação</h2>

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
                {/* Two-col fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Nome */}
                  <div>
                    <label htmlFor="atendimento-nome" className={LABEL_CLASS}>
                      <User size={13} className="text-white/40" />
                      Nome
                    </label>
                    <input
                      type="text"
                      id="atendimento-nome"
                      name="nome"
                      value={form.nome}
                      onChange={handleChange}
                      placeholder="Seu nome completo"
                      className={FIELD_CLASS}
                      aria-required="true"
                      aria-invalid={errors.nome ? true : undefined}
                      aria-describedby={errors.nome ? 'atendimento-nome-erro' : undefined}
                    />
                    <FieldError id="atendimento-nome-erro" message={errors.nome} />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="atendimento-email" className={LABEL_CLASS}>
                      <Mail size={13} className="text-white/40" />
                      E-mail
                    </label>
                    <input
                      type="email"
                      id="atendimento-email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="seu@email.com"
                      className={FIELD_CLASS}
                      aria-required="true"
                      aria-invalid={errors.email ? true : undefined}
                      aria-describedby={errors.email ? 'atendimento-email-erro' : undefined}
                    />
                    <FieldError id="atendimento-email-erro" message={errors.email} />
                  </div>

                  {/* Telefone */}
                  <div>
                    <label htmlFor="atendimento-telefone" className={LABEL_CLASS}>
                      <Phone size={13} className="text-white/40" />
                      Telefone
                    </label>
                    <input
                      type="tel"
                      id="atendimento-telefone"
                      name="telefone"
                      value={form.telefone}
                      onChange={handleChange}
                      placeholder="(11) 99999-9999"
                      className={FIELD_CLASS}
                      aria-required="true"
                      aria-invalid={errors.telefone ? true : undefined}
                      aria-describedby={errors.telefone ? 'atendimento-telefone-erro' : undefined}
                    />
                    <FieldError id="atendimento-telefone-erro" message={errors.telefone} />
                  </div>

                  {/* Destino */}
                  <div>
                    <label htmlFor="atendimento-destino" className={LABEL_CLASS}>
                      <MapPin size={13} className="text-white/40" />
                      Destino desejado
                    </label>
                    <input
                      type="text"
                      id="atendimento-destino"
                      name="destino"
                      value={form.destino}
                      onChange={handleChange}
                      placeholder="Para onde quer ir?"
                      className={FIELD_CLASS}
                      aria-required="true"
                      aria-invalid={errors.destino ? true : undefined}
                      aria-describedby={errors.destino ? 'atendimento-destino-erro' : undefined}
                    />
                    <FieldError id="atendimento-destino-erro" message={errors.destino} />
                  </div>
                </div>

                {/* Mensagem */}
                <div>
                  <label htmlFor="atendimento-mensagem" className={LABEL_CLASS}>
                    <MessageSquare size={13} className="text-white/40" />
                    Mensagem
                  </label>
                  <textarea
                    id="atendimento-mensagem"
                    name="mensagem"
                    value={form.mensagem}
                    onChange={handleChange}
                    placeholder="Conte-nos mais sobre sua viagem ideal..."
                    rows={5}
                    className={FIELD_CLASS}
                    style={{ resize: 'vertical' }}
                    aria-required="true"
                    aria-invalid={errors.mensagem ? true : undefined}
                    aria-describedby={errors.mensagem ? 'atendimento-mensagem-erro' : undefined}
                  />
                  <FieldError id="atendimento-mensagem-erro" message={errors.mensagem} />
                </div>

                {/* Submit */}
                <div className="mt-2">
                  <motion.button
                    type="submit"
                    className="btn-shimmer cta-glow flex items-center justify-center gap-2.5 w-full py-3.5 rounded-full text-[14px] font-semibold text-sky-deep"
                    style={{ background: 'linear-gradient(135deg, #D4A853 0%, #ECC96A 50%, #E8824A 100%)' }}
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    <Send size={15} strokeWidth={2} />
                    Solicitar Atendimento
                  </motion.button>
                  <p className="text-center text-white/25 text-[12px] mt-3">
                    Respondemos em até 2 horas úteis
                  </p>
                </div>
            </form>
          </div>
        </SectionReveal>
      </div>
    </main>
  )
}
