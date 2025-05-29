import React from "react";
import { Mail, Twitter } from "lucide-react";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-8 md:flex-row md:px-6">
        <div className="text-sm text-gray-600">
          &copy; {currentYear} Holiday Optimizer. All rights reserved.
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
          <a
            href="/privacy-policy"
            className="text-gray-600 hover:text-gray-800 hover:underline"
          >
            Privacy Policy
          </a>
          <a
            href="/terms-of-service"
            className="text-gray-600 hover:text-gray-800 hover:underline"
          >
            Terms of Service
          </a>
          <a
            href="mailto:feedback.optimizer@gmail.com"
            className="flex items-center gap-2 px-4 py-2 bg-theme-4 text-white rounded-lg hover:bg-theme-4/80 transition-colors duration-300 shadow-md text-sm"
          >
            <Mail size={16} />
            Report Issue / Feedback
          </a>
        </nav>
        <div>
          <a
            href="https://x.com/_Mitchcreates"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Mitchcreates on X"
            className="text-gray-500 hover:text-gray-700"
          >
            <Twitter size={20} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
