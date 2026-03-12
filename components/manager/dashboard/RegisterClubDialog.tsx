"use client";

import React, { use } from "react";
import toast from "react-hot-toast";
import { MdOutlineCreateNewFolder } from "react-icons/md";

import CategoryDropdown from "@/components/common/CategoryDropdown";
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
import { useClubCreation } from "@/hooks/club-creation/useClubCreation";
import { clubCreationRequestSchema } from "@/validations/club-creation/club-creation";
import { useTranslations } from "@/providers/i18n-provider";
import { Spinner } from "@/components/ui/spinner";

export default function RegisterClubDialog() {
  const t = useTranslations("RegisterClubDialog");
  const [clubName, setClubName] = React.useState("");
  const [clubNameEn, setClubNameEn] = React.useState("");
  const [clubDescription, setClubDescription] = React.useState("");
  const [categoryIds, setCategoryIds] = React.useState<string[]>([]);
  const [isPublic, setIsPublic] = React.useState(true);
  const [memberLimit, setMemberLimit] = React.useState(10);
  const [managerLimit, setManagerLimit] = React.useState(1);
  const [clubImageUrl, setClubImageUrl] = React.useState("");
  const [open, setOpen] = React.useState(false);

  const clubCreation = useClubCreation();

  const resetForm = () => {
  setClubName("");
  setClubNameEn("");
  setClubDescription("");
  setCategoryIds([]);
  setIsPublic(true);
  setMemberLimit(10);
  setManagerLimit(1);
  setClubImageUrl("");
};

  const handleSubmit = () => {
    const payload = {
      nameVN: clubName.trim(),
      nameEN: clubNameEn.trim(),
      description: clubDescription.trim(),
      isPublic,
      limitParticipant: memberLimit,
      limitClubManager: managerLimit,
      image: clubImageUrl.trim(),
      categoryIDs: categoryIds,
    };

    const result = clubCreationRequestSchema.safeParse(payload);

    if (!result.success) {
      const message = t("validation");
      toast.error(message);
      return;
    }

    clubCreation.mutate(result.data, {
      onSuccess: (data) => {
        toast.success(data.message);
        resetForm();
        setOpen(false);
      },
      onError: (error) => {
        const message =
          error.response?.data?.message ||
          error.message ||
          t("error");

        toast.error(message);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button icon={<MdOutlineCreateNewFolder size={20} />}>
          {t("title")}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-hidden p-0">
        <div className="flex max-h-[85vh] flex-col">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>{t("title")}</DialogTitle>
            <DialogDescription>
              {t("subtitle")}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-4">
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

              <ClubImageUpload label={t("fields.coverImage")} value={clubImageUrl} onChange={setClubImageUrl} />

              <CategoryDropdown
                value={categoryIds}
                onChange={setCategoryIds}
                label={t("fields.category")}
                placeholder={t("fields.categoryPlaceholder")}
              />

              <div className="space-y-2">
                <Label htmlFor="club-description">{t("fields.description")}</Label>
                <Textarea
                  id="club-description"
                  placeholder={t("fields.description")}
                  value={clubDescription}
                  onChange={(e) => setClubDescription(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  id="club-public"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
                <Label htmlFor="club-public" className="text-base">
                  {t("fields.isPublic")}
                </Label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="member-limit">{t("fields.limitMembers")}</Label>
                  <Input
                    id="member-limit"
                    type="number"
                    min="10"
                    value={memberLimit}
                    onChange={(e) => setMemberLimit(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manager-limit">{t("fields.limitManagers")}</Label>
                  <Input
                    id="manager-limit"
                    type="number"
                    min="1"
                    value={managerLimit}
                    onChange={(e) => setManagerLimit(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-row justify-end gap-3 border-t border-greyscale-700 px-6 py-4 sm:space-x-0">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {t("buttons.cancel")}
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={clubCreation.isPending}
            >
              {clubCreation.isPending ? <Spinner /> : t("buttons.submit")}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
