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
          <h1 className="text-1xl font-extrabold tracking-tight text-foreground sm:text-2xl md:text-3xl lg:text-4xl">
            Holiday Optimizer
          </h1>
          <p className="mt-3 text-base text-muted-foreground sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl">
            Maximize your time off by strategically planning your holidays
            around public and company holidays.
          </p>
        </div>
        {showOutputArea && (
          <div className="px-4 pb-2 lg:hidden">
            <div className="segmented-control grid grid-cols-2">
              <button
                type="button"
                onClick={() => setMobileView("planner")}
                className={`segmented-control-button flex items-center justify-center gap-2 active:scale-[0.99] ${
                  mobileView === "planner"
                    ? "segmented-control-button-active"
                    : ""
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Planner
              </button>
              <button
                type="button"
                onClick={() => setMobileView("results")}
                className={`segmented-control-button flex items-center justify-center gap-2 active:scale-[0.99] ${
                  mobileView === "results"
                    ? "segmented-control-button-active"
                    : ""
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
            id="planner-section"
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
              className={`w-full lg:flex-1 surface-card-elevated p-4 mb-6 space-y-2 ${
                mobileView !== "results" ? "hidden lg:block" : "block"
              }`}
            >
              <OutputContainer></OutputContainer>
            </section>
          )}
        </main>
        {showOutputArea && mobileView === "results" && (
          <div className="lg:hidden sticky bottom-3 z-20 px-4 pb-2">
            <button
              type="button"
              onClick={() => {
                setMobileView("planner");
                requestAnimationFrame(() => {
                  document.getElementById("planner-section")?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                });
              }}
              className="w-full rounded-xl border border-border bg-primary text-primary-foreground font-semibold py-3 shadow-sm active:scale-[0.99] transition"
            >
              Adjust Plan
            </button>
          </div>
        )}
        <Footer />
      </div>
    </>
  );
}
