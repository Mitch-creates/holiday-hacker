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

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}
function isSameYear(date: Date, year: number): boolean {
  return date.getFullYear() === year;
}
function toIso(date: Date) {
  return date.toISOString().slice(0, 10);
}

// ========== Strategy Implementations ==========
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

  return allHolidaysMap;
}

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

  interface Candidate {
    periodDays: Date[];
    userDays: number;
    publicDays: number;
    companyDays: number;
    weekendDays: number;
    holidayDays: number;
  }

  const candidates: Candidate[] = [];

  // 1) Gather all 6- and 5-day windows
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    for (const length of [6, 5] as const) {
      const periodDays = Array.from({ length }, (_, i) => {
        const day = new Date(d);
        day.setDate(d.getDate() + i);
        return day;
      });

      // must fit in year & be at/after today
      if (periodDays[length - 1] > end) continue;
      if (periodDays[length - 1] < now) continue;
      if (periodDays.some((day) => day.getFullYear() !== yearNum)) continue;

      // require exactly 2 weekend days (Sat + Sun)
      const weekendDays = periodDays.filter(isWeekend).length;
      if (weekendDays !== 2) continue;

      // count user vs holiday days
      let userDays = 0,
        publicDays = 0,
        companyDays = 0;
      for (const day of periodDays) {
        const iso = toIso(day);
        const hol = allHolidaysMap.get(iso);
        if (hol?.type === "PUBLIC_HOLIDAY") publicDays++;
        else if (hol?.type === "COMPANY_HOLIDAY") companyDays++;
        else if (!isWeekend(day)) userDays++;
      }

      candidates.push({
        periodDays,
        userDays,
        publicDays,
        companyDays,
        weekendDays,
        holidayDays: publicDays + companyDays,
      });
    }
  }

  // 2) Sort: fewest userDays → most holidayDays → longer period → earliest start
  candidates.sort((a, b) => {
    if (a.userDays !== b.userDays) return a.userDays - b.userDays;
    if (a.holidayDays !== b.holidayDays) return b.holidayDays - a.holidayDays;
    if (a.periodDays.length !== b.periodDays.length)
      return b.periodDays.length - a.periodDays.length;
    return a.periodDays[0].getTime() - b.periodDays[0].getTime();
  });

  // 3) Greedily select non-overlapping windows
  for (const c of candidates) {
    if (c.userDays > availableUserHolidays) continue;
    if (c.periodDays.some((day) => usedDates.has(toIso(day)))) continue;

    // build DayOff[]
    const holidays: DayOff[] = c.periodDays.map((day) => {
      const iso = toIso(day);
      const hol = allHolidaysMap.get(iso);
      if (hol) return hol;
      if (isWeekend(day)) return { date: day, type: "WEEKEND" };
      return { date: day, type: "USER_HOLIDAY" };
    });

    results.push({
      startDate: c.periodDays[0],
      endDate: c.periodDays[c.periodDays.length - 1],
      holidays,
      type: "midWeek",
      userHolidaysUsed: c.userDays,
      publicHolidaysUsed: c.publicDays,
      companyHolidaysUsed: c.companyDays,
      weekendDays: c.weekendDays,
      totalDaysOff: c.periodDays.length,
    });

    c.periodDays.forEach((day) => usedDates.add(toIso(day)));
    availableUserHolidays -= c.userDays;
    if (availableUserHolidays <= 0) break;
  }

  return results;
}

// ========== Placeholders for other strategies ==========

function calculateWeekPeriods(input: StrategyInput): HolidayPeriod[] {
  // TODO: implement like above, for 7–9 day periods, maximize weekends/public/company holidays, minimize user holidays
  return [];
}
function calculateExtendedPeriods(input: StrategyInput): HolidayPeriod[] {
  // TODO: implement for 10–15 day periods
  return [];
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
