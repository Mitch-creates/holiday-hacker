import { createContext, useContext, useReducer } from "react";

const FormContext = createContext();

const initialState: FormState = {
  userHolidays: "",
  strategy: "",
  holidays: [],
  companyDaysOff: [],
  error: "",
};

interface FormState {
  userHolidays: string;
  strategy: string;
  holidays: object[];
  companyDaysOff: object[];
  error: string;
}
// TODO Check if this whole things works as expected when. I want to set the fields of the form before we actually submit to make changing styles easier.
type SetFieldActions = {
  [K in keyof FormState]: {
    type: "SET_FIELD";
    field: K;
    value: FormState[K];
  };
}[keyof FormState];

export type FormAction = SetFieldActions | { type: "RESET" };

function reducer(state: FormState, action: FormAction) {
  switch (action.type) {
    case "SET_FIELD":
      console.log(action);
      return {
        ...state,
        [action.field]: action.value,
      };

    default:
      throw new Error("Unknown action type");
  }
}

function FormProvider({ children }) {
  const [{ userHolidays, strategy }, dispatch] = useReducer(
    reducer,
    initialState
  );

  function updateUserHolidays(userHolidays: string) {
    dispatch({ type: "SET_FIELD", field: "userHolidays", value: userHolidays });
  }
  function updateStrategy(strategy: string) {
    dispatch({ type: "SET_FIELD", field: "strategy", value: strategy });
  }

  return (
    <FormContext.Provider
      value={{
        updateUserHolidays: updateUserHolidays,
        userHolidays: userHolidays,
        updateStrategy: updateStrategy,
        strategy: strategy,
      }}
    >
      {" "}
      {children}{" "}
    </FormContext.Provider>
  );
}

function useHolidayForm() {
  const context = useContext(FormContext);
  if (context === undefined)
    throw new Error("FormContext was used outside the Form Provider");
  return context;
}

export { FormProvider, useHolidayForm };
