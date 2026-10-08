# Feature: Instagram Integration

**Related docs:** [integrations.md](../integrations.md)

---

## Purpose

Instagram serves as a **social proof and brand awareness channel**. Linking the website footer to the Instagram profile allows visitors to explore the brand's visual content, client testimonials, and travel inspiration — reinforcing trust before converting via WhatsApp.

---

## Current Implementation

**Type:** External link only
**Location:** `src/components/layout/Footer.tsx` — social icons row
**Implementation:** A standard anchor tag with the Instagram profile URL

```html
<a href="https://instagram.com/alveaviagens" target="_blank" rel="noopener noreferrer">
  <!-- Instagram icon (Lucide React or SVG) -->
</a>
```

**Icon:** Instagram icon from Lucide React or an inline SVG (verify in Footer.tsx source)
**Target:** `_blank` (opens profile in a new tab)
**Security:** `rel="noopener noreferrer"` prevents tab-napping

---

## User Flow

1. User visits any page of the site
2. Scrolls to the footer
3. Clicks the Instagram icon in the social row
4. Instagram profile opens in a new tab
5. User browses content, follows the account
6. Returns to the site or contacts via WhatsApp from Instagram DM

---

## Future Improvements

### Instagram Feed Embed

Display the latest 6–9 posts from the Instagram feed directly on the website (homepage or About section). Options:

- **Instagram Basic Display API** — Official Meta API, requires approval and token management
- **Third-party embed service** (Elfsight, Curator.io) — Simpler but adds external dependency and potential cost
- **Manual curation** — Hardcode 6 featured travel photos with proper attribution (simplest, no API)

**Recommendation when the time comes:** Start with manual curation (hardcoded photos), upgrade to API-based feed if the Instagram content strategy becomes active.

### Instagram DM as Conversion Channel

When WhatsApp is unavailable, Instagram DMs serve as an alternative. A direct link to Instagram DM could be added to the Atendimento page:

```
https://ig.me/m/alveaviagens
```

### Stories / Highlights

If Instagram Highlights are used to organize travel content by destination, a future version of the destinations page could link individual destination cards to the corresponding Instagram Highlight.

---

## Maintenance Notes

- The Instagram URL must be verified in `Footer.tsx` — confirm the handle matches the actual account.
- If the Instagram handle changes (account rename), update it in `Footer.tsx`.
- Do not add Instagram to the navbar — social links belong in the footer per the established layout. Adding them to the navbar would crowd the navigation.
- The Instagram icon should visually match the other social icons (WhatsApp, Email) in size and color treatment.
