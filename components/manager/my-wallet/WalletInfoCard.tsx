"use client";

import React from "react";
import { LuWallet } from "react-icons/lu";
import { MdContentCopy } from "react-icons/md";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateWithdrawRequest } from "@/hooks/wallet/useWallet";
import { useLocale } from "@/providers/i18n-provider";

interface WalletInfoCardProps {
  wallet: {
    ownerName: string;
    bankNumber: string;
    bank: string;
    balance: number;
  };
}

export function WalletInfoCard({ wallet }: WalletInfoCardProps) {
  const locale = useLocale();
  const [openDialog, setOpenDialog] = React.useState(false);
  const [amount, setAmount] = React.useState("");
  const [note, setNote] = React.useState("");
  const { mutate: createWithdrawRequest, isPending } = useCreateWithdrawRequest();
  const formattedAmount = amount ? Number(amount).toLocaleString("vi-VN") : "";
  const minimumWithdrawAmount = 50000;
  const quickAmounts = [50000, 100000, 200000, 500000];
  const maskAccount = (acct?: string) => {
    if (!acct) return "—";
    const s = acct.replace(/\s+/g, "");
    if (s.length <= 8) return s;
    const start = s.slice(0, 4);
    const end = s.slice(-4);
    return `${start} •••• ${end}`;
  };

  const copyToClipboard = async (text?: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Đã sao chép số tài khoản");
    } catch (e) {
      toast.error("Không thể sao chép");
    }
  };

  const handleSubmitWithdraw = () => {
    if (!amount || !note.trim()) {
      toast.error(locale === "vi" ? "Vui lòng điền đầy đủ thông tin" : "Please fill in all fields");
      return;
    }

    const amountNum = parseInt(amount, 10);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error(locale === "vi" ? "Số tiền phải lớn hơn 0" : "Amount must be greater than 0");
      return;
    }

    if (amountNum < minimumWithdrawAmount) {
      toast.error(
        locale === "vi"
          ? `Số tiền rút tối thiểu là ${minimumWithdrawAmount.toLocaleString("vi-VN")} đ`
          : `Minimum withdraw amount is ${minimumWithdrawAmount.toLocaleString("en-US")} VND`
      );
      return;
    }

    if (amountNum > wallet.balance) {
      toast.error(locale === "vi" ? "Số tiền vượt quá số dư" : "Amount exceeds balance");
      return;
    }

    createWithdrawRequest(
      {
        amount: amountNum,
        note: note.trim(),
      },
      {
        onSuccess: () => {
          toast.success(locale === "vi" ? "Tạo yêu cầu rút tiền thành công" : "Withdraw request created successfully");
          setOpenDialog(false);
          setAmount("");
          setNote("");
        },
        onError: (error) => {
          toast.error(error?.response?.data?.message || (locale === "vi" ? "Không thể tạo yêu cầu rút tiền" : "Failed to create withdraw request"));
        },
      }
    );
  };

  return (
    <div className="rounded-xl border border-greyscale-700 bg-greyscale-900 p-4 flex items-center justify-between gap-4 hover:border-greyscale-500 transition shadow-lg">
      {/* LEFT */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Bank logo */}
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
          <LuWallet size={35} className="text-primary-400" />
        </div>

        {/* Info */}
        <div className="min-w-0">
          {/* Owner */}
          <div className="text-sm font-medium text-greyscale-0 truncate">
            {wallet.ownerName}
          </div>

          {/* Account */}
          <div className="flex items-center gap-2 mt-1">
            <span className="font-mono text-sm text-greyscale-100 tracking-wide">
              {maskAccount(wallet.bankNumber)}
            </span>

            <button
              onClick={() => copyToClipboard(wallet.bankNumber)}
              className="text-greyscale-100 hover:text-greyscale-0 transition"
            >
              <MdContentCopy />
            </button>
          </div>

          {/* Bank name */}
          <div className="text-sm text-greyscale-50 mt-1 truncate font-medium">
            {wallet.bank}
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="text-right">
        <div className="text-2xl font-bold text-greyscale-0">
          {wallet.balance.toLocaleString("vi-VN")} đ
        </div>
        <div className="text-xs text-greyscale-200 mt-1 font-medium uppercase tracking-wider">
          Số dư khả dụng
        </div>
        <Button
          onClick={() => setOpenDialog(true)}
          className="mt-2 w-full"
        >
          {locale === "vi" ? "Rút tiền" : "Withdraw"}
        </Button>
      </div>

      {/* Withdraw Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {locale === "vi" ? "Yêu cầu rút tiền" : "Withdraw Request"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Amount Input */}
            <div>
              <label className="text-sm font-medium text-greyscale-0">
                {locale === "vi" ? "Số tiền" : "Amount"} *
              </label>
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="0"
                value={formattedAmount}
                onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
                disabled={isPending}
                min={minimumWithdrawAmount.toString()}
                className="mt-2"
              />
              <div className="mt-2 space-y-2 rounded border border-greyscale-700 bg-greyscale-900/60 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                    {locale === "vi"
                      ? `Tối thiểu ${minimumWithdrawAmount.toLocaleString("vi-VN")} đ`
                      : `Min ${minimumWithdrawAmount.toLocaleString("en-US")} VND`}
                  </Badge>
                  <Badge variant="outline" className="border-tertiary/30 bg-tertiary/10 text-tertiary">
                    {locale === "vi"
                      ? `Khả dụng ${wallet.balance.toLocaleString("vi-VN")} đ`
                      : `Available ${wallet.balance.toLocaleString("en-US")} VND`}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(quickAmounts.filter((value) => value <= wallet.balance)).map((value) => (
                    <Button
                      key={value}
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isPending}
                      onClick={() => setAmount(value.toString())}
                      className="h-8 rounded border-greyscale-700 bg-greyscale-800/80 px-3 text-xs text-greyscale-50 hover:bg-greyscale-700"
                    >
                      {value.toLocaleString(locale === "vi" ? "vi-VN" : "en-US")}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Note Input */}
            <div>
              <label className="text-sm font-medium text-greyscale-0">
                {locale === "vi" ? "Ghi chú" : "Note"} *
              </label>
              <Textarea
                placeholder={locale === "vi" ? "Nhập ghi chú (vd: lý do rút tiền)" : "Enter note (e.g., reason for withdrawal)"}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={isPending}
                rows={3}
                className="mt-2"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-2 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => setOpenDialog(false)}
                disabled={isPending}
              >
                {locale === "vi" ? "Huỷ" : "Cancel"}
              </Button>
              <Button
                onClick={handleSubmitWithdraw}
                disabled={isPending}
              >
                {isPending ? "..." : locale === "vi" ? "Tạo yêu cầu" : "Create Request"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
