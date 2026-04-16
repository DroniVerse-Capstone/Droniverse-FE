"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/providers/i18n-provider";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText,
  cancelText,
  variant = "destructive",
  isLoading = false,
}: ConfirmDialogProps) {
  const t = useTranslations("Common");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#121216] border-white/10 text-white sm:max-w-[425px] animate-in fade-in zoom-in duration-300">
        <DialogHeader className="gap-2">
          <DialogTitle className="text-xl font-bold tracking-tight">
            {title}
          </DialogTitle>
          <DialogDescription className="text-greyscale-400 text-sm leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="bg-white/5 border-white/10 hover:bg-white/10 text-white px-6 h-10 text-xs font-bold uppercase tracking-widest transition-all"
          >
            {cancelText || t("buttons.cancel")}
          </Button>
          <Button
            type="button"
            variant={variant}
            onClick={() => {
              onConfirm();
            }}
            disabled={isLoading}
            className={`px-6 h-10 text-xs font-bold uppercase tracking-widest transition-all ${
              variant === "destructive"
                ? "bg-rose-500 hover:bg-rose-600 text-white shadow-[0_8px_16px_-4px_rgba(244,63,94,0.4)]"
                : "bg-primary-300 hover:bg-primary-400 text-white shadow-[0_8px_16px_-4px_rgba(239,68,68,0.4)]"
            }`}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              confirmText || t("buttons.confirm")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
