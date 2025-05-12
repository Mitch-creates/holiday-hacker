// 1. Create a new context file for results data (src/context/ResultsContext.tsx)
import { createContext, useContext, useReducer, useCallback } from "react";
import { CompanyHoliday } from "./FormContext";
import { HolidaysTypes } from "date-holidays";

// Create the context
const FormResultsContext = createContext<FormResultsContextType | undefined>(
  undefined
);

// A single holiday period
export interface HolidayPeriod {
  userHolidays: string;
  startDate: Date;
  endDate: Date;
  description: string;
  publicHolidays: HolidaysTypes.Holiday[];
  companyHolidays: CompanyHoliday[];
  selectedCountry: string;
  selectedRegion: string;
  year: string;
  strategy: string;
  vacationDaysUsed: number;
  weekendDays: number;
  totalDaysOff: number;
}

// The data that came from the Form Context
interface FormInputState {
  userHolidays: string;
  year: string;
  strategy: string;
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
}

// Create initial state for the results
const initialState: FormResultsState = {
  formInputState: {} as FormInputState,
  status: "idle",
  error: null,
  calculatedPeriods: [],
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

  // Generate results based on form data (this is where you would call your calculation logic)
  const generateResults = useCallback(async (formData) => {
    // Show loading state
    dispatch({ type: "SET_LOADING" });

    try {
      // Add a delay to simulate processing (remove this in production)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Your calculation logic here
      const calculatedResults = calculateOptimalHolidays(formData);

      // Update state with results
      dispatch({ type: "SET_RESULTS", payload: calculatedResults });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: "Failed to calculate optimal holidays",
      });
    }
  }, []);

  const clearResults = useCallback(() => {
    dispatch({ type: "CLEAR_RESULTS" });
  }, []);

  function updateFormInputState(formInputState: FormInputState) {
    dispatch({
      type: "SET_FIELD",
      field: "formInputState",
      value: formInputState,
    });
  }

  // Sample calculation function (replace with your actual logic)
  function calculateOptimalHolidays(formData: any) {
    // Implement your holiday calculation algorithm here
    return [
      {
        start: new Date(2025, 3, 18),
        end: new Date(2025, 3, 21),
        description: "Easter holiday",
      },
      // More calculated holidays...
    ];
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
