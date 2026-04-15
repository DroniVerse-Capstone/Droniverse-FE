"use client";

import React from "react";
import { useParams } from "next/navigation";
import { IoTimeOutline } from "react-icons/io5";

import LessonTypeIcon from "@/components/course/LessonTypeIcon";
import { Button } from "@/components/ui/button";
import { useCreateUserLessonData } from "@/hooks/learning/useUserLearning";
import type { Lesson, LessonType } from "@/validations/learning/user-learning";
import { FiUnlock } from "react-icons/fi";

const LESSON_TYPE_LABEL: Record<LessonType, string> = {
  THEORY: "Bài lý thuyết",
  QUIZ: "Bài kiểm tra",
  LAB: "Bài thực hành",
};

const LESSON_TYPE_DESCRIPTION: Record<LessonType, string> = {
  THEORY:
    "Đọc nội dung bài học để nắm kiến thức nền tảng trước khi sang bài tiếp theo.",
  QUIZ: "Kiểm tra mức độ hiểu bài bằng các câu hỏi trắc nghiệm trong bài quiz.",
  LAB: "Thực hành các thao tác và tình huống mô phỏng để rèn kỹ năng thực tế.",
};

type MemberLessonDetailProps = {
  lesson: Lesson;
  onStarted?: () => void;
};

export default function MemberLessonDetail({
  lesson,
  onStarted,
}: MemberLessonDetailProps) {
  const params = useParams<{ enrollmentId?: string }>();
  const enrollmentId = params?.enrollmentId;
  const createUserLessonDataMutation = useCreateUserLessonData();

  const handleStartLesson = async () => {
    if (!enrollmentId) {
      console.error("Không xác định được enrollment hiện tại.");
      return;
    }

    try {
      await createUserLessonDataMutation.mutateAsync({
        enrollmentId,
        lessonId: lesson.lessonID,
      });
      onStarted?.();
    } catch (error) {
      const message =
        (
          error as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (error as { message?: string })?.message ||
        "Không thể khởi tạo dữ liệu học bài.";
      console.error(message);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5 rounded-lg border border-greyscale-700 bg-greyscale-900/60 p-6">
      <div className="flex flex-wrap items-center gap-2 text-xs text-greyscale-300">
        <LessonTypeIcon type={lesson.type} />
        <span className="inline-flex items-center gap-2 rounded border-2 border-primary bg-primary/15 px-2 py-1 text-xs font-medium text-primary">
          {LESSON_TYPE_LABEL[lesson.type]}
        </span>
        <span className="inline-flex items-center gap-1 rounded border-2 border-tertiary bg-tertiary/15 px-2 py-1 text-xs font-medium text-tertiary">
          <IoTimeOutline className="h-3.5 w-3.5" />
          {lesson.duration} phút
        </span>
      </div>

      <h1 className="text-2xl font-bold text-greyscale-0">{lesson.titleVN}</h1>

      <p className="text-sm text-greyscale-300">
        {LESSON_TYPE_DESCRIPTION[lesson.type]}
      </p>

      <Button
        type="button"
        disabled={lesson.isLocked || createUserLessonDataMutation.isPending}
        onClick={handleStartLesson}
      >
        <FiUnlock size={16} />
        Mở khóa
      </Button>
    </div>
  );
}

export type { MemberLessonDetailProps };
