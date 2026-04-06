import { Input } from "../ui/input";
import { FormControl, FormField, FormItem, FormMessage } from "../ui/form";
import { Control } from "react-hook-form";
import { HolidayFormValues } from "./HolidayForm";

interface InputNumberFormFieldProps {
  control: Control<HolidayFormValues>;
  formFieldName: "userHolidays";
  placeholder: string;
  themeColor: string;
  min?: number;
  max?: number;
  onValueChange?: (value: string) => void;
}

export default function InputNumberFormField({
  control,
  formFieldName,
  placeholder,
  themeColor,
  min = 1,
  max = 365,
  onValueChange,
}: InputNumberFormFieldProps) {
  return (
    <FormField
      control={control}
      name={formFieldName}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <Input
              className={`w-45 focus:outline-none focus-visible:!border-${themeColor} focus:!ring-${themeColor}  border-${themeColor}`}
              onWheel={(e) =>
                e.target instanceof HTMLElement && e.target.blur()
              }
              placeholder={placeholder}
              {...field}
              inputMode="numeric"
              onChange={(e) => {
                const value = e.target.value;

                // Only allow digits or empty string
                if (value === "" || /^\d+$/.test(value)) {
                  let nextValue = value;
                  if (value !== "") {
                    const numValue = parseInt(value, 10);
                    if (numValue > max) nextValue = max.toString();
                    else if (numValue < min) nextValue = min.toString();
                  }
                  field.onChange(nextValue);
                  if (onValueChange) onValueChange(nextValue);
                }
                // Ignore input if not a digit
              }}
              onBlur={(e) => {
                // On blur, if empty or below min, set to min value
                if (
                  e.target.value === "" ||
                  parseInt(e.target.value, 10) < min
                ) {
                  field.onChange(min.toString());
                  if (onValueChange) onValueChange(min.toString());
                }
                field.onBlur(); // We need to call onBlur to trigger validation for React Hook Form
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
