"use client";

import { AxiosError } from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import toast from "react-hot-toast";
import { GoZap } from "react-icons/go";
import { MdDeleteOutline } from "react-icons/md";

import ConfirmActionPopover from "@/components/common/ConfirmActionPopover";
import PrerequisiteCourseDialog from "@/components/course/PrerequisiteCourseDialog";
import CourseProductPriceSection from "@/components/course/CourseProductPriceSection";
import CourseLevelBadge from "@/components/course/CourseLevelBadge";
import CourseStatusBadge from "@/components/course/CourseStatusBadge";
import { Button } from "@/components/ui/button";
import {
  useGetCourses,
  useDeleteCourse,
  usePublishCourse,
  useUpdateCoursePrerequisites,
  useUnpublishCourse,
} from "@/hooks/course/useCourse";
import { formatDateTime } from "@/lib/utils/format-date";
import { slugify } from "@/lib/utils/slugify";
import { ApiError } from "@/types/api/common";
import { Course } from "@/validations/course/course";
import { useLocale, useTranslations } from "@/providers/i18n-provider";

type AdminCourseCardProps = {
  course: Course;
};

export default function AdminCourseCard({ course }: AdminCourseCardProps) {
  const t = useTranslations("CourseManagement.AdminCourseCard");
  const locale = useLocale();
  const router = useRouter();
  const publishCourseMutation = usePublishCourse();
  const unpublishCourseMutation = useUnpublishCourse();
  const deleteCourseMutation = useDeleteCourse();
  const updateCoursePrerequisitesMutation = useUpdateCoursePrerequisites();
  const [isPrerequisiteDialogOpen, setIsPrerequisiteDialogOpen] = React.useState(false);
  const [selectedPrerequisiteIds, setSelectedPrerequisiteIds] = React.useState<string[]>([]);
  const [prerequisiteSearch, setPrerequisiteSearch] = React.useState("");

  const droneId = course.drone?.droneID;
  const { data: prerequisiteCourseListData, isLoading: isPrerequisiteCourseListLoading } = useGetCourses({
    pageIndex: 1,
    pageSize: 100,
    droneId,
    enabled: isPrerequisiteDialogOpen && Boolean(droneId),
  });
  const version = course.currentVersion;
  const title = locale === "en" ? version?.titleEN || version?.titleVN || t("title") : version?.titleVN || version?.titleEN || t("title");
  const titleVN = version?.titleVN || "";
  const titleEN = version?.titleEN || "";
  const courseSlug = `${slugify(title)}-${course.courseID}`;
  const imageUrl = version?.imageUrl || "/images/club-placeholder.jpg";
  const droneName = course.drone?.name || "";
  const droneImageUrl = course.drone?.imgURL || "/images/drone-placeholder.jpg";
  const description = locale === "en" ? version?.descriptionEN || version?.descriptionVN || t("description") : version?.descriptionVN || version?.descriptionEN || t("description");
  const creatorDisplay = course.creator?.fullName
    ? `${course.creator.fullName}${course.creator.email ? ` (${course.creator.email})` : ""}`
    : course.creator?.email || "—";
  const updaterDisplay = version?.updater?.fullName
    ? `${version.updater.fullName}${version.updater.email ? ` (${version.updater.email})` : ""}`
    : version?.updater?.email || "—";
  const isDraft = course.status === "DRAFT";
  const isPublish = course.status === "PUBLISH";
  const isUnpublish = course.status === "UNPUBLISH";
  const hasMiniProduct = !!course.miniProduct;
  const isPublishing = publishCourseMutation.isPending;
  const isUnpublishing = unpublishCourseMutation.isPending;
  const isDeleting = deleteCourseMutation.isPending;
  const isActionLoading = isPublishing || isUnpublishing || isDeleting;
  const showUnpublishAction = isPublish;
  const showPublishAction = isUnpublish || isDraft;
  const showDeleteAction = isDraft || isUnpublish;
  const actionCount = [showUnpublishAction, showPublishAction, showDeleteAction].filter(Boolean).length;
  const isTwoActions = actionCount === 2;
  const isOneAction = actionCount === 1;
  const actionContainerClassName = isTwoActions
    ? "mt-3 grid grid-cols-2 gap-2 border-t border-greyscale-700 pt-3"
    : isOneAction
      ? "mt-3 flex items-center justify-center border-t border-greyscale-700 pt-3"
      : "mt-3 flex items-center justify-end gap-2 border-t border-greyscale-700 pt-3";
  const triggerClassName = isTwoActions ? "w-full" : isOneAction ? "w-1/2" : undefined;
  const actionButtonClassName = isTwoActions || isOneAction ? "w-full justify-center" : undefined;

  React.useEffect(() => {
    if (!isPrerequisiteDialogOpen) {
      return;
    }

    setSelectedPrerequisiteIds(course.prerequisiteCourses.map((item) => item.courseID));
  }, [course.prerequisiteCourses, isPrerequisiteDialogOpen]);

  const prerequisiteCourses = React.useMemo(() => {
    const list = prerequisiteCourseListData?.data ?? [];
    const lowerSearch = prerequisiteSearch.trim().toLowerCase();

    return list.filter((item) => {
      if (item.courseID === course.courseID) {
        return false;
      }

      const itemTitle = locale === "en"
        ? item.currentVersion?.titleEN || item.currentVersion?.titleVN || ""
        : item.currentVersion?.titleVN || item.currentVersion?.titleEN || "";

      if (!lowerSearch) {
        return true;
      }

      return itemTitle.toLowerCase().includes(lowerSearch);
    });
  }, [course.courseID, locale, prerequisiteCourseListData?.data, prerequisiteSearch]);

  const isSavingPrerequisites = updateCoursePrerequisitesMutation.isPending;

  const handleTogglePrerequisite = (courseId: string) => {
    setSelectedPrerequisiteIds((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    );
  };

  const handleSavePrerequisites = async () => {
    try {
      const response = await updateCoursePrerequisitesMutation.mutateAsync({
        courseId: course.courseID,
        data: { prerequisiteCourseIds: selectedPrerequisiteIds },
      });

      toast.success(response.message || (locale === "en" ? "Prerequisites updated successfully." : "Cập nhật điều kiện tiên quyết thành công."));
      setIsPrerequisiteDialogOpen(false);
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      toast.error(
        axiosError.response?.data?.message ||
          axiosError.message ||
          (locale === "en" ? "Failed to update prerequisites." : "Không thể cập nhật điều kiện tiên quyết.")
      );
    }
  };

  const handlePublishCourse = async () => {
    if (!hasMiniProduct) {
      toast.error(locale === "en" ? "Please set a price for the course before publishing." : "Vui lòng thiết lập giá cho khóa học trước khi xuất bản.");
      return;
    }

    try {
      const response = await publishCourseMutation.mutateAsync({
        courseId: course.courseID,
      });
      toast.success(response.message || t("toast.publishSuccess"));
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      toast.error(
        axiosError.response?.data?.message ||
          axiosError.message ||
          t("toast.publishError")
      );
    }
  };

  const handleUnpublishCourse = async () => {
    try {
      const response = await unpublishCourseMutation.mutateAsync({
        courseId: course.courseID,
      });
      toast.success(response.message || t("toast.unpublishSuccess"));
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      toast.error(
        axiosError.response?.data?.message ||
          axiosError.message ||
          t("toast.unpublishError")
      );
    }
  };

  const handleDeleteCourse = async () => {
    try {
      const response = await deleteCourseMutation.mutateAsync({
        courseId: course.courseID,
      });
      toast.success(response.message || t("toast.deleteSuccess"));
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      toast.error(
        axiosError.response?.data?.message ||
          axiosError.message ||
          t("toast.deleteError")
      );
    }
  };


  return (
    <article
      className="cursor-pointer rounded border border-greyscale-700 bg-greyscale-900 p-4 shadow-sm hover:bg-greyscale-800 transition-colors"
      onClick={() =>
        router.push(
          `/course-management/${courseSlug}?titleVN=${encodeURIComponent(titleVN)}&titleEN=${encodeURIComponent(titleEN)}`,
        )
      }
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          router.push(
            `/course-management/${courseSlug}?titleVN=${encodeURIComponent(titleVN)}&titleEN=${encodeURIComponent(titleEN)}`,
          );
        }
      }}
    >
      <div className="relative mb-3 h-42 overflow-hidden rounded border border-greyscale-700">
        <Image src={imageUrl} alt={title} fill className="object-cover" />
      </div>

      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {course?.level ? (
            <CourseLevelBadge level={course.level} />
          ) : null}
          <div className="inline-flex rounded px-2 py-1 text-xs font-medium bg-tertiary/15 text-tertiary border-2 border-tertiary">
            {version?.estimatedDuration ?? t("unknown")} {t("min")}
          </div>
        </div>
        <CourseStatusBadge status={course.status} />
      </div>

      <h3 className="mb-1 line-clamp-2 text-base font-semibold text-greyscale-0">
        {title}
      </h3>

      <p className="mb-4 line-clamp-3 text-sm text-greyscale-100">{description}</p>

      {course.drone ? (
        <div className="mb-4 rounded border border-greyscale-700 bg-greyscale-850/50 p-2.5">
          <p className="mb-2 text-xs font-semibold text-greyscale-300">
            {locale === "en" ? "Required Drone" : "Drone yêu cầu"}
          </p>
          <div className="flex items-center gap-2.5">
            <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded border border-greyscale-700">
              <Image
                src={droneImageUrl}
                alt={droneName}
                fill
                className="object-cover"
              />
            </div>
            <p className="line-clamp-1 text-sm text-greyscale-100">{droneName}</p>
          </div>
        </div>
      ) : null}

      <CourseProductPriceSection
        course={course}
        version={version}
        canManagePrice={isDraft}
      />

      <div
        className="mt-3 border-t border-greyscale-700 pt-3"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <Button
          type="button"
          size="sm"
          variant="viewIcon"
          className="w-full justify-center"
          disabled={!droneId}
          onClick={() => setIsPrerequisiteDialogOpen(true)}
        >
          {locale === "en" ? "Configure Prerequisites" : "Thiết lập điều kiện tiên quyết"}
        </Button>
        {!droneId ? (
          <p className="mt-2 text-center text-xs text-greyscale-300">
            {locale === "en"
              ? "Please assign a required drone first."
              : "Vui lòng gán drone yêu cầu trước khi cấu hình."}
          </p>
        ) : null}
      </div>

      <div className="mt-3 space-y-1.5 border-t border-greyscale-700 pt-2 text-xs">
        <div className="flex items-center justify-between gap-3">
          <span className="min-w-0 line-clamp-1 text-greyscale-100">
            <span className="text-greyscale-300">{t("creator")}:</span> {creatorDisplay}
          </span>
          <span className="shrink-0 text-greyscale-300">{formatDateTime(course.createAt ?? null)}</span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="min-w-0 line-clamp-1 text-greyscale-100">
            <span className="text-greyscale-300">{t("updater")}:</span> {updaterDisplay}
          </span>
          <span className="shrink-0 text-greyscale-300">
            {formatDateTime(version?.updateAt ?? null)}
          </span>
        </div>
      </div>

      <div
        className={actionContainerClassName}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        {showUnpublishAction ? (
          <ConfirmActionPopover
            triggerClassName={triggerClassName}
            trigger={
              <Button
                type="button"
                size="sm"
                variant="deleteIcon"
                className={actionButtonClassName}
                icon={<GoZap size={18} />}
                disabled={isActionLoading}
              >
                {t("actions.unpublish")}
              </Button>
            }
            title={t("confirm.unpublish.title")}
            description={t("confirm.unpublish.description")}
            confirmText={t("confirm.unpublish.confirmText")}
            cancelText={t("confirm.unpublish.cancelText")}
            isLoading={isUnpublishing}
            onConfirm={handleUnpublishCourse}
          />
        ) : null}

        {showPublishAction ? (
          <ConfirmActionPopover
            triggerClassName={triggerClassName}
            trigger={
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className={actionButtonClassName}
                icon={<GoZap size={18} />}
                disabled={isActionLoading}
              >
                {t("actions.publish")}
              </Button>
            }
            title={t("confirm.publish.title")}
            description={t("confirm.publish.description")}
            confirmText={t("confirm.publish.confirmText")}
            cancelText={t("confirm.publish.cancelText")}
            isLoading={isPublishing}
            onConfirm={handlePublishCourse}
          />
        ) : null}

        {showDeleteAction ? (
          <ConfirmActionPopover
            triggerClassName={triggerClassName}
            trigger={
              <Button
                type="button"
                size="sm"
                variant="default"
                className={actionButtonClassName}
                icon={<MdDeleteOutline size={18} />}
                disabled={isActionLoading}
              >
                {t("actions.delete")}
              </Button>
            }
            title={t("confirm.delete.title")}
            description={t("confirm.delete.description")}
            confirmText={t("confirm.delete.confirmText")}
            cancelText={t("confirm.delete.cancelText")}
            isLoading={isDeleting}
            onConfirm={handleDeleteCourse}
          />
        ) : null}
      </div>

      <PrerequisiteCourseDialog
        locale={locale}
        open={isPrerequisiteDialogOpen}
        onOpenChange={setIsPrerequisiteDialogOpen}
        search={prerequisiteSearch}
        onSearchChange={setPrerequisiteSearch}
        courses={prerequisiteCourses}
        selectedIds={selectedPrerequisiteIds}
        isLoading={isPrerequisiteCourseListLoading}
        isSaving={isSavingPrerequisites}
        onToggle={handleTogglePrerequisite}
        onSave={() => void handleSavePrerequisites()}
      />
    </article>
  );
}

export type { AdminCourseCardProps };