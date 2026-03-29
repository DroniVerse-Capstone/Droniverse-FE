"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import CourseInfoTab from "@/components/system/course-edit/CourseInfoTab";
import CourseSettingsTab from "@/components/system/course-edit/CourseSettingsTab";
import CourseVersionDropdown from "@/components/system/course-edit/CourseVersionDropdown";
import { Empty } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetCourseDetail } from "@/hooks/course/useCourse";
import { useGetCourseVersionDetail } from "@/hooks/course-version/useCourseVersion";
import { useTranslations } from "@/providers/i18n-provider";

function extractCourseIdFromSlug(courseSlug?: string) {
  if (!courseSlug) return undefined;

  const match = courseSlug.match(
    /([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/,
  );

  return match?.[1];
}

export default function CourseEdit() {
  const params = useParams<{ courseSlug?: string }>();
  const courseSlug = params?.courseSlug;
  const courseId = extractCourseIdFromSlug(courseSlug);
  const [selectedVersionId, setSelectedVersionId] = useState<string>();
  const t = useTranslations("CourseManagement.CourseEdit");
  const { data: course, isLoading, isError, error } = useGetCourseDetail(courseId);
  const {
    data: selectedVersion,
    isFetching: isVersionFetching,
    isError: isVersionError,
    error: versionError,
  } = useGetCourseVersionDetail({
    courseId,
    versionId: selectedVersionId,
  });

  useEffect(() => {
    if (!selectedVersionId && course?.currentVersion?.courseVersionID) {
      setSelectedVersionId(course.currentVersion.courseVersionID);
    }
  }, [course?.currentVersion?.courseVersionID, selectedVersionId]);

  if (!courseId) {
    return (
      <Empty>
        <p className="text-sm text-muted-foreground">
          {t("error.cantfind")}
        </p>
      </Empty>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  if (isError) {
    return (
      <Empty>
        <p className="text-sm text-muted-foreground">
          {error.response?.data?.message ||
            error.message ||
            t("error.details")}
        </p>
      </Empty>
    );
  }

  if (!course) {
    return (
      <Empty>
        <p className="text-sm text-muted-foreground">
          {t("error.empty")}
        </p>
      </Empty>
    );
  }

  return (
    <section className="space-y-4">
      {isVersionError ? (
        <p className="text-sm text-warning">
          {versionError.response?.data?.message ||
            versionError.message ||
            t("error.cantload")}
        </p>
      ) : null}

      <Tabs defaultValue="course-info" className="w-full">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <TabsList className="w-full justify-start gap-2 bg-transparent p-0 md:w-auto">
            <TabsTrigger
              value="course-info"
              className="rounded border border-greyscale-700 bg-greyscale-800 px-4 py-2 text-greyscale-100 data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-greyscale-0"
            >
              {t("courseInfo")}
            </TabsTrigger>
            <TabsTrigger
              value="course-settings"
              className="rounded border border-greyscale-700 bg-greyscale-800 px-4 py-2 text-greyscale-100 data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-greyscale-0"
            >
              {t("courseSettings")}
            </TabsTrigger>
          </TabsList>

          <div className="w-fit xs:w-80">
            <CourseVersionDropdown
              courseId={courseId}
              value={selectedVersionId}
              onChange={setSelectedVersionId}
            />
          </div>
        </div>

        <TabsContent value="course-info" className="mt-0 space-y-5">
          <CourseInfoTab
            selectedVersionId={selectedVersionId}
            isVersionFetching={isVersionFetching}
            courseId={course.courseID}
            currentVersionId={course.currentVersion?.courseVersionID}
            courseCreateAt={course.createAt}
            courseCreator={course.creator}
            version={selectedVersion}
          />
        </TabsContent>

        <TabsContent value="course-settings" className="mt-0">
          <CourseSettingsTab
            courseId={course.courseID}
            versionId={selectedVersionId}
            versionStatus={selectedVersion?.status}
          />
        </TabsContent>
      </Tabs>
    </section>
  );
}
