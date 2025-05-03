import Holidays from "date-holidays";
import { useMemo } from "react";

const hd = new Holidays();

// Get holidays for a specific year, country, and region
export function useHolidays(year: number, country: string, region?: string) {
  return useMemo(() => {
    // If region is provided, initialize with country and region so we get region specific holidays
    // Otherwise, initialize with just the country to get nationwide holidays
    // Add error handling for invalid country or region codes
    if (!country) return [];
    if (region && region !== "default") {
      const states = hd.getStates(country);
      if (!states || !Object.keys(states).includes(region)) {
        throw new Error(
          `Invalid region code: ${region} for country: ${country}`
        );
      }
    }
    if (region) hd.init(country, region);
    else hd.init(country);

    const holidays = hd
      .getHolidays(year)
      .filter((holiday) => holiday.type === "public");
    return holidays;
  }, [year, country, region]);
}
