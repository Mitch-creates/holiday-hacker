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

type StrategyFn = (input: StrategyInput) => HolidayPeriod[];

// ========== Generic Orchestrator ==========

export function calculateOptimizedHolidayPeriods(
  strategy: StrategyType,
  publicHolidays: HolidaysTypes.Holiday[],
  companyHolidays: CompanyHoliday[],
  userHolidayCount: number,
  year: string,
  today?: Date
): HolidayPeriod[] {
  const strategyFn = strategyMap[strategy];
  return strategyFn({
    publicHolidays,
    companyHolidays,
    userHolidayCount,
    year,
    today,
  });
}

const strategyMap: Record<StrategyType, StrategyFn> = {
  longWeekend: calculateLongWeekendPeriods,
  midWeek: calculateMidweekPeriods,
  week: calculateWeekPeriods,
  extended: calculateExtendedPeriods,
};

// ========== Helpers ==========

function toIso(date: Date) {
  return date.toISOString().slice(0, 10);
}

// This is the main function that will be called for the long weekend strategy
// Map both public and company holidays to a holiday
// First get all longWeekends where the user can take 4 days off while only needing to use 1 user holiday
// For the remaining user holidays, get all long weekends where the user can take 3 days off while only needing to use 1 user holiday
// A longweekend either starts on a Thursday, Friday, or Saturday.
// A holiday can be either a thursday, friday, monday or tuesday
// A holiday period is either 3 or 4 days long
// TODO: Currently this method makes a long weekend from FRI/SAT/SUN/MON when a holiday is on MON. Maybe we should change this eventually to make that into a SAT/SUN/MON/TUE instead.
function calculateLongWeekendPeriods(input: StrategyInput): HolidayPeriod[] {
  const { publicHolidays, companyHolidays, userHolidayCount, year, today } =
    input;
  let availableUserHolidays = userHolidayCount;
  const results: HolidayPeriod[] = [];
  const usedDates = new Set<string>();

  // single source of holiday truth
  const allHolidaysMap = combineHolidays(publicHolidays, companyHolidays);

  const yearNum = Number(year);
  const start = new Date(yearNum, 0, 1);
  const end = new Date(yearNum, 11, 31);
  const now = today ?? new Date();

  const isWeekend = (date: Date) => [0, 6].includes(date.getDay());
  const toIso = (date: Date) => date.toISOString().split("T")[0];

  // Helper: scan the calendar for 'length'-day blocks that cost exactly 1 user holiday
  function collectPeriods(length: 3 | 4) {
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      // only Thu(4), Fri(5), Sat(6) can be the first day of a long-weekend
      if (![4, 5, 6].includes(d.getDay())) continue;
      if (d < now) continue;
      if (results.length >= 15) return; // limit to 15 periods

      // build the candidate window
      const periodDays: Date[] = [];
      for (let i = 0; i < length; i++) {
        const day = new Date(d);
        day.setDate(d.getDate() + i);
        periodDays.push(day);
      }

      // must stay in the same calendar year
      if (periodDays[length - 1].getFullYear() !== yearNum) continue;
      // no overlap with already-booked periods
      if (periodDays.some((day) => usedDates.has(toIso(day)))) continue;

      // count how many are pure “user” days
      let userDays = 0;
      for (const day of periodDays) {
        const iso = toIso(day);
        if (!allHolidaysMap.has(iso) && !isWeekend(day)) {
          userDays++;
        }
      }
      if (userDays !== 1 || userDays > availableUserHolidays) continue;

      // build the DayOff[] for this period
      const holidays: DayOff[] = periodDays.map((day) => {
        const iso = toIso(day);
        const hol = allHolidaysMap.get(iso);
        if (hol) return hol;
        if (isWeekend(day)) return { date: day, type: "WEEKEND" };
        return { date: day, type: "USER_HOLIDAY" };
      });

      // tally up public/company/weekend
      const publicDays = holidays.filter(
        (h) => h.type === "PUBLIC_HOLIDAY"
      ).length;
      const companyDays = holidays.filter(
        (h) => h.type === "COMPANY_HOLIDAY"
      ).length;
      const weekendDays = holidays.filter((h) => h.type === "WEEKEND").length;

      // record it
      results.push({
        startDate: periodDays[0],
        endDate: periodDays[length - 1],
        holidays,
        type: "longWeekend",
        userHolidaysUsed: userDays,
        publicHolidaysUsed: publicDays,
        companyHolidaysUsed: companyDays,
        weekendDays,
        totalDaysOff: length,
      });

      // mark days as used and spend the user holiday
      periodDays.forEach((day) => usedDates.add(toIso(day)));
      availableUserHolidays -= userDays;
      if (availableUserHolidays <= 0) return;
    }
  }

  // 1) carve out all possible 4-day long weekends with 1 user holiday
  collectPeriods(4);
  // 2) then any 3-day weekends with 1 user holiday
  collectPeriods(3);

  return results;
}

