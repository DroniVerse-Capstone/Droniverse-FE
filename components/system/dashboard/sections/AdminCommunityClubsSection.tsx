"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Hexagon, Users, TrendingUp, Search, ChevronRight } from "lucide-react";
import { useGetAdminDetailClubsOverview } from "@/hooks/dashboard/useDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useLocale } from "@/providers/i18n-provider";
import Image from "next/image";
import ClubTransactionsModal from "./ClubTransactionsModal";
import { AdminDetailClubOverview } from "@/validations/dashboard/dashboard";

const formatVND = (v: number, locale: string) => {
  const formatted = new Intl.NumberFormat(locale === "en" ? "en-US" : "vi-VN", {
    maximumFractionDigits: 0,
  }).format(v);
  return locale === "en" ? `${formatted} VND` : `${formatted} ₫`;
};

interface AdminCommunityClubsSectionProps {
  page: number;
  pageSize: number;
}

export default function AdminCommunityClubsSection({ page, pageSize }: AdminCommunityClubsSectionProps) {
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClub, setSelectedClub] = useState<AdminDetailClubOverview | null>(null);

  const { data: paginatedData, isLoading } = useGetAdminDetailClubsOverview({ pageIndex: page, pageSize });

  const filteredClubs = useMemo(() => {
    if (!paginatedData?.data) return [];
    return paginatedData.data.filter(club =>
      club.clubNameEN.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.clubNameVN.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [paginatedData, searchQuery]);

  return (
    <div className="space-y-6">
      {/* SEARCH */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-greyscale-600" size={16} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={locale === "en" ? "Search clubs..." : "Tìm câu lạc bộ..."}
          className="w-full bg-[#181b22] border border-white/[0.05] rounded py-3 pl-11 pr-4 text-[13px] text-white focus:outline-none focus:border-blue-500/50 transition-all"
        />
      </div>

      {/* CLUB GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-[#181b22] border border-white/[0.07] rounded-[32px] p-5 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-full bg-white/[0.06]" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 bg-white/[0.06]" />
                  <Skeleton className="h-3 w-16 bg-white/[0.06]" />
                </div>
              </div>
              <Skeleton className="h-12 w-full rounded-3xl bg-white/[0.06]" />
              <Skeleton className="h-12 w-full rounded-3xl bg-white/[0.06]" />
            </div>
          ))
        ) : (
          filteredClubs.map((club, idx) => (
            <motion.div
              key={club.clubId}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: idx * 0.03 }}
              className="group bg-[#181b22] border border-white/[0.07] hover:border-white/[0.15] rounded p-5 transition-all duration-300 flex flex-col"
            >
              {/* HEADER */}
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-[#242835] border border-white/[0.05] shrink-0 relative">
                  {club.imageUrl ? (
                    <Image src={club.imageUrl} alt={club.clubNameEN} fill className="object-cover" unoptimized />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/10">
                      <Hexagon size={20} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[14px] font-bold text-white line-clamp-2 leading-snug mb-1 min-h-[40px] flex items-center">
                    {locale === "en" ? club.clubNameEN : club.clubNameVN}
                  </h4>
                  <div className={cn(
                    "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[9px] font-bold uppercase tracking-wider",
                    club.status === "ACTIVE"     && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                    club.status === "INACTIVE"   && "bg-[#5a6070]/10 text-[#5a6070] border-[#5a6070]/20",
                    club.status === "SUSPENDED"  && "bg-rose-500/10 text-rose-400 border-rose-500/20",
                    club.status === "ARCHIVED"   && "bg-purple-500/10 text-purple-400 border-purple-500/20",
                  )}>
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      club.status === "ACTIVE"    && "bg-emerald-400",
                      club.status === "INACTIVE"  && "bg-[#5a6070]",
                      club.status === "SUSPENDED" && "bg-rose-400",
                      club.status === "ARCHIVED"  && "bg-purple-400",
                    )} />
                    {club.status === "ACTIVE"    && (locale === "en" ? "Active"    : "Hoạt động")}
                    {club.status === "INACTIVE"  && (locale === "en" ? "Inactive"  : "Không hoạt động")}
                    {club.status === "SUSPENDED" && (locale === "en" ? "Suspended" : "Tạm dừng")}
                    {club.status === "ARCHIVED"  && (locale === "en" ? "Archived"  : "Đã lưu trữ")}
                  </div>
                </div>
              </div>

              {/* REVENUE BLOCK */}
              <div className="bg-[#111318]/50 rounded-3xl p-4 mb-2 flex items-center justify-between border border-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <TrendingUp size={16} />
                  </div>
                  <span className="text-[11px] text-[#5a6070] font-bold uppercase tracking-wider">
                    {locale === "en" ? "Revenue" : "Doanh thu"}
                  </span>
                </div>
                <span className="text-[14px] font-bold text-white">{formatVND(club.totalRevenue, locale)}</span>
              </div>

              {/* MEMBERS BLOCK */}
              <div className="bg-[#111318]/50 rounded-3xl p-4 mb-5 flex items-center justify-between border border-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <Users size={16} />
                  </div>
                  <span className="text-[11px] text-[#5a6070] font-bold uppercase tracking-wider">
                    {locale === "en" ? "Members" : "Thành viên"}
                  </span>
                </div>
                <span className="text-[14px] font-bold text-white">{club.totalMembers.toLocaleString()}</span>
              </div>

              {/* BUTTON */}
              <button 
                onClick={() => setSelectedClub(club)}
                className="w-full bg-[#1c2029] hover:bg-[#242835] border border-white/[0.05] text-[12px] font-bold text-white py-3.5 rounded transition-all flex items-center justify-center gap-2 group/btn active:scale-95 mt-auto"
              >
                <Hexagon size={14} className="text-blue-400" />
                {locale === "en" ? "View Transactions" : "Xem giao dịch"}
                <ChevronRight size={14} className="ml-1 opacity-50 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          ))
        )}
      </div>

      {!isLoading && filteredClubs.length === 0 && (
        <div className="py-20 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-[32px]">
          <p className="text-greyscale-600 text-[13px] font-medium">
            {locale === "en" ? "No clubs found" : "Không tìm thấy câu lạc bộ"}
          </p>
        </div>
      )}

      {/* MODAL */}
      {selectedClub && (
        <ClubTransactionsModal
          club={selectedClub}
          onClose={() => setSelectedClub(null)}
        />
      )}
    </div>
  );
}
