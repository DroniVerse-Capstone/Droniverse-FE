"use client"

import { AxiosError } from "axios"
import React from "react"
import toast from "react-hot-toast"
import { MdDeleteOutline } from "react-icons/md"

import ConfirmActionPopover from "@/components/common/ConfirmActionPopover"
import TooltipWrapper from "@/components/common/ToolTipWrapper"
import { Button } from "@/components/ui/button"
import { useDeleteCategory } from "@/hooks/category/useCategory"
import { useLocale } from "@/providers/i18n-provider"
import { ApiError } from "@/types/api/common"
import { Category } from "@/validations/category/category"

type DeleteCategoryDialogProps = {
  category: Category
}

export default function DeleteCategoryDialog({
  category,
}: DeleteCategoryDialogProps) {
  const locale = useLocale()

  const deleteCategoryMutation = useDeleteCategory()
  const isDeleting = deleteCategoryMutation.isPending

  const handleConfirmDelete = async () => {
    try {
      const response = await deleteCategoryMutation.mutateAsync(category.categoryId)
      toast.success(response.message)
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>
      toast.error(
        axiosError.response?.data?.message ||
          axiosError.message ||
          (locale === "vi" ? "Không thể xóa danh mục" : "Unable to delete category")
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
      title={locale === "vi" ? "Xóa danh mục" : "Delete category"}
      description={
        locale === "vi"
          ? `Bạn có chắc chắn muốn xóa danh mục "${category.typeNameVN}"?`
          : `Are you sure you want to delete category "${category.typeNameEN}"?`
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