function combineHolidays(
  publicHolidays: HolidaysTypes.Holiday[],
  companyHolidays: CompanyHoliday[]
) {
  const allHolidaysMap = new Map<string, DayOff>();

  // First add public holidays
  for (const ph of publicHolidays) {
    const date = new Date(ph.date);
    allHolidaysMap.set(toIso(date), {
      date: date,
      type: "PUBLIC_HOLIDAY",
      name: ph.name,
    });
  }

  // Then add company holidays (these could override public holidays if same date)
  for (const ch of companyHolidays) {
    allHolidaysMap.set(toIso(new Date(ch.date)), {
      date: new Date(ch.date),
      type: "COMPANY_HOLIDAY",
      name: ch.name,
    });
  }

  return purgeWeekends(allHolidaysMap);
}
// Delete weekends from the holidays map
function purgeWeekends(holidays: Map<string, DayOff>): Map<string, DayOff> {
  holidays.forEach((holiday, key) => {
    const date = new Date(holiday.date);
    if (date.getDay() === 0 || date.getDay() === 6) {
      holidays.delete(key);
    }
  });
  return holidays;
}

// This is the main function that will be called for the midweek strategy
// Map both public and company holidays to a holiday
// First get all midweek periods where the user can take 6 days off while only needing to use 2 or less user holidays, if any
// For the remaining user holidays, get all midweek periods where the user can take 5 days off while only needing to use 1 user holiday
// A midweek period is a 5 or 6-day period that has at least 2 weekend days
// It shouldn't start on a monday or end on a friday
// A holiday can be either a monday, tuesday, wednesday, thursday, or friday
// If there is no 6 day period available, at least create one, even if it costs 3 user holidays
// Calculate periods until all userHolidays have been used up
function calculateMidweekPeriods(input: StrategyInput): HolidayPeriod[] {
  const { publicHolidays, companyHolidays, userHolidayCount, year, today } =
    input;
  let availableUserHolidays = userHolidayCount;
  const results: HolidayPeriod[] = [];
  const usedDates = new Set<string>();
  const allHolidaysMap = combineHolidays(publicHolidays, companyHolidays);

  const yearNum = Number(year);
  const start = new Date(yearNum, 0, 1);
  const end = new Date(yearNum, 11, 31);
  const now = today ?? new Date();

  const toIso = (d: Date) => d.toISOString().slice(0, 10);
  const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

  // Continue finding periods until all user holidays are used or no more valid periods exist
  while (availableUserHolidays > 0) {
    interface Candidate {
      periodDays: Date[];
      userDays: number;
      publicDays: number;
      companyDays: number;
      weekendDays: number;
      holidayDays: number;
      length: number;
      score: number; // Higher is better
    }

    const candidates: Candidate[] = [];

    // 1) Gather all 6- and 5-day windows
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();

      // Shouldn't start on a Monday (1)
      if (dayOfWeek === 1) continue;

      for (const length of [6, 5] as const) {
        const periodDays = Array.from({ length }, (_, i) => {
          const day = new Date(d);
          day.setDate(d.getDate() + i);
          return day;
        });

        // Must fit in year & be at/after today
        if (periodDays[length - 1] > end) continue;
        if (periodDays[0] < now) continue;
        if (periodDays.some((day) => day.getFullYear() !== yearNum)) continue;

        // Shouldn't end on a Friday (5)
        if (periodDays[length - 1].getDay() === 5) continue;

        // Must have exactly 2 weekend days (Sat + Sun)
        const weekendDaysCount = periodDays.filter(isWeekend).length;
        if (weekendDaysCount !== 2) continue;

        // No overlap with already-booked periods
        if (periodDays.some((day) => usedDates.has(toIso(day)))) continue;

        // Process each day once based on priority
        const processedDates = new Set<string>();
        let userDays = 0,
          publicDays = 0,
          companyDays = 0,
          weekendDays = 0;

        for (const day of periodDays) {
          const iso = toIso(day);

          // Skip if already processed
          if (processedDates.has(iso)) continue;

          // Priority: Public Holiday > Company Holiday > Weekend > User Holiday
          if (allHolidaysMap.has(iso)) {
            const holiday = allHolidaysMap.get(iso)!;
            if (holiday.type === "PUBLIC_HOLIDAY") publicDays++;
            else if (holiday.type === "COMPANY_HOLIDAY") companyDays++;
          } else if (isWeekend(day)) {
            weekendDays++;
          } else {
            userDays++;
          }

          processedDates.add(iso);
        }

        // Skip if this period uses more holidays than available
        if (userDays > availableUserHolidays) continue;

        // Calculate score - prioritize periods with most holiday coverage and least user days
        const holidayDays = publicDays + companyDays;
        const score =
          holidayDays * 10 +
          weekendDays * 5 -
          userDays * 3 +
          (length === 6 ? 2 : 0);

        candidates.push({
          periodDays,
          userDays,
          publicDays,
          companyDays,
          weekendDays,
          holidayDays,
          length,
          score,
        });
      }
    }

    // If no candidates found, break the loop
    if (candidates.length === 0) break;

    // Sort by score (best periods first)
    candidates.sort((a, b) => b.score - a.score);

    // Select the best candidate
    const bestCandidate = candidates[0];

    // Build DayOff[] with proper classification priority
    const holidays: DayOff[] = [];
    const processedDates = new Set<string>();

    for (const day of bestCandidate.periodDays) {
      const iso = toIso(day);

      // Skip if already processed
      if (processedDates.has(iso)) continue;

      // Priority: Public Holiday > Company Holiday > Weekend > User Holiday
      if (allHolidaysMap.has(iso)) {
        holidays.push(allHolidaysMap.get(iso)!);
      } else if (isWeekend(day)) {
        holidays.push({ date: day, type: "WEEKEND" });
      } else {
        holidays.push({ date: day, type: "USER_HOLIDAY" });
      }

      processedDates.add(iso);
    }

    // Create the period
    results.push({
      startDate: bestCandidate.periodDays[0],
      endDate: bestCandidate.periodDays[bestCandidate.periodDays.length - 1],
      holidays,
      type: "midWeek",
      userHolidaysUsed: bestCandidate.userDays,
      publicHolidaysUsed: bestCandidate.publicDays,
      companyHolidaysUsed: bestCandidate.companyDays,
      weekendDays: bestCandidate.weekendDays,
      totalDaysOff: bestCandidate.periodDays.length,
      description: `${bestCandidate.length}-day midweek break`,
    });

    // Mark days as used
    bestCandidate.periodDays.forEach((day) => usedDates.add(toIso(day)));

    // Update remaining user holidays
    availableUserHolidays -= bestCandidate.userDays;
  }

  // Sort results by date
  results.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  return results;
}

