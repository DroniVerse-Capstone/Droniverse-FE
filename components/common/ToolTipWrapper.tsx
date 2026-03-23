import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import React from "react";

interface TooltipWrapperProps {
  label: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}

export default function TooltipWrapper({
  label,
  children,
  side = "top",
  align = "center",
}: TooltipWrapperProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent side={side} align={align}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}