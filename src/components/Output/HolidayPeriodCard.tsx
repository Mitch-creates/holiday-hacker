import { HolidayPeriod, DayOff } from "@/context/FormResultsContext";
import type { BreakKind, StrategyType } from "@/lib/holidayCalculations";

const BREAK_LABELS: Record<BreakKind, string> = {
  longWeekend: "Long weekend",
  midWeek: "Mid-week break",
  week: "Week-long break",
  extended: "Extended trip",
};

const STRATEGY_LABELS: Record<StrategyType, string> = {
  balanced: "Balanced mix",
  longWeekend: "Long weekend",
  midWeek: "Mid-week break",
  week: "Week-long break",
  extended: "Extended trip",
};

function periodBadgeLabel(period: HolidayPeriod): string {
  if (period.breakKind) return BREAK_LABELS[period.breakKind];
  return STRATEGY_LABELS[period.type] ?? period.type.replace(/_/g, " ");
}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MiniCalendarDay from "./MiniCalendarDay";
import { formatDateRange } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CalendarCheck as CalendarCheckIcon,
  Building2,
  Flag as FlagIcon,
  Clock,
} from "lucide-react";

interface HolidayPeriodCardProps {
  period: HolidayPeriod;
}

const HolidayPeriodCard: React.FC<HolidayPeriodCardProps> = ({ period }) => {
  const periodStartDate = new Date(period.startDate);
  const periodEndDate = new Date(period.endDate);
  const periodRoi =
    period.userHolidaysUsed > 0
      ? (period.totalDaysOff / period.userHolidaysUsed).toFixed(1)
      : period.totalDaysOff.toFixed(1);

  const calendarGridStartDate = new Date(periodStartDate);
  calendarGridStartDate.setDate(
    periodStartDate.getDate() - ((periodStartDate.getDay() + 6) % 7)
  );

  const calendarGridEndDate = new Date(periodEndDate);
  calendarGridEndDate.setDate(
    periodEndDate.getDate() + (6 - ((periodEndDate.getDay() + 6) % 7))
  );

  const daysForCalendarGrid: (
    | DayOff
    | { date: Date; type: "OUT_OF_PERIOD" }
  )[] = [];
  const iterDate = new Date(calendarGridStartDate);

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
          daysForCalendarGrid.push({
            date: new Date(iterDate),
            type: "WEEKEND",
          });
        } else {
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
    iterDate.setDate(iterDate.getDate() + 1);
  }
  daysForCalendarGrid.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const weekdayHeaders = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <Card className="surface-card-elevated w-full hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-md font-extrabold text-foreground">
              <h3 className="text-md font-extrabold text-foreground">
                {formatDateRange(period.startDate, period.endDate)}
              </h3>
            </CardTitle>
            {period.description && (
              <p className="text-xs text-muted-foreground">
                {period.description}
              </p>
            )}
          </div>
          <Badge
            variant="outline"
            className="px-1.5 py-0.5 text-xs capitalize bg-primary/10 text-primary border-primary/30"
          >
            {periodBadgeLabel(period)}
          </Badge>
        </div>
        <p className="text-xs font-medium text-primary mt-2">
          Trade-off: {period.userHolidaysUsed} day
          {period.userHolidaysUsed === 1 ? "" : "s"} used for {period.totalDaysOff}{" "}
          days off ({periodRoi}x return)
        </p>
      </CardHeader>
      <CardContent className="flex-grow">
        <TooltipProvider>
          <div className="flex flex-wrap justify-start items-center gap-x-4 gap-y-2 mb-3 text-xs text-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center cursor-default">
                  <CalendarCheckIcon className="w-4 h-4 mb-0.5 text-theme-2" />
                  <span className="font-medium text-theme-2">
                    {period.userHolidaysUsed}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Your Holidays Used</p>
              </TooltipContent>
            </Tooltip>

            {period.companyHolidaysUsed > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center cursor-default">
                    <Building2 className="w-4 h-4 mb-0.5 text-theme-8" />
                    <span className="font-medium text-theme-8">
                      {period.companyHolidaysUsed}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Company Holidays Used</p>
                </TooltipContent>
              </Tooltip>
            )}
            {period.publicHolidaysUsed > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center cursor-default">
                    <FlagIcon className="w-4 h-4 mb-0.5 text-theme-6" />
                    <span className="font-medium text-theme-6">
                      {period.publicHolidaysUsed}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Public Holidays Used</p>
                </TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center cursor-default">
                  <Clock className="w-4 h-4 mb-0.5 text-muted-foreground" />
                  <span className="font-medium text-muted-foreground">
                    {period.weekendDays}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Weekend Days Used</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>

        <div className="grid grid-cols-7 gap-1">
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
        <p className="mt-2 text-[11px] font-medium text-muted-foreground">
          Calendar legend: vacation/public/company/weekend days are color-coded.
        </p>
      </CardContent>
    </Card>
  );
};

export default HolidayPeriodCard;
