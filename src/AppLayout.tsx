import { HolidayForm } from "./components/Form/HolidayForm";
import OutputContainer from "./components/Output/OutputContainer";
import { useFormResults } from "./context/FormResultsContext";
import Header from "./components/Layout/Header"; // Added import
import Footer from "./components/Layout/Footer"; // Added import

export default function AppLayout() {
  // Get isCalculated from the FormContext
  const { state } = useFormResults();
  // const hasGeneratedResult = state.isCalculated; // Previous logic
  const showOutputArea = state.status !== "idle"; // New logic: show if not idle

  return (
    <>
      {/* Main container for the entire app layout */}
      <div className="flex flex-col min-h-screen">
        <Header /> {/* Added Header component */}
        {/* Main content area that grows to fill available space */}
        <main
          // This code makes sure that the form is always centered in the middle of the screen
          // and that the form is always 100% width on mobile and 33.3333% width on desktop
          className={`flex-grow px-4 py-8 flex ${
            showOutputArea // Use new logic here
              ? "flex-col lg:flex-row gap-8"
              : "justify-center items-center"
          }`}
        >
          {/* Form Container */}
          <div
            className={`${
              showOutputArea // And here
                ? "w-full lg:max-w-[33.3333%]"
                : "w-full max-w-xl"
            } transition-all mb-8 lg:mb-0`}
          >
            <HolidayForm></HolidayForm>
          </div>
          {showOutputArea && (
            <div
              id="output-container-wrapper"
              className="w-full lg:flex-1 border p-4 rounded-2xl shadow-sm mb-6 bg-white space-y-2"
            >
              <OutputContainer></OutputContainer>
            </div>
          )}
        </main>
        <Footer /> {/* Added Footer component */}
      </div>
    </>
  );
}
