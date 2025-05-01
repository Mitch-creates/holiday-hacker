import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import { Control } from "react-hook-form";
import { HolidayFormValues } from "./HolidayForm";
import SelectFormField from "./SelectFormField";
import { useRegions } from "@/hooks/useRegions";
import { mapToOptions } from "@/lib/utils";

export default function RegionSelect({
  control,
  selectedCountry,
  themeColor1,
  themeColor2,
}: {
  control: Control<HolidayFormValues>;
}) {
  const regionOptions = mapToOptions(useRegions(selectedCountry)).sort((a, b) =>
    a.label.localeCompare(b.label)
  );

  // If no region‐specific holidays exist or only the default option is present, return null
  if (regionOptions?.length <= 1 && regionOptions[0]?.value === "default")
    return null;
  return (
    <SelectFormField
      control={control}
      formFieldName="selectedRegion"
      selectLabel="Select Province/State"
      options={regionOptions}
      themeColor1={themeColor1}
      themeColor2={themeColor2}
    />
  );
}
