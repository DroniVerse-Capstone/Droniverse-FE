"use client";

import { ImagePlus, Loader2, Trash2, Video } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUploadTempMedia } from "@/hooks/media/useMedia";
import { cn } from "@/lib/utils";
import type { MediaType } from "@/validations/media/media";

type UploadedMediaInfo = {
  mediaID: string;
  mediaType: MediaType;
  url: string;
};

type MediaTypeUploadProps = {
  value?: string;
  onChange: (mediaID: string) => void;
  label?: string;
  disabled?: boolean;
  defaultMediaType?: MediaType;
  onUploaded?: (media: UploadedMediaInfo) => void;
};

export function MediaTypeUpload({
  value = "",
  onChange,
  label = "Media",
  disabled = false,
  defaultMediaType = "IMAGE",
  onUploaded,
}: MediaTypeUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedMediaType, setSelectedMediaType] =
    useState<MediaType>(defaultMediaType);
  const [localPreviewUrl, setLocalPreviewUrl] = useState("");
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [uploadedMediaType, setUploadedMediaType] = useState<MediaType | null>(
    null,
  );
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    return () => {
      if (localPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  const uploadMutation = useUploadTempMedia({
    onSuccess: ({ data }) => {
      onChange(data.mediaID);
      setUploadedUrl(data.url);
      setUploadedMediaType(data.mediaType);
      onUploaded?.({
        mediaID: data.mediaID,
        mediaType: data.mediaType,
        url: data.url,
      });
      toast.success("Tải media thành công");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Tải media thất bại");
    },
  });

  const previewMediaType = uploadedMediaType ?? selectedMediaType;
  const previewUrl = useMemo(() => {
    return uploadedUrl || localPreviewUrl;
  }, [uploadedUrl, localPreviewUrl]);

  const processFile = (file: File) => {
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (selectedMediaType === "IMAGE" && !isImage) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    if (selectedMediaType === "VIDEO" && !isVideo) {
      toast.error("Vui lòng chọn file video");
      return;
    }

    if (localPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(localPreviewUrl);
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    setLocalPreviewUrl(nextPreviewUrl);
    setUploadedUrl("");
    setUploadedMediaType(null);
    setFileName(file.name);
    uploadMutation.mutate({ file, mediaType: selectedMediaType });
  };

  const handleOpenPicker = () => {
    if (disabled || uploadMutation.isPending) return;
    inputRef.current?.click();
  };

  const handleRemove = () => {
    if (localPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(localPreviewUrl);
    }

    setLocalPreviewUrl("");
    setUploadedUrl("");
    setUploadedMediaType(null);
    setFileName("");
    setIsDragging(false);
    onChange("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    processFile(file);
    event.target.value = "";
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!disabled && !uploadMutation.isPending) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    if (disabled || uploadMutation.isPending) return;

    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    processFile(file);
  };

  const accept = selectedMediaType === "IMAGE" ? "image/*" : "video/*";

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      <div className="grid gap-2 sm:max-w-60">
        <Label className="text-xs text-greyscale-100">Loại phương tiện</Label>
        <Select
          value={selectedMediaType}
          onValueChange={(value) => setSelectedMediaType(value as MediaType)}
          disabled={disabled || uploadMutation.isPending}
        >
          <SelectTrigger className="border-greyscale-600 bg-greyscale-900">
            <SelectValue placeholder="Chọn loại media" />
          </SelectTrigger>
          <SelectContent className="border-greyscale-600 bg-greyscale-900 text-greyscale-0">
            <SelectItem value="IMAGE">Hình ảnh</SelectItem>
            <SelectItem value="VIDEO">Video</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled || uploadMutation.isPending}
      />

      <div className="space-y-3">
        <div
          role="button"
          tabIndex={0}
          onClick={handleOpenPicker}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              handleOpenPicker();
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "flex w-full flex-col items-center justify-center rounded border border-dashed px-6 py-8 text-center transition-colors",
            "bg-greyscale-800/30",
            disabled || uploadMutation.isPending
              ? "cursor-not-allowed opacity-60"
              : "cursor-pointer",
            isDragging
              ? "border-primary-300 bg-greyscale-800/60"
              : "border-greyscale-500 hover:border-primary-300 hover:bg-greyscale-800/50",
          )}
        >
          {previewUrl ? (
            <div className="flex w-full flex-col items-center gap-4">
              <div className="w-full max-w-64 overflow-hidden rounded border border-greyscale-600 bg-greyscale-900">
                {previewMediaType === "VIDEO" ? (
                  <video
                    src={previewUrl}
                    controls
                    className="max-h-56 w-full object-contain"
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt="Media preview"
                    className="max-h-56 w-full object-contain"
                  />
                )}
              </div>

              <div className="space-y-1">
                <p className="max-w-full truncate text-sm font-medium text-greyscale-0">
                  {fileName || "Media"}
                </p>
                <p className="text-xs text-greyscale-50">
                  Nhấn để đổi file khác
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-greyscale-700/60">
                {uploadMutation.isPending ? (
                  <Loader2 className="h-6 w-6 animate-spin text-primary-300" />
                ) : selectedMediaType === "VIDEO" ? (
                  <Video className="h-6 w-6 text-greyscale-50" />
                ) : (
                  <ImagePlus className="h-7 w-7 text-greyscale-50" />
                )}
              </div>

              <p className="text-sm font-medium text-greyscale-0">
                Tải lên {selectedMediaType === "IMAGE" ? "ảnh" : "video"}
              </p>
              <p className="mt-1 text-xs text-greyscale-50">
                Kéo thả hoặc nhấn để chọn file
              </p>
            </>
          )}
        </div>

        <div className="w-full flex justify-between items-center">
          <p className="min-w-0 truncate text-xs text-greyscale-50">
            {fileName || "Chưa có file"}
          </p>
          {previewUrl && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleRemove}
              disabled={disabled || uploadMutation.isPending}
              className="h-8 px-2 text-greyscale-50 hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
              Xóa media
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
