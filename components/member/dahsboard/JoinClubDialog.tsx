import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ClubCard from "@/components/club/ClubCard";
import { useGetClubDetailByCode } from "@/hooks/club/useClub";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { useClubAttempt } from "@/hooks/club-attempt/useClubAttempt";
import { VscGitPullRequestGoToChanges } from "react-icons/vsc";
import { Spinner } from "@/components/ui/spinner";
import { useLocale, useTranslations } from "@/providers/i18n-provider";
import { MediaTypeUpload } from "@/components/club/MediaTypeUpload";
import Image from "next/image";

export default function JoinClubDialog() {
  const t = useTranslations("JoinClubDialog");
  const locale = useLocale();
  const [clubCode, setClubCode] = useState("");
  const [searchCode, setSearchCode] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [evidenceDialogOpen, setEvidenceDialogOpen] = useState(false);
  const [ownershipMediaId, setOwnershipMediaId] = useState("");

  const {
    data: club,
    isLoading,
    isError,
    error,
  } = useGetClubDetailByCode(searchCode || undefined);

  const { mutate: attemptJoinClub, isPending: isJoining } = useClubAttempt();

  const resetForm = () => {
    setClubCode("");
    setSearchCode(null);
    setOwnershipMediaId("");
    setEvidenceDialogOpen(false);
  };

  const handleFindClub = () => {
    setSearchCode(clubCode.trim());
  };

  const handleJoin = () => {
    if (club) {
      attemptJoinClub(
        { clubCode: club.clubCode, mediaId: ownershipMediaId },
        {
          onSuccess: (data) => {
            setEvidenceDialogOpen(false);
            setOpen(false);
            resetForm();
            toast.success(data.message);
          },
          onError: (error) => {
            toast.error(error.response?.data?.message || error.message);
          },
        },
      );
    }
  };

  const handleOpenEvidenceDialog = () => {
    if (!club) return;
    setEvidenceDialogOpen(true);
  };

  useEffect(() => {
    if (isError) {
      toast.error(error?.response?.data?.message || t("error"));
    }
  }, [isError, error, t]);

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button icon={<VscGitPullRequestGoToChanges size={20} />}>
          {t("title")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </DialogHeader>
        <div className="space-y-2 w-full">
          <Label className="text-sm font-medium">{t("field.code")}</Label>
          <div className="grid w-full grid-cols-[1fr_auto] items-center gap-2">
            <Input
              className="min-w-0 w-full"
              value={clubCode}
              onChange={(e) => setClubCode(e.target.value)}
              placeholder={t("field.codePlaceholder")}
            />
            <Button
              className="shrink-0"
              variant={"secondary"}
              onClick={handleFindClub}
              disabled={isLoading || !clubCode}
            >
              {isLoading ? <Spinner /> : t("buttons.find")}
            </Button>
          </div>
        </div>
        {club && (
          <div className="mt-4">
            <ClubCard club={club} />
          </div>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button onClick={resetForm} variant="outline">
              {t("buttons.cancel")}
            </Button>
          </DialogClose>
          <Button
            onClick={handleOpenEvidenceDialog}
            disabled={!club || isJoining}
          >
            {t("buttons.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>

      <Dialog open={evidenceDialogOpen} onOpenChange={setEvidenceDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {locale === "vi"
                ? "Bằng chứng sở hữu Drone"
                : "Drone ownership evidence"}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {locale === "vi"
                ? "Vui lòng tải lên hình ảnh hoặc video chứng minh bạn sở hữu drone phù hợp với câu lạc bộ trước khi gửi yêu cầu tham gia."
                : "Please upload an image or video proving you own a drone that matches this club before sending your join request."}
            </p>
          </DialogHeader>

          {club?.drone && (
            <div className="rounded border border-greyscale-700 bg-greyscale-900/40 p-3">
              <p className="text-sm text-greyscale-0">
                {locale === "vi" ? "Drone yêu cầu" : "Required drone"}
              </p>
              <div className="flex items-center mt-1 gap-3">
                <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded border border-greyscale-700">
                  <Image
                    src={club.drone.imgURL || "/images/drone-placeholder.jpg"}
                    alt={
                      locale === "vi"
                        ? club.drone.droneNameVN
                        : club.drone.droneNameEN
                    }
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-greyscale-0">
                  {locale === "vi"
                    ? club.drone.droneNameVN
                    : club.drone.droneNameEN}
                </p>
                <p className="text-xs text-greyscale-100">
                  {locale === "vi"
                    ? club.drone.droneTypeNameVN
                    : club.drone.droneTypeNameEN}
                  {club.drone.manufacturer
                    ? ` • ${club.drone.manufacturer}`
                    : ""}
                </p>
                </div>
                
              </div>
            </div>
          )}

          <MediaTypeUpload
            value={ownershipMediaId}
            onChange={setOwnershipMediaId}
            label={
              locale === "vi"
                ? "Bằng chứng sở hữu drone"
                : "Drone ownership evidence"
            }
            disabled={isJoining}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isJoining}
              onClick={() => setEvidenceDialogOpen(false)}
            >
              {locale === "vi" ? "Đóng" : "Close"}
            </Button>
            <Button
              type="button"
              onClick={handleJoin}
              disabled={!club || !ownershipMediaId || isJoining}
            >
              {isJoining ? (
                <Spinner />
              ) : locale === "vi" ? (
                "Gửi yêu cầu"
              ) : (
                "Submit request"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
