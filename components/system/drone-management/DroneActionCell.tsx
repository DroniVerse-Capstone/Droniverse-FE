import React from "react"
import { FaEdit, FaRegEye } from "react-icons/fa"
import { MdDeleteOutline } from "react-icons/md"

import ConfirmActionPopover from "@/components/common/ConfirmActionPopover"
import TooltipWrapper from "@/components/common/ToolTipWrapper"
import { Button } from "@/components/ui/button"

type DroneActionCellProps = {
  locale: string
  droneId: string
  isDeleting?: boolean
  onView: (droneId: string) => void
  onEdit: (droneId: string) => void
  onDelete: (droneId: string) => void
}

export default function DroneActionCell({
  locale,
  droneId,
  isDeleting = false,
  onView,
  onEdit,
  onDelete,
}: DroneActionCellProps) {
  return (
    <div className="flex justify-end gap-2">
      <TooltipWrapper label={locale === "vi" ? "Xem chi tiết" : "View details"}>
        <Button variant="secondaryIcon" size="icon" onClick={() => onView(droneId)}>
          <FaRegEye size={16} />
        </Button>
      </TooltipWrapper>

      <TooltipWrapper label={locale === "vi" ? "Chỉnh sửa" : "Edit"}>
        <Button variant="editIcon" size="icon" onClick={() => onEdit(droneId)}>
          <FaEdit size={16} />
        </Button>
      </TooltipWrapper>

      <ConfirmActionPopover
        trigger={
          <TooltipWrapper label={locale === "vi" ? "Xóa" : "Delete"}>
            <Button variant="deleteIcon" size="icon">
              <MdDeleteOutline size={16} />
            </Button>
          </TooltipWrapper>
        }
        title={locale === "vi" ? "Xóa drone này?" : "Delete this drone?"}
        description={
          locale === "vi"
            ? "Hành động này không thể hoàn tác."
            : "This action cannot be undone."
        }
        confirmText={locale === "vi" ? "Xóa" : "Delete"}
        cancelText={locale === "vi" ? "Đóng" : "Close"}
        isLoading={isDeleting}
        onConfirm={() => onDelete(droneId)}
      />
    </div>
  )
}

export type { DroneActionCellProps }
