"use client";
import EmptyState from "@/components/common/EmptyState";
import CourseOverviewHero from "@/components/course/CourseOverviewHero";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useGetClubCourseOverview } from "@/hooks/club/useClubCourse";
import { useEnterCourseCode } from "@/hooks/code/useCode";
import { useCreateUserEnrollment } from "@/hooks/enrollment/useUserEnrollment";
import {
  useGetCourseVersionFeedbacks,
  useUpdateCourseVersionFeedback,
} from "@/hooks/feedback/useFeedback";
import { useLocale } from "@/providers/i18n-provider";
import { useAuthStore } from "@/stores/auth-store";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import toast from "react-hot-toast";
import {
  IoBookOutline,
  IoChevronBackOutline,
  IoHelpCircleOutline,
  IoTimeOutline,
  IoTimerOutline,
} from "react-icons/io5";
import { TbDrone } from "react-icons/tb";
import ReactStars from "react-rating-stars-component";
import { CiEdit } from "react-icons/ci";

const UUID_SUFFIX_REGEX =
  /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const formatPrice = (value: number, currency: "USD" | "VND") => {
  if (currency === "USD") {
    return `${value.toLocaleString("en-US")} $`;
  }

  return `${value.toLocaleString("vi-VN")} VND`;
};

export default function MemberCourseOverview() {
  const router = useRouter();
  const locale = useLocale();
  const currentUser = useAuthStore((state) => state.user);
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
  const { data: feedbacks = [] } = useGetCourseVersionFeedbacks(
    courseId,
    data?.courseVersionID,
    { enabled: !!courseId && !!data?.courseVersionID },
  );
  const enterCourseCodeMutation = useEnterCourseCode();
  const createEnrollmentMutation = useCreateUserEnrollment();
  const updateCourseVersionFeedbackMutation = useUpdateCourseVersionFeedback();
  const [activateDialogOpen, setActivateDialogOpen] = React.useState(false);
  const [activateCode, setActivateCode] = React.useState("");
  const [editingFeedbackId, setEditingFeedbackId] = React.useState<string | null>(null);
  const [editRating, setEditRating] = React.useState(5);
  const [editContent, setEditContent] = React.useState("");

  const handleGoLearn = React.useCallback(async () => {
    if (!clubSlug || !courseId || !clubId || !data?.courseVersionID) {
      return;
    }

    if (data?.enrollmentID) {
      router.push(`/learn/${clubSlug}/${data.enrollmentID}`);
      return;
    }

    try {
      const response = await createEnrollmentMutation.mutateAsync({
        courseVersionID: data.courseVersionID,
        clubID: clubId,
      });

      router.push(`/learn/${clubSlug}/${response.data.enrollmentID}`);
    } catch (createEnrollmentError) {
      const message =
        (
          createEnrollmentError as {
            response?: { data?: { message?: string } };
          }
        )?.response?.data?.message ||
        (createEnrollmentError as { message?: string })?.message ||
        "Không thể tạo enrollment. Vui lòng thử lại.";
      toast.error(message);
    }
  }, [
    clubId,
    clubSlug,
    courseId,
    createEnrollmentMutation,
    data?.enrollmentID,
    data?.courseVersionID,
    router,
  ]);

  const handleActivateCode = React.useCallback(async () => {
    if (!clubId) {
      toast.error("Không xác định được câu lạc bộ hiện tại.");
      return;
    }

    const trimmedCode = activateCode.trim();
    if (!trimmedCode) {
      toast.error("Vui lòng nhập mã kích hoạt.");
      return;
    }

    try {
      const response = await enterCourseCodeMutation.mutateAsync({
        clubId,
        payload: {
          codeId: trimmedCode,
        },
      });

      toast.success(response.message || "Kích hoạt khóa học thành công.");
      setActivateDialogOpen(false);
      setActivateCode("");
    } catch (activateError) {
      const message =
        (activateError as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ||
        (activateError as { message?: string })?.message ||
        "Kích hoạt mã thất bại.";
      toast.error(message);
    }
  }, [activateCode, clubId, enterCourseCodeMutation]);

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
  const currentUserFeedback = feedbacks.find(
    (feedback) => feedback.user.userId === currentUser?.userId,
  );

  const handleStartEditFeedback = (feedbackId: string) => {
    const currentFeedback = feedbacks.find((feedback) => feedback.feedbackID === feedbackId);
    if (!currentFeedback) return;

    setEditingFeedbackId(feedbackId);
    setEditRating(currentFeedback.rating);
    setEditContent(currentFeedback.content);
  };

  const handleCancelEditFeedback = () => {
    setEditingFeedbackId(null);
    setEditRating(5);
    setEditContent("");
  };

  const handleSaveFeedback = async (feedbackId: string) => {
    if (!data?.courseVersionID || !courseId) {
      return;
    }

    try {
      await updateCourseVersionFeedbackMutation.mutateAsync({
        courseId,
        versionId: data.courseVersionID,
        feedbackId,
        payload: {
          rating: editRating,
          content: editContent.trim(),
        },
      });

      handleCancelEditFeedback();
    } catch (saveError) {
      const message =
        (saveError as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ||
        (saveError as { message?: string })?.message ||
        "Không thể cập nhật phản hồi.";
      toast.error(message);
    }
  };

  return (
    <div className="px-6 py-4">
      {/* Back lại trang courses */}
      <div className="mb-5 flex items-center gap-4">
        <Button
          icon={<IoChevronBackOutline />}
          variant="outline"
          onClick={() => {
            if (!clubSlug) return;
            window.location.href = `/member/${clubSlug}/courses`;
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
            <h3 className="text-2xl font-semibold text-greyscale-0 p-4 pb-0">
              Giới thiệu khóa học
            </h3>
            <div
              className="dv-quill-render ql-editor min-h-40"
              dangerouslySetInnerHTML={{ __html: courseContext || "<p>-</p>" }}
            />
          </section>

          <section className="space-y-2 rounded border border-greyscale-700 bg-greyscale-900/70 p-4">
            <h3 className="text-2xl font-semibold text-greyscale-0">
              Chứng chỉ sau khóa học
            </h3>

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

          <section className="space-y-4 rounded border border-greyscale-700 bg-greyscale-900/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-2xl font-semibold text-greyscale-0">
                  {locale === "vi" ? "Đánh giá khóa học" : "Course feedbacks"}
                </h3>
                <p className="text-sm text-greyscale-300">
                  {locale === "vi"
                    ? "Xem những nhận xét từ học viên đã hoàn thành khóa học này."
                    : "See reviews from learners who completed this course."}
                </p>
              </div>
              <p className="text-sm text-greyscale-300">
                {feedbacks.length} {locale === "vi" ? "đánh giá" : "reviews"}
              </p>
            </div>

            {feedbacks.length === 0 ? (
              <div className="rounded border border-greyscale-700 bg-greyscale-900/60 p-4">
                <EmptyState
                  title={locale === "vi" ? "Chưa có đánh giá" : "No feedback yet"}
                  description={
                    locale === "vi"
                      ? "Khóa học này hiện chưa có phản hồi nào."
                      : "This course does not have any feedback yet."
                  }
                />
              </div>
            ) : (
              <div className="space-y-3">
                {feedbacks.map((feedback) => {
                  const isOwner = feedback.user.userId === currentUser?.userId;
                  const isEditing = editingFeedbackId === feedback.feedbackID;

                  return (
                    <div
                      key={feedback.feedbackID}
                      className="space-y-3 rounded border border-greyscale-700 bg-greyscale-950/70 p-3.5"
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-greyscale-700 bg-greyscale-800">
                          {feedback.user.avatarUrl ? (
                            <Image
                              src={feedback.user.avatarUrl}
                              alt={feedback.user.fullName}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-greyscale-300">
                              {feedback.user.fullName.slice(0, 1).toUpperCase()}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-greyscale-0">
                                {feedback.user.fullName}
                              </p>
                              <p className="truncate text-xs text-greyscale-200">
                                {feedback.user.email}
                              </p>
                            </div>

                            <div className="flex flex-col items-end gap-1">
                              <div className="flex items-center gap-2">
                                <ReactStars
                                  key={`${feedback.feedbackID}-${feedback.rating}`}
                                  count={5}
                                  value={feedback.rating}
                                  edit={false}
                                  size={25}
                                  isHalf={false}
                                  activeColor="#fbbf24"
                                  color="#52525b"
                                />
                              </div>
                            </div>
                          </div>

                          <p className="mt-2 text-sm text-greyscale-50">{feedback.content}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="flex items-center gap-1 text-xs text-greyscale-100">
                          <IoTimerOutline />
                          {new Date(feedback.createAt).toLocaleString(
                            locale === "vi" ? "vi-VN" : "en-US",
                          )}
                        </span>

                        {isOwner ? (
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              icon={<CiEdit />}
                              onClick={() => handleStartEditFeedback(feedback.feedbackID)}
                            >
                              {locale === "vi" ? "Sửa" : "Edit"}
                            </Button>
                          </div>
                        ) : null}
                      </div>

                      {isOwner && isEditing ? (
                        <div className="space-y-3 rounded border border-greyscale-700 bg-greyscale-900/70 p-3.5">
                          <ReactStars
                            count={5}
                            value={editRating}
                            onChange={(value: number) => setEditRating(value)}
                            size={22}
                            isHalf={false}
                            edit
                            activeColor="#fbbf24"
                            color="#52525b"
                          />

                          <Textarea
                            value={editContent}
                            onChange={(event) => setEditContent(event.target.value)}
                            className="min-h-28 bg-greyscale-950/80 text-greyscale-0"
                          />

                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleCancelEditFeedback}
                            >
                              {locale === "vi" ? "Hủy" : "Cancel"}
                            </Button>
                            <Button
                              type="button"
                              onClick={() => void handleSaveFeedback(feedback.feedbackID)}
                              disabled={
                                updateCourseVersionFeedbackMutation.isPending ||
                                editContent.trim().length === 0
                              }
                            >
                              {updateCourseVersionFeedbackMutation.isPending
                                ? locale === "vi"
                                  ? "Đang lưu..."
                                  : "Saving..."
                                : locale === "vi"
                                  ? "Lưu"
                                  : "Save"}
                            </Button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
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

            {data.isEligibleByLevel ? (
              <div className="w-full flex items-center gap-2">
                {data.isUnlock ? (
                  <Button
                    variant="tertiary"
                    className="w-full"
                    onClick={handleGoLearn}
                    disabled={createEnrollmentMutation.isPending}
                  >
                    {createEnrollmentMutation.isPending
                      ? "Đang chuẩn bị vào học..."
                      : "Vào học ngay"}
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="default"
                      className="w-full"
                      disabled={
                        !data.miniProduct ||
                        data.clubCourseOwn?.remainingQuantity === 0
                      }
                      onClick={() => {
                        if (!clubSlug || !courseSlug) return;
                        router.push(
                          `/member/${clubSlug}/${courseSlug}/checkout`,
                        );
                      }}
                    >
                      Mua ngay
                    </Button>

                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => setActivateDialogOpen(true)}
                    >
                      Kích hoạt
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="w-full">
                <Button className="w-full" disabled>
                  Bạn chưa đủ điều kiện
                </Button>
              </div>
            )}
          </div>
        </aside>
      </div>

      <Dialog
        open={activateDialogOpen}
        onOpenChange={(open) => {
          setActivateDialogOpen(open);
          if (!open) {
            setActivateCode("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Kích hoạt khóa học</DialogTitle>
            <DialogDescription>
              Nhập mã kích hoạt để mở quyền truy cập khóa học.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <label
              htmlFor="member-activate-code"
              className="text-sm font-medium text-greyscale-25"
            >
              Mã kích hoạt
            </label>
            <Input
              id="member-activate-code"
              value={activateCode}
              onChange={(event) => setActivateCode(event.target.value)}
              placeholder="Nhập mã đã nhận qua mail"
              disabled={enterCourseCodeMutation.isPending}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActivateDialogOpen(false)}
              disabled={enterCourseCodeMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              onClick={handleActivateCode}
              disabled={
                enterCourseCodeMutation.isPending ||
                activateCode.trim().length === 0
              }
            >
              {enterCourseCodeMutation.isPending
                ? "Đang kích hoạt..."
                : "Xác nhận"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