// ========== Placeholders for other strategies ==========

function calculateWeekPeriods(input: StrategyInput): HolidayPeriod[] {
  const { publicHolidays, companyHolidays, userHolidayCount, year, today } =
    input;
  let availableUserHolidays = userHolidayCount;
  const results: HolidayPeriod[] = [];
  const usedDates = new Set<string>();
  const allHolidaysMap = combineHolidays(publicHolidays, companyHolidays);

  const yearNum = Number(year);
  const start = new Date(yearNum, 0, 1);
  const end = new Date(yearNum, 11, 31);
  const now = today ?? new Date();

  const toIso = (d: Date) => d.toISOString().slice(0, 10);
  const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

  // Continue finding periods until all user holidays are used
  while (availableUserHolidays > 0) {
    interface Candidate {
      periodDays: Date[];
      userDays: number;
      publicDays: number;
      companyDays: number;
      weekendDays: number;
      length: number;
      score: number;
      publicHolidayCluster: boolean; // Preference for periods with clustered holidays
    }

    const candidates: Candidate[] = [];

    // Look for 7-9 day periods
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      // Consider periods starting on any day (more flexible than long weekends/midweek)
      for (const length of [9, 8, 7] as const) {
        const periodDays = Array.from({ length }, (_, i) => {
          const day = new Date(d);
          day.setDate(d.getDate() + i);
          return day;
        });

        // Basic validations
        if (periodDays[length - 1] > end) continue;
        if (periodDays[0] < now) continue;
        if (periodDays.some((day) => day.getFullYear() !== yearNum)) continue;
        if (periodDays.some((day) => usedDates.has(toIso(day)))) continue;

        // Count day types
        const processedDates = new Set<string>();
        let userDays = 0,
          publicDays = 0,
          companyDays = 0,
          weekendDays = 0;
        let consecutiveHolidays = 0;
        let maxConsecutiveHolidays = 0;

        for (const day of periodDays) {
          const iso = toIso(day);

          // Skip if already processed
          if (processedDates.has(iso)) continue;

          if (allHolidaysMap.has(iso)) {
            const holiday = allHolidaysMap.get(iso)!;
            if (holiday.type === "PUBLIC_HOLIDAY") {
              publicDays++;
              consecutiveHolidays++;
            } else if (holiday.type === "COMPANY_HOLIDAY") {
              companyDays++;
              consecutiveHolidays++;
            }
          } else if (isWeekend(day)) {
            weekendDays++;
            // Weekends also count toward consecutive "free" days
            consecutiveHolidays++;
          } else {
            userDays++;
            consecutiveHolidays = 0;
          }

          // Track max consecutive holiday/weekend streak
          maxConsecutiveHolidays = Math.max(
            maxConsecutiveHolidays,
            consecutiveHolidays
          );

          processedDates.add(iso);
        }

        // Skip if too many user days required
        if (userDays > availableUserHolidays) continue;

        // Week periods should have at least 2 weekend days
        if (weekendDays < 2) continue;

        // Calculate score - reward efficiency and holiday clusters
        const holidayDays = publicDays + companyDays;
        const efficiency = (holidayDays + weekendDays) / length;
        const publicHolidayCluster = maxConsecutiveHolidays >= 3;

        // Score formula prioritizes:
        // 1. Periods with more holidays and weekends (efficiency)
        // 2. Periods with clustered holidays (consecutive days off without using vacation)
        // 3. Longer periods (within 7-9 day range)
        const score =
          efficiency * 100 +
          holidayDays * 10 +
          weekendDays * 5 +
          (publicHolidayCluster ? 50 : 0) +
          (length - 7) * 3 -
          userDays * 3;

        candidates.push({
          periodDays,
          userDays,
          publicDays,
          companyDays,
          weekendDays,
          length,
          score,
          publicHolidayCluster,
        });
      }
    }

    // If no candidates found, break the loop
    if (candidates.length === 0) break;

    // Sort by score (best periods first)
    candidates.sort((a, b) => b.score - a.score);

    // Select the best candidate
    const bestCandidate = candidates[0];

    // Build DayOff[] with proper classification priority
    const holidays: DayOff[] = [];
    const processedDates = new Set<string>();

    for (const day of bestCandidate.periodDays) {
      const iso = toIso(day);

      // Skip if already processed
      if (processedDates.has(iso)) continue;

      if (allHolidaysMap.has(iso)) {
        holidays.push(allHolidaysMap.get(iso)!);
      } else if (isWeekend(day)) {
        holidays.push({ date: day, type: "WEEKEND" });
      } else {
        holidays.push({ date: day, type: "USER_HOLIDAY" });
      }

      processedDates.add(iso);
    }

    // Create descriptive name based on period features
    let description = `${bestCandidate.length}-day week break`;

    if (bestCandidate.publicHolidayCluster) {
      description = `${bestCandidate.length}-day break around public holidays`;
    } else if (bestCandidate.weekendDays >= 4) {
      description = `${bestCandidate.length}-day break including multiple weekends`;
    } else if (bestCandidate.publicDays >= 2) {
      description = `${bestCandidate.length}-day break with public holidays`;
    }

    // Create the period
    results.push({
      startDate: bestCandidate.periodDays[0],
      endDate: bestCandidate.periodDays[bestCandidate.periodDays.length - 1],
      holidays,
      type: "week",
      userHolidaysUsed: bestCandidate.userDays,
      publicHolidaysUsed: bestCandidate.publicDays,
      companyHolidaysUsed: bestCandidate.companyDays,
      weekendDays: bestCandidate.weekendDays,
      totalDaysOff: bestCandidate.periodDays.length,
      description,
    });

    // Mark days as used
    bestCandidate.periodDays.forEach((day) => usedDates.add(toIso(day)));

    // Update remaining user holidays
    availableUserHolidays -= bestCandidate.userDays;
  }

  // Sort results by date
  results.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  return results;
}

