# Feature: WhatsApp Integration

**Related docs:** [integrations.md](../integrations.md), [booking-flow.md](../booking-flow.md)

---

## Purpose

WhatsApp is the **primary conversion channel** for Alvea Viagens. It replaces traditional booking forms, checkout flows, and CRM pipelines. A specialist receives the lead directly on their phone, with full context, and responds personally.

This is a deliberate business model decision, not a technical limitation. See [technical-decisions.md](../technical-decisions.md#7-whatsapp-as-primary-conversion-not-a-built-in-checkout).

---

## Implementation Type

**No API.** All WhatsApp links use the `wa.me/` deep link format:

```
https://wa.me/5516997315748
https://wa.me/5516997315748?text=URL_ENCODED_MESSAGE
```

When a user clicks this link:
- **On mobile:** Opens the WhatsApp app directly to a conversation with the number
- **On desktop (WhatsApp installed):** Opens WhatsApp Desktop
- **On desktop (no app):** Opens WhatsApp Web in a new tab

No webhooks, no Business API, no webhook endpoints. The integration requires zero backend infrastructure.

---

## Phone Number

**Canonical value:** `5516997315748`

This is the number in international format (country code 55 + area code 16 + number), with no spaces, dashes, or plus sign — exactly as required by the `wa.me/` format.

**Display format:** `+55 (16) 99731-5748` (used in Footer and Atendimento page)

---

## Touchpoints

Every WhatsApp entry point in the project:

### 1. BookingModal — Flight Results

**File:** `src/components/booking/BookingModal.tsx`
**Trigger:** User clicks "Falar no WhatsApp" on a flight result card
**Message:** Pre-filled with complete booking context

**Message template:**
```
Olá! Gostaria de consultar uma passagem para *{destination.name}*

🛫 Origem: {originAirport}
📅 Ida: {departureDate}
📅 Volta: {returnDate}
👥 Passageiros: {passengers}
💺 Classe: {flightClass}

Vi o voo da {airline} por R${price} ({miles} milhas).
Gostaria de mais informações!
```

**Why this message:** The specialist immediately knows where the client wants to go, when, in what class, and how many people. Zero back-and-forth to establish basics. The lead is warm and actionable from the first message.

### 2. Footer — Social Icon

**File:** `src/components/layout/Footer.tsx`
**Trigger:** User clicks the WhatsApp icon in the social row
**Message:** None (bare link — user opens a blank conversation)
**Target:** `_blank`

### 3. Atendimento Page — Contact Card

**File:** `src/app/atendimento/page.tsx`
**Trigger:** User clicks the WhatsApp contact card
**Message:** None or generic greeting
**Target:** `_blank`

### 4. Navbar CTA

**File:** `src/components/Navbar.tsx`
**Trigger:** User clicks "Falar com Especialista"
**Destination:** `/atendimento` page (not a direct WhatsApp link — allows the user to choose between WhatsApp, email, or form)

### 5. Various Page CTAs

Multiple "Falar com Especialista" and "Emitir Passagem" buttons across pages route to `/atendimento`, which then exposes the WhatsApp card.

---

### Trip request from `/destinos` (since 2026-10-08)

While live flight search is off, the last step of the booking form opens WhatsApp with the request written by `buildTripRequestMessage()` (`src/lib/destinos/whatsapp-message.ts`), through the shared `buildWhatsAppUrl()`. See `booking-flow.md` and the changelog.

## Message Generation

For the BookingModal, the WhatsApp URL is constructed programmatically:

```typescript
const waMessage = `Olá! Gostaria de consultar uma passagem para *${destination.name}*\n\n...`
const waUrl = `https://wa.me/5516997315748?text=${encodeURIComponent(waMessage)}`
window.open(waUrl, '_blank', 'noopener,noreferrer')
```

Key points:
- `encodeURIComponent` is mandatory — the message contains spaces, emojis, newlines, and asterisks (bold formatting) that must be percent-encoded for the URL
- `'_blank'` opens WhatsApp in a new tab without navigating away from the booking modal
- `'noopener,noreferrer'` prevents the new tab from accessing the opener's window object (security best practice)
- WhatsApp supports basic markdown: `*bold*`, `_italic_`, `~strikethrough~`

---

## Future Improvements

### WhatsApp Business API

When volume justifies it, the WhatsApp Business API (via a BSP like Twilio, Vonage, or directly through Meta) would allow:
- **Automated responses** — Instant acknowledgment while specialist is offline
- **Message templates** — Structured messages with quick replies
- **CRM integration** — Automatic lead creation in HubSpot/Pipedrive
- **Chatbot handoff** — Bot handles FAQ, specialist handles booking

This would require server-side infrastructure and Meta business verification. The current `wa.me/` approach would remain as a fallback.

### Click Tracking

Add Google Analytics or Plausible events on every WhatsApp link click:
```typescript
// Before opening WhatsApp
analytics.track('whatsapp_click', { source: 'booking_modal', destination: destination.name })
```

This would reveal which destinations, pages, and CTAs convert best.

---

## Maintenance Notes

- The phone number `5516997315748` appears in multiple files. **Always use global search** to find all instances before changing it.
- Files containing the WhatsApp number:
  - `src/components/booking/BookingModal.tsx`
  - `src/components/layout/Footer.tsx`
  - `src/app/atendimento/page.tsx`
- Do not add country code prefix `+` or any formatting to the `wa.me/` URL — only digits are valid.
- Test WhatsApp links on both mobile and desktop before deploying any changes.
