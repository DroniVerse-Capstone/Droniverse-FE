"use client";

import React, { useState, useEffect } from "react";
import {
    MdAdd,
    MdDelete,
    MdSchedule,
    MdTimer,
    MdEdit,
    MdCancel,
    MdLeaderboard,
    MdMonitor,
} from "react-icons/md";
import { LuClipboardList } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import ConfirmActionPopover from "@/components/common/ConfirmActionPopover";
import { useLocale, useTranslations } from "@/providers/i18n-provider";
import {
    Competition,
    CompetitionRound,
} from "@/validations/competitions/competitions";
import { formatDateTime } from "@/lib/utils/format-date";
import {
    useGetCompetitionRounds,
    useCancelCompetitionRound
} from "@/hooks/competitions/useCompetitionRounds";
import { CreateRoundDialog } from "../dialogs/CreateRoundDialog";
import toast from "react-hot-toast";
import { UpdateRoundDialog } from "../dialogs/UpdateRoundDialog";
import RoundLeaderboardDialog from "../dialogs/RoundLeaderboardDialog";
import RoundMonitoringDialog from "../dialogs/RoundMonitoringDialog";

interface CompetitionRoundsTabProps {
    competition: Competition;
}

export default function CompetitionRoundsTab({
    competition,
}: CompetitionRoundsTabProps) {
    const t = useTranslations("ManagerCompetitions.detailPage.rounds");
    const locale = useLocale();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingRound, setEditingRound] = useState<CompetitionRound | null>(null);
    const [leaderboardRoundId, setLeaderboardRoundId] = useState<string | null>(null);
    const [monitoringRoundId, setMonitoringRoundId] = useState<string | null>(null);

    const { data: rounds, isLoading } = useGetCompetitionRounds(competition.competitionID);
    const cancelRoundMutation = useCancelCompetitionRound();

    const isDraft = competition.competitionStatus === "DRAFT";

    const handleCancelRound = async (roundId: string) => {
        try {
            await cancelRoundMutation.mutateAsync(roundId);
            toast.success("Hủy vòng thi thành công");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Hủy vòng thi thất bại");
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between border-b border-greyscale-800 pb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <LuClipboardList className="text-primary h-6 w-6" />
                        <h2 className="text-2xl font-bold text-greyscale-50">
                            {t("title")}
                        </h2>
                    </div>
                    <p className="text-sm text-greyscale-400">
                        {t("description")}
                    </p>
                </div>

                {isDraft && (
                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="bg-primary hover:bg-primary/90 text-white font-bold h-10 px-6 rounded shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                    >
                        <MdAdd className="mr-2 h-5 w-5" />
                        Thêm vòng thi
                    </Button>
                )}
            </div>

            {!rounds || rounds.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-greyscale-800 bg-greyscale-900/20 py-20 text-center transition-colors hover:bg-greyscale-900/30">
                    <div className="mb-4 rounded-full bg-greyscale-800/50 p-6 text-greyscale-500">
                        <MdSchedule size={48} />
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-greyscale-200">
                        {t("empty")}
                    </h3>
                    {isDraft && (
                        <Button
                            variant="link"
                            className="text-primary font-semibold text-lg"
                            onClick={() => setIsCreateOpen(true)}
                        >
                            <MdAdd className="mr-1" />
                            {t("create.buttons.create")}
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {rounds.sort((a, b) => a.roundNumber - b.roundNumber).map((round) => (
                        <div
                            key={round.roundID}
                            className="group relative flex flex-col sm:flex-row sm:items-center justify-between rounded-md border border-greyscale-700 bg-greyscale-800/30 p-4 shadow-sm transition-all hover:border-primary/50 hover:bg-greyscale-800/60 gap-6"
                        >
                            {/* Left: Round Number & Main Info */}
                            <div className="flex items-center gap-4 flex-1">
                                <div className="flex flex-col items-center justify-center h-16 w-16 min-w-16 rounded-md bg-greyscale-900 border border-greyscale-600 group-hover:border-primary/50 transition-colors shadow-sm">
                                    <span className="text-[10px] font-black uppercase text-greyscale-400">Vòng</span>
                                    <span className="text-2xl font-black text-greyscale-50 leading-none">
                                        {round.roundNumber}
                                    </span>
                                </div>
                                
                                <div className="space-y-2 flex-1">
                                    <h3 className="text-xl font-bold text-greyscale-50 line-clamp-2">
                                        {locale === "en" ? round.vrSimulator?.titleEN : round.vrSimulator?.titleVN || "Bài Lab chưa xác định"}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-2.5 mt-1">
                                        {round.weight && (
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${
                                                round.weight === 1 ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" :
                                                round.weight === 2 ? "text-amber-400 bg-amber-500/10 border-amber-500/20" :
                                                "text-rose-400 bg-rose-500/10 border-rose-500/20"
                                            }`}>
                                                {round.weight === 1 ? "Dễ" : round.weight === 2 ? "Trung bình" : "Khó"}
                                            </span>
                                        )}
                                        {round.roundPhase && (
                                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ${
                                                round.roundPhase === "Upcoming" ? "bg-indigo-500/20 text-indigo-300" :
                                                round.roundPhase === "Ongoing" ? "bg-emerald-500/20 text-emerald-300" :
                                                round.roundPhase === "Finished" ? "bg-amber-500/20 text-amber-300" :
                                                "bg-greyscale-700 text-greyscale-300"
                                            }`}>
                                                {t(`phases.${round.roundPhase}`)}
                                            </span>
                                        )}
                                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ${
                                            round.roundStatus === "Valid" ? "bg-emerald-500/20 text-emerald-300" :
                                            round.roundStatus === "ScheduleInvalid" ? "bg-rose-500/20 text-rose-300" :
                                            "bg-greyscale-700 text-greyscale-300"
                                        }`}>
                                            {t(`statuses.${round.roundStatus}`)}
                                        </span>
                                        <RoundCountdown startTime={round.startTime} endTime={round.endTime} phase={round.roundPhase} />
                                    </div>
                                </div>
                            </div>

                            {/* Middle: Timing Details */}
                            <div className="hidden lg:flex items-center gap-8 px-4 border-l border-greyscale-700">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-greyscale-500 uppercase flex items-center gap-1.5">
                                        <MdSchedule className="text-primary/70" />
                                        Thời gian
                                    </span>
                                    <div className="text-sm font-medium text-greyscale-300">
                                        {formatDateTime(round.startTime)} <span className="text-greyscale-600">→</span> {formatDateTime(round.endTime)}
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-greyscale-500 uppercase flex items-center gap-1.5">
                                        <MdTimer className="text-secondary/70" />
                                        Thời lượng
                                    </span>
                                    <div className="text-sm font-bold text-greyscale-200">
                                        <span className="text-secondary">{round.timeLimit.split(':')[1]}</span> phút
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Timing view (shown only on small screens) */}
                            <div className="flex lg:hidden flex-col gap-2 mt-2 pt-4 border-t border-greyscale-700">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-greyscale-500 flex items-center gap-1"><MdSchedule /> Thời gian:</span>
                                    <span className="text-greyscale-300">{formatDateTime(round.startTime)} → {formatDateTime(round.endTime)}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-greyscale-500 flex items-center gap-1"><MdTimer /> Thời lượng:</span>
                                    <span className="text-greyscale-300 font-bold"><span className="text-secondary">{round.timeLimit.split(':')[1]}</span> phút</span>
                                </div>
                            </div>

                            {/* Right: Actions */}
                            <div className="flex items-center gap-2 pt-4 sm:pt-0 border-t sm:border-t-0 sm:border-l border-greyscale-700 sm:pl-4 justify-end">
                                {!isDraft && round.roundPhase !== "Upcoming" && (
                                    <>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setLeaderboardRoundId(round.roundID)}
                                            className="h-9 px-3 rounded text-primary border-primary/20 bg-primary/5 hover:bg-primary/20 hover:text-primary transition-all font-bold gap-1.5"
                                            title="Bảng xếp hạng"
                                        >
                                            <MdLeaderboard size={16} />
                                            <span className="hidden sm:inline">BXH</span>
                                        </Button>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setMonitoringRoundId(round.roundID)}
                                            className="h-9 px-3 rounded text-sky-400 border-sky-400/20 bg-sky-400/5 hover:bg-sky-400/20 hover:text-sky-400 transition-all font-bold gap-1.5"
                                            title="Giám sát tiến độ"
                                        >
                                            <MdMonitor size={16} />
                                            <span className="hidden sm:inline">Giám sát</span>
                                        </Button>
                                    </>
                                )}

                                {isDraft && (
                                    <>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setEditingRound(round)}
                                            className="h-9 w-9 rounded text-greyscale-400 border-greyscale-700 bg-greyscale-900 hover:text-primary hover:bg-primary/10 hover:border-primary/30 transition-all"
                                            title="Chỉnh sửa vòng thi"
                                        >
                                            <MdEdit size={16} />
                                        </Button>

                                        <ConfirmActionPopover
                                            title="Hủy vòng thi"
                                            description="Bạn có chắc chắn muốn hủy vòng thi này không? Hành động này không thể hoàn tác."
                                            onConfirm={() => handleCancelRound(round.roundID)}
                                            confirmText="Xác nhận hủy"
                                            cancelText="Đóng"
                                            isLoading={cancelRoundMutation.isPending}
                                            trigger={
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-9 w-9 rounded text-greyscale-400 border-greyscale-700 bg-greyscale-900 hover:text-error hover:bg-error/10 hover:border-error/30 transition-all"
                                                    title="Hủy vòng thi"
                                                >
                                                    <MdDelete size={16} />
                                                </Button>
                                            }
                                        />
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <CreateRoundDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                competition={competition}
            />

            <UpdateRoundDialog
                open={!!editingRound}
                onOpenChange={(open) => !open && setEditingRound(null)}
                round={editingRound!}
                competition={competition}
            />

            {leaderboardRoundId && (
                <RoundLeaderboardDialog
                    roundId={leaderboardRoundId}
                    open={!!leaderboardRoundId}
                    onOpenChange={(open: boolean) => !open && setLeaderboardRoundId(null)}
                />
            )}
            {monitoringRoundId && (
                <RoundMonitoringDialog
                    roundId={monitoringRoundId}
                    open={!!monitoringRoundId}
                    onOpenChange={(open: boolean) => !open && setMonitoringRoundId(null)}
                />
            )}
        </div>
    );
}

function RoundCountdown({ startTime, endTime, phase }: { startTime: string; endTime: string; phase?: string | null }) {
    const [timeLeft, setTimeLeft] = useState<string>("");
    const [isUrgent, setIsUrgent] = useState(false);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            let targetTime = 0;
            let prefix = "";

            if (phase === "Upcoming") {
                targetTime = new Date(startTime).getTime();
                prefix = "Bắt đầu sau: ";
            } else if (phase === "Ongoing") {
                targetTime = new Date(endTime).getTime();
                prefix = "Kết thúc sau: ";
            } else {
                setTimeLeft("");
                return;
            }

            const difference = targetTime - now;

            if (difference <= 0) {
                setTimeLeft(phase === "Upcoming" ? "Đang bắt đầu..." : "Đã kết thúc");
                setIsUrgent(true);
                return;
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            setIsUrgent(days === 0 && hours === 0 && minutes < 10); // Urgent if less than 10 minutes

            let timeString = "";
            if (days > 0) {
                timeString = `${days} ngày ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            } else if (hours > 0) {
                timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            } else {
                timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            }

            setTimeLeft(prefix + timeString);
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(timer);
    }, [startTime, endTime, phase]);

    if (!timeLeft) return null;

    const baseClasses = "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase";
    let colorClasses = "";

    if (isUrgent) {
        colorClasses = "text-rose-300 bg-rose-500/20";
    } else if (phase === "Upcoming") {
        colorClasses = "text-indigo-300 bg-indigo-500/20";
    } else if (phase === "Ongoing") {
        colorClasses = "text-emerald-300 bg-emerald-500/20";
    } else {
        colorClasses = "text-greyscale-400 bg-greyscale-800";
    }

    return (
        <span className={`${baseClasses} ${colorClasses}`}>
            <MdTimer size={14} className="mr-0.5" />
            {timeLeft}
        </span>
    );
}

