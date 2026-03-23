"use client";

import { AxiosError } from "axios";
import React from "react";
import toast from "react-hot-toast";
import { MdOutlineAddCircleOutline } from "react-icons/md";

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
import { useCreateCourse } from "@/hooks/course/useCourse";
import { useCreateCourseVersion } from "@/hooks/course-version/useCourseVersion";
import { createCourseVersionRequestSchema } from "@/validations/course-version/course-version";

type CourseLevel = "EASY" | "MEDIUM" | "HARD";

const COURSE_LEVEL_OPTIONS: Array<{ value: CourseLevel; label: string }> = [
  { value: "EASY", label: "Dễ" },
  { value: "MEDIUM", label: "Trung bình" },
  { value: "HARD", label: "Khó" },
];

const DEFAULT_FORM = {
  titleVN: "",
  titleEN: "",
  descriptionVN: "",
  descriptionEN: "",
  contextVN: "",
  contextEN: "",
  imageUrl: "",
  level: "EASY" as CourseLevel,
  estimatedDuration: 60,
};

export default function CreateCourseDialog() {
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState(DEFAULT_FORM);

  const createCourseMutation = useCreateCourse();
  const createCourseVersionMutation = useCreateCourseVersion();

  const isSubmitting =
    createCourseMutation.isPending || createCourseVersionMutation.isPending;

  const setField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setForm(DEFAULT_FORM);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (isSubmitting) return;
    setOpen(nextOpen);
    if (!nextOpen) {
      resetForm();
    }
  };

  const handleSubmit = async () => {
    const parsedPayload = createCourseVersionRequestSchema.safeParse({
      titleVN: form.titleVN.trim(),
      titleEN: form.titleEN.trim(),
      descriptionVN: form.descriptionVN.trim(),
      descriptionEN: form.descriptionEN.trim(),
      contextVN: form.contextVN.trim(),
      contextEN: form.contextEN.trim(),
      imageUrl: form.imageUrl.trim(),
      level: form.level,
      estimatedDuration: Number(form.estimatedDuration),
    });

    if (!parsedPayload.success) {
      toast.error("Vui lòng nhập đầy đủ và đúng định dạng thông tin khóa học.");
      return;
    }

    try {
      const createdCourse = await createCourseMutation.mutateAsync();

      await createCourseVersionMutation.mutateAsync({
        courseId: createdCourse.courseID,
        payload: parsedPayload.data,
      });

      toast.success("Tạo khóa học và phiên bản khóa học thành công.");
      setOpen(false);
      resetForm();
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(
        axiosError.response?.data?.message ||
          axiosError.message ||
          "Không thể tạo khóa học mới."
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button icon={<MdOutlineAddCircleOutline size={20} />}>Tạo khóa học</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <div className="flex max-h-[90vh] flex-col">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>Tạo khóa học mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin phiên bản đầu tiên. Hệ thống sẽ tạo course trước, sau đó tự tạo course version.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="course-title-vn">Tiêu đề (VI)</Label>
                <Input
                  id="course-title-vn"
                  value={form.titleVN}
                  onChange={(event) => setField("titleVN", event.target.value)}
                  placeholder="Nhập tiêu đề tiếng Việt"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="course-title-en">Tiêu đề (EN)</Label>
                <Input
                  id="course-title-en"
                  value={form.titleEN}
                  onChange={(event) => setField("titleEN", event.target.value)}
                  placeholder="Enter English title"
                />
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="course-desc-vn">Mô tả ngắn (VI)</Label>
                <Textarea
                  id="course-desc-vn"
                  value={form.descriptionVN}
                  onChange={(event) => setField("descriptionVN", event.target.value)}
                  placeholder="Nhập mô tả tiếng Việt"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="course-desc-en">Mô tả ngắn (EN)</Label>
                <Textarea
                  id="course-desc-en"
                  value={form.descriptionEN}
                  onChange={(event) => setField("descriptionEN", event.target.value)}
                  placeholder="Enter English description"
                />
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="course-duration">Thời lượng dự kiến (phút)</Label>
                <Input
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
                <Label>Độ khó</Label>
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
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <ClubImageUpload
                label="Ảnh khóa học"
                value={form.imageUrl}
                onChange={(url) => setField("imageUrl", url)}
                disabled={isSubmitting}
              />
            </div>

            <div className="mt-4 space-y-2">
              <Label>Nội dung chi tiết (VI)</Label>
              <QuillEditor
                value={form.contextVN}
                onChange={(value) => setField("contextVN", value)}
                placeholder="Nhập nội dung tiếng Việt"
                minHeight={220}
              />
            </div>

            <div className="mt-4 space-y-2">
              <Label>Nội dung chi tiết (EN)</Label>
              <QuillEditor
                value={form.contextEN}
                onChange={(value) => setField("contextEN", value)}
                placeholder="Enter English content"
                minHeight={220}
              />
            </div>
          </div>

          <DialogFooter className="flex-row justify-end gap-3 border-t border-greyscale-700 px-6 py-4 sm:space-x-0">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Hủy
              </Button>
            </DialogClose>

            <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Đang tạo..." : "Xác nhận tạo khóa học"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
