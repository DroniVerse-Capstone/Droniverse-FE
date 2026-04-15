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
import { useUpdateDroneType } from "@/hooks/drone-type/useDroneType"
import { useLocale } from "@/providers/i18n-provider"
import { ApiError } from "@/types/api/common"
import {
  DroneType,
  updateDroneTypeRequestSchema,
} from "@/validations/drone-type/drone-type"

type UpdateDroneCategoryDialogProps = {
  droneType: DroneType
}

export default function UpdateDroneCategoryDialog({
  droneType,
}: UpdateDroneCategoryDialogProps) {
  const locale = useLocale()
  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState({
    typeNameVN: droneType.typeNameVN,
    typeNameEN: droneType.typeNameEN,
    descriptionVN: droneType.descriptionVN,
    descriptionEN: droneType.descriptionEN,
  })

  const updateDroneTypeMutation = useUpdateDroneType()
  const isSubmitting = updateDroneTypeMutation.isPending

  React.useEffect(() => {
    if (open) {
      setForm({
        typeNameVN: droneType.typeNameVN,
        typeNameEN: droneType.typeNameEN,
        descriptionVN: droneType.descriptionVN,
        descriptionEN: droneType.descriptionEN,
      })
    }
  }, [droneType, open])

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
    () => updateDroneTypeRequestSchema.safeParse(normalizedPayload).success,
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
    const parsed = updateDroneTypeRequestSchema.safeParse(normalizedPayload)

    if (!parsed.success) {
      toast.error(locale === "vi" ? "Dữ liệu không hợp lệ" : "Invalid input")
      return
    }

    try {
      const response = await updateDroneTypeMutation.mutateAsync({
        droneTypeId: droneType.droneTypeID,
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
            ? "Không thể cập nhật loại drone"
            : "Unable to update drone type")
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
          <DialogTitle>
            {locale === "vi" ? "Cập nhật loại drone" : "Update Drone Type"}
          </DialogTitle>
          <DialogDescription>
            {locale === "vi"
              ? "Chỉnh sửa thông tin loại drone."
              : "Edit drone type information."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`update-drone-type-name-vn-${droneType.droneTypeID}`}>
              {locale === "vi" ? "Tên loại drone (VI)" : "Drone Type Name (VI)"}
            </Label>
            <Input
              id={`update-drone-type-name-vn-${droneType.droneTypeID}`}
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
            <Label htmlFor={`update-drone-type-name-en-${droneType.droneTypeID}`}>
              {locale === "vi" ? "Tên loại drone (EN)" : "Drone Type Name (EN)"}
            </Label>
            <Input
              id={`update-drone-type-name-en-${droneType.droneTypeID}`}
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
            <Label
              htmlFor={`update-drone-type-description-vn-${droneType.droneTypeID}`}
            >
              {locale === "vi" ? "Mô tả (VI)" : "Description (VI)"}
            </Label>
            <Textarea
              id={`update-drone-type-description-vn-${droneType.droneTypeID}`}
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
            <Label
              htmlFor={`update-drone-type-description-en-${droneType.droneTypeID}`}
            >
              {locale === "vi" ? "Mô tả (EN)" : "Description (EN)"}
            </Label>
            <Textarea
              id={`update-drone-type-description-en-${droneType.droneTypeID}`}
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
