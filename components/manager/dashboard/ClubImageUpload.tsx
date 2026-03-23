"use client";

import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import apiClient from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "@/providers/i18n-provider";

type UploadTempImageResponse = {
  url: string;
};

type UploadImageError = {
  message?: string;
};

type ClubImageUploadProps = {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  disabled?: boolean;
};

export function ClubImageUpload({
  value = "",
  onChange,
  label = "Ảnh Club",
  disabled = false,
}: ClubImageUploadProps) {
  const t = useTranslations("ClubImageUpload");
  const inputRef = useRef<HTMLInputElement>(null);
  const [localPreview, setLocalPreview] = useState("");
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    return () => {
      if (localPreview.startsWith("blob:")) {
        URL.revokeObjectURL(localPreview);
      }
    };
  }, [localPreview]);

  const uploadMutation = useMutation<
    UploadTempImageResponse,
    AxiosError<UploadImageError>,
    File
  >({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiClient.post<UploadTempImageResponse>(
        "/clubs/upload-temp-image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    },
    onSuccess: (data) => {
      onChange(data.url);
      toast.success(t("toast.success"));
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || t("toast.error"));
    },
  });

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error(t("toast.warning"));
      return;
    }

    if (localPreview.startsWith("blob:")) {
      URL.revokeObjectURL(localPreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setLocalPreview(previewUrl);
    setFileName(file.name);
    uploadMutation.mutate(file);
  };

  const handleOpenPicker = () => {
    if (disabled || uploadMutation.isPending) return;
    inputRef.current?.click();
  };

  const handleRemove = () => {
    if (localPreview.startsWith("blob:")) {
      URL.revokeObjectURL(localPreview);
    }

    setLocalPreview("");
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

  const previewSrc = value || localPreview;

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
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
              : "border-greyscale-500 hover:border-primary-300 hover:bg-greyscale-800/50"
          )}
        >
          {previewSrc ? (
            <div className="flex w-full flex-col items-center gap-4">
              <div className="h-36 w-full max-w-55 overflow-hidden rounded border border-greyscale-600 bg-greyscale-900">
                <img
                  src={previewSrc}
                  alt="Club preview"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="space-y-1">
                <p className="max-w-full truncate text-sm font-medium text-greyscale-0">
                  {fileName || "Ảnh Club"}
                </p>
                <p className="text-xs text-greyscale-50">
                  {t("caption.change")}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-greyscale-700/60">
                {uploadMutation.isPending ? (
                  <Loader2 className="h-6 w-6 animate-spin text-primary-300" />
                ) : (
                  <ImagePlus className="h-7 w-7 text-greyscale-50" />
                )}
              </div>

              <p className="text-sm font-medium text-greyscale-0">
                {t("caption.upload")}
              </p>
              <p className="mt-1 text-xs text-greyscale-50">
                {t("caption.accept")}
              </p>
            </>
          )}
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="min-w-0 truncate text-xs text-greyscale-50">
            {fileName || t("caption.empty")}
          </p>

          {previewSrc && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleRemove}
              disabled={disabled || uploadMutation.isPending}
              className="h-8 px-2 text-greyscale-50 hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
              {t("caption.remove")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}