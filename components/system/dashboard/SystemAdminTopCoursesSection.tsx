"use client";

import React from "react";

import { AppBarChart } from "@/components/chart";
import EmptyState from "@/components/common/EmptyState";
import { Spinner } from "@/components/ui/spinner";
import type { AdminRevenueByCourseData } from "@/validations/dashboard/dashboard";

type TopOption = 5 | 10 | 15;

type SystemAdminTopCoursesSectionProps = {
  byCourseData?: AdminRevenueByCourseData;
  selectedTop: TopOption;
  onSelectTop: (top: TopOption) => void;
  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  errorMessage?: string;
  formatVND: (value: number) => string;
};

const TOP_OPTIONS = [5, 10, 15] as const;

export default function SystemAdminTopCoursesSection({
  byCourseData,
  selectedTop,
  onSelectTop,
  isLoading = false,
  isFetching = false,
  isError = false,
  errorMessage,
  formatVND,
}: SystemAdminTopCoursesSectionProps) {
  const byCourseChartData = React.useMemo(() => {
    return (byCourseData?.revenueByCourse ?? []).map((item) => ({
      courseName: item.courseInfo.courseNameVN,
      imageUrl: item.courseInfo.imageUrl || "/images/club-placeholder.jpg",
      revenue: item.revenue,
    }));
  }, [byCourseData]);

  const renderCourseImageTick = React.useCallback(
    (props: { x?: number; y?: number; payload?: { value?: string } }) => {
      const x = props.x ?? 0;
      const y = props.y ?? 0;
      const imageUrl = props.payload?.value || "/images/club-placeholder.jpg";

      return (
        <g transform={`translate(${x},${y})`}>
          <rect
            x={-32}
            y={-20}
            width={40}
            height={40}
            rx={10}
            fill="#0F1216"
            stroke="#4A4F55"
          />
          <image
            href={imageUrl}
            x={-30}
            y={-18}
            width={36}
            height={36}
            preserveAspectRatio="xMidYMid slice"
          />
        </g>
      );
    },
    []
  );

  return (
    <section>
      <article className="rounded border border-greyscale-700 bg-linear-to-br from-greyscale-900/80 via-greyscale-900/70 to-greyscale-950/90 p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-greyscale-0">
              Top khóa học doanh thu cao
            </h3>
            <p className="mt-1 text-sm text-greyscale-300">
              Theo tổng doanh thu toàn hệ thống
            </p>
          </div>

          <div className="inline-flex rounded border border-greyscale-700 bg-greyscale-950/70 p-1">
            {TOP_OPTIONS.map((top) => {
              const isActive = selectedTop === top;
              return (
                <button
                  key={top}
                  type="button"
                  onClick={() => onSelectTop(top)}
                  className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-secondary/20 text-secondary"
                      : "text-greyscale-300 hover:bg-greyscale-800"
                  }`}
                >
                  Top {top}
                </button>
              );
            })}
          </div>
        </div>

        {isLoading || isFetching ? (
          <div className="flex h-90 items-center justify-center rounded border border-greyscale-700 bg-greyscale-950/60">
            <Spinner className="h-5 w-5" />
          </div>
        ) : isError ? (
          <EmptyState
            title="Không tải được dữ liệu khóa học"
            description={errorMessage || "Vui lòng thử lại sau."}
          />
        ) : byCourseChartData.length === 0 ? (
          <EmptyState
            title="Chưa có dữ liệu khóa học"
            description="Dữ liệu sẽ hiển thị khi có doanh thu khóa học."
          />
        ) : (
          <div className="h-90 rounded border border-greyscale-700 bg-greyscale-950/60 p-2">
            <AppBarChart
              data={byCourseChartData}
              layout="vertical"
              xDataKey="revenue"
              yDataKey="imageUrl"
              className="h-full"
              yAxisWidth={84}
              customYAxisTick={renderCourseImageTick}
              barRadius={[0, 6, 6, 0]}
              barColors={["#34D399", "#22D3EE", "#60A5FA", "#A78BFA", "#FB7185"]}
              xTickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`}
              tooltipFormatter={(value) => [formatVND(Number(value)), "Doanh thu"]}
              tooltipLabelFormatter={(_, payload) =>
                (payload as { 0?: { payload?: { courseName?: string } } })?.[0]
                  ?.payload?.courseName || "Khóa học"
              }
            />
          </div>
        )}
      </article>
    </section>
  );
}
