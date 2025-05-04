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
