"use client"

import React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

type VietQrBank = {
  id: number
  name: string
  code: string
  shortName?: string
  short_name?: string
  bin: string
  logo?: string
}

type VietQrBanksResponse = {
  code: string
  desc: string
  data: VietQrBank[]
}

type DropdownSearchBankProps = {
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
}

export default function DropdownSearchBank({
  value,
  onChange,
  disabled,
}: DropdownSearchBankProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [banks, setBanks] = React.useState<VietQrBank[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const listRef = React.useRef<HTMLDivElement | null>(null)

  const fetchBanks = React.useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("https://api.vietqr.io/v2/banks")

      if (!response.ok) {
        throw new Error("Không tải được danh sách ngân hàng")
      }

      const data = (await response.json()) as VietQrBanksResponse
      setBanks(Array.isArray(data.data) ? data.data : [])
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Có lỗi khi tải danh sách ngân hàng"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    if (banks.length > 0 || isLoading || (!open && !value)) {
      return
    }

    void fetchBanks()
  }, [banks.length, fetchBanks, isLoading, open, value])

  const handleListWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    const element = listRef.current

    if (!element || element.scrollHeight <= element.clientHeight) {
      return
    }

    element.scrollTop += event.deltaY
    event.preventDefault()
  }

  const filteredBanks = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return banks
    }

    return banks.filter((bank) => {
      const bankTokens = [
        bank.name,
        bank.shortName,
        bank.short_name,
        bank.code,
        bank.bin,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return bankTokens.includes(normalizedQuery)
    })
  }, [banks, query])

  const selectedBank = React.useMemo(
    () => banks.find((bank) => bank.code === value),
    [banks, value]
  )

  const selectedLabel = selectedBank
    ? `${selectedBank.shortName ?? selectedBank.short_name ?? selectedBank.name} (${selectedBank.code})`
    : value || "Chọn ngân hàng"

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          className="w-full justify-between bg-greyscale-900 hover:bg-greyscale-800"
          disabled={disabled}
        >
          <span className="flex min-w-0 items-center gap-2">
            {selectedBank?.logo ? (
              <img
                src={selectedBank.logo}
                alt={selectedBank.code}
                className="h-6 w-6 shrink-0 rounded bg-white object-contain"
                loading="lazy"
              />
            ) : null}
            <span className="truncate">{selectedLabel}</span>
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-3" align="start">
        <div className="space-y-3">
          <Input
            type="search"
            placeholder="Tìm ngân hàng theo tên, mã..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            disabled={disabled}
          />

          <div
            ref={listRef}
            onWheel={handleListWheel}
            className="max-h-64 space-y-1 overflow-y-auto overscroll-contain pr-1"
          >
            {isLoading ? (
              <div className="flex items-center gap-2 px-2 py-4 text-sm text-greyscale-100">
                <Spinner className="h-4 w-4" />
                Đang tải danh sách ngân hàng...
              </div>
            ) : error ? (
              <div className="space-y-2 p-2 text-sm text-primary-200">
                <p>{error}</p>
                <Button type="button" size="sm" variant="outline" onClick={() => void fetchBanks()}>
                  Thử lại
                </Button>
              </div>
            ) : filteredBanks.length === 0 ? (
              <p className="p-2 text-sm text-greyscale-100">Không tìm thấy ngân hàng phù hợp</p>
            ) : (
              filteredBanks.map((bank) => {
                const isSelected = bank.code === value
                const label = bank.shortName ?? bank.short_name ?? bank.name

                return (
                  <button
                    key={bank.id}
                    type="button"
                    className={cn(
                      "flex w-full items-start justify-between gap-2 rounded px-2 py-2 text-left text-sm transition-colors",
                      isSelected
                        ? "bg-primary-200/20 text-primary-200"
                        : "text-greyscale-0 hover:bg-greyscale-800"
                    )}
                    onClick={() => {
                      onChange(bank.code)
                      setOpen(false)
                    }}
                  >
                    <span className="flex min-w-0 items-start gap-2">
                      {bank.logo ? (
                        <img
                          src={bank.logo}
                          alt={bank.code}
                          className="mt-0.5 h-10 w-10 shrink-0 rounded bg-white object-contain"
                          loading="lazy"
                        />
                      ) : null}
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{label}</span>
                        <span className="block truncate text-xs text-greyscale-100">
                          {bank.code}
                        </span>
                      </span>
                    </span>
                    {isSelected ? <Check className="mt-0.5 h-4 w-4 shrink-0" /> : null}
                  </button>
                )
              })
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}