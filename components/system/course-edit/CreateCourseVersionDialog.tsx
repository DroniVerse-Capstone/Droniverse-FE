"use client";

import { AxiosError } from "axios";
import React from "react";
import toast from "react-hot-toast";

import QuillEditor from "@/components/common/QuillEditor";
import { ClubImageUpload } from "@/components/manager/dashboard/ClubImageUpload";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
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
import { useCreateCourseVersion } from "@/hooks/course-version/useCourseVersion";
import { useTranslations } from "@/providers/i18n-provider";
import { createCourseVersionRequestSchema } from "@/validations/course-version/course-version";

const DEFAULT_FORM = {
  titleVN: "",
  titleEN: "",
  descriptionVN: "",
  descriptionEN: "",
  contextVN: "",
  contextEN: "",
  imageUrl: "",
  estimatedDuration: 60,
};

type CreateCourseVersionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  onCreated?: (versionId: string) => void;
};

export default function CreateCourseVersionDialog({
  open,
  onOpenChange,
  courseId,
  onCreated,
}: CreateCourseVersionDialogProps) {
  const [form, setForm] = React.useState(DEFAULT_FORM);
  const t = useTranslations("CourseManagement.CreateCourseDialog");
  const createCourseVersionMutation = useCreateCourseVersion();
  const isSubmitting = createCourseVersionMutation.isPending;

  React.useEffect(() => {
    if (!open) {
      setForm(DEFAULT_FORM);
    }
  }, [open]);

  const normalizedPayload = React.useMemo(
    () => ({
      titleVN: form.titleVN.trim(),
      titleEN: form.titleEN.trim(),
      descriptionVN: form.descriptionVN.trim(),
      descriptionEN: form.descriptionEN.trim(),
      contextVN: form.contextVN.trim(),
      contextEN: form.contextEN.trim(),
      imageUrl: form.imageUrl.trim(),
      estimatedDuration: Number(form.estimatedDuration),
    }),
    [form]
  );

  const formValidation = React.useMemo(
    () => createCourseVersionRequestSchema.safeParse(normalizedPayload),
    [normalizedPayload]
  );

  const hasAllRequiredFields = React.useMemo(
    () =>
      [
        normalizedPayload.titleVN,
        normalizedPayload.titleEN,
        normalizedPayload.descriptionVN,
        normalizedPayload.descriptionEN,
        normalizedPayload.contextVN,
        normalizedPayload.contextEN,
        normalizedPayload.imageUrl,
      ].every((value) => value.length > 0),
    [normalizedPayload]
  );

  const isFormValid = formValidation.success && hasAllRequiredFields;

  const setField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (isSubmitting) return;
    onOpenChange(nextOpen);
  };

  const handleSubmit = async () => {
    if (!isFormValid || !formValidation.success) {
      toast.error(t("toast.error"));
      return;
    }

    try {
      const createdVersion = await createCourseVersionMutation.mutateAsync({
        courseId,
        payload: formValidation.data,
      });

      toast.success(t("toast.success1"));
      onCreated?.(createdVersion.courseVersionID);
      onOpenChange(false);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(
        axiosError.response?.data?.message ||
          axiosError.message ||
          t("error.createFailed")
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-hidden p-0">
        <div className="flex max-h-[90vh] flex-col">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>{t("titleVersion")}</DialogTitle>
            <DialogDescription>
              {t("subtitleVersion")}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="create-course-version-title-vn">{t("fields.title.vi")}</Label>
                <Input
                  id="create-course-version-title-vn"
                  value={form.titleVN}
                  onChange={(event) => setField("titleVN", event.target.value)}
                  placeholder={t("fields.title.placeholderVi")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-course-version-title-en">{t("fields.title.en")}</Label>
                <Input
                  id="create-course-version-title-en"
                  value={form.titleEN}
                  onChange={(event) => setField("titleEN", event.target.value)}
                  placeholder={t("fields.title.placeholderEn")}
                />
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="create-course-version-desc-vn">{t("fields.description.vi")}</Label>
                <Textarea
                  id="create-course-version-desc-vn"
                  value={form.descriptionVN}
                  onChange={(event) => setField("descriptionVN", event.target.value)}
                  placeholder={t("fields.description.placeholderVi")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-course-version-desc-en">{t("fields.description.en")}</Label>
                <Textarea
                  id="create-course-version-desc-en"
                  value={form.descriptionEN}
                  onChange={(event) => setField("descriptionEN", event.target.value)}
                  placeholder={t("fields.description.placeholderEn")}
                />
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="create-course-version-duration">{t("fields.estimatedTime")}</Label>
                <Input
                  id="create-course-version-duration"
                  type="number"
                  min={0}
                  value={form.estimatedDuration}
                  onChange={(event) =>
                    setField("estimatedDuration", Number(event.target.value || 0))
                  }
                />
              </div>
            </div>

            <div className="mt-4">
              <ClubImageUpload
                label={t("fields.coverImage")}
                value={form.imageUrl}
                onChange={(url) => setField("imageUrl", url)}
                disabled={isSubmitting}
              />
            </div>

            <div className="mt-4 space-y-2">
              <Label>{t("fields.context.vi")}</Label>
              <QuillEditor
                value={form.contextVN}
                onChange={(value) => setField("contextVN", value)}
                placeholder={t("fields.context.placeholderVi")}
                minHeight={220}
              />
            </div>

            <div className="mt-4 space-y-2">
              <Label>{t("fields.context.en")}</Label>
              <QuillEditor
                value={form.contextEN}
                onChange={(value) => setField("contextEN", value)}
                placeholder={t("fields.context.placeholderEn")}
                minHeight={220}
              />
            </div>
          </div>

          <DialogFooter className="flex-row justify-end gap-3 border-t border-greyscale-700 px-6 py-4 sm:space-x-0">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                {t("buttons.cancel")}
              </Button>
            </DialogClose>

            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !isFormValid}
            >
              {isSubmitting ? <Spinner /> : t("buttons.createVersion")}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export type { CreateCourseVersionDialogProps };