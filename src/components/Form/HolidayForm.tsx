import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "../ui/form";
import { Button } from "../ui/button";
import InputNumberFormField from "./InputNumberFormField";
import { RadioGroupFormField } from "./RadioGroupFormField";
import { useHolidayForm } from "@/context/FormContext";
import { FormStepBox } from "./StepBox";
import { clsx } from "clsx";
import {
  GanttChart,
  Landmark,
  CalendarClock,
  CalendarRange,
  TreePalm,
  RefreshCcw,
  Trash2,
} from "lucide-react";
import CountrySelect from "./CountrySelect";
import RegionSelect from "./RegionSelect";
import { useHolidays } from "@/hooks/useHolidays";
import { useMemo } from "react";
import { formatDate } from "@/lib/utils";
import { HolidaysTypes } from "date-holidays";

export type HolidayFormValues = z.infer<typeof formSchema>;

const formSchema = z.object({
  userHolidays: z.coerce
    .number({
      required_error: "Please enter your amount of holidays",
      invalid_type_error: "Holidays must be a number",
    })
    .int("Please enter a whole number")
    .min(1, "That number is too low")
    .max(365, "That number is too high"),
  selectedTypeOfHoliday: z.enum(
    ["longWeekend", "midWeek", "week", "extended"],
    {
      errorMap: () => ({ message: "Please select a type of holiday" }),
    }
  ),
  selectedCountry: z.string().nonempty("Please select a country"),
  selectedRegion: z.string().default("default"),
});

const StepNumberIcon = ({
  number,
  color,
  textColor,
}: {
  number: number;
  color: string;
  textColor: string;
}) => (
  <div
    className={clsx(
      `w-5 h-5 bg-${color}/30 text-${textColor} flex items-center justify-center text-sm font-semibold rounded-sm`
    )}
  >
    {number}
  </div>
);

const radioOptions = [
  {
    value: "mixItUp",
    label: "Mix it up",
    description: "A balanced mix of all types of holidays",
    icon: GanttChart,
  },
  {
    value: "longWeekend",
    label: "Long Weekends",
    description: "3-4 day breaks, ideal for a city trip or a short getaway",
    icon: Landmark,
  },
  {
    value: "midWeek",
    label: "Mid-week Breaks",
    description: "5-6 day breaks",
    icon: CalendarClock,
  },
  {
    value: "week",
    label: "Week-long Breaks",
    description: "7-9 day vacations spread across the year",
    icon: CalendarRange,
  },
  {
    value: "extended",
    label: "Extended Vacations",
    description: "10-15 day vacations for a longer getaway",
    icon: TreePalm,
  },
];

export function HolidayForm() {
  const { updateFormContent, state } = useHolidayForm();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userHolidays: 0,
      selectedTypeOfHoliday: "longWeekend",
      selectedCountry: "",
      selectedRegion: "",
    },
  });
  const selectedCountry = form.watch("selectedCountry");
  const selectedRegion = form.watch("selectedRegion");

  const holidays: HolidaysTypes.Holiday[] = useHolidays(
    new Date().getFullYear(),
    selectedCountry,
    selectedRegion
  );
  console.log(holidays);

  // Move this to context
  const chosenHolidays = useMemo<HolidaysTypes.Holiday[]>(() => {
    let globalHolidays: Holiday[] = holidays.filter((h) => h.global);
    // Add regionalHolidays if selected
    if (selectedRegion !== "default") {
      globalHolidays = globalHolidays.concat(
        holidays.filter((h) => h.counties?.includes(selectedRegion))
      );
    }
    return globalHolidays.sort((a, b) => a.date.localeCompare(b.date));
  }, [holidays, selectedRegion, selectedCountry]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    // const newFormContent = {
    //   userHolidays: values.userHolidays,
    //   selectedTypeOfHoliday: values.selectedTypeOfHoliday,
    // };
    // updateFormContent(newFormContent);
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormStepBox
          stepIcon={
            <StepNumberIcon color="theme-1" textColor="theme-2" number={1} />
          }
          title="Enter Your Number Of Holidays"
          label="How many paid days off do you have?"
          tooltip="Include only official holidays, not sick days or unpaid leave."
          themeColor1="theme-1"
          themeColor2="theme-2"
        >
          <InputNumberFormField
            control={form.control}
            formFieldName="userHolidays"
            placeholder="e.g. 20"
            themeColor="theme-1"
          />
        </FormStepBox>
        <FormStepBox
          stepIcon={
            <StepNumberIcon color="theme-3" textColor="theme-4" number={2} />
          }
          title="Choose Type Of Holidays"
          label="What type of holidays do you prefer?"
          tooltip="Select the type of holidays you prefer. This will help to suggest the best options for you."
          themeColor1="theme-3"
          themeColor2="theme-4"
        >
          <RadioGroupFormField
            control={form.control}
            formFieldName="selectedTypeOfHoliday"
            options={radioOptions}
            themeColor="theme-4"
          />
        </FormStepBox>
        <FormStepBox
          stepIcon={
            <StepNumberIcon color="theme-5" textColor="theme-6" number={3} />
          }
          title="Get Public Holidays"
          label="Get the public holidays for 2025 by selecting your country, state, and region."
          tooltip="Make sure that you're not accounting for these holidays in the first section, keep them seperate."
          themeColor1="theme-5"
          themeColor2="theme-6"
        >
          <div className="space-y-3">
            <CountrySelect control={form.control} />
            {selectedCountry && (
              <RegionSelect
                control={form.control}
                selectedCountry={selectedCountry}
              />
            )}
          </div>
          {holidays.length > 0 && (
            <div className="space-y-2">
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-normal">
                    Automatically Detected
                    <span className={`text-theme-6 mx-1`}>
                      {holidays?.length}
                    </span>
                    Holidays
                  </label>
                  <Button
                    variant="link"
                    className="cursor-pointer text-amber-600 outline text-sm font-normal"
                    onClick={(e) => {
                      e.preventDefault();
                    }}
                  >
                    <RefreshCcw className="w-3 h-3 " /> <span>Refresh</span>
                  </Button>
                </div>
                <p className="text-muted-foreground text-xs font-normal mb-2">
                  These holidays are automatically detected based on your
                  country and State/Region selection.
                </p>
                <div className="rounded-md border p-4">
                  <ul className="gap-4">
                    {holidays?.map((holiday) => (
                      <li
                        key={holiday.name}
                        className="flex items-center justify-between rounded-md border p-2"
                      >
                        <div>
                          <div className="text-xs font-medium">
                            {holiday.name}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(new Date(holiday.date))}
                          </span>
                        </div>
                        <Button
                          variant="link"
                          className="cursor-pointer text-amber-600 outline text-sm font-normal ml-auto"
                          onClick={(e) => {
                            e.preventDefault();
                          }}
                        >
                          <Trash2 className="w-3 h-3 " />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </FormStepBox>

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
