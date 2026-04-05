"use client"

import { AxiosError } from "axios"
import React from "react"
import toast from "react-hot-toast"
import { MdDeleteOutline } from "react-icons/md"

import ConfirmActionPopover from "@/components/common/ConfirmActionPopover"
import TooltipWrapper from "@/components/common/ToolTipWrapper"
import { Button } from "@/components/ui/button"
import { useDeleteDroneType } from "@/hooks/drone-type/useDroneType"
import { useLocale } from "@/providers/i18n-provider"
import { ApiError } from "@/types/api/common"
import { DroneType } from "@/validations/drone-type/drone-type"

type DeleteDroneCategoryDialogProps = {
  droneType: DroneType
}

export default function DeleteDroneCategoryDialog({
  droneType,
}: DeleteDroneCategoryDialogProps) {
  const locale = useLocale()

  const deleteDroneTypeMutation = useDeleteDroneType()
  const isDeleting = deleteDroneTypeMutation.isPending

  const handleConfirmDelete = async () => {
    try {
      const response = await deleteDroneTypeMutation.mutateAsync(
        droneType.droneTypeID
      )
      toast.success(response.message)
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>
      toast.error(
        axiosError.response?.data?.message ||
          axiosError.message ||
          (locale === "vi"
            ? "Không thể xóa loại drone"
            : "Unable to delete drone type")
      )
    }
  }

  return (
    <ConfirmActionPopover
      trigger={
        <TooltipWrapper label={locale === "vi" ? "Xóa" : "Delete"}>
          <Button type="button" variant="deleteIcon" size="icon" disabled={isDeleting}>
            <MdDeleteOutline size={18} />
          </Button>
        </TooltipWrapper>
      }
      title={locale === "vi" ? "Xóa loại drone" : "Delete drone type"}
      description={
        locale === "vi"
          ? `Bạn có chắc chắn muốn xóa loại drone "${droneType.typeNameVN}"?`
          : `Are you sure you want to delete drone type "${droneType.typeNameEN}"?`
      }
      confirmText={locale === "vi" ? "Xóa" : "Delete"}
      cancelText={locale === "vi" ? "Đóng" : "Close"}
      isLoading={isDeleting}
      onConfirm={() => {
        void handleConfirmDelete()
      }}
      align="end"
      side="bottom"
      sideOffset={8}
      widthClassName="w-80"
    />
  )
}
