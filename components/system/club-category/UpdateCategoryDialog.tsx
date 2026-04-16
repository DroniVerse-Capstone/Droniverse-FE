"use client"

import { AxiosError } from "axios"
import React from "react"
import toast from "react-hot-toast"
import { MdOutlineEdit } from "react-icons/md"

import TooltipWrapper from "@/components/common/ToolTipWrapper"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { useUpdateCategory } from "@/hooks/category/useCategory"
import { useLocale } from "@/providers/i18n-provider"
import { ApiError } from "@/types/api/common"
import {
  Category,
  updateCategoryRequestSchema,
} from "@/validations/category/category"

type UpdateCategoryDialogProps = {
  category: Category
}

export default function UpdateCategoryDialog({
  category,
}: UpdateCategoryDialogProps) {
  const locale = useLocale()
  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState({
    typeNameVN: category.typeNameVN,
    typeNameEN: category.typeNameEN,
    descriptionVN: category.descriptionVN,
    descriptionEN: category.descriptionEN,
  })

  const updateCategoryMutation = useUpdateCategory()
  const isSubmitting = updateCategoryMutation.isPending

  React.useEffect(() => {
    if (open) {
      setForm({
        typeNameVN: category.typeNameVN,
        typeNameEN: category.typeNameEN,
        descriptionVN: category.descriptionVN,
        descriptionEN: category.descriptionEN,
      })
    }
  }, [category, open])

  const normalizedPayload = React.useMemo(
    () => ({
      typeNameVN: form.typeNameVN.trim(),
      typeNameEN: form.typeNameEN.trim(),
      descriptionVN: form.descriptionVN.trim(),
      descriptionEN: form.descriptionEN.trim(),
    }),
    [form]
  )

  const isValid = React.useMemo(
    () => updateCategoryRequestSchema.safeParse(normalizedPayload).success,
    [normalizedPayload]
  )

  const setField = <K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (isSubmitting) return
    setOpen(nextOpen)
  }

  const handleSubmit = async () => {
    const parsed = updateCategoryRequestSchema.safeParse(normalizedPayload)

    if (!parsed.success) {
      toast.error(locale === "vi" ? "Dữ liệu không hợp lệ" : "Invalid input")
      return
    }

    try {
      const response = await updateCategoryMutation.mutateAsync({
        categoryId: category.categoryId,
        payload: parsed.data,
      })
      toast.success(response.message)
      setOpen(false)
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>
      toast.error(
        axiosError.response?.data?.message ||
          axiosError.message ||
          (locale === "vi"
            ? "Không thể cập nhật danh mục"
            : "Unable to update category")
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <TooltipWrapper label={locale === "vi" ? "Sửa" : "Edit"}>
        <Button
          type="button"
          variant="editIcon"
          size="icon"
          onClick={() => setOpen(true)}
        >
          <MdOutlineEdit size={18} />
        </Button>
      </TooltipWrapper>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{locale === "vi" ? "Cập nhật danh mục" : "Update category"}</DialogTitle>
          <DialogDescription>
            {locale === "vi"
              ? "Chỉnh sửa thông tin danh mục."
              : "Edit category information."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`update-category-name-vn-${category.categoryId}`}>
             {locale === "vi" ? "Tên danh mục (VI)" : "Category Name (VI)"}
            </Label>
            <Input
              id={`update-category-name-vn-${category.categoryId}`}
              value={form.typeNameVN}
              onChange={(event) => setField("typeNameVN", event.target.value)}
              placeholder={locale === "vi" ? "Nhập tên danh mục tiếng Việt" : "Enter category name in Vietnamese"}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`update-category-name-en-${category.categoryId}`}>
              {locale === "vi" ? "Tên danh mục (EN)" : "Category Name (EN)"}
            </Label>
            <Input
              id={`update-category-name-en-${category.categoryId}`}
              value={form.typeNameEN}
              onChange={(event) => setField("typeNameEN", event.target.value)}
              placeholder={locale === "vi" ? "Nhập tên danh mục tiếng Anh" : "Enter category name in English"}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`update-category-description-vn-${category.categoryId}`}>
              {locale === "vi" ? "Mô tả (VI)" : "Description (VI)"}
            </Label>
            <Textarea
              id={`update-category-description-vn-${category.categoryId}`}
              value={form.descriptionVN}
              onChange={(event) => setField("descriptionVN", event.target.value)}
              placeholder={locale === "vi" ? "Nhập mô tả tiếng Việt" : "Enter description in Vietnamese"}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`update-category-description-en-${category.categoryId}`}>
              {locale === "vi" ? "Mô tả (EN)" : "Description (EN)"}
            </Label>
            <Textarea
              id={`update-category-description-en-${category.categoryId}`}
              value={form.descriptionEN}
              onChange={(event) => setField("descriptionEN", event.target.value)}
              placeholder={locale === "vi" ? "Nhập mô tả tiếng Anh" : "Enter description in English"}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            {locale === "vi" ? "Đóng" : "Cancel"}
          </Button>
          <Button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={isSubmitting || !isValid}
          >
            {isSubmitting ? (
              <Spinner className="h-4 w-4" />
            ) : locale === "vi" ? (
              "Cập nhật"
            ) : (
              "Update"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
