import React from "react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { useGetDroneDetail } from "@/hooks/drone/useDrone"

type DroneDetailDialogProps = {
  locale: string
  droneId: string | null
  onClose: () => void
}

export default function DroneDetailDialog({
  locale,
  droneId,
  onClose,
}: DroneDetailDialogProps) {
  const { data: droneDetail, isLoading } = useGetDroneDetail(droneId ?? undefined)

  return (
    <Dialog open={!!droneId} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {locale === "vi"
              ? droneDetail?.droneNameVN || "Chi tiết drone"
              : droneDetail?.droneNameEN || "Drone details"}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex min-h-25 items-center justify-center">
            <Spinner className="h-5 w-5" />
          </div>
        ) : !droneDetail ? (
          <p className="text-sm text-greyscale-100">
            {locale === "vi"
              ? "Không thể tải chi tiết drone"
              : "Unable to load drone details"}
          </p>
        ) : (
          <div className="space-y-3">
            <div className="relative h-50 w-full overflow-hidden rounded border border-greyscale-700">
              <img
                src={droneDetail.imgURL}
                alt={locale === "vi" ? droneDetail.droneNameVN : droneDetail.droneNameEN}
                className="h-full w-full object-contain"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded border border-greyscale-700 p-2">
                <p className="text-xs text-greyscale-100">
                  {locale === "vi" ? "Tên drone" : "Drone name"}
                </p>
                <p className="text-sm font-medium text-greyscale-0">
                  {locale === "vi" ? droneDetail.droneNameVN : droneDetail.droneNameEN}
                </p>
              </div>
              <div className="rounded border border-greyscale-700 p-2">
                <p className="text-xs text-greyscale-100">{locale === "vi" ? "Loại" : "Type"}</p>
                <p className="text-sm font-medium text-greyscale-0">
                  {locale === "vi" ? droneDetail.droneTypeNameVN : droneDetail.droneTypeNameEN}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              <div className="rounded border border-greyscale-700 p-2">
                <p className="text-xs text-greyscale-100">
                  {locale === "vi" ? "Nhà sản xuất" : "Manufacturer"}
                </p>
                <p className="text-sm font-medium text-greyscale-0">{droneDetail.manufacturer}</p>
              </div>
              <div className="rounded border border-greyscale-700 p-2">
                <p className="text-xs text-greyscale-100">
                  {locale === "vi" ? "Chiều cao (m)" : "Height (m)"}
                </p>
                <p className="text-sm font-medium text-greyscale-0">{droneDetail.height}</p>
              </div>
              <div className="rounded border border-greyscale-700 p-2">
                <p className="text-xs text-greyscale-100">
                  {locale === "vi" ? "Trọng lượng (kg)" : "Weight (kg)"}
                </p>
                <p className="text-sm font-medium text-greyscale-0">{droneDetail.weight}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-greyscale-100">
                {locale === "vi" ? "Mô tả (VI)" : "Description (VI)"}
              </p>
              <p className="text-sm text-greyscale-0">{droneDetail.descriptionVN}</p>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-greyscale-100">
                {locale === "vi" ? "Mô tả (EN)" : "Description (EN)"}
              </p>
              <p className="text-sm text-greyscale-0">{droneDetail.descriptionEN}</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export type { DroneDetailDialogProps }
