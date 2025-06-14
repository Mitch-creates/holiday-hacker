import { CompanyHoliday } from "@/context/FormContext";
import { HolidayPeriod, DayOff } from "@/context/FormResultsContext";
import { HolidaysTypes } from "date-holidays";

// ========== Types ==========
/**
 * Defines the available holiday optimization strategies.
 * - `longWeekend`: Aims to create 3-4 day weekends.
 * - `midWeek`: Aims for 5-6 day breaks that include a weekend.
 * - `week`: Aims for 7-9 day breaks, typically including one full weekend.
 * - `extended`: Aims for longer breaks of 10-15 days, often spanning multiple weekends.
 */
export type StrategyType = "longWeekend" | "midWeek" | "week" | "extended";

/**
 * Input parameters for a holiday calculation strategy.
 */
interface StrategyInput {
  /** Array of public holidays for the selected year and region. */
  publicHolidays: HolidaysTypes.Holiday[];
  /** Array of company-specific holidays. */
  companyHolidays: CompanyHoliday[];
  /** Number of vacation days the user has available. */
  userHolidayCount: number;
  /** The year for which to calculate holidays. */
  year: string;
  /** Optional: The current date, used to filter out past periods. Defaults to today. */
  today?: Date;
}

/**
 * Represents a potential holiday period candidate during calculation.
 */
interface PeriodCandidate {
  /** Array of all dates included in this potential period. */
  periodDays: Date[];
  /** Number of user's own vacation days used in this period. */
  userDays: number;
  /** Number of public holidays falling within this period. */
  publicDays: number;
  /** Number of company holidays falling within this period. */
  companyDays: number;
  /** Number of weekend days (Saturday, Sunday) in this period. */
  weekendDays: number;
  /** Total length of the period in days. */
  length: number;
  /** Calculated score for this candidate, used for ranking. Higher is better. */
  score?: number;
  /** Optional: Number of consecutive holidays (public, company, weekend) at the end of the period. Used by some strategies. */
  consecutiveHolidays?: number;
  /** Optional: Maximum number of consecutive holidays (public, company, weekend) found anywhere in the period. Used by some strategies. */
  maxConsecutiveHolidays?: number;
  /** Optional: Sum of holiday densities for each day in the period. Used by 'extended' strategy. */
  totalHolidayDensity?: number;
}

/**
 * Data that can be precomputed once per strategy execution to optimize calculations.
 */
interface PrecomputedData {
  /** Optional: Map of date strings to a "holiday density" score, used by 'extended' strategy. */
  holidayDensityMap?: Map<string, number>;
  /** Optional: The target year as a number. */
  yearNum?: number;
}

/**
 * Configuration for a specific holiday calculation strategy.
 * Defines how to find, filter, score, and describe holiday periods.
 */
