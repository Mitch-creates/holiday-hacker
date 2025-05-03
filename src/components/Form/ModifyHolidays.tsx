import { Button } from "@/components/ui/button";
import { RefreshCcw, Trash2 } from "lucide-react";
import { HolidaysTypes } from "date-holidays";
import { formatDate } from "@/lib/utils";
import { useMemo } from "react";
import { useHolidayForm } from "@/context/FormContext";

interface ModifyHolidaysProps {
  onRefreshClick?: () => void;
  onDeleteHoliday?: (holiday: HolidaysTypes.Holiday) => void;
  themeColor?: string;
}

export function ModifyHolidays({
  themeColor = "theme-6",
}: ModifyHolidaysProps) {
  // Derive the modifiable holidays from the rawHolidays and deletedHolidays
  const { state, deleteHoliday, resetHolidays } = useHolidayForm();
  const { rawHolidays, deletedHolidays } = state;
  const modifiableHolidays: HolidaysTypes.Holiday[] = useMemo(() => {
    return rawHolidays.filter(
      (holiday) => !deletedHolidays.includes(holiday.date)
    );
  }, [rawHolidays, deletedHolidays]);

  return (
    <div className="space-y-2">
      <div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-normal">
            Automatically Detected
            <span className={`text-${themeColor} mx-1`}>
              {modifiableHolidays?.length}
            </span>
            Holidays
          </label>
          <Button
            variant="link"
            className="cursor-pointer text-amber-600 outline text-sm font-normal"
            onClick={(e) => {
              e.preventDefault();
              resetHolidays();
            }}
          >
            <RefreshCcw className="w-3 h-3 " /> <span>Refresh</span>
          </Button>
        </div>
        <p className="text-muted-foreground text-xs font-normal mb-2">
          These holidays are automatically detected based on your country and
          State/Region selection.
        </p>
        {modifiableHolidays.length > 0 && (
          <div className="rounded-md border p-4">
            <ul className="space-y-2">
              {modifiableHolidays?.map((holiday) => (
                <li
                  key={holiday.name}
                  className="flex items-center justify-between rounded-md border p-2"
                >
                  <div>
                    <div className="text-xs font-medium">{holiday.name}</div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(new Date(holiday.date))}
                    </span>
                  </div>
                  <Button
                    variant="link"
                    className="cursor-pointer text-amber-600 outline text-sm font-normal ml-auto"
                    onClick={(e) => {
                      e.preventDefault();
                      deleteHoliday(holiday.date);
                    }}
                  >
                    <Trash2 className="w-3 h-3 " />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
