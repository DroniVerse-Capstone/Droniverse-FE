"use client"

import { AxiosError } from "axios"
import React from "react"
import toast from "react-hot-toast"
import { MdOutlineAddCircleOutline } from "react-icons/md"

import CommonDropdown from "@/components/common/CommonDropdown"
import MediaUpload from "@/components/common/MediaUpload"
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
import { useCreateDrone } from "@/hooks/drone/useDrone"
import { useGetDroneTypes } from "@/hooks/drone-type/useDroneType"
import { useLocale } from "@/providers/i18n-provider"
import { ApiError } from "@/types/api/common"
import { createDroneRequestSchema } from "@/validations/drone/drone"

type CreateDroneFormState = {
  droneTypeId: string
  droneNameVN: string
  droneNameEN: string
  manufacturer: string
  descriptionVN: string
  descriptionEN: string
  height: string
  weight: string
  imgURL: string
}

const DEFAULT_CREATE_DRONE_FORM: CreateDroneFormState = {
  droneTypeId: "",
  droneNameVN: "",
  droneNameEN: "",
  manufacturer: "",
  descriptionVN: "",
  descriptionEN: "",
  height: "",
  weight: "",
  imgURL: "",
}

export default function CreateDroneDialog() {
  const locale = useLocale()
  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState<CreateDroneFormState>(
    DEFAULT_CREATE_DRONE_FORM
  )

  const { data: droneTypes = [], isLoading: isDroneTypesLoading, isError: isDroneTypesError, error: droneTypesError } =
    useGetDroneTypes()
  const createDroneMutation = useCreateDrone()
  const isSubmitting = createDroneMutation.isPending

  const droneTypeOptions = React.useMemo(
    () =>
      droneTypes.map((type) => ({
        value: type.droneTypeID,
        label: locale === "vi" ? type.typeNameVN : type.typeNameEN,
        description: locale === "vi" ? type.descriptionVN : type.descriptionEN,
      })),
    [droneTypes, locale]
  )

  const setField = <K extends keyof CreateDroneFormState>(
    key: K,
    value: CreateDroneFormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const normalizedPayload = React.useMemo(
    () => ({
      droneNameVN: form.droneNameVN.trim(),
      droneNameEN: form.droneNameEN.trim(),
      manufacturer: form.manufacturer.trim(),
      descriptionVN: form.descriptionVN.trim(),
      descriptionEN: form.descriptionEN.trim(),
      height: Number(form.height),
      weight: Number(form.weight),
      status: "ACTIVE" as const,
      imgURL: form.imgURL.trim(),
    }),
    [form]
  )

  const isValidPayload = React.useMemo(
    () =>
      Boolean(form.droneTypeId) &&
      createDroneRequestSchema.safeParse(normalizedPayload).success,
    [form.droneTypeId, normalizedPayload]
  )

  const resetForm = () => {
    setForm(DEFAULT_CREATE_DRONE_FORM)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (isSubmitting) return
    setOpen(nextOpen)

    if (!nextOpen) {
      resetForm()
    }
  }

  const handleSubmit = async () => {
    if (!form.droneTypeId) {
      toast.error(
        locale === "vi"
          ? "Vui lòng chọn loại drone"
          : "Please select drone type"
      )
      return
    }

    const parsed = createDroneRequestSchema.safeParse(normalizedPayload)
    if (!parsed.success) {
      toast.error(
        locale === "vi"
          ? "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin đã nhập."
          : "Invalid data. Please check the information you entered."
      )
      return
    }

    try {
      const response = await createDroneMutation.mutateAsync({
        droneTypeId: form.droneTypeId,
        payload: parsed.data,
      })

      toast.success(response.message)
      setOpen(false)
      resetForm()
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>
      toast.error(
        axiosError.response?.data?.message ||
          axiosError.message ||
          (locale === "vi" ? "Không thể tạo drone." : "Unable to create drone.")
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button icon={<MdOutlineAddCircleOutline size={20} />}>
          {locale === "vi" ? "Thêm Drone mới" : "Add New Drone"}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden p-0">
        <div className="flex max-h-[90vh] flex-col">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>
              {locale === "vi" ? "Tạo Drone mới" : "Create New Drone"}
            </DialogTitle>
            <DialogDescription>
              {locale === "vi"
                ? "Điền thông tin drone để thêm mới vào hệ thống. Trạng thái mặc định là ACTIVE."
                : "Fill in drone information to create a new item. Default status is ACTIVE."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <CommonDropdown
              value={form.droneTypeId}
              onChange={(value) => setField("droneTypeId", value)}
              options={droneTypeOptions}
              label={locale === "vi" ? "Loại drone" : "Drone type"}
              placeholder={
                locale === "vi" ? "Chọn loại drone" : "Select drone type"
              }
              menuLabel={
                locale === "vi" ? "Danh sách loại drone" : "Drone type list"
              }
              disabled={isSubmitting || isDroneTypesLoading}
              isLoading={isDroneTypesLoading}
              errorMessage={
                isDroneTypesError
                  ? droneTypesError?.response?.data?.message ||
                    droneTypesError?.message ||
                    (locale === "vi"
                      ? "Không tải được danh sách loại drone"
                      : "Unable to load drone types")
                  : undefined
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-drone-name-vn">
              {locale === "vi" ? "Tên drone (VI)" : "Drone Name (VI)"}
            </Label>
            <Input
              id="create-drone-name-vn"
              value={form.droneNameVN}
              onChange={(event) => setField("droneNameVN", event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-drone-name-en">
              {locale === "vi" ? "Tên drone (EN)" : "Drone Name (EN)"}
            </Label>
            <Input
              id="create-drone-name-en"
              value={form.droneNameEN}
              onChange={(event) => setField("droneNameEN", event.target.value)}
            />
          </div>

          <div className="grid gap-4 md:col-span-2 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="create-drone-manufacturer">
                {locale === "vi" ? "Hãng sản xuất" : "Manufacturer"}
              </Label>
              <Input
                id="create-drone-manufacturer"
                value={form.manufacturer}
                onChange={(event) =>
                  setField("manufacturer", event.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-drone-height">
                {locale === "vi" ? "Chiều cao (m)" : "Height (m)"}
              </Label>
              <Input
                id="create-drone-height"
                type="number"
                step="0.001"
                min="0"
                value={form.height}
                onChange={(event) => setField("height", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-drone-weight">
                {locale === "vi" ? "Trọng lượng (kg)" : "Weight (kg)"}
              </Label>
              <Input
                id="create-drone-weight"
                type="number"
                step="0.001"
                min="0"
                value={form.weight}
                onChange={(event) => setField("weight", event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <MediaUpload
              label={locale === "vi" ? "Hình ảnh" : "Image"}
              value={form.imgURL}
              onChange={(url) => setField("imgURL", url)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-drone-description-vn">
              {locale === "vi" ? "Mô tả (VI)" : "Description (VI)"}
            </Label>
            <Textarea
              id="create-drone-description-vn"
              value={form.descriptionVN}
              onChange={(event) =>
                setField("descriptionVN", event.target.value)
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-drone-description-en">
              {locale === "vi" ? "Mô tả (EN)" : "Description (EN)"}
            </Label>
            <Textarea
              id="create-drone-description-en"
              value={form.descriptionEN}
              onChange={(event) =>
                setField("descriptionEN", event.target.value)
              }
            />
          </div>
            </div>
          </div>

          <DialogFooter className="border-t border-greyscale-700 px-6 py-4">
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
              disabled={isSubmitting || !isValidPayload}
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
