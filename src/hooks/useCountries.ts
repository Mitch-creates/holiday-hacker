import Holidays from "date-holidays";

const holidays = new Holidays();

export function useCountries() {
  return holidays.getCountries("en-US");
}
