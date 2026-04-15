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
import { useCreateDroneType } from "@/hooks/drone-type/useDroneType"
import { useLocale } from "@/providers/i18n-provider"
import { ApiError } from "@/types/api/common"
import { createDroneTypeRequestSchema } from "@/validations/drone-type/drone-type"

const DEFAULT_FORM = {
  typeNameVN: "",
  typeNameEN: "",
  descriptionVN: "",
  descriptionEN: "",
}

export default function CreateDroneCategoryDialog() {
  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState(DEFAULT_FORM)
  const locale = useLocale()

  const createDroneTypeMutation = useCreateDroneType()
  const isSubmitting = createDroneTypeMutation.isPending

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
    () => createDroneTypeRequestSchema.safeParse(normalizedPayload).success,
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
    const parsed = createDroneTypeRequestSchema.safeParse(normalizedPayload)

    if (!parsed.success) {
      toast.error(
        locale === "vi"
          ? "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin đã nhập."
          : "Invalid data. Please check the information you entered."
      )
      return
    }

    try {
      const response = await createDroneTypeMutation.mutateAsync(parsed.data)
      toast.success(response.message)
      setOpen(false)
      resetForm()
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>
      toast.error(
        axiosError.response?.data?.message ||
          axiosError.message ||
          (locale === "vi"
            ? "Không thể tạo loại drone."
            : "Unable to create drone type.")
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button icon={<MdOutlineAddCircleOutline size={20} />}>
          {locale === "vi" ? "Tạo mới loại drone" : "Create New Drone Type"}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {locale === "vi" ? "Tạo loại drone" : "Create Drone Type"}
          </DialogTitle>
          <DialogDescription>
            {locale === "vi"
              ? "Điền đầy đủ thông tin loại drone bằng tiếng Việt và tiếng Anh."
              : "Fill in all drone type information in Vietnamese and English."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="create-drone-type-name-vn">
              {locale === "vi" ? "Tên loại drone (VI)" : "Drone Type Name (VI)"}
            </Label>
            <Input
              id="create-drone-type-name-vn"
              value={form.typeNameVN}
              onChange={(event) => setField("typeNameVN", event.target.value)}
              placeholder={
                locale === "vi"
                  ? "Nhập tên loại drone tiếng Việt"
                  : "Enter drone type name in Vietnamese"
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-drone-type-name-en">
              {locale === "vi" ? "Tên loại drone (EN)" : "Drone Type Name (EN)"}
            </Label>
            <Input
              id="create-drone-type-name-en"
              value={form.typeNameEN}
              onChange={(event) => setField("typeNameEN", event.target.value)}
              placeholder={
                locale === "vi"
                  ? "Nhập tên loại drone tiếng Anh"
                  : "Enter drone type name in English"
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-drone-type-description-vn">
              {locale === "vi" ? "Mô tả (VI)" : "Description (VI)"}
            </Label>
            <Textarea
              id="create-drone-type-description-vn"
              value={form.descriptionVN}
              onChange={(event) => setField("descriptionVN", event.target.value)}
              placeholder={
                locale === "vi"
                  ? "Nhập mô tả tiếng Việt"
                  : "Enter description in Vietnamese"
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-drone-type-description-en">
              {locale === "vi" ? "Mô tả (EN)" : "Description (EN)"}
            </Label>
            <Textarea
              id="create-drone-type-description-en"
              value={form.descriptionEN}
              onChange={(event) => setField("descriptionEN", event.target.value)}
              placeholder={
                locale === "vi"
                  ? "Nhập mô tả tiếng Anh"
                  : "Enter description in English"
              }
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
              "Tạo mới"
            ) : (
              "Create New"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
