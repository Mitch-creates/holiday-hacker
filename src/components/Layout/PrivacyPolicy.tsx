import Header from "./Header";
import Footer from "./Footer";

export default function PrivacyPolicy() {
  const lastUpdatedDate = "April 6, 2026";

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-background py-10 sm:py-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-black text-foreground">
              Privacy Policy
            </h1>
            <p className="mt-3 text-muted-foreground">
              How Holiday Hacker handles your data.
            </p>
          </div>

          <div className="rounded-2xl border-[3px] border-foreground bg-card p-6 sm:p-8 shadow-[6px_6px_0_0_rgba(0,0,0,0.8)]">
            <p className="text-sm text-muted-foreground mb-6">
              <strong>Last Updated:</strong> {lastUpdatedDate}
            </p>

            <p className="text-foreground leading-relaxed mb-5">
              This Privacy Policy explains what data Holiday Hacker ("we", "our",
              "us") processes when you use our vacation planning tool.
            </p>

            <h2 className="text-2xl font-bold text-foreground mt-10 mb-4 pb-2 border-b-2 border-border">
              1. Data We Process
            </h2>
            <p className="text-foreground leading-relaxed mb-5">
              We process the information you enter into the app to generate
              holiday suggestions, including:
            </p>
            <ul className="list-disc list-inside pl-5 mb-5 space-y-1 text-foreground leading-relaxed">
              <li>Vacation day count</li>
              <li>Selected year, country, and region</li>
              <li>Company holiday entries you provide</li>
              <li>Generated calculation outputs shown in the UI</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mb-5">
              Holiday Hacker does not require user accounts in this MVP and does
              not build personal user profiles.
            </p>

            <h2 className="text-2xl font-bold text-foreground mt-10 mb-4 pb-2 border-b-2 border-border">
              2. How We Use Data
            </h2>
            <p className="text-foreground leading-relaxed mb-5">
              Data is used only to run and improve the planner experience:
            </p>
            <ul className="list-disc list-inside pl-5 mb-5 space-y-1 text-foreground leading-relaxed">
              <li>Calculate optimized holiday periods from your inputs</li>
              <li>Display and refine results within your current session</li>
              <li>Understand product usage trends to improve UX</li>
            </ul>

            <h2 className="text-2xl font-bold text-foreground mt-10 mb-4 pb-2 border-b-2 border-border">
              3. Analytics (Umami)
            </h2>
            <p className="text-foreground leading-relaxed mb-5">
              We use Umami Analytics to measure aggregated page usage.
              Umami is configured in a cookie-free mode and is designed for
              privacy-friendly analytics.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-5">
              Umami data helps us understand what features are used, but it is
              not used to create individual marketing profiles.
            </p>

            <h2 className="text-2xl font-bold text-foreground mt-10 mb-4 pb-2 border-b-2 border-border">
              4. Data Sharing
            </h2>
            <p className="text-foreground leading-relaxed mb-5">
              We do not sell personal data. We do not share your planner inputs
              with third parties for advertising.
            </p>

            <h2 className="text-2xl font-bold text-foreground mt-10 mb-4 pb-2 border-b-2 border-border">
              5. Storage and Security
            </h2>
            <p className="text-foreground leading-relaxed mb-5">
              App state may be stored in your browser (for preferences and UX
              continuity). We take reasonable technical measures, but no system
              can guarantee absolute security.
            </p>

            <h2 className="text-2xl font-bold text-foreground mt-10 mb-4 pb-2 border-b-2 border-border">
              6. Your GDPR Rights
            </h2>
            <p className="text-foreground leading-relaxed mb-5">
              Depending on your jurisdiction, you may have rights including:
            </p>
            <ul className="list-disc list-inside pl-5 mb-5 space-y-1 text-foreground leading-relaxed">
              <li>Access to your personal data</li>
              <li>Rectification of inaccurate data</li>
              <li>Erasure of data</li>
              <li>Restriction or objection to processing</li>
              <li>Data portability where applicable</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mb-5">
              To exercise your rights, contact us at the email below.
            </p>

            <h2 className="text-2xl font-bold text-foreground mt-10 mb-4 pb-2 border-b-2 border-border">
              7. Changes to This Policy
            </h2>
            <p className="text-foreground leading-relaxed mb-5">
              We may update this policy as the product evolves. Changes become
              effective once published on this page with a new "Last Updated"
              date.
            </p>

            <h2 className="text-2xl font-bold text-foreground mt-10 mb-4 pb-2 border-b-2 border-border">
              8. Contact
            </h2>
            <p className="text-foreground leading-relaxed mb-5">
              For privacy questions, contact:
            </p>
            <p className="text-foreground leading-relaxed">
              Email:{" "}
              <a
                href="mailto:contact@holidayoptimizer.com"
                className="underline text-theme-5 hover:text-theme-6"
              >
                contact@holidayoptimizer.com
              </a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
