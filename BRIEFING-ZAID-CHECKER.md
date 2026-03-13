# Dev Briefing — Kitabh Article Checker (فاحص كتابة)

**From:** Mohammed
**To:** Zaid
**Date:** March 12, 2026

---

## Goal

We're activating **فاحص كتابة** (Article Checker) as a tool on kitabh.com/tools. Same funnel as Carousel Studio and Outline: visitor → signed-up user → Writers Plan subscriber.

The component is **production-ready** and follows the exact same patterns as the other tools.

---

## Files

```
src/tools/KitabhChecker.tsx   ← Main component (self-contained, CSS embedded)
api/gemini.ts                 ← Generic Gemini API proxy (server-side, shared with Outline)
```

---

## What You Need to Do

### 1. `window.__KITABH_USER` — Already Done

Same global as Carousel/Outline. No changes needed:

```javascript
window.__KITABH_USER = {
  authenticated: true/false,
  premium: true/false,
  email: "user@example.com",
  token: "auth-token"
}
```

### 2. Build the `/tools/checker` Page

- Render: `<KitabhChecker />`
- For premium users: `<KitabhChecker premium />`
- Place `<KitabhToolsNav currentTool="checker" />` below the component
- Same fonts as Carousel/Outline (already loaded)
- Same `<html lang="ar" dir="rtl">` requirement

### 3. Update `/tools` Page

Add/activate the Article Checker card, linking to `/tools/checker`.

### 4. Wire Up Signup / Upgrade / Paywall CTAs

The component has **2 built-in popups** (same pattern as Outline):

| Popup | Who sees it | When | What to wire |
|---|---|---|---|
| **Signup** | Visitors (not signed in) | On first analysis | Email captured → `localStorage("kb_user_email")`. Title: "سجّل حساب مجاني في منصة كتابة". Non-dismissable — must enter email |
| **Paywall** | Anyone after 5 uses | On analyze click | Links to `kitabh.com/pricing` + App Store download |

### 5. Move the Gemini API Key Server-Side (DONE)

Already handled. The component calls `/api/gemini` — a generic Vercel serverless proxy that forwards requests to Google Gemini. The API key is stored in Vercel environment variable `GOOGLE_API_KEY`.

**For production:** Replace `/api/gemini` with your own backend endpoint. The component sends:

```json
{
  "contents": [{ "role": "user", "parts": [{ "text": "..." }] }],
  "generationConfig": { "maxOutputTokens": 16384, "temperature": 0.3 }
}
```

And expects the raw Gemini response format back:

```json
{
  "candidates": [{ "content": { "parts": [{ "text": "..." }] } }]
}
```

Apply server-side usage enforcement (check DB before calling Gemini).

### 6. Meta Pixel Events

```javascript
// On successful analysis
fbq('track', 'AnalyzeArticle')

// When user hits the paywall (5 uses exhausted)
fbq('track', 'HitPaywall')
```

### 7. "Pick an Article from Kitabh" Feature

Same as Outline — for signed-in users, add a button to pick an existing article and insert its text into the textarea.

---

## Tool Types

The checker supports 4 content types (user picks from dropdown):

| ID | Label | What it analyzes |
|---|---|---|
| `article` | مقال | Articles — 10 pillar analysis |
| `story` | قصة | Stories — arc analysis + pillars |
| `thread` | ثريد | Twitter/X threads |
| `script` | سكريبت | Video/podcast scripts |

Each type has its own prompt and scoring criteria.

---

## Results Page Features

### Score & Grade Scale

Results show:
- **Score ring** (X/10) with color coding
- **Grade label**: استثنائي (9-10), ممتاز (8-8.9), جيّد جدًا (7-7.9), جيد (5.5-6.9), يحتاج تطوير عميق (1-5.4)
- **Visual grade scale bar** (RTL) showing all 5 grades with active indicator

### Results Header

Top of results page shows:
- Article title (extracted from first line of text)
- Tool type badge
- Score + grade
- **"شارك نتيجتك" share button**

### Share Popup

The share button opens a popup with:
- WhatsApp, X, LinkedIn, Facebook icons
- "نسخ الرابط" copy button
- Dynamic share text with score and grade-specific emoji:

| Grade | Emoji |
|---|---|
| استثنائي (9-10) | 🏆 |
| ممتاز (8-8.9) | 🔥 |
| جيّد جدًا (7-7.9) | 💪 |
| جيد (5.5-6.9) | ✍️ |
| يحتاج تطوير عميق (1-5.4) | 📝 |

Share text format:
```
اختبرت نصي على منصة كتابة… والنتيجة؟ 8/10 🔥
تقييم ممتاز!
هل سيحصل نصك على نتيجة أفضل؟ جرّب الاختبار:
kitabh.com/tools/article_checker
```

### Extended Report

- 10-pillar detailed analysis (each pillar clickable for details)
- Category grid with scores
- Strengths & improvements
- Grammar check results
- Spider/radar chart
- Shape matching (story shapes for story type)

### Export

- **PNG export** — generates a branded image card with score
- **PDF export** — full report as downloadable PDF

---

## User Behavior Summary

| | Visitor | Free (signed in) | Premium (Writers Plan) |
|---|---|---|---|
| Uses per tool | 5 lifetime | 5 lifetime (same counter!) | Unlimited |
| Signup popup | Shows on first use | — | — |
| Paywall | After 5 uses | After 5 uses | Never |
| Trial bar | Shows below textarea | Shows below textarea | Hidden |
| Share button | Available on results | Available on results | Available on results |

**Important:** Visitors and free users share the SAME 5 uses (stored in `localStorage` key `kb_tools_usage` under the `"checker"` tool ID). Signing up does NOT reset uses.

---

## localStorage Keys Used

| Key | What it stores | Notes |
|---|---|---|
| `kb_tools_usage` | Trial usage counter (shared with Outline/Carousel) | UI only — enforce server-side |
| `kb_user_email` | Email from signup popup | For visitors who enter email |
| `kb_checker_history` | Previous analyses (up to 20) | Stored locally, no backend needed |

---

## Component Props

```typescript
<KitabhChecker />              // Default: reads auth from window.__KITABH_USER
<KitabhChecker premium />      // Force premium mode (unlimited, no trial bar)
```

---

## HubSpot Integration

On signup popup submit, the component sends form data to HubSpot portal `47847903`. The form captures email for lead generation.

On analysis complete (for signed-in users), it sends analysis data (score, label, tool type) to HubSpot as contact properties:
- `kitabh_checker_score`
- `kitabh_checker_label`
- `kitabh_checker_tool`

---

## TL;DR — Priority Order

1. **Backend endpoint for Gemini** — currently uses `/api/gemini` proxy. Replace with your backend + server-side usage enforcement
2. **`/tools/checker` page** rendering the component
3. **Update `/tools` page** — add the Checker card
4. **Signup/paywall buttons** wired to real flows
5. **Meta Pixel events** firing correctly
6. **"Pick article from Kitabh"** for signed-in users
7. **Share URL** — update `kitabh.com/tools/article_checker` to final production URL

Everything else (localStorage, trial bar, history, export, share popup, grade scale) works out of the box with no backend.
