import { useHolidays } from "@/hooks/useHolidays";
import { HolidaysTypes } from "date-holidays";
import { createContext, useContext, useEffect, useReducer } from "react";

interface FormContextType {
  state: FormState;
  updateUserHolidays: (userHolidays: string) => void;
  updateYear: (year: string) => void;
  updateStrategy: (strategy: string) => void;
  updateSelectedCountry: (country: string) => void;
  updateSelectedRegion: (region: string) => void;
  updateCompanyHolidays: (companyHolidays: CompanyHoliday[]) => void;
  setHolidays: (holidays: HolidaysTypes.Holiday[]) => void;
  deleteHoliday: (date: string) => void;
  resetHolidays: () => void;
}

export interface CompanyHoliday {
  name: string;
  date: Date;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

interface FormState {
  userHolidays: string;
  year: string;
  strategy: string;
  selectedCountry: string;
  selectedRegion: string;
  rawHolidays: HolidaysTypes.Holiday[];
  deletedHolidays: string[];
  companyHolidays: CompanyHoliday[];
  error: string;
}

const initialState: FormState = {
  userHolidays: "",
  year: new Date().getFullYear().toString(),
  strategy: "",
  rawHolidays: [],
  companyHolidays: [],
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

  function updateYear(year: string) {
    dispatch({ type: "SET_FIELD", field: "year", value: year });
  }

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
  function updateCompanyHolidays(companyHolidays: CompanyHoliday[]) {
    dispatch({
      type: "SET_FIELD",
      field: "companyHolidays",
      value: companyHolidays,
    });
  }
  function deleteHoliday(date: string) {
    dispatch({ type: "DELETE_HOLIDAY", date });
  }

  function resetHolidays() {
    dispatch({ type: "RESET_HOLIDAYS" });
  }

  const holidays: HolidaysTypes.Holiday[] = useHolidays(
    Number(state.year),
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
        updateYear: updateYear,
        updateUserHolidays: updateUserHolidays,
        updateStrategy: updateStrategy,
        updateSelectedCountry: updateSelectedCountry,
        updateSelectedRegion: updateSelectedRegion,
        updateCompanyHolidays: updateCompanyHolidays,
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
