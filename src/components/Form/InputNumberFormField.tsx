import { Input } from "../ui/input";
import { FormControl, FormField, FormItem, FormMessage } from "../ui/form";
import { Control } from "react-hook-form";
import { HolidayFormValues } from "./HolidayForm";

interface InputNumberFormFieldProps {
  control: Control<HolidayFormValues>;
  formFieldName: "userHolidays";
  placeholder: string;
  themeColor: string;
}

export default function InputNumberFormField({
  control,
  formFieldName,
  placeholder,
  themeColor,
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
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
