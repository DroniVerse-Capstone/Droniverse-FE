"use client";

import { AxiosError } from "axios";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CiLock, CiUnlock } from "react-icons/ci";
import { FaRegEye } from "react-icons/fa";
import { IoPeopleOutline } from "react-icons/io5";
import { MdOutlineAutoGraph } from "react-icons/md";
import Link from "next/link";

import ClubStatusBadge from "@/components/club/ClubStatusBadge";
import ConfirmActionPopover from "@/components/common/ConfirmActionPopover";
import EmptyState from "@/components/common/EmptyState";
import { TableCustom } from "@/components/common/TableCustom";
import TooltipWrapper from "@/components/common/ToolTipWrapper";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Empty } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { TableCell } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  useGetAllClubs,
  useGetClubDetailById,
  useUpdateClubStatus,
} from "@/hooks/club/useClub";
import { CLUB_STATUS } from "@/lib/constants/club";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "@/providers/i18n-provider";
import { ApiError } from "@/types/api/common";

type ClubStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "ARCHIVED" | null;

const PAGE_SIZE = 8;

export default function ClubManagement() {
  const t = useTranslations("ClubDashboard");
  const locale = useLocale();

  const [selectedStatus, setSelectedStatus] = useState<ClubStatus>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [viewId, setViewId] = useState<string | null>(null);
  const [suspendClub, setSuspendClub] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [suspendReason, setSuspendReason] = useState("");

  const updateClubStatusMutation = useUpdateClubStatus();
  const isUpdatingClubStatus = updateClubStatusMutation.isPending;

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setCurrentPage(1);
    }, 450);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data: detail, isLoading: isDetailLoading } = useGetClubDetailById(
    viewId ?? undefined,
  );

  const { data, isLoading, isError, error } = useGetAllClubs({
    clubName: search || undefined,
    clubStatus: selectedStatus || undefined,
    currentPage,
    pageSize: PAGE_SIZE,
  });

  const clubs = data?.data ?? [];

  const handleActivateClub = async (clubId: string) => {
    try {
      const response = await updateClubStatusMutation.mutateAsync({
        id: clubId,
        data: { status: "ACTIVE" },
      });
      toast.success(response.message);
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      toast.error(
        axiosError.response?.data?.message ||
          axiosError.message ||
          (locale === "vi"
            ? "Không thể chuyển câu lạc bộ sang hoạt động"
            : "Unable to activate club"),
      );
    }
  };

  const handleSuspendClub = async () => {
    if (!suspendClub) return;

    const normalizedReason = suspendReason.trim();

    if (!normalizedReason) {
      toast.error(
        locale === "vi"
          ? "Vui lòng nhập lý do đình chỉ"
          : "Please enter suspension reason",
      );
      return;
    }

    try {
      const response = await updateClubStatusMutation.mutateAsync({
        id: suspendClub.id,
        data: {
          status: "SUSPENDED",
          reason: normalizedReason,
        },
      });

      toast.success(response.message);
      setSuspendReason("");
      setSuspendClub(null);
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      toast.error(
        axiosError.response?.data?.message ||
          axiosError.message ||
          (locale === "vi"
            ? "Không thể đình chỉ câu lạc bộ"
            : "Unable to suspend club"),
      );
    }
  };

  const handleSuspendDialogOpenChange = (open: boolean) => {
    if (isUpdatingClubStatus) return;

    if (!open) {
      setSuspendClub(null);
      setSuspendReason("");
    }
  };

  const headers = [
    t("table.headers.name"),
    t("table.headers.managers"),
    "Drone",
    t("table.headers.image"),
    t("table.headers.members"),
    t("table.headers.status"),
    t("table.headers.actions"),
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <Spinner className="h-5 w-5" />
      </div>
    );
  }

  if (isError) {
    return (
      <Empty>
        <p className="text-sm text-muted-foreground">
          {error.response?.data?.message ||
            error.message ||
            "Unable to load clubs list."}
        </p>
      </Empty>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {CLUB_STATUS.map((status) => (
              <button
                key={String(status.value)}
                onClick={() => {
                  const nextStatus =
                    selectedStatus === status.value
                      ? null
                      : (status.value as ClubStatus);
                  setSelectedStatus(nextStatus);
                  setCurrentPage(1);
                }}
                className={cn(
                  "rounded px-3 py-1.5 text-sm font-medium transition-colors",
                  selectedStatus === status.value
                    ? "bg-primary text-white"
                    : "bg-greyscale-700 text-greyscale-100 hover:bg-greyscale-600",
                )}
              >
                {t(status.label)}
              </button>
            ))}
          </div>

          <div className="w-full md:max-w-sm">
            <Input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder={
                locale === "vi"
                  ? "Tìm kiếm theo tên câu lạc bộ"
                  : "Search by club name"
              }
            />
          </div>
        </div>

        {clubs.length === 0 ? (
          <EmptyState title={t("empty.title")} />
        ) : (
          <TableCustom
            headers={headers}
            data={clubs}
            pagination={{
              currentPage: data?.pageIndex ?? currentPage,
              pageSize: data?.pageSize ?? PAGE_SIZE,
              totalItems: data?.totalRecords ?? 0,
              onPageChange: setCurrentPage,
            }}
            renderRow={(club) => (
              <>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium text-greyscale-0">
                      {locale === "vi" ? club.nameVN : club.nameEN}
                    </p>
                    <p className="text-xs text-greyscale-100">
                      {locale === "vi" ? club.nameEN : club.nameVN}
                    </p>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium text-greyscale-0">
                      {club.creator?.username}
                    </p>
                    <p className="text-xs text-greyscale-100">
                      {club.creator?.email}
                    </p>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded border border-greyscale-700">
                      <Image
                        src={
                          club?.drone?.imgURL || "/images/drone-placeholder.jpg"
                        }
                        alt={
                          (locale === "vi"
                            ? club?.drone?.droneNameVN
                            : club?.drone?.droneNameEN) ?? "Drone"
                        }
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-greyscale-0">
                        {locale === "vi"
                          ? club?.drone?.droneNameVN
                          : club?.drone?.droneNameEN}
                      </p>
                      <p className="text-xs text-greyscale-100">
                        {locale === "vi"
                          ? club?.drone?.droneTypeNameVN
                          : club?.drone?.droneTypeNameEN}
                      </p>
                      <p className="text-xs text-greyscale-100">
                        {club?.drone?.manufacturer}
                      </p>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="relative h-12 w-18 overflow-hidden rounded border border-greyscale-700">
                    <Image
                      src={club.imageUrl || "/images/club-placeholder.jpg"}
                      alt={club.nameVN}
                      fill
                      className="object-cover"
                    />
                  </div>
                </TableCell>

                <TableCell>
                  <span className="inline-flex items-center gap-1 rounded border border-secondary/40 bg-secondary/15 px-2 py-1 text-xs text-secondary">
                    <IoPeopleOutline size={14} />
                    {club.totalMembers}/{club.limitParticipation}
                  </span>
                </TableCell>

                <TableCell>
                  <ClubStatusBadge status={club.status} />
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {club.status !== "ARCHIVED" &&
                      club.status !== "SUSPENDED" && (
                        <TooltipWrapper
                          label={locale === "vi" ? "Đình chỉ" : "Suspend"}
                        >
                          <Button
                            variant="deleteIcon"
                            size="icon"
                            disabled={isUpdatingClubStatus}
                            onClick={() => {
                              setSuspendClub({
                                id: club.clubID,
                                name:
                                  locale === "vi" ? club.nameVN : club.nameEN,
                              });
                              setSuspendReason("");
                            }}
                          >
                            <CiLock size={18} />
                          </Button>
                        </TooltipWrapper>
                      )}

                    {club.status === "SUSPENDED" && (
                      <ConfirmActionPopover
                        trigger={
                          <TooltipWrapper
                            label={
                              locale === "vi" ? "Tái kích hoạt" : "Activate"
                            }
                          >
                            <Button
                              variant="successIcon"
                              size="icon"
                              disabled={isUpdatingClubStatus}
                            >
                              <CiUnlock size={18} />
                            </Button>
                          </TooltipWrapper>
                        }
                        title={
                          locale === "vi"
                            ? "Kích hoạt lại câu lạc bộ?"
                            : "Activate this club?"
                        }
                        description={
                          locale === "vi"
                            ? "Câu lạc bộ sẽ chuyển về trạng thái hoạt động."
                            : "The club will be switched to active status."
                        }
                        confirmText={locale === "vi" ? "Kích hoạt" : "Activate"}
                        cancelText={locale === "vi" ? "Đóng" : "Close"}
                        isLoading={isUpdatingClubStatus}
                        onConfirm={() => handleActivateClub(club.clubID)}
                      />
                    )}

                    <TooltipWrapper label={locale === "vi" ? "Tiến độ học tập" : "Learning Progress"}>
                      <Link href={`/club-management/${club.clubID}/learning-progress`}>
                        <Button
                          variant="secondaryIcon"
                          size="icon"
                          className="text-blue-400 hover:text-blue-300 border-blue-500/30 hover:border-blue-500/50 bg-blue-500/5"
                        >
                          <MdOutlineAutoGraph size={18} />
                        </Button>
                      </Link>
                    </TooltipWrapper>

                    <TooltipWrapper label={t("table.actions.view")}>
                      <Button
                        variant="secondaryIcon"
                        size="icon"
                        disabled={isUpdatingClubStatus}
                        onClick={() => setViewId(club.clubID)}
                      >
                        <FaRegEye size={18} />
                      </Button>
                    </TooltipWrapper>
                  </div>
                </TableCell>
              </>
            )}
          />
        )}
      </div>

      <Dialog open={!!suspendClub} onOpenChange={handleSuspendDialogOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-greyscale-0">
              {locale === "vi" ? "Đình chỉ câu lạc bộ" : "Suspend club"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <p className="text-sm text-greyscale-100">
              {locale === "vi"
                ? `Nhập lý do đình chỉ cho câu lạc bộ ${suspendClub?.name || ""}.`
                : `Enter suspension reason for ${suspendClub?.name || "this club"}.`}
            </p>

            <Textarea
              value={suspendReason}
              onChange={(event) => setSuspendReason(event.target.value)}
              placeholder={
                locale === "vi"
                  ? "Nhập lý do đình chỉ"
                  : "Enter suspension reason"
              }
              rows={4}
              disabled={isUpdatingClubStatus}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isUpdatingClubStatus}
                onClick={() => handleSuspendDialogOpenChange(false)}
              >
                {locale === "vi" ? "Đóng" : "Close"}
              </Button>
              <Button
                type="button"
                disabled={isUpdatingClubStatus}
                onClick={handleSuspendClub}
              >
                {isUpdatingClubStatus ? <Spinner className="h-4 w-4" /> : null}
                {locale === "vi" ? "Xác nhận đình chỉ" : "Confirm suspend"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewId} onOpenChange={() => setViewId(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-greyscale-0">
              {locale === "vi"
                ? detail?.nameVN || "Chi tiết câu lạc bộ"
                : detail?.nameEN || "Club details"}
            </DialogTitle>
          </DialogHeader>

          {isDetailLoading ? (
            <div className="flex min-h-25 items-center justify-center">
              <Spinner className="h-5 w-5" />
            </div>
          ) : !detail ? (
            <p className="text-sm text-greyscale-100">
              {locale === "vi"
                ? "Không thể tìm thấy chi tiết câu lạc bộ"
                : "Unable to find club details"}
            </p>
          ) : (
            <div className="flex-1 overflow-y-auto pr-1">
              <div className="space-y-4">
                <div className="relative h-44 w-full overflow-hidden rounded border border-greyscale-700">
                  <Image
                    src={detail.imageUrl || "/images/club-placeholder.jpg"}
                    alt={locale === "vi" ? detail.nameVN : detail.nameEN}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <ClubStatusBadge status={detail.status} />
                  <span className="rounded border border-secondary/40 bg-secondary/15 px-2 py-1 text-xs text-secondary">
                    Code: {detail.clubCode}
                  </span>
                </div>

                {detail.status === "SUSPENDED" && (
                  <div className="rounded border border-primary-300 bg-primary/15 p-2">
                    <p className="text-xs text-primary-300">
                      {locale === "vi"
                        ? "Lý do đình chỉ"
                        : "Reason for suspension"}
                    </p>
                    <p className="text-sm font-medium text-primary-200">
                      {detail.suspendedReason}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded border border-greyscale-700 p-2">
                    <p className="text-xs text-greyscale-100">
                      {locale === "vi" ? "Số thành viên" : "Members"}
                    </p>
                    <p className="text-sm font-medium text-greyscale-0">
                      {detail.totalMembers}/{detail.limitParticipation}
                    </p>
                  </div>

                  <div className="rounded border border-greyscale-700 p-2">
                    <p className="text-xs text-greyscale-100">
                      {locale === "vi" ? "Tổng khóa học" : "Total courses"}
                    </p>
                    <p className="text-sm font-medium text-greyscale-0">
                      {detail.totalCourses}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {detail.creator && (
                    <div className="rounded border border-greyscale-700 bg-greyscale-900/60 p-3">
                      <p className="mb-2 text-sm font-medium text-greyscale-0">
                        {locale === "vi"
                          ? "Quản lý câu lạc bộ"
                          : "Club manager"}
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-greyscale-700">
                          <Image
                            src={
                              detail.creator.imageUrl ||
                              "/images/avatar-placeholder.jpg"
                            }
                            alt={detail.creator.username}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-greyscale-0">
                            {detail.creator.username}
                          </p>
                          <p className="text-xs text-greyscale-100">
                            {detail.creator.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {detail.drone && (
                    <div className="rounded border border-greyscale-700 bg-greyscale-900/60 p-3">
                      <p className="mb-2 text-sm font-medium text-greyscale-0">
                        {locale === "vi" ? "Drone yêu cầu" : "Required drone"}
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded border border-greyscale-700">
                          <Image
                            src={
                              detail.drone.imgURL ||
                              "/images/drone-placeholder.jpg"
                            }
                            alt={
                              locale === "vi"
                                ? detail.drone.droneNameVN
                                : detail.drone.droneNameEN
                            }
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-greyscale-0">
                            {locale === "vi"
                              ? detail.drone.droneNameVN
                              : detail.drone.droneNameEN}
                          </p>
                          <p className="text-xs text-greyscale-100">
                            {locale === "vi"
                              ? detail.drone.droneTypeNameVN
                              : detail.drone.droneTypeNameEN}
                          </p>
                          <p className="text-xs text-greyscale-100">
                            {detail.drone.manufacturer}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {(detail.clubPolicyVN || detail.clubPolicyEN) && (
                  <div className="space-y-3">
                    {detail.clubPolicyVN && (
                      <div className="rounded border border-greyscale-700 bg-greyscale-900/60 p-3">
                        <p className="mb-2 text-sm font-medium text-greyscale-0">
                          {locale === "vi"
                            ? "Nội quy câu lạc bộ"
                            : "Club Policy"}
                        </p>
                        <div
                          className="dv-quill-render ql-editor"
                          dangerouslySetInnerHTML={
                            locale === "vi"
                              ? { __html: detail.clubPolicyVN }
                              : { __html: detail.clubPolicyEN }
                          }
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
