import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import GlobeSpinner from "./components/Layout/GlobeSpinner";
import CookieConsentBanner from "./components/cookie-consent-banner";
import UmamiAnalytics from "./components/umami-analytics";

// Dynamically import components
const AppLayout = lazy(() => import("./AppLayout"));
const PrivacyPolicy = lazy(() => import("./components/Layout/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./components/Layout/TermsOfService"));
const Impressum = lazy(() => import("./components/Layout/Impressum"));

export default function App() {
  return (
    <Suspense fallback={<GlobeSpinner />}>
      <>
        <Routes>
          <Route path="/" element={<AppLayout />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/impressum" element={<Impressum />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
        </Routes>
        <CookieConsentBanner />
        <UmamiAnalytics />
      </>
    </Suspense>
  );
}
