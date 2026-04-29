"use client";

import React from "react";
import { useParams } from "next/navigation";

import EmptyState from "@/components/common/EmptyState";
import { TableCustom } from "@/components/common/TableCustom";
import { Spinner } from "@/components/ui/spinner";
import { TableCell } from "@/components/ui/table";
import { useGetMyClubs } from "@/hooks/club/useClub";
import { useGetUserAssignmentAttempts } from "@/hooks/assignment/useUserAssignment";
import { formatDateTime } from "@/lib/utils/format-date";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserAssignmentAttempt } from "@/validations/assignment/user-assignment";

const UUID_SUFFIX_REGEX =
  /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const PAGE_SIZE = 10;

export default function LevelUpRequests() {
  const params = useParams<{ clubSlug?: string }>();
  const clubSlug = params?.clubSlug;
  const { data: myClubs = [] } = useGetMyClubs();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [selectedAttempt, setSelectedAttempt] = React.useState<UserAssignmentAttempt | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const handleViewDetails = (attempt: UserAssignmentAttempt) => {
    setSelectedAttempt(attempt);
    setIsDialogOpen(true);
  };

  const clubId = React.useMemo(() => {
    if (!clubSlug) return undefined;

    const matchedClub = myClubs.find((club) =>
      clubSlug.endsWith(`-${club.clubID}`),
    );
    if (matchedClub) return matchedClub.clubID;

    const uuidMatch = clubSlug.match(UUID_SUFFIX_REGEX);
    if (uuidMatch) return uuidMatch[0];

    return undefined;
  }, [clubSlug, myClubs]);

  const { data, isLoading, isError, error } = useGetUserAssignmentAttempts(
    clubId || "",
    currentPage,
    PAGE_SIZE
  );

  const attempts = data?.data?.data ?? [];

  const headers = [
    "STT",
    "Enrollment ID",
    "Assignment ID",
    "Bài nộp",
    "Lần nộp",
    "Trạng thái",
    "Điểm",
    "Ngày nộp",
  ];

  if (!clubId && !isLoading) {
    return (
      <div className="px-6 py-4">
        <EmptyState title="Không tìm thấy câu lạc bộ" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-greyscale-0">Yêu cầu thăng cấp</h2>
        {!isLoading && attempts.length > 0 && (
            <p className="text-sm text-greyscale-400">
                Tổng cộng: <span className="text-primary font-medium">{data?.data?.totalRecords ?? 0}</span> yêu cầu
            </p>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex min-h-60 items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      ) : isError ? (
        <div className="rounded-lg border border-error/20 bg-error/5 p-4">
            <p className="text-sm text-error">
            {error.response?.data?.message || error.message || "Không thể tải danh sách yêu cầu"}
            </p>
        </div>
      ) : attempts.length === 0 ? (
        <EmptyState title="Chưa có yêu cầu nâng cấp nào" />
      ) : (
        <TableCustom
          headers={headers}
          data={attempts}
          pagination={{
            currentPage: data?.data?.pageIndex ?? currentPage,
            pageSize: data?.data?.pageSize ?? PAGE_SIZE,
            totalItems: data?.data?.totalRecords ?? 0,
            onPageChange: setCurrentPage,
          }}
          renderRow={(attempt, index) => (
            <>
              <TableCell className="text-greyscale-100">
                {(data?.data?.pageIndex
                  ? (data.data.pageIndex - 1) * (data.data.pageSize || PAGE_SIZE)
                  : 0) +
                  index +
                  1}
              </TableCell>
              <TableCell className="text-greyscale-50 font-mono text-[10px] max-w-[120px] truncate">
                {attempt.enrollmentID}
              </TableCell>
              <TableCell className="text-greyscale-50 font-mono text-[10px] max-w-[120px] truncate">
                {attempt.assignmentID}
              </TableCell>
              <TableCell>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleViewDetails(attempt)}
                >
                  Xem chi tiết
                </Button>
              </TableCell>
              <TableCell className="text-greyscale-50 text-center">
                {attempt.attemptNumber}
              </TableCell>
              <TableCell>
                <Badge 
                    variant={attempt.status === "SUBMITTED" ? "secondary" : "outline"}
                    className={
                        attempt.status === "SUBMITTED" 
                        ? "bg-blue-500/10 text-blue-500 border-blue-500/20" 
                        : ""
                    }
                >
                  {attempt.status}
                </Badge>
              </TableCell>
              <TableCell className="text-greyscale-50 font-medium">
                {attempt.score !== null ? (
                    <span className={Number(attempt.score) >= 50 ? "text-success" : "text-error"}>
                        {attempt.score}
                    </span>
                ) : "—"}
              </TableCell>
              <TableCell className="text-greyscale-50 text-xs">
                {formatDateTime(attempt.submittedAt)}
              </TableCell>
            </>
          )}
        />
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl bg-greyscale-900 border-greyscale-700">
          <DialogHeader>
            <DialogTitle className="text-greyscale-0">
              Chi tiết bài nộp
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto pr-4 mt-2 custom-scrollbar">
            <div 
              className="dv-quill-render ql-editor"
              dangerouslySetInnerHTML={{ __html: selectedAttempt?.description || "<p class='text-greyscale-400 italic'>Không có mô tả chi tiết cho bài nộp này.</p>" }} 
            />
          </div>
          <div className="mt-4 pt-4 border-t border-greyscale-800 flex justify-between items-center text-xs text-greyscale-400">
            <span>ID Bài nộp: {selectedAttempt?.userAssignmentID}</span>
            <span>Nộp lúc: {formatDateTime(selectedAttempt?.submittedAt || null)}</span>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
