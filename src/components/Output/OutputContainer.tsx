import { useFormResults } from "@/context/FormResultsContext";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  CalendarDays,
  Info,
  CheckCircle,
  XCircle,
  Loader2,
  Building2,
  ListChecks,
  CheckCircle2,
  Flag as FlagIcon,
  CalendarCheck as CalendarCheckIcon,
  ChartColumn,
  Sparkles, // Added for title icon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import HolidayPeriodCard from "./HolidayPeriodCard";
import OutputCalendarView from "./OutputCalendarView";
import SummaryItem from "./SummaryItem";
import ShareSection from "./ShareSection";
import { trackEvent } from "@/lib/analytics";

export const OutputContainer: React.FC = () => {
  const { state } = useFormResults();
  const { status, calculatedPeriods, formInputState, error } = state;
  const mobileCarouselRef = useRef<HTMLDivElement>(null);
  const [activeMobileCardIndex, setActiveMobileCardIndex] = useState(0);
  const [sortBy, setSortBy] = useState<
    "roi-desc" | "total-desc" | "used-asc" | "date-asc" | "desired-month"
  >("roi-desc");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [minRoiFilter, setMinRoiFilter] = useState<"0" | "1.5" | "2" | "3">("0");
  const [maxDaysUsedFilter, setMaxDaysUsedFilter] = useState<
    "all" | "1" | "2" | "3" | "5"
  >("all");
  const [desiredMonth, setDesiredMonth] = useState<string>("");

  const exportAsIcs = () => {
    if (sortedPeriods.length === 0) return;

    const toUtc = (date: Date) =>
      date
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}Z$/, "Z");

    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Holiday Hacker//EN",
      "CALSCALE:GREGORIAN",
    ];

    sortedPeriods.forEach((period, idx) => {
      const start = new Date(period.startDate);
      const end = new Date(period.endDate);
      end.setDate(end.getDate() + 1); // iCal end is exclusive

      const uid = `holiday-hacker-${start.getTime()}-${idx}@holidayoptimizer.com`;
      lines.push("BEGIN:VEVENT");
      lines.push(`UID:${uid}`);
      lines.push(`DTSTAMP:${toUtc(new Date())}`);
      lines.push(`DTSTART;VALUE=DATE:${toUtc(start).slice(0, 8)}`);
      lines.push(`DTEND;VALUE=DATE:${toUtc(end).slice(0, 8)}`);
      lines.push(
        `SUMMARY:Holiday Hacker plan (${period.totalDaysOff} days off / ${period.userHolidaysUsed} days used)`
      );
      lines.push(
        `DESCRIPTION:${(period.description || "Optimized holiday period").replace(/\n/g, " ")}`
      );
      lines.push("END:VEVENT");
    });

    lines.push("END:VCALENDAR");
    const blob = new Blob([lines.join("\r\n")], {
      type: "text/calendar;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `holiday-hacker-${formInputState.year}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    trackEvent("calendar_exported", {
      export_type: "ics",
      events_exported_count: sortedPeriods.length,
      year: Number(formInputState.year),
    });
  };

  useEffect(() => {
    setActiveMobileCardIndex(0);
  }, [calculatedPeriods.length]);

  const getRoi = (userDays: number, totalDaysOff: number) =>
    userDays > 0 ? totalDaysOff / userDays : totalDaysOff;

  const visiblePeriods = useMemo(() => {
    const minRoi = Number(minRoiFilter);
    const maxDays =
      maxDaysUsedFilter === "all"
        ? Number.POSITIVE_INFINITY
        : Number(maxDaysUsedFilter);

    return calculatedPeriods.filter((period) => {
      const roi = getRoi(period.userHolidaysUsed, period.totalDaysOff);
      return roi >= minRoi && period.userHolidaysUsed <= maxDays;
    });
  }, [calculatedPeriods, maxDaysUsedFilter, minRoiFilter]);

  const sortedPeriods = useMemo(() => {
    const periods = [...visiblePeriods];

    periods.sort((a, b) => {
      if (sortBy === "total-desc") return b.totalDaysOff - a.totalDaysOff;
      if (sortBy === "used-asc") return a.userHolidaysUsed - b.userHolidaysUsed;
      if (sortBy === "date-asc") {
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      }
      if (sortBy === "desired-month" && desiredMonth) {
        const targetMonth = Number(desiredMonth);
        const distance = (date: Date) =>
          Math.min(
            Math.abs(date.getMonth() - targetMonth),
            12 - Math.abs(date.getMonth() - targetMonth)
          );
        return distance(new Date(a.startDate)) - distance(new Date(b.startDate));
      }
      const roiDiff =
        getRoi(b.userHolidaysUsed, b.totalDaysOff) -
        getRoi(a.userHolidaysUsed, a.totalDaysOff);
      if (roiDiff !== 0) return roiDiff;
      return b.totalDaysOff - a.totalDaysOff;
    });

    return periods;
  }, [desiredMonth, sortBy, visiblePeriods]);

  const scenarioCompare = useMemo(() => {
    if (calculatedPeriods.length === 0) return [];
    const getTop = (
      key: "roi-desc" | "total-desc" | "used-asc" | "date-asc",
      label: string
    ) => {
      const list = [...calculatedPeriods];
      list.sort((a, b) => {
        if (key === "total-desc") return b.totalDaysOff - a.totalDaysOff;
        if (key === "used-asc") return a.userHolidaysUsed - b.userHolidaysUsed;
        if (key === "date-asc") {
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        }
        const roiA = getRoi(a.userHolidaysUsed, a.totalDaysOff);
        const roiB = getRoi(b.userHolidaysUsed, b.totalDaysOff);
        return roiB - roiA;
      });
      const period = list[0];
      return {
        key,
        label,
        period,
        roi: getRoi(period.userHolidaysUsed, period.totalDaysOff),
      };
    };

    const candidates = [
      getTop("roi-desc", "Best ROI"),
      getTop("total-desc", "Longest break"),
      getTop("used-asc", "Least PTO used"),
    ];

    const unique = new Map<string, (typeof candidates)[number]>();
    candidates.forEach((c) => {
      const id = `${new Date(c.period.startDate).toISOString()}-${c.period.totalDaysOff}`;
      if (!unique.has(id)) unique.set(id, c);
    });
    return Array.from(unique.values()).slice(0, 3);
  }, [calculatedPeriods]);

  // Initial loading state
  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center mt-10">
        <Loader2 className="h-12 w-12 animate-spin text-theme-5" />
        <p className="mt-4 text-lg text-foreground font-semibold">
          Calculating your optimal holidays...
        </p>
      </div>
    );
  }

  // Idle state
  if (status === "idle") {
    return (
      <Alert variant="default" className="mt-6">
        <Info className="h-4 w-4" />
        <AlertTitle>No Results Yet</AlertTitle>
        <AlertDescription>
          Fill out the form and click "Generate Holidays" to see your optimized
          holiday plan.
        </AlertDescription>
      </Alert>
    );
  }

  // Error state
  if (status === "error") {
    return (
      <Alert variant="destructive" className="mt-6">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Error Generating Results</AlertTitle>
        <AlertDescription>
          {error || "An unexpected error occurred. Please try again."}
        </AlertDescription>
      </Alert>
    );
  }

  // Success state with no results
  if (
    status === "success" &&
    calculatedPeriods.length === 0 &&
    !formInputState
  ) {
    return (
      <Alert variant="default" className="mt-6">
        <CheckCircle className="h-4 w-4" />
        <AlertTitle>No Holiday Periods Generated</AlertTitle>
        <AlertDescription>
          Based on your inputs, no specific holiday periods could be generated.
          You might want to adjust your strategy or available holidays.
        </AlertDescription>
      </Alert>
    );
  }

  // This block now handles success display
  if (status === "success" && calculatedPeriods.length > 0 && formInputState) {
    const totalUserHolidaysUsed = calculatedPeriods.reduce(
      (sum, p) => sum + p.userHolidaysUsed,
      0
    );
    const totalCompanyHolidaysUsed = calculatedPeriods.reduce(
      (sum, p) => sum + p.companyHolidaysUsed,
      0
    );
    const totalPublicHolidaysUsed = calculatedPeriods.reduce(
      (sum, p) => sum + p.publicHolidaysUsed,
      0
    );
    const totalDaysOff = calculatedPeriods.reduce(
      (sum, p) => sum + p.totalDaysOff,
      0
    );
    const overallRoi =
      totalUserHolidaysUsed > 0
        ? (totalDaysOff / totalUserHolidaysUsed).toFixed(1)
        : totalDaysOff.toFixed(1);

    const displayStrategy =
      formInputState?.strategy ||
      calculatedPeriods[0]?.type.replace("_", " ") ||
      "N/A";

    return (
      <div className="mt-2 lg:mt-6 space-y-6">
        <div className="space-y-2 px-6">
          <div className="flex items-center">
            {/* Make sparkles a bit bigger for mobile */}
            <Sparkles className="w-10 h-10 md:w-8 md:h-8 mr-2 text-theme-5" />
            <h1 className="text-2xl md:text-3xl font-black text-foreground">
              Your <span className="text-theme-5">Optimized</span> Holiday Plan
            </h1>
          </div>
          <p className="text-sm md:text-md text-muted-foreground font-medium">
            Your optimized holiday periods are ready. You are getting{" "}
            <span className="font-semibold text-theme-5">{overallRoi} days off</span>{" "}
            per vacation day used.
          </p>
        </div>
        <Card className="border-[3px] border-foreground shadow-[5px_5px_0_0_rgba(0,0,0,0.7)] bg-card">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-foreground flex items-center">
              <ChartColumn className="w-6 h-6 mr-2 text-theme-9/70" />
              <h2 className="text-theme-9/70 text-xl font-bold">
                Optimization Statistics
              </h2>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 text-center">
            <SummaryItem
              label="Total Days Off"
              value={totalDaysOff}
              icon={CheckCircle2}
              valueClassName="theme-9"
              tooltip="The total number of consecutive days you'll be off work, including weekends and all types of holidays."
            />
            <SummaryItem
              label="Public Holidays Used"
              value={totalPublicHolidaysUsed}
              icon={FlagIcon}
              valueClassName="theme-6"
              tooltip="The number of official public holidays that fall within your optimized holiday periods."
            />
            <SummaryItem
              label="Company Holidays Used"
              value={totalCompanyHolidaysUsed}
              icon={Building2}
              valueClassName="theme-8"
              tooltip="The number of company-specific holidays that fall within your optimized holiday periods."
            />
            <SummaryItem
              label="User Holidays Used"
              value={totalUserHolidaysUsed}
              icon={CalendarCheckIcon}
              valueClassName="theme-2"
              tooltip="The number of your personal annual leave days used to create these holiday periods."
            />
            <SummaryItem
              label="Days Per Day Used"
              value={`${overallRoi}x`}
              icon={ChartColumn}
              valueClassName="theme-5"
              tooltip="Your return on vacation days: total days off divided by user holidays used."
            />
            <SummaryItem
              label="Year"
              value={formInputState.year}
              icon={CalendarDays}
              valueClassName="theme-11"
              tooltip="The calendar year for which these holiday optimizations have been calculated."
            />
            <SummaryItem
              label="Strategy"
              value={displayStrategy}
              icon={ListChecks}
              className="capitalize"
              valueClassName="theme-4"
              tooltip="The optimization strategy you selected for generating your holiday periods."
            />
          </CardContent>
        </Card>
        {scenarioCompare.length > 0 && (
          <div className="rounded-2xl border-[3px] border-foreground bg-card p-3">
            <p className="text-sm font-bold text-foreground mb-2">
              Compare recommended scenarios
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {scenarioCompare.map((scenario) => (
                <button
                  key={scenario.label}
                  type="button"
                  onClick={() => {
                    setSortBy(scenario.key);
                    setViewMode("list");
                    trackEvent("recommendation_applied", {
                      scenario: scenario.label,
                      sort_by: scenario.key,
                    });
                  }}
                  className="text-left border-2 border-foreground rounded-xl p-3 bg-background hover:bg-muted/40 transition"
                >
                  <p className="text-xs font-bold text-theme-5">{scenario.label}</p>
                  <p className="text-sm font-semibold text-foreground mt-1">
                    {scenario.period.totalDaysOff} days off / {scenario.period.userHolidaysUsed} used
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ROI {scenario.roi.toFixed(1)}x
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="flex items-center justify-between gap-2">
          <div className="grid grid-cols-2 rounded-xl border-[3px] border-foreground bg-card p-1 w-fit">
            <button
              type="button"
              onClick={() => {
                setViewMode("list");
                trackEvent("results_view_changed", { view: "list" });
              }}
              className={`px-3 py-1.5 text-xs md:text-sm font-semibold rounded-lg border-2 ${
                viewMode === "list"
                  ? "bg-theme-2 border-foreground text-black"
                  : "border-transparent text-foreground"
              }`}
            >
              List view
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode("calendar");
                trackEvent("results_view_changed", { view: "calendar" });
              }}
              className={`px-3 py-1.5 text-xs md:text-sm font-semibold rounded-lg border-2 ${
                viewMode === "calendar"
                  ? "bg-theme-5 border-foreground text-white"
                  : "border-transparent text-foreground"
              }`}
            >
              Calendar view
            </button>
          </div>
          <p className="text-xs font-semibold text-theme-5">
            {sortedPeriods.length} shown
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <select
            value={sortBy}
            onChange={(e) =>
              {
                const value = e.target.value as
                  | "roi-desc"
                  | "total-desc"
                  | "used-asc"
                  | "date-asc"
                  | "desired-month";
                setSortBy(value);
                trackEvent("pto_scenario_compared", { sort_by: value });
              }
            }
            className="text-xs md:text-sm border-2 border-foreground bg-background text-foreground rounded-lg px-2 py-1.5 font-semibold"
          >
            <option value="roi-desc">Sort: Best ROI first</option>
            <option value="total-desc">Sort: Most days off</option>
            <option value="used-asc">Sort: Fewest days used</option>
            <option value="date-asc">Sort: Soonest start date</option>
            <option value="desired-month">Sort: Closest to desired month</option>
          </select>
          <select
            value={desiredMonth}
            onChange={(e) => {
              setDesiredMonth(e.target.value);
              trackEvent("results_filter_changed", {
                desired_month: e.target.value === "" ? "none" : e.target.value,
              });
            }}
            className="text-xs md:text-sm border-2 border-foreground bg-background text-foreground rounded-lg px-2 py-1.5 font-semibold"
          >
            <option value="">Desired month (optional)</option>
            {Array.from({ length: 12 }, (_, idx) => (
              <option key={idx} value={idx}>
                {new Date(2000, idx, 1).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>
          <select
            value={minRoiFilter}
            onChange={(e) => {
              setMinRoiFilter(e.target.value as "0" | "1.5" | "2" | "3");
              trackEvent("results_filter_changed", { min_roi: e.target.value });
            }}
            className="text-xs md:text-sm border-2 border-foreground bg-background text-foreground rounded-lg px-2 py-1.5 font-semibold"
          >
            <option value="0">Filter: Any ROI</option>
            <option value="1.5">Filter: ROI 1.5x+</option>
            <option value="2">Filter: ROI 2x+</option>
            <option value="3">Filter: ROI 3x+</option>
          </select>
          <select
            value={maxDaysUsedFilter}
            onChange={(e) =>
              {
                setMaxDaysUsedFilter(
                  e.target.value as "all" | "1" | "2" | "3" | "5"
                );
                trackEvent("results_filter_changed", {
                  max_days_used: e.target.value,
                });
              }
            }
            className="text-xs md:text-sm border-2 border-foreground bg-background text-foreground rounded-lg px-2 py-1.5 font-semibold"
          >
            <option value="all">Filter: Any days used</option>
            <option value="1">Filter: Max 1 day used</option>
            <option value="2">Filter: Max 2 days used</option>
            <option value="3">Filter: Max 3 days used</option>
            <option value="5">Filter: Max 5 days used</option>
          </select>
        </div>
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={exportAsIcs}
            className="px-3 py-2 text-xs md:text-sm font-bold border-[3px] border-foreground rounded-lg bg-theme-2 text-black active:scale-[0.98]"
          >
            Export to calendar (.ics)
          </button>
        </div>

        {viewMode === "calendar" && (
          <OutputCalendarView periods={sortedPeriods} year={formInputState.year} />
        )}

        {viewMode === "list" && (
          <>
            <div className="mt-2 flex items-center justify-between md:hidden">
              <p className="text-xs font-semibold text-muted-foreground">
                Swipe to browse trip options
              </p>
              <p className="text-xs font-semibold text-theme-5">
                {sortedPeriods.length} options
              </p>
            </div>
            {sortedPeriods.length === 0 ? (
              <div className="rounded-2xl border-2 border-foreground bg-muted/30 p-4">
                <p className="text-sm font-semibold text-foreground">
                  No periods match your filters.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setMinRoiFilter("0");
                    setMaxDaysUsedFilter("all");
                    setDesiredMonth("");
                    setSortBy("roi-desc");
                  }}
                  className="mt-2 px-3 py-1.5 text-xs font-semibold border-2 border-foreground rounded-lg bg-background"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <div
                  ref={mobileCarouselRef}
                  onScroll={() => {
                    const el = mobileCarouselRef.current;
                    if (!el) return;
                    const cardWidth = el.clientWidth * 0.92 + 12;
                    if (cardWidth <= 0) return;
                    const index = Math.round(el.scrollLeft / cardWidth);
                    const boundedIndex = Math.max(
                      0,
                      Math.min(sortedPeriods.length - 1, index)
                    );
                    setActiveMobileCardIndex(boundedIndex);
                  }}
                  className="md:hidden -mx-2 px-2 flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2"
                >
                  {sortedPeriods.map((period, index) => (
                    <div
                      key={index}
                      className="snap-center shrink-0 w-[92%] max-w-[420px]"
                    >
                      <HolidayPeriodCard period={period} />
                    </div>
                  ))}
                </div>
                <div className="md:hidden flex items-center justify-center gap-1.5">
                  {sortedPeriods.map((_, index) => (
                    <span
                      key={`dot-${index}`}
                      className={`h-2 rounded-full transition-all ${
                        activeMobileCardIndex === index
                          ? "w-5 bg-theme-5"
                          : "w-2 bg-muted-foreground/40"
                      }`}
                    />
                  ))}
                </div>
                <div className="hidden md:grid grid-cols-2 gap-4 mt-6">
                  {sortedPeriods.map((period, index) => (
                    <HolidayPeriodCard key={index} period={period} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
        <ShareSection />
      </div>
    );
  }

  return null; // Should not be reached
};

export default OutputContainer;
