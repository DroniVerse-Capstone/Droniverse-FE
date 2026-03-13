"use client";

import Image from "next/image";
import { CiLock, CiUnlock } from "react-icons/ci";
import { GrUserManager } from "react-icons/gr";
import { IoPeopleOutline } from "react-icons/io5";

import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { formatDateWithTime } from "@/lib/utils/format-date";
import { ClubCreationRequestItem } from "@/validations/club-creation/club-creation";
import ClubRequestStatusBadge from "@/components/club/ClubRequestStatusBadge";

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-lg text-greyscale-0">
            {detail?.nameVN || "Chi tiết yêu cầu"}
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
                    Lý do từ chối:
                  </p>
                  <p className="text-sm px-2 text-error/90">{detail.rejectReason}</p>
                </div>
              )}

              {/* Tên Club */}
              <FieldBlock label="Tên Club (VN)">
                <p className="text-sm text-greyscale-50">{detail.nameVN}</p>
              </FieldBlock>
              <FieldBlock label="Tên Club (EN)">
                <p className="text-sm text-greyscale-50">{detail.nameEN}</p>
              </FieldBlock>

              {/* Mô tả */}
              {detail.description && (
                <FieldBlock label="Mô tả">
                  <p className="text-sm text-greyscale-50 leading-relaxed">
                    {detail.description}
                  </p>
                </FieldBlock>
              )}

              {/* Danh mục */}
              {detail.categories.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-greyscale-0 font-medium">
                    Danh mục
                  </p>
                  <div className="flex flex-wrap gap-1 px-2">
                    {detail.categories.map((cat) => (
                      <span
                        key={cat.categoryId}
                        className="rounded border border-greyscale-600 px-2 py-0.5 text-xs text-greyscale-100"
                      >
                        {cat.typeNameVN}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Ảnh */}
              {detail.imageUrl && (
                <FieldBlock label="Ảnh Club">
                  <div className="relative h-40 w-full">
                    <Image
                      src={detail.imageUrl}
                      alt={detail.nameVN}
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
                    Chế độ
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
                      {detail.isPublic ? "Công khai" : "Riêng tư"}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-greyscale-0 mb-0.5">
                    Giới hạn thành viên
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
                    Giới hạn quản lý
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
                <DateBlock label="Ngày tạo" date={detail.createdAt} />
                <DateBlock label="Cập nhật" date={detail.updatedAt} />
                <DateBlock label="Ngày duyệt" date={detail.approvedAt} />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-xs text-error">
            Không tìm thấy dữ liệu
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
