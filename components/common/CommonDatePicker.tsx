"use client"

import * as React from "react"
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  isValid,
  parse,
} from "date-fns"
import { vi } from "date-fns/locale"
import { ChevronDown, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type CommonDatePickerProps = {
  /** ISO date string `YYYY-MM-DD` or empty string */
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  triggerClassName?: string
  label?: string
}

const WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]

const formatDisplayDate = (date: Date) => {
  return format(date, "dd/MM/yyyy", { locale: vi })
}

const formatManualDateInput = (input: string) => {
  const digits = input.replace(/\D/g, "").slice(0, 8)

  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`

  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

const parseManualDateInput = (input: string) => {
  const digits = input.replace(/\D/g, "")

  if (digits.length !== 8) return null

  const day = Number(digits.slice(0, 2))
  const month = Number(digits.slice(2, 4))
  const year = Number(digits.slice(4, 8))
  const parsedDate = new Date(year, month - 1, day)

  if (!isValid(parsedDate)) return null

  if (
    parsedDate.getDate() !== day ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getFullYear() !== year
  ) {
    return null
  }

  return parsedDate
}

export default function CommonDatePicker({
  value,
  onChange,
  placeholder = "Chọn ngày",
  disabled = false,
  className,
  triggerClassName,
  label,
}: CommonDatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [manualInput, setManualInput] = React.useState("")

  const selectedDate = value ? parse(value, "yyyy-MM-dd", new Date()) : null

  const [viewMonth, setViewMonth] = React.useState<Date>(
    selectedDate ?? new Date()
  )

  /* sync view month when value changes externally */
  React.useEffect(() => {
    if (selectedDate) setViewMonth(selectedDate)
    setManualInput(selectedDate ? formatDisplayDate(selectedDate) : "")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const commitManualInput = () => {
    if (!manualInput) {
      onChange("")
      setOpen(false)
      return
    }

    const parsedDate = parseManualDateInput(manualInput)

    if (!parsedDate) {
      setManualInput(selectedDate ? formatDisplayDate(selectedDate) : "")
      return
    }

    onChange(format(parsedDate, "yyyy-MM-dd"))
    setManualInput(formatDisplayDate(parsedDate))
    setViewMonth(parsedDate)
    setOpen(false)
  }

  const days = React.useMemo(() => {
    return eachDayOfInterval({
      start: startOfWeek(startOfMonth(viewMonth), { weekStartsOn: 0 }),
      end: endOfWeek(endOfMonth(viewMonth), { weekStartsOn: 0 }),
    })
  }, [viewMonth])

  const handleSelect = (day: Date) => {
    onChange(format(day, "yyyy-MM-dd"))
    setManualInput(formatDisplayDate(day))
    setViewMonth(day)
    setOpen(false)
  }

  const triggerLabel = selectedDate
    ? formatDisplayDate(selectedDate)
    : placeholder

  return (
    <div className={cn("space-y-2", className)}>
      {label ? (
        <label className="text-sm font-medium text-greyscale-0">{label}</label>
      ) : null}

      <Popover
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen)
          if (nextOpen) {
            setManualInput(selectedDate ? formatDisplayDate(selectedDate) : "")
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "mt-2 w-full justify-between bg-greyscale-800 text-greyscale-0 hover:bg-greyscale-900",
              !selectedDate && "text-greyscale-400",
              triggerClassName
            )}
          >
            <span className="flex min-w-0 flex-1 items-center gap-2 text-left">
              <CalendarDays className="h-4 w-4 shrink-0 opacity-60" />
              <span className="min-w-0 truncate">{triggerLabel}</span>
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-[--radix-popover-trigger-width] min-w-70 border-greyscale-700 bg-greyscale-800 p-3"
          align="start"
        >
          <div className="mb-3">
            <Input
              value={manualInput}
              onChange={(event) =>
                setManualInput(formatManualDateInput(event.target.value))
              }
              onBlur={commitManualInput}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault()
                  commitManualInput()
                }
              }}
              inputMode="numeric"
              placeholder="dd/mm/yyyy"
              disabled={disabled}
              className="border-greyscale-600 bg-greyscale-900/60 text-greyscale-0 placeholder:text-greyscale-500 focus:border-primary-500 focus:ring-primary-500/20"
            />
            <p className="mt-1 text-xs text-greyscale-400">
              Nhập số theo định dạng dd/mm/yyyy hoặc chọn ngày từ lịch
            </p>
          </div>

          {/* Month navigation */}
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setViewMonth((m) => subMonths(m, 1))}
              className="flex h-7 w-7 items-center justify-center rounded transition hover:bg-greyscale-700 text-greyscale-300"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="text-sm font-semibold text-greyscale-0 capitalize">
              {format(viewMonth, "MMMM yyyy", { locale: vi })}
            </span>

            <button
              type="button"
              onClick={() => setViewMonth((m) => addMonths(m, 1))}
              className="flex h-7 w-7 items-center justify-center rounded transition hover:bg-greyscale-700 text-greyscale-300"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="mb-1 grid grid-cols-7 text-center">
            {WEEKDAYS.map((d) => (
              <span key={d} className="text-[11px] font-medium text-greyscale-400">
                {d}
              </span>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-y-1">
            {days.map((day) => {
              const isSelected = selectedDate ? isSameDay(day, selectedDate) : false
              const isCurrentMonth = isSameMonth(day, viewMonth)
              const isTodayDay = isToday(day)

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => handleSelect(day)}
                  className={cn(
                    "mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm transition",
                    isSelected
                      ? "bg-primary-500 font-semibold text-white"
                      : isTodayDay
                        ? "border border-primary-400 text-primary-300 hover:bg-greyscale-700"
                        : isCurrentMonth
                          ? "text-greyscale-100 hover:bg-greyscale-700"
                          : "text-greyscale-500 hover:bg-greyscale-700"
                  )}
                >
                  {format(day, "d")}
                </button>
              )
            })}
          </div>

          {/* Clear action */}
          {selectedDate && (
            <div className="mt-3 border-t border-greyscale-700 pt-2">
              <button
                type="button"
                onClick={() => { onChange(""); setOpen(false) }}
                className="w-full rounded py-1 text-xs text-greyscale-400 transition hover:bg-greyscale-700 hover:text-greyscale-200"
              >
                Xóa ngày đã chọn
              </button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}
