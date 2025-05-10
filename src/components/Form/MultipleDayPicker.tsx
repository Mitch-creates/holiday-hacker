import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { useHolidayForm, CompanyHoliday } from "@/context/FormContext";
import { isBefore } from "date-fns";

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const year = "2025";

interface MonthProps {
  showMonthNav: boolean;
  showOutsideDays?: boolean;
}

export default function MultipleDayPicker({
  showMonthNav,
  showOutsideDays,
}: MonthProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedDays, setSelectedDays] = useState<Date[]>([]);
  const { state, updateCompanyHolidays } = useHolidayForm();
  function handleMonthChange(month: Date) {
    setSelectedMonth(month);
  }

  // Adds or removes a day from the selected days array and updates the context
  function handleDayClick(day: Date) {
    let updatedDays: Date[];
    if (selectedDays.some((d) => d.getTime() === day.getTime())) {
      updatedDays = selectedDays.filter((d) => d.getTime() !== day.getTime());
    } else {
      updatedDays = [...selectedDays, day];
    }
    setSelectedDays(updatedDays);
    console.log("Selected days", updatedDays);
    const companyHolidays: CompanyHoliday[] = updatedDays.map((day, index) => ({
      name: "Company day" + index + 1, // Empty name that a user can fill in later if they want to
      date: day,
    }));
    console.log("trigger first update of company holidays", companyHolidays);
    updateCompanyHolidays(companyHolidays);
  }

  useEffect(() => {
    console.log("Company Holidays", state.companyHolidays);
    setSelectedDays(
      state.companyHolidays.map((holiday) => new Date(holiday.date))
    );
  }, [state.companyHolidays]);

  const isDateInThePast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of day for accurate comparison
    return isBefore(date, today);
  };

  const isDateFromNextYear = (date: Date) => {
    return date.getFullYear() > new Date().getFullYear();
  };

  const isDisabledDay = (date: Date) => {
    return isDateInThePast(date) || isDateFromNextYear(date);
  };

  const isDisabledMonth = (month: string) => {
    // Check if the month is in the past or next year
    const monthIndex = months.indexOf(month);
    const monthDate = new Date(selectedMonth.getFullYear(), monthIndex, 1);
    return isDateInThePast(monthDate) || isDateFromNextYear(monthDate);
  };

  function goToPreviousMonth(event: React.MouseEvent) {
    event.preventDefault();
    const newDate = new Date(selectedMonth);
    if (!isDateInThePast(newDate)) {
      newDate.setMonth(newDate.getMonth() - 1);
      handleMonthChange(newDate);
    }
  }

  function goToNextMonth(event: React.MouseEvent) {
    event.preventDefault();
    const newDate = new Date(selectedMonth);
    if (!isDateFromNextYear(newDate)) {
      newDate.setMonth(newDate.getMonth() + 1);
      handleMonthChange(newDate);
    }
  }

  return (
    <div className="w-full mx-auto">
      {showMonthNav && (
        <div className="grid grid-cols-6 gap-1 mb-4 w-full">
          {months.map((monthName, index) => {
            const isActive = selectedMonth.getMonth() === index;
            return (
              <button
                key={monthName}
                onClick={(e) => {
                  e.preventDefault();
                  if (isDisabledMonth(monthName)) return;
                  const newDate = new Date(selectedMonth);
                  newDate.setMonth(index);
                  handleMonthChange(newDate);
                }}
                className={cn(
                  "text-sm py-1 px-2 rounded-md",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary hover:bg-secondary/80"
                )}
              >
                {monthName}
              </button>
            );
          })}
        </div>
      )}
      <div className="flex items-center justify-between text-sm font-medium text-muted-foreground mb-2">
        <button
          onClick={goToPreviousMonth}
          className="text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="font-medium">{`${
          // get full month name from selectedMonth
          selectedMonth.toLocaleString("default", {
            month: "long",
          })
        } ${year}`}</span>
        <button
          onClick={goToNextMonth}
          className="text-muted-foreground hover:text-foreground"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="relative w-full">
        <DayPicker
          month={selectedMonth}
          onMonthChange={handleMonthChange}
          showOutsideDays={showOutsideDays}
          disabled={isDisabledDay}
          className="w-full p-3"
          fromMonth={new Date()} // From today until end of year
          toMonth={new Date(new Date().getFullYear(), 11, 31)}
          selected={selectedDays}
          onDayClick={handleDayClick}
          classNames={{
            months:
              "flex flex-col sm:flex-row gap-2 text-mute-foreground text-sm",
            month: "flex flex-col gap-2 w-full",
            caption: "hidden",
            table: "w-full border-collapse",
            nav: "hidden",
            head_row: "flex w-full",
            head_cell:
              "text-muted-foreground rounded-md w-[14.28%] font-normal text-[0.8rem]",
            row: "flex w-full mt-2",
            cell: "flex items-center justify-center w-[14.28%] h-8 rounded-md",
            day: cn(
              buttonVariants({ variant: "ghost" }),
              "size-8 p-0 font-normal aria-selected:opacity-100 pointer-events-auto"
            ),
            day_range_start:
              "day-range-start aria-selected:bg-primary aria-selected:text-primary-foreground",
            day_range_end:
              "day-range-end aria-selected:bg-primary aria-selected:text-primary-foreground",
            day_selected:
              "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
            day_today: "bg-accent text-accent-foreground",
            day_outside:
              "day-outside text-muted-foreground aria-selected:text-muted-foreground",
            day_disabled: "text-muted-foreground opacity-50",
            day_range_middle:
              "aria-selected:bg-accent aria-selected:text-accent-foreground",
            day_hidden: "invisible",
          }}
        ></DayPicker>
      </div>
    </div>
  );
}
