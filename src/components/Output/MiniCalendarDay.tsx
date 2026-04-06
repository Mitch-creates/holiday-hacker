import { DayOff } from "@/context/FormResultsContext";
import { getDayTypeStyle } from "@/lib/utils"; // Updated import path

interface MiniCalendarDayProps {
  day:
    | DayOff
    | { date: Date; type: "OUT_OF_PERIOD" | "WEEKDAY_HEADER"; name?: string };
  isHeader?: boolean;
}

const MiniCalendarDay: React.FC<MiniCalendarDayProps> = ({ day, isHeader }) => {
  const style = getDayTypeStyle(day.type);
  const date = new Date(day.date);
  const isOutOfPeriod = day.type === "OUT_OF_PERIOD";
  const isActiveDay = !isOutOfPeriod && !isHeader;

  if (isHeader) {
    return (
      <div
        className={`flex items-center justify-center py-1 text-[10px] md:text-xs font-semibold ${style.text}`}
      >
        {day.type === "WEEKDAY_HEADER" ? day.name : ""}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center p-1 border rounded-md min-h-7 md:min-h-6 aspect-square ${
        style.bg
      } ${style.text} transition-all duration-150 ease-in-out text-[11px] md:text-xs ${
        isActiveDay ? "hover:shadow-md cursor-pointer" : "opacity-50"
      } ${isOutOfPeriod ? "pointer-events-none" : ""}`}
      title={
        isActiveDay
          ? `${style.label}${
              (day.type === "PUBLIC_HOLIDAY" ||
                day.type === "COMPANY_HOLIDAY") &&
              day.name
                ? ": " + day.name
                : ""
            } - ${date.toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}`
          : undefined
      }
    >
      <span className="font-semibold">{date.getDate()}</span>
    </div>
  );
};

export default MiniCalendarDay;
