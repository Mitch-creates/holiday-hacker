import Holidays from "date-holidays";
import { useMemo } from "react";

const hd = new Holidays();

// Get holidays for a specific year, country, and region
export function useHolidays(year: number, country: string, region?: string) {
  return useMemo(() => {
    // If region is provided, initialize with country and region so we get region specific holidays
    // Otherwise, initialize with just the country to get nationwide holidays
    if (region) hd.init(country, region);
    else hd.init(country);

    const holidays = hd
      .getHolidays(year)
      .filter((holiday) => holiday.type === "public");
    return holidays;
  }, [year, country, region]);
}
