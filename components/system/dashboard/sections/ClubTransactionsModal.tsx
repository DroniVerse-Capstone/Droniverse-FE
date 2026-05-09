"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Hexagon, ChevronLeft, ChevronRight, Wallet, BookOpen } from "lucide-react";
import { useGetAdminDetailClubTransactions } from "@/hooks/dashboard/useDashboard";
import { AdminDetailClubOverview } from "@/validations/dashboard/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocale } from "@/providers/i18n-provider";
import Image from "next/image";

const formatVND = (v: number, locale: string) => {
  const formatted = new Intl.NumberFormat(locale === "en" ? "en-US" : "vi-VN", {
    maximumFractionDigits: 0,
  }).format(v);
  return locale === "en" ? `${formatted} VND` : `${formatted} ₫`;
};

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  const time = d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  const date = d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  return { time, date };
};

interface ClubTransactionsModalProps {
  club: AdminDetailClubOverview;
  onClose: () => void;
}

export default function ClubTransactionsModal({ club, onClose }: ClubTransactionsModalProps) {
  const locale = useLocale();
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data: transactionsData, isLoading } = useGetAdminDetailClubTransactions(club.clubId, {
    page,
    pageSize,
  });

  const transactions = transactionsData?.data ?? [];
  const totalPages = transactionsData?.totalPages ?? 1;
  const totalRecords = transactionsData?.totalRecords ?? 0;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* BLURRED OVERLAY */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

        {/* MODAL */}
        <motion.div
          className="relative z-10 w-full max-w-4xl bg-[#1a1d24] rounded-2xl overflow-hidden shadow-2xl border border-white/[0.06] flex flex-col max-h-[85vh]"
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.97 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {/* HEADER */}
          <div className="flex items-start gap-4 px-6 py-5 border-b border-white/[0.05] shrink-0">
            <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center text-white/50 shrink-0">
              <Hexagon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-[16px] font-bold text-white leading-tight truncate">
                  {locale === "en" ? club.clubNameEN : club.clubNameVN}
                </h3>
                {totalRecords > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-white/[0.08] text-[11px] font-bold text-white/60 whitespace-nowrap">
                    {totalRecords} {locale === "en" ? "transactions" : "giao dịch"}
                  </span>
                )}
              </div>
              <p className="text-[12px] text-white/30 truncate">
                {locale === "en" ? "Club Transactions History" : "Lịch sử giao dịch Câu lạc bộ"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-white/40 hover:text-white transition-all active:scale-90 shrink-0"
            >
              <X size={14} />
            </button>
          </div>

          {/* TABLE HEADER */}
          <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1.5fr)_auto_auto] gap-6 px-6 py-3 border-b border-white/[0.04] bg-white/[0.01] shrink-0">
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{locale === "en" ? "Member" : "Học viên"}</span>
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{locale === "en" ? "Course" : "Khóa học"}</span>
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest w-[110px]">{locale === "en" ? "Time" : "Thời gian"}</span>
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest text-right min-w-[90px]">{locale === "en" ? "Amount" : "Số tiền"}</span>
          </div>

          {/* LIST */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="divide-y divide-white/[0.03]">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1.5fr)_auto_auto] gap-6 px-6 py-4 items-center">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-full bg-white/[0.04] shrink-0" />
                      <div className="space-y-1.5 w-full">
                        <Skeleton className="h-3.5 w-24 bg-white/[0.04] rounded" />
                        <Skeleton className="h-3 w-32 bg-white/[0.04] rounded" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-lg bg-white/[0.04] shrink-0" />
                      <Skeleton className="h-3.5 w-full max-w-[140px] bg-white/[0.04] rounded" />
                    </div>
                    <div className="w-[110px] space-y-1.5">
                      <Skeleton className="h-3.5 w-20 bg-white/[0.04] rounded" />
                      <Skeleton className="h-3 w-12 bg-white/[0.04] rounded" />
                    </div>
                    <Skeleton className="h-4 w-20 bg-white/[0.04] rounded justify-self-end" />
                  </div>
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="py-24 flex flex-col items-center justify-center">
                <Wallet size={32} className="text-white/10 mb-4" />
                <p className="text-[13px] text-white/30 font-medium">
                  {locale === "en" ? "No transactions found for this club." : "Câu lạc bộ này chưa có giao dịch nào."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.03]">
                {transactions.map((tx, idx) => {
                  const { date, time } = formatDateTime(tx.transactionDate);
                  return (
                    <motion.div
                      key={`${tx.user.userId}-${tx.courseId}-${idx}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.15, delay: idx * 0.03 }}
                      className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1.5fr)_auto_auto] gap-6 items-center px-6 py-4 hover:bg-white/[0.02] transition-colors"
                    >
                      {/* USER INFO */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-white/[0.05] border border-white/[0.05] shrink-0 relative flex items-center justify-center">
                          {tx.user.avatarUrl ? (
                            <Image src={tx.user.avatarUrl} alt={tx.user.fullName} fill className="object-cover" unoptimized />
                          ) : (
                            <span className="text-[12px] font-bold text-white/40">{tx.user.fullName.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-white truncate">{tx.user.fullName}</p>
                          <p className="text-[11px] text-white/30 truncate mt-0.5">{tx.user.email}</p>
                        </div>
                      </div>

                      {/* COURSE INFO */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg overflow-hidden bg-white/[0.05] border border-white/[0.05] shrink-0 relative flex items-center justify-center">
                          {tx.courseImageUrl ? (
                            <Image src={tx.courseImageUrl} alt="Course" fill className="object-cover" unoptimized />
                          ) : (
                            <BookOpen size={14} className="text-white/20" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium text-white/80 line-clamp-2 leading-snug">
                            {locale === "en" ? tx.courseNameEN : tx.courseNameVN}
                          </p>
                        </div>
                      </div>

                      {/* TIME */}
                      <div className="w-[110px]">
                        <p className="text-[13px] font-medium text-white">{date}</p>
                        <p className="text-[11px] text-white/30 mt-0.5">{time}</p>
                      </div>

                      {/* AMOUNT */}
                      <div className="text-right min-w-[90px]">
                        <p className="text-[13px] font-bold text-emerald-400 tabular-nums">
                          +{formatVND(tx.amount, locale)}
                        </p>
                        <div className="inline-flex items-center px-1.5 py-0.5 rounded mt-1 bg-emerald-500/10 text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
                          {locale === "en" ? "Success" : "Thành công"}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.04] bg-white/[0.01] shrink-0">
              <span className="text-[11px] text-white/30 font-medium">
                {locale === "en" ? `Page ${page} of ${totalPages}` : `Trang ${page} / ${totalPages}`}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/10 text-white/50 hover:bg-white/[0.05] hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/10 text-white/50 hover:bg-white/[0.05] hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
