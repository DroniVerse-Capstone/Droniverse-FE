import * as React from "react"
import { cn } from "@/lib/utils"
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const isPassword = type === "password"

    return (
      <div className="relative">
        <input
          type={isPassword && showPassword ? "text" : type}
          className={cn(
            "flex h-10 w-full rounded border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            isPassword && "pr-10",
            className
          )}
          ref={ref}
          {...props}
        />
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