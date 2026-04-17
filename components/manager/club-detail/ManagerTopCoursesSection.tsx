"use client";

import React from "react";
import Image from "next/image";

import { AppBarChart } from "@/components/chart";
import EmptyState from "@/components/common/EmptyState";
import { Spinner } from "@/components/ui/spinner";
import type { ClubExpenseByCourseItem } from "@/validations/dashboard/dashboard";

const TOP_OPTIONS = [5, 10, 15] as const;

type ManagerTopCoursesSectionProps = {
  byCourseSeries: ClubExpenseByCourseItem[];
  formatVND: (value: number) => string;
  selectedTop: (typeof TOP_OPTIONS)[number];
  onSelectTop: (top: (typeof TOP_OPTIONS)[number]) => void;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
};

const topBarColors = [
  "#34D399",
  "#2DD4BF",
  "#22D3EE",
  "#38BDF8",
  "#60A5FA",
  "#818CF8",
  "#A78BFA",
  "#C084FC",
  "#F472B6",
  "#FB7185",
];

export default function ManagerTopCoursesSection({
  byCourseSeries,
  formatVND,
  selectedTop,
  onSelectTop,
  isLoading = false,
  isError = false,
  errorMessage,
}: ManagerTopCoursesSectionProps) {
  const topCourseChartData = React.useMemo(() => {
    return byCourseSeries.map((item, index) => ({
      rank: index + 1,
      courseName: item.courseInfo.courseNameVN,
      imageUrl: item.courseInfo.imageUrl || "/images/club-placeholder.jpg",
      revenue: item.revenue,
    }));
  }, [byCourseSeries]);

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
    [],
  );

  return (
    <section>
      <article className="rounded border border-greyscale-700 bg-linear-to-br from-greyscale-900/80 via-greyscale-900/70 to-greyscale-950/90 p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-greyscale-0">
              Top khóa học có chi phí cao nhất
            </h3>
            <p className="mt-1 text-sm text-greyscale-300">
              Chọn số lượng khóa học muốn xem theo chi phí đã mua
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

        {isLoading ? (
          <div className="flex h-90 items-center justify-center rounded border border-greyscale-700 bg-greyscale-950/60">
            <Spinner className="h-5 w-5" />
          </div>
        ) : isError ? (
          <div className="mt-3">
            <EmptyState
              title="Không tải được dữ liệu khóa học"
              description={errorMessage || "Vui lòng thử lại sau."}
            />
          </div>
        ) : byCourseSeries.length === 0 ? (
          <div className="mt-3">
            <EmptyState
              title="Chưa có dữ liệu khóa học"
              description="Dữ liệu sẽ xuất hiện khi có giao dịch mua khóa học."
            />
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-12">
            <div className="h-90 rounded border border-greyscale-700 bg-greyscale-950/60 p-2 xl:col-span-7">
              <AppBarChart
                data={topCourseChartData}
                layout="vertical"
                xDataKey="revenue"
                yDataKey="imageUrl"
                className="h-full"
                yAxisWidth={84}
                customYAxisTick={renderCourseImageTick}
                barRadius={[0, 6, 6, 0]}
                barColors={topBarColors}
                xTickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`}
                tooltipFormatter={(value) => [formatVND(Number(value)), "Chi phí"]}
                tooltipLabelFormatter={(_, payload) =>
                  (payload as { 0?: { payload?: { courseName?: string } } })?.[0]
                    ?.payload?.courseName || "Khóa học"
                }
              />
            </div>

            <div className="space-y-2 xl:col-span-5">
              {byCourseSeries.slice(0, Math.min(5, selectedTop)).map((item, index) => (
                <div
                  key={item.courseInfo.courseId}
                  className="rounded border border-greyscale-700 bg-greyscale-950/70 p-2.5"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/15 text-xs font-semibold text-primary">
                      #{index + 1}
                    </div>
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded border border-greyscale-700">
                      <Image
                        src={item.courseInfo.imageUrl || "/images/club-placeholder.jpg"}
                        alt={item.courseInfo.courseNameVN}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-xs font-semibold text-greyscale-0">
                        {item.courseInfo.courseNameVN}
                      </p>
                      <p className="text-xs text-greyscale-300">{formatVND(item.revenue)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </article>
    </section>
  );
}
