import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "../ui/form";
import { Button } from "../ui/button";
import InputNumberFormField from "./InputNumberFormField";
import { RadioGroupFormField } from "./RadioGroupFormField";
import { useHolidayForm } from "@/context/FormContext";
import { FormStepBox } from "./FormStepBox";
import { clsx } from "clsx";
import {
  GanttChart,
  Landmark,
  CalendarClock,
  CalendarRange,
  TreePalm,
  Wand,
} from "lucide-react";
import CountrySelect from "./CountrySelect";
import RegionSelect from "./RegionSelect";
import { ModifyHolidays } from "./ModifyHolidays";
import FormContainer from "./FormContainer";
import MultipleDayPicker from "./MultipleDayPicker";
import { ModifyCompanyHolidays } from "./ModifyCompanyHolidays";
import { useState } from "react";
import { useFormResults } from "@/context/FormResultsContext";

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
  strategy: z.enum(["longWeekend", "midWeek", "week", "extended"], {
    errorMap: () => ({ message: "Please select a type of holiday" }),
  }),
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
  // {
  //   value: "mixItUp",
  //   label: "Mix it up",
  //   description: "A balanced mix of all types of holidays",
  //   icon: GanttChart,
  // },
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
  const { updateUserHolidays, state } = useHolidayForm();
  const { updateFormInputState } = useFormResults();
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userHolidays: 0,
      strategy: "longWeekend",
      selectedCountry: "",
      selectedRegion: "",
    },
  });

  function onSubmit() {
    setIsGenerating(true);

    // Create a snapshot of the current state
    const formSnapshot = {
      userHolidays: state.userHolidays,
      year: state.year,
      strategy: state.strategy,
      selectedCountry: state.selectedCountry,
      selectedRegion: state.selectedRegion,
      publicHolidays: state.rawHolidays.filter(
        (holiday) => !state.deletedHolidays.includes(holiday.date)
      ),
      companyHolidays: state.companyHolidays,
    };

    setTimeout(() => {
      try {
        // Pass the snapshot to results context
        updateFormInputState(formSnapshot);
      } finally {
        setIsGenerating(false);
      }
    }, 2500);
  }

  function handleUserHolidaysChange(value: string) {
    // Update the context with the new value
    updateUserHolidays(value);
  }

  return (
    <Form {...form}>
      <FormContainer title="Plan Your Holidays">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* This FormStepbox is responsible for the input of the amount of holidays the user has */}
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
              min={1}
              max={365}
              onValueChange={handleUserHolidaysChange}
            />
          </FormStepBox>
          {/* This FormStepbox is responsible for letting the user choose which kind of time off he'd like to be optmized by the app => Strategy */}
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
          {/* This FormStepbox is responsible for getting all holidays based on country and/or region and the option to modify that list */}
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
              {form.watch("selectedCountry") && (
                <RegionSelect control={form.control} />
              )}
            </div>
            <ModifyHolidays themeColor="theme-6" />
          </FormStepBox>
          {/* This FormStepbox is responsible for the company holidays (if applicable). The user can choose in a calender and modify that list later on, also being able to change the name of the company holiday */}
          <FormStepBox
            stepIcon={
              <StepNumberIcon color="theme-7" textColor="theme-8" number={4} />
            }
            title="Provide your company holidays"
            label={`Provide your company's holidays for ${state.year} by selecting them from the calendar.`}
            tooltip="After choosing your company's holidays, you can easily edit or delete them from the list."
            themeColor1="theme-7"
            themeColor2="theme-8"
          >
            <MultipleDayPicker themeColor="theme-7" showOutsideDays={true} />
            <ModifyCompanyHolidays themeColor="theme-7" />
          </FormStepBox>
          {/*Submit button */}
          <div className="flex justify-center">
            <Button
              type="submit"
              className="w-full max-w-[300px] bg-blue-400 text-white cursor-pointer hover:bg-blue-500 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span
                className={`flex items-center gap-2 ${
                  isGenerating ? "opacity-80" : ""
                }`}
              >
                <Wand
                  className={`w-5 h-5 text-white ${
                    isGenerating ? "wand-casting" : ""
                  }`}
                />
                {isGenerating ? "Generating..." : "Generate result"}
              </span>

              {isGenerating && (
                <span className="magic-particles" aria-hidden="true"></span>
              )}
            </Button>
          </div>
        </form>
      </FormContainer>
    </Form>
  );
}
