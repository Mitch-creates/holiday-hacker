import { Input } from "../ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Control } from "react-hook-form";
import { HolidayFormValues } from "./HolidayForm";

interface InputNumberFormFieldProps {
  control: Control<HolidayFormValues>;
  formFieldName: "userHolidays";
  label: string;
  placeholder: string;
  themeColor: string;
}

export default function InputNumberFormField({
  control,
  formFieldName,
  label,
  placeholder,
  themeColor,
}: InputNumberFormFieldProps) {
  return (
    <FormField
      control={control}
      name={formFieldName}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="font-bold text-muted-foreground">
            {label}
          </FormLabel>
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
