import React from "react";
import Link from "next/link";
import Image from "next/image";

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-card/95 backdrop-blur shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/calendar-heart-logo.svg"
            alt="Holiday Optimizer Logo"
            width={32}
            height={32}
            className="h-8 w-auto"
          />
          <span className="text-xl font-semibold text-foreground">
            Holiday <span className="text-primary">Optimizer</span>
          </span>
        </Link>
        {/* Navigation items can be added here later if needed */}
      </div>
    </header>
  );
};

export default Header;
