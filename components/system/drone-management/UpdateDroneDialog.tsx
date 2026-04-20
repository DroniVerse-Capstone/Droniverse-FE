import React from "react"
import toast from "react-hot-toast"

import CommonDropdown from "@/components/common/CommonDropdown"
import MediaUpload from "@/components/common/MediaUpload"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { useGetDroneDetail, useUpdateDrone } from "@/hooks/drone/useDrone"
import { useGetDroneTypes } from "@/hooks/drone-type/useDroneType"
import { updateDroneRequestSchema } from "@/validations/drone/drone"

type UpdateDroneFormState = {
  droneTypeID: string
  droneNameVN: string
  droneNameEN: string
  manufacturer: string
  descriptionVN: string
  descriptionEN: string
  height: string
  weight: string
  status: "ACTIVE" | "INACTIVE" | "DEPRECATED"
  imgURL: string
}

const DEFAULT_UPDATE_DRONE_FORM: UpdateDroneFormState = {
  droneTypeID: "",
  droneNameVN: "",
  droneNameEN: "",
  manufacturer: "",
  descriptionVN: "",
  descriptionEN: "",
  height: "",
  weight: "",
  status: "ACTIVE",
  imgURL: "",
}

type UpdateDroneDialogProps = {
  locale: string
  droneId: string | null
  onClose: () => void
}

