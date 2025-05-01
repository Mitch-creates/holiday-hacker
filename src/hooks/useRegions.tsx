import Holidays from "date-holidays";
import { useMemo } from "react";

const holidays = new Holidays();

export function useRegions(countryCode: string) {
  return useMemo(() => {
    return holidays.getStates(countryCode);
  }, [countryCode]);
}
