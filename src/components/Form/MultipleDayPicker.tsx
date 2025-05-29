import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { isBefore } from "date-fns";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { useHolidayForm, CompanyHoliday } from "@/context/FormContext";

interface MultipleDayPickerProps {
  showOutsideDays?: boolean;
  themeColor: string;
}

export default function MultipleDayPicker({
  showOutsideDays,
  themeColor,
}: MultipleDayPickerProps) {
  const [selectedMonth, setSelectedMonth] = useState<Date | undefined>();
  const [selectedDays, setSelectedDays] = useState<Date[]>([]);
  const { state, updateCompanyHolidays } = useHolidayForm();

  // Initialize selectedMonth when component mounts or when year changes and reset selectedDays
  useEffect(() => {
    const yearNum = Number(state.year);
    const currentYear = new Date().getFullYear();

    // If selected year is current year, start from current month
    // Otherwise start from January of selected year
    if (yearNum === currentYear) {
      setSelectedMonth(new Date());
    } else {
      setSelectedMonth(new Date(yearNum, 0, 1));
    }

    // Reset selected days when year changes
    setSelectedDays([]);

    // Reset company holidays in context when year changes
    updateCompanyHolidays([]);
  }, [state.year, updateCompanyHolidays]);

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
      name: "Company day " + (index + 1), // Empty name that a user can fill in later if they want to
      date: day,
    }));

    updateCompanyHolidays(companyHolidays);
  }

  useEffect(() => {
    setSelectedDays(
      state.companyHolidays.map((holiday) => new Date(holiday.date))
    );
  }, [state.companyHolidays]);

  // Updated date validation logic based on selected year
  const isDisabledDay = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedYearNum = Number(state.year);
    const currentYear = today.getFullYear();

    // Different logic based on which year we're viewing
    if (selectedYearNum === currentYear) {
      // For current year: disable past dates and dates outside selected year
      return isBefore(date, today) || date.getFullYear() !== selectedYearNum;
    } else if (selectedYearNum > currentYear) {
      // For future years: only disable dates outside the selected year
      return date.getFullYear() !== selectedYearNum;
    } else {
      // For past years: disable everything (or you could enable everything for historical view)
      return true; // Or return false if you want to allow selection in past years
    }
  };

  function goToPreviousMonth(event: React.MouseEvent) {
    event.preventDefault();
    if (!selectedMonth) return;

    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() - 1);

    // Ensure we don't go before January of selected year
    const firstMonthOfYear = new Date(Number(state.year), 0, 1);

    // For current year, don't go before current month
    if (Number(state.year) === new Date().getFullYear()) {
      const currentMonth = new Date();
      currentMonth.setDate(1); // First day of current month

      if (newDate >= currentMonth) {
        handleMonthChange(newDate);
      }
    } else if (newDate >= firstMonthOfYear) {
      // For other years, don't go before January
      handleMonthChange(newDate);
    }
  }

  function goToNextMonth(event: React.MouseEvent) {
    event.preventDefault();
    if (!selectedMonth) return;

    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() + 1);

    // Ensure we don't go past December of selected year
    const lastMonthOfYear = new Date(Number(state.year), 11, 31);

    if (newDate <= lastMonthOfYear) {
      handleMonthChange(newDate);
    }
  }

  // Don't render until selectedMonth is initialized
  if (!selectedMonth) return null;

  return (
    <div className="w-full mx-auto border rounded-md bg-background shadow-sm">
      <div className="flex items-center justify-between text-sm font-medium text-muted-foreground mb-2 pt-3 pl-5 pr-5">
        <button
          onClick={goToPreviousMonth}
          className="text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className={`text-${themeColor}`}>{`${
          // get full month name from selectedMonth
          selectedMonth.toLocaleString("default", {
            month: "long",
          })
        } ${state.year}`}</span>
        <button
          onClick={goToNextMonth}
          className="text-muted-foreground hover:text-foreground cursor-pointer"
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
          fromMonth={
            Number(state.year) === new Date().getFullYear()
              ? new Date() // From today if current year
              : new Date(Number(state.year), 0, 1) // From Jan 1st if not current year
          }
          toMonth={new Date(Number(state.year), 11, 31)} // Until Dec 31 of selected year
          selected={selectedDays}
          onDayClick={handleDayClick}
          weekStartsOn={1}
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
            cell: "flex items-center justify-center w-[14.28%] h-8 rounded-md",
            day: cn(
              buttonVariants({ variant: "ghost" }),
              `size-8 p-0 font-normal aria-selected:opacity-100 hover:bg-${themeColor}/10 cursor-pointer`
            ),
            day_selected: `bg-${themeColor}/70 text-primary-foreground hover:bg-${themeColor}/70 hover:text-primary-foreground focus:bg-${themeColor}/70 focus:text-primary-foreground aria-selected:text-primary-foreground`,
            day_today: `bg-${themeColor}/10 text-accent-foreground border-1 border-${themeColor}/50`,
            day_outside:
              "day-outside text-muted-foreground aria-selected:text-muted-foreground",
            day_disabled: "text-muted-foreground opacity-50",
            day_hidden: "invisible",
          }}
        />
      </div>
    </div>
  );
}
