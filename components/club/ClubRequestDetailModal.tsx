"use client";

import Image from "next/image";
import { useState } from "react";
import { CiLock, CiUnlock } from "react-icons/ci";
import { GrUserManager } from "react-icons/gr";
import { IoPeopleOutline } from "react-icons/io5";

import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatDateWithTime } from "@/lib/utils/format-date";
import { ClubCreationRequestItem } from "@/validations/club-creation/club-creation";
import ClubRequestStatusBadge from "@/components/club/ClubRequestStatusBadge";
import { useLocale, useTranslations } from "@/providers/i18n-provider";
import { useUpdateClubCreationRequestStatus } from "@/hooks/club-creation/useClubCreation";
import toast from "react-hot-toast";

type ClubRequestDetailModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
  detail: ClubCreationRequestItem | undefined;
};

type FieldBlockProps = {
  label: string;
  children: React.ReactNode;
};

type DateBlockProps = {
  label: string;
  date?: string | null;
};

function FieldBlock({ label, children }: FieldBlockProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-greyscale-0 font-medium">{label}</p>
      <div className="px-2">{children}</div>
    </div>
  );
}

function DateBlock({ label, date }: DateBlockProps) {
  if (!date) return null;

  const formatted = formatDateWithTime(date);

  return (
    <div>
      <p className="text-sm font-medium text-greyscale-0 mb-0.5">{label}</p>
      <div className="p-2">
        <p className="text-xs font-medium text-greyscale-50">{formatted.day}</p>
        <p className="text-xs text-greyscale-100">{formatted.time}</p>
      </div>
    </div>
  );
}

