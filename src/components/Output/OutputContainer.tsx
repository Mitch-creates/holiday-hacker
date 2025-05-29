import { useFormResults } from "@/context/FormResultsContext";
import { HolidayPeriod, DayOff } from "@/context/FormResultsContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  CalendarDays,
  Info,
  CheckCircle, // Keep for "No Holiday Periods Generated"
  XCircle,
  Loader2,
  // Building2, // Replaced by Building
  Star,
  Clock,
  Building2, // Added for Company Holidays
  CalendarPlus, // Added for User Holidays (PTO)
  ListChecks, // Added for Strategy
  CheckCircle2,
  Flag,
  CalendarCheck, // Added for Summary Title Icon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Helper to format date ranges
const formatDateRange = (startDate: Date, endDate: Date) => {
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };
  return `${new Date(startDate).toLocaleDateString(
    undefined,
    options
  )} - ${new Date(endDate).toLocaleDateString(undefined, options)}`;
};

// Helper to get day type styling
const getDayTypeStyle = (
  dayType: DayOff["type"] | "OUT_OF_PERIOD" | "WEEKDAY_HEADER"
) => {
  switch (dayType) {
    case "USER_HOLIDAY":
      return { bg: "bg-theme-2/70", text: "text-white", label: "User Holiday" };
    case "PUBLIC_HOLIDAY":
      return {
        bg: "bg-theme-6/70",
        text: "text-white",
        label: "Public Holiday",
      };
    case "COMPANY_HOLIDAY":
      return {
        bg: "bg-theme-8/70",
        text: "text-white",
        label: "Company Holiday",
      };
    case "WEEKEND":
      return { bg: "bg-gray-300", text: "text-gray-700", label: "Weekend" };
    case "OUT_OF_PERIOD":
      return {
        bg: "bg-gray-100",
        text: "text-gray-400",
        label: "Not in period",
      };
    case "WEEKDAY_HEADER":
      return { bg: "bg-transparent", text: "text-gray-500", label: "Weekday" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-500", label: "" };
  }
};

interface MiniCalendarDayProps {
  day:
    | DayOff
    | { date: Date; type: "OUT_OF_PERIOD" | "WEEKDAY_HEADER"; name?: string };
  isHeader?: boolean;
}

const MiniCalendarDay: React.FC<MiniCalendarDayProps> = ({ day, isHeader }) => {
  const style = getDayTypeStyle(day.type);
  const date = new Date(day.date);
  const isOutOfPeriod = day.type === "OUT_OF_PERIOD";
  const isActiveDay = !isOutOfPeriod && !isHeader;

  if (isHeader) {
    return (
      <div
        className={`flex items-center justify-center p-0.5 text-xs font-medium ${style.text}`}
      >
        {/* Ensure day.name is accessed only if it exists on the specific type */}
        {day.type === "WEEKDAY_HEADER" ? day.name : ""}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center p-0.5 border rounded-sm aspect-square ${
        style.bg
      } ${style.text} transition-all duration-150 ease-in-out text-xs ${
        isActiveDay ? "hover:shadow-md cursor-pointer" : "opacity-50"
      } ${isOutOfPeriod ? "pointer-events-none" : ""}`}
      title={
        isActiveDay
          ? `${style.label}${
              (day.type === "PUBLIC_HOLIDAY" ||
                day.type === "COMPANY_HOLIDAY") &&
              day.name
                ? ": " + day.name
                : ""
            } - ${date.toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}`
          : undefined
      }
    >
      <span className="font-medium">{date.getDate()}</span>
    </div>
  );
};

interface HolidayPeriodCardProps {
  period: HolidayPeriod;
}

const HolidayPeriodCard: React.FC<HolidayPeriodCardProps> = ({ period }) => {
  const periodStartDate = new Date(period.startDate);
  const periodEndDate = new Date(period.endDate);

  // Calculate the actual start and end dates for the calendar grid (full weeks)
  const calendarGridStartDate = new Date(periodStartDate);
  calendarGridStartDate.setDate(
    periodStartDate.getDate() - ((periodStartDate.getDay() + 6) % 7)
  ); // Set to Monday

  const calendarGridEndDate = new Date(periodEndDate);
  calendarGridEndDate.setDate(
    periodEndDate.getDate() + (6 - ((periodEndDate.getDay() + 6) % 7))
  ); // Set to Sunday

  const daysForCalendarGrid: (
    | DayOff
    | { date: Date; type: "OUT_OF_PERIOD" }
  )[] = [];
  const iterDate = new Date(calendarGridStartDate); // Changed from currentDate to iterDate and use const if not reassigned, but it is in loop

  while (iterDate <= calendarGridEndDate) {
    const dateStr = iterDate.toDateString();
    const isWithinPeriod =
      iterDate >= periodStartDate && iterDate <= periodEndDate;

    if (isWithinPeriod) {
      const foundHoliday = period.holidays.find(
        (h) => new Date(h.date).toDateString() === dateStr
      );
      if (foundHoliday) {
        daysForCalendarGrid.push(foundHoliday);
      } else {
        const dayOfWeek = iterDate.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          // Sunday or Saturday
          daysForCalendarGrid.push({
            date: new Date(iterDate),
            type: "WEEKEND",
          });
        } else {
          // Fallback for days within the period but not explicitly a holiday (e.g., user-taken days not part of a strategy but filling gaps)
          // Or, if it's a normal working day that's part of a block taken off by the user.
          // For now, we assume these are implicitly USER_HOLIDAY if they are part of the period.
          // The `name` property is not standard on USER_HOLIDAY, so it's removed here.
          daysForCalendarGrid.push({
            date: new Date(iterDate),
            type: "USER_HOLIDAY",
          });
        }
      }
    } else {
      daysForCalendarGrid.push({
        date: new Date(iterDate),
        type: "OUT_OF_PERIOD",
      });
    }
    iterDate.setDate(iterDate.getDate() + 1); // iterDate is reassigned here
  }
  daysForCalendarGrid.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const weekdayHeaders = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <Card className="w-full shadow-sm hover:shadow-md transition-shadow duration-200 border flex flex-col">
      <CardHeader className="p-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-md font-semibold text-gray-700">
              {formatDateRange(period.startDate, period.endDate)}
            </CardTitle>
            {period.description && (
              <p className="text-xs text-muted-foreground">
                {period.description}
              </p>
            )}
          </div>
          <Badge
            variant="outline"
            className={`px-1.5 py-0.5 text-xs capitalize bg-theme-4/20 text-theme-4 border-theme-4/50`}
          >
            {period.type.replace("_", " ")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-3 flex-grow">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 text-xs text-center">
          <div className="flex flex-col items-center">
            <CalendarCheck className="w-4 h-4 mb-1.5 text-theme-2" />
            <span className={`font-medium text-theme-2`}>
              {period.userHolidaysUsed}
            </span>
          </div>
          {period.companyHolidaysUsed > 0 && (
            <div className="flex flex-col items-center">
              <Building2 className="w-4 h-4 mb-1.5 text-theme-8" />
              <span className={`font-medium text-theme-8`}>
                {period.companyHolidaysUsed}
              </span>
            </div>
          )}
          {period.publicHolidaysUsed > 0 && (
            <div className="flex flex-col items-center">
              <Flag className="w-4 h-4 mb-1.5 text-theme-6" />
              <span className={`font-medium text-theme-6`}>
                {period.publicHolidaysUsed}
              </span>
            </div>
          )}
          <div className="flex flex-col items-center">
            <Clock className="w-4 h-4 mb-1.5 text-gray-600" />
            <span className="font-medium text-gray-600">
              {period.weekendDays}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-0.5">
          {weekdayHeaders.map((header) => (
            <MiniCalendarDay
              key={header}
              day={{ date: new Date(), type: "WEEKDAY_HEADER", name: header }}
              isHeader
            />
          ))}
          {daysForCalendarGrid.map((day) => (
            <MiniCalendarDay key={new Date(day.date).toISOString()} day={day} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

interface SummaryItemProps {
  label: string;
  value: string | number;
  icon?: React.ElementType;
  className?: string;
  valueClassName?: string; // Added for custom styling of the value
}
const SummaryItem: React.FC<SummaryItemProps> = ({
  label,
  value,
  icon: Icon,
  className,
  valueClassName, // Added
}) => (
  <div
    className={`flex flex-col items-center justify-center p-3 ${
      valueClassName ? `bg${valueClassName.substring(4)}/20` : ""
    } rounded-lg shadow ${className || ""}`}
  >
    {Icon && <Icon className={`w-5 h-5 mb-1 ${valueClassName}`} />}
    <span className="text-xs text-slate-500">{label}</span>
    <span
      className={`text-md font-semibold text-slate-700 ${valueClassName || ""}`}
    >
      {value}
    </span>
  </div>
);

export const OutputContainer: React.FC = () => {
  const { state } = useFormResults();
  // Removed isCalculated as it was not used, status flags are sufficient
  const { status, calculatedPeriods, formInputState, error } = state; // Added isCalculated

  // if (!isCalculated && status !== "loading" && status !== "idle") {
  //   // This case might indicate that results were cleared or form was updated but not yet submitted for new calculation
  //   // Or, if you want to always show idle message until first successful calculation:
  //   return (
  //     <Alert variant=\"default\" className=\"mt-6\">
  //       <Info className=\"h-4 w-4\" />
  //       <AlertTitle>No Results Calculated</AlertTitle>
  //       <AlertDescription>
  //         Please generate holiday results using the form.
  //       </AlertDescription>
  //     </Alert>
  //   );
  // }

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

  if (status === "success" && calculatedPeriods.length === 0) {
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

    // Determine the main strategy from the first period, or use form input if available
    // This assumes all periods in a calculation share the same overarching strategy type from the form.
    const displayStrategy =
      formInputState?.strategy ||
      calculatedPeriods[0]?.type.replace("_", " ") ||
      "N/A";

    return (
      <>
        <Card className="shadow-sm border">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-700 flex items-center">
              {" "}
              {/* Added flex and items-center */}
              <CheckCircle2 className="w-6 h-6 mr-2 text-theme-4" />{" "}
              {/* Theme-4 for Summary title icon */}
              Holiday Plan Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
            <SummaryItem
              label="Total Days Off"
              value={totalDaysOff}
              icon={CheckCircle2}
            />
            <SummaryItem
              label="Public Holidays Used"
              value={totalPublicHolidaysUsed}
              icon={Flag}
              valueClassName="text-theme-6"
            />
            <SummaryItem
              label="Company Holidays Used"
              value={totalCompanyHolidaysUsed}
              icon={Building2}
              valueClassName="text-theme-8"
            />
            <SummaryItem
              label="User Holidays Used"
              value={totalUserHolidaysUsed}
              icon={CalendarPlus}
              valueClassName="text-theme-2"
            />
            <SummaryItem
              label="Year"
              value={formInputState.year}
              icon={CalendarDays}
            />
            <SummaryItem
              label="Strategy"
              value={displayStrategy}
              icon={ListChecks}
              className="capitalize"
              valueClassName="text-theme-4"
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {calculatedPeriods.map((period, index) => (
            <HolidayPeriodCard key={index} period={period} />
          ))}
        </div>
      </>
    );
  }

  return null; // Should not be reached
};

export default OutputContainer;
