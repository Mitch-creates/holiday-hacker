import { useFormResults } from "@/context/FormResultsContext";
import { useEffect, useRef, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  CalendarDays,
  Info,
  CheckCircle,
  XCircle,
  Loader2,
  Building2,
  ListChecks,
  CheckCircle2,
  Flag as FlagIcon,
  CalendarCheck as CalendarCheckIcon,
  ChartColumn,
  Sparkles, // Added for title icon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import HolidayPeriodCard from "./HolidayPeriodCard";
import SummaryItem from "./SummaryItem";
import ShareSection from "./ShareSection";

export const OutputContainer: React.FC = () => {
  const { state } = useFormResults();
  const { status, calculatedPeriods, formInputState, error } = state;
  const mobileCarouselRef = useRef<HTMLDivElement>(null);
  const [activeMobileCardIndex, setActiveMobileCardIndex] = useState(0);

  useEffect(() => {
    setActiveMobileCardIndex(0);
  }, [calculatedPeriods.length]);

  // Initial loading state
  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center mt-10">
        <Loader2 className="h-12 w-12 animate-spin text-theme-5" />
        <p className="mt-4 text-lg text-foreground font-semibold">
          Calculating your optimal holidays...
        </p>
      </div>
    );
  }

  // Idle state
  if (status === "idle") {
    return (
      <Alert variant="default" className="mt-6">
        <Info className="h-4 w-4" />
        <AlertTitle>No Results Yet</AlertTitle>
        <AlertDescription>
          Fill out the form and click "Generate Holidays" to see your optimized
          holiday plan.
        </AlertDescription>
      </Alert>
    );
  }

  // Error state
  if (status === "error") {
    return (
      <Alert variant="destructive" className="mt-6">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Error Generating Results</AlertTitle>
        <AlertDescription>
          {error || "An unexpected error occurred. Please try again."}
        </AlertDescription>
      </Alert>
    );
  }

  // Success state with no results
  if (
    status === "success" &&
    calculatedPeriods.length === 0 &&
    !formInputState
  ) {
    return (
      <Alert variant="default" className="mt-6">
        <CheckCircle className="h-4 w-4" />
        <AlertTitle>No Holiday Periods Generated</AlertTitle>
        <AlertDescription>
          Based on your inputs, no specific holiday periods could be generated.
          You might want to adjust your strategy or available holidays.
        </AlertDescription>
      </Alert>
    );
  }

  // This block now handles success display
  if (status === "success" && calculatedPeriods.length > 0 && formInputState) {
    const totalUserHolidaysUsed = calculatedPeriods.reduce(
      (sum, p) => sum + p.userHolidaysUsed,
      0
    );
    const totalCompanyHolidaysUsed = calculatedPeriods.reduce(
      (sum, p) => sum + p.companyHolidaysUsed,
      0
    );
    const totalPublicHolidaysUsed = calculatedPeriods.reduce(
      (sum, p) => sum + p.publicHolidaysUsed,
      0
    );
    const totalDaysOff = calculatedPeriods.reduce(
      (sum, p) => sum + p.totalDaysOff,
      0
    );
    const overallRoi =
      totalUserHolidaysUsed > 0
        ? (totalDaysOff / totalUserHolidaysUsed).toFixed(1)
        : totalDaysOff.toFixed(1);

    const displayStrategy =
      formInputState?.strategy ||
      calculatedPeriods[0]?.type.replace("_", " ") ||
      "N/A";

    return (
      <div className="mt-2 lg:mt-6 space-y-6">
        <div className="space-y-2 px-6">
          <div className="flex items-center">
            {/* Make sparkles a bit bigger for mobile */}
            <Sparkles className="w-10 h-10 md:w-8 md:h-8 mr-2 text-theme-5" />
            <h1 className="text-2xl md:text-3xl font-black text-foreground">
              Your <span className="text-theme-5">Optimized</span> Holiday Plan
            </h1>
          </div>
          <p className="text-sm md:text-md text-muted-foreground font-medium">
            Your optimized holiday periods are ready. You are getting{" "}
            <span className="font-semibold text-theme-5">{overallRoi} days off</span>{" "}
            per vacation day used.
          </p>
        </div>
        <Card className="border-[3px] border-foreground shadow-[5px_5px_0_0_rgba(0,0,0,0.7)] bg-card">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-foreground flex items-center">
              <ChartColumn className="w-6 h-6 mr-2 text-theme-9/70" />
              <h2 className="text-theme-9/70 text-xl font-bold">
                Optimization Statistics
              </h2>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 text-center">
            <SummaryItem
              label="Total Days Off"
              value={totalDaysOff}
              icon={CheckCircle2}
              valueClassName="theme-9"
              tooltip="The total number of consecutive days you'll be off work, including weekends and all types of holidays."
            />
            <SummaryItem
              label="Public Holidays Used"
              value={totalPublicHolidaysUsed}
              icon={FlagIcon}
              valueClassName="theme-6"
              tooltip="The number of official public holidays that fall within your optimized holiday periods."
            />
            <SummaryItem
              label="Company Holidays Used"
              value={totalCompanyHolidaysUsed}
              icon={Building2}
              valueClassName="theme-8"
              tooltip="The number of company-specific holidays that fall within your optimized holiday periods."
            />
            <SummaryItem
              label="User Holidays Used"
              value={totalUserHolidaysUsed}
              icon={CalendarCheckIcon}
              valueClassName="theme-2"
              tooltip="The number of your personal annual leave days used to create these holiday periods."
            />
            <SummaryItem
              label="Days Per Day Used"
              value={`${overallRoi}x`}
              icon={ChartColumn}
              valueClassName="theme-5"
              tooltip="Your return on vacation days: total days off divided by user holidays used."
            />
            <SummaryItem
              label="Year"
              value={formInputState.year}
              icon={CalendarDays}
              valueClassName="theme-11"
              tooltip="The calendar year for which these holiday optimizations have been calculated."
            />
            <SummaryItem
              label="Strategy"
              value={displayStrategy}
              icon={ListChecks}
              className="capitalize"
              valueClassName="theme-4"
              tooltip="The optimization strategy you selected for generating your holiday periods."
            />
          </CardContent>
        </Card>
        <div className="mt-2 flex items-center justify-between md:hidden">
          <p className="text-xs font-semibold text-muted-foreground">
            Swipe to browse trip options
          </p>
          <p className="text-xs font-semibold text-theme-5">
            {calculatedPeriods.length} options
          </p>
        </div>
        <div
          ref={mobileCarouselRef}
          onScroll={() => {
            const el = mobileCarouselRef.current;
            if (!el) return;
            const cardWidth = el.clientWidth * 0.92 + 12;
            if (cardWidth <= 0) return;
            const index = Math.round(el.scrollLeft / cardWidth);
            const boundedIndex = Math.max(
              0,
              Math.min(calculatedPeriods.length - 1, index)
            );
            setActiveMobileCardIndex(boundedIndex);
          }}
          className="md:hidden -mx-2 px-2 flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2"
        >
          {calculatedPeriods.map((period, index) => (
            <div
              key={index}
              className="snap-center shrink-0 w-[92%] max-w-[420px]"
            >
              <HolidayPeriodCard period={period} />
            </div>
          ))}
        </div>
        <div className="md:hidden flex items-center justify-center gap-1.5">
          {calculatedPeriods.map((_, index) => (
            <span
              key={`dot-${index}`}
              className={`h-2 rounded-full transition-all ${
                activeMobileCardIndex === index
                  ? "w-5 bg-theme-5"
                  : "w-2 bg-muted-foreground/40"
              }`}
            />
          ))}
        </div>
        <div className="hidden md:grid grid-cols-2 gap-4 mt-6">
          {calculatedPeriods.map((period, index) => (
            <HolidayPeriodCard key={index} period={period} />
          ))}
        </div>
        <ShareSection />
      </div>
    );
  }

  return null; // Should not be reached
};

export default OutputContainer;
