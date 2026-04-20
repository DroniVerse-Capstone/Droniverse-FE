"use client"

import React from "react"
import toast from "react-hot-toast"

import CreateDroneDialog from "@/components/system/drone-management/CreateDroneDialog"
import DroneActionCell from "@/components/system/drone-management/DroneActionCell"
import DroneDetailDialog from "@/components/system/drone-management/DroneDetailDialog"
import UpdateDroneDialog from "@/components/system/drone-management/UpdateDroneDialog"
import { TableCustom } from "@/components/common/TableCustom"
import { Empty } from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { TableCell } from "@/components/ui/table"
import { useDeleteDrone, useGetDrones } from "@/hooks/drone/useDrone"
import { useLocale } from "@/providers/i18n-provider"

export default function DroneManagement() {
  const locale = useLocale()
  const { data: drones = [], isLoading, isError, error } = useGetDrones()

  const [viewDroneId, setViewDroneId] = React.useState<string | null>(null)
  const [editDroneId, setEditDroneId] = React.useState<string | null>(null)

  const deleteDroneMutation = useDeleteDrone()
  const isDeleting = deleteDroneMutation.isPending

  const handleDeleteDrone = async (droneId: string) => {
    try {
      const response = await deleteDroneMutation.mutateAsync(droneId)
      toast.success(response.message)
    } catch (error) {
      const axiosError = error as Error
      toast.error(
        axiosError.message ||
          (locale === "vi" ? "Không thể xóa drone." : "Unable to delete drone.")
      )
    }
  }

  const headers = [
    locale === "vi" ? "STT" : "No.",
    locale === "vi" ? "Tên drone" : "Drone name",
    locale === "vi" ? "Loại" : "Type",
    locale === "vi" ? "Nhà sản xuất" : "Manufacturer",
    locale === "vi" ? "Chiều cao (m)" : "Height (m)",
    locale === "vi" ? "Trọng lượng (kg)" : "Weight (kg)",
    locale === "vi" ? "Hình ảnh" : "Image",
    locale === "vi" ? "Thao tác" : "Actions",
  ]

  if (isLoading) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <Spinner className="h-5 w-5" />
      </div>
    )
  }

  if (isError) {
    return (
      <Empty>
        <p className="text-sm text-muted-foreground">
          {error.response?.data?.message ||
            error.message ||
            (locale === "vi"
              ? "Không thể tải danh sách drone."
              : "Unable to load drones list.")}
        </p>
      </Empty>
    )
  }

  return (
    <section className="space-y-5">
      <header className="flex justify-between items-center">
        <p className="text-sm text-greyscale-100">
          {locale === "vi" ? "Tổng drone" : "Total drones"}: {drones.length}
        </p>
        <CreateDroneDialog />
      </header>

      <TableCustom
        headers={headers}
        data={drones}
        renderRow={(drone, index) => (
          <>
            <TableCell>{index + 1}</TableCell>
            <TableCell className="font-medium text-greyscale-0">
              {locale === "vi" ? drone.droneNameVN : drone.droneNameEN}
            </TableCell>
            <TableCell>
              {locale === "vi" ? drone.droneTypeNameVN : drone.droneTypeNameEN}
            </TableCell>
            <TableCell>{drone.manufacturer}</TableCell>
            <TableCell>{drone.height}</TableCell>
            <TableCell>{drone.weight}</TableCell>
            <TableCell>
              {drone.imgURL ? (
                <img
                  src={drone.imgURL}
                  alt={locale === "vi" ? drone.droneNameVN : drone.droneNameEN}
                  className="h-12 w-16 rounded object-cover border border-greyscale-700"
                />
              ) : (
                <span className="text-greyscale-200">N/A</span>
              )}
            </TableCell>
            <TableCell className="text-right">
              <DroneActionCell
                locale={locale}
                droneId={drone.droneID}
                isDeleting={isDeleting}
                onView={(droneId) => setViewDroneId(droneId)}
                onEdit={(droneId) => setEditDroneId(droneId)}
                onDelete={(droneId) => {
                  void handleDeleteDrone(droneId)
                }}
              />
            </TableCell>
          </>
        )}
      />

      <DroneDetailDialog
        locale={locale}
        droneId={viewDroneId}
        onClose={() => setViewDroneId(null)}
      />

      <UpdateDroneDialog
        locale={locale}
        droneId={editDroneId}
        onClose={() => setEditDroneId(null)}
      />
    </section>
  )
}
