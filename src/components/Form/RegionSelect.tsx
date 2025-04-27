import { Holiday } from "@/services/holidayApi";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import { Control } from "react-hook-form";
import { HolidayFormValues } from "./HolidayForm";
import SelectFormField from "./ComboBoxFormField";
import { useMemo } from "react";
import { allCountries } from "country-region-data";

countries.registerLocale(enLocale);

interface RegionOption {
  value: string;
  label: string;
}
// This was the original function to get the subdivision name. Keeping it here for reference
// function getSubdivisionName(code: string): string {
//   const [countryCode, regionCode] = code.split("-");
//   const countryObj = allCountries
//     .find((c) => c[1] === countryCode)?.[2]
//     ?.find((r) => r[1] === regionCode)?.[0];
//   return countryObj ?? code; // fallback to code if not found
// }

const regionLookupMap = new Map<string, Map<string, string>>();
allCountries.forEach((country) => {
  const countryCode = country[1];
  const regions = country[2];
  if (regions && regions.length > 0) {
    const innerMap = new Map<string, string>();
    regions.forEach((region) => {
      const regionName = region[0];
      const regionCode = region[1];
      innerMap.set(regionCode, regionName);
    });
    regionLookupMap.set(countryCode, innerMap);
  }
});

// Optimized function using the pre-processed map
function getSubdivisionName(code: string): string {
  const [countryCode, regionCode] = code.split("-");
  // Efficient lookup using the map
  const regionName = regionLookupMap.get(countryCode)?.get(regionCode);
  return regionName ?? code; // fallback to code if not found
}

export default function RegionSelect({
  control,
  holidays,
  themeColor1,
  themeColor2,
}: {
  control: Control<HolidayFormValues>;
  holidays: Holiday[];
}) {
  const regionOptions: RegionOption[] = useMemo(() => {
    // 1) Gather every county code into a Set
    const codes = new Set<string>();
    for (const h of holidays) {
      (h.counties ?? []).forEach((c) => codes.add(c));
    }

    // 2) Map to { value, label }
    const subdivisonArray = Array.from(codes).map((code) => ({
      value: code,
      label: getSubdivisionName(code),
    }));

    // 3) Sort by label
    return subdivisonArray.sort((a, b) => a.label.localeCompare(b.label));
  }, [holidays]);

  // If no region‐specific holidays exist, don’t render
  if (regionOptions.length === 0) return null;
  return (
    <SelectFormField
      control={control}
      formFieldName="selectedRegion"
      options={regionOptions}
      placeholder="Select a region (optional)"
      defaultLabel="Nation-wide holidays"
      selectLabel="Select a region"
      themeColor1={themeColor1}
      themeColor2={themeColor2}
    />
  );
}
