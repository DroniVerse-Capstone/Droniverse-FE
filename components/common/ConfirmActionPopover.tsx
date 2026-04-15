"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type ConfirmActionPopoverProps = {
  trigger: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  widthClassName?: string;
  avoidCollisions?: boolean;
  triggerClassName?: string;
};

export default function ConfirmActionPopover({
  trigger,
  title,
  description,
  confirmText = "Xác nhận",
  cancelText = "Đóng",
  isLoading = false,
  onConfirm,
  align = "end",
  side = "bottom",
  sideOffset = 4,
  widthClassName = "w-72",
  avoidCollisions = true,
  triggerClassName,
}: ConfirmActionPopoverProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <span className={cn("inline-flex", triggerClassName)}>{trigger}</span>
      </PopoverTrigger>

      <PopoverContent
        align={align}
        side={side}
        sideOffset={sideOffset}
        avoidCollisions={avoidCollisions}
        className={`${widthClassName} z-150 space-y-3`}
      >
        <div className="space-y-1">
          <p className="text-md font-medium text-greyscale-0">{title}</p>
          {description ? (
            <div className="text-sm text-greyscale-100">{description}</div>
          ) : null}
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            {cancelText}
          </Button>

          <Button
            type="button"
            size="sm"
            disabled={isLoading}
            onClick={() => {
              onConfirm();
            }}
          >
            {isLoading ? <Spinner /> : confirmText}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}