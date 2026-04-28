"use client";

import React from "react";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import WithdrawHistory from "@/components/manager/withdraw-history/WithdrawHistory";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  useCreateWallet,
  useGetMyWallet,
  useUpdateWallet,
} from "@/hooks/wallet/useWallet";
import { IoIosSettings } from "react-icons/io";
import { LuWallet } from "react-icons/lu";
import { WalletSidebar, type TabType } from "./WalletSidebar";
import { WalletInfoCard } from "./WalletInfoCard";
import { WalletSetupDialog } from "./WalletSetupDialog";

export default function MyWallet() {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<TabType>("wallet");
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

  return (
    <div className="grid grid-cols-1 bg-greyscale-800 bg-(image:--bg-pattern-grid) bg-repeat bg-size-[100px_100px] gap-6 md:grid-cols-[280px_1fr] px-4 py-6">
      {/* Sidebar */}
      <WalletSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Content */}
      <div className="flex flex-col gap-6 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-10 w-10 rounded-xl bg-greyscale-800 hover:bg-greyscale-700 text-greyscale-100 border border-greyscale-700 transition-all"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-2xl font-semibold text-greyscale-0">
              {activeTab === "wallet" ? "Ví của tôi" : "Lịch sử rút tiền"}
            </h2>
          </div>
          {activeTab === "wallet" && (
            <Button
              variant={"secondary"}
              icon={<IoIosSettings size={20} />}
              type="button"
              onClick={() => setIsModalOpen(true)}
            >
              Thiết lập
            </Button>
          )}
        </div>

        <div className="flex-1">
          {activeTab === "wallet" ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {isWalletLoading ? (
                <div className="flex items-center gap-2 rounded border border-greyscale-700 bg-greyscale-900 p-4 text-greyscale-50">
                  <Spinner className="h-4 w-4" />
                  Đang tải thông tin ví...
                </div>
              ) : wallet ? (
                <div>
                  <WalletInfoCard wallet={wallet} />
                </div>
              ) : isWalletNotFound ? (
                <div className="rounded-lg border border-dashed border-greyscale-600 bg-greyscale-900/50 p-8 text-center text-sm text-greyscale-100">
                  <LuWallet
                    size={40}
                    className="mx-auto mb-4 text-greyscale-500 opacity-50"
                  />
                  <p>
                    {" "}
                    Bạn chưa thiết lập ví. Nhấn nút <strong>
                      Thiết lập
                    </strong>{" "}
                    để tạo ví và bắt đầu giao dịch.{" "}
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-400">
                  Không thể tải thông tin ví. Vui lòng thử lại sau.
                </div>
              )}
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <WithdrawHistory />
            </div>
          )}
        </div>
      </div>

      <WalletSetupDialog
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        hasWallet={hasWallet}
        bank={bank}
        setBank={setBank}
        bankNumber={bankNumber}
        setBankNumber={setBankNumber}
        isSubmitting={isSubmitting}
        onSave={() => void handleSaveWallet()}
      />
    </div>
  );
}
