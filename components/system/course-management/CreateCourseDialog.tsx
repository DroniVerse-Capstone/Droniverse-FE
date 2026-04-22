"use client";

import { AxiosError } from "axios";
import React from "react";
import toast from "react-hot-toast";
import { MdOutlineAddCircleOutline } from "react-icons/md";

import QuillEditor from "@/components/common/QuillEditor";
import CommonDropdown from "@/components/common/CommonDropdown";
import DroneDropdown from "@/components/common/DroneDropdown";
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
import { useCreateCourse } from "@/hooks/course/useCourse";
import { useGetLevelsByDrone } from "@/hooks/level/useLevel";
import { useTranslations } from "@/providers/i18n-provider";
import { useLocale } from "@/providers/i18n-provider";
import { Spinner } from "@/components/ui/spinner";
import { createCourseRequestSchema } from "@/validations/course/course";

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

export default function CreateCourseDialog() {
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState(DEFAULT_FORM);
  const [droneId, setDroneId] = React.useState("");
  const [levelId, setLevelId] = React.useState("");

  const t = useTranslations("CourseManagement.CreateCourseDialog");
  const locale = useLocale();

  const createCourseMutation = useCreateCourse();
  const { data: levels = [], isLoading: isLevelsLoading } =
    useGetLevelsByDrone(droneId || undefined);

  const isSubmitting = createCourseMutation.isPending;

  const levelOptions = React.useMemo(
    () =>
      levels.map((level) => ({
        value: level.levelID,
        label: (() => {
          const levelNameMapVi: Record<number, string> = {
            1: "Cơ bản",
            2: "Trung cấp",
            3: "Nâng cao",
            4: "Master",
          };

          const levelNameMapEn: Record<number, string> = {
            1: "Beginner",
            2: "Intermediate",
            3: "Advanced",
            4: "Master",
          };

          const localizedName =
            locale === "vi"
              ? levelNameMapVi[level.levelNumber]
              : levelNameMapEn[level.levelNumber];

          return `${level.levelNumber}. ${localizedName ?? level.name}`;
        })(),
      })),
    [levels, locale]
  );

  const normalizedVersionPayload = React.useMemo(
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

  const createPayload = React.useMemo(
    () => ({
      levelID: levelId.trim(),
      version: {
        ...normalizedVersionPayload,
        changeLog: null,
      },
    }),
    [levelId, normalizedVersionPayload]
  );

  const formValidation = React.useMemo(() => {
    return createCourseRequestSchema.safeParse(createPayload);
  }, [createPayload]);

  const hasAllRequiredFields = React.useMemo(
    () =>
      [
        normalizedVersionPayload.titleVN,
        normalizedVersionPayload.titleEN,
        normalizedVersionPayload.descriptionVN,
        normalizedVersionPayload.descriptionEN,
        normalizedVersionPayload.contextVN,
        normalizedVersionPayload.contextEN,
        normalizedVersionPayload.imageUrl,
        levelId,
      ].every((value) => value.length > 0),
    [normalizedVersionPayload, levelId]
  );

  const isFormValid = formValidation.success && hasAllRequiredFields;

  const setField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setForm(DEFAULT_FORM);
    setDroneId("");
    setLevelId("");
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (isSubmitting) return;
    setOpen(nextOpen);
    if (!nextOpen) {
      resetForm();
    }
  };

  const handleSubmit = async () => {
    if (!isFormValid || !formValidation.success) {
      toast.error(t("toast.error"));
      return;
    }

    try {
      await createCourseMutation.mutateAsync(formValidation.data);

      toast.success(t("toast.success"));
      setOpen(false);
      resetForm();
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(
        axiosError.response?.data?.message ||
          axiosError.message ||
          t("error.createFailed"),
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button icon={<MdOutlineAddCircleOutline size={20} />}>{t("title")}</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-hidden p-0">
        <div className="flex max-h-[90vh] flex-col">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>{t("title")}</DialogTitle>
            <DialogDescription>
              {t("subtitle")}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="course-title-vn">{t("fields.title.vi")}</Label>
                <Input
                  id="course-title-vn"
                  value={form.titleVN}
                  onChange={(event) => setField("titleVN", event.target.value)}
                  placeholder={t("fields.title.placeholderVi")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="course-title-en">{t("fields.title.en")}</Label>
                <Input
                  id="course-title-en"
                  value={form.titleEN}
                  onChange={(event) => setField("titleEN", event.target.value)}
                  placeholder={t("fields.title.placeholderEn")}
                />
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="course-desc-vn">{t("fields.description.vi")}</Label>
                <Textarea
                  id="course-desc-vn"
                  value={form.descriptionVN}
                  onChange={(event) => setField("descriptionVN", event.target.value)}
                  placeholder={t("fields.description.placeholderVi")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="course-desc-en">{t("fields.description.en")}</Label>
                <Textarea
                  id="course-desc-en"
                  value={form.descriptionEN}
                  onChange={(event) => setField("descriptionEN", event.target.value)}
                  placeholder={t("fields.description.placeholderEn")}
                />
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="course-duration">{t("fields.estimatedTime")}</Label>
                <Input
                  className="mt-2"
                  id="course-duration"
                  type="number"
                  min={0}
                  value={form.estimatedDuration}
                  onChange={(event) =>
                    setField("estimatedDuration", Number(event.target.value || 0))
                  }
                />
              </div>

              <div className="space-y-2">
                <DroneDropdown
                  value={droneId}
                  onChange={(value) => {
                    setDroneId(value);
                    setLevelId("");
                  }}
                  label={locale === "en" ? "Drone" : "Drone yêu cầu"}
                  placeholder={locale === "en" ? "Select drone" : "Chọn drone"}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <CommonDropdown
                  value={levelId}
                  onChange={setLevelId}
                  options={levelOptions}
                  label={t("fields.level")}
                  placeholder={
                    droneId
                      ? locale === "en"
                        ? "Select level"
                        : "Chọn level"
                      : locale === "en"
                        ? "Select drone first"
                        : "Chọn drone trước"
                  }
                  menuLabel={t("fields.level")}
                  emptyMessage={
                    locale === "en"
                      ? "No levels found for this drone"
                      : "Không có level nào phù hợp với drone này"
                  }
                  disabled={!droneId || isSubmitting || isLevelsLoading}
                  isLoading={isLevelsLoading}
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
              {isSubmitting ? <Spinner /> : t("buttons.create")}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
