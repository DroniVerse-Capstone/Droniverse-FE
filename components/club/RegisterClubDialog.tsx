"use client";

import React, { useEffect } from "react";
import toast from "react-hot-toast";
import { MdOutlineCreateNewFolder } from "react-icons/md";

import DroneDropdown from "@/components/common/DroneDropdown";
import QuillEditor from "@/components/common/QuillEditor";
import { MediaTypeUpload } from "@/components/club/MediaTypeUpload";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ClubImageUpload } from "@/components/manager/dashboard/ClubImageUpload";
import {
  useClubCreation,
  useGetClubCreationRequestDetail,
  useUpdateClubCreationRequestInformation,
} from "@/hooks/club-creation/useClubCreation";
import { clubCreationRequestSchema } from "@/validations/club-creation/club-creation";
import { useTranslations } from "@/providers/i18n-provider";
import { Spinner } from "@/components/ui/spinner";

type RegisterClubDialogProps = {
  mode?: "create" | "edit";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  requestId?: string;
  trigger?: React.ReactNode | null;
};

export default function RegisterClubDialog({
  mode = "create",
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  requestId,
  trigger,
}: RegisterClubDialogProps) {
  const t = useTranslations("RegisterClubDialog");

  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledOnOpenChange ?? setInternalOpen;

  const [clubName, setClubName] = React.useState("");
  const [clubNameEn, setClubNameEn] = React.useState("");
  const [clubDescription, setClubDescription] = React.useState("");
  const [droneId, setDroneId] = React.useState("");
  const [clubPolicy, setClubPolicy] = React.useState("");
  const [mediaId, setMediaId] = React.useState("");
  const [memberLimit, setMemberLimit] = React.useState(10);
  const [clubImageUrl, setClubImageUrl] = React.useState("");

  const createMutation = useClubCreation();
  const updateMutation = useUpdateClubCreationRequestInformation();

  const { data: detail, isLoading: isDetailLoading } =
    useGetClubCreationRequestDetail(
      mode === "edit" && open ? requestId : undefined,
    );

  const resetForm = () => {
    setClubName("");
    setClubNameEn("");
    setClubDescription("");
    setDroneId("");
    setClubPolicy("");
    setMediaId("");
    setMemberLimit(10);
    setClubImageUrl("");
  };

  useEffect(() => {
    if (!open) return;
    if (mode !== "edit") return;
    if (!detail) return;

    setClubName(detail.nameVN);
    setClubNameEn(detail.nameEN);
    setClubDescription(detail.description);
    setDroneId(detail.droneID ?? "");
    setClubPolicy(detail.clubPolicy ?? "");
    setMediaId(detail.media ?? "");
    setMemberLimit(detail.limitParticipant);
    setClubImageUrl(detail.imageUrl ?? "");
  }, [open, mode, detail]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = () => {
    const payload = {
      droneID: droneId.trim(),
      clubPolicy: clubPolicy.trim(),
      media: mediaId.trim(),
      nameVN: clubName.trim(),
      nameEN: clubNameEn.trim(),
      description: clubDescription.trim(),
      limitParticipant: memberLimit,
      image: clubImageUrl.trim(),
    };

    const result = clubCreationRequestSchema.safeParse(payload);
    if (!result.success) {
      toast.error(t("validation"));
      return;
    }

    if (mode === "edit") {
      if (!requestId) return;

      updateMutation.mutate(
        { id: requestId, data: result.data },
        {
          onSuccess: (res) => {
            toast.success(res.message);
            setOpen(false);
          },
          onError: (error) => {
            toast.error(
              error.response?.data?.message || error.message || t("error"),
            );
          },
        },
      );
      return;
    }

    createMutation.mutate(result.data, {
      onSuccess: (res) => {
        toast.success(res.message);
        resetForm();
        setOpen(false);
      },
      onError: (error) => {
        toast.error(
          error.response?.data?.message || error.message || t("error"),
        );
      },
    });
  };

  const dialogTitle = mode === "edit" ? t("editTitle") : t("title");
  const dialogSubtitle = mode === "edit" ? t("editSubtitle") : t("subtitle");
  const submitLabel =
    mode === "edit" ? t("buttons.update") : t("buttons.submit");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {mode === "create" && (
        <DialogTrigger asChild>
          {trigger ?? (
            <Button icon={<MdOutlineCreateNewFolder size={20} />}>
              {t("title")}
            </Button>
          )}
        </DialogTrigger>
      )}

      <DialogContent className="w-full max-w-3xl max-h-[85vh] overflow-hidden p-0">
        <div className="flex max-h-[85vh] flex-col">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogSubtitle}</DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {mode === "edit" && isDetailLoading ? (
              <div className="flex min-h-40 items-center justify-center">
                <Spinner className="h-5 w-5" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="club-name">{t("fields.nameVi")}</Label>
                    <Input
                      id="club-name"
                      placeholder={t("fields.nameVi")}
                      value={clubName}
                      onChange={(e) => setClubName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="club-name-en">{t("fields.nameEn")}</Label>
                    <Input
                      id="club-name-en"
                      placeholder={t("fields.nameEn")}
                      value={clubNameEn}
                      onChange={(e) => setClubNameEn(e.target.value)}
                    />
                  </div>
                </div>

                <ClubImageUpload
                  label={t("fields.coverImage")}
                  value={clubImageUrl}
                  onChange={setClubImageUrl}
                />

                <DroneDropdown
                  value={droneId}
                  onChange={setDroneId}
                  label="Chọn drone bắt buộc của câu lạc bộ"
                  placeholder="Chọn drone"
                />

                <MediaTypeUpload
                  label="Bằng chứng sở hữu drone (ảnh hoặc video)"
                  value={mediaId}
                  onChange={setMediaId}
                  onUploaded={(media) => {
                    if (!clubImageUrl) {
                      setClubImageUrl(media.url);
                    }
                  }}
                />

                <QuillEditor
                  label="Thiết lập nội quy câu lạc bộ"
                  value={clubPolicy}
                  onChange={setClubPolicy}
                  placeholder="Nhập nội quy của câu lạc bộ"
                  minHeight={140}
                />

                <div className="space-y-2">
                  <Label htmlFor="club-description">
                    {t("fields.description")}
                  </Label>
                  <Textarea
                    id="club-description"
                    placeholder={t("fields.description")}
                    value={clubDescription}
                    onChange={(e) => setClubDescription(e.target.value)}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="member-limit">
                      {t("fields.limitMembers")}
                    </Label>
                    <Input
                      id="member-limit"
                      type="number"
                      min="10"
                      value={memberLimit}
                      onChange={(e) => setMemberLimit(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex-row justify-end gap-3 border-t border-greyscale-700 px-6 py-4 sm:space-x-0">
            <DialogClose asChild>
              <Button onClick={resetForm} type="button" variant="outline">
                {t("buttons.cancel")}
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Spinner /> : submitLabel}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
