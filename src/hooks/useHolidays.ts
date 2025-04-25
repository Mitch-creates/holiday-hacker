import { useQuery } from "@tanstack/react-query";
import { getHolidays } from "../services/holidayApi";
import { Holiday } from "../services/holidayApi";

export function useHolidays(countryCode: string, year: number) {
  return useQuery<Holiday[]>({
    queryKey: ["holidays", countryCode, year],
    queryFn: () => getHolidays(countryCode, year),
    staleTime: 1000 * 60 * 60, // Keep the data fresh for 1 hour
    gcTime: 1000 * 60 * 60 * 24, // Garbage collection after 24 hours
    refetchOnWindowFocus: false, // Don't refetch when the window is focused
  });
}
