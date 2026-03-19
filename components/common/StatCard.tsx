"use client";

import { ReactNode } from "react";

type Variant = "primary" | "secondary" | "tertiary";

type StatCardProps = {
  icon: ReactNode;
  title: string;
  value: string | number;
  variant?: Variant;
  extra?: ReactNode; // optional (ví dụ icon help)
};

const variantStyles: Record<
  Variant,
  {
    border: string;
    bg: string;
    text: string;
    subText: string;
  }
> = {
  primary: {
    border: "border-primary",
    bg: "bg-primary/8",
    text: "text-primary",
    subText: "text-primary-25",
  },
  secondary: {
    border: "border-secondary",
    bg: "bg-secondary/8",
    text: "text-secondary",
    subText: "text-secondary-0",
  },
  tertiary: {
    border: "border-tertiary",
    bg: "bg-tertiary/8",
    text: "text-tertiary",
    subText: "text-tertiary-0",
  },
};

export default function StatCard({
  icon,
  title,
  value,
  variant = "primary",
  extra,
}: StatCardProps) {
  const style = variantStyles[variant];

  return (
    <div
      className={`rounded border ${style.border} ${style.bg} px-4 py-3`}
    >
      <div className="flex items-center gap-4">
        <span
          className={`inline-flex h-13 w-13 items-center justify-center rounded-full border ${style.border} ${style.text}`}
        >
          {icon}
        </span>

        <div className="min-w-0">
          <div className={`flex items-center gap-1 ${style.subText}`}>
            <p className="text-base font-semibold">{title}</p>
            {extra}
          </div>

          <p className={`truncate text-2xl font-semibold ${style.text}`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}