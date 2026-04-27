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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import DropdownSearchBank from "@/components/manager/my-wallet/DropdownSearchBank";

interface WalletSetupDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  hasWallet: boolean;
  bank: string;
  setBank: (bank: string) => void;
  bankNumber: string;
  setBankNumber: (num: string) => void;
  isSubmitting: boolean;
  onSave: () => void;
}

export function WalletSetupDialog({
  isOpen,
  onOpenChange,
  hasWallet,
  bank,
  setBank,
  bankNumber,
  setBankNumber,
  isSubmitting,
  onSave,
}: WalletSetupDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {hasWallet ? "Cập nhật thông tin ví" : "Thiết lập ví mới"}
          </DialogTitle>
          <DialogDescription className="text-greyscale-300">
            Chọn ngân hàng và nhập số tài khoản để{" "}
            {hasWallet ? "cập nhật" : "kết nối"} ví của bạn.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-greyscale-100">Ngân hàng</Label>
            <DropdownSearchBank
              value={bank}
              onChange={setBank}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="wallet-bank-number" className="text-sm font-medium text-greyscale-100">
              Số tài khoản
            </Label>
            <Input
              id="wallet-bank-number"
              type="text"
              placeholder="Ví dụ: 123456789"
              value={bankNumber}
              onChange={(event) => setBankNumber(event.target.value)}
              disabled={isSubmitting}
              className="bg-greyscale-900 border-greyscale-700"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="flex-1 sm:flex-none"
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={onSave}
            disabled={isSubmitting}
            className="flex-1 sm:flex-none"
          >
            {isSubmitting ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Đang lưu...
              </>
            ) : (
              "Lưu thông tin"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
