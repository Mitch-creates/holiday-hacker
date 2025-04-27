// Service module for fetching country and holiday data from the Nager.Date API

const API_BASE = "https://date.nager.at/api/v3";

export interface Country {
  countryCode: string;
  name: string;
}

/**
 * Fetches the list of available countries from the API.
 * @returns Array of countries with code and name.
 */
export async function getCountries(): Promise<Country[]> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/AvailableCountries`);
  } catch (networkError) {
    console.error("Network error fetching countries:", networkError);
    throw new Error(
      "Network error fetching countries. Please check your connection."
    );
  }

  if (!response.ok) {
    let errorDetails = `${response.status} ${response.statusText}`;
    try {
      const errorBody = await response.json();
      if (errorBody && errorBody.message) {
        // Adjust 'message' if needed
        errorDetails = errorBody.message;
      } else {
        errorDetails = JSON.stringify(errorBody);
      }
    } catch (parseError) {
      console.warn("Could not parse error response body:", parseError);
    }
    throw new Error(`Failed to fetch countries: ${errorDetails}`);
  }

  try {
    return await response.json();
  } catch (jsonError) {
    console.error("Error parsing country data:", jsonError);
    throw new Error(
      "Failed to parse country data. The API returned an invalid format."
    );
  }
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
 * Fetches public holidays for a given country and year.
 * @param countryCode ISO 3166-1 alpha-2 country code (e.g., "US").
 * @param year Four-digit year (e.g., 2025).
 * @returns Array of holiday objects for that country and year.
 */
export async function getHolidays(
  countryCode: string,
  year: number
): Promise<Holiday[]> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/PublicHolidays/${year}/${countryCode}`);
  } catch (networkError) {
    // Handle fetch failures (network issues, DNS errors, etc.)
    console.error("Network error fetching holidays:", networkError);
    throw new Error(
      `Network error fetching holidays for ${countryCode} in ${year}. Please check your connection.`
    );
  }

  if (!response.ok) {
    let errorDetails = `${response.status} ${response.statusText}`;
    try {
      // Attempt to get more specific error details from the response body
      const errorBody = await response.json();
      if (errorBody && errorBody.message) {
        // Adjust 'message' based on actual API error structure
        errorDetails = errorBody.message;
      } else {
        // Or stringify the whole body if no specific message field
        errorDetails = JSON.stringify(errorBody);
      }
    } catch (parseError) {
      // Ignore if the error response body isn't valid JSON
      console.warn("Could not parse error response body:", parseError);
    }
    throw new Error(
      `Failed to fetch holidays for ${countryCode} in ${year}: ${errorDetails}`
    );
  }

  try {
    // Handle potential JSON parsing errors on successful responses
    return await response.json();
  } catch (jsonError) {
    console.error("Error parsing holiday data:", jsonError);
    throw new Error(
      `Failed to parse holiday data for ${countryCode} in ${year}. The API returned an invalid format.`
    );
  }
}
