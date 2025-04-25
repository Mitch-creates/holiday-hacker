// Service module for fetching country and holiday data from the Nager.Date API

const API_BASE = "https://date.nager.at/api/v3";

export interface Country {
  countryCode: string;
  name: string;
}

export interface Holiday {
  date: string; // YYYY-MM-DD
  localName: string; // Local name of the holiday
  name: string; // English name of the holiday
  countryCode: string; // Country code (ISO 3166-1 alpha-2)
  fixed: boolean; // Whether the date is fixed
  global: boolean; // Whether the holiday is observed globally in the country
  counties?: string[]; // Subdivision codes if region-specific
  launchYear?: number; // Year the holiday was first observed
  types: string[]; // Types of holiday (e.g., "Public", "Bank")
}

/**
 * Fetches the list of available countries from the API.
 * @returns Array of countries with code and name.
 */
export async function getCountries(): Promise<Country[]> {
  const response = await fetch(`${API_BASE}/AvailableCountries`);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch countries: ${response.status} ${response.statusText}`
    );
  }
  return response.json();
}

/**
 * Fetches public holidays for a given country and year.
 * @param countryCode ISO 3166-1 alpha-2 country code (e.g., "US").
 * @param year Four-digit year (e.g., 2025).
 * @returns Array of holiday objects for that country and year.
 */
export async function getHolidays(
  countryCode: string,
  year: number
): Promise<Holiday[]> {
  const response = await fetch(
    `${API_BASE}/PublicHolidays/${year}/${countryCode}`
  );
  if (!response.ok) {
    throw new Error(
      `Failed to fetch holidays for ${countryCode} in ${year}: ${response.status} ${response.statusText}`
    );
  }
  return response.json();
}
