import { useState } from "react";
import { HolidayForm } from "./components/Form/HolidayForm";

export default function App() {
  const [hasGeneratedResult, setHasGeneratedResult] = useState(false);

  // Make AppLayout component
  return (
    <>
      <div
        // This code makes sure that the form is always centered in the middle of the screen
        // and that the form is always 100% width on mobile and 33.3333% width on desktop
        className={`flex min-h-screen px-4 py-8 ${
          hasGeneratedResult
            ? "flex-col lg:flex-row gap-8"
            : "justify-center items-center"
        }`}
      >
        {/* Form Container */}
        <div
          className={`${
            hasGeneratedResult
              ? "w-full lg:max-w-[33.3333%]"
              : "w-full max-w-xl"
          } transition-all mb-8 lg:mb-0`}
        >
          <HolidayForm hasGeneratedResult={hasGeneratedResult}></HolidayForm>
        </div>
        {hasGeneratedResult && (
          <div className="w-full lg:flex-1 border p-4 rounded-2xl shadow-sm mb-6 bg-white space-y-2">
            {/* My generated results go here */}
          </div>
        )}
      </div>
    </>
  );
}
