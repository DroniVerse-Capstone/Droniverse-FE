"use client";

import React from "react";
import { AxiosError } from "axios";
import { Camera, Save, ArrowLeft, LogOut, RotateCcw, Trophy, Medal } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import CourseLevelBadge from "@/components/course/CourseLevelBadge";
import CommonDropdown from "@/components/common/CommonDropdown";
import CommonDatePicker from "@/components/common/CommonDatePicker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  useMe,
  useUpdateMe,
  useUploadAvatar,
  useLogout,
} from "@/hooks/auth/useAuth";
import { ApiError } from "@/types/api/common";
import { User } from "@/validations/auth";
import toast from "react-hot-toast";

type ProfileFormState = {
  username: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: "MALE" | "FEMALE" | "UNKNOWN";
  phone: string;
};

const getDateInputValue = (rawDate: string | null) => {
  if (!rawDate) return "";

  if (rawDate.length >= 10) {
    return rawDate.slice(0, 10);
  }

  return rawDate;
};

const toInitialFormState = (user: User): ProfileFormState => ({
  username: user.username ?? "",
  firstName: user.firstName ?? "",
  lastName: user.lastName ?? "",
  dateOfBirth: getDateInputValue(user.dateOfBirth),
  gender: user.gender ?? "UNKNOWN",
  phone: user.phone ?? "",
});

