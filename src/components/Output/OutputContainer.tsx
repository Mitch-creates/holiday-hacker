import { useFormResults } from "@/context/FormResultsContext";
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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import HolidayPeriodCard from "./HolidayPeriodCard";
import SummaryItem from "./SummaryItem";

export const OutputContainer: React.FC = () => {
  const { state } = useFormResults();
  const { status, calculatedPeriods, formInputState, error } = state;

  // Initial loading state
  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center mt-10">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="mt-4 text-lg text-gray-700">
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

    const displayStrategy =
      formInputState?.strategy ||
      calculatedPeriods[0]?.type.replace("_", " ") ||
      "N/A";

    // Removed containerClassName logic related to blur

    return (
      // Removed relative positioning and loader overlay
      <div className="mt-6">
        {" "}
        {/* Added margin-top for spacing */}
        <Card className="shadow-sm border">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-700 flex items-center">
              <ChartColumn className="w-6 h-6 mr-2 text-theme-9/70" />
              <span className="text-theme-9/70">Calculation Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
            <SummaryItem
              label="Total Days Off"
              value={totalDaysOff}
              icon={CheckCircle2}
              valueClassName="theme-9"
            />
            <SummaryItem
              label="Public Holidays Used"
              value={totalPublicHolidaysUsed}
              icon={FlagIcon}
              valueClassName="theme-6"
            />
            <SummaryItem
              label="Company Holidays Used"
              value={totalCompanyHolidaysUsed}
              icon={Building2}
              valueClassName="theme-8"
            />
            <SummaryItem
              label="User Holidays Used"
              value={totalUserHolidaysUsed}
              icon={CalendarCheckIcon}
              valueClassName="theme-2"
            />
            <SummaryItem
              label="Year"
              value={formInputState.year}
              icon={CalendarDays}
              valueClassName="theme-11"
            />
            <SummaryItem
              label="Strategy"
              value={displayStrategy}
              icon={ListChecks}
              className="capitalize"
              valueClassName="theme-4"
            />
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {calculatedPeriods.map((period, index) => (
            <HolidayPeriodCard key={index} period={period} />
          ))}
        </div>
      </div>
    );
  }

  return null; // Should not be reached
};

export default OutputContainer;
