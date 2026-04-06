/**
 * PTO optimizer: segment candidates + DP packing + spacing + remainder fill.
 * Algorithm model inspired by open holiday-optimizer research (year-wide break packing).
 */

import { CompanyHoliday } from "@/context/FormContext";
import { DayOff, HolidayPeriod } from "@/context/FormResultsContext";
import { HolidaysTypes } from "date-holidays";

export type BreakKind = "longWeekend" | "midWeek" | "week" | "extended";

/** User-facing strategy; `balanced` mixes segment types like the reference “balanced mix”. */
export type StrategyType = "balanced" | BreakKind;

type OptimizationStrategy =
  | "balanced"
  | "longWeekends"
  | "miniBreaks"
  | "weekLongBreaks"
  | "extendedVacations";

interface OptimizedDay {
  date: string;
  isWeekend: boolean;
  isPTO: boolean;
  isPartOfBreak: boolean;
  isPublicHoliday: boolean;
  publicHolidayName?: string;
  isCompanyDayOff: boolean;
  companyDayName?: string;
}

interface Break {
  startDate: string;
  endDate: string;
  days: OptimizedDay[];
  totalDays: number;
  ptoDays: number;
  publicHolidays: number;
  weekends: number;
  companyDaysOff: number;
}

interface CandidateSegment {
  startIdx: number;
  endIdx: number;
  totalDays: number;
  ptoUsed: number;
  efficiency: number;
  startDate: string;
  endDate: string;
  segmentDays: OptimizedDay[];
}

const formatDate = (date: Date): string => {
  const yr = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, "0");
  const dy = String(date.getDate()).padStart(2, "0");
  return `${yr}-${mo}-${dy}`;
};

const addDays = (date: Date, days: number): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

const isFixedOff = (day: OptimizedDay): boolean =>
  day.isWeekend || day.isPublicHoliday || day.isCompanyDayOff;

function mapToOptimizationStrategy(strategy: StrategyType): OptimizationStrategy {
  switch (strategy) {
    case "balanced":
      return "balanced";
    case "longWeekend":
      return "longWeekends";
    case "midWeek":
      return "miniBreaks";
    case "week":
      return "weekLongBreaks";
    case "extended":
      return "extendedVacations";
    default:
      return "balanced";
  }
}

const getDynamicSpacing = (opt: OptimizationStrategy): number => {
  switch (opt) {
    case "longWeekends":
      return 7;
    case "miniBreaks":
      return 14;
    case "weekLongBreaks":
      return 21;
    case "extendedVacations":
      return 30;
    case "balanced":
    default:
      return 21;
  }
};

const getStrategyParams = (opt: OptimizationStrategy) => {
  let minBreak: number;
  let maxBreak: number;
  switch (opt) {
    case "longWeekends":
      minBreak = 3;
      maxBreak = 4;
      break;
    case "miniBreaks":
      minBreak = 5;
      maxBreak = 6;
      break;
    case "weekLongBreaks":
      minBreak = 7;
      maxBreak = 9;
      break;
    case "extendedVacations":
      minBreak = 10;
      maxBreak = 15;
      break;
    case "balanced":
    default:
      minBreak = 3;
      maxBreak = 15;
      break;
  }
  return { minBreak, maxBreak };
};

function publicHolidayToRow(h: HolidaysTypes.Holiday): { date: string; name: string } {
  const d = new Date(h.date);
  return { date: formatDate(d), name: h.name || "Public holiday" };
}

function buildCalendar(
  targetYear: number,
  today: Date,
  publicRows: Array<{ date: string; name: string }>,
  companyHolidays: CompanyHoliday[]
): OptimizedDay[] {
  const now = today;
  const startOfYear =
    targetYear === now.getFullYear()
      ? new Date(now.getFullYear(), now.getMonth(), now.getDate())
      : new Date(targetYear, 0, 1);
  const endOfYear = new Date(targetYear, 11, 31);
  const companyRows = companyHolidays.map((c) => ({
    date: formatDate(new Date(c.date)),
    name: c.name,
  }));

  const calendar: OptimizedDay[] = [];
  for (let d = new Date(startOfYear); d <= endOfYear; d = addDays(d, 1)) {
    const dateStr = formatDate(d);
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    let isPublicHoliday = false;
    let publicHolidayName: string | undefined;
    for (const holiday of publicRows) {
      if (holiday.date === dateStr) {
        isPublicHoliday = true;
        publicHolidayName = holiday.name;
        break;
      }
    }

    let isCompanyDayOff = false;
    let companyDayName: string | undefined;
    for (const dayOff of companyRows) {
      if (dayOff.date === dateStr) {
        isCompanyDayOff = true;
        companyDayName = dayOff.name;
        break;
      }
    }

    calendar.push({
      date: dateStr,
      isWeekend,
      isPublicHoliday,
      publicHolidayName,
      isCompanyDayOff,
      companyDayName,
      isPTO: false,
      isPartOfBreak: false,
    });
  }
  return calendar;
}