function calculateExtendedPeriods(input: StrategyInput): HolidayPeriod[] {
  const { publicHolidays, companyHolidays, userHolidayCount, year, today } =
    input;
  let availableUserHolidays = userHolidayCount;
  const results: HolidayPeriod[] = [];
  const usedDates = new Set<string>();
  const allHolidaysMap = combineHolidays(publicHolidays, companyHolidays);

  const yearNum = Number(year);
  const start = new Date(yearNum, 0, 1);
  const end = new Date(yearNum, 11, 31);
  const now = today ?? new Date();

  const toIso = (d: Date) => d.toISOString().slice(0, 10);
  const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

  // Find popular vacation periods
  const summerStart = new Date(yearNum, 5, 15); // June 15
  const summerEnd = new Date(yearNum, 8, 15); // September 15
  const winterStart = new Date(yearNum, 11, 15); // December 15
  const winterEnd = new Date(yearNum + 1, 0, 15); // January 15

  // Create a map of holiday density to find clusters
  const holidayDensityMap = new Map<string, number>();
  const scanWindow = 14; // 2 weeks scan window

  // Scan through the year to find holiday clusters
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    let localDensity = 0;
    for (let i = -scanWindow / 2; i <= scanWindow / 2; i++) {
      const scanDate = new Date(d);
      scanDate.setDate(d.getDate() + i);
      const scanIso = toIso(scanDate);

      // Count public/company holidays and weekends
      if (allHolidaysMap.has(scanIso)) localDensity += 3;
      else if (isWeekend(scanDate)) localDensity += 1;
    }
    holidayDensityMap.set(toIso(d), localDensity);
  }

  // Try to find periods near popular vacation times and holiday clusters
  while (availableUserHolidays >= 5) {
    // Need at least 5 user holidays for extended break
    interface Candidate {
      periodDays: Date[];
      userDays: number;
      publicDays: number;
      companyDays: number;
      weekendDays: number;
      length: number;
      score: number;
      isSummerPeriod: boolean;
      isWinterPeriod: boolean;
      holidayDensity: number;
    }

    const candidates: Candidate[] = [];

    // Try different lengths, prioritizing longer periods
    for (const length of [15, 14, 13, 12, 11, 10] as const) {
      // Need enough user days available
      const minRequiredUser = Math.max(0, length - 6); // Assuming at least ~6 weekend/holiday days
      if (minRequiredUser > availableUserHolidays) continue;

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const periodDays = Array.from({ length }, (_, i) => {
          const day = new Date(d);
          day.setDate(d.getDate() + i);
          return day;
        });

        // Basic validations
        if (periodDays[length - 1] > end) continue;
        if (periodDays[0] < now) continue;
        if (periodDays.some((day) => usedDates.has(toIso(day)))) continue;

        // Count day types
        const processedDates = new Set<string>();
        let userDays = 0,
          publicDays = 0,
          companyDays = 0,
          weekendDays = 0;
        let totalHolidayDensity = 0;

        for (const day of periodDays) {
          const iso = toIso(day);

          // Skip if already processed
          if (processedDates.has(iso)) continue;

          // Add to holiday density score
          totalHolidayDensity += holidayDensityMap.get(iso) || 0;

          if (allHolidaysMap.has(iso)) {
            const holiday = allHolidaysMap.get(iso)!;
            if (holiday.type === "PUBLIC_HOLIDAY") {
              publicDays++;
            } else if (holiday.type === "COMPANY_HOLIDAY") {
              companyDays++;
            }
          } else if (isWeekend(day)) {
            weekendDays++;
          } else {
            userDays++;
          }

          processedDates.add(iso);
        }

        // Skip if too many user days required
        if (userDays > availableUserHolidays) continue;

        // Extended periods should have at least 4 weekend days (2 weekends)
        if (weekendDays < 4) continue;

        // Check if this period is in popular vacation seasons
        const isSummerPeriod =
          periodDays[0] >= summerStart && periodDays[0] <= summerEnd;
        const isWinterPeriod =
          (periodDays[0] >= winterStart && periodDays[0] <= end) ||
          (periodDays[length - 1] >= start &&
            periodDays[length - 1] <= winterEnd);

        // Calculate average holiday density
        const avgDensity = totalHolidayDensity / length;

        // Score formula priorities:
        // 1. Efficiency (ratio of "free" days to total days)
        // 2. Holiday density (clusters of holidays/weekends)
        // 3. Popular vacation periods
        // 4. Length of period
        const efficiency = (publicDays + companyDays + weekendDays) / length;
        const seasonBonus = isSummerPeriod || isWinterPeriod ? 50 : 0;

        const score =
          efficiency * 150 +
          avgDensity * 10 +
          seasonBonus +
          publicDays * 15 +
          companyDays * 10 +
          weekendDays * 7 +
          (length - 10) * 5 -
          userDays * 2;

        candidates.push({
          periodDays,
          userDays,
          publicDays,
          companyDays,
          weekendDays,
          length,
          score,
          isSummerPeriod,
          isWinterPeriod,
          holidayDensity: avgDensity,
        });
      }
    }

    // If no candidates found, break the loop
    if (candidates.length === 0) break;

    // Sort by score (best periods first)
    candidates.sort((a, b) => b.score - a.score);

    // Select the best candidate
    const bestCandidate = candidates[0];

    // Build DayOff[] with proper classification priority
    const holidays: DayOff[] = [];
    const processedDates = new Set<string>();

    for (const day of bestCandidate.periodDays) {
      const iso = toIso(day);

      // Skip if already processed
      if (processedDates.has(iso)) continue;

      if (allHolidaysMap.has(iso)) {
        holidays.push(allHolidaysMap.get(iso)!);
      } else if (isWeekend(day)) {
        holidays.push({ date: day, type: "WEEKEND" });
      } else {
        holidays.push({ date: day, type: "USER_HOLIDAY" });
      }

      processedDates.add(iso);
    }

    // Create descriptive name based on period features
    let description = `${bestCandidate.length}-day extended break`;

    if (bestCandidate.isSummerPeriod) {
      description = `${bestCandidate.length}-day summer vacation`;
    } else if (bestCandidate.isWinterPeriod) {
      description = `${bestCandidate.length}-day winter holiday`;
    } else if (bestCandidate.holidayDensity > 10) {
      description = `${bestCandidate.length}-day extended break around holidays`;
    } else if (bestCandidate.weekendDays >= 6) {
      description = `${bestCandidate.length}-day multi-weekend vacation`;
    }

    // Create the period
    results.push({
      startDate: bestCandidate.periodDays[0],
      endDate: bestCandidate.periodDays[bestCandidate.periodDays.length - 1],
      holidays,
      type: "extended",
      userHolidaysUsed: bestCandidate.userDays,
      publicHolidaysUsed: bestCandidate.publicDays,
      companyHolidaysUsed: bestCandidate.companyDays,
      weekendDays: bestCandidate.weekendDays,
      totalDaysOff: bestCandidate.periodDays.length,
      description,
    });

    // Mark days as used
    bestCandidate.periodDays.forEach((day) => usedDates.add(toIso(day)));

    // Update remaining user holidays
    availableUserHolidays -= bestCandidate.userDays;
  }

  // Sort results by date
  results.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  return results;
}

