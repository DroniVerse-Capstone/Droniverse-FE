"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Users, Wallet, Trophy } from "lucide-react";
import { useGetClubDetailById } from "@/hooks/club/useClub";
import { useGetMyWallet } from "@/hooks/wallet/useWallet";
import { useGetClubCompetitionStats } from "@/hooks/dashboard/useDashboard";
import { useLocale, useTranslations } from "@/providers/i18n-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

type ManagerClubInfoProps = {
  clubId?: string;
};

export default function ManagerClubInfo({ clubId }: ManagerClubInfoProps) {
  const t = useTranslations("ClubDetail.ClubInfo");
  const locale = useLocale();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const { data: club, isLoading, isError } = useGetClubDetailById(clubId);
  const { data: wallet, isLoading: isWalletLoading, error: walletError } = useGetMyWallet();
  const { data: competitionStats } = useGetClubCompetitionStats(clubId, 1);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={mounted ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between bg-[#181b22] border border-white/[0.07] p-6 rounded-2xl"
      >
        <div className="flex gap-6 items-center">
          <Skeleton className="h-20 w-20 rounded-2xl bg-white/[0.05]" />
          <div className="space-y-3">
            <Skeleton className="h-7 w-56 bg-white/[0.05]" />
            <Skeleton className="h-4 w-32 bg-white/[0.05]" />
          </div>
        </div>
      </motion.div>
    );
  }

  if (isError || !club) return null;

  const clubName = locale === "en" ? club.nameEN || club.nameVN : club.nameVN;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={mounted ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4 }}
      className="bg-[#181b22] border border-white/[0.07] rounded-2xl p-6"
    >
      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
        {/* Club Info */}
        <div className="flex items-center gap-5 flex-1">
          {/* Club Avatar */}
          <div className="h-20 w-20 rounded-2xl overflow-hidden border border-white/[0.07] shrink-0">
            <Image
              src={club.imageUrl || "/images/club-placeholder.jpg"}
              alt={clubName}
              width={80}
              height={80}
              className="object-cover w-full h-full"
            />
          </div>

          <div className="space-y-2">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">{clubName}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-[#6a7080]">Mã CLB:</span>
                <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  {club.clubCode}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Widgets */}
        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          {/* Member Widget */}
          <div className="flex-1 lg:flex-none min-w-[140px] bg-[#1e2130] border border-white/[0.07] p-4 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                <Users size={16} />
              </div>
              <p className="text-[10px] text-[#6a7080] uppercase tracking-widest font-bold">Thành viên</p>
            </div>
            <p className="text-xl font-bold text-white tracking-tight">{club.totalMembers.toLocaleString("vi-VN")}</p>
          </div>

          {/* Wallet Widget */}
          <div className="flex-1 lg:flex-none min-w-[160px] bg-[#1e2130] border border-white/[0.07] p-4 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Wallet size={16} />
              </div>
              <p className="text-[10px] text-[#6a7080] uppercase tracking-widest font-bold">Số dư ví</p>
            </div>
            <p className="text-xl font-bold text-white tracking-tight">
              {isWalletLoading ? "---" : wallet ? `${wallet.balance.toLocaleString("vi-VN")} đ` : "Chưa có ví"}
            </p>
          </div>

          {/* Competitions Widget */}
          <div className="flex-1 lg:flex-none min-w-[140px] bg-[#1e2130] border border-white/[0.07] p-4 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                <Trophy size={16} />
              </div>
              <p className="text-[10px] text-[#6a7080] uppercase tracking-widest font-bold">Cuộc thi</p>
            </div>
            <p className="text-xl font-bold text-white tracking-tight">
              {competitionStats?.overview.totalCompetitions || 0}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
