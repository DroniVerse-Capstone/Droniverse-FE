"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { IoHelpCircleOutline, IoPeople, IoStar } from "react-icons/io5";
import { RiLogoutCircleLine } from "react-icons/ri";
import toast from "react-hot-toast";

import EmptyState from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useGetClubDetailById, useLeaveClub } from "@/hooks/club/useClub";
import { useCreateReport } from "@/hooks/report/useReport";
import { useLocale, useTranslations } from "@/providers/i18n-provider";
import StatCard from "@/components/common/StatCard";
import { GoLaw } from "react-icons/go";
import { MdOutlineReport } from "react-icons/md";

type ReportPreset = {
  id: string;
  label: string;
  contentVN: string;
  contentEN: string;
};

const REPORT_PRESETS: ReportPreset[] = [
  {
    id: "spam",
    label: "Spam / Nội dung rác",
    contentVN:
      "Tôi muốn khiếu nại câu lạc bộ này vì có nội dung spam hoặc không phù hợp.",
    contentEN:
      "I want to report this club because it contains spam or inappropriate content.",
  },
  {
    id: "abuse",
    label: "Lạm dụng / Vi phạm",
    contentVN:
      "Tôi muốn khiếu nại câu lạc bộ này vì có dấu hiệu lạm dụng hoặc vi phạm quy định.",
    contentEN:
      "I want to report this club because it appears to abuse the system or violate the rules.",
  },
  {
    id: "misleading",
    label: "Thông tin sai lệch",
    contentVN:
      "Tôi muốn khiếu nại câu lạc bộ này vì thông tin hiển thị có dấu hiệu sai lệch hoặc gây hiểu nhầm.",
    contentEN:
      "I want to report this club because the displayed information seems inaccurate or misleading.",
  },
  {
    id: "inappropriate_content",
    label: "Nội dung không lành mạnh",
    contentVN:
      "Tôi muốn khiếu nại câu lạc bộ này vì nội dung hiển thị không lành mạnh hoặc thiếu chuẩn mực.",
    contentEN:
      "I want to report this club because the displayed content is inappropriate or violates community standards.",
  },
  {
    id: "other",
    label: "Khác",
    contentVN: "",
    contentEN: "",
  },
];

type ClubInfoProps = {
  clubId?: string;
};

