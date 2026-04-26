"use client";

import React, { useState, useEffect } from "react";
import { FaInfoCircle, FaUserTie } from "react-icons/fa";
import { FiTarget, FiFileText } from "react-icons/fi";
import { IoPeople } from "react-icons/io5";
import { MdEmojiEvents, MdOutlineTimer } from "react-icons/md";
import { formatDateTime } from "@/lib/utils/format-date";
import { useLocale } from "@/providers/i18n-provider";
import { Competition } from "@/validations/competitions/competitions";
import { cn } from "@/lib/utils";
import { useGetCompetitionLevels } from "@/hooks/competitions/useCompetitions";
import { Loader2 } from "lucide-react";
import { TbDrone } from "react-icons/tb";
import { useQueryClient } from "@tanstack/react-query";

interface MemberCompetitionOverviewTabProps {
    competition: Competition;
}

const MetricCard = ({ icon: Icon, label, value, colorClass }: any) => (
    <div className="group relative overflow-hidden rounded-[20px] border border-white/5 bg-linear-to-br from-[#131B2C] to-[#0B101A] p-5 shadow-lg transition-all hover:-translate-y-1 hover:border-white/10">
        <div className="flex items-center gap-4 relative z-10">
            <div className={cn("rounded-xl p-3.5 shadow-inner", colorClass, "bg-opacity-15")}>
                <Icon size={24} className={colorClass.replace("bg-", "text-")} />
            </div>
            <div className="flex flex-col">
                <p className="text-[10px] font-black text-greyscale-500 uppercase tracking-widest leading-none mb-1.5">{label}</p>
                <p className="text-2xl font-black text-white tracking-tight leading-none">{value}</p>
            </div>
        </div>
    </div>
);

const NodeCountdown = ({ targetDate, isActive, onFinish }: { targetDate: string; isActive: boolean; onFinish?: () => void }) => {
    const [timeLeft, setTimeLeft] = useState<string>("");
    const [isPast, setIsPast] = useState(false);

    useEffect(() => {
        if (!isActive) return;

        const calculateTime = () => {
            const now = new Date().getTime();
            const target = new Date(targetDate).getTime();
            const diff = target - now;

            if (diff <= 0) {
                if (!isPast && onFinish) {
                    onFinish();
                }
                setIsPast(true);
                setTimeLeft("");
                return;
            }

            setIsPast(false);
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            if (days > 0) {
                setTimeLeft(`${days}d ${hours}h ${minutes}m`);
            } else if (hours > 0) {
                setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
            } else {
                setTimeLeft(`${minutes}m ${seconds}s`);
            }
        };

        calculateTime();
        const timer = setInterval(calculateTime, 1000);
        return () => clearInterval(timer);
    }, [targetDate, isActive, isPast, onFinish]);

    if (!isActive || !timeLeft) return null;

    return (
        <div className="mt-3 flex items-center gap-1.5 text-[10px] font-black text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20 animate-pulse tracking-wider">
            <MdOutlineTimer size={12} />
            {timeLeft}
        </div>
    );
};

const RoadmapNode = ({ label, date, rawDate, status, isTarget, onFinish }: { label: string; date: string; rawDate: string; status: 'completed' | 'current' | 'upcoming'; isTarget?: boolean; onFinish?: () => void }) => (
    <div className="relative flex flex-col items-center flex-1 z-10">
        <div className={cn(
            "w-5 h-5 rounded-full border-4 z-10 transition-all duration-500",
            status === 'completed' ? "bg-emerald-500 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.5)]" :
                status === 'current' ? "bg-indigo-500 border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.6)] animate-pulse" :
                    "bg-[#0B101A] border-greyscale-700"
        )} />
        <div className="mt-5 text-center flex flex-col items-center">
            <p className={cn(
                "text-[10px] font-black uppercase tracking-widest mb-1.5",
                status === 'completed' ? "text-emerald-400" :
                    status === 'current' ? "text-indigo-400" : "text-greyscale-500"
            )}>{label}</p>
            <div className="flex flex-col items-center bg-black/20 px-3 py-1.5 rounded-lg border border-white/5">
                <p className="text-[11px] font-bold text-greyscale-200 leading-tight mb-0.5">{date.split(' - ')[0]}</p>
                <p className="text-[10px] font-medium text-greyscale-400 leading-tight">{date.split(' - ')[1]}</p>
            </div>
            <NodeCountdown targetDate={rawDate} isActive={!!isTarget} onFinish={onFinish} />
        </div>
    </div>
);