export function ClubRequestDetailModal({
  open,
  onOpenChange,
  isLoading,
  detail,
}: ClubRequestDetailModalProps) {
  const t = useTranslations("RegisterClubDialog");
  const locale = useLocale();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const updateStatusMutation = useUpdateClubCreationRequestStatus();

  const handleApprove = () => {
    if (!detail) return;

    updateStatusMutation.mutate(
      {
        id: detail.clubCreationRequestID,
        data: {
          status: "APPROVED",
          rejectReason: null,
        },
      },
      {
        onSuccess: (data) => {
          toast.success(data.message);
        },
        onError: (error) => {
          toast.error(
            error.response?.data?.message || error.message,
          );
        },
      },
    );
  };

  const handleOpenReject = () => {
    setRejectReason("");
    setRejectOpen(true);
  };

  const handleConfirmReject = () => {
    if (!detail) return;

    const trimmedReason = rejectReason.trim();
    if (!trimmedReason) {
      toast.error(t("reject.validation"));
      return;
    }

    updateStatusMutation.mutate(
      {
        id: detail.clubCreationRequestID,
        data: {
          status: "REJECTED",
          rejectReason: trimmedReason,
        },
      },
      {
        onSuccess: (data) => {
          setRejectOpen(false);
          toast.success(data.message);
        },
        onError: (error) => {
          toast.error(
            error.response?.data?.message || error.message ,
          );
        },
      },
    );
  };

  const isPendingAction =
    detail?.status === "PENDING" && !isLoading && Boolean(detail);

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          onOpenChange(nextOpen);
          if (!nextOpen) {
            setRejectOpen(false);
            setRejectReason("");
          }
        }}
      >
        <DialogContent className="max-w-lg flex flex-col max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-lg text-greyscale-0">
              {locale === "vi"
                ? detail?.nameVN
                : detail?.nameEN || t("viewTitle")}
            </DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div className="flex min-h-25 items-center justify-center">
              <Spinner className="h-5 w-5" />
            </div>
          ) : detail ? (
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-3 pr-4">
                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  <ClubRequestStatusBadge status={detail.status} />
                </div>

                {/* Reject Reason */}
                {detail.rejectReason && (
                  <div className="rounded bg-error/10 border border-error/30 p-2">
                    <p className="text-sm font-medium text-error mb-1">
                      {t("fields.rejectReason")}
                    </p>
                    <p className="text-sm px-2 text-error/90">
                      {detail.rejectReason}
                    </p>
                  </div>
                )}

                {detail.status === "APPROVED" && (
                  <div className="rounded border border-success/30 bg-success/10 p-2 text-success">
                    <p className="mb-1 text-sm font-medium">
                      {t("fields.approveBy")}
                    </p>

                    <div className="px-2 text-sm text-success/90">
                      <p>{detail.approverName}</p>
                      <p>{detail.approverEmail}</p>
                    </div>
                  </div>
                )}

                {/* Tên Club */}
                <FieldBlock label={t("fields.nameVi")}>
                  <p className="text-sm text-greyscale-50">{detail.nameVN}</p>
                </FieldBlock>
                <FieldBlock label={t("fields.nameEn")}>
                  <p className="text-sm text-greyscale-50">{detail.nameEN}</p>
                </FieldBlock>

                {/* Mô tả */}
                {detail.description && (
                  <FieldBlock label={t("fields.description")}>
                    <p className="text-sm text-greyscale-50 leading-relaxed">
                      {detail.description}
                    </p>
                  </FieldBlock>
                )}

                {/* Danh mục */}
                {detail.categories.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-greyscale-0 font-medium">
                      {t("fields.category")}
                    </p>
                    <div className="flex flex-wrap gap-1 px-2">
                      {detail.categories.map((cat) => (
                        <span
                          key={cat.categoryId}
                          className="rounded border border-greyscale-600 px-2 py-0.5 text-xs text-greyscale-100"
                        >
                          {locale === "vi" ? cat.typeNameVN : cat.typeNameEN}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ảnh */}
                {detail.imageUrl && (
                  <FieldBlock label={t("fields.coverImage")}>
                    <div className="relative h-40 w-full">
                      <Image
                        src={detail.imageUrl}
                        alt={locale === "vi" ? detail.nameVN : detail.nameEN}
                        fill
                        className="rounded border border-greyscale-700 object-contain p-2"
                      />
                    </div>
                  </FieldBlock>
                )}

                {/* Chế độ, Giới hạn thành viên, Giới hạn quản lý */}
                <div className="grid grid-cols-3 gap-2 border-t border-greyscale-700 pt-2">
                  <div>
                    <p className="text-sm font-medium text-greyscale-0 mb-0.5">
                      {t("fields.mode")}
                    </p>
                    <div className="p-2">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded px-2 py-1 text-xs border",
                          detail.isPublic
                            ? "bg-secondary/15 text-secondary border-secondary/40"
                            : "bg-primary/15 text-primary border-primary/40",
                        )}
                      >
                        {detail.isPublic ? (
                          <CiUnlock size={13} />
                        ) : (
                          <CiLock size={13} />
                        )}
                        {detail.isPublic
                          ? t("privacy.public")
                          : t("privacy.private")}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-greyscale-0 mb-0.5">
                      {t("fields.limitMembers")}
                    </p>
                    <div className="p-2">
                      <span className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs border bg-primary/15 text-primary border-primary/40">
                        <IoPeopleOutline />
                        {detail.limitParticipant}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-greyscale-0 mb-0.5">
                      {t("fields.limitManagers")}
                    </p>
                    <div className="p-2">
                      <span className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs border bg-primary/15 text-primary border-primary/40">
                        <GrUserManager />
                        {detail.limitClubManager}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ngày tạo, cập nhật, duyệt */}
                <div className="grid grid-cols-3 gap-2 border-t border-greyscale-700 pt-2">
                  <DateBlock
                    label={t("fields.createAt")}
                    date={detail.createdAt}
                  />
                  <DateBlock
                    label={t("fields.updatedAt")}
                    date={detail.updatedAt}
                  />
                  <DateBlock
                    label={t("fields.approvedAt")}
                    date={detail.approvedAt}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-xs text-error">{t("empty")}</div>
          )}

          {isPendingAction && (
            <DialogFooter className="mt-2 border-t border-greyscale-700 pt-3">
              <Button
                type="button"
                className="w-full sm:w-auto"
                onClick={handleOpenReject}
                disabled={updateStatusMutation.isPending}
              >
                {t("buttons.reject")}
              </Button>
              <Button
                type="button"
                variant={"secondary"}
                className="w-full sm:w-auto"
                onClick={handleApprove}
                disabled={updateStatusMutation.isPending}
              >
                {t("buttons.approve")}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("reject.title")}</DialogTitle>
            <DialogDescription>
              {t("reject.description")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Textarea
              value={rejectReason}
              onChange={(e) => {
                setRejectReason(e.target.value);
              }}
              placeholder={t("reject.placeholder")}
              rows={4}
            />
            {updateStatusMutation.error?.response?.data?.message && (
              <p className="text-xs text-error">
                {updateStatusMutation.error.response.data.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRejectOpen(false)}
              disabled={updateStatusMutation.isPending}
            >
              {t("buttons.cancel")}
            </Button>
            <Button
              type="button"
              onClick={handleConfirmReject}
              disabled={updateStatusMutation.isPending}
            >
              {t("buttons.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
