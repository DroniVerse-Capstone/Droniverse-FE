"use client";

import React from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import AssignmentStatusBadge from "@/components/common/AssignmentStatusBadge";
import { useReviewUserAssignment } from "@/hooks/assignment/useUserAssignment";
import { formatDateTime } from "@/lib/utils/format-date";
import { cn } from "@/lib/utils";
import { UserAssignmentAttempt } from "@/validations/assignment/user-assignment";

type LevelUpRequestDetailDialogProps = {
  attempt: UserAssignmentAttempt | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function LevelUpRequestDetailDialog({
  attempt,
  open,
  onOpenChange,
}: LevelUpRequestDetailDialogProps) {
  const reviewMutation = useReviewUserAssignment();
  const [isReviewDialogOpen, setIsReviewDialogOpen] = React.useState(false);
  const [score, setScore] = React.useState("");
  const [reviewComment, setReviewComment] = React.useState("");

  React.useEffect(() => {
    if (!attempt) {
      setIsReviewDialogOpen(false);
      setScore("");
      setReviewComment("");
      return;
    }

    setScore(attempt.score?.toString() ?? "");
    setReviewComment(attempt.reviewComment ?? "");
  }, [attempt]);

  const closeAll = () => {
    setIsReviewDialogOpen(false);
    onOpenChange(false);
  };

  const handleOpenReviewDialog = () => {
    if (!attempt || attempt.score !== null) return;

    setScore("");
    setReviewComment("");
    setIsReviewDialogOpen(true);
  };

  const handleSubmitReview = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!attempt?.user?.userId) {
      toast.error("Không tìm thấy thông tin người nộp.");
      return;
    }

    const parsedScore = Number(score);
    if (!Number.isInteger(parsedScore) || parsedScore < 0 || parsedScore > 100) {
      toast.error("Điểm phải là số nguyên từ 0 đến 100.");
      return;
    }

    const trimmedComment = reviewComment.trim();
    if (!trimmedComment) {
      toast.error("Vui lòng nhập nhận xét.");
      return;
    }

    try {
      await reviewMutation.mutateAsync({
        userAssignmentId: attempt.userAssignmentID,
        data: {
          userId: attempt.user.userId,
          score: parsedScore,
          reviewComment: trimmedComment,
        },
      });

      toast.success("Đã lưu điểm và nhận xét.");
      closeAll();
    } catch (error) {
      const apiError = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };

      toast.error(
        apiError.response?.data?.message ||
          apiError.message ||
          "Không thể chấm điểm lúc này.",
      );
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl border-greyscale-700 bg-greyscale-900">
          <DialogHeader>
            <DialogTitle className="text-greyscale-0">
              Chi tiết bài nộp
            </DialogTitle>
          </DialogHeader>

          <div className="max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar">
            <div className="space-y-4 pt-2">
              <div className="rounded-xl border border-greyscale-700 bg-linear-to-br from-greyscale-900/70 to-greyscale-900 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-[0.2em] text-greyscale-400">
                      Người nộp
                    </p>
                    <p className="text-lg font-semibold text-greyscale-0">
                      {attempt?.user?.fullName || "-"}
                    </p>
                    <p className="text-sm text-greyscale-400">
                      {attempt?.user?.email || "-"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-greyscale-800 bg-black/20 px-3 py-2">
                    <p className="text-xs uppercase tracking-wide text-greyscale-400">
                      Trạng thái
                    </p>
                    <div className="mt-1">
                      <AssignmentStatusBadge status={attempt?.status || "SUBMITTED"} />
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-lg border border-greyscale-800 bg-black/20 p-3">
                    <p className="text-xs uppercase tracking-wide text-greyscale-400">
                      Lần nộp
                    </p>
                    <p className="mt-1 text-base font-medium text-greyscale-0">
                      {attempt?.attemptNumber ?? "-"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-greyscale-800 bg-black/20 p-3">
                    <p className="text-xs uppercase tracking-wide text-greyscale-400">
                      Điểm
                    </p>
                    <p
                      className={cn(
                        "mt-1 text-base font-medium",
                        attempt?.score !== null && attempt?.score !== undefined
                          ? "text-greyscale-0"
                          : "text-greyscale-400",
                      )}
                    >
                      {attempt?.score !== null && attempt?.score !== undefined
                        ? attempt.score
                        : "Chưa chấm"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-greyscale-800 bg-black/20 p-3">
                    <p className="text-xs uppercase tracking-wide text-greyscale-400">
                      Ngày nộp
                    </p>
                    <p className="mt-1 text-sm text-greyscale-0">
                      {formatDateTime(attempt?.submittedAt || null)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-greyscale-800 bg-black/20 p-3">
                    <p className="text-xs uppercase tracking-wide text-greyscale-400">
                      Ngày chấm
                    </p>
                    <p className="mt-1 text-sm text-greyscale-0">
                      {formatDateTime(attempt?.reviewedAt || null)}
                    </p>
                  </div>
                </div>
              </div>

              {attempt?.reviewComment?.trim() ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-greyscale-0">
                    Nhận xét của người chấm
                  </p>
                  <div className="rounded-lg border border-greyscale-700 bg-greyscale-950/50 p-4 text-sm leading-6 text-greyscale-100">
                    <div className="whitespace-pre-wrap wrap-break-word text-greyscale-100">
                      {attempt.reviewComment}
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="space-y-2">
                <p className="text-sm font-medium text-greyscale-0">
                  Video bài nộp
                </p>
                <div className="overflow-hidden rounded-lg border border-greyscale-800 bg-black/40">
                  {attempt?.media?.url ? (
                    <video
                      src={attempt.media.url}
                      controls
                      className="max-h-90 w-full object-contain"
                    />
                  ) : (
                    <div className="flex min-h-40 items-center justify-center px-4 py-10 text-sm text-greyscale-400">
                      Không có video đính kèm.
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-greyscale-0">
                  Mô tả bài nộp
                </p>
                <div className="rounded border border-greyscale-700 bg-greyscale-950/50 p-4 text-sm leading-6 text-greyscale-100">
                  {attempt?.description?.trim() ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: attempt.description,
                      }}
                    />
                  ) : (
                    "Không có mô tả chi tiết cho bài nộp này."
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 border-t border-greyscale-800 pt-4">
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Đóng
            </Button>
            {attempt?.score === null ? (
              <Button type="button" onClick={handleOpenReviewDialog}>
                Chấm điểm
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-lg border-greyscale-700 bg-greyscale-900">
          <DialogHeader>
            <DialogTitle className="text-greyscale-0">
              Chấm điểm bài nộp
            </DialogTitle>
          </DialogHeader>

          <form className="space-y-4 pt-2" onSubmit={handleSubmitReview}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-greyscale-0">
                Điểm
              </label>
              <Input
                type="number"
                min={0}
                max={100}
                step={1}
                value={score}
                onChange={(event) => setScore(event.target.value)}
                placeholder="Nhập điểm từ 0 đến 100"
                className="border-greyscale-700 bg-greyscale-950 text-greyscale-0"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-greyscale-0">
                Nhận xét
              </label>
              <Textarea
                value={reviewComment}
                onChange={(event) => setReviewComment(event.target.value)}
                placeholder="Nhập nhận xét cho bài nộp"
                className="min-h-32 border-greyscale-700 bg-greyscale-950 text-greyscale-0"
              />
            </div>

            <DialogFooter className="gap-2 border-t border-greyscale-800 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsReviewDialogOpen(false)}
                disabled={reviewMutation.isPending}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={reviewMutation.isPending}>
                {reviewMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Spinner className="h-4 w-4" />
                    Đang lưu
                  </span>
                ) : (
                  "Lưu điểm"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}