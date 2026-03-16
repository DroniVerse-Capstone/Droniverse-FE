"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type ConfirmActionPopoverProps = {
  trigger: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  align?: "start" | "center" | "end";
  widthClassName?: string;
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
  widthClassName = "w-72",
}: ConfirmActionPopoverProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>

      <PopoverContent align={align} className={`${widthClassName} space-y-3`}>
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
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            {cancelText}
          </Button>

          <Button
            type="button"
            disabled={isLoading}
            onClick={() => {
              onConfirm();
            }}
          >
            {isLoading ? "Đang xử lý..." : confirmText}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}