import { RadioGroup } from "../ui/radio-group";
import { RadioGroupItem } from "../ui/radio-group";
import { FormControl, FormField, FormItem, FormMessage } from "../ui/form";
import { HolidayFormValues } from "./HolidayForm";
import { Control } from "react-hook-form";
import { useHolidayForm } from "@/context/FormContext";

interface RadioGroupFormFieldProps {
  control: Control<HolidayFormValues>;
  formFieldName: "strategy"; // Corrected from selectedTypeOfHoliday
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
  options,
  formFieldName,
  themeColor,
}: RadioGroupFormFieldProps) {
  const { updateStrategy, state } = useHolidayForm();
  const strategy = state.strategy;
  return (
    <FormField
      control={control}
      name={formFieldName}
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormControl>
            <RadioGroup
              onValueChange={(val) => {
                updateStrategy(val);
                field.onChange(val);
              }}
              value={field.value}
              className="grid gap-2"
            >
              {options.map((option) => {
                const Icon = option.icon;
                return (
                  /*Added label so we're able to make our Radiogroup options be selected when clicking on the whole card */
                  /* Conditionally apply hover effect when it's not selected, to have a visual effect when you select it. Very clean :)  */
                  <label
                    key={option.value}
                    htmlFor={option.value}
                    className={`relative flex items-center gap-4 rounded-lg border-2 p-2 cursor-pointer 
                      transition-all  ${
                        option.value === strategy ? `border-${themeColor} ` : ""
                      } ${
                      option.value !== strategy
                        ? `hover:border-${themeColor}/70 `
                        : ""
                    }`}
                  >
                    <RadioGroupItem
                      value={option.value}
                      id={option.value}
                      className="sr-only"
                    />
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-md bg-muted transition-colors duration-150 ease-in-out ${
                        option.value === strategy ? `bg-${themeColor}/20` : ""
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 text-muted-foreground peer-checked:text-${themeColor} ${
                          option.value === strategy ? `text-${themeColor}` : ""
                        }`}
                      />
                    </div>
                    <div className="flex flex-col gap-1 text-muted-foreground">
                      <span
                        className={`flex items-center text-sm font-bold text-${themeColor}`}
                      >
                        {option.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
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
