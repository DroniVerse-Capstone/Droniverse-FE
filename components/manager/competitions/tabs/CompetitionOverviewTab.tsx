import React from "react";
import {
    FaFlagCheckered,
    FaRegClock,
    FaUserTie,
    FaInfoCircle,
} from "react-icons/fa";
import { FiTarget, FiFileText } from "react-icons/fi";
import { IoPeople } from "react-icons/io5";
import { MdEmojiEvents, MdOutlineTimer, MdCalendarToday } from "react-icons/md";
import { formatDateTime } from "@/lib/utils/format-date";
import { useLocale, useTranslations } from "@/providers/i18n-provider";
import { Competition } from "@/validations/competitions/competitions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useUpdateCompetitionStatus } from "@/hooks/competitions/useCompetitions";
import toast from "react-hot-toast";
import { Spinner } from "@/components/ui/spinner";
import { MdPublish, MdAssignmentTurnedIn } from "react-icons/md";
import { useQueryClient } from "@tanstack/react-query";

interface CompetitionOverviewTabProps {
    competition: Competition;
}

export default function CompetitionOverviewTab({
    competition,
}: CompetitionOverviewTabProps) {
    const locale = useLocale();
    const queryClient = useQueryClient();
    const t = useTranslations("ManagerCompetitions.detailsDialog");
    const tc = useTranslations("ManagerCompetitions");

    const handleRefresh = () => {
        // Delay 2s to allow server to update state
        setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ["competition", competition.competitionID] });
            queryClient.invalidateQueries({ queryKey: ["club-competitions"] });
            queryClient.invalidateQueries({ queryKey: ["competition-rounds", competition.competitionID] });
            queryClient.invalidateQueries({ queryKey: ["competition-prizes", competition.competitionID] });
            queryClient.invalidateQueries({ queryKey: ["competition-leaderboard", competition.competitionID] });
        }, 2000);
    };


    const description =
        locale === "en"
            ? competition.descriptionEN || competition.descriptionVN
            : competition.descriptionVN || competition.descriptionEN;

    const MetricCard = ({ icon: Icon, label, value, colorClass }: any) => (
        <div className="group relative overflow-hidden rounded-md border border-greyscale-700 bg-greyscale-900/60 p-5 transition-all hover:border-greyscale-500 hover:shadow-lg">
            <div className="flex items-center gap-4">
                <div className={cn("rounded-lg p-3", colorClass, "bg-opacity-15")}>
                    <Icon size={20} className={colorClass.replace("bg-", "text-")} />
                </div>
                <div>
                    <p className="text-[10px] font-black text-greyscale-500 uppercase tracking-widest leading-none mb-1.5">{label}</p>
                    <p className="text-xl font-bold text-greyscale-50 leading-none">{value}</p>
                </div>
            </div>
        </div>
    );

    const NodeCountdown = ({ targetDate, isActive, onFinish }: { targetDate: string; isActive: boolean; onFinish?: () => void }) => {
        const [timeLeft, setTimeLeft] = React.useState<string>("");
        const [isPast, setIsPast] = React.useState(false);

        React.useEffect(() => {
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
            <div className="mt-2 flex items-center gap-1 text-[9px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20 animate-pulse">
                <MdOutlineTimer size={10} />
                {timeLeft}
            </div>
        );
    };

    const RoadmapNode = ({ label, date, rawDate, status, isTarget, onFinish }: { label: string; date: string; rawDate: string; status: 'completed' | 'current' | 'upcoming'; isTarget?: boolean; onFinish?: () => void }) => (
        <div className="relative flex flex-col items-center flex-1">
            <div className={cn(
                "w-4 h-4 rounded-full border-2 z-10 transition-all duration-500",
                status === 'completed' ? "bg-emerald-500 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]" :
                    status === 'current' ? "bg-indigo-500 border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.4)] animate-pulse" :
                        "bg-greyscale-950 border-greyscale-700"
            )} />
            <div className="mt-4 text-center flex flex-col items-center">
                <p className={cn(
                    "text-[10px] font-black uppercase tracking-widest mb-1",
                    status === 'completed' ? "text-emerald-400" :
                        status === 'current' ? "text-indigo-400" : "text-greyscale-500"
                )}>{label}</p>
                <div className="flex flex-col items-center">
                    <p className="text-xs font-bold text-greyscale-200 leading-tight">{date.split(' - ')[0]}</p>
                    <p className="text-[10px] font-medium text-greyscale-400 leading-tight">{date.split(' - ')[1]}</p>
                </div>
                <NodeCountdown targetDate={rawDate} isActive={!!isTarget} onFinish={onFinish} />
            </div>
        </div>
    );

    const TimelineStep = ({ icon: Icon, label, value, colorClass, isLast = false }: any) => (
        <div className="flex gap-4">
            <div className="flex flex-col items-center">
                <div className={cn("z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-greyscale-950 shadow-xl", colorClass)}>
                    <Icon size={18} className="text-white" />
                </div>
                {!isLast && <div className="h-full w-0.5 bg-greyscale-800" />}
            </div>
            <div className="pb-8">
                <p className="text-xs font-black text-greyscale-400 uppercase tracking-tighter mb-1">{label}</p>
                <p className="text-sm font-bold text-greyscale-100">{value}</p>
            </div>
        </div>
    );

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

    const statusMutation = useUpdateCompetitionStatus();

    const handleUpdateStatus = async (status: 'PUBLISHED' | 'RESULT_PUBLISHED') => {
        try {
            await statusMutation.mutateAsync({
                id: competition.competitionID,
                status,
                invalidReason: null
            });
            toast.success(locale === 'en' ? 'Status updated successfully!' : 'Cập nhật trạng thái thành công!');
        } catch (error) {
            toast.error(locale === 'en' ? 'Failed to update status' : 'Cập nhật trạng thái thất bại');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">
            {/* Roadmap Section */}
            <section className="rounded-md border border-greyscale-700 bg-greyscale-900/60 p-8">
                <div className="flex items-center gap-3 mb-10">
                    <div className="h-8 w-1.5 bg-indigo-500 rounded-full" />
                    <h3 className="text-lg font-bold text-greyscale-50 uppercase tracking-tight">
                        {locale === 'en' ? 'Competition Roadmap' : 'Lộ trình cuộc thi'}
                    </h3>
                </div>

                <div className="relative px-10">
                    {/* Background Line */}
                    <div className="absolute top-2 left-10 right-10 h-0.5 bg-greyscale-800" />

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
                            isTarget={now > visibleDate && now < regStartDate}
                            onFinish={handleRefresh}
                        />
                        <RoadmapNode
                            label={locale === 'en' ? 'Reg. Closes' : 'Đóng đăng ký'}
                            date={formatDateTime(competition.registrationEndDate)}
                            rawDate={competition.registrationEndDate}
                            status={getStatus(regEndDate, startDate)}
                            isTarget={now > regStartDate && now < regEndDate}
                            onFinish={handleRefresh}
                        />
                        <RoadmapNode
                            label={locale === 'en' ? 'Started' : 'Bắt đầu thi'}
                            date={formatDateTime(competition.startDate)}
                            rawDate={competition.startDate}
                            status={getStatus(startDate, endDate)}
                            isTarget={now > regEndDate && now < startDate}
                            onFinish={handleRefresh}
                        />
                        <RoadmapNode
                            label={locale === 'en' ? 'Ended' : 'Kết thúc'}
                            date={formatDateTime(competition.endDate)}
                            rawDate={competition.endDate}
                            status={now > endDate ? 'completed' : 'upcoming'}
                            isTarget={now > startDate && now < endDate}
                            onFinish={handleRefresh}
                        />
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Side: Description & Metrics */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    <div className="rounded-md border border-greyscale-700 bg-greyscale-900/60 p-6">
                        <h3 className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-4 flex items-center gap-2">
                            <FaInfoCircle /> {t("sections.info")}
                        </h3>
                        <p className="text-lg text-greyscale-200 leading-relaxed font-medium">
                            {description || tc("fallback.noDescription")}
                        </p>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <MetricCard
                            icon={FiTarget}
                            label={tc("metrics.rounds")}
                            value={competition.totalRounds}
                            colorClass="bg-indigo-500"
                        />
                        <MetricCard
                            icon={IoPeople}
                            label={tc("metrics.competitors")}
                            value={`${competition.totalCompetitors} / ${competition.maxParticipants}`}
                            colorClass="bg-emerald-500"
                        />
                        <MetricCard
                            icon={MdEmojiEvents}
                            label={tc("metrics.prizes")}
                            value={competition.totalPrizes}
                            colorClass="bg-amber-500"
                        />
                        <MetricCard
                            icon={FaUserTie}
                            label={locale === 'en' ? 'Created By' : 'Người tạo'}
                            value={competition.createdBy.fullName}
                            colorClass="bg-rose-500"
                        />
                    </div>
                </div>

                {/* Right Side: Rules */}
                <div className="space-y-6">
                    <div className="h-full rounded-md border border-greyscale-700 bg-greyscale-950/40 p-6">
                        <h3 className="text-xs font-black uppercase tracking-widest text-greyscale-500 mb-4 flex items-center gap-2">
                            <FiFileText /> {t("sections.rules")}
                        </h3>
                        <div
                            className="prose prose-invert prose-sm max-w-none text-greyscale-300 leading-relaxed overflow-y-auto max-h-[400px] custom-scrollbar"
                            dangerouslySetInnerHTML={{ __html: competition.ruleContent }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
