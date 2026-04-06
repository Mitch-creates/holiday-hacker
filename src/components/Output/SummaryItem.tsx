import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SummaryItemProps {
  label: string;
  value: string | number;
  icon?: React.ElementType;
  className?: string;
  valueClassName?: string; // e.g., "theme-9"
  tooltip?: string;
}

const SummaryItem: React.FC<SummaryItemProps> = ({
  label,
  value,
  icon: Icon,
  className,
  valueClassName,
  tooltip,
}) => (
  <TooltipProvider>
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <div
          className={`flex flex-col items-center justify-center p-3 ${
            valueClassName ? `bg-${valueClassName}/20` : "bg-muted/60"
          } rounded-lg shadow ${className || ""} cursor-default`} // Added cursor-default
        >
          {Icon && (
            <Icon
              className={`w-5 h-5 mb-1 pointer-events-none ${
                valueClassName ? `text-${valueClassName}` : "text-muted-foreground"
              }`}
            />
          )}
          <span className="text-xs text-muted-foreground pointer-events-none">
            {label}
          </span>
          <span
            className={`text-md font-semibold pointer-events-none ${
              valueClassName ? `text-${valueClassName}` : "text-foreground"
            }`}
          >
            {value}
          </span>
        </div>
      </TooltipTrigger>
      {tooltip && (
        <TooltipContent
          side="top"
          className="bg-foreground text-background p-2 rounded-md text-xs max-w-xs shadow-lg"
        >
          <p>{tooltip}</p>
        </TooltipContent>
      )}
    </Tooltip>
  </TooltipProvider>
);

export default SummaryItem;
