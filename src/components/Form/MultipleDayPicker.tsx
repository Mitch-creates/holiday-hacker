import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { useHolidayForm, CompanyHoliday } from "@/context/FormContext";
import { isBefore } from "date-fns";

const year = "2025";

// TODO Add logic when a user still manages to select a day in the past or next year

interface MultipleDayPickerProps {
  showOutsideDays?: boolean;
  themeColor: string;
}

export default function MultipleDayPicker({
  showOutsideDays,
  themeColor,
}: MultipleDayPickerProps) {
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

  function goToPreviousMonth(event: React.MouseEvent) {
    event.preventDefault();
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() - 1);

    // Check if the entire month would be in the past
    const currentMonth = new Date();
    currentMonth.setDate(1); // First day of current month

    if (
      newDate.getFullYear() > currentMonth.getFullYear() ||
      (newDate.getFullYear() === currentMonth.getFullYear() &&
        newDate.getMonth() >= currentMonth.getMonth())
    ) {
      handleMonthChange(newDate);
    }
  }

  function goToNextMonth(event: React.MouseEvent) {
    event.preventDefault();
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() + 1);

    // Check if the month would be in the next year
    const nextYearStart = new Date(new Date().getFullYear() + 1, 0, 1);

    if (newDate < nextYearStart) {
      handleMonthChange(newDate);
    }
  }

  return (
    <div className="w-full mx-auto border rounded-md bg-background shadow-sm">
      <div className="flex items-center justify-between text-sm font-medium text-muted-foreground mb-2 pt-3 pl-5 pr-5">
        <button
          onClick={goToPreviousMonth}
          className="text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className={`text-${themeColor}`}>{`${
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
          mode="multiple"
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
            head_cell: `text-${themeColor} w-[14.28%] font-normal text-[0.8rem] border-b border-${themeColor}/50 pb-1 uppercase`,
            row: "flex w-full mt-2",
            cell: "flex items-center justify-center w-[14.28%] h-8 rounded-md cursor-pointer",
            day: cn(
              buttonVariants({ variant: "ghost" }),
              `size-8 p-0 font-normal aria-selected:opacity-100 hover:bg-${themeColor}/10`
            ),
            day_selected: `bg-${themeColor}/70 text-primary-foreground hover:bg-${themeColor}/70 hover:text-primary-foreground focus:bg-${themeColor}/70 focus:text-primary-foreground`,
            day_today: `bg-${themeColor}/10 text-accent-foreground`,
            day_outside:
              "day-outside text-muted-foreground aria-selected:text-muted-foreground",
            day_disabled: "text-muted-foreground opacity-50",
            day_hidden: "invisible",
          }}
        ></DayPicker>
      </div>
    </div>
  );
}
