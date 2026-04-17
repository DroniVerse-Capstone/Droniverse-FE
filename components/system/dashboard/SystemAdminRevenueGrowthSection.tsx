"use client";

import React from "react";

import { AppAreaChart } from "@/components/chart";
import EmptyState from "@/components/common/EmptyState";
import { Spinner } from "@/components/ui/spinner";
import type { AdminRevenueGrowthData } from "@/validations/dashboard/dashboard";

type SystemAdminRevenueGrowthSectionProps = {
  growthData?: AdminRevenueGrowthData;
  selectedMonths: 6 | 12 | 24;
  onSelectMonths: (months: 6 | 12 | 24) => void;
  isLoading?: boolean;
  isFetching?: boolean;
  formatVND: (value: number) => string;
};

const MONTH_OPTIONS = [6, 12, 24] as const;

export default function SystemAdminRevenueGrowthSection({
  growthData,
  selectedMonths,
  onSelectMonths,
  isLoading = false,
  isFetching = false,
  formatVND,
}: SystemAdminRevenueGrowthSectionProps) {
  const growthRate = growthData?.growthRate ?? 0;
  const isGrowthPositive = growthRate >= 0;

  const growthChartData = React.useMemo(() => {
    return (growthData?.revenueGrowth ?? []).map((item) => ({
      monthLabel: new Date(item.month).toLocaleDateString("vi-VN", {
        month: "2-digit",
        year: "2-digit",
      }),
      value: item.value,
    }));
  }, [growthData]);

  return (
    <section className="rounded border border-greyscale-700 bg-greyscale-900/60 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-greyscale-0">
            Tăng trưởng doanh thu hệ thống
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <p className="text-sm text-greyscale-300">Theo tháng trong {selectedMonths} tháng gần nhất</p>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                isGrowthPositive
                  ? "border border-secondary/40 bg-secondary/15 text-secondary"
                  : "border border-primary/40 bg-primary/15 text-primary"
              }`}
            >
              {isGrowthPositive ? "+" : ""}
              {growthRate.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="inline-flex rounded border border-greyscale-700 bg-greyscale-950/70 p-1">
          {MONTH_OPTIONS.map((month) => {
            const isActive = selectedMonths === month;
            return (
              <button
                key={month}
                type="button"
                onClick={() => onSelectMonths(month)}
                className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-secondary/20 text-secondary"
                    : "text-greyscale-300 hover:bg-greyscale-800"
                }`}
              >
                {month} tháng
              </button>
            );
          })}
        </div>
      </div>

      {isLoading || isFetching ? (
        <div className="flex h-86 items-center justify-center rounded border border-greyscale-700 bg-greyscale-950/60">
          <Spinner className="h-5 w-5" />
        </div>
      ) : growthChartData.length === 0 ? (
        <EmptyState
          title="Chưa có dữ liệu tăng trưởng"
          description="Dữ liệu sẽ hiển thị khi hệ thống có giao dịch doanh thu."
        />
      ) : (
        <div className="h-78 rounded border border-greyscale-700 bg-greyscale-950/60 p-2 md:h-86">
          <AppAreaChart
            data={growthChartData}
            xDataKey="monthLabel"
            yDataKey="value"
            className="h-full"
            gradientId="adminRevenueGrowth"
            strokeColor="#15A7FA"
            yTickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`}
            tooltipFormatter={(value) => [formatVND(Number(value)), "Doanh thu"]}
            tooltipLabelFormatter={(label) => `Tháng ${String(label)}`}
          />
        </div>
      )}
    </section>
  );
}
