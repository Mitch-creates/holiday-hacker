# Holiday Hacker — Umami Analytics Setup

## Task

Add Umami privacy-friendly analytics to Holiday Hacker.

## What to Do

### 1. Environment Variables

Add to `.env.local`:
```
NEXT_PUBLIC_UMAMI_WEBSITE_ID=your-website-id
NEXT_PUBLIC_UMAMI_URL=https://cloud.umami.is
```

### 2. Umami Analytics Component

A component already exists at:
```
components/umami-analytics.tsx
```

Review it. It loads the Umami script with the website ID from environment variables.

### 3. Cookie Consent Banner

A minimal cookie consent banner exists at:
```
components/cookie-consent-banner.tsx
```

Review it. It only shows if the user hasn't made a choice yet. Umami loads unconditionally (cookie-free, no consent needed), but essential cookies still exist so the banner handles disclosure.

### 4. Add to Layout

In `app/layout.tsx`, add both components inside the `<body>` tag, before the closing `</body>`:

```tsx
import UmamiAnalytics from "@/components/umami-analytics";
import CookieConsentBanner from "@/components/cookie-consent-banner";

// Add before </body>:
<CookieConsentBanner />
<UmamiAnalytics />
```

### 5. Get Your Umami Website ID

1. Sign up at https://umami.is (cloud version) or self-host
2. Create a website named "Holiday Hacker"
3. Copy the Website ID (format: `a1b2c3d4-...`)
4. Add it to `.env.local`

### Important Notes

- Umami is **cookie-free** — no cookie consent is legally required for analytics
- The cookie consent banner is for essential cookies (session, locale), not analytics
- The banner only appears once per user, then stores their preference in localStorage
- If `NEXT_PUBLIC_UMAMI_WEBSITE_ID` is not set, the analytics component renders nothing

## Verification

After setup:
1. Visit holidayoptimizer.com
2. Check the browser console for any errors
3. Verify Umami shows the page view in your Umami dashboard
4. Verify the cookie consent banner appears once and remembers the choice
