import { Control } from "react-hook-form";
import { HolidayFormValues } from "./HolidayForm";
import { useMemo } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";

interface SelectFormFieldProps {
  control: Control<HolidayFormValues>;
  formFieldName: "selectedCountry" | "selectedRegion";
  options: { value: string; label: string }[];
  placeholder?: string;
  widthClassName?: string;
  themeColor1?: string;
  themeColor2?: string;
  selectLabel?: string;
}

export default function SelectFormField({
  control,
  formFieldName,
  options,
  placeholder,
  selectLabel,
  widthClassName = "w-full",
  themeColor1 = "theme-5",
  themeColor2 = "theme-6",
}: SelectFormFieldProps) {
  const allOptions = useMemo(() => {
    return options.map((o) => ({ value: o.value, label: o.label }));
  }, [options]);
  return (
    <FormField
      control={control}
      name={formFieldName}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium text-muted-foreground ">
            {selectLabel}
          </FormLabel>
          <FormControl>
            <div className="relative w-full">
              <select
                {...field}
                className={`
                appearance-none w-full h-9 px-3 py-1.5
                rounded-md 
                border border-${themeColor2}
                text-${themeColor2} text-sm font-medium
                hover:bg-${themeColor1}/70
                hover:border-${themeColor1}
                focus:ring-1 focus:ring-${themeColor2}
                focus:outline-none
              `}
              >
                {placeholder && (
                  <option value="" disabled>
                    {placeholder}
                  </option>
                )}
                {allOptions.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              {/* custom ChevronDown icon */}
              <svg
                className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-${themeColor1}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
