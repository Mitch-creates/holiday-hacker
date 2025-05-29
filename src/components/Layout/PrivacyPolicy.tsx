import Header from "./Header";
import Footer from "./Footer";

export default function PrivacyPolicy() {
  const lastUpdatedDate = "May 29, 2025"; // Update this when the policy changes

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-gray-50 py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Privacy Policy
            </h1>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              How we collect, use, and protect your information at Holiday
              Optimizer.
            </p>
          </div>

          <div className="bg-white shadow-xl rounded-lg p-6 sm:p-8 lg:p-10">
            <p className="text-sm text-gray-500 mb-6">
              <strong>Last Updated:</strong> {lastUpdatedDate}
            </p>

            <p className="text-gray-700 leading-relaxed mb-5">
              Welcome to Holiday Optimizer ("Application", "we", "us", "our").
              We are committed to protecting your privacy. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your
              information when you use our Application. Please read this privacy
              policy carefully. If you do not agree with the terms of this
              privacy policy, please do not access the application.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mt-10 mb-4 pb-2 border-b border-gray-200">
              1. Collection of Your Information
            </h2>
            <p className="text-gray-700 leading-relaxed mb-5">
              We currently do not collect or store any personally identifiable
              information from you directly when you use Holiday Optimizer. The
              information you provide (such as selected country, region, number
              of holidays, etc.) is used solely for the purpose of calculating
              and displaying optimized holiday periods within your current
              session in the browser. This information is not saved on our
              servers and is lost once you close or refresh the browser tab,
              unless cached by your browser for your convenience.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-3">
              Analytics Data (Google Analytics)
            </h3>
            <p className="text-gray-700 leading-relaxed mb-5">
              To improve our Application and understand how it is used, we plan
              to implement Google Analytics. Google Analytics is a web analytics
              service offered by Google that tracks and reports website traffic.
              Google uses the data collected to track and monitor the use of our
              Application. This data may be shared with other Google services.
              Google may use the collected data to contextualize and personalize
              the ads of its own advertising network.
            </p>
            <p className="text-gray-700 leading-relaxed mb-5">
              Google Analytics may collect information such as:
            </p>
            <ul className="list-disc list-inside pl-5 mb-5 space-y-1 text-gray-700 leading-relaxed">
              <li>Your device's IP address (anonymized where possible)</li>
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Pages you visit within our Application</li>
              <li>
                Time and date of your visit, and time spent on those pages
              </li>
              <li>Other diagnostic data</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-5">
              This information is collected in an aggregated and anonymous form
              and is not used to personally identify you. For more information
              on the privacy practices of Google, please visit the Google
              Privacy & Terms web page:{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                https://policies.google.com/privacy
              </a>
            </p>
            <p className="text-gray-700 leading-relaxed mb-5">
              We will provide information on how to opt-out of Google Analytics
              tracking once it is implemented.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mt-10 mb-4 pb-2 border-b border-gray-200">
              2. Use of Your Information
            </h2>
            <p className="text-gray-700 leading-relaxed mb-5">
              As stated, we do not collect personally identifiable information
              other than through Google Analytics (once implemented). The
              non-personal information you input for holiday calculations is
              used only to provide the core functionality of the Application
              during your active session.
            </p>
            <p className="text-gray-700 leading-relaxed mb-5">
              Information collected via Google Analytics (once implemented) will
              be used to:
            </p>
            <ul className="list-disc list-inside pl-5 mb-5 space-y-1 text-gray-700 leading-relaxed">
              <li>Understand and analyze how you use our Application</li>
              <li>
                Improve and optimize our Application's performance and features
              </li>
              <li>Monitor usage trends</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-800 mt-10 mb-4 pb-2 border-b border-gray-200">
              3. Disclosure of Your Information
            </h2>
            <p className="text-gray-700 leading-relaxed mb-5">
              We do not sell, trade, rent, or otherwise transfer your personally
              identifiable information to outside parties.
            </p>
            <p className="text-gray-700 leading-relaxed mb-5">
              Aggregated, anonymized data collected by Google Analytics may be
              shared with Google as described in their privacy policy.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mt-10 mb-4 pb-2 border-b border-gray-200">
              4. Security of Your Information
            </h2>
            <p className="text-gray-700 leading-relaxed mb-5">
              We use administrative, technical, and physical security measures
              to help protect any information transmitted via the Application.
              While we have taken reasonable steps to secure the information,
              please be aware that despite our efforts, no security measures are
              perfect or impenetrable, and no method of data transmission can be
              guaranteed against any interception or other type of misuse.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mt-10 mb-4 pb-2 border-b border-gray-200">
              5. Policy for Children
            </h2>
            <p className="text-gray-700 leading-relaxed mb-5">
              We do not knowingly solicit information from or market to children
              under the age of 13. If you become aware of any data we have
              collected from children under age 13, please contact us using the
              contact information provided below.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mt-10 mb-4 pb-2 border-b border-gray-200">
              6. Changes to This Privacy Policy
            </h2>
            <p className="text-gray-700 leading-relaxed mb-5">
              We may update this Privacy Policy from time to time. We will
              notify you of any changes by posting the new Privacy Policy on
              this page and updating the "Last Updated" date. You are advised to
              review this Privacy Policy periodically for any changes. Changes
              to this Privacy Policy are effective when they are posted on this
              page.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mt-10 mb-4 pb-2 border-b border-gray-200">
              7. Contact Us
            </h2>
            <p className="text-gray-700 leading-relaxed mb-5">
              If you have questions or comments about this Privacy Policy,
              please contact us at:
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
