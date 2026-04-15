"use client"

import { AxiosError } from "axios"
import React from "react"
import toast from "react-hot-toast"
import { MdOutlineAddCircleOutline } from "react-icons/md"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { useCreateCategory } from "@/hooks/category/useCategory"
import { ApiError } from "@/types/api/common"
import { createCategoryRequestSchema } from "@/validations/category/category"
import { useLocale } from "@/providers/i18n-provider"

const DEFAULT_FORM = {
  typeNameVN: "",
  typeNameEN: "",
  descriptionVN: "",
  descriptionEN: "",
}

export default function CreateCategoryDialog() {
  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState(DEFAULT_FORM)
  const locale = useLocale()

  const createCategoryMutation = useCreateCategory()
  const isSubmitting = createCategoryMutation.isPending

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
    () => createCategoryRequestSchema.safeParse(normalizedPayload).success,
    [normalizedPayload]
  )

  const setField = <K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const resetForm = () => {
    setForm(DEFAULT_FORM)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (isSubmitting) return
    setOpen(nextOpen)
    if (!nextOpen) {
      resetForm()
    }
  }

  const handleSubmit = async () => {
    const parsed = createCategoryRequestSchema.safeParse(normalizedPayload)

    if (!parsed.success) {
      toast.error(
        locale === "vi"
          ? "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin đã nhập."
          : "Invalid data. Please check the information you entered."
      )
      return
    }

    try {
      const response = await createCategoryMutation.mutateAsync(parsed.data)
      toast.success(response.message)
      setOpen(false)
      resetForm()
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>
      toast.error(
        axiosError.response?.data?.message ||
          axiosError.message ||
          (locale === "vi"
            ? "Không thể tạo danh mục."
            : "Unable to create category.")
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button icon={<MdOutlineAddCircleOutline size={20} />}>
          {locale === "vi" ? "Tạo mới danh mục" : "Create New Category"}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{locale === "vi" ? "Tạo danh mục" : "Create Category"}</DialogTitle>
          <DialogDescription>
            {locale === "vi"
              ? "Điền đầy đủ thông tin danh mục bằng tiếng Việt và tiếng Anh."
              : "Fill in all category information in Vietnamese and English."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="create-category-name-vn">{locale === "vi" ? "Tên danh mục (VI)" : "Category Name (VI)"}</Label>
            <Input
              id="create-category-name-vn"
              value={form.typeNameVN}
              onChange={(event) => setField("typeNameVN", event.target.value)}
              placeholder={locale === "vi" ? "Nhập tên danh mục tiếng Việt" : "Enter category name in Vietnamese"}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-category-name-en">{locale === "vi" ? "Tên danh mục (EN)" : "Category Name (EN)"}</Label>
            <Input
              id="create-category-name-en"
              value={form.typeNameEN}
              onChange={(event) => setField("typeNameEN", event.target.value)}
              placeholder={locale === "vi" ? "Nhập tên danh mục tiếng Anh" : "Enter category name in English"}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-category-description-vn">{locale === "vi" ? "Mô tả (VI)" : "Description (VI)"}</Label>
            <Textarea
              id="create-category-description-vn"
              value={form.descriptionVN}
              onChange={(event) => setField("descriptionVN", event.target.value)}
              placeholder={locale === "vi" ? "Nhập mô tả tiếng Việt" : "Enter description in Vietnamese"}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-category-description-en">{locale === "vi" ? "Mô tả (EN)" : "Description (EN)"}</Label>
            <Textarea
              id="create-category-description-en"
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
            {isSubmitting ? <Spinner className="h-4 w-4" /> : locale === "vi" ? "Tạo mới" : "Create New"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
