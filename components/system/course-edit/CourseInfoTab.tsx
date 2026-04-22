"use client";

import { AxiosError } from "axios";
import React from "react";
import toast from "react-hot-toast";
import { GoZap } from "react-icons/go";
import ConfirmActionPopover from "@/components/common/ConfirmActionPopover";
import CourseVersionStatusBadge from "@/components/course/CourseVersionStatusBadge";
import UpdateCourseVersionDialog from "@/components/system/course-edit/UpdateCourseVersionDialog";
import { Empty } from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  useActivateCourseVersion,
  useCreateCourseVersionCertificate,
  useDeleteCourseVersion,
} from "@/hooks/course-version/useCourseVersion";
import { formatDateTime } from "@/lib/utils/format-date";
import { useLocale, useTranslations } from "@/providers/i18n-provider";
import { ApiError } from "@/types/api/common";
import { CourseVersion } from "@/validations/course-version/course-version";
import Image from "next/image";
import { MdDeleteOutline } from "react-icons/md";

type CourseInfoTabProps = {
  selectedVersionId?: string;
  isVersionFetching: boolean;
  courseId: string;
  currentVersionId?: string;
  courseCreateAt: string;
  courseCreator?: {
    fullName: string;
    email: string;
  } | null;
  version?: CourseVersion;
};