interface StrategyConfig {
  /** The type of strategy this configuration applies to. */
  strategyType: StrategyType;
  /**
   * Defines the lengths of periods to search for.
   * Can be an array of arrays for multi-pass strategies (e.g., search for 4-day periods first, then 3-day).
   */
  periodLengthPasses: ReadonlyArray<ReadonlyArray<number>>;
  /**
   * Optional filter for the start day of a potential period.
   * @param date - The potential start date.
   * @param periodLength - The length of the period being considered.
   * @param passIndex - The current pass index in a multi-pass strategy.
   * @returns True if the start date is valid, false otherwise.
   */
  periodStartDateFilter?: (
    date: Date,
    periodLength: number,
    passIndex: number
  ) => boolean;
  /**
   * Optional filter for the end day of a potential period.
   * @param endDate - The potential end date.
   * @param periodLength - The length of the period being considered.
   * @param passIndex - The current pass index in a multi-pass strategy.
   * @returns True if the end date is valid, false otherwise.
   */
  periodEndDateFilter?: (
    endDate: Date,
    periodLength: number,
    passIndex: number
  ) => boolean;
  /**
   * Minimum number of weekend days required in a valid period.
   * @param length - The length of the period.
   * @param passIndex - The current pass index.
   * @returns The minimum number of weekend days.
   */
  minWeekendDaysInPeriod: (length: number, passIndex: number) => number;
  /**
   * Function to determine if the number of user days for a candidate period is acceptable.
   * @param userDaysInCandidate - Number of user days in the current candidate period.
   * @param availableUserHolidays - Total user holidays remaining.
   * @param periodLength - The length of the candidate period.
   * @param passIndex - The current pass index.
   * @returns True if the user day count is valid, false otherwise.
   */
  userDaysValidatorFn: (
    userDaysInCandidate: number,
    availableUserHolidays: number,
    periodLength: number,
    passIndex: number
  ) => boolean;
  /**
   * Optional custom filter for a candidate after basic checks (length, user days, weekend days).
   * @param candidate - The period candidate to evaluate.
   * @param allHolidaysMap - Map of all public and company holidays.
   * @param passIndex - The current pass index.
   * @param precomputedData - Optional precomputed data for the strategy.
   * @returns True if the candidate is valid, false otherwise.
   */
  candidateFilterFn?: (
    candidate: PeriodCandidate,
    allHolidaysMap: Map<string, DayOff>,
    passIndex: number,
    precomputedData?: PrecomputedData
  ) => boolean;
  /**
   * Scores a candidate period. Higher scores are preferred.
   * @param candidate - The period candidate to score.
   * @param passIndex - The current pass index.
   * @param precomputedData - Optional precomputed data for the strategy.
   * @returns The calculated score.
   */
  candidateScoringFn: (
    candidate: PeriodCandidate,
    passIndex: number,
    precomputedData?: PrecomputedData
  ) => number;
  /**
   * Generates a human-readable description for the resulting holiday period.
   * @param period - The final holiday period.
   * @param candidateData - The candidate data from which this period was derived.
   * @param precomputedData - Optional precomputed data.
   * @returns A string description of the holiday period.
   */
  descriptionFn: (
    period: HolidayPeriod,
    candidateData: PeriodCandidate,
    precomputedData?: PrecomputedData
  ) => string;
  /** Optional: Minimum total user holidays required to even attempt this strategy. */
  minTotalUserHolidaysRequiredForStrategy?: number;
  /**
   * Optional pre-computation step, executed once per strategy.
   * @param input - The strategy input.
   * @param allHolidaysMap - Map of all public and company holidays.
   * @returns Data to be passed to other functions like scoring or filtering.
   */
  precomputeFn?: (
    input: StrategyInput,
    allHolidaysMap: Map<string, DayOff>
  ) => PrecomputedData;
}

// ========== Helpers ==========

/**
 * Converts a Date object to an ISO string (YYYY-MM-DD).
 * @param date - The date to convert.
 * @returns The date as an ISO string.
 */
function toIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Checks if a given date is a weekend (Saturday or Sunday).
 * @param date - The date to check.
 * @returns True if the date is a weekend, false otherwise.
 */
function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 for Sunday, 6 for Saturday
}

/**
 * Combines public and company holidays into a single map, keyed by ISO date string.
 * Weekends that are also holidays are removed.
 * @param publicHolidays - Array of public holidays.
 * @param companyHolidays - Array of company holidays.
 * @returns A Map where keys are ISO date strings and values are DayOff objects.
 */
function combineHolidays(
  publicHolidays: HolidaysTypes.Holiday[],
  companyHolidays: CompanyHoliday[]
): Map<string, DayOff> {
  const allHolidaysMap = new Map<string, DayOff>();

  for (const ph of publicHolidays) {
    const date = new Date(ph.date);
    allHolidaysMap.set(toIso(date), {
      date: date,
      type: "PUBLIC_HOLIDAY",
      name: ph.name,
    });
  }

  for (const ch of companyHolidays) {
    const chDate = new Date(ch.date);
    allHolidaysMap.set(toIso(chDate), {
      date: chDate,
      type: "COMPANY_HOLIDAY",
      name: ch.name,
    });
  }
  // Remove holidays that fall on a weekend, as they don't consume a weekday slot.
  return purgeWeekends(allHolidaysMap);
}

