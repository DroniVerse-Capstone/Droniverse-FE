"use client";

import React from "react";
import { Competition } from "@/validations/competitions/competitions";
import { useLocale, useTranslations } from "@/providers/i18n-provider";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/utils/format-date";
import { FaRegClock, FaUserTie, FaCompass, FaUsers, FaTrophy } from "react-icons/fa";
import { FiTarget, FiClock, FiUsers, FiAward } from "react-icons/fi";
import { IoPeople } from "react-icons/io5";
import {
  MdEmojiEvents,
  MdLayers,
  MdArrowForward,
  MdSchedule,
  MdOutlineTimer,
  MdCheckCircle,
} from "react-icons/md";

import Link from "next/link";
import CompetitonStatusBadge from "@/components/competition/CompetitonStatusBadge";

interface MemberCompetitionCardProps {
  competition: Competition;
  clubSlug: string;
}

export default function MemberCompetitionCard({
  competition,
  clubSlug,
}: MemberCompetitionCardProps) {
  const locale = useLocale();
  const name = locale === "en" ? competition.nameEN : competition.nameVN;
  const description = locale === "en" ? competition.descriptionEN : competition.descriptionVN;
  const isRegistered = competition.isRegistered;

  const [currentPhase, setCurrentPhase] = React.useState(competition.competitionPhase);
  const [timeLeft, setTimeLeft] = React.useState<string>("");

  // Sync with prop if it changes from parent
  React.useEffect(() => {
    setCurrentPhase(competition.competitionPhase);
  }, [competition.competitionPhase]);

  React.useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      let target: number | null = null;
      let nextPhase: any = null;

      switch (currentPhase) {
        case "COMING_SOON":
          target = new Date(competition.registrationStartDate).getTime();
          nextPhase = "REGISTRATION_OPEN";
          break;
        case "REGISTRATION_OPEN":
          target = new Date(competition.registrationEndDate).getTime();
          nextPhase = "REGISTRATION_CLOSED";
          break;
        case "REGISTRATION_CLOSED":
          target = new Date(competition.startDate).getTime();
          nextPhase = "ONGOING";
          break;
        case "ONGOING":
          target = new Date(competition.endDate).getTime();
          nextPhase = "FINISHED";
          break;
        default:
          target = null;
      }

      if (!target) {
        setTimeLeft("");
        return;
      }

      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft("00:00:00");
        if (nextPhase && currentPhase !== nextPhase) {
          setCurrentPhase(nextPhase);
        }
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [currentPhase, competition]);

  const isRegistrationOpen = currentPhase === "REGISTRATION_OPEN";
  const isRegistrationClosed = currentPhase === "REGISTRATION_CLOSED";
  const isComingSoon = currentPhase === "COMING_SOON";
  const isOngoing = currentPhase === "ONGOING";
  const isFinished = currentPhase === "FINISHED" || currentPhase === "COMPLETED";

  const progress = (competition.totalCompetitors / competition.maxParticipants) * 100;

  // Format Date for better display
  const formatDateOnly = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  }

  return (
    <Link
      href={`/member/${clubSlug}/competitions/${competition.competitionID}`}
      className={cn(
        "group flex flex-col relative w-full max-w-[420px] overflow-hidden rounded-md border border-slate-700/50 bg-[#0f172a] p-5 shadow-lg transition-all duration-300",
        "cursor-pointer hover:border-indigo-500/40 hover:bg-[#111a2f] hover:-translate-y-1 hover:shadow-indigo-500/10",
        isComingSoon && "opacity-95",
        isFinished && "opacity-60 grayscale-[0.3] hover:grayscale-0 hover:opacity-100"
      )}
    >
      {/* Subtle Depth Glow */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/10 blur-[70px] rounded-full pointer-events-none transition-all duration-500 group-hover:bg-indigo-500/20" />

      {/* Header: Badges & Organizer */}
      <div className="relative z-10 flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={cn(
            "px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border",
            isFinished ? "text-slate-400 border-slate-700 bg-slate-800" :
            isComingSoon ? "text-amber-400 border-amber-500/30 bg-amber-500/10" :
            isRegistrationOpen ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" :
            isRegistrationClosed ? "text-purple-400 border-purple-500/30 bg-purple-500/10" :
            isOngoing ? "text-cyan-400 border-cyan-500/30 bg-cyan-500/10" :
            "text-slate-400 border-slate-700 bg-slate-800"
          )}>
            {isFinished ? "Đã kết thúc" :
              isComingSoon ? "Sắp mở đăng ký" :
              isRegistrationOpen ? "Đang mở đăng ký" :
              isRegistrationClosed ? "Đã đóng đăng ký" :
              isOngoing ? "Đang diễn ra" :
              "Đã kết thúc"}
          </span>
          {isRegistered && (
            <span className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-lg",
              isFinished ? "bg-slate-700/50 text-slate-400 border border-slate-600" : "bg-emerald-500 text-white shadow-emerald-500/20"
            )}>
              <MdCheckCircle size={12} />
              {isFinished ? "Bạn đã tham gia" : "Đã đăng ký"}
            </span>
          )}
        </div>
      </div>

      {/* Title & Desc */}
      <div className="relative z-10 space-y-1.5 mb-5">
        <h2 className="text-xl font-bold text-white leading-tight line-clamp-2 transition-colors group-hover:text-indigo-300">
          {name}
        </h2>
        <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
          {description || "Thử thách điều khiển drone chuyên nghiệp. Hãy thể hiện kỹ năng của bạn!"}
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="relative z-10 grid grid-cols-2 gap-3 mb-6">
        {[
          { icon: FaCompass, label: "Số vòng thi", value: `${competition.totalRounds}`, color: "text-sky-400", bg: "bg-sky-500/10" },
          { icon: FaUsers, label: "Người đăng ký", value: `${competition.totalCompetitors} / ${competition.maxParticipants}`, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { icon: FaTrophy, label: "Tổng giải thưởng", value: `${competition.totalPrizes}`, color: "text-amber-400", bg: "bg-amber-500/10" },
          { icon: FaUserTie, label: "Ban tổ chức", value: competition.createdBy.fullName, color: "text-purple-400", bg: "bg-purple-500/10" },
        ].map((info, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-md bg-slate-800/50 border border-white/5 transition-colors group-hover:bg-slate-800/80">
            <div className={cn("p-2 rounded-md shrink-0", info.bg, info.color)}>
              <info.icon size={14} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold text-slate-400 mb-0.5 truncate">{info.label}</p>
              <p className="text-xs font-bold text-slate-100 truncate">{info.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <div className="relative z-10 mt-auto pt-2">
        <div
          className={cn(
            "flex items-center justify-center relative w-full h-12 rounded-md text-[13px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer",
            isRegistrationOpen ? "border-2 border-emerald-500 text-emerald-500 bg-transparent hover:bg-emerald-500 hover:text-white" :
              isOngoing ? "bg-linear-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 group-hover:from-indigo-500 group-hover:to-violet-500 group-hover:shadow-indigo-500/40" :
                isComingSoon ? "bg-slate-800/80 text-amber-400/90 border border-amber-500/20 cursor-not-allowed" :
                  "bg-slate-800 text-slate-500 border border-slate-700"
          )}
        >
          <span className="flex items-center justify-center gap-2 tabular-nums">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2">
                {isOngoing && isRegistered ? "VÀO PHÒNG THI" : "XEM CHI TIẾT"}
                <MdArrowForward className="text-lg" />
              </div>
            </div>
          </span>
        </div>
      </div>

      {/* Subtle Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
        <div
          className={cn("h-full transition-all duration-1000", isComingSoon ? "bg-amber-500/40" : "bg-indigo-500")}
          style={{ width: `${progress}%` }}
        />
      </div>
    </Link>
  );
}
