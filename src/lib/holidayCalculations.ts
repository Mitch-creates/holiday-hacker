// ...existing code...
import { CompanyHoliday } from "@/context/FormContext";
import { HolidayPeriod, DayOff } from "@/context/FormResultsContext";
import { HolidaysTypes } from "date-holidays";

// ========== Types ==========
export type StrategyType = "longWeekend" | "midWeek" | "week" | "extended";

interface StrategyInput {
  publicHolidays: HolidaysTypes.Holiday[];
  companyHolidays: CompanyHoliday[];
  userHolidayCount: number;
  year: string;
  today?: Date;
}

// New types for generic strategy
interface PeriodCandidate {
  periodDays: Date[];
  userDays: number;
  publicDays: number;
  companyDays: number;
  weekendDays: number;
  length: number;
  score?: number; // Score will be calculated by the strategy
  // Allow for strategy-specific properties to be added for scoring/description
  [key: string]: any;
}

interface StrategyConfig {
  strategyType: StrategyType;
  // Defines the lengths of periods to search for, can be an array of arrays for multi-pass strategies
  periodLengthPasses: ReadonlyArray<ReadonlyArray<number>>;
  // Filters for the start day of a potential period
  periodStartDateFilter?: (
    date: Date,
    periodLength: number,
    passIndex: number
  ) => boolean;
  // Filters for the end day of a potential period
  periodEndDateFilter?: (
    endDate: Date,
    periodLength: number,
    passIndex: number
  ) => boolean;
  // Minimum number of weekend days required in a valid period
  minWeekendDaysInPeriod: (length: number, passIndex: number) => number;
  // Function to determine if the number of user days for a candidate period is acceptable
  userDaysValidatorFn: (
    userDaysInCandidate: number,
    availableUserHolidays: number,
    periodLength: number,
    passIndex: number
  ) => boolean;
  // More complex custom filter for a candidate after basic checks
  candidateFilterFn?: (
    candidate: PeriodCandidate,
    allHolidaysMap: Map<string, DayOff>,
    passIndex: number,
    precomputedData?: Record<string, any>
  ) => boolean;
  // Scores a candidate period. Higher is better.
  candidateScoringFn: (
    candidate: PeriodCandidate,
    passIndex: number,
    precomputedData?: Record<string, any>
  ) => number;
  // Generates a description for the resulting holiday period
  descriptionFn: (
    period: HolidayPeriod,
    candidateData: PeriodCandidate,
    precomputedData?: Record<string, any>
  ) => string;
  // Minimum total user holidays required to even attempt this strategy
  minTotalUserHolidaysRequiredForStrategy?: number;
  // Optional pre-computation step, returns data to be passed to other functions
  precomputeFn?: (
    input: StrategyInput,
    allHolidaysMap: Map<string, DayOff>
  ) => Record<string, any>;
}

// ========== Helpers (some might be localized or modified) ==========

function toIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

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
  // The purgeWeekends call means allHolidaysMap won't contain holidays that are also weekends.
  return purgeWeekends(allHolidaysMap);
}

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
        const candidateSpecificProps: Record<string, any> = {};

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
            precomputedData?.holidayDensityMap
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
            if (candidateSpecificProps.hasOwnProperty("consecutiveHolidays"))
              candidateSpecificProps.consecutiveHolidays++;
          } else if (isWeekend(day)) {
            weekendDaysInCandidate++;
            if (candidateSpecificProps.hasOwnProperty("consecutiveHolidays"))
              candidateSpecificProps.consecutiveHolidays++;
          } else {
            userDaysInCandidate++; // Assumed to be a user day if not holiday/weekend
            if (candidateSpecificProps.hasOwnProperty("consecutiveHolidays"))
              candidateSpecificProps.consecutiveHolidays = 0;
          }
          if (candidateSpecificProps.hasOwnProperty("maxConsecutiveHolidays")) {
            candidateSpecificProps.maxConsecutiveHolidays = Math.max(
              candidateSpecificProps.maxConsecutiveHolidays,
              candidateSpecificProps.consecutiveHolidays || 0
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
  candidateScoringFn: (candidate, passIndex) => {
    // Prioritize 4-day (pass 0) over 3-day (pass 1)
    // Within a pass, all valid candidates are equal as per original logic
    return passIndex === 0 ? 100 : 50;
  },
  descriptionFn: (period) => `${period.totalDaysOff}-day long weekend`,
};

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

const weekConfig: StrategyConfig = {
  strategyType: "week",
  periodLengthPasses: [[9, 8, 7]],
  minWeekendDaysInPeriod: () => 2,
  userDaysValidatorFn: (userDaysInCandidate, availableUserHolidays) => {
    return userDaysInCandidate <= availableUserHolidays;
  },
  candidateScoringFn: (candidate) => {
    const holidayDays = candidate.publicDays + candidate.companyDays;
    const efficiency = (holidayDays + candidate.weekendDays) / candidate.length;
    const publicHolidayCluster = candidate.maxConsecutiveHolidays >= 3;
    return (
      efficiency * 100 +
      holidayDays * 10 +
      candidate.weekendDays * 5 +
      (publicHolidayCluster ? 50 : 0) +
      (candidate.length - 7) * 3 -
      candidate.userDays * 3
    );
  },
  descriptionFn: (period, candidateData) => {
    let description = `${period.totalDaysOff}-day week break`;
    if (candidateData.maxConsecutiveHolidays >= 3) {
      description = `${period.totalDaysOff}-day break around public holidays`;
    } else if (period.weekendDays >= 4) {
      description = `${period.totalDaysOff}-day break including multiple weekends`;
    } else if (period.publicHolidaysUsed >= 2) {
      description = `${period.totalDaysOff}-day break with public holidays`;
    }
    return description;
  },
};

const extendedConfig: StrategyConfig = {
  strategyType: "extended",
  periodLengthPasses: [[15, 14, 13, 12, 11, 10]],
  minWeekendDaysInPeriod: () => 4,
  minTotalUserHolidaysRequiredForStrategy: 5,
  userDaysValidatorFn: (userDaysInCandidate, availableUserHolidays) => {
    return userDaysInCandidate <= availableUserHolidays;
  },
  precomputeFn: (input, allHolidaysMap) => {
    const holidayDensityMap = new Map<string, number>();
    const scanWindow = 14;
    const yearNum = Number(input.year);
    const startDateOfYear = new Date(yearNum, 0, 1);
    const endDateOfYear = new Date(yearNum, 11, 31);

    for (
      let d = new Date(startDateOfYear);
      d <= endDateOfYear;
      d.setDate(d.getDate() + 1)
    ) {
      let localDensity = 0;
      for (let i = -scanWindow / 2; i <= scanWindow / 2; i++) {
        const scanDate = new Date(d);
        scanDate.setDate(d.getDate() + i);
        if (scanDate.getFullYear() !== yearNum) continue;
        const scanIso = toIso(scanDate);
        if (allHolidaysMap.has(scanIso)) localDensity += 3;
        else if (isWeekend(scanDate)) localDensity += 1;
      }
      holidayDensityMap.set(toIso(d), localDensity);
    }
    return { holidayDensityMap, yearNum };
  },
  candidateScoringFn: (candidate, passIndex, precomputedData) => {
    const holidayDays = candidate.publicDays + candidate.companyDays;
    const efficiency = (holidayDays + candidate.weekendDays) / candidate.length;

    const yearNum = precomputedData!.yearNum;
    const summerStart = new Date(yearNum, 5, 15);
    const summerEnd = new Date(yearNum, 8, 15);
    const winterStart = new Date(yearNum, 11, 15);
    const endDateOfYear = new Date(yearNum, 11, 31);

    const isSummerPeriod =
      candidate.periodDays[0] >= summerStart &&
      candidate.periodDays[0] <= summerEnd;
    const isWinterPeriod =
      candidate.periodDays[0] >= winterStart &&
      candidate.periodDays[0] <= endDateOfYear;

    const seasonBonus = isSummerPeriod || isWinterPeriod ? 50 : 0;
    const avgDensity = (candidate.totalHolidayDensity || 0) / candidate.length;

    return (
      efficiency * 150 +
      avgDensity * 10 +
      seasonBonus +
      holidayDays * 15 +
      candidate.weekendDays * 7 +
      (candidate.length - 10) * 5 -
      candidate.userDays * 2
    );
  },
  descriptionFn: (period, candidateData, precomputedData) => {
    let description = `${period.totalDaysOff}-day extended break`;
    const yearNum = precomputedData!.yearNum;
    const summerStart = new Date(yearNum, 5, 15);
    const summerEnd = new Date(yearNum, 8, 15);
    const winterStart = new Date(yearNum, 11, 15);
    const endDateOfYear = new Date(yearNum, 11, 31);

    const isSummer =
      period.startDate >= summerStart && period.startDate <= summerEnd;
    const isWinter =
      period.startDate >= winterStart && period.startDate <= endDateOfYear;
    const avgDensity =
      (candidateData.totalHolidayDensity || 0) / period.totalDaysOff;

    if (isSummer) {
      description = `${period.totalDaysOff}-day summer vacation`;
    } else if (isWinter) {
      description = `${period.totalDaysOff}-day winter holiday`;
    } else if (avgDensity > 1.0) {
      description = `${period.totalDaysOff}-day extended break around holidays`;
    } else if (period.weekendDays >= 6) {
      description = `${period.totalDaysOff}-day multi-weekend vacation`;
    }
    return description;
  },
};

// ========== Orchestrator and Strategy Map ==========
const strategyConfigMap: Record<StrategyType, StrategyConfig> = {
  longWeekend: longWeekendConfig,
  midWeek: midWeekConfig,
  week: weekConfig,
  extended: extendedConfig,
};

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
    return []; // Or throw new Error(`Strategy configuration for ${strategyType} not found.`);
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

// Remove the old individual calculate... functions (calculateLongWeekendPeriods, calculateMidweekPeriods, etc.)
// as their logic is now encapsulated in the config objects and processed by executeHolidayStrategy.
// The old strategyMap is also replaced by strategyConfigMap.
// The old buildPeriod function is not directly used; its logic for creating DayOff[] is within executeHolidayStrategy.
