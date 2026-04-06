import { useEffect } from "react";

export default function UmamiAnalytics() {
  const websiteId =
    import.meta.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID ||
    import.meta.env.VITE_UMAMI_WEBSITE_ID;
  const scriptUrl =
    import.meta.env.NEXT_PUBLIC_UMAMI_URL ||
    import.meta.env.VITE_UMAMI_URL ||
    "https://cloud.umami.is";

  useEffect(() => {
    if (!websiteId) return;
    if (document.querySelector('script[data-umami="holiday-hacker"]')) return;

    const script = document.createElement("script");
    script.defer = true;
    script.src = `${scriptUrl}/script.js`;
    script.setAttribute("data-website-id", websiteId);
    script.setAttribute("data-umami", "holiday-hacker");
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, [websiteId, scriptUrl]);

  return null;
}
