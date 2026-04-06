"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "hh_cookie_consent";

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const choice = localStorage.getItem(STORAGE_KEY);
    setVisible(!choice);
  }, []);

  if (!visible) return null;

  const close = (choice: "accepted" | "dismissed") => {
    localStorage.setItem(STORAGE_KEY, choice);
    setVisible(false);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 lg:left-auto lg:right-4 lg:max-w-md">
      <div className="surface-card-elevated p-4">
        <p className="text-sm text-foreground font-semibold mb-2">Cookie notice</p>
        <p className="text-sm text-muted-foreground mb-4">
          Holiday Hacker uses essential browser storage for preferences and uses
          cookie-free analytics for product improvement.
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => close("accepted")}
            className="px-3 py-2 rounded-lg border border-border bg-primary text-primary-foreground text-sm font-semibold active:scale-[0.99]"
          >
            Got it
          </button>
          <button
            type="button"
            onClick={() => close("dismissed")}
            className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm font-semibold active:scale-[0.99]"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
