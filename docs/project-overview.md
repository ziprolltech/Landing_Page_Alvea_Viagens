# Project Overview

## Company Purpose

Alvea Viagens is a Brazilian travel agency that operates in two primary markets:

1. **Airline miles management** — buying, selling, and strategically using frequent-flyer miles to reduce the cost of premium travel.
2. **Airline ticket issuance** — sourcing and emitting tickets (domestic and international), with a focus on business and first-class options that leverage miles programs.

The company's proposition is that their specialists can significantly reduce what clients pay for flights — saving up to 70% compared to retail prices — by exploiting miles programs and market timing.

---

## Business Model

Alvea Viagens earns revenue from:

- **Consulting fees** on miles strategies.
- **Margins on miles transactions** — buying miles from individuals at below-market rates and reselling at a premium, or using bulk miles to issue tickets.
- **Service fees** on ticket issuance, particularly for complex itineraries or premium cabin classes.

The business is relationship-driven. There is no self-service booking engine. Every conversion flows through a human specialist via WhatsApp or email.

---

## Target Audience

**Primary:** Brazilian travelers (age 28–55, middle to upper-middle class) who:
- Travel internationally 1–4 times per year.
- Have accumulated airline miles they do not know how to use efficiently.
- Want premium cabin experiences but cannot justify full retail prices.
- Trust personal referrals and prefer WhatsApp over web forms.

**Secondary:**
- Corporates needing multiple business-class seats.
- Families planning international holidays.
- Miles holders looking to monetize unused points.

---

## Premium Positioning

The entire website is designed to communicate premium quality before a user reads a single word of copy:

- **Dark sky + gold palette** — evokes executive lounges, nighttime long-haul flights, luxury.
- **Glassmorphism** — the "frosted glass" aesthetic associated with Apple and high-end products.
- **Subtle animations** — clouds, airplane trails, and parallax depth make the site feel alive rather than static.
- **Social proof** — displayed prominently: 50,000+ tickets emitted, 98% satisfaction, R$10M+ saved.
- **Zero friction browsing** — no signup walls, no cookies popups interrupting the experience.

The homepage opens with a full-screen cinematic sky scene that immediately communicates travel and aspiration.

---

## Current Implementation Status

| Feature | Status |
|---|---|
| Homepage with hero | Complete |
| Destinations page (25+ destinations) | Complete |
| Miles page | Complete |
| Tickets/Passagens page | Complete |
| Contact/Atendimento page with form | Complete |
| BookingModal (5-step flow) | Complete — currently shows mock flights |
| Airport autocomplete | Complete — local dataset, 160+ airports |
| WhatsApp conversion links | Complete |
| Contact form (frontend only) | Complete — no backend email sending yet |
| Responsive design | Complete |
| Page transition animations | Complete |
| Real flight search API (Duffel) | Planned — not yet integrated |
| Form backend / email delivery | Planned |
| Analytics | Planned |

---

## Conversion Strategy

The site converts visitors into WhatsApp leads. This is the entire funnel:

```
Visitor arrives at homepage
        ↓
Engages with aspirational hero (sky, airplane, headline)
        ↓
Reads social proof (50k+ tickets, 98% satisfaction)
        ↓
Browses destinations or services
        ↓
Clicks "Emitir Passagem" or a destination card
        ↓
BookingModal opens (5-step guided flow)
        ↓
Step 5 complete → sees mock flight options
        ↓
"Falar no WhatsApp" opens WhatsApp with pre-filled message
        ↓
Specialist receives inquiry with full travel details
```

Every page also has:
- Navbar CTA: "Falar com Especialista" → `/atendimento`
- Footer: Direct WhatsApp and email links
- Inline CTAs throughout every section

The philosophy is: **make the specialist easy to reach, make the lead arrive warm**.