/**
 * Removes holidays from a map if they fall on a weekend.
 * @param holidays - A map of holidays.
 * @returns The modified map with weekend holidays removed.
 */
function purgeWeekends(holidays: Map<string, DayOff>): Map<string, DayOff> {
  const keysToDelete: string[] = [];
  holidays.forEach((holiday, key) => {
    if (isWeekend(new Date(holiday.date))) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach((key) => holidays.delete(key));
  return holidays;
}

// ========== Generic Calculation Engine ==========
/**
 * Core engine for executing a holiday calculation strategy.
 * It iterates through potential periods, filters, scores, and selects the best ones.
 * @param input - The strategy input data.
 * @param config - The configuration for the specific strategy to execute.
 * @returns An array of optimized HolidayPeriod objects, sorted by start date.
 */
function executeHolidayStrategy(
  input: StrategyInput,
  config: StrategyConfig
): HolidayPeriod[] {
  const { userHolidayCount, year, today } = input;
  let availableUserHolidays = userHolidayCount;
  const results: HolidayPeriod[] = [];
  const usedDates = new Set<string>();
  // Pass input.publicHolidays and input.companyHolidays to combineHolidays
  const allHolidaysMap = combineHolidays(
    input.publicHolidays,
    input.companyHolidays
  );

  const yearNum = Number(year);
  const startDateOfYear = new Date(yearNum, 0, 1);
  const endDateOfYear = new Date(yearNum, 11, 31);
  const now = today ?? new Date();

  if (
    config.minTotalUserHolidaysRequiredForStrategy &&
    availableUserHolidays < config.minTotalUserHolidaysRequiredForStrategy
  ) {
    return [];
  }

  const precomputedData = config.precomputeFn
    ? config.precomputeFn(input, allHolidaysMap)
    : undefined;

  for (
    let passIndex = 0;
    passIndex < config.periodLengthPasses.length;
    passIndex++
  ) {
    if (availableUserHolidays <= 0) break;

    const periodLengthsForPass = config.periodLengthPasses[passIndex];
    const candidatesThisPass: PeriodCandidate[] = [];

    for (const length of periodLengthsForPass) {
      for (
        let d = new Date(startDateOfYear);
        d <= endDateOfYear;
        d.setDate(d.getDate() + 1)
      ) {
        if (
          config.periodStartDateFilter &&
          !config.periodStartDateFilter(d, length, passIndex)
        ) {
          continue;
        }
        if (d < now) continue;

        const periodDays = Array.from({ length }, (_, i) => {
          const day = new Date(d);
          day.setDate(d.getDate() + i);
          return day;
        });

        const periodEndDate = periodDays[length - 1];
        if (
          periodEndDate > endDateOfYear ||
          periodDays[0].getFullYear() !== yearNum ||
          periodEndDate.getFullYear() !== yearNum
        )
          continue;
        if (
          config.periodEndDateFilter &&
          !config.periodEndDateFilter(periodEndDate, length, passIndex)
        ) {
          continue;
        }
        // Check for overlap before expensive counting
        if (periodDays.some((day) => usedDates.has(toIso(day)))) continue;

        let userDaysInCandidate = 0,
          publicDaysInCandidate = 0,
          companyDaysInCandidate = 0,
          weekendDaysInCandidate = 0;
        const candidateSpecificProps: {
          consecutiveHolidays?: number;
          maxConsecutiveHolidays?: number;
          totalHolidayDensity?: number;
        } = {};

        // Initialize strategy-specific properties if needed by scoring/filtering
        if (
          config.strategyType === "week" ||
          config.strategyType === "extended"
        ) {
          candidateSpecificProps.consecutiveHolidays = 0;
          candidateSpecificProps.maxConsecutiveHolidays = 0;
        }
        if (
          config.strategyType === "extended" &&
          precomputedData?.holidayDensityMap
        ) {
          candidateSpecificProps.totalHolidayDensity = 0;
        }

        for (const day of periodDays) {
          const iso = toIso(day);

          if (
            config.strategyType === "extended" &&
            precomputedData?.holidayDensityMap &&
            candidateSpecificProps.totalHolidayDensity !== undefined // Ensure property exists
          ) {
            candidateSpecificProps.totalHolidayDensity +=
              precomputedData.holidayDensityMap.get(iso) || 0;
          }

          if (allHolidaysMap.has(iso)) {
            // Already purged weekends, so no double count
            const holiday = allHolidaysMap.get(iso)!;
            if (holiday.type === "PUBLIC_HOLIDAY") publicDaysInCandidate++;
            else if (holiday.type === "COMPANY_HOLIDAY")
              companyDaysInCandidate++;
            if (candidateSpecificProps.consecutiveHolidays !== undefined)
              // Ensure property exists
              candidateSpecificProps.consecutiveHolidays++;
          } else if (isWeekend(day)) {
            weekendDaysInCandidate++;
            if (candidateSpecificProps.consecutiveHolidays !== undefined)
              // Ensure property exists
              candidateSpecificProps.consecutiveHolidays++;
          } else {
            userDaysInCandidate++; // Assumed to be a user day if not holiday/weekend
            if (candidateSpecificProps.consecutiveHolidays !== undefined)
              // Ensure property exists
              candidateSpecificProps.consecutiveHolidays = 0;
          }
          if (
            candidateSpecificProps.maxConsecutiveHolidays !== undefined && // Ensure property exists
            candidateSpecificProps.consecutiveHolidays !== undefined
          ) {
            // Ensure property exists
            candidateSpecificProps.maxConsecutiveHolidays = Math.max(
              candidateSpecificProps.maxConsecutiveHolidays,
              candidateSpecificProps.consecutiveHolidays
            );
          }
        }

        if (
          !config.userDaysValidatorFn(
            userDaysInCandidate,
            availableUserHolidays,
            length,
            passIndex
          )
        ) {
          continue;
        }
        if (
          weekendDaysInCandidate <
          config.minWeekendDaysInPeriod(length, passIndex)
        ) {
          continue;
        }

        const candidate: PeriodCandidate = {
          periodDays,
          userDays: userDaysInCandidate,
          publicDays: publicDaysInCandidate,
          companyDays: companyDaysInCandidate,
          weekendDays: weekendDaysInCandidate,
          length,
          ...candidateSpecificProps,
        };

        if (
          config.candidateFilterFn &&
          !config.candidateFilterFn(
            candidate,
            allHolidaysMap,
            passIndex,
            precomputedData
          )
        ) {
          continue;
        }

        candidate.score = config.candidateScoringFn(
          candidate,
          passIndex,
          precomputedData
        );
        candidatesThisPass.push(candidate);
      }
    }

    candidatesThisPass.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

    for (const bestCandidate of candidatesThisPass) {
      if (
        !config.userDaysValidatorFn(
          bestCandidate.userDays,
          availableUserHolidays,
          bestCandidate.length,
          passIndex
        )
      ) {
        continue;
      }
      if (bestCandidate.periodDays.some((day) => usedDates.has(toIso(day)))) {
        continue;
      }

      const holidayPeriodDays: DayOff[] = [];
      let actualUserDaysFilled = 0;
      for (const day of bestCandidate.periodDays) {
        const iso = toIso(day);
        if (allHolidaysMap.has(iso)) {
          holidayPeriodDays.push(allHolidaysMap.get(iso)!);
        } else if (isWeekend(day)) {
          holidayPeriodDays.push({ date: day, type: "WEEKEND" });
        } else {
          // This day is a potential user day
          if (actualUserDaysFilled < bestCandidate.userDays) {
            holidayPeriodDays.push({ date: day, type: "USER_HOLIDAY" });
            actualUserDaysFilled++;
          } else {
            // Should not happen if userDays count is accurate and period is valid
            // Or, this day is just a normal weekday not taken off.
            // For simplicity, we assume all non-holiday/non-weekend days become user days up to bestCandidate.userDays
            // This part might need refinement if a period can contain working days that are not user holidays.
            // Given the context, it's likely all such days are user holidays.
          }
        }
      }
      // Safety check: ensure the number of USER_HOLIDAY types matches bestCandidate.userDays
      const finalUserHolidaysInPeriod = holidayPeriodDays.filter(
        (h) => h.type === "USER_HOLIDAY"
      ).length;
      if (finalUserHolidaysInPeriod !== bestCandidate.userDays) {
        console.warn(
          "Mismatch in user days count vs. filled for period:",
          bestCandidate.periodDays[0]
        );
        // Potentially skip this candidate or re-evaluate
        continue;
      }

      const periodToAdd: HolidayPeriod = {
        startDate: bestCandidate.periodDays[0],
        endDate: bestCandidate.periodDays[bestCandidate.periodDays.length - 1],
        holidays: holidayPeriodDays,
        type: config.strategyType,
        userHolidaysUsed: bestCandidate.userDays,
        publicHolidaysUsed: bestCandidate.publicDays,
        companyHolidaysUsed: bestCandidate.companyDays,
        weekendDays: bestCandidate.weekendDays,
        totalDaysOff: bestCandidate.length,
        description: "", // Will be set by descriptionFn
      };
      periodToAdd.description = config.descriptionFn(
        periodToAdd,
        bestCandidate,
        precomputedData
      );

      results.push(periodToAdd);
      bestCandidate.periodDays.forEach((day) => usedDates.add(toIso(day)));
      availableUserHolidays -= bestCandidate.userDays;

      if (availableUserHolidays <= 0) break;
    }
  }

  results.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  return results;
}

// ========== Strategy Configurations ==========

/** Configuration for the 'longWeekend' strategy. */
const longWeekendConfig: StrategyConfig = {
  strategyType: "longWeekend",
  periodLengthPasses: [[4], [3]],
  periodStartDateFilter: (date) => [4, 5, 6].includes(date.getDay()), // Thu, Fri, Sat
  minWeekendDaysInPeriod: (length) => (length === 3 ? 1 : 2), // Approximation
  userDaysValidatorFn: (userDaysInCandidate, availableUserHolidays) => {
    return (
      userDaysInCandidate === 1 && userDaysInCandidate <= availableUserHolidays
    );
  },
  candidateScoringFn: (_candidate, passIndex) => {
    // Prioritize 4-day (pass 0) over 3-day (pass 1)
    // Within a pass, all valid candidates are equal as per original logic
    return passIndex === 0 ? 100 : 50;
  },
  descriptionFn: (period) => `${period.totalDaysOff}-day long weekend`,
};

/** Configuration for the 'midWeek' strategy. */
const midWeekConfig: StrategyConfig = {
  strategyType: "midWeek",
  periodLengthPasses: [[6, 5]],
  periodStartDateFilter: (date) => date.getDay() !== 1, // Not Monday
  periodEndDateFilter: (endDate) => endDate.getDay() !== 5, // Not Friday
  minWeekendDaysInPeriod: () => 2,
  userDaysValidatorFn: (userDaysInCandidate, availableUserHolidays) => {
    return userDaysInCandidate <= availableUserHolidays;
  },
  candidateFilterFn: (candidate) => {
    return candidate.weekendDays === 2; // Must be exactly 2 weekend days
  },
  candidateScoringFn: (candidate) => {
    const holidayDays = candidate.publicDays + candidate.companyDays;
    return (
      holidayDays * 10 +
      candidate.weekendDays * 5 -
      candidate.userDays * 3 +
      (candidate.length === 6 ? 2 : 0)
    );
  },
  descriptionFn: (period) => `${period.totalDaysOff}-day midweek break`,
};

/** Configuration for the \'week\' strategy. */
const weekConfig: StrategyConfig = {
  strategyType: "week",
  periodLengthPasses: [[9, 8, 7]],
  periodStartDateFilter: (date) => date.getDay() !== 0, // Not Sunday
  periodEndDateFilter: (endDate) => endDate.getDay() !== 6, // Not Saturday
  minWeekendDaysInPeriod: (length) => 2, // At least 2 weekend days
  userDaysValidatorFn: (userDaysInCandidate, availableUserHolidays) => {
    return userDaysInCandidate <= availableUserHolidays;
  },
  candidateFilterFn: (candidate) => {
    return candidate.weekendDays === 2; // Must be exactly 2 weekend days
  },
  candidateScoringFn: (candidate) => {
    const holidayDays = candidate.publicDays + candidate.companyDays;
    return (
      holidayDays * 10 +
      candidate.weekendDays * 5 -
      candidate.userDays * 3 +
      (candidate.length === 9 ? 4 : candidate.length === 8 ? 2 : 0)
    );
  },
  descriptionFn: (period) => `${period.totalDaysOff}-day week break`,
};

/** Configuration for the 'extended' strategy. */
const extendedConfig: StrategyConfig = {
  strategyType: "extended",
  periodLengthPasses: [
    [15, 14, 13],
    [12, 11, 10],
  ],
  periodStartDateFilter: (date) => date.getDay() !== 0, // Not Sunday
  periodEndDateFilter: (endDate) => endDate.getDay() !== 6, // Not Saturday
  minWeekendDaysInPeriod: (length) => 2, // At least 2 weekend days
  userDaysValidatorFn: (userDaysInCandidate, availableUserHolidays) => {
    return userDaysInCandidate <= availableUserHolidays;
  },
  candidateFilterFn: (candidate) => {
    return candidate.weekendDays === 2; // Must be exactly 2 weekend days
  },
  candidateScoringFn: (candidate, passIndex, precomputedData) => {
    const holidayDays = candidate.publicDays + candidate.companyDays;
    const baseScore =
      holidayDays * 10 + candidate.weekendDays * 5 - candidate.userDays * 3;
    if (passIndex === 0 && candidate.length === 15) return baseScore + 6;
    if (passIndex === 0 && candidate.length === 14) return baseScore + 4;
    if (passIndex === 0 && candidate.length === 13) return baseScore + 2;
    return baseScore;
  },
  descriptionFn: (period) => `${period.totalDaysOff}-day extended break`,
};

const strategyConfigMap: Record<StrategyType, StrategyConfig> = {
  longWeekend: longWeekendConfig,
  midWeek: midWeekConfig,
  week: weekConfig,
  extended: extendedConfig,
};

/**
 * Calculates optimized holiday periods based on the selected strategy and user inputs.
 * This is the main exported function for holiday calculations.
 * @param strategyType - The desired holiday optimization strategy.
 * @param publicHolidays - Array of public holidays.
 * @param companyHolidays - Array of company-specific holidays.
 * @param userHolidayCount - Number of vacation days the user has available.
 * @param year - The year for which to calculate holidays.
 * @param today - Optional: The current date, used to filter out past periods. Defaults to today.
 * @returns An array of calculated HolidayPeriod objects, or an empty array if the strategy is not found or an error occurs.
 */
export function calculateOptimizedHolidayPeriods(
  strategyType: StrategyType,
  publicHolidays: HolidaysTypes.Holiday[],
  companyHolidays: CompanyHoliday[],
  userHolidayCount: number,
  year: string,
  today?: Date
): HolidayPeriod[] {
  const config = strategyConfigMap[strategyType];
  if (!config) {
    console.error(`Strategy configuration for ${strategyType} not found.`);
    return [];
  }
  return executeHolidayStrategy(
    {
      publicHolidays,
      companyHolidays,
      userHolidayCount,
      year,
      today,
    },
    config
  );
}

export {
  executeHolidayStrategy,
  longWeekendConfig,
  midWeekConfig,
  weekConfig,
  extendedConfig,
  // calculateOptimizedHolidayPeriods, // Already exported above
};
