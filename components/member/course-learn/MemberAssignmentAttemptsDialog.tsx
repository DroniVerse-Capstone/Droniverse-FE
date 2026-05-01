"use client";

import React from "react";

import AssignmentStatusBadge from "@/components/common/AssignmentStatusBadge";
import EmptyState from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useGetUserAssignmentAttempts } from "@/hooks/learning/useUserLearning";
import { formatDateTime } from "@/lib/utils/format-date";
import { useLocale } from "@/providers/i18n-provider";

type MemberAssignmentAttemptsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enrollmentId: string;
  assignmentId: string;
};

const PAGE_SIZE = 5;

export default function MemberAssignmentAttemptsDialog({
  open,
  onOpenChange,
  enrollmentId,
  assignmentId,
}: MemberAssignmentAttemptsDialogProps) {
  const locale = useLocale();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [selectedAttempt, setSelectedAttempt] = React.useState<
    | (NonNullable<
        ReturnType<typeof useGetUserAssignmentAttempts>["data"]
      > extends {
        data: infer T;
      }
        ? T extends Array<infer U>
          ? U
          : never
        : never)
    | null
  >(null);

  const attemptsQuery = useGetUserAssignmentAttempts(
    open
      ? {
          enrollmentId,
          assignmentId,
          currentPage,
          pageSize: PAGE_SIZE,
        }
      : undefined,
  );

  React.useEffect(() => {
    if (!open) {
      setCurrentPage(1);
      setSelectedAttempt(null);
    }
  }, [open]);

  const attempts = attemptsQuery.data?.data ?? [];
  const totalPages = attemptsQuery.data?.totalPages ?? 0;

  const closeDialog = () => {
    onOpenChange(false);
  };

  const openAttemptDetails = (attempt: NonNullable<typeof selectedAttempt>) => {
    setSelectedAttempt(attempt);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col overflow-hidden border-greyscale-700 bg-greyscale-900">
          <DialogHeader>
            <DialogTitle className="text-greyscale-0">
              {locale === "vi" ? "Chi tiết các lần nộp" : "Submission attempts"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
            {attemptsQuery.isLoading ? (
              <div className="flex min-h-60 items-center justify-center">
                <Spinner className="h-6 w-6" />
              </div>
            ) : attemptsQuery.isError ? (
              <div className="rounded-lg border border-error/20 bg-error/5 p-4 text-sm text-error">
                {attemptsQuery.error.response?.data?.message ||
                  attemptsQuery.error.message ||
                  (locale === "vi"
                    ? "Không thể tải danh sách lần nộp."
                    : "Failed to load attempts.")}
              </div>
            ) : attempts.length === 0 ? (
              <EmptyState
                title={
                  locale === "vi"
                    ? "Chưa có lần nộp nào"
                    : "No submission attempts yet"
                }
              />
            ) : (
              <div className="space-y-3 pt-2">
                {attempts.map((attempt) => (
                  <div
                    key={attempt.userAssignmentID}
                    className="space-y-3 rounded border border-greyscale-700 bg-greyscale-900/50 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1">
                        <p className="text-xs uppercase text-greyscale-400">
                          {locale === "vi" ? "Lần nộp" : "Attempt"}
                        </p>
                        <p className="text-lg font-semibold text-greyscale-0">
                          #{attempt.attemptNumber}
                        </p>
                      </div>

                      <div className="rounded-lg border border-greyscale-800 bg-black/20 px-3 py-2">
                        <p className="text-xs uppercase tracking-wide text-greyscale-400">
                          {locale === "vi" ? "Trạng thái" : "Status"}
                        </p>
                        <div className="mt-1">
                          <AssignmentStatusBadge status={attempt.status} />
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-lg border border-greyscale-800 bg-black/20 p-3">
                        <p className="text-xs uppercase tracking-wide text-greyscale-400">
                          {locale === "vi" ? "Điểm" : "Score"}
                        </p>
                        <p className="mt-1 text-base font-medium text-greyscale-0">
                          {attempt.score !== null && attempt.score !== undefined
                            ? attempt.score
                            : "—"}
                        </p>
                      </div>
                      <div className="rounded-lg border border-greyscale-800 bg-black/20 p-3">
                        <p className="text-xs uppercase tracking-wide text-greyscale-400">
                          {locale === "vi" ? "Ngày gửi" : "Submitted at"}
                        </p>
                        <p className="mt-1 text-sm text-greyscale-0">
                          {formatDateTime(attempt.submittedAt || null)}
                        </p>
                      </div>
                      <div className="rounded-lg border border-greyscale-800 bg-black/20 p-3">
                        <p className="text-xs uppercase tracking-wide text-greyscale-400">
                          {locale === "vi" ? "Ngày chấm" : "Reviewed at"}
                        </p>
                        <p className="mt-1 text-sm text-greyscale-0">
                          {formatDateTime(attempt.reviewedAt || null)}
                        </p>
                      </div>
                      <div className="rounded-lg border border-greyscale-800 bg-black/20 p-3 text-center">
                        <div className="mt-1">
                          <Button
                            type="button"
                            variant="tertiary"
                            size="sm"
                            onClick={() => openAttemptDetails(attempt)}
                          >
                            {locale === "vi" ? "Xem chi tiết" : "View details"}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {attempt.reviewComment?.trim() ? (
                      <div className="rounded-lg border border-greyscale-700 bg-greyscale-900/70 p-3">
                        <p className="mb-1 text-xs font-medium text-greyscale-0">
                          {locale === "vi"
                            ? "Nhận xét của người chấm"
                            : "Review comment"}
                        </p>
                        <p className="whitespace-pre-wrap wrap-break-word text-sm text-greyscale-50">
                          {attempt.reviewComment}
                        </p>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col gap-2 border-t border-greyscale-800 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-greyscale-400">
              {locale === "vi" ? "Trang" : "Page"} {currentPage}
              {totalPages ? ` / ${totalPages}` : ""}
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage <= 1 || attemptsQuery.isFetching}
              >
                {locale === "vi" ? "Trước" : "Prev"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.min(totalPages || page + 1, page + 1),
                  )
                }
                disabled={
                  attemptsQuery.isFetching ||
                  (totalPages ? currentPage >= totalPages : false)
                }
              >
                {locale === "vi" ? "Sau" : "Next"}
              </Button>
              <Button type="button" onClick={closeDialog}>
                {locale === "vi" ? "Đóng" : "Close"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!selectedAttempt}
        onOpenChange={(open) => !open && setSelectedAttempt(null)}
      >
        <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col overflow-hidden border-greyscale-700 bg-greyscale-900">
          <DialogHeader>
            <DialogTitle className="text-greyscale-0">
              {locale === "vi" ? "Chi tiết bài nộp" : "Attempt details"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
            <div className="space-y-4 pt-2">
              <div className="grid gap-3 rounded border border-greyscale-700 bg-greyscale-900/50 p-4 text-sm text-greyscale-100 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-greyscale-400">
                    {locale === "vi" ? "Lần nộp" : "Attempt"}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-greyscale-0">
                    #{selectedAttempt?.attemptNumber ?? "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-greyscale-400">
                    {locale === "vi" ? "Trạng thái" : "Status"}
                  </p>
                  <div className="mt-1">
                    <AssignmentStatusBadge
                      status={selectedAttempt?.status || "SUBMITTED"}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-greyscale-400">
                    {locale === "vi" ? "Ngày gửi" : "Submitted at"}
                  </p>
                  <p className="mt-1 text-greyscale-0">
                    {formatDateTime(selectedAttempt?.submittedAt || null)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-greyscale-400">
                    {locale === "vi" ? "Điểm" : "Score"}
                  </p>
                  <p className="mt-1 text-greyscale-0">
                    {selectedAttempt?.score !== null &&
                    selectedAttempt?.score !== undefined
                      ? selectedAttempt.score
                      : "—"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-greyscale-0">
                  {locale === "vi" ? "Video bài nộp" : "Submission video"}
                </p>
                <div className="overflow-hidden rounded-lg border border-greyscale-800 bg-black/40">
                  {selectedAttempt?.media?.url ? (
                    <video
                      src={selectedAttempt.media.url}
                      controls
                      className="max-h-[55vh] w-full object-contain"
                    />
                  ) : (
                    <div className="flex min-h-40 items-center justify-center px-4 py-10 text-sm text-greyscale-400">
                      {locale === "vi"
                        ? "Không có video đính kèm."
                        : "No attached video."}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-greyscale-0">
                  {locale === "vi" ? "Mô tả" : "Description"}
                </p>
                <div className="rounded border border-greyscale-700 bg-greyscale-950/50 p-4 text-sm leading-6 text-greyscale-100">
                  {selectedAttempt?.description?.trim() ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: selectedAttempt.description,
                      }}
                    />
                  ) : (
                    <p className="text-greyscale-400">
                      {locale === "vi"
                        ? "Không có mô tả cho lần nộp này."
                        : "No description for this attempt."}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-greyscale-800 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setSelectedAttempt(null)}
            >
              {locale === "vi" ? "Đóng" : "Close"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