export default function ClubInfo({ clubId }: ClubInfoProps) {
  const router = useRouter();
  const t = useTranslations("ClubDetail.ClubInfo");
  const locale = useLocale();
  const {
    data: club,
    isLoading,
    isError,
    error,
  } = useGetClubDetailById(clubId);
  const leaveClubMutation = useLeaveClub();
  const createReportMutation = useCreateReport();
  const [leaveDialogOpen, setLeaveDialogOpen] = React.useState(false);
  const [policyDialogOpen, setPolicyDialogOpen] = React.useState(false);
  const [reportDialogOpen, setReportDialogOpen] = React.useState(false);
  const [selectedPresetId, setSelectedPresetId] = React.useState("spam");
  const [customContentVN, setCustomContentVN] = React.useState("");
  const [customContentEN, setCustomContentEN] = React.useState("");

  const selectedPreset =
    REPORT_PRESETS.find((item) => item.id === selectedPresetId) ??
    REPORT_PRESETS[0];
  const isCustomPreset = selectedPresetId === "other";

  const resetReportForm = () => {
    setSelectedPresetId("spam");
    setCustomContentVN("");
    setCustomContentEN("");
  };

  const handleSubmitReport = async () => {
    if (!clubId) return;

    const contentVN = isCustomPreset
      ? customContentVN.trim()
      : selectedPreset.contentVN.trim();
    const contentEN = isCustomPreset
      ? customContentEN.trim()
      : selectedPreset.contentEN.trim();

    if (!contentVN || !contentEN) {
      toast.error(
        locale === "vi"
          ? "Vui lòng nhập nội dung tiếng Việt và tiếng Anh."
          : "Please enter both Vietnamese and English content.",
      );
      return;
    }

    try {
      const response = await createReportMutation.mutateAsync({
        referenceID: clubId,
        reportType: "Club",
        contentVN,
        contentEN,
      });

      toast.success(
        response.message ||
          (locale === "vi"
            ? "Tạo khiếu nại thành công."
            : "Report created successfully."),
      );
      setReportDialogOpen(false);
      resetReportForm();
    } catch (reportError) {
      const message =
        (reportError as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ||
        (reportError as { message?: string })?.message ||
        (locale === "vi"
          ? "Không thể gửi khiếu nại."
          : "Unable to submit the report.");
      toast.error(message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  if (!clubId) {
    return (
      <EmptyState
        title={t("empty.title")}
        description={t("empty.description")}
      />
    );
  }

  if (isError || !club) {
    return (
      <EmptyState
        title={t("error")}
        description={error?.response?.data?.message || error?.message}
      />
    );
  }

  const clubName = locale === "en" ? club.nameEN || club.nameVN : club.nameVN;
  const clubPolicy = locale === "en" ? club.clubPolicyEN : club.clubPolicyVN;

  let managerName = "Chưa cập nhật";
  if (club.creator && typeof club.creator === "object") {
    const creator = club.creator as Record<string, unknown>;
    const candidate = creator.fullName || creator.name || creator.username;
    if (typeof candidate === "string" && candidate.trim()) {
      managerName = candidate;
    }
  }

  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex min-w-0 flex-1 items-start gap-4">
        <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded">
          <Image
            src={club.imageUrl || "/images/club-placeholder.jpg"}
            alt={clubName}
            fill
            className="object-cover"
            sizes="128px"
            priority
          />
        </div>

        <div className="min-w-0 space-y-6">
          <div className="space-y-1">
            <h1 className="truncate text-2xl font-semibold text-greyscale-0">
              {clubName}
            </h1>
            <p className="text-base font-semibold text-greyscale-50">
              {club.clubCode}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              icon={<RiLogoutCircleLine />}
              onClick={() => setLeaveDialogOpen(true)}
            >
              {t("out")}
            </Button>

            <Button
              icon={<GoLaw size={20} />}
              variant="secondary"
              onClick={() => setPolicyDialogOpen(true)}
            >
              {locale === "en" ? "Policy" : "Nội quy"}
            </Button>
            <Button
              icon={<MdOutlineReport size={20} />}
              variant="deleteIcon"
              onClick={() => setReportDialogOpen(true)}
            >
              {locale === "en" ? "Report" : "Khiếu nại"}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid w-full gap-4 md:grid-cols-2 xl:w-auto xl:min-w-190">
        <StatCard
          icon={<IoStar size={24} />}
          title={t("manager")}
          value={managerName}
          variant="primary"
        />

        <StatCard
          icon={<IoPeople size={24} />}
          title={t("members")}
          value={club.totalMembers}
          variant="secondary"
        />
      </div>

      <Dialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("out")}</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn rời khỏi câu lạc bộ này không?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setLeaveDialogOpen(false)}
              disabled={leaveClubMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              onClick={async () => {
                if (!clubId) return;

                try {
                  const response = await leaveClubMutation.mutateAsync({
                    clubId,
                  });
                  toast.success(
                    response.message || "Đã rời câu lạc bộ thành công.",
                  );
                  setLeaveDialogOpen(false);
                  router.push("/member");
                } catch (leaveError) {
                  const message =
                    (
                      leaveError as {
                        response?: { data?: { message?: string } };
                      }
                    )?.response?.data?.message ||
                    (leaveError as { message?: string })?.message ||
                    "Không thể rời câu lạc bộ.";
                  toast.error(message);
                }
              }}
              disabled={leaveClubMutation.isPending}
            >
              {leaveClubMutation.isPending ? "Đang rời..." : "Xác nhận"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={policyDialogOpen} onOpenChange={setPolicyDialogOpen}>
        <DialogContent className="max-h-[80vh] max-w-3xl overflow-hidden p-0">
          <div className="flex max-h-[80vh] flex-col">
            <DialogHeader className="border-b border-greyscale-700 px-6 py-5">
              <DialogTitle>
                {locale === "en" ? "Club Policy" : "Nội quy câu lạc bộ"}
              </DialogTitle>
              <DialogDescription>
                {locale === "en"
                  ? "Read the current club policy before continuing."
                  : "Xem nội quy hiện tại của câu lạc bộ."}
              </DialogDescription>
            </DialogHeader>

            <div className="overflow-y-auto px-6 py-5">
              <div className="dv-quill-render ql-editor min-h-48 rounded border border-greyscale-700 bg-greyscale-900 p-4 text-greyscale-0">
                <div
                  dangerouslySetInnerHTML={{ __html: clubPolicy || "<p>-</p>" }}
                />
              </div>
            </div>

            <DialogFooter className="border-t border-greyscale-700 px-6 py-4">
              <Button onClick={() => setPolicyDialogOpen(false)}>
                {locale === "en" ? "Close" : "Đóng"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={reportDialogOpen}
        onOpenChange={(nextOpen) => {
          setReportDialogOpen(nextOpen);
          if (!nextOpen) {
            resetReportForm();
          }
        }}
      >
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-hidden p-0">
          <div className="flex max-h-[85vh] flex-col">
            <DialogHeader className="border-b border-greyscale-700 px-6 py-5 text-left">
              <DialogTitle>
                {locale === "vi" ? "Khiếu nại câu lạc bộ" : "Report club"}
              </DialogTitle>
              <DialogDescription>
                {locale === "vi"
                  ? "Chọn một mẫu câu có sẵn hoặc nhập nội dung của bạn ở chế độ Khác."
                  : "Pick a preset reason or switch to Other to enter your own content."}
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              <div className="space-y-3">
                <p className="text-sm font-medium text-greyscale-0">
                  {locale === "vi" ? "Chọn lý do" : "Choose a reason"}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {REPORT_PRESETS.map((preset) => {
                    const isSelected = preset.id === selectedPresetId;

                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setSelectedPresetId(preset.id)}
                        className={`rounded border px-4 py-3 text-left transition-colors ${
                          isSelected
                            ? "border-primary bg-primary/10 text-greyscale-0"
                            : "border-greyscale-700 bg-greyscale-900 text-greyscale-100 hover:border-greyscale-500 hover:bg-greyscale-800"
                        }`}
                      >
                        <p className="font-semibold">{preset.label}</p>
                        {preset.id !== "other" ? (
                          <p className="mt-1 text-xs text-greyscale-200 line-clamp-2">
                            {locale === "vi"
                              ? preset.contentVN
                              : preset.contentEN}
                          </p>
                        ) : (
                          <p className="mt-1 text-xs text-greyscale-200">
                            {locale === "vi"
                              ? "Cho phép bạn nhập nội dung riêng cho khiếu nại."
                              : "Lets you write a custom report message."}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {isCustomPreset ? (
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-greyscale-0">
                      {locale === "vi"
                        ? "Nội dung tiếng Việt"
                        : "Vietnamese content"}
                    </p>
                    <Textarea
                      value={customContentVN}
                      onChange={(event) =>
                        setCustomContentVN(event.target.value)
                      }
                      placeholder={
                        locale === "vi"
                          ? "Nhập nội dung khiếu nại bằng tiếng Việt"
                          : "Enter the report content in Vietnamese"
                      }
                      className="min-h-28"
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-greyscale-0">
                      {locale === "vi"
                        ? "Nội dung tiếng Anh"
                        : "English content"}
                    </p>
                    <Textarea
                      value={customContentEN}
                      onChange={(event) =>
                        setCustomContentEN(event.target.value)
                      }
                      placeholder={
                        locale === "vi"
                          ? "Nhập nội dung khiếu nại bằng tiếng Anh"
                          : "Enter the report content in English"
                      }
                      className="min-h-28"
                    />
                  </div>
                </div>
              ) : (
                <div className="rounded border border-greyscale-700 bg-greyscale-900/70 p-4 space-y-3">
                  <p className="text-sm font-medium text-greyscale-0">
                    {locale === "vi"
                      ? "Nội dung khiếu nại đã chọn"
                      : "Selected report content"}
                  </p>
                  <div className="space-y-3 text-sm text-greyscale-100">
                    <p>
                      <span className="font-semibold text-greyscale-0">
                        VI:{" "}
                      </span>
                      {selectedPreset.contentVN}
                    </p>
                    <p>
                      <span className="font-semibold text-greyscale-0">
                        EN:{" "}
                      </span>
                      {selectedPreset.contentEN}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="border-t border-greyscale-700 px-6 py-4">
              <Button
                variant="outline"
                onClick={() => setReportDialogOpen(false)}
                disabled={createReportMutation.isPending}
              >
                {locale === "vi" ? "Hủy" : "Cancel"}
              </Button>
              <Button
                onClick={handleSubmitReport}
                disabled={createReportMutation.isPending}
              >
                {createReportMutation.isPending
                  ? locale === "vi"
                    ? "Đang gửi..."
                    : "Submitting..."
                  : locale === "vi"
                    ? "Gửi khiếu nại"
                    : "Submit report"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
