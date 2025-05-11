import { Control } from "react-hook-form";
import { HolidayFormValues } from "./HolidayForm";
import SelectFormField from "./SelectFormField";
import { useRegions } from "@/hooks/useRegions";
import { mapToOptions } from "@/lib/utils";
import { useHolidayForm } from "@/context/FormContext";

export default function RegionSelect({
  control,
  themeColor1,
  themeColor2,
}: {
  control: Control<HolidayFormValues>;
  themeColor1: string;
  themeColor2: string;
}) {
  const { updateSelectedRegion, state } = useHolidayForm();
  const regionOptions = mapToOptions(useRegions(state.selectedCountry)).sort(
    (a, b) => a.label.localeCompare(b.label)
  );
  // When the regionOptions is not empty, we add default option at the front of the list
  if (regionOptions.length > 0) {
    regionOptions.unshift({
      value: "default",
      label: "All states (nationwide holidays only)",
    });
  }

  function handleRegionChange(region: string) {
    updateSelectedRegion(region);
  }

  // If no region‐specific holidays exist or only the default option is present, return null
  if (regionOptions?.length === 0) return null;
  return (
    <SelectFormField
      control={control}
      handleChange={handleRegionChange}
      formFieldName="selectedRegion"
      selectLabel="Select Province/State"
      options={regionOptions}
      themeColor1={themeColor1}
      themeColor2={themeColor2}
    />
  );
}
