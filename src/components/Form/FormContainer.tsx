import { useHolidayForm } from "@/context/FormContext";
import { ReactNode } from "react";

interface FormContainerProps {
  title: string;
  children: ReactNode;
}
// My year is not yet part of my form, have to fix that
export default function FormContainer({ children, title }: FormContainerProps) {
  //Have an array with the current year, next year and the one after that
  const currentYear = new Date().getFullYear();
  const options = [currentYear, currentYear + 1, currentYear + 2];
  const { updateYear } = useHolidayForm();
  return (
    <div className="border p-2.5 rounded-2xl shadow-sm bg-white space-y-2">
      <div className="flex p items-center justify-between">
        <div className="flex items-center text-2xl font-semibold text-black pl-4">
          {title}
        </div>
        <select
          className="border rounded-md p-1 text-sm font-normal text-muted-foreground"
          onChange={(e) => {
            const selectedYear = e.target.value;
            updateYear(selectedYear);
          }}
        >
          {options.map((year) => {
            return (
              <option key={year} value={year}>
                {year}
              </option>
            );
          })}
        </select>
      </div>
      <div className="text-sm font-normal text-muted-foreground mb-4 pl-4">
        Please fill out the form below to get an optimized holiday output.
      </div>

      {children}
    </div>
  );
}
