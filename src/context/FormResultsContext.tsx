// 1. Create a new context file for results data (src/context/ResultsContext.tsx)
import { createContext, useContext, useReducer, useCallback } from "react";
import { CompanyHoliday } from "./FormContext";
import { HolidaysTypes } from "date-holidays";
import {
  calculateOptimizedHolidayPeriods,
  StrategyType,
} from "@/lib/holidayCalculations";

// Create the context
const FormResultsContext = createContext<FormResultsContextType | undefined>(
  undefined
);

// A single day off
export type DayOff =
  | { date: Date; type: "PUBLIC_HOLIDAY"; name: string }
  | { date: Date; type: "COMPANY_HOLIDAY"; name: string }
  | { date: Date; type: "USER_HOLIDAY" }
  | { date: Date; type: "WEEKEND" };

// A single holiday period consisting of DayOffs
export interface HolidayPeriod {
  startDate: Date;
  endDate: Date;
  holidays: DayOff[];
  type: "longWeekend" | "midWeek" | "week" | "extended";
  userHolidaysUsed: number;
  publicHolidaysUsed: number;
  companyHolidaysUsed: number;
  weekendDays: number;
  totalDaysOff: number;
  description?: string;
}

// The data that came from the Form Context
interface FormInputState {
  userHolidays: string;
  year: string;
  strategy: StrategyType;
  selectedCountry: string;
  selectedRegion: string;
  publicHolidays: HolidaysTypes.Holiday[];
  companyHolidays: CompanyHoliday[];
}
// The data that will be used to calculate the results
interface FormResultsState {
  formInputState: FormInputState;
  status: "idle" | "loading" | "success" | "error";
  error: string | null;
  calculatedPeriods: HolidayPeriod[];
  isCalculated: boolean; // Added to indicate if calculation is done
}

// Create initial state for the results
const initialState: FormResultsState = {
  formInputState: {} as FormInputState,
  status: "idle",
  error: null,
  calculatedPeriods: [],
  isCalculated: false, // Initialized to false
};

// Action types for the reducer
type SetFieldActions = {
  [K in keyof FormResultsState]: {
    type: "SET_FIELD";
    field: K;
    value: FormResultsState[K];
  };
}[keyof FormResultsState];
type resetFormResults = { type: "RESET_RESULTS" };

export type FormResultsAction = SetFieldActions | resetFormResults;

// Reducer function to handle state updates
function reducer(
  state: FormResultsState,
  action: FormResultsAction
): FormResultsState {
  switch (action.type) {
    case "SET_FIELD":
      return {
        ...state,
        [action.field]: action.value,
      };
    case "RESET_RESULTS":
      return initialState;
    default:
      return state;
  }
}

// Context type definition
interface FormResultsContextType {
  state: FormResultsState;
  generateResults: (formData: FormInputState) => void;
  clearResults: () => void;
  updateFormInputState: (formInputState: FormInputState) => void;
}

// Provider component
export function FormResultsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Generate results based on form data
  const generateResults = useCallback(
    async (formData: FormInputState) => {
      dispatch({ type: "SET_FIELD", field: "formInputState", value: formData });
      dispatch({ type: "SET_FIELD", field: "status", value: "loading" });
      dispatch({ type: "SET_FIELD", field: "isCalculated", value: false });
      dispatch({ type: "SET_FIELD", field: "error", value: null });

      try {
        // generateHolidayPeriods is synchronous, Promise.resolve is used to match async structure if needed later
        const calculatedResults = await Promise.resolve(
          generateHolidayPeriods(formData)
        );

        dispatch({
          type: "SET_FIELD",
          field: "calculatedPeriods",
          value: calculatedResults,
        });
        dispatch({ type: "SET_FIELD", field: "status", value: "success" });
        dispatch({ type: "SET_FIELD", field: "isCalculated", value: true });
      } catch (e) {
        console.error("Error in generateResults:", e);
        const errorMessage =
          e instanceof Error
            ? e.message
            : "Failed to calculate optimal holidays";
        dispatch({ type: "SET_FIELD", field: "error", value: errorMessage });
        dispatch({ type: "SET_FIELD", field: "status", value: "error" });
        dispatch({ type: "SET_FIELD", field: "isCalculated", value: false });
      }
    },
    [dispatch]
  ); // dispatch is stable, generateHolidayPeriods is part of component scope

  const clearResults = useCallback(() => {
    dispatch({ type: "RESET_RESULTS" }); // Corrected action type
  }, [dispatch]);

  function updateFormInputState(newFormInputState: FormInputState) {
    dispatch({
      type: "SET_FIELD",
      field: "formInputState",
      value: newFormInputState,
    });
    dispatch({ type: "SET_FIELD", field: "status", value: "loading" });
    dispatch({ type: "SET_FIELD", field: "isCalculated", value: false });
    dispatch({ type: "SET_FIELD", field: "error", value: null });

    try {
      const periods = generateHolidayPeriods(newFormInputState);
      dispatch({
        type: "SET_FIELD",
        field: "calculatedPeriods",
        value: periods,
      });
      dispatch({ type: "SET_FIELD", field: "status", value: "success" });
      dispatch({ type: "SET_FIELD", field: "isCalculated", value: true });
    } catch (e) {
      console.error(
        "Error in updateFormInputState while generating periods:",
        e
      );
      const errorMessage =
        e instanceof Error ? e.message : "Failed to calculate optimal holidays";
      dispatch({ type: "SET_FIELD", field: "error", value: errorMessage });
      dispatch({ type: "SET_FIELD", field: "status", value: "error" });
      dispatch({ type: "SET_FIELD", field: "isCalculated", value: false });
    }
  }

  function generateHolidayPeriods(currentFormInputState: FormInputState) {
    // Renamed param for clarity
    const periods: HolidayPeriod[] = calculateOptimizedHolidayPeriods(
      currentFormInputState.strategy,
      currentFormInputState.publicHolidays,
      currentFormInputState.companyHolidays,
      Number(currentFormInputState.userHolidays),
      currentFormInputState.year
    );
    console.log("Generated holiday periods:", periods);
    return periods;
  }
  return (
    <FormResultsContext.Provider
      value={{
        state,
        generateResults,
        updateFormInputState,
        clearResults,
      }}
    >
      {children}
    </FormResultsContext.Provider>
  );
}

// Custom hook for using results context
export function useFormResults() {
  const context = useContext(FormResultsContext);
  if (context === undefined) {
    throw new Error("useResults must be used within a ResultsProvider");
  }
  return context;
}
