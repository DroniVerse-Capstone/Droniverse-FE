"use client";

import React from "react";
import { LuWallet } from "react-icons/lu";
import { MdContentCopy } from "react-icons/md";
import toast from "react-hot-toast";

interface WalletInfoCardProps {
  wallet: {
    ownerName: string;
    bankNumber: string;
    bank: string;
    balance: number;
  };
}

export function WalletInfoCard({ wallet }: WalletInfoCardProps) {
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
      </div>
    </div>
  );
}
