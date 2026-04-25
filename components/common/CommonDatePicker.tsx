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
} from "date-fns"
import { vi } from "date-fns/locale"
import { ChevronDown, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
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

  const selectedDate = value ? new Date(value) : null

  const [viewMonth, setViewMonth] = React.useState<Date>(
    selectedDate ?? new Date()
  )

  /* sync view month when value changes externally */
  React.useEffect(() => {
    if (selectedDate) setViewMonth(selectedDate)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const days = React.useMemo(() => {
    return eachDayOfInterval({
      start: startOfWeek(startOfMonth(viewMonth), { weekStartsOn: 0 }),
      end: endOfWeek(endOfMonth(viewMonth), { weekStartsOn: 0 }),
    })
  }, [viewMonth])

  const handleSelect = (day: Date) => {
    onChange(format(day, "yyyy-MM-dd"))
    setOpen(false)
  }

  const triggerLabel = selectedDate
    ? format(selectedDate, "dd/MM/yyyy", { locale: vi })
    : placeholder

  return (
    <div className={cn("space-y-2", className)}>
      {label ? (
        <label className="text-sm font-medium text-greyscale-0">{label}</label>
      ) : null}

      <Popover open={open} onOpenChange={setOpen}>
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
          className="w-[--radix-popover-trigger-width] min-w-[280px] border-greyscale-700 bg-greyscale-800 p-3"
          align="start"
        >
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