export default function UpdateDroneDialog({
  locale,
  droneId,
  onClose,
}: UpdateDroneDialogProps) {
  const [updateForm, setUpdateForm] = React.useState<UpdateDroneFormState>(
    DEFAULT_UPDATE_DRONE_FORM
  )

  const { data: droneTypes = [], isLoading: isDroneTypesLoading } = useGetDroneTypes()
  const { data: editDroneDetail, isLoading: isEditDroneLoading } =
    useGetDroneDetail(droneId ?? undefined)

  const updateDroneMutation = useUpdateDrone()
  const isUpdating = updateDroneMutation.isPending

  const droneTypeOptions = React.useMemo(
    () =>
      droneTypes.map((type) => ({
        value: type.droneTypeID,
        label: locale === "vi" ? type.typeNameVN : type.typeNameEN,
        description: locale === "vi" ? type.descriptionVN : type.descriptionEN,
      })),
    [droneTypes, locale]
  )

  React.useEffect(() => {
    if (!editDroneDetail || !droneId) return

    setUpdateForm({
      droneTypeID: editDroneDetail.droneTypeID,
      droneNameVN: editDroneDetail.droneNameVN,
      droneNameEN: editDroneDetail.droneNameEN,
      manufacturer: editDroneDetail.manufacturer,
      descriptionVN: editDroneDetail.descriptionVN,
      descriptionEN: editDroneDetail.descriptionEN,
      height: String(editDroneDetail.height),
      weight: String(editDroneDetail.weight),
      status: editDroneDetail.status,
      imgURL: editDroneDetail.imgURL,
    })
  }, [editDroneDetail, droneId])

  const normalizedUpdatePayload = React.useMemo(
    () => ({
      droneTypeID: updateForm.droneTypeID,
      droneNameVN: updateForm.droneNameVN.trim(),
      droneNameEN: updateForm.droneNameEN.trim(),
      manufacturer: updateForm.manufacturer.trim(),
      descriptionVN: updateForm.descriptionVN.trim(),
      descriptionEN: updateForm.descriptionEN.trim(),
      height: Number(updateForm.height),
      weight: Number(updateForm.weight),
      status: updateForm.status,
      imgURL: updateForm.imgURL.trim(),
    }),
    [updateForm]
  )

  const isValidUpdatePayload = React.useMemo(
    () => updateDroneRequestSchema.safeParse(normalizedUpdatePayload).success,
    [normalizedUpdatePayload]
  )

  const setUpdateField = <K extends keyof UpdateDroneFormState>(
    key: K,
    value: UpdateDroneFormState[K]
  ) => {
    setUpdateForm((prev) => ({ ...prev, [key]: value }))
  }

  const resetAndClose = () => {
    setUpdateForm(DEFAULT_UPDATE_DRONE_FORM)
    onClose()
  }

  const handleUpdateDrone = async () => {
    if (!droneId) return

    const parsed = updateDroneRequestSchema.safeParse(normalizedUpdatePayload)
    if (!parsed.success) {
      toast.error(
        locale === "vi"
          ? "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin đã nhập."
          : "Invalid data. Please check the information you entered."
      )
      return
    }

    try {
      const response = await updateDroneMutation.mutateAsync({
        droneId,
        payload: parsed.data,
      })

      toast.success(response.message)
      resetAndClose()
    } catch (error) {
      const axiosError = error as Error
      toast.error(
        axiosError.message ||
          (locale === "vi" ? "Không thể cập nhật drone." : "Unable to update drone.")
      )
    }
  }

  return (
    <Dialog
      open={!!droneId}
      onOpenChange={(open) => {
        if (isUpdating) return
        if (!open) {
          resetAndClose()
        }
      }}
    >
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden p-0">
        <div className="flex max-h-[90vh] flex-col">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>{locale === "vi" ? "Cập nhật Drone" : "Update Drone"}</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {isEditDroneLoading ? (
              <div className="flex min-h-25 items-center justify-center">
                <Spinner className="h-5 w-5" />
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <CommonDropdown
                    value={updateForm.droneTypeID}
                    onChange={(value) => setUpdateField("droneTypeID", value)}
                    options={droneTypeOptions}
                    label={locale === "vi" ? "Loại drone" : "Drone type"}
                    placeholder={locale === "vi" ? "Chọn loại drone" : "Select drone type"}
                    disabled={isUpdating || isDroneTypesLoading}
                    isLoading={isDroneTypesLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="update-drone-name-vn">
                    {locale === "vi" ? "Tên drone (VI)" : "Drone Name (VI)"}
                  </Label>
                  <Input
                    id="update-drone-name-vn"
                    value={updateForm.droneNameVN}
                    onChange={(event) => setUpdateField("droneNameVN", event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="update-drone-name-en">
                    {locale === "vi" ? "Tên drone (EN)" : "Drone Name (EN)"}
                  </Label>
                  <Input
                    id="update-drone-name-en"
                    value={updateForm.droneNameEN}
                    onChange={(event) => setUpdateField("droneNameEN", event.target.value)}
                  />
                </div>

                <div className="grid gap-4 md:col-span-2 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="update-drone-manufacturer">
                      {locale === "vi" ? "Hãng sản xuất" : "Manufacturer"}
                    </Label>
                    <Input
                      id="update-drone-manufacturer"
                      value={updateForm.manufacturer}
                      onChange={(event) => setUpdateField("manufacturer", event.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="update-drone-height">
                      {locale === "vi" ? "Chiều cao (m)" : "Height (m)"}
                    </Label>
                    <Input
                      id="update-drone-height"
                      type="number"
                      step="0.001"
                      min="0"
                      value={updateForm.height}
                      onChange={(event) => setUpdateField("height", event.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="update-drone-weight">
                      {locale === "vi" ? "Trọng lượng (kg)" : "Weight (kg)"}
                    </Label>
                    <Input
                      id="update-drone-weight"
                      type="number"
                      step="0.001"
                      min="0"
                      value={updateForm.weight}
                      onChange={(event) => setUpdateField("weight", event.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <MediaUpload
                    label={locale === "vi" ? "Hình ảnh" : "Image"}
                    value={updateForm.imgURL}
                    onChange={(url) => setUpdateField("imgURL", url)}
                    disabled={isUpdating}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="update-drone-description-vn">
                    {locale === "vi" ? "Mô tả (VI)" : "Description (VI)"}
                  </Label>
                  <Textarea
                    id="update-drone-description-vn"
                    value={updateForm.descriptionVN}
                    onChange={(event) => setUpdateField("descriptionVN", event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="update-drone-description-en">
                    {locale === "vi" ? "Mô tả (EN)" : "Description (EN)"}
                  </Label>
                  <Textarea
                    id="update-drone-description-en"
                    value={updateForm.descriptionEN}
                    onChange={(event) => setUpdateField("descriptionEN", event.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="border-t border-greyscale-700 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={resetAndClose}
              disabled={isUpdating}
            >
              {locale === "vi" ? "Đóng" : "Cancel"}
            </Button>
            <Button
              type="button"
              onClick={() => void handleUpdateDrone()}
              disabled={isUpdating || !isValidUpdatePayload}
            >
              {isUpdating ? (
                <Spinner className="h-4 w-4" />
              ) : locale === "vi" ? (
                "Cập nhật"
              ) : (
                "Update"
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export type { UpdateDroneDialogProps }
