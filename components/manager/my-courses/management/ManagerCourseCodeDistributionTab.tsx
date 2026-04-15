"use client";

import React from "react";

import EmptyState from "@/components/common/EmptyState";
import { TableCustom } from "@/components/common/TableCustom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { TableCell } from "@/components/ui/table";
import { useGetCourseUsersCodesByClub } from "@/hooks/code/useCode";
import type { UserCodesState } from "@/validations/code/code";

type ManagerCourseCodeDistributionTabProps = {
  clubId: string;
  courseId: string;
};

const PAGE_SIZE = 5;

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
  const [email, setEmail] = React.useState("");
  const [userCodesState, setUserCodesState] = React.useState<"ALL" | UserCodesState>(
    "ALL",
  );

  const usersCodesQuery = useGetCourseUsersCodesByClub(clubId, courseId, {
    fullName: fullName.trim() || undefined,
    email: email.trim() || undefined,
    userCodes: userCodesState === "ALL" ? undefined : userCodesState,
    currentPage,
    pageSize: PAGE_SIZE,
  });

  const usersPaging = usersCodesQuery.data;
  const users = usersPaging?.data ?? [];

  const headers = ["STT", "Avatar", "Họ và tên", "Email"];

  React.useEffect(() => {
    setCurrentPage(1);
  }, [fullName, email, userCodesState]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded border border-greyscale-700 bg-greyscale-900/70 p-4 md:grid-cols-3">
        <Input
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          placeholder="Lọc theo họ tên"
        />

        <Input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Lọc theo email"
        />

        <Select
          value={userCodesState}
          onValueChange={(value) => setUserCodesState(value as "ALL" | UserCodesState)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Trạng thái mã" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả</SelectItem>
            <SelectItem value="User_Has_Codes">Đã có mã</SelectItem>
            <SelectItem value="User_No_Codes">Chưa có mã</SelectItem>
          </SelectContent>
        </Select>
      </div>

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

            return (
              <>
                <TableCell className="text-greyscale-100">
                  {currentPageIndex * pageSize + index + 1}
                </TableCell>
                <TableCell>
                  <Avatar className="h-10 w-10 border border-greyscale-700">
                    <AvatarImage src={user.avatarUrl || undefined} alt={user.fullName} />
                    <AvatarFallback className="bg-greyscale-700 text-xs text-greyscale-50">
                      {getInitials(user.fullName)}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium text-greyscale-0">
                  {user.fullName}
                </TableCell>
                <TableCell className="text-greyscale-50">{user.email}</TableCell>
              </>
            );
          }}
        />
      )}
    </div>
  );
}

export type { ManagerCourseCodeDistributionTabProps };
