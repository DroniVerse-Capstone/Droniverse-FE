"use client";

import { AppAreaChart } from "@/components/chart";
import EmptyState from "@/components/common/EmptyState";

type GrowthChartPoint = {
  monthLabel: string;
  value: number;
};

type ManagerExpenseGrowthSectionProps = {
  growthChartData: GrowthChartPoint[];
  totalValue: number;
  growthRate: number;
  formatVND: (value: number) => string;
};

export default function ManagerExpenseGrowthSection({
  growthChartData,
  totalValue,
  growthRate,
  formatVND,
}: ManagerExpenseGrowthSectionProps) {
  const isGrowthPositive = growthRate > 0;
  const isGrowthNegative = growthRate < 0;
  const growthLabel = isGrowthPositive
    ? `↑ Tăng ${Math.abs(growthRate).toFixed(1)}%`
    : isGrowthNegative
      ? `↓ Giảm ${Math.abs(growthRate).toFixed(1)}%`
      : "→ Ổn định 0.0%";

  return (
    <section>
      <article className="rounded border border-greyscale-700 bg-greyscale-900/60 p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-greyscale-0">
            Tăng trưởng chi phí theo tháng
          </h3>
          <div className="flex flex-col items-start gap-1.5 rounded border border-greyscale-700 bg-greyscale-950/70 px-3 py-2">
            <p className="text-[12px] font-medium tracking-wide text-greyscale-100 uppercase">
              Tổng chi phí
            </p>
            <div className="flex items-center gap-2">
                 <p className="text-sm font-semibold text-greyscale-25">
              {formatVND(totalValue)}
            </p>
            <span
              className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${
                isGrowthPositive
                  ? "bg-warning/20 text-warning"
                  : isGrowthNegative
                    ? "bg-primary/20 text-primary"
                    : "bg-greyscale-700/70 text-greyscale-200"
              }`}
            >
              {growthLabel}
            </span>
            </div>
           
          </div>
        </div>

        {growthChartData.length === 0 ? (
          <EmptyState
            title="Chưa có dữ liệu tăng trưởng"
            description="Dữ liệu sẽ xuất hiện khi câu lạc bộ có giao dịch."
          />
        ) : (
          <div className="h-78 rounded border border-greyscale-700 bg-greyscale-950/60 p-2 md:h-86">
            <AppAreaChart
              data={growthChartData}
              xDataKey="monthLabel"
              yDataKey="value"
              className="h-full"
              gradientId="growthGradient"
              strokeColor="#15A7FA"
              yTickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`}
              tooltipFormatter={(value) => [formatVND(Number(value)), "Chi phí"]}
              tooltipLabelFormatter={(label) => `Tháng ${String(label)}`}
            />
          </div>
        )}
      </article>
    </section>
  );
}
