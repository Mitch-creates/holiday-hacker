import { HolidayPeriod } from "@/context/FormResultsContext";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { DayPicker, DateRange } from "react-day-picker";

interface OutputCalendarViewProps {
  periods: HolidayPeriod[];
  year: string;
}

export default function OutputCalendarView({
  periods,
  year,
}: OutputCalendarViewProps) {
  const yearNum = Number(year);
  const [month, setMonth] = useState<Date>(new Date(yearNum, 0, 1));

  const ranges = useMemo<DateRange[]>(
    () =>
      periods.map((period) => ({
        from: new Date(period.startDate),
        to: new Date(period.endDate),
      })),
    [periods]
  );

  const previousMonth = () => {
    setMonth((prev) => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() - 1);
      return next < new Date(yearNum, 0, 1) ? prev : next;
    });
  };

  const nextMonth = () => {
    setMonth((prev) => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() + 1);
      return next > new Date(yearNum, 11, 1) ? prev : next;
    });
  };

  return (
    <div className="rounded-2xl border-[3px] border-foreground bg-card p-4 shadow-[5px_5px_0_0_rgba(0,0,0,0.7)]">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={previousMonth}
          className="border-2 border-foreground rounded-lg p-1 bg-background active:scale-[0.98]"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <p className="font-bold text-theme-5">
          {month.toLocaleString("default", { month: "long", year: "numeric" })}
        </p>
        <button
          type="button"
          onClick={nextMonth}
          className="border-2 border-foreground rounded-lg p-1 bg-background active:scale-[0.98]"
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <DayPicker
        month={month}
        onMonthChange={setMonth}
        fromMonth={new Date(yearNum, 0, 1)}
        toMonth={new Date(yearNum, 11, 31)}
        weekStartsOn={1}
        modifiers={{ suggestedRange: ranges }}
        className="text-sm"
        classNames={{
          month: "w-full",
          caption: "hidden",
          head_cell: "text-muted-foreground font-semibold text-xs",
          day: "h-9 w-9 rounded-md text-sm",
          day_today: "border-2 border-theme-5",
          day_outside: "text-muted-foreground/40",
        }}
        modifiersClassNames={{
          suggestedRange: "bg-theme-5/30 text-foreground font-semibold",
        }}
      />

      <p className="text-xs text-muted-foreground mt-2">
        Colored dates indicate recommended holiday periods.
      </p>
    </div>
  );
}