const generateCandidateSegments = (
  calendar: OptimizedDay[],
  minBreak: number,
  maxBreak: number
): CandidateSegment[] => {
  const candidates: CandidateSegment[] = [];
  const totalDays = calendar.length;
  for (let i = 0; i < totalDays; i++) {
    for (let L = minBreak; L <= maxBreak; L++) {
      if (i + L - 1 >= totalDays) break;
      const segmentDays: OptimizedDay[] = [];
      let ptoUsed = 0;
      for (let j = i; j < i + L; j++) {
        const day = calendar[j];
        if (!isFixedOff(day)) {
          ptoUsed++;
        }
        segmentDays.push(day);
      }
      if (ptoUsed > 0) {
        candidates.push({
          startIdx: i,
          endIdx: i + L - 1,
          totalDays: L,
          ptoUsed,
          efficiency: L / ptoUsed,
          startDate: calendar[i].date,
          endDate: calendar[i + L - 1].date,
          segmentDays: [...segmentDays],
        });
      }
    }
  }
  return candidates;
};

const pruneCandidateSegments = (
  segments: CandidateSegment[],
  availablePTO: number
): CandidateSegment[] => {
  const filtered = segments.filter((seg) => seg.ptoUsed <= availablePTO);
  const grouped = new Map<number, CandidateSegment[]>();
  for (const seg of filtered) {
    const group = grouped.get(seg.startIdx) || [];
    group.push(seg);
    grouped.set(seg.startIdx, group);
  }
  const pruned: CandidateSegment[] = [];
  for (const group of grouped.values()) {
    const nonDominated: CandidateSegment[] = [];
    for (const seg of group) {
      let dominated = false;
      for (const other of group) {
        if (other === seg) continue;
        if (
          other.endIdx >= seg.endIdx &&
          other.ptoUsed <= seg.ptoUsed &&
          other.totalDays >= seg.totalDays
        ) {
          dominated = true;
          break;
        }
      }
      if (!dominated) nonDominated.push(seg);
    }
    pruned.push(...nonDominated);
  }
  pruned.sort((a, b) => a.startIdx - b.startIdx);
  return pruned;
};

const binarySearch = (
  candidates: CandidateSegment[],
  requiredStart: number,
  low: number
): number => {
  let lo = low;
  let hi = candidates.length;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (candidates[mid].startIdx < requiredStart) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }
  return lo;
};

interface DPSolution {
  totalDaysOff: number;
  segments: CandidateSegment[];
  totalPTOUsed: number;
}

const dpExhaustiveSearch = (
  candidates: CandidateSegment[],
  availablePTO: number,
  spacing: number
): DPSolution => {
  const memo = new Map<string, DPSolution>();

  const dp = (idx: number, lastEnd: number, usedPTO: number): DPSolution => {
    if (idx >= candidates.length) {
      return { totalDaysOff: 0, segments: [], totalPTOUsed: 0 };
    }
    const key = `${idx}-${lastEnd}-${usedPTO}`;
    if (memo.has(key)) return memo.get(key)!;

    const requiredStart = lastEnd + spacing;
    const nextIdx = binarySearch(candidates, requiredStart, idx);
    let best: DPSolution = { totalDaysOff: 0, segments: [], totalPTOUsed: 0 };

    for (let i = nextIdx; i < candidates.length; i++) {
      const candidate = candidates[i];
      if (candidate.startIdx < requiredStart) continue;
      if (usedPTO + candidate.ptoUsed > availablePTO) continue;
      const res = dp(i + 1, candidate.endIdx, usedPTO + candidate.ptoUsed);
      const total = candidate.totalDays + res.totalDaysOff;
      if (total > best.totalDaysOff) {
        best = {
          totalDaysOff: total,
          segments: [candidate, ...res.segments],
          totalPTOUsed: candidate.ptoUsed + res.totalPTOUsed,
        };
      }
    }
    memo.set(key, best);
    return best;
  };

  return dp(0, -1, 0);
};

