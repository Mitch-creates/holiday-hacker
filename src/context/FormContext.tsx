import { useHolidays } from "@/hooks/useHolidays";
import { HolidaysTypes } from "date-holidays";
import { createContext, useContext, useEffect, useReducer } from "react";

// Design choice between keeping track of just the deleted holidays and the raw public holidays or an array derived from the public holidays of that country/region and make it modifiable

interface FormContextType {
  state: FormState;
  updateUserHolidays: (userHolidays: string) => void;
  updateStrategy: (strategy: string) => void;
  updateSelectedCountry: (country: string) => void;
  updateSelectedRegion: (region: string) => void;
  setHolidays: (holidays: HolidaysTypes.Holiday[]) => void;
  deleteHoliday: (date: string) => void;
  resetHolidays: () => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

interface FormState {
  userHolidays: string;
  strategy: string;
  selectedCountry: string;
  selectedRegion: string;
  rawHolidays: HolidaysTypes.Holiday[];
  deletedHolidays: string[];
  companyDaysOff: object[];
  error: string;
}
//Add the option pick a year for the holidays
const initialState: FormState = {
  userHolidays: "",
  strategy: "",
  rawHolidays: [],
  companyDaysOff: [],
  deletedHolidays: [],
  selectedCountry: "",
  selectedRegion: "",
  error: "",
};
type SetFieldActions = {
  [K in keyof FormState]: {
    type: "SET_FIELD";
    field: K;
    value: FormState[K];
  };
}[keyof FormState];
type DeleteHolidayAction = {
  type: "DELETE_HOLIDAY";
  date: string;
};
type ResetHolidaysAction = { type: "RESET_HOLIDAYS" };

export type FormAction =
  | SetFieldActions
  | DeleteHolidayAction
  | ResetHolidaysAction
  | { type: "RESET" };

function reducer(state: FormState, action: FormAction) {
  switch (action.type) {
    case "SET_FIELD":
      console.log(action);
      return {
        ...state,
        [action.field]: action.value,
      };
    case "DELETE_HOLIDAY":
      return {
        ...state,
        deletedHolidays: Array.from(
          new Set([...state.deletedHolidays, action.date])
        ),
      };

    case "RESET_HOLIDAYS":
      return {
        ...state,
        deletedHolidays: [],
      };

    default:
      throw new Error("Unknown action type");
  }
}

export function FormProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  function updateUserHolidays(userHolidays: string) {
    dispatch({ type: "SET_FIELD", field: "userHolidays", value: userHolidays });
  }
  function updateStrategy(strategy: string) {
    dispatch({ type: "SET_FIELD", field: "strategy", value: strategy });
  }
  function updateSelectedCountry(country: string) {
    dispatch({ type: "SET_FIELD", field: "selectedCountry", value: country });
  }
  function updateSelectedRegion(region: string) {
    dispatch({ type: "SET_FIELD", field: "selectedRegion", value: region });
  }
  function deleteHoliday(date: string) {
    dispatch({ type: "DELETE_HOLIDAY", date });
  }

  function resetHolidays() {
    dispatch({ type: "RESET_HOLIDAYS" });
  }

  const holidays: HolidaysTypes.Holiday[] = useHolidays(
    new Date().getFullYear(),
    state.selectedCountry,
    state.selectedRegion
  );

  useEffect(() => {
    if (state.selectedCountry) {
      dispatch({
        type: "SET_FIELD",
        field: "selectedRegion",
        value: "default",
      });
      resetHolidays();
    }
  }, [state.selectedCountry]);

  useEffect(() => {
    if (state.selectedCountry && state.selectedRegion) {
      dispatch({
        type: "SET_FIELD",
        field: "rawHolidays",
        value: holidays,
      });
      resetHolidays();
    }
  }, [state.selectedCountry, state.selectedRegion, holidays]);

  return (
    <FormContext.Provider
      value={{
        state,
        updateUserHolidays: updateUserHolidays,
        updateStrategy: updateStrategy,
        updateSelectedCountry: updateSelectedCountry,
        updateSelectedRegion: updateSelectedRegion,
        deleteHoliday: deleteHoliday,
        resetHolidays: resetHolidays,
      }}
    >
      {children}
    </FormContext.Provider>
  );
}

export function useHolidayForm() {
  const context = useContext(FormContext);
  if (context === undefined)
    throw new Error("FormContext was used outside the Form Provider");
  return context;
}
