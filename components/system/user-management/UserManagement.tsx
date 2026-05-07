"use client";

import React from "react";
import { AxiosError } from "axios";
import { RefreshCw, Search, Users } from "lucide-react";

import EmptyState from "@/components/common/EmptyState";
import CommonDropdown from "@/components/common/CommonDropdown";
import { TableCustom } from "@/components/common/TableCustom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { TableCell } from "@/components/ui/table";
import { useGetUsers } from "@/hooks/user/useUser";
import { useDebounce } from "@/hooks/useDebounce";
import { formatDate } from "@/lib/utils/format-date";
import { useLocale } from "@/providers/i18n-provider";
import { ApiError } from "@/types/api/common";
import type {
  SortDirection,
  SystemUser,
  SystemUserRoleName,
} from "@/validations/user/user";
import GenderBadge from "@/components/common/GenderBadge";

const PAGE_SIZE = 10;

const ROLE_OPTIONS: Array<{ value: string; labelVi: string; labelEn: string }> = [
  { value: "", labelVi: "Tất cả vai trò", labelEn: "All roles" },
  { value: "ADMIN", labelVi: "Quản trị viên", labelEn: "Admin" },
  { value: "SYSTEM_MANAGER", labelVi: "Quản lý hệ thống", labelEn: "System manager" },
  { value: "CLUB_MANAGER", labelVi: "Quản lý câu lạc bộ", labelEn: "Club manager" },
  { value: "CLUB_MEMBER", labelVi: "Thành viên", labelEn: "Club member" },
];

const SORT_OPTIONS: Array<{ value: string; labelVi: string; labelEn: string }> = [
  { value: "", labelVi: "Mặc định", labelEn: "Default" },
  { value: "Asc", labelVi: "Tăng dần", labelEn: "Ascending" },
  { value: "Desc", labelVi: "Giảm dần", labelEn: "Descending" },
];

function getInitials(firstName: string, lastName: string, username: string) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.trim().toUpperCase() ||
    username?.[0]?.toUpperCase() ||
    "U";
}

function getGenderLabel(locale: string, gender?: string | null) {
  const genderMap: Record<string, { vi: string; en: string }> = {
    MALE: { vi: "Nam", en: "Male" },
    FEMALE: { vi: "Nữ", en: "Female" },
    UNKNOWN: { vi: "Không xác định", en: "Unknown" },
  };

  return gender ? genderMap[gender]?.[locale === "vi" ? "vi" : "en"] ?? gender : "—";
}

function getRoleLabel(locale: string, roleName?: string | null) {
  const roleMap: Record<SystemUserRoleName, { vi: string; en: string }> = {
    ADMIN: { vi: "Quản trị viên", en: "Admin" },
    SYSTEM_MANAGER: { vi: "Quản lý hệ thống", en: "System manager" },
    CLUB_MANAGER: { vi: "Quản lý câu lạc bộ", en: "Club manager" },
    CLUB_MEMBER: { vi: "Thành viên", en: "Club member" },
  };

  if (!roleName || !(roleName in roleMap)) {
    return roleName || "—";
  }

  return roleMap[roleName as SystemUserRoleName][locale === "vi" ? "vi" : "en"];
}

function getRoleBadgeClass(roleName?: string | null) {
  switch (roleName) {
    case "ADMIN":
      return "bg-primary/15 text-primary border border-primary/40";
    case "SYSTEM_MANAGER":
      return "bg-tertiary/15 text-tertiary border border-tertiary/40";
    case "CLUB_MANAGER":
      return "bg-warning/15 text-warning border border-warning/40";
    case "CLUB_MEMBER":
      return "bg-secondary/15 text-secondary border border-secondary/40";
    default:
      return "bg-greyscale-700 text-greyscale-100 border border-greyscale-600";
  }
}

function formatDisplayName(user: SystemUser) {
  return `${user.firstName} ${user.lastName}`.trim() || user.username || "—";
}