export default function MemberCompetitionOverviewTab({
    competition,
}: MemberCompetitionOverviewTabProps) {
    const locale = useLocale();
    const queryClient = useQueryClient();
    const { data: levels, isLoading: isLoadingLevels } = useGetCompetitionLevels(competition.competitionID);

    const handleRefresh = () => {
        // Wait 2 seconds for server to catch up
        setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ["competition", competition.competitionID] });
            queryClient.invalidateQueries({ queryKey: ["club-competitions"] });
            queryClient.invalidateQueries({ queryKey: ["competition-rounds", competition.competitionID] });
            queryClient.invalidateQueries({ queryKey: ["competition-prizes", competition.competitionID] });
            queryClient.invalidateQueries({ queryKey: ["competition-leaderboard", competition.competitionID] });
            queryClient.invalidateQueries({ queryKey: ["my-round-results"] });
        }, 2000);
    };

    const description =
        locale === "en"
            ? competition.descriptionEN || competition.descriptionVN
            : competition.descriptionVN || competition.descriptionEN;

    // Roadmap Logic
    const now = new Date().getTime();
    const visibleDate = new Date(competition.visibleAt).getTime();
    const regStartDate = new Date(competition.registrationStartDate).getTime();
    const regEndDate = new Date(competition.registrationEndDate).getTime();
    const startDate = new Date(competition.startDate).getTime();
    const endDate = new Date(competition.endDate).getTime();

    const getStatus = (target: number, next?: number) => {
        if (now > target && (!next || now < next)) return 'current';
        if (now > target) return 'completed';
        return 'upcoming';
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Roadmap Section */}
            <section className="rounded-[24px] border border-white/5 bg-linear-to-b from-[#131B2C] to-[#0B101A] p-8 shadow-xl relative overflow-hidden">
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />

                <div className="flex items-center gap-3 mb-12 relative z-10">
                    <div className="h-8 w-1.5 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                    <h3 className="text-xl font-black text-white uppercase tracking-wider">
                        {locale === 'en' ? 'Competition Roadmap' : 'Lộ trình cuộc thi'}
                    </h3>
                </div>

                <div className="relative px-4 sm:px-10 mt-8 mb-4">
                    {/* Background Line */}
                    <div className="absolute top-2.5 left-10 right-10 h-0.5 bg-greyscale-800" />

                    <div className="flex justify-between relative">
                        <RoadmapNode
                            label={locale === 'en' ? 'Published' : 'Dự Kiến Công Bố'}
                            date={formatDateTime(competition.visibleAt)}
                            rawDate={competition.visibleAt}
                            status={getStatus(visibleDate, regStartDate)}
                            isTarget={now < visibleDate}
                            onFinish={handleRefresh}
                        />
                        <RoadmapNode
                            label={locale === 'en' ? 'Reg. Opens' : 'Mở đăng ký'}
                            date={formatDateTime(competition.registrationStartDate)}
                            rawDate={competition.registrationStartDate}
                            status={getStatus(regStartDate, regEndDate)}
                            isTarget={now >= visibleDate && now < regStartDate}
                            onFinish={handleRefresh}
                        />
                        <RoadmapNode
                            label={locale === 'en' ? 'Reg. Closes' : 'Đóng đăng ký'}
                            date={formatDateTime(competition.registrationEndDate)}
                            rawDate={competition.registrationEndDate}
                            status={getStatus(regEndDate, startDate)}
                            isTarget={now >= regStartDate && now < regEndDate}
                            onFinish={handleRefresh}
                        />
                        <RoadmapNode
                            label={locale === 'en' ? 'Started' : 'Bắt đầu thi'}
                            date={formatDateTime(competition.startDate)}
                            rawDate={competition.startDate}
                            status={getStatus(startDate, endDate)}
                            isTarget={now >= regEndDate && now < startDate}
                            onFinish={handleRefresh}
                        />
                        <RoadmapNode
                            label={locale === 'en' ? 'Ended' : 'Kết thúc'}
                            date={formatDateTime(competition.endDate)}
                            rawDate={competition.endDate}
                            status={now >= endDate ? 'completed' : 'upcoming'}
                            isTarget={now >= startDate && now < endDate}
                            onFinish={handleRefresh}
                        />
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Side: Description & Metrics */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    <div className="rounded-[24px] border border-white/5 bg-[#0B101A] p-8 shadow-lg">
                        <h3 className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-5 flex items-center gap-2">
                            <FaInfoCircle size={16} /> {locale === "en" ? "Description" : "Mô tả cuộc thi"}
                        </h3>
                        <p className="text-base text-greyscale-300 leading-relaxed font-medium">
                            {description || (locale === "en" ? "No description provided." : "Chưa có mô tả nào.")}
                        </p>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <MetricCard
                            icon={FiTarget}
                            label={locale === "en" ? "Total Rounds" : "Số vòng thi"}
                            value={competition.totalRounds}
                            colorClass="bg-indigo-500"
                        />
                        <MetricCard
                            icon={IoPeople}
                            label={locale === "en" ? "Registrants" : "Người đăng ký"}
                            value={`${competition.totalCompetitors} / ${competition.maxParticipants}`}
                            colorClass="bg-emerald-500"
                        />
                        <MetricCard
                            icon={MdEmojiEvents}
                            label={locale === "en" ? "Prizes" : "Giải thưởng"}
                            value={competition.totalPrizes}
                            colorClass="bg-amber-500"
                        />
                        <MetricCard
                            icon={FaUserTie}
                            label={locale === 'en' ? 'Organizer' : 'Ban tổ chức'}
                            value={competition.createdBy.fullName}
                            colorClass="bg-purple-500"
                        />
                    </div>
                </div>

                {/* Right Side: Rules & Levels */}
                <div className="space-y-6">
                    {/* Level Requirements */}
                    <div className="rounded-[24px] border border-white/5 bg-[#131B2C]/50 p-8 shadow-lg">
                        <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-5 flex items-center gap-2">
                            <TbDrone size={16} /> {locale === "en" ? "Required Drone Levels" : "Yêu cầu cấp độ Drone"}
                        </h3>
                        {isLoadingLevels ? (
                            <div className="flex justify-center py-4">
                                <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                            </div>
                        ) : levels && levels.length > 0 ? (
                            <div className="space-y-3 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
                                {[...levels].sort((a, b) => a.levelNumber - b.levelNumber).map((level) => (
                                    <div key={level.levelId} className="flex items-center gap-4 p-3 rounded-xl bg-[#0B101A] border border-white/5 transition-colors hover:bg-emerald-500/5 hover:border-emerald-500/20">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                                            Lv.{level.levelNumber}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-white truncate">
                                                {locale === "en"
                                                    ? level.name
                                                    : level.name.toLowerCase().includes("beginner") ? "Sơ Cấp"
                                                        : level.name.toLowerCase().includes("intermediate") ? "Trung Cấp"
                                                            : level.name.toLowerCase().includes("advanced") ? "Cao Cấp"
                                                                : level.name.toLowerCase().includes("master") ? "Bậc Thầy"
                                                                    : level.name
                                                }
                                            </p>
                                            <p className="text-xs text-greyscale-400 truncate mt-0.5">
                                                {locale === "en" ? level.droneInfo?.droneNameEN : level.droneInfo?.droneNameVN}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-greyscale-500 italic bg-[#0B101A] p-4 rounded-xl border border-white/5">
                                {locale === "en" ? "No specific drone level required." : "Không có yêu cầu về cấp độ Drone cho cuộc thi này."}
                            </p>
                        )}
                    </div>

                    {/* Rules */}
                    <div className="rounded-[24px] border border-white/5 bg-[#131B2C]/50 p-8 shadow-lg">
                        <h3 className="text-xs font-black uppercase tracking-widest text-greyscale-400 mb-5 flex items-center gap-2">
                            <FiFileText size={16} /> {locale === "en" ? "Rules & Regulations" : "Quy định & Thể lệ"}
                        </h3>
                        {competition.ruleContent ? (
                            <div
                                className="prose prose-invert prose-sm max-w-none text-greyscale-300 leading-relaxed overflow-y-auto max-h-[300px] custom-scrollbar"
                                dangerouslySetInnerHTML={{ __html: competition.ruleContent }}
                            />
                        ) : (
                            <p className="text-sm text-greyscale-500 italic bg-[#0B101A] p-4 rounded-xl border border-white/5">
                                {locale === "en" ? "No rules specified." : "Chưa có quy định nào được thiết lập."}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
