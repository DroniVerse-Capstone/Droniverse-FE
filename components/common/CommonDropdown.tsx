"use client"

import * as React from "react"
import { Check, ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

export type CommonDropdownOption = {
  value: string
  label: string
  description?: string
  disabled?: boolean
  leadingDotClassName?: string
}

type CommonDropdownBaseProps = {
  options: CommonDropdownOption[]
  placeholder?: string
  maxLabelCount?: number
  className?: string
  disabled?: boolean
  label?: string
  menuLabel?: string
  emptyMessage?: string
  errorMessage?: string
  isLoading?: boolean
  triggerClassName?: string
  contentClassName?: string
  itemClassName?: string
}

type SingleSelectProps = CommonDropdownBaseProps & {
  multiple?: false
  value?: string
  onChange: (value: string) => void
}

type MultiSelectProps = CommonDropdownBaseProps & {
  multiple: true
  value: string[]
  onChange: (value: string[]) => void
}

export type CommonDropdownProps = SingleSelectProps | MultiSelectProps

export default function CommonDropdown(props: CommonDropdownProps) {
  const {
    options,
    placeholder = "Chọn mục",
    maxLabelCount,
    className,
    disabled = false,
    label,
    menuLabel,
    emptyMessage = "Không có dữ liệu",
    errorMessage,
    isLoading = false,
    triggerClassName,
    contentClassName,
    itemClassName,
  } = props

  const selectedOptions = React.useMemo(() => {
    if (props.multiple) {
      return options.filter((option) => props.value.includes(option.value))
    }

    return options.filter((option) => option.value === props.value)
  }, [options, props])

  const triggerLabel = React.useMemo(() => {
    if (selectedOptions.length === 0) {
      return placeholder
    }

    if (props.multiple && maxLabelCount && selectedOptions.length > maxLabelCount) {
      const visibleLabels = selectedOptions
        .slice(0, maxLabelCount)
        .map((option) => option.label)
        .join(", ")

      const remainingCount = selectedOptions.length - maxLabelCount

      return `${visibleLabels}, +${remainingCount}`
    }

    return selectedOptions.map((option) => option.label).join(", ")
  }, [maxLabelCount, placeholder, props.multiple, selectedOptions])

  const selectedSingleOption = React.useMemo(() => {
    if (props.multiple) {
      return undefined
    }

    return options.find((option) => option.value === props.value)
  }, [options, props])

  const handleMultiCheckedChange = (optionValue: string, checked: boolean) => {
    if (!props.multiple) {
      return
    }

    if (checked) {
      if (!props.value.includes(optionValue)) {
        props.onChange([...props.value, optionValue])
      }
      return
    }

    props.onChange(props.value.filter((value) => value !== optionValue))
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label ? (
        <label className="text-sm font-medium text-greyscale-0">{label}</label>
      ) : null}

      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={disabled || isLoading}>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "mt-2 w-full justify-between bg-greyscale-800 text-greyscale-0 hover:bg-greyscale-900",
              triggerClassName
            )}
            disabled={disabled || isLoading}
          >
            <span className="min-w-0 flex flex-1 items-center gap-2 text-left" title={triggerLabel}>
              {!props.multiple && selectedSingleOption?.leadingDotClassName ? (
                <span
                  className={cn(
                    "h-2 w-2 shrink-0 rounded-full",
                    selectedSingleOption.leadingDotClassName
                  )}
                />
              ) : null}
              <span className="min-w-0 truncate">
                {isLoading ? "Đang tải dữ liệu..." : triggerLabel}
              </span>
            </span>

            {isLoading ? (
              <Spinner className="ml-2 h-4 w-4 shrink-0" />
            ) : (
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className={cn(
            "w-(--radix-dropdown-menu-trigger-width) bg-greyscale-800 border-greyscale-700",
            contentClassName
          )}
        >
          {menuLabel ? (
            <>
              <DropdownMenuLabel className="text-greyscale-0">{menuLabel}</DropdownMenuLabel>
              <DropdownMenuSeparator />
            </>
          ) : null}

          {errorMessage ? (
            <DropdownMenuItem disabled className="text-greyscale-300">
              {errorMessage}
            </DropdownMenuItem>
          ) : options.length === 0 ? (
            <DropdownMenuItem disabled className="text-greyscale-300">
              {emptyMessage}
            </DropdownMenuItem>
          ) : props.multiple ? (
            <div className="space-y-1">
              {options.map((option) => {
                const isChecked = props.value.includes(option.value)

                return (
                  <DropdownMenuCheckboxItem
                    key={option.value}
                    checked={isChecked}
                    disabled={option.disabled}
                    onCheckedChange={(checked) =>
                      handleMultiCheckedChange(option.value, checked === true)
                    }
                    onSelect={(event) => event.preventDefault()}
                    className={cn(
                      "cursor-pointer items-start rounded-md text-base text-greyscale-0 hover:bg-greyscale-700 focus:bg-greyscale-700",
                      isChecked && "bg-primary-200/20 text-primary-200",
                      itemClassName
                    )}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-2 font-medium text-sm">
                        {option.leadingDotClassName ? (
                          <span
                            className={cn("h-2 w-2 shrink-0 rounded-full", option.leadingDotClassName)}
                          />
                        ) : null}
                        <span className="min-w-0 truncate">{option.label}</span>
                      </span>
                      {option.description ? (
                        <span className="text-xs text-greyscale-300">{option.description}</span>
                      ) : null}
                    </div>
                  </DropdownMenuCheckboxItem>
                )
              })}
            </div>
          ) : (
            options.map((option) => {
              const isSelected = option.value === props.value

              return (
                <DropdownMenuItem
                  key={option.value}
                  disabled={option.disabled}
                  onClick={() => props.onChange(option.value)}
                  className={cn(
                    "cursor-pointer text-base hover:bg-greyscale-700 focus:bg-greyscale-700",
                    isSelected ? "bg-primary-200/20 text-primary-200" : "text-greyscale-0",
                    itemClassName
                  )}
                >
                  <div className="flex w-full items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="flex items-center gap-2 font-medium text-sm">
                        {option.leadingDotClassName ? (
                          <span
                            className={cn("h-2 w-2 shrink-0 rounded-full", option.leadingDotClassName)}
                          />
                        ) : null}
                        <span className="min-w-0 truncate">{option.label}</span>
                      </span>
                      {option.description ? (
                        <span className="text-xs text-greyscale-300">{option.description}</span>
                      ) : null}
                    </div>
                    {isSelected ? <Check className="mt-0.5 h-4 w-4 shrink-0" /> : null}
                  </div>
                </DropdownMenuItem>
              )
            })
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}