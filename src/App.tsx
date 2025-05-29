import AppLayout from "./AppLayout";
import { Routes, Route } from "react-router-dom";
import PrivacyPolicy from "./components/Layout/PrivacyPolicy";
import TermsOfService from "./components/Layout/TermsOfService";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
    </Routes>
  );
}