const forceExtendSegments = (
  calendar: OptimizedDay[],
  breaks: Break[],
  remainingPTO: number
): number => {
  const totalDays = calendar.length;
  for (const brk of breaks) {
    let endIdx = calendar.findIndex((day) => day.date === brk.endDate);
    while (remainingPTO > 0 && endIdx < totalDays - 1) {
      const nextDay = calendar[endIdx + 1];
      if (nextDay.isPartOfBreak) break;
      if (!isFixedOff(nextDay)) {
        nextDay.isPTO = true;
        nextDay.isPartOfBreak = true;
        brk.days.push(nextDay);
        brk.totalDays++;
        brk.ptoDays++;
        remainingPTO--;
        endIdx++;
        brk.endDate = nextDay.date;
      } else {
        break;
      }
    }
  }
  return remainingPTO;
};

const addForcedSegments = (calendar: OptimizedDay[], remainingPTO: number): Break[] => {
  const forcedBreaks: Break[] = [];
  const totalDays = calendar.length;
  let i = 0;
  while (i < totalDays && remainingPTO > 0) {
    if (!calendar[i].isPartOfBreak && !isFixedOff(calendar[i])) {
      const forcedSegment: OptimizedDay[] = [];
      while (i < totalDays && !calendar[i].isPartOfBreak && remainingPTO > 0) {
        if (!isFixedOff(calendar[i])) {
          calendar[i].isPTO = true;
          calendar[i].isPartOfBreak = true;
          forcedSegment.push(calendar[i]);
          remainingPTO--;
        }
        i++;
      }
      if (forcedSegment.length > 0) {
        forcedBreaks.push({
          startDate: forcedSegment[0].date,
          endDate: forcedSegment[forcedSegment.length - 1].date,
          days: forcedSegment,
          totalDays: forcedSegment.length,
          ptoDays: forcedSegment.length,
          publicHolidays: forcedSegment.filter((day) => day.isPublicHoliday).length,
          weekends: forcedSegment.filter((day) => day.isWeekend).length,
          companyDaysOff: forcedSegment.filter((day) => day.isCompanyDayOff).length,
        });
      }
    } else {
      i++;
    }
  }
  return forcedBreaks;
};

function runOptimize(
  numberOfDays: number,
  opt: OptimizationStrategy,
  calendar: OptimizedDay[]
): Break[] {
  const { minBreak, maxBreak } = getStrategyParams(opt);
  const spacing = getDynamicSpacing(opt);

  let candidateSegments: CandidateSegment[] = [];
  if (opt === "balanced") {
    candidateSegments.push(...generateCandidateSegments(calendar, 3, 4));
    candidateSegments.push(...generateCandidateSegments(calendar, 5, 6));
    candidateSegments.push(...generateCandidateSegments(calendar, 7, 9));
    candidateSegments.push(...generateCandidateSegments(calendar, 10, 15));
  } else {
    candidateSegments = generateCandidateSegments(calendar, minBreak, maxBreak);
  }
  candidateSegments.sort((a, b) => a.startIdx - b.startIdx);

  candidateSegments = pruneCandidateSegments(candidateSegments, numberOfDays);
  const bestSolution = dpExhaustiveSearch(candidateSegments, numberOfDays, spacing);

  const breaks: Break[] = [];
  for (const seg of bestSolution.segments) {
    for (let idx = seg.startIdx; idx <= seg.endIdx; idx++) {
      calendar[idx].isPartOfBreak = true;
      if (!isFixedOff(calendar[idx])) {
        calendar[idx].isPTO = true;
      }
    }
    breaks.push({
      startDate: seg.startDate,
      endDate: seg.endDate,
      days: seg.segmentDays.slice(),
      totalDays: seg.totalDays,
      ptoDays: seg.ptoUsed,
      publicHolidays: seg.segmentDays.filter((d) => d.isPublicHoliday).length,
      weekends: seg.segmentDays.filter((d) => d.isWeekend).length,
      companyDaysOff: seg.segmentDays.filter((d) => d.isCompanyDayOff).length,
    });
  }

  let usedPTO = breaks.reduce((acc, br) => acc + br.ptoDays, 0);
  let remainingPTO = numberOfDays - usedPTO;
  let prevRemainingPTO = remainingPTO + 1;
  while (remainingPTO > 0 && remainingPTO < prevRemainingPTO) {
    prevRemainingPTO = remainingPTO;
    remainingPTO = forceExtendSegments(calendar, breaks, remainingPTO);
    const forcedBreaks = addForcedSegments(calendar, remainingPTO);
    forcedBreaks.forEach((brk) => breaks.push(brk));
    usedPTO = breaks.reduce((acc, br) => acc + br.ptoDays, 0);
    remainingPTO = numberOfDays - usedPTO;
  }

  breaks.sort((a, b) => a.startDate.localeCompare(b.startDate));
  return breaks;
}

