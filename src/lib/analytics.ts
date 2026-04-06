type EventProperties = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    umami?: {
      track: (eventName: string, properties?: EventProperties) => void;
    };
  }
}

export function trackEvent(eventName: string, properties?: EventProperties) {
  if (typeof window === "undefined") return;
  if (!window.umami || typeof window.umami.track !== "function") return;
  window.umami.track(eventName, properties);
}
