import { ReactNode } from "react";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Label } from "@radix-ui/react-label";

interface StepBoxProps {
  stepIcon?: ReactNode;
  title: string;
  label: string;
  tooltip: string;
  children: ReactNode;
  themeColor1: string;
  themeColor2: string;
}

export function FormStepBox({
  stepIcon,
  title,
  tooltip,
  label,
  children,
  themeColor1,
  themeColor2,
}: StepBoxProps) {
  return (
    <div className="border p-4 rounded-2xl shadow-sm mb-6 bg-white space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {stepIcon && <div>{stepIcon}</div>}
          <div className={`text-sm font-semibold text-${themeColor2}`}>
            {title}
          </div>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className={`w-4 h-4 text-${themeColor2} cursor-pointer`} />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-sm">
              {tooltip}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="text-sm font-normal text-muted-foreground mb-4">
        {label}
      </div>
      <div>{children}</div>
    </div>
  );
}
