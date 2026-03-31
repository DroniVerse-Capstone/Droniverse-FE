"use client";

import React from "react";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { BiEdit } from "react-icons/bi";
import { FaRegEye } from "react-icons/fa";
import { MdDeleteOutline, MdOutlineTimer } from "react-icons/md";

import ConfirmActionPopover from "@/components/common/ConfirmActionPopover";
import EmptyState from "@/components/common/EmptyState";
import LessonTypeIcon from "@/components/course/LessonTypeIcon";
import LessonDetailDialog from "@/components/system/course-edit/course-settings/LessonDetailDialog";
import QuizQuestionConfigDialog from "@/components/system/course-edit/course-settings/QuizQuestionConfigDialog";
import UpdateLessonDialog from "@/components/system/course-edit/course-settings/UpdateLessonDialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useDeleteLesson } from "@/hooks/lesson/useLesson";
import { ApiError } from "@/types/api/common";
import { Lesson } from "@/validations/lesson/lesson";
import { LucideFileQuestion } from "lucide-react";
import TooltipWrapper from "@/components/common/ToolTipWrapper";

type ModuleLessonsProps = {
  lessons: Lesson[];
  isLoading: boolean;
  isError: boolean;
  error?: AxiosError<ApiError> | null;
  canManageLessons: boolean;
};

export default function ModuleLessons({
  lessons,
  isLoading,
  isError,
  error,
  canManageLessons,
}: ModuleLessonsProps) {
  const [viewOpen, setViewOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [quizQuestionOpen, setQuizQuestionOpen] = React.useState(false);
  const [selectedLesson, setSelectedLesson] = React.useState<Lesson | null>(
    null,
  );
  const [selectedQuizLesson, setSelectedQuizLesson] =
    React.useState<Lesson | null>(null);

  const deleteLessonMutation = useDeleteLesson({
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (deleteError) => {
      const axiosError = deleteError as AxiosError<ApiError>;
      toast.error(
        axiosError.response?.data?.message ||
          axiosError.message ||
          "Không thể xóa bài học.",
      );
    },
  });

  const handleOpenView = (lesson: Lesson) => {
    if (lesson.type === "LAB") {
      toast("Tính năng xem chi tiết Lab sẽ được cập nhật sau.");
      return;
    }

    setSelectedLesson(lesson);
    setViewOpen(true);
  };

  const handleOpenEdit = (lesson: Lesson) => {
    if (lesson.type === "LAB") {
      toast("Tính năng chỉnh sửa Lab sẽ được cập nhật sau.");
      return;
    }

    setSelectedLesson(lesson);
    setEditOpen(true);
  };

  const handleDelete = async (lesson: Lesson) => {
    await deleteLessonMutation.mutateAsync({
      moduleId: lesson.moduleID,
      lessonId: lesson.lessonID,
    });
  };

  const handleOpenQuizQuestions = (lesson: Lesson) => {
    if (lesson.type !== "QUIZ") {
      return;
    }

    setSelectedQuizLesson(lesson);
    setQuizQuestionOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-3">
        <Spinner className="h-5 w-5" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-warning">
        {error?.response?.data?.message ||
          error?.message ||
          "Không thể tải danh sách bài học."}
      </p>
    );
  }

  if (lessons.length === 0) {
    return <EmptyState title="Chưa có bài học trong chương này." />;
  }

  return (
    <>
      <div className="space-y-2">
        {lessons.map((lesson) => (
          <div
            key={lesson.lessonID}
            className="rounded border border-greyscale-700 bg-greyscale-800 px-3 py-2"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <LessonTypeIcon type={lesson.type} />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-greyscale-0">
                    {lesson.titleVN}
                  </p>
                  <p className="text-xs text-greyscale-200">{lesson.titleEN}</p>
                  <div className="flex items-center gap-1">
                    <MdOutlineTimer className="text-greyscale-200" />
                    <p className="text-xs text-greyscale-300">
                      {lesson.estimatedTime} phút
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <TooltipWrapper label="Xem chi tiết">
                <Button
                  type="button"
                  variant="viewIcon"
                  size="icon"
                  onClick={() => handleOpenView(lesson)}
                >
                  <FaRegEye size={16} />
                </Button>
                </TooltipWrapper>

                {lesson.type === "QUIZ" ? (
                  <TooltipWrapper label="Cấu hình câu hỏi">
                    <Button
                      type="button"
                      variant="secondaryIcon"
                      size={"icon"}
                      onClick={() => handleOpenQuizQuestions(lesson)}
                    >
                      <LucideFileQuestion size={16} />
                    </Button>
                  </TooltipWrapper>
                ) : null}

                {canManageLessons ? (
                  <>
                    <TooltipWrapper label="Chỉnh sửa">
                      <Button
                        type="button"
                        variant="editIcon"
                        size="icon"
                        onClick={() => handleOpenEdit(lesson)}
                      >
                        <BiEdit size={16} />
                      </Button>
                    </TooltipWrapper>

                    <ConfirmActionPopover
                      trigger={
                        <TooltipWrapper label="Xóa bài học">
                          <Button type="button" variant="deleteIcon" size="icon">
                            <MdDeleteOutline size={16} />
                          </Button>
                        </TooltipWrapper>
                      }
                      title="Xóa bài học"
                      description="Bạn có chắc muốn xóa bài học này?"
                      confirmText="Xóa"
                      cancelText="Hủy"
                      isLoading={deleteLessonMutation.isPending}
                      onConfirm={() => {
                        void handleDelete(lesson);
                      }}
                    />
                  </>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>

      <LessonDetailDialog
        open={viewOpen}
        lesson={selectedLesson}
        onOpenChange={(nextOpen) => {
          setViewOpen(nextOpen);
          if (!nextOpen) {
            setSelectedLesson(null);
          }
        }}
      />

      <UpdateLessonDialog
        open={editOpen}
        lesson={selectedLesson}
        onOpenChange={(nextOpen) => {
          setEditOpen(nextOpen);
          if (!nextOpen) {
            setSelectedLesson(null);
          }
        }}
      />

      <QuizQuestionConfigDialog
        open={quizQuestionOpen}
        lesson={selectedQuizLesson}
        canManageQuestions={canManageLessons}
        onOpenChange={(nextOpen) => {
          setQuizQuestionOpen(nextOpen);
          if (!nextOpen) {
            setSelectedQuizLesson(null);
          }
        }}
      />
    </>
  );
}

export type { ModuleLessonsProps };
