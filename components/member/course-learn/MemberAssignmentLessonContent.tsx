"use client";

import React from "react";
import { useParams } from "next/navigation";
import {
  FaCheckCircle,
  FaClock,
  FaRegEye,
  FaPaperclip,
} from "react-icons/fa";
import { FaCircleXmark } from "react-icons/fa6";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { useGetUserAssignmentDetail } from "@/hooks/learning/useUserLearning";
import { useLocale } from "@/providers/i18n-provider";
import { formatDateTime } from "@/lib/utils/format-date";
import MemberAssignmentSubmitDialog from "@/components/member/course-learn/MemberAssignmentSubmitDialog";
import MemberAssignmentAttemptsDialog from "@/components/member/course-learn/MemberAssignmentAttemptsDialog";

type MemberAssignmentLessonContentProps = {
  assignmentId: string;
  enrollmentId?: string;
};

export default function MemberAssignmentLessonContent({
  assignmentId,
  enrollmentId,
}: MemberAssignmentLessonContentProps) {
  useParams<{ clubSlug?: string }>();
  const locale = useLocale();
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = React.useState(false);
  const [isAttemptsDialogOpen, setIsAttemptsDialogOpen] = React.useState(false);

  const assignmentDetailQuery = useGetUserAssignmentDetail(
    enrollmentId
      ? {
          enrollmentId,
          assignmentId,
        }
      : undefined,
  );

  if (assignmentDetailQuery.isLoading) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-4xl items-center justify-center rounded-lg border border-greyscale-700 bg-greyscale-900/40 p-8">
        <Spinner className="h-5 w-5" />
      </div>
    );
  }

  if (assignmentDetailQuery.isError) {
    return (
      <div className="mx-auto w-full max-w-4xl rounded-lg border border-greyscale-700 bg-greyscale-900/60 p-6 text-sm text-warning">
        {assignmentDetailQuery.error.response?.data?.message ||
          assignmentDetailQuery.error.message ||
          (locale === "vi"
            ? "Không tải được thông tin bài tập."
            : "Failed to load assignment details.")}
      </div>
    );
  }

  if (!assignmentDetailQuery.data) {
    return null;
  }

  const canSubmitAssignment = Boolean(enrollmentId);
  const canViewReview = Boolean(enrollmentId);
  const assignment = assignmentDetailQuery.data.assignment;
  const userAssignment = assignmentDetailQuery.data.userAssignment;

  const handleSubmitAssignment = () => {
    if (!enrollmentId) {
      return;
    }

    setIsSubmitDialogOpen(true);
  };

  const handleViewReview = () => {
    if (!enrollmentId) {
      return;
    }

    setIsAttemptsDialogOpen(true);
  };

  const getStatusBadgeInfo = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return {
          color: "border-warning/50 bg-warning/20 text-warning",
          icon: FaClock,
          label: locale === "vi" ? "Chờ chấm điểm" : "Awaiting Review",
        };
      case "UNDER_REVIEW":
        return {
          color: "border-secondary/50 bg-secondary/20 text-secondary",
          icon: FaRegEye,
          label: locale === "vi" ? "Đang chấm" : "Under Review",
        };
      case "PASSED":
        return {
          color: "border-success/50 bg-success/20 text-success",
          icon: FaCheckCircle,
          label: locale === "vi" ? "Đạt" : "Passed",
        };
      case "FAILED":
        return {
          color: "border-primary/50 bg-primary/20 text-primary",
          icon: FaCircleXmark,
          label: locale === "vi" ? "Chưa đạt" : "Failed",
        };
      default:
        return {
          color: "border-greyscale-600 bg-greyscale-800 text-greyscale-100",
          icon: FaClock,
          label: status,
        };
    }
  };

  const statusInfo =
    userAssignment && getStatusBadgeInfo(userAssignment.status);
  const StatusIcon = statusInfo?.icon;

  return (
    <div className="relative mx-auto w-full max-w-4xl overflow-hidden rounded border border-greyscale-700/90 bg-greyscale-900/70 p-6 shadow-[0_16px_50px_-24px_rgba(0,0,0,0.85)] backdrop-blur-sm">
      <div className="pointer-events-none absolute -left-20 -top-20 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-16 h-52 w-52 rounded-full bg-secondary/15 blur-3xl" />

      <div className="relative space-y-5">
        <div className="space-y-3">
          <span className="inline-flex items-center rounded-full border border-greyscale-600 bg-greyscale-900/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-greyscale-100">
            {locale === "vi" ? "Bài tập" : "Assignment"}
          </span>

          <h2 className="text-2xl font-semibold leading-tight text-greyscale-0 md:text-3xl">
            {locale === "en" ? assignment.titleEN : assignment.titleVN}
          </h2>

          <p className="max-w-3xl text-sm leading-relaxed text-greyscale-100 md:text-base">
            {locale === "en"
              ? assignment.descriptionEN
              : assignment.descriptionVN}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded border-2 border-tertiary/35 bg-tertiary/10 p-3">
            <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-tertiary">
              <FaClock className="h-3.5 w-3.5" />
              {locale === "vi" ? "Thời gian ước tính" : "Estimated Time"}
            </p>
            <p className="mt-2 text-xl font-semibold text-greyscale-0">
              {assignment.estimatedTime}
              {locale === "vi" ? " phút" : " mins"}
            </p>
          </div>

          <div className="rounded border-2 border-primary/35 bg-primary/10 p-3">
            <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-primary">
              <FaPaperclip className="h-3.5 w-3.5" />
              {locale === "vi" ? "Lần gửi" : "Attempt"}
            </p>
            <p className="mt-2 text-xl font-semibold text-greyscale-0">
              {userAssignment?.attemptNumber ?? 0}
            </p>
          </div>
        </div>

        <div className="rounded border border-greyscale-700 bg-greyscale-900/40 p-4">
          <h3 className="text-sm font-semibold text-greyscale-0 mb-3">
            {locale === "vi" ? "Yêu cầu bài tập" : "Assignment Requirements"}
          </h3>
          <div className="prose prose-invert max-w-none text-sm text-greyscale-100">
            <p className="whitespace-pre-wrap wrap-break-word">
              {assignment.requirement}
            </p>
          </div>
        </div>

        {userAssignment ? (
          <div className="space-y-4 rounded border border-greyscale-700 bg-greyscale-950/70 p-4">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span
                  className={`inline-flex items-center gap-2 rounded-full border-2 px-3 py-1 text-xs font-semibold ${
                    statusInfo?.color
                  }`}
                >
                  {StatusIcon && <StatusIcon className="h-3.5 w-3.5" />}
                  {statusInfo?.label}
                </span>

                {userAssignment.score !== null && (
                  <span className="text-sm font-semibold text-greyscale-0">
                    {locale === "vi" ? "Điểm: " : "Score: "}
                    <span className="text-primary">
                      {userAssignment.score}/100
                    </span>
                  </span>
                )}
              </div>

              <div className="grid gap-2 text-xs text-greyscale-100 sm:grid-cols-2">
                <div>
                  <p className="font-medium text-greyscale-200">
                    {locale === "vi" ? "Ngày gửi" : "Submitted At"}
                  </p>
                  <p>
                    {formatDateTime(userAssignment.submittedAt || null)}
                  </p>
                </div>

                {userAssignment.reviewedAt && (
                  <div>
                    <p className="font-medium text-greyscale-200">
                      {locale === "vi" ? "Ngày chấm" : "Reviewed At"}
                    </p>
                    <p>{formatDateTime(userAssignment.reviewedAt)}</p>
                  </div>
                )}
              </div>

              {userAssignment.reviewComment && (
                <div className="rounded border border-greyscale-600 bg-greyscale-900/60 p-3">
                  <p className="text-xs font-medium text-greyscale-0 mb-1">
                    {locale === "vi"
                      ? "Nhận xét từ người chấm"
                      : "Grader Review"}
                  </p>
                  <p className="text-sm text-greyscale-50 whitespace-pre-wrap wrap-break-word">
                    {userAssignment.reviewComment}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-greyscale-700 pt-4">
              {userAssignment.status === "FAILED" && (
                <Button
                  onClick={handleSubmitAssignment}
                  disabled={!canSubmitAssignment}
                  className="gap-2"
                >
                  <FaPaperclip className="h-4 w-4" />
                  {locale === "vi" ? "Nộp lại" : "Resubmit"}
                </Button>
              )}

              {["PASSED", "FAILED", "UNDER_REVIEW", "SUBMITTED"].includes(
                userAssignment.status
              ) && (
                <Button
                  variant="outline"
                  onClick={handleViewReview}
                  disabled={!canViewReview}
                  className="gap-2"
                >
                  <FaRegEye className="h-4 w-4" />
                  {locale === "vi" ? "Xem các lần nộp" : "View Submissions"}
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap justify-end gap-2 border-t border-greyscale-700 pt-4">
            <Button
              onClick={handleSubmitAssignment}
              disabled={!canSubmitAssignment}
              className="gap-2"
            >
              <FaPaperclip className="h-4 w-4" />
              {locale === "vi" ? "Nộp bài tập" : "Submit Assignment"}
            </Button>
          </div>
        )}
      </div>

      <MemberAssignmentSubmitDialog
        open={isSubmitDialogOpen}
        onOpenChange={setIsSubmitDialogOpen}
        enrollmentId={enrollmentId || ""}
        assignmentId={assignmentId}
        title={locale === "vi" ? "Nộp bài tập" : "Submit Assignment"}
        requirement={assignment.requirement}
      />

      <MemberAssignmentAttemptsDialog
        open={isAttemptsDialogOpen}
        onOpenChange={setIsAttemptsDialogOpen}
        enrollmentId={enrollmentId || ""}
        assignmentId={assignmentId}
      />
    </div>
  );
}
