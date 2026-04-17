"use client";

import Image from "next/image";
import React from "react";
import { AppBarChart } from "@/components/chart";
import EmptyState from "@/components/common/EmptyState";
import { Spinner } from "@/components/ui/spinner";
import type { AdminClubRankingData } from "@/validations/dashboard/dashboard";
import { FaBookBookmark } from "react-icons/fa6";

type TopOption = 5 | 10 | 15;

type SystemAdminClubRankingSectionProps = {
  rankingData?: AdminClubRankingData;
  selectedTop: TopOption;
  onSelectTop: (top: TopOption) => void;
  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  errorMessage?: string;
  formatVND: (value: number) => string;
};

const TOP_OPTIONS = [5, 10, 15] as const;

export default function SystemAdminClubRankingSection({
  rankingData,
  selectedTop,
  onSelectTop,
  isLoading = false,
  isFetching = false,
  isError = false,
  errorMessage,
  formatVND,
}: SystemAdminClubRankingSectionProps) {
  const clubRankingChartData = React.useMemo(() => {
    return (rankingData?.clubs ?? []).map((club) => ({
      clubName: club.nameVN,
      clubShortName: club.nameVN.length > 20 ? `${club.nameVN.slice(0, 20)}...` : club.nameVN,
      totalSpent: club.totalSpent,
    }));
  }, [rankingData]);

  const maxClubSpent = React.useMemo(() => {
    return Math.max(1, ...(rankingData?.clubs ?? []).map((club) => club.totalSpent));
  }, [rankingData]);

  return (
    <section>
      <article className="rounded border border-greyscale-700 bg-greyscale-900/60 p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-greyscale-0">Bảng xếp hạng CLB chi tiêu</h3>
            <p className="mt-1 text-sm text-greyscale-300">
              Xếp hạng theo số tiền mua khóa học trên toàn hệ thống
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
            title="Không tải được dữ liệu xếp hạng CLB"
            description={errorMessage || "Vui lòng thử lại sau."}
          />
        ) : (rankingData?.clubs?.length ?? 0) === 0 ? (
          <EmptyState
            title="Chưa có dữ liệu câu lạc bộ"
            description="Dữ liệu sẽ hiển thị khi có giao dịch mua khóa học từ các CLB."
          />
        ) : (
          <div className="space-y-4">
            <div className="h-96 rounded border border-greyscale-700 bg-greyscale-950/60 p-2">
              <AppBarChart
                data={clubRankingChartData}
                layout="horizontal"
                xDataKey="clubShortName"
                yDataKey="totalSpent"
                className="h-full"
                barRadius={[6, 6, 0, 0]}
                barColors={["#38BDF8", "#60A5FA", "#A78BFA", "#F472B6", "#FB7185"]}
                yTickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`}
                tooltipFormatter={(value) => [formatVND(Number(value)), "Chi tiêu"]}
                tooltipLabelFormatter={(_, payload) =>
                  (payload as { 0?: { payload?: { clubName?: string } } })?.[0]?.payload
                    ?.clubName || "Câu lạc bộ"
                }
              />
            </div>

            <div className="space-y-3">
                <h3 className="text-lg font-semibold text-greyscale-0">Danh sách CLB</h3>
              {rankingData?.clubs?.map((club, index) => {
                return (
                  <div
                    key={club.clubID}
                    className="rounded border border-greyscale-700 bg-greyscale-950/70 p-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/15 text-xs font-semibold text-primary">
                        #{index + 1}
                      </div>

                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded border border-greyscale-700">
                        <Image
                          src={club.imageUrl || "/images/club-placeholder.jpg"}
                          alt={club.nameVN}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="line-clamp-1 text-sm font-semibold text-greyscale-0">
                            {club.nameVN}
                          </p>
                          <p className="text-xs font-semibold text-secondary">
                            {formatVND(club.totalSpent)}
                          </p>
                        </div>
                        <p className="text-xs text-greyscale-100">
                          {club.clubCode} • {club.transactionCount} giao dịch
                        </p>

                        {club.courses.length > 0 ? (
                          <div className="mt-2 flex items-center gap-2">
                            <FaBookBookmark size={14} className="text-tertiary" />
                            <div className="flex -space-x-2">
                              {club.courses.slice(0, 3).map((course) => (
                                <div
                                  key={course.courseId}
                                  className="relative h-6 w-6 overflow-hidden rounded-full border border-greyscale-800"
                                >
                                  <Image
                                    src={course.imageUrl || "/images/club-placeholder.jpg"}
                                    alt={course.courseNameVN}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </article>
    </section>
  );
}
