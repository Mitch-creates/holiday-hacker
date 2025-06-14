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
/**
 * Represents a single day within a holiday period, detailing its type.
 * - `PUBLIC_HOLIDAY`: A statutory public holiday.
 * - `COMPANY_HOLIDAY`: A holiday specific to the user's company.
 * - `USER_HOLIDAY`: A vacation day taken by the user.
 * - `WEEKEND`: A Saturday or Sunday.
 */
export type DayOff =
  | { date: Date; type: "PUBLIC_HOLIDAY"; name: string }
  | { date: Date; type: "COMPANY_HOLIDAY"; name: string }
  | { date: Date; type: "USER_HOLIDAY" }
  | { date: Date; type: "WEEKEND" };

/**
 * Represents a calculated holiday period, including its constituent days and metadata.
 */
export interface HolidayPeriod {
  /** The start date of the holiday period (inclusive). */
  startDate: Date;
  /** The end date of the holiday period (inclusive). */
  endDate: Date;
  /** An array of DayOff objects representing each day in the period. */
  holidays: DayOff[];
  /** The type of strategy that generated this period. */
  type: StrategyType;
  /** Number of user's own vacation days used in this period. */
  userHolidaysUsed: number;
  /** Number of public holidays falling within this period. */
  publicHolidaysUsed: number;
  /** Number of company holidays falling within this period. */
  companyHolidaysUsed: number;
  /** Number of weekend days (Saturday, Sunday) in this period. */
  weekendDays: number;
  /** Total length of the holiday period in days. */
  totalDaysOff: number;
  /** A human-readable description of the holiday period (e.g., "5-day long weekend"). */
  description?: string;
}

/**
 * State representing the inputs from the form, used for triggering calculations.
 */
interface FormInputState {
  /** Number of vacation days the user has available, as a string. */
  userHolidays: string;
  /** The year for which to calculate holidays, as a string. */
  year: string;
  /** The selected holiday optimization strategy. */
  strategy: StrategyType;
  /** The selected country code. */
  selectedCountry: string;
  /** The selected region/subdivision code (if applicable). */
  selectedRegion: string;
  /** Array of public holidays for the selected year and region. */
  publicHolidays: HolidaysTypes.Holiday[];
  /** Array of company-specific holidays. */
  companyHolidays: CompanyHoliday[];
}

/**
 * State managed by the FormResultsContext, including inputs, status, and calculated results.
 */
interface FormResultsState {
  /** The form input data that led to the current results. */
  formInputState: FormInputState;
  /** Current status of the calculation process. */
  status: "idle" | "loading" | "success" | "error";
  /** Error message if the calculation failed, otherwise null. */
  error: string | null;
  /** Array of calculated HolidayPeriod objects. */
  calculatedPeriods: HolidayPeriod[];
  /** Flag indicating whether a calculation has been successfully completed. */
  isCalculated: boolean;
}

// Create initial state for the results
const initialState: FormResultsState = {
  formInputState: {} as FormInputState, // Initialized as an empty object, to be populated by form submission
  status: "idle",
  error: null,
  calculatedPeriods: [],
  isCalculated: false, // Initially, no calculation has been performed
};

// Action types for the reducer
/**
 * Action to set a specific field in the FormResultsState.
 */
type SetFieldActions = {
  [K in keyof FormResultsState]: {
    type: "SET_FIELD";
    field: K;
    value: FormResultsState[K];
  };
}[keyof FormResultsState];
/**
 * Action to reset the FormResultsState to its initial state.
 */
type resetFormResults = { type: "RESET_RESULTS" };

/**
 * Union of all possible actions for the FormResults reducer.
 */
export type FormResultsAction = SetFieldActions | resetFormResults;

// Reducer function to handle state updates
/**
 * Reducer for managing the FormResultsState.
 * @param state - The current state.
 * @param action - The action to perform.
 * @returns The new state.
 */
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
/**
 * Defines the shape of the FormResultsContext.
 */
interface FormResultsContextType {
  /** The current state of the form results. */
  state: FormResultsState;
  /**
   * Triggers the calculation of holiday periods based on the provided form data.
   * Sets status to 'loading', then 'success' or 'error'.
   * @param formData - The input data from the holiday form.
   */
  generateResults: (formData: FormInputState) => void;
  /** Clears all calculated results and resets the state to initial. */
  clearResults: () => void;
  /**
   * Updates the form input state and re-triggers the calculation.
   * Useful if form inputs change after an initial calculation.
   * @param formInputState - The new input data from the holiday form.
   */
  updateFormInputState: (formInputState: FormInputState) => void;
}

// Provider component
/**
 * Provider component for the FormResultsContext.
 * It manages the state for holiday calculation results and provides functions to interact with it.
 * @param children - React components that need access to the form results context.
 */
export function FormResultsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const generateHolidayPeriods = useCallback(
    async (currentFormInputState: FormInputState) => {
      try {
        const periods: HolidayPeriod[] = calculateOptimizedHolidayPeriods(
          currentFormInputState.strategy,
          currentFormInputState.publicHolidays,
          currentFormInputState.companyHolidays,
          Number(currentFormInputState.userHolidays),
          currentFormInputState.year
        );

        dispatch({ type: "SET_FIELD", field: "status", value: "success" });
        dispatch({
          type: "SET_FIELD",
          field: "calculatedPeriods",
          value: periods,
        });
        dispatch({ type: "SET_FIELD", field: "isCalculated", value: true });
      } catch (e) {
        console.error("Error in generateHolidayPeriods:", e);
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
  );

  const generateResults = useCallback(
    (formData: FormInputState) => {
      dispatch({ type: "SET_FIELD", field: "formInputState", value: formData });
      dispatch({ type: "SET_FIELD", field: "status", value: "loading" });
      dispatch({ type: "SET_FIELD", field: "isCalculated", value: false });
      dispatch({ type: "SET_FIELD", field: "error", value: null });
      generateHolidayPeriods(formData);
    },
    [dispatch, generateHolidayPeriods]
  );

  const clearResults = useCallback(() => {
    dispatch({ type: "RESET_RESULTS" });
  }, [dispatch]);

  const updateFormInputState = useCallback(
    (newFormInputState: FormInputState) => {
      dispatch({
        type: "SET_FIELD",
        field: "formInputState",
        value: newFormInputState,
      });
      dispatch({ type: "SET_FIELD", field: "status", value: "loading" });
      dispatch({ type: "SET_FIELD", field: "isCalculated", value: false });
      dispatch({ type: "SET_FIELD", field: "error", value: null });
      generateHolidayPeriods(newFormInputState);
    },
    [dispatch, generateHolidayPeriods]
  );

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