function inferBreakKind(totalDays: number): BreakKind {
  if (totalDays <= 4) return "longWeekend";
  if (totalDays <= 6) return "midWeek";
  if (totalDays <= 9) return "week";
  return "extended";
}

function optimizedDayToDayOff(day: OptimizedDay): DayOff {
  const d = new Date(`${day.date}T12:00:00`);
  if (day.isWeekend) return { date: d, type: "WEEKEND" };
  if (day.isPublicHoliday) {
    return {
      date: d,
      type: "PUBLIC_HOLIDAY",
      name: day.publicHolidayName || "Public holiday",
    };
  }
  if (day.isCompanyDayOff) {
    return {
      date: d,
      type: "COMPANY_HOLIDAY",
      name: day.companyDayName || "Company day",
    };
  }
  return { date: d, type: "USER_HOLIDAY" };
}

function describePeriod(totalDays: number, pto: number, breakKind: BreakKind): string {
  const roi = pto > 0 ? (totalDays / pto).toFixed(1) : totalDays.toFixed(1);
  const kindLabel =
    breakKind === "longWeekend"
      ? "long weekend"
      : breakKind === "midWeek"
        ? "mid-week break"
        : breakKind === "week"
          ? "week-long break"
          : "extended break";
  return `${totalDays}-day ${kindLabel} (${pto} day${pto === 1 ? "" : "s"} used, ${roi}x return)`;
}

function breakToHolidayPeriod(
  br: Break,
  strategyType: StrategyType
): HolidayPeriod {
  const holidays: DayOff[] = br.days.map(optimizedDayToDayOff);
  const breakKind = inferBreakKind(br.totalDays);

  return {
    startDate: new Date(`${br.startDate}T12:00:00`),
    endDate: new Date(`${br.endDate}T12:00:00`),
    holidays,
    type: strategyType,
    breakKind: strategyType === "balanced" ? breakKind : undefined,
    userHolidaysUsed: br.ptoDays,
    publicHolidaysUsed: br.publicHolidays,
    companyHolidaysUsed: br.companyDaysOff,
    weekendDays: br.weekends,
    totalDaysOff: br.totalDays,
    description: describePeriod(br.totalDays, br.ptoDays, breakKind),
  };
}

/**
 * Main entry: compute breaks for a calendar year using the segment + DP optimizer.
 */
export function calculateOptimizedHolidayPeriods(
  strategyType: StrategyType,
  publicHolidays: HolidaysTypes.Holiday[],
  companyHolidays: CompanyHoliday[],
  userHolidayCount: number,
  year: string,
  today?: Date
): HolidayPeriod[] {
  if (userHolidayCount < 1) return [];

  const targetYear = Number(year);
  const now = today ?? new Date();
  const publicRows = publicHolidays.map(publicHolidayToRow);

  const calendar = buildCalendar(targetYear, now, publicRows, companyHolidays);
  const opt = mapToOptimizationStrategy(strategyType);

  const calendarCopy: OptimizedDay[] = calendar.map((d) => ({ ...d }));
  const breaks = runOptimize(userHolidayCount, opt, calendarCopy);

  return breaks.map((b) => breakToHolidayPeriod(b, strategyType));
}
