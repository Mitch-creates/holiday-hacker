import { createContext, useContext, useReducer } from "react";

interface FormContextType {
  state: FormState;
  updateUserHolidays: (userHolidays: string) => void;
  updateStrategy: (strategy: string) => void;
  deleteHoliday: (date: string) => void;
  resetHolidays: () => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

interface FormState {
  userHolidays: string;
  strategy: string;
  holidays: object[];
  companyDaysOff: object[];
  deletedHolidayDates: string[]; //Storing the deleted holidays instead of the full holidays list. Keeps server‐state vs. client‐state separate. React Query manages fetching/caching; The Context manages only the bits of UI state that React Query doesn’t know about
  error: string;
}

const initialState: FormState = {
  userHolidays: "",
  strategy: "",
  holidays: [],
  companyDaysOff: [],
  deletedHolidayDates: [],
  error: "",
};
type SetFieldActions = {
  [K in keyof FormState]: {
    type: "SET_FIELD";
    field: K;
    value: FormState[K];
  };
}[keyof FormState];
type DeleteHolidayAction = { type: "DELETE_HOLIDAY"; date: string };
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
        deletedHolidayDates: Array.from(
          new Set([...state.deletedHolidayDates, action.date])
        ),
      };

    case "RESET_HOLIDAYS":
      return {
        ...state,
        deletedHolidayDates: [],
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
  function deleteHoliday(date: string) {
    dispatch({ type: "DELETE_HOLIDAY", date });
  }

  function resetHolidays() {
    dispatch({ type: "RESET_HOLIDAYS" });
  }

  return (
    <FormContext.Provider
      value={{
        state,
        updateUserHolidays: updateUserHolidays,
        updateStrategy: updateStrategy,
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
