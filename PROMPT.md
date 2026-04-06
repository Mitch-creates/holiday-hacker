# Holiday Optimizer — Cursor Agent Prompt

## Project Overview

**Name:** Holiday Hacker  
**URL:** holidayoptimizer.com  
**Repository:** ~/projects/holiday-hacker  
**Tech stack:** Next.js (App Router) + TypeScript + Tailwind CSS + Radix UI

---

## Your Task

Redesign and rebuild Holiday Hacker to be genuinely useful and visually distinct. There are three major areas:

1. **Algorithm** — make it smarter and actually useful
2. **Visual design** — neo-brutalist aesthetic with a proper dark mode
3. **Mobile UX** — must feel like a native mobile app on phones

---

## What Holiday Hacker Currently Does

The app takes your vacation days, year, country, region, and company holidays, then shows you the optimal holiday periods based on a chosen strategy:
- **Long Weekends** — 3-4 day breaks around public holidays
- **Mid-week Breaks** — 5-6 day breaks
- **Week-long holidays** — 7-day breaks
- **Extended holidays** — 10+ days using all available days

The algorithm in `src/lib/holidayCalculations.ts` currently finds periods and scores them, but the results require a lot of manual interpretation and aren't that smart.

---

## What Needs to Change

### 1. The Algorithm (highest priority)

The current algorithm is too simplistic. It needs to become genuinely useful. Here are directions to explore — ask clarifying questions before choosing a direction:

**Possible improvements:**
- Consider not just public holidays but their QUALITY (e.g., a 3-day weekend is worth more than a random Tuesday off)
- Weight days differently — a Friday after a public holiday on Thursday is worth more than a random Monday
- Consider travel distances or "worth-it-ness" of a break (short break vs extended)
- Consider that stretching fewer days across MORE breaks might feel better than using all days in one go
- Consider cluster analysis — group similar optimal periods and rank them
- Show the TRADE-OFF explicitly: "use 3 days to get 9 days off" vs "use 5 days to get 16 days off"
- Show a CALENDAR view alongside the list view
- Allow filtering/sorting by: total days off, days used, ROI (days off per vacation day spent), proximity to desired dates

**What NOT to do:**
- Don't just make cosmetic changes to the existing scoring
- Don't make it feel like a re-skinned holiday-optimizer.com
- The value is in making it actually smarter, not just prettier

### 2. Visual Design

**Neo-brutalist direction:**
- Bold, high-contrast visuals
- Thick borders (3px+), stark color blocks
- Intentionally "raw" feel — no soft shadows, no subtle gradients
- Bold sans-serif typography
- Exposed structure — you can SEE the grid, the borders, the building blocks
- Playful but functional

**Dark mode:**
- Already partially exists in the CSS — refine it properly
- The neo-brutalist aesthetic should work in both light AND dark mode
- Not just an inversion — proper dark theme design
- High contrast is even more important in dark mode

**Color direction:**
- Pick a bold accent color that pops
- Holiday-optimizer.com uses soft corporate blues — make it feel different
- Consider something like a bold yellow, orange, or green as the primary accent

### 3. Mobile UX

**Must feel native on mobile:**
- Currently it's a responsive web app — needs to feel like an app
- Think: bottom sheet results instead of scrolling page
- Think: swipeable cards for holiday periods
- Think: sticky input bar at bottom
- Think: larger touch targets, thumb-friendly spacing
- Think: haptic feedback if possible
- Think: full-screen feel — no browser chrome feeling

**Specific mobile improvements:**
- Results could appear as a swipeable card stack
- Calendar view should be touch-friendly (pinch to zoom, swipe months)
- Form steps could be a bottom-sheet wizard instead of a scrolling page
- On mobile: form and results could be a tabbed interface (input / results)

---

## Before You Start — Clarifying Questions

Ask me these questions before making major decisions. I'm happy to answer — these are important choices:

1. **Algorithm direction** — which of the algorithm improvements interest you most? Or is there a specific pain point you've experienced with the current results?

2. **Mobile design** — should the mobile app feel be more like a travel app (casual, visual, swipeable) or more like a productivity app (structured, data-rich, efficient)?

3. **Neo-brutalist palette** — any color direction you already like? Or should I propose something bold that contrasts clearly with holiday-optimizer.com?

4. **Calendar view** — how important is a proper calendar visualization? Full monthly calendar with highlighted holiday periods, or just a list view with a mini calendar strip?

5. **Scope priority** — if we need to prioritize, what's most important: (a) the algorithm improvement, (b) the visual redesign, (c) the mobile app feel?

---

## Design Reference Points

**Holiday-optimizer.com (to avoid looking like):**
- Soft blue color scheme
- Clean corporate SaaS aesthetic
- Standard card-based results layout
- Generic "maximize your holiday" marketing feel

**Neo-brutalist inspiration:**
- Behance / Dribbble brutalist UI examples
- Linear.app's dark mode (for reference on contrast)
- Notion's clean but structured approach
- Think: bold borders, visible grid, raw functional aesthetic

---

## File Structure to Know

