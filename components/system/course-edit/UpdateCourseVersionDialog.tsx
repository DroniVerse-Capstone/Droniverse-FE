"use client";

import { AxiosError } from "axios";
import React, { useEffect, useRef, useState } from "react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateCourseVersion } from "@/hooks/course-version/useCourseVersion";
import {
  CourseVersion,
  updateCourseVersionRequestSchema,
} from "@/validations/course-version/course-version";
import { BiEdit } from "react-icons/bi";
import { COURSE_LEVELS } from "@/lib/constants/course";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "@/providers/i18n-provider";

type CourseLevel = "EASY" | "MEDIUM" | "HARD";

const COURSE_LEVEL_OPTIONS: Array<{ value: CourseLevel; label: string }> =
  COURSE_LEVELS.filter((item) => item.value !== null).map((item) => ({
    value: item.value as CourseLevel,
    label: item.label,
  }));

type UpdateCourseVersionDialogProps = {
  courseId: string;
  version: CourseVersion;
};

function toFormValue(version: CourseVersion) {
  return {
    titleVN: version.titleVN || "",
    titleEN: version.titleEN || "",
    descriptionVN: version.descriptionVN || "",
    descriptionEN: version.descriptionEN || "",
    contextVN: version.contextVN || "",
    contextEN: version.contextEN || "",
    imageUrl: version.imageUrl || "",
    level: version.level,
    estimatedDuration: version.estimatedDuration,
    changeLog: "",
  };
}

export default function UpdateCourseVersionDialog({
  courseId,
  version,
}: UpdateCourseVersionDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(() => toFormValue(version));
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations("CourseManagement.CreateCourseDialog");
  const updateCourseVersionMutation = useUpdateCourseVersion();
  const isSubmitting = updateCourseVersionMutation.isPending;

  useEffect(() => {
    if (!open) {
      setForm(toFormValue(version));
    }
  }, [open, version]);

  useEffect(() => {
    if (!open) return;

    requestAnimationFrame(() => {
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: "auto" });
      firstInputRef.current?.focus();
    });
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
      level: form.level,
      estimatedDuration: Number(form.estimatedDuration),
      changeLog: form.changeLog.trim(),
    }),
    [form]
  );

  const formValidation = React.useMemo(
    () => updateCourseVersionRequestSchema.safeParse(normalizedPayload),
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
        normalizedPayload.changeLog,
      ].every((value) => value.length > 0),
    [normalizedPayload]
  );

  const isFormValid = formValidation.success && hasAllRequiredFields;

  const setField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (isSubmitting) return;
    setOpen(nextOpen);
    if (!nextOpen) {
      setForm(toFormValue(version));
    }
  };

  const handleSubmit = async () => {
    if (!isFormValid || !formValidation.success) {
      toast.error(t("toast.error"));
      return;
    }

    try {
      await updateCourseVersionMutation.mutateAsync({
        courseId,
        versionId: version.courseVersionID,
        payload: formValidation.data,
      });

      toast.success(t("toast.success1"));
      setOpen(false);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(
        axiosError.response?.data?.message ||
          axiosError.message ||
          t("error.updateFailed")
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="tertiary" icon={<BiEdit size={20} />}>
          {t("titleEdit")}
        </Button>
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-6xl max-h-[90vh] overflow-hidden p-0"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          requestAnimationFrame(() => {
            scrollContainerRef.current?.scrollTo({ top: 0, behavior: "auto" });
            firstInputRef.current?.focus();
          });
        }}
      >
        <div className="flex max-h-[90vh] flex-col">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>{t("titleEdit")}</DialogTitle>
            <DialogDescription>
              {t("subtitleEdit")}
            </DialogDescription>
          </DialogHeader>

          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-6 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="update-course-title-vn">{t("fields.title.vi")}</Label>
                <Input
                  ref={firstInputRef}
                  id="update-course-title-vn"
                  value={form.titleVN}
                  onChange={(event) => setField("titleVN", event.target.value)}
                  placeholder={t("fields.title.placeholderVi")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="update-course-title-en">{t("fields.title.en")}</Label>
                <Input
                  id="update-course-title-en"
                  value={form.titleEN}
                  onChange={(event) => setField("titleEN", event.target.value)}
                  placeholder={t("fields.title.placeholderEn")}
                />
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="update-course-desc-vn">{t("fields.description.vi")}</Label>
                <Textarea
                  id="update-course-desc-vn"
                  value={form.descriptionVN}
                  onChange={(event) => setField("descriptionVN", event.target.value)}
                  placeholder={t("fields.description.placeholderVi")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="update-course-desc-en">{t("fields.description.en")}</Label>
                <Textarea
                  id="update-course-desc-en"
                  value={form.descriptionEN}
                  onChange={(event) => setField("descriptionEN", event.target.value)}
                  placeholder={t("fields.description.placeholderEn")}
                />
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="update-course-duration">{t("fields.estimatedTime")}</Label>
                <Input
                  id="update-course-duration"
                  type="number"
                  min={0}
                  value={form.estimatedDuration}
                  onChange={(event) =>
                    setField("estimatedDuration", Number(event.target.value || 0))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>{t("fields.level")}</Label>
                <div className="flex flex-wrap gap-2">
                  {COURSE_LEVEL_OPTIONS.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setField("level", item.value)}
                      className={
                        form.level === item.value
                          ? "rounded border border-primary bg-primary px-3 py-1.5 text-sm text-greyscale-0"
                          : "rounded border border-greyscale-600 bg-greyscale-800 px-3 py-1.5 text-sm text-greyscale-100 hover:border-greyscale-400"
                      }
                    >
                      {t(item.label)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Label htmlFor="update-course-change-log">{t("fields.changeLog")} *</Label>
              <Textarea
                id="update-course-change-log"
                value={form.changeLog}
                onChange={(event) => setField("changeLog", event.target.value)}
              />
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
              {isSubmitting ? <Spinner /> : t("buttons.update")}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export type { UpdateCourseVersionDialogProps };