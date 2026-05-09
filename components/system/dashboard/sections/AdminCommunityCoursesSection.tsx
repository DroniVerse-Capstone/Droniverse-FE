"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Users,
  Star,
  ChevronRight,
  TrendingUp,
  Search,
} from "lucide-react";
import { useGetAdminDetailCourses } from "@/hooks/dashboard/useDashboard";
import { AdminDetailCourse } from "@/validations/dashboard/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useLocale } from "@/providers/i18n-provider";
import Image from "next/image";
import CourseClubsModal from "./CourseClubsModal";

const formatVND = (v: number, locale: string) => {
  const formatted = new Intl.NumberFormat(locale === "en" ? "en-US" : "vi-VN", {
    maximumFractionDigits: 0,
  }).format(v);
  return locale === "en" ? `${formatted} VND` : `${formatted} ₫`;
};

interface AdminCommunityCoursesSectionProps {
  page: number;
  pageSize: number;
}

export default function AdminCommunityCoursesSection({ page, pageSize }: AdminCommunityCoursesSectionProps) {
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<AdminDetailCourse | null>(null);
  const { data: paginatedData, isLoading } = useGetAdminDetailCourses({ pageIndex: page, pageSize });

  const filteredCourses = useMemo(() => {
    if (!paginatedData?.data) return [];
    return paginatedData.data.filter(course =>
      course.titleEN.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.titleVN.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [paginatedData, searchQuery]);

  return (
    <div className="space-y-6">
      {/* SEARCH BAR */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-greyscale-600" size={16} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={locale === "en" ? "Search courses..." : "Tìm khóa học..."}
          className="w-full bg-[#181b22] border border-white/[0.05] rounded py-3 pl-11 pr-4 text-[13px] text-white focus:outline-none focus:border-blue-500/50 transition-all"
        />
      </div>

      {/* COURSE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-[#181b22] border border-white/[0.07] rounded-3xl p-5 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-full bg-white/[0.06]" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 bg-white/[0.06]" />
                  <Skeleton className="h-3 w-32 bg-white/[0.06]" />
                </div>
              </div>
              <Skeleton className="h-12 w-full rounded-2xl bg-white/[0.06]" />
            </div>
          ))
        ) : (
          filteredCourses.map((course, idx) => (
            <motion.div
              key={course.courseId}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: idx * 0.03 }}
              className="group bg-[#181b22] border border-white/[0.07] hover:border-white/[0.15] rounded p-5 transition-all duration-300 flex flex-col"
            >
              {/* HEADER: CIRCULAR THUMBNAIL & TITLE */}
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-[#242835] border border-white/[0.05] shrink-0 relative">
                  {course.imageUrl ? (
                    <Image
                      src={course.imageUrl}
                      alt={course.titleEN}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/10">
                      <BookOpen size={20} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[14px] font-bold text-white line-clamp-2 leading-snug mb-1 min-h-[40px] flex items-center">
                    {locale === "en" ? course.titleEN : course.titleVN}
                  </h4>
                  <div className="flex items-center gap-1.5">
                    <Star size={10} className={cn(course.averageRating > 0 ? "text-amber-400 fill-amber-400" : "text-[#5a6070]")} />
                    <span className="text-[10px] text-[#5a6070] font-bold">{course.averageRating.toFixed(1)} Rating</span>
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
                <span className="text-[14px] font-bold text-white">{formatVND(course.totalRevenue, locale)}</span>
              </div>

              {/* ENROLLMENT BLOCK */}
              <div className="bg-[#111318]/50 rounded-3xl p-4 mb-5 flex items-center justify-between border border-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <Users size={16} />
                  </div>
                  <span className="text-[11px] text-[#5a6070] font-bold uppercase tracking-wider">
                    {locale === "en" ? "Learners" : "Lượt học"}
                  </span>
                </div>
                <span className="text-[14px] font-bold text-white">{course.totalLearners.toLocaleString()}</span>
              </div>

              {/* BUTTON → opens modal */}
              <button
                onClick={() => setSelectedCourse(course)}
                className="w-full bg-[#1c2029] hover:bg-[#242835] border border-white/[0.05] text-[12px] font-bold text-white py-3.5 rounded transition-all flex items-center justify-center gap-2 group/btn active:scale-95"
              >
                <BookOpen size={16} className="text-[#3b82f6]" />
                {locale === "en" ? "View Analytics" : "Xem báo cáo"}
                <ChevronRight size={14} className="ml-1 opacity-50 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          ))
        )}
      </div>

      {!isLoading && filteredCourses.length === 0 && (
        <div className="py-20 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-[32px]">
          <p className="text-greyscale-600 text-[13px] font-medium">
            {locale === "en" ? "No courses found" : "Không tìm thấy khóa học"}
          </p>
        </div>
      )}

      {/* COURSE CLUBS MODAL */}
      {selectedCourse && (
        <CourseClubsModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
        />
      )}
    </div>
  );
}
