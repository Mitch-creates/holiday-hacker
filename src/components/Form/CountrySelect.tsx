import { Control } from "react-hook-form";
import { useCountries } from "../../hooks/useCountries";
import { HolidayFormValues } from "./HolidayForm";
import SelectFormField from "./SelectFormField";
import { useMemo } from "react";

export default function CountrySelect({
  control,
  themeColor1,
  themeColor2,
}: {
  control: Control<HolidayFormValues>;
}) {
  // Retrieve the list of countries from the custom hook and sort them alphabetically
  const { data: countries = [] } = useCountries();
  const options = useMemo(() => {
    return countries
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((c) => ({
        value: c.countryCode,
        label: c.name,
      }));
  }, [countries]);

  return (
    <SelectFormField
      control={control}
      formFieldName="selectedCountry"
      options={options}
      placeholder="Select a country"
      selectLabel="Select Country"
      themeColor1={themeColor1}
      themeColor2={themeColor2}
    />
  );
}
