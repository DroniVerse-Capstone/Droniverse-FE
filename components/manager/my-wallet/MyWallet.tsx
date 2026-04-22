"use client";

import React from "react";
import { AxiosError } from "axios";
import toast from "react-hot-toast";

import DropdownSearchBank from "@/components/manager/my-wallet/DropdownSearchBank";
import { Button } from "@/components/ui/button";
import ValueCard from "@/components/ui/value-card";
import { Copy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  useCreateWallet,
  useGetMyWallet,
  useUpdateWallet,
} from "@/hooks/wallet/useWallet";
import { IoIosSettings } from "react-icons/io";
import { MdContentCopy } from "react-icons/md";
import { LuWallet } from "react-icons/lu";

export default function MyWallet() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [bank, setBank] = React.useState("");
  const [bankNumber, setBankNumber] = React.useState("");

  const {
    data: wallet,
    isLoading: isWalletLoading,
    error: walletError,
  } = useGetMyWallet();
  const createWalletMutation = useCreateWallet();
  const updateWalletMutation = useUpdateWallet();

  const isWalletNotFound =
    walletError instanceof AxiosError && walletError.response?.status === 404;

  const isSubmitting =
    createWalletMutation.isPending || updateWalletMutation.isPending;
  const hasWallet = Boolean(wallet);

  React.useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    setBank(wallet?.bank ?? "");
    setBankNumber(wallet?.bankNumber ?? "");
  }, [isModalOpen, wallet?.bank, wallet?.bankNumber]);

  const handleSaveWallet = async () => {
    const payload = {
      bank: bank.trim(),
      bankNumber: bankNumber.trim(),
    };

    if (!payload.bank || !payload.bankNumber) {
      toast.error("Vui lòng chọn ngân hàng và nhập số tài khoản");
      return;
    }

    try {
      if (wallet?.walletID) {
        const response = await updateWalletMutation.mutateAsync({
          id: wallet.walletID,
          data: payload,
        });
        toast.success(response.message);
      } else {
        const response = await createWalletMutation.mutateAsync(payload);
        toast.success(response.message);
      }

      setIsModalOpen(false);
    } catch (error) {
      const errorMessage =
        error instanceof AxiosError
          ? (error.response?.data?.message ?? "Không thể lưu thông tin ví")
          : "Không thể lưu thông tin ví";

      toast.error(errorMessage);
    }
  };

  // Helper: mask account number for display (show first 4 and last 4)
  const maskAccount = (acct?: string) => {
    if (!acct) return "—";
    const s = acct.replace(/\s+/g, "");
    if (s.length <= 8) return s;
    const start = s.slice(0, 4);
    const end = s.slice(-4);
    return `${start} •••• ${end}`;
  };

  // Helper: copy text to clipboard with toast
  const copyToClipboard = async (text?: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Đã sao chép số tài khoản");
    } catch (e) {
      toast.error("Không thể sao chép");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold text-greyscale-0">Ví của tôi</h2>
        <Button
          variant={"secondary"}
          icon={<IoIosSettings size={20} />}
          type="button"
          onClick={() => setIsModalOpen(true)}
        >
          Thiết lập
        </Button>
      </div>

      {isWalletLoading ? (
        <div className="flex items-center gap-2 rounded border border-greyscale-700 bg-greyscale-900 p-4 text-greyscale-50">
          <Spinner className="h-4 w-4" />
          Đang tải thông tin ví...
        </div>
      ) : wallet ? (
        <div className="rounded-xl border border-greyscale-700 bg-greyscale-900 p-4 flex items-center justify-between gap-4 hover:border-greyscale-500 transition">
          {/* LEFT */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Bank logo */}
            <div className="w-15 h-15 rounded-lg overflow-hidden bg-white flex items-center justify-center">
              <LuWallet size={35} className="text-greyscale-800" />
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
              <div className="text-sm text-greyscale-50 mt-1 truncate">
                {wallet.bank}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="text-right">
            <div className="text-xl font-semibold text-greyscale-0">
              {wallet.balance.toLocaleString("vi-VN")} đ
            </div>
            <div className="text-xs text-greyscale-100 mt-1">Số dư</div>
          </div>
        </div>
      ) : isWalletNotFound ? (
        <div className="rounded border border-dashed border-greyscale-600 bg-greyscale-900 p-4 text-sm text-greyscale-50">
          Bạn chưa thiết lập ví. Nhấn nút Thiết lập để tạo ví.
        </div>
      ) : (
        <div className="rounded border border-primary-300/40 bg-primary-300/10 p-4 text-sm text-primary-100">
          Không thể tải thông tin ví. Vui lòng thử lại sau.
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {hasWallet ? "Cập nhật thông tin ví" : "Thiết lập ví"}
            </DialogTitle>
            <DialogDescription>
              Chọn ngân hàng và nhập số tài khoản để{" "}
              {hasWallet ? "cập nhật" : "tạo"} ví.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Ngân hàng</Label>
              <DropdownSearchBank
                value={bank}
                onChange={setBank}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="wallet-bank-number">Số tài khoản</Label>
              <Input
                id="wallet-bank-number"
                type="text"
                placeholder="Nhập số tài khoản"
                value={bankNumber}
                onChange={(event) => setBankNumber(event.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={() => void handleSaveWallet()}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang lưu..." : "Lưu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