const getInitials = (firstName: string, lastName: string) => {
  return (
    `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.trim().toUpperCase() || "U"
  );
};

const toApiErrorMessage = (error: AxiosError<ApiError>) => {
  return error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.";
};

export default function UserProfile() {
  const router = useRouter();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [selectedAvatarFileName, setSelectedAvatarFileName] =
    React.useState("");
  const [profileForm, setProfileForm] = React.useState<ProfileFormState | null>(
    null,
  );

  const logoutMutation = useLogout();

  const meQuery = useMe({
    enabled: !logoutMutation.isPending && !logoutMutation.isSuccess,
    onError: (error) => {
      toast.error(toApiErrorMessage(error));
    },
  });

  const currentUser = meQuery.data?.data ?? null;
  const isClubMember = currentUser?.roleName === "CLUB_MEMBER";

  React.useEffect(() => {
    if (currentUser) {
      setProfileForm(toInitialFormState(currentUser));
    }
  }, [currentUser]);

  const updateMeMutation = useUpdateMe({
    onSuccess: (response) => {
      toast.success(response.message || "Cập nhật thông tin thành công.");
    },
    onError: (error) => {
      toast.error(toApiErrorMessage(error));
    },
  });

  const uploadAvatarMutation = useUploadAvatar({
    onSuccess: () => {
      toast.success("Cập nhật ảnh đại diện thành công.");
      setSelectedAvatarFileName("");
    },
    onError: (error) => {
      toast.error(toApiErrorMessage(error));
    },
  });

  const isProfileLoading = meQuery.isLoading || !profileForm;
  const isSaving = updateMeMutation.isPending || uploadAvatarMutation.isPending;

  const handleProfileFieldChange =
    (field: keyof ProfileFormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = event.target.value;

      setProfileForm((previous) => {
        if (!previous) return previous;

        return {
          ...previous,
          [field]: value,
        };
      });
    };

  const handleSubmitProfile = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!profileForm) return;

    updateMeMutation.mutate(profileForm);
  };

  const handleSelectAvatar = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file || !currentUser?.userId) return;

    const isImage = file.type.startsWith("image/");
    const isValidSize = file.size <= 5 * 1024 * 1024;

    if (!isImage) {
      toast.error("Vui lòng chọn file ảnh hợp lệ.");
      event.target.value = "";
      return;
    }

    if (!isValidSize) {
      toast.error("Kích thước ảnh tối đa là 5MB.");
      event.target.value = "";
      return;
    }

    setSelectedAvatarFileName(file.name);
    uploadAvatarMutation.mutate({
      userId: currentUser.userId,
      file,
    });

    // Allow selecting the same file again on the next upload.
    event.target.value = "";
  };

  const handleResetProfileForm = () => {
    if (!currentUser) return;

    setProfileForm(toInitialFormState(currentUser));
  };

  if (isProfileLoading) {
    return (
      <div className="mx-auto flex min-h-[50vh] w-full max-w-6xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 rounded-xl border border-greyscale-700 bg-greyscale-850 px-5 py-3 text-greyscale-100">
          <Spinner className="h-5 w-5" />
          <span>Đang tải thông tin hồ sơ...</span>
        </div>
      </div>
    );
  }

  if (!currentUser || !profileForm) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-greyscale-700 bg-greyscale-850 p-6 text-greyscale-100">
          Không thể tải thông tin hồ sơ.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full bg-greyscale-800 bg-(image:--bg-pattern-grid) bg-repeat bg-size-[100px_100px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Button>
        <Button
          variant="default"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
        >
          {logoutMutation.isPending ? (
            <Spinner className="h-4 w-4" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
          Đăng xuất
        </Button>
      </div>

      <section className="relative mx-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-greyscale-700 bg-linear-to-br from-greyscale-850 via-greyscale-900 to-greyscale-950 p-6 shadow-xl sm:p-8">
        <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-secondary-300/25 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-primary-300/25 blur-3xl" />

        <div className="relative flex flex-col items-center gap-6">
          {/* Avatar + info — centered */}
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="relative">
              <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-greyscale-0/20 shadow-lg">
                {currentUser.imageUrl ? (
                  <Image
                    src={currentUser.imageUrl}
                    alt={currentUser.username}
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-greyscale-700 text-xl font-semibold text-greyscale-0">
                    {getInitials(currentUser.firstName, currentUser.lastName)}
                  </div>
                )}
              </div>

              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                onClick={handleSelectAvatar}
                disabled={uploadAvatarMutation.isPending}
              >
                {uploadAvatarMutation.isPending ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarFileChange}
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-greyscale-0">{currentUser.username}</h1>
              <p className="mt-0.5 text-sm text-greyscale-400">{currentUser.email}</p>
              <p className="mt-2 inline-flex rounded-full border border-greyscale-600 px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide text-greyscale-200">
                {currentUser.roleName}
              </p>
            </div>
          </div>

          {/* Achievements — horizontal row below */}
          {isClubMember ? (
            <div className="w-full">
              {currentUser.userLevelMax?.length ? (
                <div className="flex flex-wrap justify-center gap-3">
                  {currentUser.userLevelMax.map((item) => (
                    <article
                      key={`${item.userID}-${item.level.levelID}-${item.drone.droneID}`}
                      className="group relative w-48 overflow-hidden rounded-xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 via-greyscale-900/80 to-greyscale-900 p-3 shadow-sm transition-all hover:border-yellow-500/40 hover:shadow-md hover:shadow-yellow-500/10"
                    >
                      {/* shimmer */}
                      <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-yellow-400/8 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                      <div className="relative flex flex-col items-center gap-2 text-center">
                        <div className="relative">
                          <div className="h-14 w-14 overflow-hidden rounded-xl border border-greyscale-700 bg-greyscale-800 shadow-inner">
                            <img
                              src={item.drone.imgURL}
                              alt={item.drone.name}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          </div>
                          <Medal className="absolute -bottom-1 -right-1 h-4 w-4 text-yellow-400 drop-shadow" />
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-greyscale-0">{item.drone.name}</p>
                          <div className="mt-1 flex justify-center">
                            <CourseLevelBadge level={item.level} />
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-yellow-500/20 bg-greyscale-900/40 px-4 py-6 text-center">
                  <Trophy className="h-8 w-8 text-greyscale-600" />
                  <p className="text-sm text-greyscale-400">Chưa có thành tựu nào.</p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </section>

      <section className="rounded border border-greyscale-700 bg-greyscale-900 p-6">
        <h2 className="text-xl font-semibold text-greyscale-0">
          Thông tin cá nhân
        </h2>
        <p className="mt-1 text-sm text-greyscale-300">
          Cập nhật thông tin để hồ sơ luôn chính xác.
        </p>

        <form
          onSubmit={handleSubmitProfile}
          className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          <div>
            <Label
              htmlFor="username"
              className="text-sm font-medium text-greyscale-100"
            >
              Tên tài khoản
            </Label>
            <Input
              id="username"
              value={profileForm.username}
              onChange={handleProfileFieldChange("username")}
              className="mt-2 border-greyscale-600 bg-greyscale-900/50 text-greyscale-0 focus:border-primary-500 focus:ring-primary-500/20 transition-all"
              placeholder="Nhập username của bạn"
            />
          </div>

          <div>
            <Label
              htmlFor="firstName"
              className="text-sm font-medium text-greyscale-100"
            >
              Tên
            </Label>
            <Input
              id="firstName"
              value={profileForm.firstName}
              onChange={handleProfileFieldChange("firstName")}
              className="mt-2 border-greyscale-600 bg-greyscale-900/50 text-greyscale-0 focus:border-primary-500 focus:ring-primary-500/20 transition-all"
              placeholder="Tên của bạn"
            />
          </div>

          <div>
            <Label
              htmlFor="lastName"
              className="text-sm font-medium text-greyscale-100"
            >
                Họ
            </Label>
            <Input
              id="lastName"
              value={profileForm.lastName}
              onChange={handleProfileFieldChange("lastName")}
              className="mt-2 border-greyscale-600 bg-greyscale-900/50 text-greyscale-0 focus:border-primary-500 focus:ring-primary-500/20 transition-all"
              placeholder="Họ của bạn"
            />
          </div>

          <div>
            <Label
              htmlFor="dateOfBirth"
              className="text-sm font-medium text-greyscale-100"
            >
              Ngày sinh
            </Label>
            <CommonDatePicker
              value={profileForm.dateOfBirth}
              onChange={(val) =>
                setProfileForm((prev) =>
                  prev ? { ...prev, dateOfBirth: val } : prev
                )
              }
              placeholder="Chọn ngày sinh"
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-greyscale-100">
              Giới tính
            </Label>
            <CommonDropdown
              options={[
                { value: "MALE", label: "Nam" },
                { value: "FEMALE", label: "Nữ" },
                { value: "UNKNOWN", label: "Không xác định" },
              ]}
              value={profileForm.gender}
              placeholder="Chọn giới tính"
              onChange={(value) =>
                setProfileForm((previous) =>
                  previous
                    ? { ...previous, gender: value as ProfileFormState["gender"] }
                    : previous
                )
              }
            />
          </div>

          <div>
            <Label
              htmlFor="phone"
              className="text-sm font-medium text-greyscale-100"
            >
              Số điện thoại
            </Label>
            <Input
              id="phone"
              value={profileForm.phone}
              onChange={handleProfileFieldChange("phone")}
              className="mt-2 border-greyscale-600 bg-greyscale-900/50 text-greyscale-0 focus:border-primary-500 focus:ring-primary-500/20 transition-all"
              placeholder="Số điện thoại của bạn"
            />
          </div>

          <div className="md:col-span-3 flex flex-wrap justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleResetProfileForm}
              disabled={isSaving}
              icon={<RotateCcw className="h-4 w-4" />}
            >
              Khôi phục
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="min-w-35 shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
              icon={
                isSaving ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <Save className="h-4 w-4" />
                )
              }
            >
              {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
