import { HolidayForm } from "./components/Form/HolidayForm";
import OutputContainer from "./components/Output/OutputContainer";
import { useFormResults } from "./context/FormResultsContext";
import Header from "./components/Layout/Header";
import Footer from "./components/Layout/Footer";
import { useEffect, useState } from "react";
import { SlidersHorizontal, MapPinned } from "lucide-react";

export default function AppLayout() {
  const { state } = useFormResults();
  const showOutputArea = state.status !== "idle";
  const [mobileView, setMobileView] = useState<"planner" | "results">("planner");

  useEffect(() => {
    if (state.status === "loading" || state.status === "success" || state.status === "error") {
      setMobileView("results");
    }
  }, [state.status]);

  return (
    <>
      {/* Main container for the entire app layout */}
      <div className="flex flex-col min-h-screen">
        <Header />
        {/* Title and Subtitle Section */}
        <div className="text-center px-4 py-8 bg-background">
          <h1 className="text-1xl font-black tracking-tight text-foreground sm:text-2xl md:text-3xl lg:text-4xl">
            Holiday Optimizer
          </h1>
          <p className="mt-3 text-base text-muted-foreground sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl">
            Maximize your time off by strategically planning your holidays
            around public and company holidays.
          </p>
        </div>
        {showOutputArea && (
          <div className="px-4 pb-2 lg:hidden">
            <div className="grid grid-cols-2 rounded-xl border-[3px] border-foreground bg-card p-1">
              <button
                type="button"
                onClick={() => setMobileView("planner")}
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  mobileView === "planner"
                    ? "bg-theme-2 text-black border-2 border-black"
                    : "text-foreground"
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Planner
              </button>
              <button
                type="button"
                onClick={() => setMobileView("results")}
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  mobileView === "results"
                    ? "bg-theme-5 text-white border-2 border-black"
                    : "text-foreground"
                }`}
              >
                <MapPinned className="h-4 w-4" />
                Results
              </button>
            </div>
          </div>
        )}
        {/* Main content area that grows to fill available space */}
        <main
          // This code makes sure that the form is always centered in the middle of the screen
          // and that the form is always 100% width on mobile and 33.3333% width on desktop
          className={`flex-grow px-4 py-8 flex ${
            showOutputArea
              ? "flex-col lg:flex-row lg:items-start gap-8"
              : "justify-center items-center"
          }`}
        >
          <section
            aria-label="Holiday Calculation Form"
            className={`${
              showOutputArea ? "w-full lg:max-w-[33.3333%]" : "w-full max-w-xl"
            } ${
              showOutputArea && mobileView !== "planner" ? "hidden lg:block" : "block"
            } transition-all mb-8 lg:mb-0`}
          >
            <HolidayForm></HolidayForm>
          </section>
          {showOutputArea && (
            <section
              aria-label="Optimized Holiday Results"
              id="output-container-wrapper"
              className={`w-full lg:flex-1 border-[3px] border-foreground p-4 rounded-2xl shadow-[6px_6px_0_0_rgba(0,0,0,0.8)] mb-6 bg-card space-y-2 ${
                mobileView !== "results" ? "hidden lg:block" : "block"
              }`}
            >
              <OutputContainer></OutputContainer>
            </section>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
}
