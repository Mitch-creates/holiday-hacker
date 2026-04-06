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
    <div className="surface-card-elevated p-4">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={previousMonth}
          className="border border-border rounded-lg p-1 bg-background active:scale-[0.99]"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <p className="font-bold text-primary">
          {month.toLocaleString("default", { month: "long", year: "numeric" })}
        </p>
        <button
          type="button"
          onClick={nextMonth}
          className="border border-border rounded-lg p-1 bg-background active:scale-[0.99]"
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
          day_today: "border border-primary",
          day_outside: "text-muted-foreground/40",
        }}
        modifiersClassNames={{
          suggestedRange: "bg-primary/20 text-foreground font-semibold",
        }}
      />

      <p className="text-xs text-muted-foreground mt-2">
        Colored dates indicate recommended holiday periods.
      </p>
    </div>
  );
}
