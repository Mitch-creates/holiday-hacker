import { useQuery } from "@tanstack/react-query";
import { getCountries } from "../services/holidayApi";

export function useCountries() {
  return useQuery({
    queryKey: ["countries"],
    queryFn: () => getCountries(),
    staleTime: 1000 * 60 * 60, // Keep the data fresh for 1 hour
    gcTime: 1000 * 60 * 60 * 24, // Garbage collection after 24 hours
    refetchOnWindowFocus: false, // Don't refetch when the window is focused
  });
}
