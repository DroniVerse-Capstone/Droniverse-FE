import CommonDropdown from "@/components/common/CommonDropdown"
import { useGetDrones } from "@/hooks/drone/useDrone"
import { useLocale } from "@/providers/i18n-provider"

type DroneDropdownBaseProps = {
  placeholder?: string
  className?: string
  disabled?: boolean
  label?: string
}

type SingleDroneDropdownProps = DroneDropdownBaseProps & {
  multiple?: false
  value: string
  onChange: (droneId: string) => void
}

type MultiDroneDropdownProps = DroneDropdownBaseProps & {
  multiple: true
  value: string[]
  onChange: (droneIds: string[]) => void
}

type DroneDropdownProps = SingleDroneDropdownProps | MultiDroneDropdownProps

export default function DroneDropdown(props: DroneDropdownProps) {
  const {
    placeholder = "Chọn drone",
    className,
    disabled = false,
    label = "Drone",
  } = props
  const { data: drones = [], isLoading, isError, error } = useGetDrones({
    status: "Active",
  })
  const locale = useLocale()

  const options = drones.map((drone) => ({
    value: drone.droneID,
    label: locale === "en" ? drone.droneNameEN : drone.droneNameVN,
    description: locale === "en" ? drone.descriptionEN : drone.descriptionVN,
  }))

  if (props.multiple) {
    return (
      <CommonDropdown
        multiple
        value={props.value}
        onChange={props.onChange}
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

  return (
    <CommonDropdown
      value={props.value}
      onChange={props.onChange}
      options={options}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      label={label}
      menuLabel={placeholder}
      emptyMessage="Không có drone khả dụng"
      errorMessage={isError ? error?.message || "Không tải được danh sách drone" : undefined}
      isLoading={isLoading}
    />
  )
}

export type { DroneDropdownProps }
