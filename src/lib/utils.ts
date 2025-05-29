import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
// Format date to human readable format
// e.g. 2023-10-01 -> October 1, 2023
export function formatDate(date: Date) {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
}

interface Option {
  value: string;
  label: string;
}

export function mapToOptions(dict: Record<string, string>): Option[] {
  if (!dict) {
    return [];
  }
  return Object.entries(dict).map(([value, label]) => ({
    value,
    label,
  }));
}

// Helper to format date ranges
export const formatDateRange = (startDate: Date, endDate: Date) => {
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };
  return `${new Date(startDate).toLocaleDateString(
    undefined,
    options
  )} - ${new Date(endDate).toLocaleDateString(undefined, options)}`;
};

// Helper to get day type styling
export const getDayTypeStyle = (
  dayType: DayOffType | "OUT_OF_PERIOD" | "WEEKDAY_HEADER"
) => {
  switch (dayType) {
    case "USER_HOLIDAY":
      return { bg: "bg-theme-2/70", text: "text-white", label: "User Holiday" };
    case "PUBLIC_HOLIDAY":
      return {
        bg: "bg-theme-6/70",
        text: "text-white",
        label: "Public Holiday",
      };
    case "COMPANY_HOLIDAY":
      return {
        bg: "bg-theme-8/70",
        text: "text-white",
        label: "Company Holiday",
      };
    case "WEEKEND":
      return { bg: "bg-gray-300", text: "text-gray-700", label: "Weekend" };
    case "OUT_OF_PERIOD":
      return {
        bg: "bg-gray-100",
        text: "text-gray-400",
        label: "Not in period",
      };
    case "WEEKDAY_HEADER":
      return { bg: "bg-transparent", text: "text-gray-500", label: "Weekday" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-500", label: "" };
  }
};

// It's good practice to define types that are shared, like DayOffType
// If DayOff is already defined elsewhere and can be imported, that's even better.
// For now, let's define a local DayOffType based on its usage in getDayTypeStyle.
export type DayOffType =
  | "USER_HOLIDAY"
  | "PUBLIC_HOLIDAY"
  | "COMPANY_HOLIDAY"
  | "WEEKEND";