// ========== Helper for Building Periods ==========

function buildPeriod(
  days: Date[],
  allHolidaysMap: Map<string, DayOff>,
  userIdx: number[],
  weekendIdx: number[],
  type: StrategyType,
  description: string = ""
): HolidayPeriod {
  const holidays: DayOff[] = [];

  for (let i = 0; i < days.length; i++) {
    const day = days[i];
    const iso = toIso(day);

    // First check if it's a holiday (public or company)
    if (allHolidaysMap.has(iso)) {
      holidays.push(allHolidaysMap.get(iso)!);
    }
    // Then check if it's a user holiday
    else if (userIdx.includes(i)) {
      holidays.push({ date: day, type: "USER_HOLIDAY" });
    }
    // Finally check if it's a weekend
    else if (
      day.getDay() === 0 ||
      day.getDay() === 6 ||
      weekendIdx.includes(i)
    ) {
      holidays.push({ date: day, type: "WEEKEND" });
    }
  }

  return {
    startDate: days[0],
    endDate: days[days.length - 1],
    holidays: holidays,
    type,
    userHolidaysUsed: holidays.filter((h) => h.type === "USER_HOLIDAY").length,
    publicHolidaysUsed: holidays.filter((h) => h.type === "PUBLIC_HOLIDAY")
      .length,
    companyHolidaysUsed: holidays.filter((h) => h.type === "COMPANY_HOLIDAY")
      .length,
    weekendDays: holidays.filter((h) => h.type === "WEEKEND").length,
    totalDaysOff: holidays.length,
    description: description || `${days.length}-day period`,
  };
}
