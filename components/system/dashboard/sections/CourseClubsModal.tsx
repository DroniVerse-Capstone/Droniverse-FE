"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, ChevronLeft, ChevronRight, Building2, MessageSquare, Star } from "lucide-react";
import { useGetAdminDetailCourseClubs, useGetCourseFeedbacks } from "@/hooks/dashboard/useDashboard";
import { AdminDetailCourse } from "@/validations/dashboard/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useLocale } from "@/providers/i18n-provider";
import Image from "next/image";

const formatVND = (v: number, locale: string) => {
  const formatted = new Intl.NumberFormat(locale === "en" ? "en-US" : "vi-VN", {
    maximumFractionDigits: 0,
  }).format(v);
  return locale === "en" ? `${formatted} VND` : `${formatted} ₫`;
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

type Tab = "clubs" | "feedbacks";

interface CourseClubsModalProps {
  course: AdminDetailCourse;
  onClose: () => void;
}

export default function CourseClubsModal({ course, onClose }: CourseClubsModalProps) {
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<Tab>("clubs");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data: clubsData, isLoading: isClubsLoading } = useGetAdminDetailCourseClubs(course.courseId, { pageIndex: page, pageSize });
  const { data: feedbacks, isLoading: isFeedbacksLoading } = useGetCourseFeedbacks(course.courseId);

  const clubs = clubsData?.data ?? [];
  const totalPages = clubsData?.totalPages ?? 1;
  const totalRecords = clubsData?.totalRecords ?? 0;

  const tabs: { key: Tab; label: string; labelVN: string; count?: number }[] = [
    { key: "clubs", label: "Clubs", labelVN: "Câu lạc bộ", count: totalRecords },
    { key: "feedbacks", label: "Feedbacks", labelVN: "Đánh giá", count: feedbacks?.length },
  ];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* BLURRED OVERLAY */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />

        {/* MODAL */}
        <motion.div
          className="relative z-10 w-full max-w-xl bg-[#1a1d24] rounded-2xl overflow-hidden shadow-2xl border border-white/[0.06]"
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.97 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {/* HEADER */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-white/[0.05]">
            <div className="w-9 h-9 rounded-xl bg-white/[0.05] flex items-center justify-center text-white/50 shrink-0">
              <Building2 size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-bold text-white leading-tight">
                {locale === "en" ? course.titleEN : course.titleVN}
              </p>
              <p className="text-[11px] text-white/30 mt-0.5">
                {locale === "en" ? "Course Analytics Detail" : "Chi tiết phân tích khóa học"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-white/40 hover:text-white transition-all active:scale-90"
            >
              <X size={14} />
            </button>
          </div>

          {/* TAB NAV */}
          <div className="flex gap-1 px-6 pt-4 pb-0">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setPage(1); }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold transition-all",
                  activeTab === tab.key
                    ? "bg-white/[0.08] text-white"
                    : "text-white/30 hover:text-white/60 hover:bg-white/[0.03]"
                )}
              >
                {tab.key === "clubs" ? <Building2 size={13} /> : <MessageSquare size={13} />}
                {locale === "en" ? tab.label : tab.labelVN}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-white/[0.08] text-[10px] font-bold text-white/50">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ────── CLUBS TAB ────── */}
          {activeTab === "clubs" && (
            <>
              {!isClubsLoading && clubs.length > 0 && (
                <div className="grid grid-cols-[1fr_auto_auto] gap-6 px-6 py-3 mt-3 border-y border-white/[0.04]">
                  <span className="text-[10px] font-bold text-white/25 uppercase tracking-widest">{locale === "en" ? "Club" : "Câu lạc bộ"}</span>
                  <span className="text-[10px] font-bold text-white/25 uppercase tracking-widest text-right min-w-[90px]">{locale === "en" ? "Revenue" : "Doanh thu"}</span>
                  <span className="text-[10px] font-bold text-white/25 uppercase tracking-widest text-right min-w-[50px]">{locale === "en" ? "Learners" : "Lượt học"}</span>
                </div>
              )}
              <div className="max-h-[380px] overflow-y-auto">
                {isClubsLoading ? (
                  <div className="divide-y divide-white/[0.03]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-4 px-6 py-4">
                        <Skeleton className="w-8 h-8 rounded-full bg-white/[0.04] shrink-0" />
                        <Skeleton className="h-3.5 flex-1 bg-white/[0.04] rounded" />
                        <Skeleton className="h-3.5 w-20 bg-white/[0.04] rounded" />
                        <Skeleton className="h-3.5 w-8 bg-white/[0.04] rounded" />
                      </div>
                    ))}
                  </div>
                ) : clubs.length === 0 ? (
                  <div className="py-16 flex flex-col items-center justify-center">
                    <Shield size={28} className="text-white/10 mb-3" />
                    <p className="text-[12px] text-white/25 font-medium">{locale === "en" ? "No clubs enrolled yet." : "Chưa có CLB nào đăng ký."}</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/[0.03]">
                    {clubs.map((club, idx) => (
                      <motion.div
                        key={club.clubId}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.04 }}
                        className="grid grid-cols-[1fr_auto_auto] gap-6 items-center px-6 py-4 hover:bg-white/[0.02] transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-white/[0.05] border border-white/[0.05] shrink-0 relative">
                            {club.imageUrl ? (
                              <Image src={club.imageUrl} alt={club.clubNameEN} fill className="object-cover" unoptimized />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white/10"><Shield size={14} /></div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-semibold text-white truncate">{locale === "en" ? club.clubNameEN : club.clubNameVN}</p>
                            <p className="text-[10px] text-white/25 uppercase tracking-widest font-medium">{locale === "en" ? "Club" : "Câu lạc bộ"}</p>
                          </div>
                        </div>
                        <p className="text-[13px] font-bold text-white tabular-nums text-right min-w-[90px]">{formatVND(club.totalRevenue, locale)}</p>
                        <p className="text-[13px] font-bold text-white tabular-nums text-right min-w-[50px]">{club.totalLearners.toLocaleString()}</p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.04]">
                  <span className="text-[11px] text-white/25">{locale === "en" ? `Page ${page} / ${totalPages}` : `Trang ${page} / ${totalPages}`}</span>
                  <div className="flex gap-1.5">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-7 h-7 rounded-lg border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.05] disabled:opacity-20 disabled:cursor-not-allowed transition-all"><ChevronLeft size={13} /></button>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-7 h-7 rounded-lg border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.05] disabled:opacity-20 disabled:cursor-not-allowed transition-all"><ChevronRight size={13} /></button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ────── FEEDBACKS TAB ────── */}
          {activeTab === "feedbacks" && (
            <div className="max-h-[430px] overflow-y-auto">
              {isFeedbacksLoading ? (
                <div className="divide-y divide-white/[0.03]">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="px-6 py-5 space-y-2">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-8 h-8 rounded-full bg-white/[0.04] shrink-0" />
                        <Skeleton className="h-3.5 w-28 bg-white/[0.04] rounded" />
                      </div>
                      <Skeleton className="h-3 w-full bg-white/[0.04] rounded" />
                      <Skeleton className="h-3 w-2/3 bg-white/[0.04] rounded" />
                    </div>
                  ))}
                </div>
              ) : !feedbacks || feedbacks.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center">
                  <MessageSquare size={28} className="text-white/10 mb-3" />
                  <p className="text-[12px] text-white/25 font-medium">{locale === "en" ? "No feedback yet." : "Chưa có đánh giá nào."}</p>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.03]">
                  {feedbacks.map((fb, idx) => (
                    <motion.div
                      key={fb.feedbackID}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.04 }}
                      className="px-6 py-5 hover:bg-white/[0.015] transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-white/[0.05] border border-white/[0.05] shrink-0 relative">
                            {fb.user.avatarUrl ? (
                              <Image src={fb.user.avatarUrl} alt={fb.user.fullName} fill className="object-cover" unoptimized />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[11px] font-bold text-white/30">
                                {fb.user.fullName.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-semibold text-white truncate">{fb.user.fullName}</p>
                            <p className="text-[10px] text-white/25 truncate">{fb.user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} size={11} className={cn(i < fb.rating ? "text-amber-400 fill-amber-400" : "text-white/10")} />
                            ))}
                          </div>
                          <span className="text-[11px] text-white/25">{formatDate(fb.createAt)}</span>
                        </div>
                      </div>
                      {fb.content && (
                        <p className="text-[12px] text-white/50 leading-relaxed pl-11">{fb.content}</p>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
