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
  const { data: countries = [] } = useCountries();
  const options = useMemo(() => {
    return countries.map((c) => ({
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
      selectLabel="Select a country"
      themeColor1={themeColor1}
      themeColor2={themeColor2}
    />
  );
}
