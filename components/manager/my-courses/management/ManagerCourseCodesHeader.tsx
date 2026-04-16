"use client";

import React from "react";
import Image from "next/image";

import ConfirmActionPopover from "@/components/common/ConfirmActionPopover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import type { CodeProfitType } from "@/validations/code/code";

type ManagerCourseCodesHeaderProps = {
  courseName: string;
  courseImageUrl?: string | null;
  remainingCodes: number;
  totalCodes: number;
  isSummaryLoading: boolean;
  quantity: string;
  onQuantityChange: (value: string) => void;
  onGenerateCodes: () => void;
  isGeneratingCodes: boolean;
  profitType: CodeProfitType;
  onConfirmProfitTypeChange: (value: CodeProfitType) => void;
  isUpdatingProfitType: boolean;
};

const PROFIT_OPTIONS: Array<{
  value: CodeProfitType;
  label: string;
  description: string;
}> = [
  {
    value: "PROFIT",
    label: "Có lợi nhuận",
    description: "Khóa học cho phép câu lạc bộ thu lợi nhuận.",
  },
  {
    value: "NONPROFIT",
    label: "Phi lợi nhuận",
    description: "Khóa học chỉ phục vụ cộng đồng, không thu lợi nhuận.",
  },
];

export default function ManagerCourseCodesHeader({
  courseName,
  courseImageUrl,
  remainingCodes,
  totalCodes,
  isSummaryLoading,
  quantity,
  onQuantityChange,
  onGenerateCodes,
  isGeneratingCodes,
  profitType,
  onConfirmProfitTypeChange,
  isUpdatingProfitType,
}: ManagerCourseCodesHeaderProps) {
  return (
    <section className="space-y-4 rounded border border-greyscale-700 bg-greyscale-900/70 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative h-28 w-36 overflow-hidden rounded border border-greyscale-700">
            <Image
              src={courseImageUrl || "/images/club-placeholder.jpg"}
              alt={courseName}
              fill
              className="object-cover"
            />
          </div>

          <div className="min-w-0 space-y-3">
            <h3 className="line-clamp-2 text-xl font-semibold text-greyscale-0">
              {courseName}
            </h3>
            <span
              className={`inline-flex rounded border-2 px-2 py-1 text-xs font-medium
    ${
      profitType === "PROFIT"
        ? "border-green-500 bg-green-500/15 text-green-600"
        : "border-orange-400 bg-orange-400/15 text-orange-500"
    }`}
            >
              {profitType === "PROFIT" ? "Có lợi nhuận" : "Phi lợi nhuận"}
            </span>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 lg:w-auto">
          <div className="rounded border border-greyscale-700 bg-greyscale-800/70 px-3 py-2">
            <p className="text-xs text-greyscale-50">Mã còn lại</p>
            {isSummaryLoading ? (
              <Spinner className="mt-1 h-4 w-4" />
            ) : (
              <p className="text-lg font-semibold text-primary">
                {remainingCodes}/{totalCodes}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={1}
              value={quantity}
              onChange={(event) => onQuantityChange(event.target.value)}
              placeholder="Nhập số lượng mã"
              className="w-full sm:w-52"
            />
            <Button onClick={onGenerateCodes} disabled={isGeneratingCodes || remainingCodes === 0}>
              {isGeneratingCodes ? "Đang tạo..." : "Tạo mã"}
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-2 rounded border border-greyscale-700 bg-greyscale-800/40 p-3">
        <p className="text-sm font-medium text-greyscale-0">
          Cấu hình lợi nhuận
        </p>
        <div className="flex flex-wrap gap-2">
          {PROFIT_OPTIONS.map((option) => {
            const isActive = option.value === profitType;

            const triggerButton = (
              <Button
                type="button"
                variant={isActive ? "secondary" : "outline"}
                disabled={isUpdatingProfitType}
                className={cn(
                  "min-w-40",
                )}
              >
                {option.label}
              </Button>
            );

            if (isActive) {
              return <div key={option.value}>{triggerButton}</div>;
            }

            return (
              <ConfirmActionPopover
                key={option.value}
                trigger={triggerButton}
                title="Xác nhận đổi loại lợi nhuận"
                description={option.description}
                confirmText="Xác nhận"
                cancelText="Hủy"
                isLoading={isUpdatingProfitType}
                onConfirm={() => onConfirmProfitTypeChange(option.value)}
                align="start"
                side="bottom"
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

export type { ManagerCourseCodesHeaderProps };