```
app/
  layout.tsx                 ← Root layout
  page.tsx                  ← Home page
  globals.css               ← Tailwind + CSS variables + dark mode
  api/                     ← API routes (if needed)
components/
  lib/
    holidayCalculations.ts   ← THE ALGORITHM — highest priority
  components/
    Form/                   ← Input form components
    Output/                 ← Results display components
    Layout/                 ← Header, Footer, etc.
  context/
    FormContext.tsx         ← Form state
    FormResultsContext.tsx  ← Calculation results state
```

---

## Constraints

- Migrate to Next.js with App Router architecture
- Server components where appropriate for data fetching
- API routes or Server Actions for any server-side logic
- Keep the same Tailwind + Radix UI pattern
- Don't break the existing form logic
- Keep the same data flow: form → context → calculations → results
- The algorithm changes can be substantial but should still return the same data shape
- Dark mode should persist (localStorage or system preference)

---

## Umami Analytics Setup

Umami is already set up for this project. The component is at:
```
components/umami-analytics.tsx
```

### Environment Variables
Add to `.env.local`:
```
NEXT_PUBLIC_UMAMI_WEBSITE_ID=your-website-id
NEXT_PUBLIC_UMAMI_URL=https://cloud.umami.is
```

### Adding to the App

In `app/layout.tsx`, add the import and place it inside the `<body>` tag (before closing `</body>`):

```tsx
import UmamiAnalytics from "@/components/umami-analytics";

// In the body, near the bottom:
<UmamiAnalytics />
```

### Cookie Consent Banner
Since essential cookies (session, locale preference) still exist, a minimal consent banner is included:

```
components/cookie-consent-banner.tsx
```

Add it to `app/layout.tsx` after the main content, before `UmamiAnalytics`:

```tsx
<CookieConsentBanner />
<UmamiAnalytics />
```

The banner only shows if the user hasn't made a choice. It stores consent in localStorage. Accepting or dismissing hides it permanently.

### Important
- Umami is **cookie-free and GDPR-compliant** — no consent needed for analytics
- Essential cookies (session, locale) still exist — the banner handles disclosure
- It loads **unconditionally** — no consent gate required
- If no `NEXT_PUBLIC_UMAMI_WEBSITE_ID` is set, the component renders nothing
- For self-hosting: set `NEXT_PUBLIC_UMAMI_URL` to your self-hosted Umami instance

### Creating an Umami Website
1. Sign up at https://umami.is or self-host
2. Create a new website in the Umami dashboard
3. Copy the Website ID (looks like: `a1b2c3d4-...`)
4. Add it to `.env.local`

## Legal Pages

Holiday Hacker needs three legal pages: **Impressum**, **Privacy Policy**, and **Terms of Service**. These should match the style and structure of your other projects (see chatati for reference).

### Content Sources
Use these as templates — adapt to Holiday Hacker:
- **Impressum:** `chatati/app/[locale]/impressum/page.tsx` + its translation files
- **Privacy Policy:** `chatati/app/[locale]/privacy/page.tsx` + its translation files
- **Terms of Service:** `chatati/app/[locale]/terms/page.tsx` + its translation files

### What to Adapt for Holiday Hacker

**Impressum:**
- Service provider: Michiel Van de Vyver (same address as Chatati)
- Contact: contact@holidayoptimizer.com (create this email or use existing)
- Website name: Holiday Hacker
- URL: https://holidayoptimizer.com
- Remove anything Chatati-specific (matching, language exchange, etc.)

**Privacy Policy:**
- Since Umami is used (cookie-free): no analytics cookies needed in the policy
- Data collected: user input for vacation days, country/region selection, calculation results
- No user accounts in the MVP — so much of the Chatati privacy policy about user profiles doesn't apply
- Key sections needed:
  - What data is collected (user inputs only)
  - How data is used (to calculate and display holiday optimizations)
  - No third-party data sharing (unless you add email/accounts later)
  - Umami analytics: explain it's cookie-free and why that's different
  - User rights (access, erasure — basic GDPR rights)

**Terms of Service:**
- This is a vacation planning tool — disclaim that results are for guidance only
- No warranty on accuracy of public holiday data
- Acceptable use: personal use only, no scraping, no commercial misuse
- Liability disclaimer for incorrect results
- No accounts = no account termination section needed for MVP

**Key differences from Chatati:**
- No user accounts or profiles
- No messaging between users
- No sensitive personal data beyond what the user enters
- Cookie-free analytics (Umami) = much simpler cookie section
- Results are informational, not consequential = weaker liability disclaimers needed

### Design Consistency
The legal pages should use the same layout as the rest of Holiday Hacker:
- Neo-brutalist styling with thick borders and bold typography
- Same container width and spacing
- Dark mode support
- Mobile-responsive

### Navigation
Add links to the legal pages in the footer:
- "Impressum" → `/impressum`
- "Privacy Policy" → `/privacy`
- "Terms of Service" → `/terms`

## Success Criteria

1. The app gives genuinely smarter results than just "find public holidays and show them"
2. The design looks nothing like holiday-optimizer.com
3. On mobile it genuinely feels like using an app, not a website
4. Dark mode is fully polished and matches the neo-brutalist direction
5. The whole thing feels like a product someone would actually pay for or use daily
6. Umami analytics is properly integrated and tracking page views
7. Legal pages (Impressum, Privacy Policy, Terms of Service) are complete, accurate, and styled consistently
