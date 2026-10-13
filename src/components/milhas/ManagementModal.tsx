'use client'

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  Plane, Wallet, CreditCard, Banknote, Target, Globe, BarChart3, Pencil,
} from 'lucide-react'
import MilesModal, { BackButton, ContinueButton, WhatsAppButton } from './MilesModal'
import { ChoiceGroup, TextField } from './FormFields'
import { buildWhatsAppUrl } from '@/lib/config/links'
import { track } from '@/lib/analytics/gtag'
import {
  QUESTIONS, QUESTION_STEPS, questionsBetween, isAnswered,
  type Answers, type Question,
} from '@/lib/milhas/management-questionnaire'
import {
  buildManagementMessage, formatPhone, isValidEmail, isValidPhone,
  type ManagementContact,
} from '@/lib/milhas/whatsapp-messages'

/* Gestão de Milhas — explains the service, then the official 17-question
   profile questionnaire (see management-questionnaire.ts), a review step, and a
   pre-filled WhatsApp message. Nothing is sent to a server or stored. */

const EASE = [0.22, 1, 0.36, 1] as const

/* Step index → what it shows */
const STEP_INTRO     = 0
const STEP_CONTACT   = 1
const FIRST_Q_STEP   = 2
const STEP_REVIEW    = FIRST_Q_STEP + QUESTION_STEPS.length

const STEP_LABELS = [
  'O que é a Gestão',
  'Seus dados',
  ...QUESTION_STEPS.map((s) => s.label),
  'Revisão e envio',
]

const EXAMPLES = [
  { icon: Plane,      label: 'Viajar mais' },
  { icon: Wallet,     label: 'Buscar oportunidades de cashback' },
  { icon: CreditCard, label: 'Aproveitar melhor os pontos do cartão' },
  { icon: Banknote,   label: 'Avaliar oportunidades de venda de pontos/milhas' },
  { icon: Target,     label: 'Criar uma estratégia de acúmulo' },
  { icon: Globe,      label: 'Planejar futuras viagens' },
  { icon: BarChart3,  label: 'Organizar melhor seus programas de fidelidade' },
]

const HOW_IT_WORKS = [
  'Você nos conta seus objetivos',
  'Conhecemos seu perfil',
  'Analisamos suas possibilidades',
  'Definimos estratégias',
  'Você recebe orientação ao longo do processo',
]

const EMPTY_CONTACT: ManagementContact = { nome: '', email: '', telefone: '' }

type Errors = Record<string, string | undefined>

function questionsOfStep(step: number): Question[] {
  const group = QUESTION_STEPS[step - FIRST_Q_STEP]
  return group ? questionsBetween(group.from, group.to) : []
}

function validate(step: number, contact: ManagementContact, answers: Answers): Errors {
  const e: Errors = {}
  if (step === STEP_CONTACT) {
    if (!contact.nome.trim())                e.nome = 'Informe seu nome.'
    if (!contact.email.trim())               e.email = 'Informe seu e-mail.'
    else if (!isValidEmail(contact.email))   e.email = 'Confira o e-mail informado, por exemplo nome@email.com.'
    if (!contact.telefone.trim())            e.telefone = 'Informe seu telefone.'
    else if (!isValidPhone(contact.telefone)) e.telefone = 'Informe o telefone com DDD, por exemplo (16) 99999-9999.'
  }
  for (const q of questionsOfStep(step)) {
    if (q.required && !isAnswered(answers[q.id])) e[q.id] = 'Selecione uma opção para continuar.'
  }
  return e
}

