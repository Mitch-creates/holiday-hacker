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
import { useState, useEffect } from "react";
import { useFormResults } from "@/context/FormResultsContext";
import { StrategyType } from "@/lib/holidayCalculations";
import { trackEvent } from "@/lib/analytics";

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
  selectedRegion: z.string().optional(),
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
  const {
    updateUserHolidays,
    state,
    updateStrategy,
    updateSelectedCountry,
    updateSelectedRegion,
    updateYear,
  } = useHolidayForm();
  // Get state from useFormResults as well, aliasing to formResultsState to avoid naming conflict
  const { updateFormInputState, state: formResultsState } = useFormResults();
  const [isGenerating, setIsGenerating] = useState(false);
  const [awaitingScroll, setAwaitingScroll] = useState(false); // New state for scroll trigger
  const STORAGE_KEY = "hh_form_preferences";

  const form = useForm<HolidayFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userHolidays: 0,
      strategy: "longWeekend",
      selectedCountry: "",
      selectedRegion: "",
    },
  });

  function onSubmit(data: HolidayFormValues) {
    if (data.strategy) {
      updateStrategy(data.strategy);
    }
    setIsGenerating(true);
    setAwaitingScroll(true); // Indicate that a scroll will be needed after generation

    const formSnapshot = {
      userHolidays: state.userHolidays,
      year: state.year,
      strategy: data.strategy as StrategyType,
      selectedCountry: state.selectedCountry,
      selectedRegion: state.selectedRegion || "",
      publicHolidays: state.rawHolidays.filter(
        (holiday) => !state.deletedHolidays.includes(holiday.date)
      ),
      companyHolidays: state.companyHolidays,
    };

    setTimeout(() => {
      try {
        updateFormInputState(formSnapshot);
        trackEvent("pto_plan_generated", {
          country: formSnapshot.selectedCountry || "unknown",
          strategy: formSnapshot.strategy,
          pto_days_input: Number(formSnapshot.userHolidays) || 0,
          year: Number(formSnapshot.year),
          company_holidays_count: formSnapshot.companyHolidays.length,
          public_holidays_count: formSnapshot.publicHolidays.length,
        });
      } finally {
        setIsGenerating(false);
        // Scroll logic is now handled by the useEffect below
      }
    }, 2500);
  }

  // useEffect to handle scrolling when results are ready
  useEffect(() => {
    // Condition: awaiting scroll, generation finished, and output area should be visible
    if (awaitingScroll && !isGenerating && formResultsState.status !== "idle") {
      requestAnimationFrame(() => {
        // Use requestAnimationFrame for smoother DOM interaction
        if (window.innerWidth >= 1024) {
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          const outputContainer = document.getElementById(
            "output-container-wrapper"
          );
          if (outputContainer) {
            outputContainer.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        }
        setAwaitingScroll(false); // Reset the flag
      });
    }
  }, [awaitingScroll, isGenerating, formResultsState.status]);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const prefs = JSON.parse(raw) as {
        userHolidays?: string;
        strategy?: StrategyType;
        selectedCountry?: string;
        selectedRegion?: string;
        year?: string;
      };

      if (prefs.userHolidays) {
        updateUserHolidays(prefs.userHolidays);
        form.setValue("userHolidays", Number(prefs.userHolidays));
      }
      if (prefs.strategy) {
        updateStrategy(prefs.strategy);
        form.setValue("strategy", prefs.strategy);
      }
      if (prefs.selectedCountry) {
        updateSelectedCountry(prefs.selectedCountry);
        form.setValue("selectedCountry", prefs.selectedCountry);
      }
      if (prefs.selectedRegion) {
        updateSelectedRegion(prefs.selectedRegion);
        form.setValue("selectedRegion", prefs.selectedRegion);
      }
      if (prefs.year) {
        updateYear(prefs.year);
      }
    } catch {
      // ignore malformed local data
    }
  }, [
    form,
    updateSelectedCountry,
    updateSelectedRegion,
    updateStrategy,
    updateUserHolidays,
    updateYear,
  ]);

  useEffect(() => {
    const prefs = {
      userHolidays: state.userHolidays,
      strategy: state.strategy,
      selectedCountry: state.selectedCountry,
      selectedRegion: state.selectedRegion,
      year: state.year,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  }, [
    state.userHolidays,
    state.strategy,
    state.selectedCountry,
    state.selectedRegion,
    state.year,
  ]);

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
            themeColor2="theme-4"
          >
            <div className="flex flex-wrap gap-2 mb-3">
              <button
                type="button"
                onClick={() => {
                  form.setValue("strategy", "longWeekend");
                  updateStrategy("longWeekend");
                  trackEvent("recommendation_applied", {
                    preset: "long_weekends",
                    strategy: "longWeekend",
                  });
                }}
                className="px-2.5 py-1.5 text-xs font-bold rounded-lg border-2 border-foreground bg-theme-2/20 text-foreground"
              >
                Quick wins
              </button>
              <button
                type="button"
                onClick={() => {
                  form.setValue("strategy", "week");
                  updateStrategy("week");
                  trackEvent("recommendation_applied", {
                    preset: "balanced",
                    strategy: "week",
                  });
                }}
                className="px-2.5 py-1.5 text-xs font-bold rounded-lg border-2 border-foreground bg-theme-5/20 text-foreground"
              >
                Balanced plan
              </button>
              <button
                type="button"
                onClick={() => {
                  form.setValue("strategy", "extended");
                  updateStrategy("extended");
                  trackEvent("recommendation_applied", {
                    preset: "max_consecutive",
                    strategy: "extended",
                  });
                }}
                className="px-2.5 py-1.5 text-xs font-bold rounded-lg border-2 border-foreground bg-theme-7/20 text-foreground"
              >
                Max consecutive
              </button>
            </div>
            <RadioGroupFormField
              control={form.control}
              formFieldName="strategy"
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
            themeColor2="theme-6"
          >
            <div className="space-y-3">
              <CountrySelect
                control={form.control}
                themeColor1="theme-5"
                themeColor2="theme-6"
              />
              {form.watch("selectedCountry") && (
                <RegionSelect
                  control={form.control}
                  themeColor1="theme-5"
                  themeColor2="theme-6"
                />
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
            themeColor2="theme-8"
          >
            <MultipleDayPicker themeColor="theme-7" showOutsideDays={true} />
            <ModifyCompanyHolidays themeColor="theme-7" />
          </FormStepBox>
          {/*Submit button */}
          <div className="flex justify-center">
            <Button
              type="submit"
              className="w-full max-w-[300px] bg-theme-5 text-white cursor-pointer hover:bg-theme-5/90 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
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
