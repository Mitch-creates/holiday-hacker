// components/ComboBoxFormField.tsx
"use client";

import { useState, useMemo } from "react";
import { Check, ChevronsUpDown } from "lucide-react"; // Adjust the import path if necessary
import { Control } from "react-hook-form";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { FormField, FormItem, FormControl, FormMessage } from "../ui/form";
import { HolidayFormValues } from "./HolidayForm";
import { Button } from "../ui/button";
import clsx from "clsx";

interface ComboBoxFormFieldProps {
  control: Control<HolidayFormValues>;
  formFieldName: "selectedCountry" | "selectedRegion";
  options: { value: string; label: string }[];
  placeholder?: string;
  notFoundText?: string;
  widthClassName?: string;
  includeDefault?: boolean;
  defaultLabel?: string;
}

export default function ComboBoxFormField({
  control,
  formFieldName,
  options,
  placeholder = "Select…",
  notFoundText = "No options found.",
  widthClassName = "w-full",
  includeDefault = false,
  defaultLabel = "Nation-wide holidays",
}: ComboBoxFormFieldProps) {
  // Build a flat list (with optional default at front)
  const allOptions = useMemo(() => {
    const list = options.map((o) => ({ value: o.value, label: o.label }));
    if (includeDefault) {
      list.unshift({ value: "nationWide", label: defaultLabel });
    }
    return list;
  }, [options, includeDefault, defaultLabel]);

  // Local state to track open + query
  const [open, setOpen] = useState(false);
  return (
    <FormField
      control={control}
      name={formFieldName}
      render={({ field }) => {
        const selectedOptionLabel = allOptions.find(
          (option) => option.value === field.value
        )?.label;
        return (
          <FormItem className="space-y-1">
            <Popover open={open} onOpenChange={setOpen}>
              <FormControl>
                <PopoverTrigger asChild>
                  <Button
                    variant="default" // Use outline or other appropriate variant
                    role="combobox"
                    aria-expanded={open}
                    className={clsx(
                      "justify-between",
                      widthClassName,
                      !field.value &&
                        !selectedOptionLabel &&
                        "text-muted-foreground"
                    )} // Handle placeholder color
                  >
                    {selectedOptionLabel ?? placeholder}{" "}
                    {/* Show selected label or placeholder */}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
              </FormControl>

              <PopoverContent className={clsx("p-0", widthClassName)}>
                <Command>
                  <CommandList>
                    {includeDefault && (
                      <CommandItem
                        value={defaultLabel}
                        className="text-muted-foreground"
                        onSelect={() => {
                          field.onChange("nationWide");
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={clsx(
                            "mr-2 h-4 w-4",
                            field.value === "nationWide"
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {defaultLabel}
                      </CommandItem>
                    )}
                    <CommandEmpty>{notFoundText}</CommandEmpty>
                    <CommandGroup>
                      {allOptions.map((option) => (
                        <CommandItem
                          key={option.value}
                          value={option.label}
                          onSelect={(currentLabel) => {
                            // Find the option whose label was selected
                            const selectedValue = allOptions.find(
                              (opt) => opt.label === currentLabel
                            )?.value;
                            // Update the form field with the actual value
                            field.onChange(
                              selectedValue !== undefined ? selectedValue : ""
                            );
                            setOpen(false); // Close popover on selection
                          }}
                        >
                          <Check
                            className={clsx(
                              "mr-2 h-4 w-4", // Checkmark on the left
                              field.value === option.value
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {option.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
