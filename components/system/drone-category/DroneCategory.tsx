"use client"

import React from "react"

import EmptyState from "@/components/common/EmptyState"
import { TableCustom } from "@/components/common/TableCustom"
import CreateDroneCategoryDialog from "./CreateDroneCategoryDialog"
import DeleteDroneCategoryDialog from "./DeleteDroneCategoryDialog"
import UpdateDroneCategoryDialog from "./UpdateDroneCategoryDialog"
import { Empty } from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { TableCell } from "@/components/ui/table"
import { useGetDroneTypes } from "@/hooks/drone-type/useDroneType"
import { useLocale } from "@/providers/i18n-provider"
import { DroneType } from "@/validations/drone-type/drone-type"

export default function DroneCategory() {
  const locale = useLocale()
  const { data, isLoading, isError, error } = useGetDroneTypes()

  const droneTypes = data ?? []

  const headers = [
    locale === "vi" ? "Tên loại drone (VI)" : "Drone Type Name (VI)",
    locale === "vi" ? "Tên loại drone (EN)" : "Drone Type Name (EN)",
    locale === "vi" ? "Mô tả (VI)" : "Description (VI)",
    locale === "vi" ? "Mô tả (EN)" : "Description (EN)",
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
              ? "Không thể tải danh sách loại drone."
              : "Unable to load drone types.")}
        </p>
      </Empty>
    )
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-end">
        <CreateDroneCategoryDialog />
      </div>

      {droneTypes.length === 0 ? (
        <EmptyState
          title={
            locale === "vi"
              ? "Chưa có loại drone nào."
              : "No drone types available."
          }
        />
      ) : (
        <TableCustom
          headers={headers}
          data={droneTypes}
          renderRow={(droneType: DroneType) => (
            <>
              <TableCell className="text-greyscale-25">{droneType.typeNameVN}</TableCell>
              <TableCell className="text-greyscale-25">{droneType.typeNameEN}</TableCell>
              <TableCell className="max-w-80 text-greyscale-50">
                <p className="line-clamp-2">{droneType.descriptionVN}</p>
              </TableCell>
              <TableCell className="max-w-80 text-greyscale-50">
                <p className="line-clamp-2">{droneType.descriptionEN}</p>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <UpdateDroneCategoryDialog droneType={droneType} />
                  <DeleteDroneCategoryDialog droneType={droneType} />
                </div>
              </TableCell>
            </>
          )}
        />
      )}
    </section>
  )
}
