import Footer from "./Footer";
import Header from "./Header";

export default function TermsOfService() {
  const lastUpdatedDate = "April 6, 2026";

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-background py-10 sm:py-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-black text-foreground">
              Terms of Service
            </h1>
            <p className="mt-3 text-muted-foreground">
              Terms for using Holiday Hacker.
            </p>
          </div>

          <div className="rounded-2xl border-[3px] border-foreground bg-card p-6 sm:p-8 shadow-[6px_6px_0_0_rgba(0,0,0,0.8)]">
            <p className="text-sm text-muted-foreground mb-6">
              <strong>Last Updated:</strong> {lastUpdatedDate}
            </p>

            <p className="text-foreground leading-relaxed mb-5">
              These Terms of Service govern use of Holiday Hacker ("the
              Service"). By using the Service, you agree to these Terms.
            </p>

            <h2 className="text-2xl font-bold text-foreground mt-10 mb-4 pb-2 border-b-2 border-border">
              1. Purpose of the Service
            </h2>
            <p className="text-foreground leading-relaxed mb-5">
              Holiday Hacker is a vacation planning and optimization tool. It is
              provided for informational guidance only.
            </p>

            <h2 className="text-2xl font-bold text-foreground mt-10 mb-4 pb-2 border-b-2 border-border">
              2. No Warranty on Accuracy
            </h2>
            <p className="text-foreground leading-relaxed mb-5">
              While we strive for reliable public holiday and date logic, we do
              not guarantee completeness, correctness, or fitness for a specific
              purpose. You remain responsible for validating dates before making
              travel or leave decisions.
            </p>

            <h2 className="text-2xl font-bold text-foreground mt-10 mb-4 pb-2 border-b-2 border-border">
              3. Acceptable Use
            </h2>
            <ul className="list-disc list-inside pl-5 mb-5 space-y-1 text-foreground leading-relaxed">
              <li>Use the Service for lawful and personal planning purposes</li>
              <li>Do not scrape, abuse, or overload the Service</li>
              <li>Do not attempt unauthorized access or disruption</li>
              <li>Do not use the Service for unlawful commercial misuse</li>
            </ul>

            <h2 className="text-2xl font-bold text-foreground mt-10 mb-4 pb-2 border-b-2 border-border">
              4. Limitation of Liability
            </h2>
            <p className="text-foreground leading-relaxed mb-5">
              To the maximum extent permitted by law, Holiday Hacker is not
              liable for indirect, incidental, or consequential damages arising
              from use of the Service or reliance on generated results.
            </p>

            <h2 className="text-2xl font-bold text-foreground mt-10 mb-4 pb-2 border-b-2 border-border">
              5. Intellectual Property
            </h2>
            <p className="text-foreground leading-relaxed mb-5">
              All rights, title, and interest in Holiday Hacker, including code,
              design, branding, and content, remain with the operator unless
              stated otherwise.
            </p>

            <h2 className="text-2xl font-bold text-foreground mt-10 mb-4 pb-2 border-b-2 border-border">
              6. Changes to the Service and Terms
            </h2>
            <p className="text-foreground leading-relaxed mb-5">
              We may update the Service and these Terms over time. Continued use
              after updates means you accept the revised Terms.
            </p>

            <h2 className="text-2xl font-bold text-foreground mt-10 mb-4 pb-2 border-b-2 border-border">
              7. Governing Law
            </h2>
            <p className="text-foreground leading-relaxed mb-5">
              These Terms are governed by applicable Belgian law unless
              mandatory local consumer protection rules state otherwise.
            </p>

            <h2 className="text-2xl font-bold text-foreground mt-10 mb-4 pb-2 border-b-2 border-border">
              8. Contact
            </h2>
            <p className="text-foreground leading-relaxed">
              Questions about these Terms can be sent to{" "}
              <a
                href="mailto:contact@holidayoptimizer.com"
                className="underline text-theme-5 hover:text-theme-6"
              >
                contact@holidayoptimizer.com
              </a>
              .
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
