import { Control } from "react-hook-form";
import { useCountries } from "../../hooks/useCountries";
import { HolidayFormValues } from "./HolidayForm";
import SelectFormField from "./SelectFormField";
import { mapToOptions } from "../../lib/utils";

export default function CountrySelect({
  control,
  themeColor1,
  themeColor2,
}: {
  control: Control<HolidayFormValues>;
}) {
  // Retrieve the list of countries from the custom hook and sort them alphabetically
  const countryOptions = mapToOptions(useCountries()).sort((a, b) =>
    a.label.localeCompare(b.label)
  );

  return (
    <SelectFormField
      control={control}
      formFieldName="selectedCountry"
      options={countryOptions}
      placeholder="Select a country"
      selectLabel="Select Country"
      themeColor1={themeColor1}
      themeColor2={themeColor2}
    />
  );
}
