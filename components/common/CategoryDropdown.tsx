import { useGetCategories } from "@/hooks/category/useCategory"
import CommonDropdown from "@/components/common/CommonDropdown"
import { useLocale, useTranslations } from "@/providers/i18n-provider"
import { pl } from "zod/v4/locales"

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
  const locale = useLocale()

  const options = categories.map((category) => ({
    value: category.categoryId,
    label: locale === "en" ? category.typeNameEN : category.typeNameVN,
    description: locale === "en" ? category.descriptionEN : category.descriptionVN,
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
      emptyMessage="Không có category"
      errorMessage={isError ? error?.message || "Không tải được danh mục" : undefined}
      isLoading={isLoading}
      maxLabelCount={2}
    />
  )
}