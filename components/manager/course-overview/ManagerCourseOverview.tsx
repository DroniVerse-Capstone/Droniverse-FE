"use client";

import Image from "next/image";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  IoBookOutline,
  IoChevronBackOutline,
  IoHelpCircleOutline,
  IoTimeOutline,
} from "react-icons/io5";

import EmptyState from "@/components/common/EmptyState";
import { Spinner } from "@/components/ui/spinner";
import { useGetClubCourseOverview } from "@/hooks/club/useClubCourse";
import { useLocale } from "@/providers/i18n-provider";
import { TbDrone } from "react-icons/tb";
import { Button } from "@/components/ui/button";
import CourseOverviewHero from "@/components/course/CourseOverviewHero";

const UUID_SUFFIX_REGEX =
  /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const formatPrice = (value: number, currency: "USD" | "VND") => {
  if (currency === "USD") {
    return `${value.toLocaleString("en-US")} $`;
  }

  return `${value.toLocaleString("vi-VN")} VND`;
};

export default function ManagerCourseOverview() {
  const router = useRouter();
  const locale = useLocale();
  const params = useParams<{ clubSlug?: string; courseSlug?: string }>();
  const clubSlug = params?.clubSlug;
  const courseSlug = params?.courseSlug;

  const clubId = React.useMemo(() => {
    if (!clubSlug) return undefined;

    const uuidMatch = clubSlug.match(UUID_SUFFIX_REGEX);
    return uuidMatch?.[0];
  }, [clubSlug]);

  const courseId = React.useMemo(() => {
    if (!courseSlug) return undefined;

    if (UUID_SUFFIX_REGEX.test(courseSlug)) {
      const uuidMatch = courseSlug.match(UUID_SUFFIX_REGEX);
      return uuidMatch?.[0];
    }

    return undefined;
  }, [courseSlug]);

  const { data, isLoading, isError, error } = useGetClubCourseOverview(
    clubId,
    courseId,
  );

  if (!clubId || !courseId) {
    return (
      <div className="px-6 py-4">
        <EmptyState title="Không xác định được khóa học hoặc câu lạc bộ hiện tại." />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="px-6 py-4">
        <EmptyState
          title={
            error?.response?.data?.message ||
            error?.message ||
            "Không tải được tổng quan khóa học"
          }
        />
      </div>
    );
  }

  const courseTitle = locale === "vi" ? data.titleVN : data.titleEN;
  const courseDescription =
    locale === "vi" ? data.descriptionVN : data.descriptionEN;
  const courseContext = locale === "vi" ? data.contextVN : data.contextEN;
  const authorName = data.author.fullName;

  return (
    <div className="px-6 py-4">
      {/* Back lại trang courses */}
      <div className="mb-5 flex items-center gap-4">
        <Button
          icon={<IoChevronBackOutline />}
          variant="outline"
          onClick={() => {
            if (!clubSlug) return;
            window.location.href = `/manager/${clubSlug}/courses`;
          }}
        >
          Quay lại
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <CourseOverviewHero
            title={courseTitle}
            description={courseDescription}
            level={data.level}
            estimatedDuration={data.estimatedDuration}
            averageRating={data.averageRating}
            totalLearners={data.totalLearners}
            authorName={authorName}
            lastUpdatedAt={data.lastUpdatedAt}
            imageUrl={data.imageUrl}
          />

          <section className="space-y-2 rounded border border-greyscale-700 bg-greyscale-900/70">
           <h3 className="text-2xl font-semibold text-greyscale-0 p-4 pb-0">Giới thiệu khóa học</h3>
            <div
              className="dv-quill-render ql-editor min-h-40"
              dangerouslySetInnerHTML={{ __html: courseContext || "<p>-</p>" }}
            />
          </section>

          <section className="space-y-2 rounded border border-greyscale-700 bg-greyscale-900/70 p-4">
           <h3 className="text-2xl font-semibold text-greyscale-0">Chứng chỉ sau khóa học</h3>

            {data.certificateImageUrl ? (
              <div className="relative mt-3 h-80 w-full overflow-hidden rounded border border-greyscale-700">
                <Image
                  src={data.certificateImageUrl}
                  alt={`Certificate - ${courseTitle}`}
                  fill
                  className="object-contain bg-greyscale-950 p-6"
                />
              </div>
            ) : (
              <div className="mt-3 rounded border border-greyscale-700 bg-greyscale-900/60 p-4">
                <EmptyState
                  title="Chưa có ảnh chứng chỉ"
                  description="Khóa học này hiện chưa cấu hình ảnh chứng chỉ."
                />
              </div>
            )}
          </section>

        </div>

        <aside className="xl:sticky xl:top-28 xl:self-start">
          <div className="rounded bg-linear-120 from-greyscale-900 to-greyscale-700 p-6">
            <p className="text-3xl font-semibold text-primary">
              {data.miniProduct
                ? formatPrice(data.miniProduct.price, data.miniProduct.currency)
                : "-"}
            </p>
            <p className="mt-2 text-base font-semibold text-greyscale-0">
              {data.clubCourseOwn
                ? `${data.clubCourseOwn.remainingQuantity} mã còn lại`
                : "Chưa sở hữu"}
            </p>

            <div className="my-4 h-px bg-greyscale-600" />

            <h2 className="mb-3 text-2xl font-semibold text-greyscale-0">
              Thông tin khóa học
            </h2>

            <ul className="space-y-3 text-sm text-greyscale-25">
              <li className="flex items-center gap-3">
                <IoTimeOutline size={20} className="text-secondary" />
                {data.estimatedDuration} phút học
              </li>
              <li className="flex items-center gap-3">
                <IoBookOutline size={20} className="text-secondary" />
                {data.totalTheory} bài đọc
              </li>
              <li className="flex items-center gap-3">
                <TbDrone size={20} className="text-secondary" />
                {data.totalLab} bài lab
              </li>
              <li className="flex items-center gap-3">
                <IoHelpCircleOutline size={20} className="text-secondary" />
                {data.totalQuiz} bài kiểm tra
              </li>
            </ul>

            <div className="my-4 h-px bg-greyscale-600" />

            <div className="w-full">
              <Button
                variant="default"
                className="w-full"
                onClick={() => {
                  if (!clubSlug || !courseSlug) return;
                  router.push(`/manager/${clubSlug}/${courseSlug}/checkout`);
                }}
              >
                Mua mã
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
