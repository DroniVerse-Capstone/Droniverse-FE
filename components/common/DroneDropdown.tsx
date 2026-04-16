import CommonDropdown from "@/components/common/CommonDropdown"
import { useGetDrones } from "@/hooks/drone/useDrone"
import { useLocale } from "@/providers/i18n-provider"

type DroneDropdownProps = {
  value: string[]
  onChange: (droneIds: string[]) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  label?: string
}

export default function DroneDropdown({
  value,
  onChange,
  placeholder = "Chọn drone",
  className,
  disabled = false,
  label = "Drone",
}: DroneDropdownProps) {
  const { data: drones = [], isLoading, isError, error } = useGetDrones({
    status: "Available",
  })
  const locale = useLocale()

  const options = drones.map((drone) => ({
    value: drone.droneID,
    label: locale === "en" ? drone.droneNameEN : drone.droneNameVN,
    description: locale === "en" ? drone.descriptionEN : drone.descriptionVN,
  }))

  return (
    <CommonDropdown
      multiple
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      label={label}
      menuLabel={placeholder}
      emptyMessage="Không có drone khả dụng"
      errorMessage={isError ? error?.message || "Không tải được danh sách drone" : undefined}
      isLoading={isLoading}
      maxLabelCount={2}
    />
  )
}

export type { DroneDropdownProps }