export default function ManagementModal({ onClose }: { onClose: () => void }) {
  const reduce = useReducedMotion() ?? false
  const [step,      setStep]      = useState(STEP_INTRO)
  const [direction, setDirection] = useState(1)
  const [contact,   setContact]   = useState<ManagementContact>(EMPTY_CONTACT)
  const [answers,   setAnswers]   = useState<Answers>({})
  const [errors,    setErrors]    = useState<Errors>({})

  /* Bring the first problem into view when a step fails validation */
  useEffect(() => {
    if (Object.values(errors).some(Boolean)) {
      document.querySelector('[role="dialog"] [role="alert"]')?.scrollIntoView({ block: 'center' })
    }
  }, [errors])

  function clearError(key: string) {
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev))
  }

  function setContactField<K extends keyof ManagementContact>(key: K, value: string) {
    setContact((prev) => ({ ...prev, [key]: value }))
    clearError(key)
  }

  function setAnswer(q: Question, value: string | string[]) {
    let next = value
    /* An exclusive option ("Não") cannot be combined with the others */
    if (q.exclusive && Array.isArray(value)) {
      const previous = (answers[q.id] as string[] | undefined) ?? []
      const justAddedExclusive = value.includes(q.exclusive) && !previous.includes(q.exclusive)
      next = justAddedExclusive ? [q.exclusive] : value.filter((v) => v !== q.exclusive)
    }
    /* Keep multiple answers in the official option order, not click order */
    if (Array.isArray(next) && q.options) {
      const order = q.options
      next = [...next].sort((a, b) => order.indexOf(a) - order.indexOf(b))
    }
    setAnswers((prev) => ({ ...prev, [q.id]: next }))
    clearError(q.id)
  }

  function next() {
    const found = validate(step, contact, answers)
    setErrors(found)
    if (Object.values(found).some(Boolean)) return
    setDirection(1)
    setStep((s) => s + 1)
  }

  function back() {
    setErrors({})
    setDirection(-1)
    setStep((s) => s - 1)
  }

  function goTo(target: number) {
    setErrors({})
    setDirection(-1)
    setStep(target)
  }

  const isReview = step === STEP_REVIEW

  return (
    <MilesModal
      titleId="gestao-milhas-title"
      title="Gestão de Milhas"
      subtitle="Uma estratégia pensada para o seu perfil e os seus objetivos."
      stepLabels={STEP_LABELS}
      step={step}
      direction={direction}
      size="lg"
      onClose={onClose}
      footer={
        <>
          {step > STEP_INTRO && <BackButton onClick={back} />}
          {isReview
            ? <WhatsAppButton
                href={buildWhatsAppUrl(buildManagementMessage(contact, answers))}
                label="Enviar para a Alvea"
                onSend={() => track('miles_form_submit', { form_type: 'gestao' })}
              />
            : <ContinueButton onClick={next} label={step === STEP_INTRO ? 'Começar o questionário' : 'Continuar'} />}
        </>
      }
    >
      {/* ── O que é a Gestão ── */}
      {step === STEP_INTRO && (
        <div className="flex flex-col gap-8">
          <section aria-labelledby="gestao-o-que-e">
            <h3 id="gestao-o-que-e" className="text-[18px] font-bold text-white">O que é a Gestão de Milhas?</h3>
            <p className="mt-2.5 text-[14.5px] leading-relaxed text-white/65">
              A Gestão de Milhas é um acompanhamento personalizado para quem quer aproveitar melhor
              seus pontos e milhas, mas não quer precisar acompanhar sozinho todas as possibilidades
              disponíveis.
            </p>
          </section>

          <section aria-labelledby="gestao-objetivos">
            <h3 id="gestao-objetivos" className="text-[18px] font-bold text-white">Você nos conta seus objetivos.</h3>
            <p className="mt-1.5 text-[14px] text-white/55">O que você pretende fazer com suas milhas?</p>
            <ul className="mt-4 grid auto-rows-fr grid-cols-1 gap-2.5 sm:grid-cols-2">
              {EXAMPLES.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="flex h-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold/15">
                    <Icon size={17} className="text-gold" strokeWidth={1.8} aria-hidden="true" />
                  </span>
                  <span className="text-[13.5px] leading-snug text-white/80">{label}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[13.5px] leading-relaxed text-white/55">
              A gestão é ampla e se adapta ao seu perfil: a Alvea cuida da estratégia e orienta você
              em cada decisão.
            </p>
          </section>

          <section aria-labelledby="gestao-como-funciona">
            <h3 id="gestao-como-funciona" className="text-[18px] font-bold text-white">Como funciona</h3>
            <ol className="mt-4 flex flex-col gap-2.5">
              {HOW_IT_WORKS.map((text, i) => (
                <li
                  key={text}
                  className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5"
                >
                  <span className="text-gold-gradient w-8 shrink-0 text-[20px] font-black leading-none" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-[14px] text-white/85">{text}</span>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-[13px] leading-relaxed text-white/50">
              Os detalhes do serviço e as condições comerciais são apresentados diretamente pela nossa equipe.
            </p>
          </section>
        </div>
      )}

      {/* ── Seus dados ── */}
      {step === STEP_CONTACT && (
        <div className="flex flex-col gap-6">
          <StepHeading
            reduce={reduce}
            title="Seus dados"
            description="Para nossa equipe saber com quem está falando e como retornar o contato."
          />
          <div className="flex flex-col gap-5">
            <TextField
              id="gestao-nome" label="Nome" value={contact.nome} error={errors.nome}
              placeholder="Seu nome completo" autoComplete="name"
              onChange={(v) => setContactField('nome', v)}
            />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <TextField
                id="gestao-email" label="E-mail" value={contact.email} error={errors.email}
                placeholder="nome@email.com" type="email" inputMode="email" autoComplete="email"
                onChange={(v) => setContactField('email', v)}
              />
              <TextField
                id="gestao-telefone" label="Telefone" value={contact.telefone} error={errors.telefone}
                placeholder="(16) 99999-9999" type="tel" inputMode="tel" autoComplete="tel"
                onChange={(v) => setContactField('telefone', formatPhone(v))}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Perguntas (17, em 4 etapas) ── */}
      {step >= FIRST_Q_STEP && step < STEP_REVIEW && (
        <div className="flex flex-col gap-9">
          <StepHeading
            reduce={reduce}
            title={STEP_LABELS[step]}
            description={`Perguntas ${QUESTION_STEPS[step - FIRST_Q_STEP].from} a ${QUESTION_STEPS[step - FIRST_Q_STEP].to} de ${QUESTIONS.length}.`}
          />
          {questionsOfStep(step).map((q) =>
            q.type === 'text' ? (
              <TextField
                key={q.id}
                id={`gestao-${q.id}`}
                label={`${q.number}. ${q.text}`}
                value={(answers[q.id] as string | undefined) ?? ''}
                placeholder={q.placeholder}
                multiline
                onChange={(v) => setAnswer(q, v)}
              />
            ) : (
              <ChoiceGroup
                key={q.id}
                name={`gestao-${q.id}`}
                legend={`${q.number}. ${q.text}`}
                options={q.options ?? []}
                multiple={q.type === 'multiple'}
                required={q.required}
                value={answers[q.id] ?? (q.type === 'multiple' ? [] : '')}
                error={errors[q.id]}
                onChange={(v) => setAnswer(q, v)}
              />
            ),
          )}
        </div>
      )}

      {/* ── Revisão e envio ── */}
      {isReview && (
        <div className="flex flex-col gap-6">
          <StepHeading
            reduce={reduce}
            title="Revise suas informações"
            description="Confira suas respostas. Você pode voltar e corrigir qualquer etapa antes de enviar."
          />

          <ReviewSection title="Seus dados" onEdit={() => goTo(STEP_CONTACT)}>
            <ReviewRow term="Nome"     detail={contact.nome} />
            <ReviewRow term="E-mail"   detail={contact.email} />
            <ReviewRow term="Telefone" detail={contact.telefone} />
          </ReviewSection>

          {QUESTION_STEPS.map((group, index) => (
            <ReviewSection key={group.label} title={group.label} onEdit={() => goTo(FIRST_Q_STEP + index)}>
              {questionsBetween(group.from, group.to).map((q) => (
                <ReviewRow key={q.id} term={`${q.number}. ${q.short}`} detail={answers[q.id]} />
              ))}
            </ReviewSection>
          ))}

          <p className="text-[13px] leading-relaxed text-white/55">
            Ao enviar, o WhatsApp será aberto com uma mensagem pronta contendo as respostas que você preencheu.
            Nossa equipe vai conhecer seu perfil e conversar com você sobre as possibilidades da Gestão de Milhas.
          </p>
        </div>
      )}
    </MilesModal>
  )
}

/* ── Step heading: title first, description right after ──────────────────── */

function StepHeading({ title, description, reduce }: { title: string; description: string; reduce: boolean }) {
  const container = {
    hidden: {},
    show:   { transition: { staggerChildren: reduce ? 0 : 0.08 } },
  }
  const item = {
    hidden: { opacity: 0, y: reduce ? 0 : 10 },
    show:   { opacity: 1, y: 0, transition: { duration: reduce ? 0.15 : 0.35, ease: EASE } },
  }
  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <motion.h3 variants={item} className="text-[19px] font-bold leading-snug text-white">{title}</motion.h3>
      <motion.p variants={item} className="mt-1.5 text-[13.5px] leading-relaxed text-white/55">{description}</motion.p>
    </motion.div>
  )
}

/* ── Review pieces ──────────────────────────────────────────────────────── */

function ReviewSection({
  title, onEdit, children,
}: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold">{title}</h4>
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Editar ${title}`}
          className="flex min-h-[36px] items-center gap-1.5 rounded-full border border-white/15 px-3 text-[12px] font-semibold text-white/70 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
        >
          <Pencil size={12} aria-hidden="true" />
          Editar
        </button>
      </div>
      <dl className="mt-3 flex flex-col gap-3.5">{children}</dl>
    </section>
  )
}

function ReviewRow({ term, detail }: { term: string; detail: string | string[] | undefined }) {
  const answered = isAnswered(detail)
  return (
    <div>
      <dt className="text-[12px] text-white/45">{term}</dt>
      <dd className={`mt-0.5 text-[14px] leading-snug break-words ${answered ? 'font-medium text-white' : 'text-white/35'}`}>
        {!answered
          ? 'Não respondida'
          : Array.isArray(detail)
            ? (
              <ul className="flex flex-col gap-1">
                {detail.map((value) => <li key={value}>• {value}</li>)}
              </ul>
            )
            : detail}
      </dd>
    </div>
  )
}
