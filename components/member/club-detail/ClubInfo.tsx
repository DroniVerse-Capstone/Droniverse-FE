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
import { useGetClubDetailById, useLeaveClub } from "@/hooks/club/useClub";
import { useLocale, useTranslations } from "@/providers/i18n-provider";
import StatCard from "@/components/common/StatCard";
import { GoLaw } from "react-icons/go";

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
  const [leaveDialogOpen, setLeaveDialogOpen] = React.useState(false);
  const [policyDialogOpen, setPolicyDialogOpen] = React.useState(false);

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
    </div>
  );
}
