import * as React from "react"
import { cn } from "@/lib/utils"
import { IoEyeOutline, IoEyeOffOutline, IoSearchOutline } from "react-icons/io5"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, onKeyDown, onPaste, min, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const isPassword = type === "password"
    const isNumber = type === "number"
    const isSearch = type === "search"

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (isNumber && ["-", "+", "e", "E"].includes(event.key)) {
        event.preventDefault()
      }

      onKeyDown?.(event)
    }

    const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
      if (isNumber) {
        const pastedValue = event.clipboardData.getData("text").trim()

        if (
          pastedValue.includes("-") ||
          pastedValue.includes("+") ||
          pastedValue.includes("e") ||
          pastedValue.includes("E")
        ) {
          event.preventDefault()
        }
      }

      onPaste?.(event)
    }

    return (
      <div className="relative">
        <input
          type={isPassword && showPassword ? "text" : type}
          min={isNumber ? (min ?? 0) : min}
          className={cn(
            "flex h-10 w-full rounded border border-greyscale-200 bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            isSearch && "pl-10",
            isPassword && "pr-10",
            isNumber &&
              "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
            className
          )}
          ref={ref}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          {...props}
        />
        {isSearch && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <IoSearchOutline className="h-4 w-4" />
          </span>
        )}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <IoEyeOffOutline className="h-4 w-4" />
            ) : (
              <IoEyeOutline className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"

export { Input }