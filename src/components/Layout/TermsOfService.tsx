import Header from "./Header";
import Footer from "./Footer";

export default function TermsOfService() {
  const lastUpdatedDate = "May 29, 2025"; // Update this when the terms change

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-gray-50 py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Terms of Service
            </h1>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              Please read these terms carefully before using Holiday Optimizer.
            </p>
          </div>

          <div className="bg-white shadow-xl rounded-lg p-6 sm:p-8 lg:p-10">
            <p className="text-sm text-gray-500 mb-6">
              <strong>Last Updated:</strong> {lastUpdatedDate}
            </p>

            <p className="text-gray-700 leading-relaxed mb-5">
              Welcome to Holiday Optimizer ("Application", "we", "us", "our").
              These Terms of Service ("Terms") govern your use of our
              Application. Please read these Terms carefully before accessing or
              using the Application.
            </p>
            <p className="text-gray-700 leading-relaxed mb-5">
              By accessing or using the Application, you agree to be bound by
              these Terms. If you disagree with any part of the terms, then you
              may not access the Application.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mt-10 mb-4 pb-2 border-b border-gray-200">
              1. Use of the Application
            </h2>
            <p className="text-gray-700 leading-relaxed mb-5">
              Holiday Optimizer is provided to help users plan and optimize
              their holiday periods based on public holidays and user-defined
              inputs. You agree to use the Application only for its intended
              purpose and in accordance with all applicable laws and
              regulations.
            </p>
            <p className="text-gray-700 leading-relaxed mb-5">
              You agree not to:
            </p>
            <ul className="list-disc list-inside pl-5 mb-5 space-y-1 text-gray-700 leading-relaxed">
              <li>
                Use the Application in any way that could damage, disable,
                overburden, or impair the Application.
              </li>
              <li>
                Attempt to gain unauthorized access to any systems or networks
                connected to the Application.
              </li>
              <li>
                Use any automated system, including without limitation "robots,"
                "spiders," or "offline readers," to access the Application in a
                manner that sends more request messages to the Application's
                servers than a human can reasonably produce in the same period
                by using a conventional on-line web browser.
              </li>
              <li>
                Introduce any viruses, trojan horses, worms, logic bombs, or
                other material that is malicious or technologically harmful.
              </li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-800 mt-10 mb-4 pb-2 border-b border-gray-200">
              2. Intellectual Property
            </h2>
            <p className="text-gray-700 leading-relaxed mb-5">
              The Application and its original content (excluding content
              provided by users or third-party data like public holidays),
              features, and functionality are and will remain the exclusive
              property of the Application's creators/owners and its licensors.
              The Application is protected by copyright, trademark, and other
              laws of both domestic and foreign countries. Our trademarks and
              trade dress may not be used in connection with any product or
              service without the prior written consent of the Application's
              creators/owners.
            </p>
            <p className="text-gray-700 leading-relaxed mb-5">
              The "Holiday Optimizer" name and logo are trademarks of the
              Application's creators/owners.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mt-10 mb-4 pb-2 border-b border-gray-200">
              3. Disclaimer of Warranties
            </h2>
            <p className="text-gray-700 leading-relaxed mb-5">
              The Application is provided on an "AS IS" and "AS AVAILABLE"
              basis. Your use of the Application is at your sole risk. The
              Application is provided without warranties of any kind, whether
              express or implied, including, but not limited to, implied
              warranties of merchantability, fitness for a particular purpose,
              non-infringement, or course of performance.
            </p>
            <p className="text-gray-700 leading-relaxed mb-5">
              We do not warrant that a) the Application will function
              uninterrupted, secure, or available at any particular time or
              location; b) any errors or defects will be corrected; c) the
              Application is free of viruses or other harmful components; or d)
              the results of using the Application will meet your requirements.
            </p>
            <p className="text-gray-700 leading-relaxed mb-5">
              While we strive to provide accurate holiday data, we do not
              guarantee the accuracy or completeness of any information,
              including public holiday data, provided through the Application.
              You are responsible for verifying all information before making
              any decisions based on it.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mt-10 mb-4 pb-2 border-b border-gray-200">
              4. Limitation of Liability
            </h2>
            <p className="text-gray-700 leading-relaxed mb-5">
              In no event shall Holiday Optimizer, nor its directors, employees,
              partners, agents, suppliers, or affiliates, be liable for any
              indirect, incidental, special, consequential, or punitive damages,
              including without limitation, loss of profits, data, use,
              goodwill, or other intangible losses, resulting from (i) your
              access to or use of or inability to access or use the Application;
              (ii) any conduct or content of any third party on the Application;
              (iii) any content obtained from the Application; and (iv)
              unauthorized access, use, or alteration of your transmissions or
              content, whether based on warranty, contract, tort (including
              negligence), or any other legal theory, whether or not we have
              been informed of the possibility of such damage, and even if a
              remedy set forth herein is found to have failed of its essential
              purpose.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mt-10 mb-4 pb-2 border-b border-gray-200">
              5. Indemnification
            </h2>
            <p className="text-gray-700 leading-relaxed mb-5">
              You agree to defend, indemnify, and hold harmless Holiday
              Optimizer and its licensee and licensors, and their employees,
              contractors, agents, officers, and directors, from and against any
              and all claims, damages, obligations, losses, liabilities, costs
              or debt, and expenses (including but not limited to attorney's
              fees), resulting from or arising out of a) your use and access of
              the Application, or b) a breach of these Terms.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mt-10 mb-4 pb-2 border-b border-gray-200">
              6. Governing Law
            </h2>
            <p className="text-gray-700 leading-relaxed mb-5">
              These Terms shall be governed and construed in accordance with the
              laws of [Your Jurisdiction - e.g., your country or state, if
              applicable, otherwise you can state "the jurisdiction in which the
              Application owner is based"], without regard to its conflict of
              law provisions.
            </p>
            <p className="text-gray-700 leading-relaxed mb-5">
              Our failure to enforce any right or provision of these Terms will
              not be considered a waiver of those rights. If any provision of
              these Terms is held to be invalid or unenforceable by a court, the
              remaining provisions of these Terms will remain in effect. These
              Terms constitute the entire agreement between us regarding our
              Application and supersede and replace any prior agreements we
              might have had between us regarding the Application.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mt-10 mb-4 pb-2 border-b border-gray-200">
              7. Changes to Terms
            </h2>
            <p className="text-gray-700 leading-relaxed mb-5">
              We reserve the right, at our sole discretion, to modify or replace
              these Terms at any time. If a revision is material, we will
              provide at least 30 days' notice prior to any new terms taking
              effect by updating the "Last Updated" date of these Terms. What
              constitutes a material change will be determined at our sole
              discretion.
            </p>
            <p className="text-gray-700 leading-relaxed mb-5">
              By continuing to access or use our Application after any revisions
              become effective, you agree to be bound by the revised terms. If
              you do not agree to the new terms, you are no longer authorized to
              use the Application.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mt-10 mb-4 pb-2 border-b border-gray-200">
              8. Contact Us
            </h2>
            <p className="text-gray-700 leading-relaxed mb-5">
              If you have any questions about these Terms, please contact us at:
            </p>
            <p className="text-gray-700 leading-relaxed">
              Email:{" "}
              <a
                href="mailto:feedback.optimizer@gmail.com"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                feedback.optimizer@gmail.com
              </a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
