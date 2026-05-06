"use client";

import React from "react";
import { AdminLearningStatistics } from "@/validations/dashboard/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useTranslations } from "@/providers/i18n-provider";

interface Props {
  data?: AdminLearningStatistics["topClubs"];
  isLoading: boolean;
}

export default function AdminTopClubsLearningSection({ data, isLoading }: Props) {
  const t = useTranslations("SystemDashboard.learningStatistics.topClubs");

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl bg-white/[0.04]" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-32 bg-white/[0.04]" />
              <Skeleton className="h-2 w-20 bg-white/[0.04]" />
            </div>
            <Skeleton className="h-4 w-12 bg-white/[0.04]" />
          </div>
        ))}
      </div>
    );
  }

  if (!data?.length) {
    return <p className="text-[12px] text-[#6a7080] py-4">No data available</p>;
  }

  return (
    <div className="space-y-3">
      {data.map((club, i) => (
        <motion.div
          key={club.clubId}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: i * 0.05 }}
          className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-all"
        >
          {/* Avatar */}
          <div className="w-10 h-10 rounded-xl border border-white/[0.07] overflow-hidden bg-[#1e2130] flex-shrink-0">
            {club.clubImageUrl ? (
              <Image
                src={club.clubImageUrl}
                alt={club.clubName}
                width={40}
                height={40}
                className="object-cover w-full h-full"
                unoptimized
              />
            ) : (
              <div className="w-full h-full bg-[#232730] flex items-center justify-center text-xs font-bold text-[#6a7080]">
                {club.clubName.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-[12px] font-bold text-white truncate">{club.clubName}</h4>
            <p className="text-[10px] text-[#6a7080] mt-0.5">{t("members", { count: club.membersCount })}</p>
          </div>

          <div className="text-right">
            <div className="text-[12px] font-bold text-emerald-400">
              {club.avgProgress.toFixed(1)}%
            </div>
            <div className="w-16 h-1 bg-white/[0.04] rounded-full mt-1.5 overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${club.avgProgress}%` }}
              />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
