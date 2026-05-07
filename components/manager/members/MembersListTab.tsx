"use client";

import React from "react";
import { TiDeleteOutline } from "react-icons/ti";
import toast from "react-hot-toast";
import ConfirmActionPopover from "@/components/common/ConfirmActionPopover";
import CourseLevelBadge from "@/components/course/CourseLevelBadge";
import EmptyState from "@/components/common/EmptyState";
import GenderBadge from "@/components/common/GenderBadge";
import { TableCustom } from "@/components/common/TableCustom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { TableCell } from "@/components/ui/table";
import {
  useGetClubParticipations,
  useGetClubDetailById,
  useKickClubParticipant,
} from "@/hooks/club/useClub";
import { formatDate, formatDateTime } from "@/lib/utils/format-date";
import { useLocale, useTranslations } from "@/providers/i18n-provider";
import { Tooltip } from "recharts";
import TooltipWrapper from "@/components/common/ToolTipWrapper";

type MembersListTabProps = {
  clubId: string;
};

const PAGE_SIZE = 10;

const getInitials = (firstName?: string, lastName?: string, username?: string) => {
  const full = `${firstName ?? ""} ${lastName ?? ""}`.trim();
  if (full) {
    const parts = full.split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
  }
  return (username || "U").slice(0, 2).toUpperCase();
};

export default function MembersListTab({ clubId }: MembersListTabProps) {
  const [searchText, setSearchText] = React.useState("");
  const [debouncedSearchText, setDebouncedSearchText] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const t = useTranslations("ManagerMembers");
  const locale = useLocale();

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearchText(searchText.trim());
      setCurrentPage(1);
    }, 350);

    return () => clearTimeout(timeout);
  }, [searchText]);

  const { data, isLoading, isError, error } = useGetClubParticipations(clubId, {
    participationName: debouncedSearchText || undefined,
    currentPage,
    pageSize: PAGE_SIZE,
  });

  const { data: clubDetail } = useGetClubDetailById(clubId);
  const clubDroneId = clubDetail?.drone?.droneID ?? null;
  const kickMemberMutation = useKickClubParticipant();

  const members = data?.data ?? [];

  const headers = [
    t("headers.stt"),
    t("headers.avatar"),
    t("headers.name"),
    t("headers.lastName"),
    t("headers.firstName"),
    t("headers.level"),
    t("headers.gender"),
    t("headers.dateOfBirth"),
    t("headers.joinDate"),
    t("headers.actions"),
    
  ];

  const handleKickMember = async (userId: string, memberName: string) => {
    try {
      const response = await kickMemberMutation.mutateAsync({ clubId, userId });
      toast.success(response.message || (locale === "vi" ? `Đã kick ${memberName}.` : `Removed ${memberName}.`));
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (error as { message?: string })?.message ||
        (locale === "vi" ? "Không thể kick thành viên." : "Unable to remove member.");
      toast.error(message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex w-full items-center justify-between">
        <div>
            <h3 className="text-lg font-semibold text-greyscale-0">{t("total")}: <span className="text-primary">{data?.totalRecords ?? 0}</span> {t("member")}</h3>
        </div>
        <div className="w-full max-w-sm">
          <Input
            type="search"
            placeholder={t("searchPlaceholder")}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-40 items-center justify-center">
          <Spinner className="h-5 w-5" />
        </div>
      ) : isError ? (
        <p className="text-sm text-error">
          {error.response?.data?.message ||
            error.message ||
            t("error.loadMembers")}
        </p>
      ) : members.length === 0 ? (
        <EmptyState title={t("empty.members")} />
      ) : (
        <TableCustom
          headers={headers}
          data={members}
          pagination={{
            currentPage: data?.pageIndex ?? currentPage,
            pageSize: data?.pageSize ?? PAGE_SIZE,
            totalItems: data?.totalRecords ?? 0,
            onPageChange: setCurrentPage,
          }}
          renderRow={(member, index) => (
            <>
              <TableCell className="text-greyscale-100">
                {(data?.pageIndex
                  ? (data.pageIndex - 1) * (data.pageSize || PAGE_SIZE)
                  : 0) +
                  index +
                  1}
              </TableCell>
              <TableCell>
                <Avatar className="mx-auto h-12 w-12 overflow-hidden border border-greyscale-700 shadow-sm">
                  <AvatarImage
                    src={member.imageUrl || undefined}
                    alt={member.username}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-greyscale-700 text-xs text-greyscale-50">
                    {getInitials(member.firstName, member.lastName, member.username)}
                  </AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell>
                <div className="space-y-0.5">
                  <p className="font-medium text-greyscale-0">{member.username}</p>
                  <p className="text-xs text-greyscale-400">{member.email}</p>
                </div>
              </TableCell>
              <TableCell className="text-greyscale-50">
                {member.lastName}
              </TableCell>
              <TableCell className="text-greyscale-50">
                {member.firstName}
              </TableCell>
              <TableCell>
                {(() => {
                  const levelEntry = clubDroneId
                    ? member.userLevelMax?.find(
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
                <GenderBadge gender={member.gender} />
              </TableCell>
              <TableCell className="text-greyscale-50">
                {formatDate(member.dateOfBirth)}
              </TableCell>
              <TableCell className="text-greyscale-50">
                {formatDateTime(member.joinDate ?? null)}
              </TableCell>
              <TableCell>
                <ConfirmActionPopover
                  title={locale === "vi" ? "Loại thành viên?" : "Kick member?"}
                  description={
                    locale === "vi"
                      ? `Xác nhận loại ${member.username} khỏi câu lạc bộ?`
                      : `Confirm removing ${member.username} from the club?`
                  }
                  confirmText={locale === "vi" ? "Loại" : "Remove"}
                  cancelText={locale === "vi" ? "Hủy" : "Cancel"}
                  isLoading={kickMemberMutation.isPending}
                  onConfirm={() => handleKickMember(member.userId, member.username)}
                  trigger={
                    <TooltipWrapper label={locale === "vi" ? "Loại thành viên" : "Kick member"}>
                    <Button
                      type="button"
                      variant="deleteIcon"
                      size="icon"
                      disabled={kickMemberMutation.isPending}
                    >
                      <TiDeleteOutline size={20} />
                    </Button>
                    </TooltipWrapper>
                  }
                />
              </TableCell>
            </>
          )}
        />
      )}
    </div>
  );
}

