import { useHolidayForm } from "@/context/FormContext";
import { Check, Pen, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { formatDate } from "../../lib/utils";

interface ModifyCompanyHolidaysProps {
  themeColor?: string;
}

export function ModifyCompanyHolidays({
  themeColor,
}: ModifyCompanyHolidaysProps) {
  const [editingHolidayIndex, setEditingHolidayIndex] = useState<number | null>(
    null
  );
  const [editValue, setEditValue] = useState<string>("");
  const { state, updateCompanyHolidays } = useHolidayForm();

  const confirmEdit = (index: number) => {
    if (editingHolidayIndex === index) {
      const updatedHolidays = [...state.companyHolidays];
      updatedHolidays[index] = {
        ...state.companyHolidays[index],
        name: editValue,
      };
      updateCompanyHolidays(updatedHolidays);
      setEditingHolidayIndex(null);
    }
  };

  const cancelEdit = () => {
    setEditingHolidayIndex(null);
  };

  const resetCompanyHolidays = () => {
    updateCompanyHolidays([]);
  };

  if (state.companyHolidays.length === 0) return;
  return (
    <>
      <div className="flex items-center justify-between">
        <label className="text-sm font-normal">
          You've selected
          <span className={`text-${themeColor} mx-1`}>
            {state.companyHolidays?.length}
          </span>
          Company Holiday{state.companyHolidays?.length > 1 ? "s" : ""}
        </label>
        <Button
          variant="link"
          className="cursor-pointer text-red-700 outline text-sm font-normal"
          onClick={(e) => {
            e.preventDefault();
            resetCompanyHolidays();
          }}
        >
          <Trash2 className="w-3 h-3 " />
          <span>Delete all</span>
        </Button>
      </div>
      <div className="rounded-md border p-4 mt-2">
        <ul className="space-y-2">
          {state.companyHolidays.map((holiday, index) => (
            <li
              key={holiday.date.getTime()}
              className="flex items-center justify-between rounded-md border p-2"
            >
              <div>
                {editingHolidayIndex === index ? (
                  // Editing mode
                  <div className="flex items-center">
                    <input
                      type="text"
                      autoFocus
                      value={editValue}
                      placeholder="Enter Company Holiday Name"
                      className="border-b border-muted-foreground focus:border-theme-8 focus:outline-none bg-transparent text-xs font-medium py-1"
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          confirmEdit(index);
                        } else if (e.key === "Escape") {
                          e.preventDefault();
                          cancelEdit();
                        }
                      }}
                    />
                    <button
                      className="text-green-600 hover:text-green-700 P-1 cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        confirmEdit(index);
                      }}
                      title="Save"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-700 p-1 cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        cancelEdit();
                      }}
                      title="Cancel"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  // Display mode
                  <div
                    className="flex items-center  cursor-pointer text-xs font-medium group"
                    onClick={() => {
                      setEditingHolidayIndex(index);
                      setEditValue(holiday.name);
                    }}
                  >
                    <div className="border-b border-transparent hover:border-gray-300">
                      <span>{holiday.name || "Click to add name"}</span>
                      <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Pen className="inline h-3 w-3 pb-0.5" />
                      </span>
                    </div>
                  </div>
                )}
                <span className="text-xs text-muted-foreground">
                  {formatDate(new Date(holiday.date))}
                </span>
              </div>
              <Button
                variant="link"
                className="cursor-pointer text-red-700 outline text-sm font-normal ml-auto"
                onClick={(e) => {
                  e.preventDefault();
                  updateCompanyHolidays(
                    state.companyHolidays.filter((h) => h.date !== holiday.date)
                  );
                }}
              >
                <Trash2 className="w-3 h-3 " />
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
