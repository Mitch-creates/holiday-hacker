import Holidays from "date-holidays";
import { useMemo } from "react";

// Get holidays for a specific year, country, and region
export function useHolidays(year: number, country: string, region?: string) {
  return useMemo(() => {
    const hd = new Holidays();
    // If region is provided, initialize with country and region so we get region specific holidays
    // Otherwise, initialize with just the country to get nationwide holidays

    if (!country) return [];
    try {
      // First check if country is valid by attempting to initialize it
      hd.init(country);

      // If region is provided and not "default", check if it's valid
      if (region && region !== "default") {
        const states = hd.getStates(country);

        // Check if states object exists and contains the region
        if (!states || Object.keys(states).length === 0) {
          console.warn(`No regions available for country: ${country}`);
          // Continue with just country initialization
        } else if (!Object.keys(states).includes(region)) {
          console.warn(
            `Invalid region code: ${region} for country: ${country}`
          );
          // Continue with just country initialization
        } else {
          // Region is valid, initialize with both
          hd.init(country, region);
        }
      }
      const holidays = hd
        .getHolidays(year)
        .filter((holiday) => holiday.type === "public");
      return holidays;
    } catch (error) {
      console.error("Error initializing holidays:", error);
      return [];
    }
  }, [year, country, region]);
}
