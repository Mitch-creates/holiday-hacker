import { createContext, useContext, useReducer } from "react";

const FormContext = createContext();

const initialState: State = {
  userHolidays: 0,
  selectedTypeOfHoliday: "",
  error: "",
};

type Action = { type: "formContent/updated"; payload: State };

interface State {
  userHolidays: number;
  selectedTypeOfHoliday: string;
  error: string;
}

function reducer(state: State, action: Action) {
  switch (action.type) {
    case "formContent/updated":
      return {
        ...state,
        userHolidays: action.payload.userHolidays,
      };
    default:
      throw new Error("Unknown action type");
  }
}

function FormProvider({ children }) {
  const [{ userHolidays, selectedTypeOfHoliday }, dispatch] = useReducer(
    reducer,
    initialState
  );

  function updateFormContent(newFormContent: State) {
    dispatch({ type: "formContent/updated", payload: newFormContent });
  }

  return (
    <FormContext.Provider value={{ updateFormContent }}>
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
