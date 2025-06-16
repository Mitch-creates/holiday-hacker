import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import GlobeSpinner from "./components/Layout/GlobeSpinner";

// Dynamically import components
const AppLayout = lazy(() => import("./AppLayout"));
const PrivacyPolicy = lazy(() => import("./components/Layout/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./components/Layout/TermsOfService"));

export default function App() {
  return (
    <Suspense fallback={<GlobeSpinner />}>
      <Routes>
        <Route path="/" element={<AppLayout />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
      </Routes>
    </Suspense>
  );
}
