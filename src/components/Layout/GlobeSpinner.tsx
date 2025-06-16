import React from "react";
import { Globe } from "lucide-react";

const GlobeSpinner: React.FC = () => {
  return (
    <div className="flex flex-col justify-center items-center h-screen font-sans">
      <Globe className="w-16 h-16 text-blue-500 animate-spin mb-4" />
      <p className="text-lg text-gray-600">Loading...</p>
    </div>
  );
};

export default GlobeSpinner;
