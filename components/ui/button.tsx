import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded text-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary-300 text-greyscale-0 border-3 border-primary-200 shadow hover:bg-primary/100",
        tertiary:
          "bg-tertiary-300 text-greyscale-0 border-3 border-tertiary shadow-sm hover:bg-tertiary/90",
        destructive:
          "text-primary border-3 border-primary shadow-sm hover:bg-primary/20",
        outline:
          "bg-greyscale-0/3 text-greyscale-0 border-3 border-greyscale-700 shadow-sm hover:bg-white/5",
        secondary:
          "bg-secondary-300 text-greyscale-0 border-3 border-secondary-200 shadow-sm hover:bg-secondary/90",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        editIcon:
          "bg-warning/15 text-warning border-1 border-warning-300 shadow-sm hover:bg-warning/5",
        viewIcon:
          "bg-tertiary/15 text-tertiary border-1 border-tertiary-300 shadow-sm hover:bg-tertiary/5",
        deleteIcon:
          "bg-primary/15 text-primary border-1 border-primary-300 shadow-sm hover:bg-primary/5",
        secondaryIcon:
          "bg-secondary/15 text-secondary border-1 border-secondary-300 shadow-sm hover:bg-secondary/5",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-10 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  icon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, icon, children, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {icon && <span className="inline-flex">{icon}</span>}
        {children}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
