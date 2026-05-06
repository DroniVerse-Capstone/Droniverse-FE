"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { useGetLearningPath } from "@/hooks/enrollment/useClubEnrollment";
import { useLocale } from "@/providers/i18n-provider";
import { IoTimeOutline, IoChevronDownOutline, IoChevronUpOutline } from "react-icons/io5";
import { 
  MdOutlinePlayLesson, 
  MdCheckCircle, 
  MdLock, 
  MdOutlineMenuBook,
  MdOutlineQuiz,
  MdOutlineVrpano,
  MdOutlineScience,
  MdOutlineSettingsSuggest,
  MdOutlineHardware
} from "react-icons/md";
import { useTranslations } from "@/providers/i18n-provider";
import { cn } from "@/lib/utils";
import { LearningPathModule, LearningPathLesson } from "@/validations/enrollment/club-enrollment";

interface ManagerLearningPathDialogProps {
  enrollmentId: string | null;
  onClose: () => void;
  userName: string;
}

export default function ManagerLearningPathDialog({
  enrollmentId,
  onClose,
  userName,
}: ManagerLearningPathDialogProps) {
  const locale = useLocale();
  const { data, isLoading } = useGetLearningPath(enrollmentId || undefined, !!enrollmentId);
  const [expandedModules, setExpandedModules] = React.useState<Set<string>>(new Set());

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  const t = useTranslations("ManagerLearningProgress");

  return (
    <Dialog open={!!enrollmentId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-[#181b22] border-white/[0.07] text-greyscale-50">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center justify-between">
            <span>{t("detail.title")}: {userName}</span>
            {data && (
              <Badge variant="outline" className={cn(
                "ml-2 px-3 py-1",
                data.status === "COMPLETED" ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10" : "border-blue-500/50 text-blue-400 bg-blue-500/10"
              )}>
                {t(`statuses.${data.status}`) || data.status}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner className="h-8 w-8 text-primary" />
          </div>
        ) : data ? (
          <div className="space-y-6 mt-4">
            {/* Overview Card */}
            <div className="rounded-2xl bg-[#0f1014] p-5 border border-white/[0.05]">
              <h3 className="text-lg font-bold text-white mb-2">
                {locale === "vi" ? data.titleVN : data.titleEN}
              </h3>
              <div className="flex items-center gap-4 text-sm text-[#7a8090]">
                <span className="flex items-center gap-1.5">
                  <MdOutlinePlayLesson className="text-primary h-4 w-4" />
                  {data.totalLessons} {t("detail.lessons")}
                </span>
                <span className="flex items-center gap-1.5">
                  <IoTimeOutline className="text-primary h-4 w-4" />
                  {data.duration} {t("detail.minutes")}
                </span>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-[#7a8090]">{t("detail.overallProgress")}</span>
                  <span className="text-white">{Math.round(data.progress)}%</span>
                </div>
                <Progress value={data.progress} className="h-2 bg-white/[0.06]" />
              </div>
            </div>

            {/* Modules List */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold uppercase tracking-wider text-[#7a8090]">{t("detail.courseStructure")}</h4>
              {data.modules.map((module) => (
                <ModuleItem 
                  key={module.moduleID} 
                  module={module} 
                  isExpanded={expandedModules.has(module.moduleID)}
                  onToggle={() => toggleModule(module.moduleID)}
                  locale={locale}
                  t={t}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-10 text-[#7a8090]">{t("detail.noData")}</div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ModuleItem({ module, isExpanded, onToggle, locale, t }: { 
  module: LearningPathModule; 
  isExpanded: boolean; 
  onToggle: () => void;
  locale: string;
  t: any;
}) {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-[#0f1014]/50 overflow-hidden">
      <button 
        onClick={onToggle}
        className="w-full px-4 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
            module.isCompleted ? "bg-emerald-500/20 text-emerald-400" : "bg-white/[0.05] text-[#7a8090]"
          )}>
            {module.moduleNumber}
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-white leading-tight">
              {locale === "vi" ? module.titleVN : module.titleEN}
            </p>
            <p className="text-[11px] text-[#5a6070] mt-0.5">
              {module.totalLessons} {t("detail.lessons")} • {module.duration} {t("detail.minutes")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end gap-1">
            <span className="text-[10px] font-bold text-[#7a8090] uppercase">{Math.round(module.progress)}%</span>
            <div className="w-20 h-1 bg-white/[0.05] rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${module.progress}%` }} />
            </div>
          </div>
          {isExpanded ? <IoChevronUpOutline className="text-[#5a6070]" /> : <IoChevronDownOutline className="text-[#5a6070]" />}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-white/[0.05] bg-[#0f1014]/30 px-4 py-2 divide-y divide-white/[0.03]">
          {module.lessons.map((lesson) => (
            <LessonItem key={lesson.lessonID} lesson={lesson} locale={locale} t={t} />
          ))}
        </div>
      )}
    </div>
  );
}

function LessonItem({ lesson, locale, t }: { lesson: LearningPathLesson; locale: string; t: any }) {
  const tLesson = useTranslations("MemberLessonDetail");
  
  const getIcon = () => {
    switch (lesson.type) {
      case "THEORY": return <MdOutlineMenuBook className="h-4 w-4" />;
      case "QUIZ": return <MdOutlineQuiz className="h-4 w-4" />;
      case "VR": return <MdOutlineVrpano className="h-4 w-4" />;
      case "LAB": return <MdOutlineScience className="h-4 w-4" />;
      case "PHYSIC": return <MdOutlineSettingsSuggest className="h-4 w-4" />;
      case "LAB_PHYSIC": return <MdOutlineHardware className="h-4 w-4" />;
      default: return <div className="w-4 h-4 rounded-full border border-primary/30" />;
    }
  };

  return (
    <div className="py-3 flex items-center justify-between group">
      <div className="flex items-center gap-3">
        <div className={cn(
          "flex items-center justify-center",
          lesson.isCompleted ? "text-emerald-500" : lesson.isLocked ? "text-[#4a5060]" : "text-primary/70"
        )}>
          {lesson.isCompleted ? <MdCheckCircle className="h-4 w-4" /> : getIcon()}
        </div>
        <div>
          <p className={cn(
            "text-sm font-medium transition-colors",
            lesson.isCompleted ? "text-white" : "text-[#7a8090]"
          )}>
            {locale === "vi" ? lesson.titleVN : lesson.titleEN}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-white/[0.08] text-[#5a6070] uppercase font-bold">
              {tLesson(`labels.${lesson.type}`)}
            </Badge>
            <span className="text-[10px] text-[#5a6070]">{lesson.duration} {t("detail.minutes")}</span>
            {lesson.lastAccessDate && (
              <span className="text-[10px] text-[#4a5070]"> • {t("detail.lastAccess")}: {new Date(lesson.lastAccessDate).toLocaleDateString(locale === "en" ? "en-US" : "vi-VN")}</span>
            )}
          </div>
        </div>
      </div>
      <div className="text-[10px] font-bold text-[#5a6070]">
        {lesson.progress}%
      </div>
    </div>
  );
}
