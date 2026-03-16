import { useGetCategories } from "@/hooks/category/useCategory"
import CommonDropdown from "@/components/common/CommonDropdown"

type CategoryDropdownProps = {
  value: string[]
  onChange: (categoryIds: string[]) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  label?: string
}

export default function CategoryDropdown({
  value,
  onChange,
  placeholder = "Chọn category",
  className,
  disabled = false,
  label = "Danh mục",
}: CategoryDropdownProps) {
  const { data: categories = [], isLoading, isError, error } = useGetCategories()

  const options = categories.map((category) => ({
    value: category.categoryId,
    label: category.typeNameVN,
    description: category.descriptionVN,
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
      menuLabel="Chọn category"
      emptyMessage="Không có category"
      errorMessage={isError ? error?.message || "Không tải được danh mục" : undefined}
      isLoading={isLoading}
      maxLabelCount={2}
    />
  )
}