export default function UserManagement() {
  const locale = useLocale();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [usernameInput, setUsernameInput] = React.useState("");
  const [emailInput, setEmailInput] = React.useState("");
  const [selectedRole, setSelectedRole] = React.useState("");
  const [selectedSort, setSelectedSort] = React.useState("");

  const debouncedUsername = useDebounce(usernameInput.trim(), 350);
  const debouncedEmail = useDebounce(emailInput.trim(), 350);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [debouncedUsername, debouncedEmail, selectedRole, selectedSort]);

  const { data, isLoading, isError, error, refetch, isFetching } = useGetUsers({
    currentPage,
    pageSize: PAGE_SIZE,
    username: debouncedUsername || undefined,
    email: debouncedEmail || undefined,
    roleName: (selectedRole || undefined) as SystemUserRoleName | undefined,
    sortDirection: (selectedSort || undefined) as SortDirection | undefined,
  });

  const users = data?.data ?? [];
  const headers = [
    "STT",
    locale === "vi" ? "Người dùng" : "User",
    "Email",
    locale === "vi" ? "Vai trò" : "Role",
    locale === "vi" ? "Giới tính" : "Gender",
    locale === "vi" ? "Ngày sinh" : "Date of birth",
    locale === "vi" ? "Số điện thoại" : "Phone",
  ];

  const roleOptions = ROLE_OPTIONS.map((option) => ({
    value: option.value,
    label: locale === "vi" ? option.labelVi : option.labelEn,
  }));

  const sortOptions = SORT_OPTIONS.map((option) => ({
    value: option.value,
    label: locale === "vi" ? option.labelVi : option.labelEn,
  }));

  const resetFilters = () => {
    setUsernameInput("");
    setEmailInput("");
    setSelectedRole("");
    setSelectedSort("");
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <Spinner className="h-5 w-5" />
      </div>
    );
  }

  if (isError) {
    const axiosError = error as AxiosError<ApiError>;

    return (
      <Empty>
        <p className="text-sm text-muted-foreground">
          {axiosError.response?.data?.message ||
            axiosError.message ||
            (locale === "vi"
              ? "Không thể tải danh sách người dùng."
              : "Unable to load users.")}
        </p>
      </Empty>
    );
  }

  return (
    <section className="space-y-5">
      <header className="overflow-hidden rounded border border-greyscale-700 bg-linear-to-br from-greyscale-900 via-greyscale-900 to-greyscale-950 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.85)]">
        <div className="flex flex-col gap-5 p-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-primary-200">
                <Users className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em]">
                  {locale === "vi" ? "Quản lý người dùng" : "User management"}
                </span>
              </div>
              <h2 className="text-2xl font-semibold text-greyscale-0">
                {locale === "vi" ? "Danh sách user hệ thống" : "System user list"}
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-greyscale-100">
                {locale === "vi"
                  ? "Tìm kiếm theo username hoặc email, lọc theo vai trò và sắp xếp để quản lý tài khoản nhanh hơn."
                  : "Search by username or email, then filter by role and sort to manage accounts faster."}
              </p>
            </div>
          </div>

          <div className="w-full max-w-3xl rounded border border-white/5 bg-white/5 p-4 backdrop-blur-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-greyscale-300">
                    {locale === "vi" ? "Bộ lọc" : "Filters"}
                  </p>
                  <p className="mt-1 text-sm text-greyscale-100">
                    {locale === "vi"
                      ? "Tìm theo username, email, vai trò và thứ tự hiển thị."
                      : "Filter by username, email, role, and display order."}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  disabled={!usernameInput && !emailInput && !selectedRole && !selectedSort}
                  onClick={resetFilters}
                >
                  {locale === "vi" ? "Xoá lọc" : "Clear filters"}
                </Button>
              </div>

              <div className="grid gap-3 lg:grid-cols-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-greyscale-300" />
                  <Input
                    type="search"
                    value={usernameInput}
                    onChange={(event) => setUsernameInput(event.target.value)}
                    placeholder={locale === "vi" ? "Tìm theo username" : "Search username"}
                    className="border-greyscale-700 bg-greyscale-950/90 pl-9 text-greyscale-0 placeholder:text-greyscale-300"
                  />
                </div>

                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-greyscale-300" />
                  <Input
                    type="search"
                    value={emailInput}
                    onChange={(event) => setEmailInput(event.target.value)}
                    placeholder={locale === "vi" ? "Tìm theo email" : "Search email"}
                    className="border-greyscale-700 bg-greyscale-950/90 pl-9 text-greyscale-0 placeholder:text-greyscale-300"
                  />
                </div>

                <CommonDropdown
                  value={selectedRole}
                  onChange={setSelectedRole}
                  options={roleOptions}
                  placeholder={locale === "vi" ? "Chọn vai trò" : "Choose role"}
                  label={locale === "vi" ? "Vai trò" : "Role"}
                  triggerClassName="mt-0 h-11 border-greyscale-700 bg-greyscale-950/90 text-greyscale-0 hover:bg-greyscale-900"
                  contentClassName="border-greyscale-700 bg-greyscale-900"
                />

                <CommonDropdown
                  value={selectedSort}
                  onChange={setSelectedSort}
                  options={sortOptions}
                  placeholder={locale === "vi" ? "Sắp xếp" : "Sort"}
                  label={locale === "vi" ? "Thứ tự" : "Sort order"}
                  triggerClassName="mt-0 h-11 border-greyscale-700 bg-greyscale-950/90 text-greyscale-0 hover:bg-greyscale-900"
                  contentClassName="border-greyscale-700 bg-greyscale-900"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-between gap-3 rounded border border-greyscale-700 bg-greyscale-900 px-4 py-3 text-sm text-greyscale-100">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-tertiary" />
          {data
            ? `${data.totalRecords} ${locale === "vi" ? "người dùng" : "users"} • ${locale === "vi" ? "trang" : "page"} ${data.pageIndex}/${data.totalPages}`
            : locale === "vi"
              ? "Đang tải dữ liệu"
              : "Loading data"}
        </div>
        <Button
          type="button"
          icon={<RefreshCw className={isFetching ? "h-4 w-4 animate-spin" : "h-4 w-4"} />}
          variant="outline"
          onClick={() => refetch()}
        >
          {locale === "vi" ? "Làm mới" : "Refresh"}
        </Button>
      </div>

      {users.length === 0 ? (
        <EmptyState
          title={locale === "vi" ? "Không có người dùng phù hợp" : "No matching users"}
          description={
            locale === "vi"
              ? "Thử đổi bộ lọc username, email hoặc vai trò để xem dữ liệu khác."
              : "Try another username, email, or role filter to view different data."
          }
          actionLabel={locale === "vi" ? "Xoá bộ lọc" : "Clear filters"}
          onAction={resetFilters}
        />
      ) : (
        <TableCustom
          headers={headers}
          data={users}
          pagination={{
            currentPage: data?.pageIndex ?? currentPage,
            pageSize: data?.pageSize ?? PAGE_SIZE,
            totalItems: data?.totalRecords ?? 0,
            onPageChange: setCurrentPage,
          }}
          renderRow={(user: SystemUser, index) => {
            const displayName = formatDisplayName(user);
            const roleLabel = getRoleLabel(locale, user.roleName);

            return (
              <>
                <TableCell className="text-greyscale-100">
                  {(data?.pageIndex ? (data.pageIndex - 1) * data.pageSize : 0) + index + 1}
                </TableCell>

                <TableCell className="text-greyscale-25">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="h-10 w-10 border border-white/10">
                      <AvatarImage src={user.imageUrl || ""} alt={displayName} />
                      <AvatarFallback className="bg-white/5 text-greyscale-100">
                        {getInitials(user.firstName, user.lastName, user.username)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 space-y-1">
                      <p className="truncate font-medium text-greyscale-0">{displayName}</p>
                      <p className="truncate text-xs text-greyscale-100">@{user.username}</p>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="text-greyscale-0">{user.email}</TableCell>

                <TableCell className="text-greyscale-25">
                  <span
                    className={`shrink-0 rounded px-2 py-1 text-xs font-medium ${getRoleBadgeClass(
                      user.roleName,
                    )}`}
                  >
                    {roleLabel}
                  </span>
                </TableCell>

                <TableCell className="text-greyscale-100">
                  <GenderBadge gender={user.gender} />
                </TableCell>

                <TableCell className="text-greyscale-100">
                  {formatDate(user.dateOfBirth)}
                </TableCell>

                <TableCell className="text-greyscale-100">
                  {user.phone || "—"}
                </TableCell>
              </>
            );
          }}
        />
      )}
    </section>
  );
}