export default function CourseInfoTab({
  selectedVersionId,
  isVersionFetching,
  courseId,
  currentVersionId,
  courseCreateAt,
  courseCreator,
  version,
}: CourseInfoTabProps) {
  const locale = useLocale();
  const activateCourseVersionMutation = useActivateCourseVersion();
  const createCertificateMutation = useCreateCourseVersionCertificate();
  const deleteCourseVersionMutation = useDeleteCourseVersion();
  const t = useTranslations("CourseManagement.CourseInfo");

  if (!selectedVersionId || (isVersionFetching && !version)) {
    return (
      <div className="flex min-h-32 items-center justify-center rounded border border-greyscale-700 bg-greyscale-900 p-4">
        <Spinner className="h-5 w-5" />
      </div>
    );
  }

  if (!version) {
    return (
      <Empty>
        <p className="text-sm text-muted-foreground">
          {t("empty.noVersion")}
        </p>
      </Empty>
    );
  }

  const title =
    locale === "en"
      ? version.titleEN || version.titleVN || "Untitled course"
      : version.titleVN || version.titleEN || t("title.untitled");
  const description =
    locale === "en"
      ? version.descriptionEN || version.descriptionVN || "No description"
      : version.descriptionVN || version.descriptionEN || t("description.empty");
  const contextLabel = locale === "en" ? "Context" : "Nội dung";
  const localizedContext =
    locale === "en"
      ? version.contextEN || version.contextVN || "<p>—</p>"
      : version.contextVN || version.contextEN || "<p>—</p>";
  const hasChangeLog = Boolean(version.changeLog?.trim());
  const isDraftVersion = version.status === "DRAFT";
  const canUpdateVersion = version.status === "DRAFT";
  const canShowVersionActions =
    version.status === "DRAFT" || version.status === "DEPRECATED";
  const canDeleteVersion =
    canShowVersionActions && version.courseVersionID !== currentVersionId;
  const isActivating = activateCourseVersionMutation.isPending;
  const isCreatingCertificate = createCertificateMutation.isPending;
  const isDeleting = deleteCourseVersionMutation.isPending;

  const handleActivateVersion = async () => {

    if (version.certificate === null) {
      toast.error("Vui lòng tạo chứng nhận hoàn thành trước khi kích hoạt.");
      return;
    }

    try {
      await activateCourseVersionMutation.mutateAsync({
        courseId,
        versionId: version.courseVersionID,
      });
      toast.success(t("toast.activateSuccess"));
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      toast.error(
        axiosError.response?.data?.message ||
          axiosError.message ||
          t("toast.activateError")
      );
    }
  };

  const handleDeleteVersion = async () => {
    try {
      await deleteCourseVersionMutation.mutateAsync({
        courseId,
        versionId: version.courseVersionID,
      });
      toast.success(t("toast.deleteSuccess"));
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      toast.error(
        axiosError.response?.data?.message ||
          axiosError.message ||
          t("toast.deleteError")
      );
    }
  };

  const handleCreateCertificate = async () => {
    try {
      await createCertificateMutation.mutateAsync({
        courseId,
        versionId: version.courseVersionID,
        payload: {
          certificateNameVN: `Chứng nhận hoàn thành ${version.titleVN}`,
          certificateNameEN: `Certificate of Completion - ${version.titleEN}`,
        },
      });
      toast.success(t("certificate.toast.createSuccess"));
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      toast.error(
        axiosError.response?.data?.message ||
          axiosError.message ||
          t("certificate.toast.createError")
      );
    }
  };

  return (
    <div className="space-y-5">
      <header className="space-y-3 border-b border-greyscale-700 pb-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-greyscale-0">{title}</h1>
              {isVersionFetching ? <Spinner className="h-4 w-4" /> : null}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded px-2 py-1 text-xs font-medium bg-tertiary/15 text-tertiary border-2 border-tertiary/40">
                {version.estimatedDuration ?? t("duration.unknown")} {t("duration.label")}
              </span>
              <span className="inline-flex rounded px-2 py-1 text-xs font-medium bg-greyscale-700 text-greyscale-100 border border-greyscale-600">
                {t("version.label")} {version.version}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <CourseVersionStatusBadge status={version.status} />
            <div className="flex flex-wrap justify-end gap-2">
              {canUpdateVersion ? (
                <UpdateCourseVersionDialog courseId={courseId} version={version} />
              ) : null}

              {canShowVersionActions ? (
                <ConfirmActionPopover
                  trigger={
                    <Button
                      icon={<GoZap size={20}/>}
                      type="button"
                      variant="secondary"
                      disabled={isActivating || isDeleting}
                    >
                      {t("actions.activate")}
                    </Button>
                  }
                  title={t("confirm.activate.title")}
                  description={t("confirm.activate.description")}
                  confirmText={t("confirm.activate.confirmText")}
                  cancelText={t("confirm.activate.cancelText")}
                  isLoading={isActivating}
                  onConfirm={handleActivateVersion}
                />
            ) : null}

              {canDeleteVersion ? (
                <ConfirmActionPopover
                  trigger={
                    <Button
                      icon={<MdDeleteOutline size={20} />}
                      type="button"
                      variant="default"
                      disabled={isActivating || isDeleting}
                    >
                      {t("actions.delete")}
                    </Button>
                  }
                  title={t("confirm.delete.title")}
                  description={t("confirm.delete.description")}
                  confirmText={t("confirm.delete.confirmText")}
                  cancelText={t("confirm.delete.cancelText")}
                  isLoading={isDeleting}
                  onConfirm={handleDeleteVersion}
                />
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <div
        className={hasChangeLog ? "grid grid-cols-1 gap-4 lg:grid-cols-2" : ""}
      >
        <div className="space-y-2 rounded border border-greyscale-700 bg-greyscale-900 p-4">
          <h3 className="text-sm font-semibold text-greyscale-0">{t("description.label")}</h3>
          <p className="text-sm text-greyscale-100">{description}</p>
        </div>

        {hasChangeLog ? (
          <div className="space-y-2 rounded border border-greyscale-700 bg-greyscale-900 p-4">
            <h3 className="text-sm font-semibold text-greyscale-0">{t("changeLog.label")}</h3>
            <p className="text-sm text-greyscale-100">{version.changeLog}</p>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {version.imageUrl ? (
          <div className="relative overflow-hidden rounded border border-greyscale-700">
            <Image
              src={version.imageUrl}
              alt={title}
              fill
              className="object-cover"
            />
            <div className="h-56" />
          </div>
        ) : (
          <div className="flex h-56 items-center justify-center rounded border border-greyscale-700 bg-greyscale-900 text-sm text-greyscale-300">
            {t("image.empty")}
          </div>
        )}

        <div className="space-y-2 rounded border border-greyscale-700 bg-greyscale-900 p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-greyscale-0">
              {t("certificate.label")}
            </h3>
            {isDraftVersion && !version.certificate ? (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={isCreatingCertificate}
                onClick={handleCreateCertificate}
              >
                {isCreatingCertificate
                  ? t("certificate.actions.creating")
                  : t("certificate.actions.create")}
              </Button>
            ) : null}
          </div>

          {version.certificate ? (
            <div className="relative overflow-hidden rounded border border-greyscale-700">
              <Image
                src={version.certificate.imageUrl}
                alt={t("certificate.label")}
                fill
                className="object-fit"
              />
              <div className="h-100" />
            </div>
          ) : (
            <div className="flex h-56 items-center justify-center rounded border border-greyscale-700 bg-greyscale-900 text-sm text-greyscale-300">
              {t("certificate.empty")}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2 rounded border border-greyscale-700 bg-greyscale-900 p-4">
        <h3 className="text-sm font-semibold text-greyscale-0">
          {contextLabel}
        </h3>
        <div
          className="dv-quill-render ql-editor"
          dangerouslySetInnerHTML={{ __html: localizedContext }}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 text-sm text-greyscale-100 md:grid-cols-2">
        <p>
          <span className="text-greyscale-300">{t("meta.createdBy")}:</span>{" "}
          {(courseCreator?.fullName || "") +
            (courseCreator?.email ? ` (${courseCreator.email})` : "") || "—"}
        </p>
        <p>
          <span className="text-greyscale-300">{t("meta.createdAt")}:</span>{" "}
          {formatDateTime(courseCreateAt || null)}
        </p>
        <p>
          <span className="text-greyscale-300">{t("meta.updatedBy")}:</span>{" "}
          {(version.updater?.fullName || "") +
            (version.updater?.email ? ` (${version.updater.email})` : "") ||
            "—"}
        </p>
        <p>
          <span className="text-greyscale-300">{t("meta.updatedAt")}:</span>{" "}
          {formatDateTime(version.updateAt || null)}
        </p>
      </div>

    </div>
  );
}

export type { CourseInfoTabProps };
