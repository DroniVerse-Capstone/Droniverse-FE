"use client";

import React from "react";
import toast from "react-hot-toast";
import { Check, Eye, X } from "lucide-react";

import ConfirmActionPopover from "@/components/common/ConfirmActionPopover";
import CourseLevelBadge from "@/components/course/CourseLevelBadge";
import EmptyState from "@/components/common/EmptyState";
import { TableCustom } from "@/components/common/TableCustom";
import ClubRequestStatusBadge from "@/components/club/ClubRequestStatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { TableCell } from "@/components/ui/table";
import {
  useGetClubAttemptRequestsByClub,
  useUpdateClubAttemptRequestStatus,
} from "@/hooks/club-attempt/useClubAttempt";
import { useGetClubDetailById } from "@/hooks/club/useClub";
import { formatDateTime } from "@/lib/utils/format-date";
import { cn } from "@/lib/utils";
import { CLUB_ATTEMPT_REQUEST_STATUS } from "@/lib/constants/club";
import { useLocale, useTranslations } from "@/providers/i18n-provider";

type JoinRequestsTabProps = {
  clubId: string;
};

type RequestStatus = "PENDING" | "APPROVED" | "REJECT";

const PAGE_SIZE = 10;

export default function JoinRequestsTab({ clubId }: JoinRequestsTabProps) {
  const t = useTranslations("ManagerMembers");
  const locale = useLocale();
  const [selectedStatus, setSelectedStatus] =
    React.useState<RequestStatus | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [selectedEvidence, setSelectedEvidence] = React.useState<{
    requesterName: string | null;
    clubRequirement: string | null;
    clubNameVN: string;
    clubNameEN: string;
    mediaTypeName: "IMAGE" | "VIDEO";
    url: string;
  } | null>(null);

  const updateStatusMutation = useUpdateClubAttemptRequestStatus();

  const { data, isLoading, isError, error } = useGetClubAttemptRequestsByClub(
    clubId,
    {
      status: selectedStatus || undefined,
      currentPage,
      pageSize: PAGE_SIZE,
    },
  );

  const { data: clubDetail } = useGetClubDetailById(clubId);
  const clubDroneId = clubDetail?.drone?.droneID ?? null;

  const requests = data?.data ?? [];

  const handleUpdateStatus = React.useCallback(
    (id: string, status: "APPROVED" | "REJECT") => {
      updateStatusMutation.mutate(
        {
          id,
          data: { status },
        },
        {
          onSuccess: () => {
            toast.success(
              status === "APPROVED" ? t("approved.toast") : t("rejected.toast"),
            );
          },
          onError: (err) => {
            toast.error(
              err.response?.data?.message || "Cập nhật trạng thái thất bại.",
            );
          },
        },
      );
    },
    [updateStatusMutation],
  );

  const headers = [
    t("headers.stt"),
    t("headers.requester"),
    t("headers.level"),
    t("headers.status"),
    t("headers.requestedAt"),
    t("headers.approvedAt"),
    t("headers.actions"),
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {CLUB_ATTEMPT_REQUEST_STATUS.map((statusOption) => (
          <button
            key={statusOption.value ?? "ALL"}
            onClick={() => {
              setSelectedStatus((prev) =>
                prev === statusOption.value
                  ? null
                  : (statusOption.value as RequestStatus | null),
              );
              setCurrentPage(1);
            }}
            className={cn(
              "rounded px-3 py-1.5 text-sm font-medium transition-colors",
              selectedStatus === statusOption.value
                ? "bg-primary text-greyscale-0"
                : "bg-greyscale-700 text-greyscale-100 hover:bg-greyscale-600",
            )}
          >
            {t(statusOption.label)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex min-h-40 items-center justify-center">
          <Spinner className="h-5 w-5" />
        </div>
      ) : isError ? (
        <p className="text-sm text-error">
          {error.response?.data?.message ||
            error.message ||
            t("error.loadRequests")}
        </p>
      ) : requests.length === 0 ? (
        <EmptyState title={t("empty.requests")} />
      ) : (
        <TableCustom
          headers={headers}
          data={requests}
          pagination={{
            currentPage: data?.pageIndex ?? currentPage,
            pageSize: data?.pageSize ?? PAGE_SIZE,
            totalItems: data?.totalRecords ?? 0,
            onPageChange: setCurrentPage,
          }}
          renderRow={(request, index) => (
            <>
              <TableCell className="text-greyscale-100">
                {(data?.pageIndex
                  ? (data.pageIndex - 1) * (data.pageSize || PAGE_SIZE)
                  : 0) +
                  index +
                  1}
              </TableCell>
              <TableCell>
                <div className="space-y-0.5">
                  <p className="font-medium text-greyscale-0">{request.requesterName || "—"}</p>
                  <p className="text-xs text-greyscale-400">{request.requesterEmail || "—"}</p>
                </div>
              </TableCell>
              <TableCell>
                {(() => {
                  const levelEntry = clubDroneId
                    ? request.userLevelMax?.find(
                        (l) => l.drone.droneID === clubDroneId
                      )
                    : null;

                  return levelEntry ? (
                    <CourseLevelBadge level={levelEntry.level} />
                  ) : (
                    <span className="text-sm text-greyscale-100">{locale === "vi" ? "Chưa có cấp độ" : "No level"}</span>
                  );
                })()}
              </TableCell>
              <TableCell>
                <ClubRequestStatusBadge
                  status={
                    request.status === "REJECT" ? "REJECTED" : request.status
                  }
                />
              </TableCell>
              <TableCell className="text-greyscale-50">
                {formatDateTime(request.createAt)}
              </TableCell>
              <TableCell className="text-greyscale-50">
                {formatDateTime(request.processedAt)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="viewIcon"
                    size="icon"
                    disabled={!request.media?.url}
                    onClick={() => {
                      if (!request.media?.url) return;

                      const mediaTypeName =
                        request.media.mediaTypeName === "VIDEO"
                          ? "VIDEO"
                          : "IMAGE";

                      setSelectedEvidence({
                        requesterName: request.requesterName,
                        clubRequirement: request.clubRequirement,
                        clubNameVN: request.clubNameVN,
                        clubNameEN: request.clubNameEN,
                        mediaTypeName,
                        url: request.media.url,
                      });
                    }}
                  >
                    <Eye size={16} />
                  </Button>

                  {request.status === "PENDING" ? (
                    <>
                      <ConfirmActionPopover
                        trigger={
                          <Button variant={"secondaryIcon"} size={"icon"}>
                            <Check size={16} />
                          </Button>
                        }
                        title={t("approved.title")}
                        description={t("approved.description")}
                        confirmText={t("approved.confirmText")}
                        cancelText={t("approved.cancelText")}
                        isLoading={updateStatusMutation.isPending}
                        onConfirm={() =>
                          handleUpdateStatus(request.clubRequestID, "APPROVED")
                        }
                      />

                      <ConfirmActionPopover
                        trigger={
                          <Button variant="deleteIcon" size={"icon"}>
                            <X size={16} />
                          </Button>
                        }
                        title={t("rejected.title")}
                        description={t("rejected.description")}
                        confirmText={t("rejected.confirmText")}
                        cancelText={t("rejected.cancelText")}
                        isLoading={updateStatusMutation.isPending}
                        onConfirm={() =>
                          handleUpdateStatus(request.clubRequestID, "REJECT")
                        }
                      />
                    </>
                  ) : (
                    <span className="text-sm text-greyscale-0">
                      {t("done")}
                    </span>
                  )}
                </div>
              </TableCell>
            </>
          )}
        />
      )}

      <Dialog
        open={!!selectedEvidence}
        onOpenChange={(open) => {
          if (!open) setSelectedEvidence(null);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {locale === "vi"
                ? "Chi tiết yêu cầu tham gia câu lạc bộ"
                : "Join club request details"}
            </DialogTitle>
          </DialogHeader>

          {selectedEvidence && (
            <div className="space-y-3">
              <div className="rounded border border-greyscale-700 bg-greyscale-900/40 p-3 text-sm space-y-1">
                <p className="text-greyscale-0">
                  <span className="font-medium text-greyscale-200">{locale === "vi" ? "Người gửi" : "Requester"}:</span>{" "}
                  {selectedEvidence.requesterName || "-"}
                </p>
                <p className="text-greyscale-0">
                  <span className="font-medium text-greyscale-200">{locale === "vi" ? "Thông tin cung cấp" : "Provided Info"}:</span>{" "}
                  {selectedEvidence.clubRequirement || "-"}
                </p>
                <p className="text-greyscale-0">
                  <span className="font-medium text-greyscale-200">{locale === "vi" ? "Định dạng" : "Media Type"}:</span>{" "}
                  {selectedEvidence.mediaTypeName === "IMAGE"
                    ? locale === "vi"
                      ? "Hình ảnh"
                      : "Image"
                    : selectedEvidence.mediaTypeName === "VIDEO"
                      ? locale === "vi"
                        ? "Video"
                        : "Video"
                      : "-"}
                </p>
              </div>

              <div className="overflow-hidden rounded border border-greyscale-700 bg-black/40">
                {selectedEvidence.mediaTypeName === "VIDEO" ? (
                  <video
                    src={selectedEvidence.url}
                    controls
                    className="max-h-[70vh] w-full object-contain"
                  />
                ) : (
                  <img
                    src={selectedEvidence.url}
                    alt="Drone ownership evidence"
                    className="max-h-[70vh] w-full object-contain"
                  />
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
