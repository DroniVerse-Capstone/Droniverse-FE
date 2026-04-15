"use client";

import React from "react";

import { Button } from "@/components/ui/button";

type InlineFilterOption<T extends string> = {
  value: T;
  label: string;
};

type InlineFilterRowProps<T extends string> = {
  label: string;
  selectedValue: T | null;
  options: InlineFilterOption<T>[];
  onChange: (value: T | null) => void;
  allLabel?: string;
};

export default function InlineFilterRow<T extends string>({
  label,
  selectedValue,
  options,
  onChange,
  allLabel = "Tất cả",
}: InlineFilterRowProps<T>) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="text-greyscale-0">{label}</span>

      <Button
        type="button"
        variant="ghost"
        onClick={() => onChange(null)}
        className={`h-auto p-0 font-Regular ${
          selectedValue === null ? "text-primary" : "text-greyscale-200"
        }`}
      >
        {allLabel}
      </Button>

      {options.map((option) => (
        <Button
          key={option.value}
          type="button"
          variant="ghost"
          onClick={() => onChange(option.value)}
          className={`h-auto p-0 font-re ${
            selectedValue === option.value ? "text-primary" : "text-greyscale-200"
          }`}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}

export type { InlineFilterOption, InlineFilterRowProps };