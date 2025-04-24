import { useState } from "react";
import { HolidayForm } from "./components/Form/HolidayForm";

export default function App() {
  const [hasGeneratedResult, setHasGeneratedResult] = useState(false);
  return (
    <>
      <div
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
          } transition-all`}
        >
          <HolidayForm hasGeneratedResult={hasGeneratedResult}></HolidayForm>
        </div>
        {hasGeneratedResult && (
          <div className="w-full lg:flex-1">
            {/* Your generated results go here */}
          </div>
        )}
      </div>
    </>
  );
}
