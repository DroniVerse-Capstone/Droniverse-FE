"use client";

import React from "react";
import toast from "react-hot-toast";

import { MediaTypeUpload } from "@/components/club/MediaTypeUpload";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import QuillEditor from "@/components/common/QuillEditor";
import { useSubmitUserAssignment } from "@/hooks/learning/useUserLearning";

type MemberAssignmentSubmitDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enrollmentId: string;
  assignmentId: string;
  title?: string;
  requirement?: string;
};

export default function MemberAssignmentSubmitDialog({
  open,
  onOpenChange,
  enrollmentId,
  assignmentId,
  title,
  requirement,
}: MemberAssignmentSubmitDialogProps) {
  const submitMutation = useSubmitUserAssignment();
  const [mediaId, setMediaId] = React.useState("");
  const [description, setDescription] = React.useState("");

  React.useEffect(() => {
    if (!open) {
      setMediaId("");
      setDescription("");
    }
  }, [open]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedDescription = description.trim();
    if (!mediaId.trim()) {
      toast.error("Vui lòng tải lên video bài nộp.");
      return;
    }

    if (!trimmedDescription) {
      toast.error("Vui lòng nhập mô tả bài nộp.");
      return;
    }

    try {
      await submitMutation.mutateAsync({
        enrollmentId,
        assignmentId,
        mediaID: mediaId.trim(),
        description: trimmedDescription,
      });

      toast.success("Đã gửi bài tập thành công.");
      handleClose();
    } catch (error) {
      const apiError = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };

      toast.error(
        apiError.response?.data?.message ||
          apiError.message ||
          "Không thể gửi bài tập lúc này.",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col overflow-hidden border-greyscale-700 bg-greyscale-900">
        <DialogHeader>
          <DialogTitle className="text-greyscale-0">
            {title || "Nộp bài tập"}
          </DialogTitle>
        </DialogHeader>

        <form className="flex max-h-[calc(90vh-7rem)] flex-1 flex-col gap-4 overflow-y-auto pr-1" onSubmit={handleSubmit}>
          <div className="space-y-4 pt-2">
            {requirement ? (
              <div className="space-y-2 rounded border border-greyscale-700 bg-greyscale-900 p-4 text-sm text-greyscale-50">
                <p className="text-xs uppercase text-greyscale-0">
                  Yêu cầu
                </p>
                <p className="whitespace-pre-wrap wrap-break-word leading-6">
                  {requirement}
                </p>
              </div>
            ) : null}

            <MediaTypeUpload
              label="Video bài nộp"
              value={mediaId}
              onChange={setMediaId}
              defaultMediaType="VIDEO"
              fixedMediaType="VIDEO"
              disabled={submitMutation.isPending}
            />

            <QuillEditor
              id="assignment-submit-description"
              label="Mô tả bài nộp"
              value={description}
              onChange={setDescription}
              placeholder="Nhập mô tả cho bài nộp của bạn"
              readOnly={submitMutation.isPending}
              minHeight={180}
            />
          </div>

          <DialogFooter className="gap-2 border-t border-greyscale-800 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={submitMutation.isPending}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={submitMutation.isPending}>
              {submitMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Spinner className="h-4 w-4" />
                  Đang gửi
                </span>
              ) : (
                "Gửi bài"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
