"use client";

import React from "react";
import toast from "react-hot-toast";
import { Check, X } from "lucide-react";

import ConfirmActionPopover from "@/components/common/ConfirmActionPopover";
import EmptyState from "@/components/common/EmptyState";
import { TableCustom } from "@/components/common/TableCustom";
import ClubRequestStatusBadge from "@/components/club/ClubRequestStatusBadge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { TableCell } from "@/components/ui/table";
import {
  useGetClubAttemptRequestsByClub,
  useUpdateClubAttemptRequestStatus,
} from "@/hooks/club-attempt/useClubAttempt";
import { formatDateTime } from "@/lib/utils/format-date";
import { cn } from "@/lib/utils";
import { CLUB_ATTEMPT_REQUEST_STATUS } from "@/lib/constants/club";
import { useTranslations } from "@/providers/i18n-provider";

type JoinRequestsTabProps = {
  clubId: string;
};

type RequestStatus = "PENDING" | "APPROVED" | "REJECT";

const PAGE_SIZE = 10;

export default function JoinRequestsTab({ clubId }: JoinRequestsTabProps) {
  const t = useTranslations("ManagerMembers");
  const [selectedStatus, setSelectedStatus] = React.useState<
    RequestStatus | null
  >(null);
  const [currentPage, setCurrentPage] = React.useState(1);

  const updateStatusMutation = useUpdateClubAttemptRequestStatus();

  const { data, isLoading, isError, error } = useGetClubAttemptRequestsByClub(
    clubId,
    {
      status: selectedStatus || undefined,
      currentPage,
      pageSize: PAGE_SIZE,
    },
  );

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
              status === "APPROVED"
                ? t("approved.toast")
                : t("rejected.toast"), 
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
    t("headers.email"),
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
              <TableCell className="text-greyscale-0">
                {request.requesterName || "—"}
              </TableCell>
              <TableCell className="text-greyscale-50">
                {request.requesterEmail || "—"}
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
                {request.status === "PENDING" ? (
                  <div className="flex items-center gap-2">
                    <ConfirmActionPopover
                      trigger={
                        <Button className="h-8 rounded border border-secondary/40 bg-secondary/15 px-2.5 text-secondary hover:bg-secondary/25">
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
                        <Button className="h-8 rounded border border-error/40 bg-error/15 px-2.5 text-error hover:bg-error/25">
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
                  </div>
                ) : (
                  <span className="text-sm text-greyscale-0">{t("done")}</span>
                )}
              </TableCell>
            </>
          )}
        />
      )}
    </div>
  );
}
