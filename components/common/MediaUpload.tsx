"use client"

import { ClubImageUpload } from "@/components/manager/dashboard/ClubImageUpload"

type MediaUploadProps = {
  value?: string
  onChange: (url: string) => void
  label?: string
  disabled?: boolean
}

export default function MediaUpload({
  value = "",
  onChange,
  label = "Hình ảnh",
  disabled = false,
}: MediaUploadProps) {
  return (
    <ClubImageUpload
      value={value}
      onChange={onChange}
      label={label}
      disabled={disabled}
    />
  )
}

export type { MediaUploadProps }
