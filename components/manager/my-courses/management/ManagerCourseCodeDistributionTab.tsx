"use client";

import React from "react";
import toast from "react-hot-toast";

import CommonDropdown, {
  type CommonDropdownOption,
} from "@/components/common/CommonDropdown";
import EmptyState from "@/components/common/EmptyState";
import InlineFilterRow, {
  type InlineFilterOption,
} from "@/components/common/InlineFilterRow";
import { TableCustom } from "@/components/common/TableCustom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { TableCell } from "@/components/ui/table";
import {
  useAssignCodeToUser,
  useBulkAssignCodesToUsers,
  useGetCourseCodesByClub,
  useGetCourseUsersCodesByClub,
} from "@/hooks/code/useCode";
import type {
  CourseCodeUserItem,
  UserCodesState,
} from "@/validations/code/code";

type ManagerCourseCodeDistributionTabProps = {
  clubId: string;
  courseId: string;
};

const PAGE_SIZE = 5;
const EMPTY_CODES: Array<{ code: string }> = [];

const areStringArraysEqual = (left: string[], right: string[]) => {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => value === right[index]);
};

const getInitials = (fullName: string) => {
  const parts = fullName.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
};

export default function ManagerCourseCodeDistributionTab({
  clubId,
  courseId,
}: ManagerCourseCodeDistributionTabProps) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [fullName, setFullName] = React.useState("");
  const [userCodesState, setUserCodesState] =
    React.useState<UserCodesState | null>("User_No_Codes");
  const [assignDialogOpen, setAssignDialogOpen] = React.useState(false);
  const [singleAssignDialogOpen, setSingleAssignDialogOpen] =
    React.useState(false);
  const [singleAssignUser, setSingleAssignUser] =
    React.useState<CourseCodeUserItem | null>(null);
  const [singleSelectedCodeId, setSingleSelectedCodeId] = React.useState("");
  const [selectedUserIds, setSelectedUserIds] = React.useState<string[]>([]);
  const [selectedCodeIds, setSelectedCodeIds] = React.useState<string[]>([]);
  const [sendEmail, setSendEmail] = React.useState(true);

  const usersCodesQuery = useGetCourseUsersCodesByClub(clubId, courseId, {
    fullName: fullName.trim() || undefined,
    userCodes: userCodesState ?? undefined,
    currentPage,
    pageSize: PAGE_SIZE,
  });
  const availableCodesQuery = useGetCourseCodesByClub(
    userCodesState === "User_No_Codes" ? clubId : undefined,
    userCodesState === "User_No_Codes" ? courseId : undefined,
    {
      codeUseState: "UnUse",
      codeOwnState: "UnUserOwned",
      currentPage: 1,
      pageSize: 20,
    },
  );
  const assignCodeMutation = useAssignCodeToUser();
  const bulkAssignMutation = useBulkAssignCodesToUsers();

  const usersPaging = usersCodesQuery.data;
  const users = usersPaging?.data ?? [];
  const availableCodes = React.useMemo(
    () => availableCodesQuery.data?.codesItem.data ?? EMPTY_CODES,
    [availableCodesQuery.data?.codesItem.data],
  );
  const availableCodesTotal =
    availableCodesQuery.data?.codesItem.totalRecords ?? 0;
  const showAssignAction = userCodesState === "User_No_Codes";
  const maxSelectableUsers = Math.min(20, availableCodesTotal);
  const selectedUsersCount = selectedUserIds.length;
  const availableCodeOptions: CommonDropdownOption[] = availableCodes.map(
    (code) => ({
      value: code.code,
      label: code.code,
    }),
  );

  const currentPageUserIds = React.useMemo(
    () => users.map((user) => user.userId),
    [users],
  );
  const selectedOnCurrentPageCount = React.useMemo(
    () => currentPageUserIds.filter((id) => selectedUserIds.includes(id)).length,
    [currentPageUserIds, selectedUserIds],
  );
  const isAllCurrentPageSelected =
    currentPageUserIds.length > 0 &&
    selectedOnCurrentPageCount === currentPageUserIds.length;

  const headers = showAssignAction
    ? ["Chọn", "STT", "Avatar", "Họ và tên", "Email", "Thao tác"]
    : ["STT", "Avatar", "Họ và tên", "Email"];

  const userCodesFilterOptions: InlineFilterOption<UserCodesState>[] = [
    { value: "User_Has_Codes", label: "Đã có mã" },
    { value: "User_No_Codes", label: "Chưa có mã" },
  ];

  React.useEffect(() => {
    setCurrentPage(1);
  }, [fullName, userCodesState]);

  React.useEffect(() => {
    if (!showAssignAction) {
      if (selectedUserIds.length > 0) {
        setSelectedUserIds([]);
      }
      if (selectedCodeIds.length > 0) {
        setSelectedCodeIds([]);
      }
      if (assignDialogOpen) {
        setAssignDialogOpen(false);
      }
      if (singleAssignDialogOpen) {
        setSingleAssignDialogOpen(false);
      }
    }
  }, [
    assignDialogOpen,
    selectedCodeIds.length,
    selectedUserIds.length,
    showAssignAction,
    singleAssignDialogOpen,
  ]);

  React.useEffect(() => {
    if (!assignDialogOpen) {
      if (selectedCodeIds.length > 0) {
        setSelectedCodeIds([]);
      }
      return;
    }

    const defaultCodes = availableCodes
      .slice(0, selectedUsersCount)
      .map((code) => code.code);

    if (
      defaultCodes.length > 0 &&
      !areStringArraysEqual(defaultCodes, selectedCodeIds)
    ) {
      setSelectedCodeIds(defaultCodes);
    }
  }, [assignDialogOpen, availableCodes, selectedUsersCount, selectedCodeIds]);

  React.useEffect(() => {
    if (!singleAssignDialogOpen) {
      if (singleSelectedCodeId) {
        setSingleSelectedCodeId("");
      }
      return;
    }

    if (!singleSelectedCodeId && availableCodes.length > 0) {
      setSingleSelectedCodeId(availableCodes[0]?.code ?? "");
    }
  }, [singleAssignDialogOpen, availableCodes, singleSelectedCodeId]);

  const handleToggleUser = (user: CourseCodeUserItem) => {
    const isSelected = selectedUserIds.includes(user.userId);

    if (isSelected) {
      setSelectedUserIds((previous) =>
        previous.filter((id) => id !== user.userId),
      );
      return;
    }

    if (maxSelectableUsers <= 0) {
      toast.error("Hiện không còn mã khả dụng để gán.");
      return;
    }

    if (selectedUsersCount >= maxSelectableUsers) {
      toast.error(
        `Chỉ được chọn tối đa ${maxSelectableUsers} thành viên cho mỗi lần gửi.`,
      );
      return;
    }

    setSelectedUserIds((previous) => [...previous, user.userId]);
  };

  const handleToggleSelectAllCurrentPage = () => {
    if (currentPageUserIds.length === 0) {
      return;
    }

    if (isAllCurrentPageSelected) {
      setSelectedUserIds((previous) =>
        previous.filter((id) => !currentPageUserIds.includes(id)),
      );
      return;
    }

    const unselectedIds = currentPageUserIds.filter(
      (id) => !selectedUserIds.includes(id),
    );
    const remainingSlots = Math.max(maxSelectableUsers - selectedUsersCount, 0);

    if (remainingSlots <= 0) {
      toast.error("Đã đạt giới hạn chọn thành viên.");
      return;
    }

    const idsToAdd = unselectedIds.slice(0, remainingSlots);
    if (idsToAdd.length < unselectedIds.length) {
      toast.error(`Chỉ có thể chọn thêm ${remainingSlots} thành viên.`);
    }

    setSelectedUserIds((previous) => [...previous, ...idsToAdd]);
  };

  const handleOpenAssignDialog = () => {
    if (selectedUsersCount === 0) {
      toast.error("Vui lòng chọn ít nhất 1 thành viên.");
      return;
    }

    setAssignDialogOpen(true);
  };

  const handleOpenSingleAssignDialog = (user: CourseCodeUserItem) => {
    setSingleAssignUser(user);
    setSingleAssignDialogOpen(true);
  };

  const handleAssignCodeToSingleUser = async () => {
    if (!singleAssignUser) {
      return;
    }

    if (!singleSelectedCodeId) {
      toast.error("Vui lòng chọn mã code để gửi.");
      return;
    }

    try {
      const result = await assignCodeMutation.mutateAsync({
        codeId: singleSelectedCodeId,
        userId: singleAssignUser.userId,
        sendEmail,
      });

      toast.success(result.message || "Gửi mã thành công.");
      setSingleAssignDialogOpen(false);
      setSingleAssignUser(null);
      setSingleSelectedCodeId("");
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Gửi mã thất bại. Vui lòng thử lại.";
      toast.error(message);
    }
  };

  const handleAssignCodesInBulk = async () => {
    if (selectedUsersCount === 0) {
      toast.error("Vui lòng chọn ít nhất 1 thành viên.");
      return;
    }

    if (selectedUsersCount > 20) {
      toast.error("Mỗi lần chỉ được gửi tối đa 20 thành viên.");
      return;
    }

    if (selectedUsersCount > availableCodesTotal) {
      toast.error("Số thành viên được chọn vượt quá số mã khả dụng.");
      return;
    }

    if (selectedCodeIds.length !== selectedUsersCount) {
      toast.error("Vui lòng chọn số mã code bằng với số thành viên đã chọn.");
      return;
    }

    try {
      const result = await bulkAssignMutation.mutateAsync({
        items: selectedUserIds.map((userId, index) => ({
          userId,
          codeId: selectedCodeIds[index] ?? "",
        })),
        sendEmail,
      });

      toast.success(result.message || "Gửi mã hàng loạt thành công.");
      setAssignDialogOpen(false);
      setSelectedUserIds([]);
      setSelectedCodeIds([]);
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Gửi mã hàng loạt thất bại. Vui lòng thử lại.";
      toast.error(message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded border border-greyscale-700 bg-greyscale-900/70 p-4 md:flex-row md:items-center md:justify-between">
        <InlineFilterRow
          label="Thành viên:"
          selectedValue={userCodesState}
          options={userCodesFilterOptions}
          onChange={setUserCodesState}
          showAllOption={false}
        />

        <Input
          type="search"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          placeholder="Tìm theo họ tên"
          className="w-full md:w-72"
        />
      </div>

      {showAssignAction ? (
        <div className="flex flex-col gap-2 rounded border border-greyscale-700 bg-greyscale-900/70 p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-col gap-1">
            <p className="text-sm text-greyscale-50">
              Đã chọn{" "}
              <span className="font-semibold text-greyscale-0">
                {selectedUsersCount}
              </span>{" "}
              thành viên (tối đa 20).
            </p>
            <p className="text-md text-greyscale-0">
              Mã khả dụng:{" "}
              <span className="font-semibold text-primary">{availableCodesTotal}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleToggleSelectAllCurrentPage}
              disabled={users.length === 0 || availableCodesTotal === 0}
            >
              {isAllCurrentPageSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
            </Button>

            <Button
              type="button"
              onClick={handleOpenAssignDialog}
              disabled={
                selectedUsersCount === 0 ||
                availableCodesQuery.isLoading ||
                availableCodesTotal === 0
              }
            >
              Gửi mã hàng loạt
            </Button>
          </div>
        </div>
      ) : null}

      {usersCodesQuery.isLoading ? (
        <div className="flex min-h-40 items-center justify-center">
          <Spinner className="h-5 w-5" />
        </div>
      ) : usersCodesQuery.isError ? (
        <p className="text-sm text-error">
          {usersCodesQuery.error.response?.data?.message ||
            usersCodesQuery.error.message ||
            "Không tải được danh sách thành viên."}
        </p>
      ) : users.length === 0 ? (
        <EmptyState title="Không có thành viên phù hợp" />
      ) : (
        <TableCustom
          headers={headers}
          data={users}
          pagination={{
            currentPage: usersPaging?.pageIndex ?? currentPage,
            pageSize: usersPaging?.pageSize ?? PAGE_SIZE,
            totalItems: usersPaging?.totalRecords ?? 0,
            onPageChange: setCurrentPage,
          }}
          renderRow={(user, index) => {
            const currentPageIndex = (usersPaging?.pageIndex ?? 1) - 1;
            const pageSize = usersPaging?.pageSize ?? PAGE_SIZE;
            const isRowSelected = selectedUserIds.includes(user.userId);
            const selectedRowClassName = isRowSelected
              ? "bg-primary-200/10"
              : undefined;

            return (
              <>
                {showAssignAction ? (
                  <TableCell className={selectedRowClassName}>
                    <input
                      type="checkbox"
                      checked={isRowSelected}
                      onChange={() => handleToggleUser(user)}
                      disabled={
                        !isRowSelected &&
                        (selectedUsersCount >= maxSelectableUsers ||
                          maxSelectableUsers === 0)
                      }
                      className="h-4 w-4 accent-primary"
                    />
                  </TableCell>
                ) : null}
                <TableCell className={`text-greyscale-100 ${selectedRowClassName ?? ""}`}>
                  {currentPageIndex * pageSize + index + 1}
                </TableCell>
                <TableCell className={selectedRowClassName}>
                  <Avatar className="h-10 w-10 border border-greyscale-700">
                    <AvatarImage
                      src={user.avatarUrl || undefined}
                      alt={user.fullName}
                    />
                    <AvatarFallback className="bg-greyscale-700 text-xs text-greyscale-50">
                      {getInitials(user.fullName)}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell
                  className={`font-medium text-greyscale-0 ${selectedRowClassName ?? ""}`}
                >
                  {user.fullName}
                </TableCell>
                <TableCell
                  className={`text-greyscale-50 ${selectedRowClassName ?? ""}`}
                >
                  {user.email}
                </TableCell>
                {showAssignAction ? (
                  <TableCell className={selectedRowClassName}>
                    <Button
                      variant="secondary"
                      onClick={() => handleOpenSingleAssignDialog(user)}
                    >
                      Gửi mã
                    </Button>
                  </TableCell>
                ) : null}
              </>
            );
          }}
        />
      )}

      <Dialog
        open={singleAssignDialogOpen}
        onOpenChange={setSingleAssignDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Gửi mã cho thành viên</DialogTitle>
            <DialogDescription>
              {singleAssignUser
                ? `Chọn mã code để gửi cho ${singleAssignUser.fullName}.`
                : "Chọn mã code để gửi cho thành viên."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-2">
              <p className="text-sm text-greyscale-50">Mã khả dụng</p>
              {availableCodesQuery.isLoading ? (
                <div className="flex items-center gap-2 text-sm text-greyscale-100">
                  <Spinner className="h-4 w-4" />
                  Đang tải danh sách mã...
                </div>
              ) : availableCodesQuery.isError ? (
                <p className="text-sm text-error">
                  {availableCodesQuery.error.response?.data?.message ||
                    availableCodesQuery.error.message ||
                    "Không tải được danh sách mã khả dụng."}
                </p>
              ) : availableCodes.length === 0 ? (
                <p className="text-sm text-greyscale-100">
                  Không còn mã chưa sở hữu và chưa sử dụng.
                </p>
              ) : (
                <CommonDropdown
                  value={singleSelectedCodeId}
                  onChange={setSingleSelectedCodeId}
                  options={availableCodeOptions}
                  placeholder="Chọn mã code"
                  menuLabel="Mã khả dụng"
                />
              )}
            </div>

            <div className="flex items-center justify-between rounded border border-greyscale-700 bg-greyscale-800/40 px-3 py-2">
              <p className="text-sm text-greyscale-50">Gửi email thông báo</p>
              <Switch checked={sendEmail} onCheckedChange={setSendEmail} />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSingleAssignDialogOpen(false)}
              disabled={assignCodeMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleAssignCodeToSingleUser}
              disabled={
                assignCodeMutation.isPending ||
                availableCodesQuery.isLoading ||
                availableCodes.length === 0 ||
                !singleSelectedCodeId
              }
            >
              {assignCodeMutation.isPending ? "Đang gửi..." : "Xác nhận gửi mã"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Gửi mã cho nhiều thành viên</DialogTitle>
            <DialogDescription>
              Chọn {selectedUsersCount} mã code để gửi cho {selectedUsersCount}{" "}
              thành viên đã chọn.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-2">
              <p className="text-sm text-greyscale-50">Mã khả dụng</p>
              {availableCodesQuery.isLoading ? (
                <div className="flex items-center gap-2 text-sm text-greyscale-100">
                  <Spinner className="h-4 w-4" />
                  Đang tải danh sách mã...
                </div>
              ) : availableCodesQuery.isError ? (
                <p className="text-sm text-error">
                  {availableCodesQuery.error.response?.data?.message ||
                    availableCodesQuery.error.message ||
                    "Không tải được danh sách mã khả dụng."}
                </p>
              ) : availableCodes.length === 0 ? (
                <p className="text-sm text-greyscale-100">
                  Không còn mã chưa sở hữu và chưa sử dụng.
                </p>
              ) : (
                <CommonDropdown
                  multiple
                  value={selectedCodeIds}
                  maxLabelCount={2}
                  onChange={(value) => {
                    const limitedValue = value.slice(0, selectedUsersCount);
                    if (value.length > selectedUsersCount) {
                      toast.error(
                        `Chỉ được chọn tối đa ${selectedUsersCount} mã cho ${selectedUsersCount} thành viên.`,
                      );
                    }
                    setSelectedCodeIds(limitedValue);
                  }}
                  options={availableCodeOptions}
                  placeholder="Chọn mã code"
                  menuLabel="Mã khả dụng"
                />
              )}
              <p className="text-xs text-greyscale-100">
                Đã chọn {selectedCodeIds.length}/{selectedUsersCount} mã.
              </p>
            </div>

            <div className="flex items-center justify-between rounded border border-greyscale-700 bg-greyscale-800/40 px-3 py-2">
              <p className="text-sm text-greyscale-50">Gửi email thông báo</p>
              <Switch checked={sendEmail} onCheckedChange={setSendEmail} />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setAssignDialogOpen(false)}
              disabled={bulkAssignMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleAssignCodesInBulk}
              disabled={
                bulkAssignMutation.isPending ||
                availableCodesQuery.isLoading ||
                availableCodes.length === 0 ||
                selectedCodeIds.length !== selectedUsersCount ||
                selectedUsersCount === 0
              }
            >
              {bulkAssignMutation.isPending ? "Đang gửi..." : "Xác nhận gửi mã"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export type { ManagerCourseCodeDistributionTabProps };
