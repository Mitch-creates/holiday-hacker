import React from "react";
import { Control } from "react-hook-form";
import { HolidayFormValues } from "./HolidayForm";
import { useMemo } from "react";
import { FormControl, FormField, FormItem, FormMessage } from "../ui/form";

interface SelectFormFieldProps {
  control: Control<HolidayFormValues>;
  formFieldName: "selectedCountry" | "selectedRegion";
  options: { value: string; label: string }[];
  placeholder?: string;
  widthClassName?: string;
  themeColor1?: string;
  themeColor2?: string;
}

export default function SelectFormField({
  control,
  formFieldName,
  options,
  placeholder = "Select…",
  widthClassName = "w-full",
  themeColor1 = "theme-1",
  themeColor2 = "theme-2",
}: SelectFormFieldProps) {
  const allOptions = useMemo(() => {
    return options.map((o) => ({ value: o.value, label: o.label }));
  }, [options]);
  return (
    <FormField
      control={control}
      name={formFieldName}
      render={({ field }) => (
        <FormItem className="space-y-1">
          <FormControl>
            <div className="relative w-full">
              <select
                {...field}
                className={`
                appearance-none w-full h-9 px-3 py-1.5
                rounded-md transition-all duration-200
                bg-amber-50/50 dark:bg-amber-900/20
                border border-amber-200 dark:border-amber-800
                text-amber-900 dark:text-amber-100 text-sm font-medium
                hover:bg-amber-100 dark:hover:bg-amber-800/40
                hover:border-amber-300 dark:hover:border-amber-700
                focus:ring-1 focus:ring-amber-400 dark:focus:ring-amber-300
                focus:ring-offset-1 focus:outline-none
              `}
              >
                <option value="" disabled>
                  {placeholder}
                </option>
                {allOptions.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              {/* custom ChevronDown icon */}
              <svg
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500 dark:text-amber-300"
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
