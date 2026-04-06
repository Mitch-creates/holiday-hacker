# Holiday Hacker

Holiday Hacker is a PTO optimization app that helps users maximize days off by combining vacation days, public holidays, weekends, and company holidays.

## Current Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS + Radix UI
- React Query
- Umami Analytics (cookie-free)

## Core Features

- Smart strategy engine with quality + ROI-aware scoring
- Explicit trade-offs (`days off`, `days used`, `ROI`)
- Mobile-first results UX (planner/results tabs, swipe cards, sticky controls)
- List view + calendar view for generated periods
- Sorting and filtering:
  - best ROI
  - most days off
  - fewest days used
  - soonest date
  - desired month proximity
- Scenario compare cards with delta chips vs baseline
- Calendar export (`.ics`)
- Share actions + interaction analytics events
- Legal pages:
  - `/impressum`
  - `/privacy`
  - `/terms`

## Run Locally

```bash
npm install --legacy-peer-deps
npm run dev
```

Open `http://localhost:3000`.

Production build:

```bash
npm run build
npm run start
```

## Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_UMAMI_WEBSITE_ID=<your-website-id>
NEXT_PUBLIC_UMAMI_URL=https://cloud.umami.is
```

If no website ID is set, analytics component safely renders nothing.

## QA Smoke Checklist

Use this before release:

1. Generate results from realistic inputs (country + strategy + company holiday).
2. Verify list/calendar toggle and sorting/filtering combinations.
3. Verify scenario compare apply behavior.
4. Verify `.ics` export starts download.
5. Verify share buttons and copy link action.
6. Verify legal pages and legacy redirects:
   - `/privacy-policy` -> `/privacy`
   - `/terms-of-service` -> `/terms`
7. Verify mobile behaviors:
   - planner/results segmented switch
   - sticky adjust-plan button
   - swipe cards with indicator dots

## Notes

- Legacy Vite runtime has been migrated to Next.js App Router.
- Some dev-only warnings can appear from non-blocking lint rules; production build and app flows should remain stable.
