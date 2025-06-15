import React from "react";

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <a href="/" className="flex items-center gap-2">
          <img
            src="/calendar-heart-logo.svg"
            alt="Holiday Optimizer Logo"
            className="h-8 w-auto"
          />
          <span className="text-xl font-semibold text-gray-800">
            Holiday <span className="text-blue-300">Optimizer</span>
          </span>
        </a>
        {/* Navigation items can be added here later if needed */}
      </div>
    </header>
  );
};

export default Header;
