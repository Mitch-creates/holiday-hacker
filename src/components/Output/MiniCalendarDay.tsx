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
        className={`flex items-center justify-center p-0.5 text-xs font-medium ${style.text}`}
      >
        {day.type === "WEEKDAY_HEADER" ? day.name : ""}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center p-0.5 border rounded-sm aspect-square ${
        style.bg
      } ${style.text} transition-all duration-150 ease-in-out text-xs ${
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
      <span className="font-medium">{date.getDate()}</span>
    </div>
  );
};

export default MiniCalendarDay;
