"use client";

import React from "react";
import { AdminLearningStatistics } from "@/validations/dashboard/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useTranslations } from "@/providers/i18n-provider";
import { BookOpen, CheckCircle2 } from "lucide-react";

interface Props {
  data?: AdminLearningStatistics["courseStats"];
  isLoading: boolean;
}

export default function AdminCourseLearningSection({ data, isLoading }: Props) {
  const t = useTranslations("SystemDashboard.learningStatistics.courseStats");

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-3">
            <Skeleton className="h-3 w-40 bg-white/[0.04]" />
            <div className="flex gap-4">
              <Skeleton className="h-2 w-16 bg-white/[0.04]" />
              <Skeleton className="h-2 w-16 bg-white/[0.04]" />
            </div>
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
      {data.map((course, i) => (
        <motion.div
          key={course.courseId}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, delay: i * 0.05 }}
          className="p-4 rounded-xl bg-[#1e2130]/30 border border-white/[0.04] hover:bg-[#1e2130]/50 transition-all group"
        >
          <h4 className="text-[12px] font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
            {course.courseName}
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-[10px] text-[#6a7080]">
                <BookOpen size={10} />
                <span>{t("enrollments", { count: course.enrollments })}</span>
              </div>
              <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500/50 rounded-full"
                  style={{ width: `${Math.min(course.enrollments * 10, 100)}%` }} // Arbitrary max for visualization
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-[10px] text-[#6a7080]">
                <CheckCircle2 size={10} className="text-emerald-500" />
                <span>{t("completion", { percent: course.completionRate })}</span>
              </div>
              <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${course.completionRate}%` }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
