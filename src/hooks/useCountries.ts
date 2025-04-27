import { useQuery } from "@tanstack/react-query";
import { getCountries } from "../services/holidayApi";

// This hook fetches the list of countries from the API and caches the result using react-query. We can manually invalidate the cache when we need to refresh the data => queryClient.invalidateQueries(["countries"]) or by a manual refetch => queryClient.refetchQueries(["countries"])

export function useCountries() {
  return useQuery({
    queryKey: ["countries"],
    queryFn: () => getCountries(),
    staleTime: 1000 * 60 * 60, // Keep the data fresh for 1 hour
    gcTime: 1000 * 60 * 60 * 24, // Garbage collection after 24 hours
    refetchOnWindowFocus: false, // Don't refetch when the window is focused
  });
}
