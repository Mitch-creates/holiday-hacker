import React from "react";

interface SummaryItemProps {
  label: string;
  value: string | number;
  icon?: React.ElementType;
  className?: string;
  valueClassName?: string;
}

const SummaryItem: React.FC<SummaryItemProps> = ({
  label,
  value,
  icon: Icon,
  className,
  valueClassName,
}) => (
  <div
    className={`flex flex-col items-center justify-center p-3 ${
      valueClassName ? `bg-${valueClassName}/20` : ""
    } rounded-lg shadow ${className || ""}`}
  >
    {Icon && <Icon className={`w-5 h-5 mb-1 text-${valueClassName}`} />}
    <span className="text-xs text-slate-500">{label}</span>
    <span
      className={`text-md font-semibold text-slate-700 text-${
        valueClassName || ""
      }`}
    >
      {value}
    </span>
  </div>
);

export default SummaryItem;
