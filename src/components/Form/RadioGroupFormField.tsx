import { RadioGroup } from "../ui/radio-group";
import { RadioGroupItem } from "../ui/radio-group";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { HolidayFormValues } from "./HolidayForm";
import { Control } from "react-hook-form";

interface RadioGroupFormFieldProps {
  control: Control<HolidayFormValues>;
  formFieldName: "selectedTypeOfHoliday";
  label: string;
  themeColor: string;
  options: {
    value: string;
    label: string;
    description: string;
    icon: React.ElementType;
  }[];
}

export function RadioGroupFormField({
  control,
  label,
  options,
  formFieldName,
  themeColor,
}: RadioGroupFormFieldProps) {
  return (
    <FormField
      control={control}
      name={formFieldName}
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="grid gap-3"
            >
              {options.map((option) => {
                const Icon = option.icon;
                return (
                  /*Added label so we're able to make our Radiogroup options be selected when clicking on the whole card */
                  <label
                    key={option.value}
                    htmlFor={option.value}
                    className={`relative flex items-center gap-4 rounded-lg border-2 p-4 cursor-pointer transition-all hover:border-${themeColor} peer-checked:border-${themeColor} peer-checked:bg-${themeColor}/30`}
                  >
                    <RadioGroupItem
                      value={option.value}
                      id={option.value}
                      className="peer sr-only"
                    />
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-md bg-muted peer-checked:bg-${themeColor}/30`}
                    >
                      <Icon
                        className={`w-5 h-5 text-muted-foreground peer-checked:text-${themeColor}`}
                      />
                    </div>
                    <div className="flex flex-col gap-1 text-muted-foreground">
                      <FormLabel className={`font-semibold text-${themeColor}`}>
                        {option.label}
                      </FormLabel>
                      <span className="text-sm text-muted-foreground">
                        {option.description}
                      </span>
                    </div>
                  </label>
                );
              })}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
