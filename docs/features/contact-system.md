# Feature: Contact System

**Page:** `src/app/atendimento/page.tsx`
**Related docs:** [pages.md](../pages.md#contact-page-atendimento), [integrations.md](../integrations.md), [known-issues.md](../known-issues.md)

---

## Purpose

The contact/atendimento page is the **dedicated conversion landing zone**. All CTAs across the site that say "Falar com Especialista" route here. The page presents three contact methods and a contact form to capture the user's intent.

---

## Architecture

```
/atendimento (page.tsx — client component)
└── PageHeader
└── Contact Methods Grid (3 cards)
    ├── WhatsApp card (wa.me/ link)
    ├── Email card (mailto: link)
    └── Consultation Hours card (info only)
└── Contact Form
    ├── Nome (required)
    ├── Email (required)
    ├── Telefone (optional)
    ├── Destino de interesse (optional)
    ├── Mensagem (optional textarea)
    └── Submit button
└── AnimatePresence → Success State (on submit)
```

---

## User Flow

### Via WhatsApp Card
1. User lands on `/atendimento`
2. Sees three contact method cards
3. Clicks WhatsApp card → WhatsApp opens (bare link, no pre-filled message)
4. Types their own message to the specialist

### Via Contact Form
1. User fills form fields (Nome and Email are required)
2. Clicks submit → client-side validation runs
3. If valid → **currently shows success animation only** (no email sent)
4. If invalid → inline error messages appear on required fields
5. Success state: form replaced by checkmark animation + confirmation message

---

## Technical Implementation

### Form State

```typescript
const [form, setForm] = useState({
  nome: '',
  email: '',
  telefone: '',
  destino: '',
  mensagem: '',
})
const [errors, setErrors] = useState<{ nome?: string; email?: string }>({})
const [submitted, setSubmitted] = useState(false)
```

### Validation

```typescript
const validate = () => {
  const newErrors: { nome?: string; email?: string } = {}
  if (!form.nome.trim())  newErrors.nome = 'Nome é obrigatório'
  if (!form.email.trim()) newErrors.email = 'E-mail é obrigatório'
  // Email format could be added here
  return newErrors
}
```

Only `nome` and `email` are required. The rest are optional — lowering friction is a conversion priority.

### Submit Handler

```typescript
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault()
  const validation = validate()
  if (Object.keys(validation).length > 0) {
    setErrors(validation)
    return
  }
  // Currently no API call here
  setSubmitted(true)
}
```

**The form does not send any data to a backend.** This is the known limitation documented in [known-issues.md](../known-issues.md#contact-form-does-not-send-emails). After setting `submitted = true`, the form state is discarded.

### Success Animation

`AnimatePresence` conditionally renders the form or the success card:

```tsx
<AnimatePresence mode="wait">
  {submitted ? (
    <motion.div key="success" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      {/* Checkmark with spring scale animation */}
      {/* "Mensagem enviada!" */}
      {/* "Respondemos em até 2 horas úteis" */}
    </motion.div>
  ) : (
    <motion.form key="form" ...>
      {/* Form fields */}
    </motion.form>
  )}
</AnimatePresence>
```

---

## Files Involved

| File | Role |
|---|---|
| `src/app/atendimento/page.tsx` | The page — contact cards + form + success state |
| `src/app/api/contact/route.ts` | **Does not exist yet** — planned backend handler |
| `src/components/ui/PageHeader.tsx` | Page header component |
| `src/components/ui/GlassCard.tsx` | Used for contact method cards |

---

## Implementing the Backend (Planned)

When the form backend is implemented:

### 1. Create the API route

`src/app/api/contact/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { nome, email, telefone, destino, mensagem } = body

  // Server-side validation
  if (!nome || !email) {
    return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
  }

  await resend.emails.send({
    from: 'site@alveaviagens.com.br',
    to: 'alveaviagens@gmail.com',
    subject: `Novo contato: ${nome}`,
    html: `<p>Nome: ${nome}</p><p>Email: ${email}</p>...`,
  })

  return NextResponse.json({ success: true })
}
```

### 2. Update the form handler

In `atendimento/page.tsx`, replace `setSubmitted(true)` with:
```typescript
const res = await fetch('/api/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(form),
})
if (res.ok) setSubmitted(true)
else setErrors({ nome: 'Erro ao enviar. Tente via WhatsApp.' })
```

### 3. Add environment variable

`.env.local`:
```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Future Improvements

- **Backend email delivery** (Priority: High — see above)
- **Lead storage in Supabase** — Save all inquiries to a database for pipeline tracking
- **Auto-reply to submitter** — Send a confirmation email to the client's address
- **Integration with CRM** — Route form submissions to HubSpot/Pipedrive
- **reCAPTCHA** — Prevent spam form submissions (add after backend is working)

---

## Maintenance Notes

- The page is a client component (`"use client"`) because it uses `useState` and `useEffect` for form handling and the success animation.
- The confirmation text "Respondemos em até 2 horas úteis" is a business commitment. Verify this with the business owner before deploying — if response times change, update this string.
- Do not add more required fields. Required fields reduce conversion. If more data is needed, make additional fields optional.
- Contact information on this page must stay synchronized with the Footer. See [branding.md](../branding.md#contact-information-canonical).
