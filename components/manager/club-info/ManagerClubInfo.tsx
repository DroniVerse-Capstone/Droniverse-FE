"use client";

import React from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Copy, Edit3 } from "lucide-react";
import toast from "react-hot-toast";

import EmptyState from "@/components/common/EmptyState";
import QuillEditor from "@/components/common/QuillEditor";
import { ClubImageUpload } from "@/components/manager/dashboard/ClubImageUpload";
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
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  useGetMyClubs,
  useGetClubDetailById,
  useUpdateClub,
} from "@/hooks/club/useClub";
import { useLocale } from "@/providers/i18n-provider";
import ClubStatusBadge from "@/components/club/ClubStatusBadge";

const UUID_SUFFIX_REGEX =
  /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function ManagerClubInfo() {
  const locale = useLocale();
  const params = useParams<{ clubSlug?: string }>();
  const clubSlug = params?.clubSlug;
  const { data: myClubs = [], isLoading: isMyClubsLoading } = useGetMyClubs();

  const clubId = React.useMemo(() => {
    if (!clubSlug) return undefined;

    const matchedClub = myClubs.find((club) =>
      clubSlug.endsWith(`-${club.clubID}`),
    );
    if (matchedClub) return matchedClub.clubID;

    const uuidMatch = clubSlug.match(UUID_SUFFIX_REGEX);
    return uuidMatch?.[0];
  }, [clubSlug, myClubs]);

  const {
    data: club,
    isLoading,
    isError,
    error,
  } = useGetClubDetailById(clubId);
  const updateClubMutation = useUpdateClub();
  const [editOpen, setEditOpen] = React.useState(false);
  const [clubNameVN, setClubNameVN] = React.useState("");
  const [clubNameEN, setClubNameEN] = React.useState("");
  const [imageUrl, setImageUrl] = React.useState("");
  const [limitParticipation, setLimitParticipation] = React.useState(10);
  const [clubPolicyVN, setClubPolicyVN] = React.useState("");
  const [clubPolicyEN, setClubPolicyEN] = React.useState("");
  const [clubRequirement, setClubRequirement] = React.useState("");

  const clubName = club
    ? locale === "en"
      ? club.nameEN || club.nameVN
      : club.nameVN
    : "";

  const creatorName = club?.creator ? club.creator.username : "Chưa cập nhật";

  const handleOpenEdit = () => {
    if (!club) return;

    setClubNameVN(club.nameVN ?? "");
    setClubNameEN(club.nameEN ?? "");
    setImageUrl(club.imageUrl ?? "");
    setLimitParticipation(club.limitParticipation ?? 0);
    setClubPolicyVN(club.clubPolicyVN ?? "");
    setClubPolicyEN(club.clubPolicyEN ?? "");
    setClubRequirement(club.clubRequirement ?? "");
    setEditOpen(true);
  };

  const handleCloseEdit = () => {
    setEditOpen(false);
  };

  const handleCopyCode = async () => {
    if (!club?.clubCode) return;

    try {
      await navigator.clipboard.writeText(club.clubCode);
      toast.success("Đã sao chép mã câu lạc bộ.");
    } catch {
      toast.error("Không thể sao chép mã câu lạc bộ.");
    }
  };

  const handleSubmit = async () => {
    if (!clubId) return;

    try {
      const response = await updateClubMutation.mutateAsync({
        clubId,
        data: {
          nameVN: clubNameVN.trim(),
          nameEN: clubNameEN.trim(),
          imageUrl: imageUrl.trim() || null,
          limitParticipation,
          clubPolicyVN: clubPolicyVN.trim(),
          clubPolicyEN: clubPolicyEN.trim(),
          clubRequirement: clubRequirement.trim() || null,
        },
      });

      toast.success(response.message || "Cập nhật câu lạc bộ thành công.");
      setEditOpen(false);
    } catch (updateError) {
      const message =
        (updateError as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ||
        (updateError as { message?: string })?.message ||
        "Không thể cập nhật câu lạc bộ.";
      toast.error(message);
    }
  };

  React.useEffect(() => {
    if (!club || editOpen) return;

    setClubNameVN(club.nameVN ?? "");
    setClubNameEN(club.nameEN ?? "");
    setImageUrl(club.imageUrl ?? "");
    setLimitParticipation(club.limitParticipation ?? 0);
    setClubPolicyVN(club.clubPolicyVN ?? "");
    setClubPolicyEN(club.clubPolicyEN ?? "");
    setClubRequirement(club.clubRequirement ?? "");
  }, [club, editOpen]);

  if (!clubSlug) {
    return (
      <div className="rounded-2xl border border-white/[0.07] bg-[#181b22] p-6">
        <EmptyState
          title="Không tìm thấy câu lạc bộ."
          description="Thiếu thông tin đường dẫn câu lạc bộ."
        />
      </div>
    );
  }

  if (isMyClubsLoading && !clubId) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center rounded-2xl border border-white/[0.07] bg-[#181b22]">
        <Spinner className="h-6 w-6 text-blue-500" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center rounded-2xl border border-white/[0.07] bg-[#181b22]">
        <Spinner className="h-6 w-6 text-blue-500" />
      </div>
    );
  }

  if (isError || !club) {
    return (
      <div className="rounded-2xl border border-white/[0.07] bg-[#181b22] p-6">
        <EmptyState
          title="Không tải được thông tin câu lạc bộ"
          description={
            error?.response?.data?.message ||
            error?.message ||
            "Vui lòng thử lại sau."
          }
        />
      </div>
    );
  }

  const policyPreview = locale === "en" ? club.clubPolicyEN : club.clubPolicyVN;
  const requirementPreview =
    club.clubRequirement || "Chưa cập nhật yêu cầu tham gia.";
  const droneImage = club.drone?.imgURL || "/images/club-placeholder.jpg";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-greyscale-0">
          Thông tin câu lạc bộ
        </h2>
        <p className="text-sm text-greyscale-300">
          Xem nhanh cấu hình câu lạc bộ và chỉnh sửa ngay khi cần.
        </p>
      </div>

      <section className="rounded border border-greyscale-700 bg-linear-to-br from-greyscale-900 to-greyscale-800 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.24)]">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-stretch">
          <div className="flex min-w-0 flex-1 gap-5">
            <div className="relative h-30 w-30 shrink-0 overflow-hidden rounded border border-white/[0.07] bg-[#0f1014]">
              <Image
                src={club.imageUrl || "/images/club-placeholder.jpg"}
                alt={clubName}
                fill
                className="object-cover"
                priority
              />
            </div>

            <div className="min-w-0 space-y-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <ClubStatusBadge status={club.status} />
                </div>

                <div className="space-y-1">
                  <h1 className="truncate text-3xl font-bold tracking-tight text-greyscale-0">
                    {clubName}
                  </h1>
                  <p className="text-sm text-greyscale-200">Mã CLB</p>
                  <div className="inline-flex items-center gap-2 rounded border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-sm font-semibold text-blue-300">
                    <span className="font-mono">{club.clubCode}</span>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="rounded-full p-1 transition-colors hover:bg-blue-400/10"
                      aria-label="Sao chép mã câu lạc bộ"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button icon={<Edit3 size={16} />} onClick={handleOpenEdit}>
                  Chỉnh sửa thông tin
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="space-y-4 rounded border border-greyscale-700 bg-greyscale-900 p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-white">
                {locale === "en" ? "Club Policy" : "Nội quy câu lạc bộ"}
              </h3>
            </div>
          </div>

          <div className="dv-quill-render ql-editor p-4 text-greyscale-0">
            <div
              dangerouslySetInnerHTML={{ __html: policyPreview || "<p>-</p>" }}
            />
          </div>
        </div>

        <div className="space-y-4 rounded border border-greyscale-700 bg-greyscale-900 p-6">
          <div>
            <h3 className="text-lg font-semibold text-white">
              {locale === "en" ? "Joining Requirements" : "Yêu cầu tham gia"}
            </h3>
            <p className="text-sm text-greyscale-200">
              Thông tin để các thành viên nắm rõ trước khi đăng ký.
            </p>
          </div>

          <div className="rounded border border-greyscale-700 bg-greyscale-800 p-4 text-sm leading-7 text-greyscale-0">
            {requirementPreview}
          </div>

          <div className="space-y-3 rounded border border-greyscale-700 bg-greyscale-800 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="text-base font-semibold text-white">
                  Drone yêu cầu
                </h4>
                <p className="text-xs text-[#8b93a4]">
                  Ảnh và thông số drone cần có để tham gia
                </p>
              </div>
            </div>

            {club.drone ? (
              <div className="overflow-hidden rounded border border-greyscale-700 bg-greyscale-900">
                <div className="relative h-52 w-full">
                  <Image
                    src={droneImage}
                    alt={club.drone.droneNameVN}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h5 className="mt-1 text-lg font-semibold text-white">
                      {locale === "en"
                        ? club.drone.droneNameEN || club.drone.droneNameVN
                        : club.drone.droneNameVN}
                    </h5>
                    <p className="text-sm text-white/75">
                      {club.drone.manufacturer}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 p-4 sm:grid-cols-2">
                  <div className="rounded border border-greyscale-600 bg-greyscale-800 p-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#8b93a4]">
                      Chiều cao
                    </p>
                    <p className="mt-1 text-sm font-medium text-white">
                      {club.drone.height.toLocaleString("vi-VN")} m
                    </p>
                  </div>
                  <div className="rounded border border-greyscale-600 bg-greyscale-800 p-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#8b93a4]">
                      Trọng lượng
                    </p>
                    <p className="mt-1 text-sm font-medium text-white">
                      {club.drone.weight.toLocaleString("vi-VN")} kg
                    </p>
                  </div>
                </div>

                <div className="border-t border-greyscale-700 px-4 py-3 text-sm leading-7 text-greyscale-50">
                  {club.drone.descriptionVN ||
                    club.drone.descriptionEN ||
                    "Chưa có mô tả drone yêu cầu."}
                </div>
              </div>
            ) : (
              <EmptyState
                title="Chưa cấu hình drone yêu cầu"
                description="Câu lạc bộ này chưa có drone bắt buộc để tham gia."
              />
            )}
          </div>

          <div className="space-y-3 rounded border border-greyscale-700 bg-greyscale-800 p-4">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-greyscale-200">Người tạo</span>
              <span className="font-medium text-white">{creatorName}</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-[#8b93a4]">Thành viên hiện tại</span>
              <span className="font-medium text-white">
                {club.totalMembers.toLocaleString("vi-VN")}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-[#8b93a4]">Trạng thái</span>
              <ClubStatusBadge status={club.status} />
            </div>
          </div>
        </div>
      </section>

      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open && club) {
            setClubNameVN(club.nameVN ?? "");
            setClubNameEN(club.nameEN ?? "");
            setImageUrl(club.imageUrl ?? "");
            setLimitParticipation(club.limitParticipation ?? 0);
            setClubPolicyVN(club.clubPolicyVN ?? "");
            setClubPolicyEN(club.clubPolicyEN ?? "");
            setClubRequirement(club.clubRequirement ?? "");
          }
        }}
      >
        <DialogContent className="max-h-[90vh] w-full max-w-7xl overflow-hidden p-0">
          <div className="flex max-h-[90vh] flex-col">
            <DialogHeader className="border-b border-greyscale-700 px-6 py-5">
              <DialogTitle>Chỉnh sửa câu lạc bộ</DialogTitle>
              <DialogDescription>
                Cập nhật tên, ảnh, giới hạn thành viên và nội quy của câu lạc
                bộ.
              </DialogDescription>
            </DialogHeader>

            <div className="grid flex-1 gap-6 overflow-y-auto px-6 py-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="club-name-vn">Tên câu lạc bộ (VI)</Label>
                    <Input
                      id="club-name-vn"
                      value={clubNameVN}
                      onChange={(event) => setClubNameVN(event.target.value)}
                      placeholder="Nhập tên tiếng Việt"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="club-name-en">Tên câu lạc bộ (EN)</Label>
                    <Input
                      id="club-name-en"
                      value={clubNameEN}
                      onChange={(event) => setClubNameEN(event.target.value)}
                      placeholder="Enter English name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Ảnh câu lạc bộ</Label>
                  <ClubImageUpload
                    value={imageUrl}
                    onChange={setImageUrl}
                    label="Tải ảnh mới"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="limit-participation">
                      Giới hạn thành viên
                    </Label>
                    <Input
                      id="limit-participation"
                      type="number"
                      min={0}
                      value={limitParticipation}
                      onChange={(event) =>
                        setLimitParticipation(Number(event.target.value) || 0)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="club-requirement">Yêu cầu tham gia</Label>
                    <Textarea
                      id="club-requirement"
                      value={clubRequirement}
                      onChange={(event) =>
                        setClubRequirement(event.target.value)
                      }
                      placeholder="Điều kiện để tham gia câu lạc bộ"
                      className="min-h-28"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <QuillEditor
                    id="club-policy-vn"
                    label="Nội quy (VI)"
                    value={clubPolicyVN}
                    onChange={setClubPolicyVN}
                    placeholder="Nhập nội quy tiếng Việt"
                    minHeight={220}
                  />

                  <QuillEditor
                    id="club-policy-en"
                    label="Nội quy (EN)"
                    value={clubPolicyEN}
                    onChange={setClubPolicyEN}
                    placeholder="Enter English policy"
                    minHeight={220}
                  />
                </div>
              </div>

              <div className="space-y-4 rounded border border-greyscale-700 bg-greyscale-900 p-5">
                <div>
                  <h4 className="text-lg font-semibold text-white">
                    Xem trước
                  </h4>
                  <p className="text-sm text-[#8b93a4]">
                    Đây là bản xem nhanh của thông tin sau khi lưu.
                  </p>
                </div>

                <div className="space-y-3 rounded border border-greyscale-700 bg-greyscale-800 p-4">
                  <div className="relative h-40 w-full overflow-hidden rounded border border-greyscale-700 bg-greyscale-900">
                    <Image
                      src={
                        imageUrl ||
                        club.imageUrl ||
                        "/images/club-placeholder.jpg"
                      }
                      alt={clubName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-[#8b93a4]">Tên câu lạc bộ</p>
                    <p className="text-xl font-semibold text-white">
                      {clubNameVN || club.nameVN}
                    </p>
                    <p className="text-sm text-greyscale-100">
                      {clubNameEN || club.nameEN}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 rounded border border-greyscale-700 bg-greyscale-800 p-4 text-sm text-greyscale-100">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[#8b93a4]">Mã CLB</span>
                    <span className="font-mono text-blue-300">
                      {club.clubCode}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[#8b93a4]">Giới hạn</span>
                    <span>{limitParticipation.toLocaleString("vi-VN")}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[#8b93a4]">Trạng thái</span>
                    <ClubStatusBadge status={club.status} />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="border-t border-white/[0.07] px-6 py-4 sm:space-x-0">
              <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  onClick={handleCloseEdit}
                  disabled={updateClubMutation.isPending}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={updateClubMutation.isPending || !clubId}
                >
                  {updateClubMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <Spinner className="h-4 w-4" />
                      Đang lưu...
                    </span>
                  ) : (
                    "Lưu thay đổi"
                  )}
                </Button>
              </div>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
