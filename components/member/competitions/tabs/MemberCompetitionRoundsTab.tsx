"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
    MdSchedule,
    MdTimer,
    MdSportsEsports,
    MdCheckCircle,
    MdPlayArrow,
    MdLock,
} from "react-icons/md";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLocale } from "@/providers/i18n-provider";
import { Competition } from "@/validations/competitions/competitions";
import { formatDateTime } from "@/lib/utils/format-date";
import { useGetCompetitionRounds, useJoinRound, useGetMyRoundResults, useGetMyRoundResultDetail } from "@/hooks/competitions/useCompetitionRounds";
import { toast } from "react-hot-toast";
import ConfirmActionPopover from "@/components/common/ConfirmActionPopover";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

interface MemberCompetitionRoundsTabProps {
    competition: Competition;
}

const RoundCardSkeleton = () => (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between rounded-xl border border-white/5 bg-[#111927] p-5 gap-5 animate-pulse">
        <div className="flex items-center gap-5 flex-1">
            <div className="h-16 w-16 bg-white/5 rounded-xl border border-white/10" />
            <div className="space-y-2 flex-1">
                <div className="h-5 w-48 bg-white/5 rounded-md" />
                <div className="flex gap-2">
                    <div className="h-4 w-12 bg-white/5 rounded-md" />
                    <div className="h-4 w-20 bg-white/5 rounded-md" />
                </div>
            </div>
        </div>
        <div className="hidden xl:flex gap-8 px-8 border-x border-white/5">
            <div className="h-10 w-24 bg-white/5 rounded-md" />
            <div className="h-10 w-24 bg-white/5 rounded-md" />
        </div>
        <div className="h-11 w-40 bg-white/5 rounded-xl self-end sm:self-center" />
    </div>
);

export default function MemberCompetitionRoundsTab({
    competition,
}: MemberCompetitionRoundsTabProps) {
    const locale = useLocale();
    const queryClient = useQueryClient();

    // 1. Hook for competition rounds
    const { data: rounds, isLoading, refetch } = useGetCompetitionRounds(competition.competitionID);

    // 2. Local state for polling control
    const [shouldPoll, setShouldPoll] = useState(false);

    // 3. Hook for personal results with dynamic polling
    const { data: myResultsRaw, isLoading: isLoadingMyResults } = useGetMyRoundResults({
        pageSize: 20,
        refetchInterval: shouldPoll ? 10000 : false
    });

    const joinMutation = useJoinRound();

    // 4. Extract results array safely - STABLE during refetches
    const resultsArray = useMemo(() => {
        const data = myResultsRaw?.data;
        if (!data) {
            if (Array.isArray(myResultsRaw)) return myResultsRaw;
            return [];
        }
        if (Array.isArray(data)) return data;
        if (Array.isArray(data.data)) return data.data;
        return [];
    }, [myResultsRaw]);

    // 5. Update polling status based on results
    useEffect(() => {
        if (resultsArray.length === 0 && !isLoadingMyResults) return;
        const hasInProgress = resultsArray.some((r: any) => {
            const status = r.userRoundResult?.status || r.status || r.userRoundStatus;
            return status === "InProgress";
        });
        setShouldPoll(hasInProgress);
    }, [resultsArray, isLoadingMyResults]);

    const handleJoin = async (roundId: string) => {
        try {
            await joinMutation.mutateAsync(roundId);
            toast.success("Đã ghi nhận tham gia thành công!");
            queryClient.invalidateQueries({ queryKey: ["my-round-results"] });
            refetch();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Không thể tham gia vòng thi. Vui lòng thử lại.");
        }
    };

    // ONLY show skeletons if we have ABSOLUTELY NO data yet.
    const isInitialLoading = (isLoading && !rounds) || (isLoadingMyResults && resultsArray.length === 0);

    return (
        <div className="space-y-6 pb-16 min-h-[60vh]">
            {/* Header Section */}
            <div className="flex flex-col items-center justify-center text-center space-y-3 mb-8 mt-6">
                <div className="h-12 w-12 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center border border-indigo-500/20 mb-1 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                    <MdSportsEsports className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                    <h2 className="text-3xl font-black text-white tracking-tight">
                        Lịch trình thi đấu
                    </h2>
                    <p className="text-greyscale-400 max-w-xl mx-auto text-[11px] font-black uppercase tracking-[0.15em] opacity-50">
                        Thử thách kỹ năng bay Drone của bạn
                    </p>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {isInitialLoading ? (
                    <motion.div
                        key="skeletons"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="grid grid-cols-1 gap-4 max-w-5xl mx-auto"
                    >
                        {[1, 2, 3].map((i) => <RoundCardSkeleton key={i} />)}
                    </motion.div>
                ) : !rounds || rounds.length === 0 ? (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-greyscale-800 bg-greyscale-900/40 p-16 text-center max-w-2xl mx-auto backdrop-blur-md shadow-2xl"
                    >
                        <div className="mb-6 rounded-2xl bg-greyscale-800/50 p-8 text-greyscale-600 border border-white/5 shadow-inner">
                            <MdSchedule size={48} className="opacity-40 animate-pulse" />
                        </div>
                        <h3 className="mb-3 text-2xl font-black text-white uppercase tracking-tight">
                            Đang cập nhật lịch trình
                        </h3>
                        <p className="text-greyscale-500 text-sm font-medium">Hệ thống đang sắp xếp các vòng thi, vui lòng quay lại sau ít phút.</p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 gap-4 max-w-5xl mx-auto"
                    >
                        {[...rounds].sort((a, b) => a.roundNumber - b.roundNumber).map((round, index, sortedRounds) => {
                            const isUpcoming = round.roundPhase === "Upcoming";
                            const isOngoing = round.roundPhase === "Ongoing";
                            const isFinished = round.roundPhase === "Finished";

                            const currentRoundID = (round.roundID || (round as any).roundId)?.toString().trim();

                            const myResult = resultsArray.find((r: any) => {
                                const rInfo = r.roundInfo || r;
                                const resID = (rInfo.roundId || rInfo.roundID || r.roundId || r.roundID)?.toString().trim();
                                return resID?.toLowerCase() === currentRoundID?.toLowerCase();
                            });

                            const userRoundStatus = myResult?.userRoundResult?.status || myResult?.status || (myResult as any)?.userRoundStatus;
                            const isJoined = !!myResult;
                            const isInProgress = userRoundStatus === "InProgress";

                            let isLockedByOrder = false;
                            if (index > 0) {
                                const prevRound = sortedRounds[index - 1];
                                const prevRoundID = (prevRound.roundID || (prevRound as any).roundId)?.toString().trim();
                                const prevResult = resultsArray.find((r: any) => {
                                    const rInfo = r.roundInfo || r;
                                    const resID = (rInfo.roundId || rInfo.roundID || r.roundId || r.roundID)?.toString().trim();
                                    return resID?.toLowerCase() === prevRoundID?.toLowerCase();
                                });
                                const prevStatus = prevResult?.userRoundResult?.status || prevResult?.status || (prevResult as any)?.userRoundStatus;
                                const prevIsCompleted = !!prevResult && prevStatus !== "InProgress";

                                if (!prevIsCompleted) {
                                    isLockedByOrder = true;
                                }
                            }

                            return (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    key={round.roundID}
                                    className={cn(
                                        "group relative flex flex-col lg:flex-row lg:items-center justify-between rounded-xl border p-5 transition-all duration-300 gap-5 overflow-hidden",
                                        isOngoing && !isLockedByOrder
                                            ? "bg-[#1A253A] border-emerald-500/30 shadow-sm"
                                            : "bg-[#111927] border-white/5",
                                        isLockedByOrder && "opacity-60 grayscale-[0.5]"
                                    )}
                                >
                                    {/* Left Section: ID & Title */}
                                    <div className="flex items-center gap-5 flex-1 min-w-0">
                                        <div className={cn(
                                            "flex flex-col items-center justify-center h-16 w-16 min-w-[64px] rounded-xl border-2 transition-all duration-300",
                                            (isOngoing && !isLockedByOrder) ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-black/40 border-white/10 text-greyscale-500"
                                        )}>
                                            {isLockedByOrder ? (
                                                <MdLock size={24} className="opacity-40" />
                                            ) : (
                                                <>
                                                    <span className="text-[9px] font-black uppercase tracking-widest opacity-50">Vòng</span>
                                                    <span className="text-2xl font-black font-mono leading-none">
                                                        {String(round.roundNumber).padStart(2, '0')}
                                                    </span>
                                                </>
                                            )}
                                        </div>

                                        <div className="space-y-2 flex-1 min-w-0">
                                            <h3 className="text-lg font-bold text-white truncate transition-colors group-hover:text-indigo-400">
                                                {locale === "en" ? round.vrSimulator?.titleEN : round.vrSimulator?.titleVN || "Vòng thi thử thách"}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-2">
                                                {round.weight && (
                                                    <div className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border bg-white/5 text-greyscale-400 border-white/10">
                                                        {round.weight === 1 ? "Dễ" : round.weight === 2 ? "Trung bình" : "Khó"}
                                                    </div>
                                                )}
                                                {isLockedByOrder ? (
                                                    <div className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-white/5 text-greyscale-500 border border-white/10 flex items-center gap-1">
                                                        <MdLock size={10} />
                                                        Cần hoàn thành vòng trước
                                                    </div>
                                                ) : (
                                                    <div className={cn(
                                                        "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border",
                                                        isOngoing
                                                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                                            : "bg-white/5 text-greyscale-500 border-white/10"
                                                    )}>
                                                        {isUpcoming ? "Sắp diễn ra" : isOngoing ? "Đang diễn ra" : "Đã kết thúc"}
                                                    </div>
                                                )}

                                                {isJoined && !isLockedByOrder && (
                                                    <div className={cn(
                                                        "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border flex items-center gap-1",
                                                        isInProgress 
                                                            ? "bg-white/5 text-greyscale-400 border-white/10" 
                                                            : (myResult?.userRoundResult?.isPassed === false || myResult?.isPassed === false)
                                                                ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                                                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                    )}>
                                                        {isInProgress ? (
                                                            <MdSportsEsports size={11} />
                                                        ) : (myResult?.userRoundResult?.isPassed === false || myResult?.isPassed === false) ? (
                                                            <MdLock size={11} className="text-rose-400" />
                                                        ) : (
                                                            <MdCheckCircle size={11} className="text-emerald-400" />
                                                        )}
                                                        {isInProgress ? "Đang thi" : (myResult?.userRoundResult?.isPassed === false || myResult?.isPassed === false) ? "Thất bại" : "Hoàn thành"}
                                                    </div>
                                                )}

                                                <RoundCountdown
                                                    startTime={round.startTime}
                                                    endTime={round.endTime}
                                                    phase={round.roundPhase}
                                                    onEnd={() => {
                                                        setTimeout(() => {
                                                            queryClient.invalidateQueries({ queryKey: ["competition-rounds", competition.competitionID] });
                                                            queryClient.invalidateQueries({ queryKey: ["my-round-results"] });
                                                            refetch();
                                                        }, 2000);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Middle Section: Timing Info */}
                                    <div className="hidden xl:flex items-center gap-8 px-8 border-x border-white/5">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[9px] font-black text-greyscale-500 uppercase tracking-widest flex items-center gap-1.5 opacity-60">
                                                <MdSchedule className="text-indigo-400 h-3.5 w-3.5" />
                                                Khung giờ thi
                                            </span>
                                            <div className="text-xs font-bold text-greyscale-200">
                                                {(() => {
                                                    const startParts = formatDateTime(round.startTime).split(' ');
                                                    const endParts = formatDateTime(round.endTime).split(' ');
                                                    const sameDay = startParts[1] === endParts[1];
                                                    if (sameDay) {
                                                        return (
                                                            <>
                                                                {startParts[0]} – {endParts[0]}
                                                                <div className="text-[9px] text-greyscale-500 font-medium">Ngày {startParts[1]}</div>
                                                            </>
                                                        );
                                                    }
                                                    return (
                                                        <>
                                                            <span className="text-indigo-300">{startParts[0]}</span>
                                                            <span className="text-greyscale-500 text-[9px] font-medium"> {startParts[1]}</span>
                                                            <span className="mx-1 text-greyscale-600">–</span>
                                                            <span className="text-indigo-300">{endParts[0]}</span>
                                                            <span className="text-greyscale-500 text-[9px] font-medium"> {endParts[1]}</span>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[9px] font-black text-greyscale-500 uppercase tracking-widest flex items-center gap-1.5 opacity-60">
                                                <MdTimer className="text-emerald-400 h-3.5 w-3.5" />
                                                Thời lượng
                                            </span>
                                            <div className="text-xs font-bold text-greyscale-200">
                                                <span className="text-indigo-400">{parseInt(round.timeLimit.split(':')[1])}</span> phút
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Section: Action Button & Results */}
                                    <div className="flex items-center justify-end min-w-[200px]">
                                        {isJoined ? (
                                            <div className="flex flex-col items-end gap-1.5 w-full sm:w-auto">
                                                {isInProgress ? (
                                                    <>
                                                        <div className="h-11 px-6 rounded-xl border border-white/10 bg-white/5 text-greyscale-300 flex items-center justify-center text-[10px] font-black uppercase tracking-widest gap-2 w-full sm:w-auto">
                                                            <MdSportsEsports size={18} />
                                                            Đang thi trên VR
                                                        </div>
                                                        <span className="text-[9px] text-greyscale-500 font-bold uppercase italic mr-1 tracking-wide">Đã sẵn sàng trong kính VR</span>
                                                    </>
                                                ) : (
                                                    <RoundResultDisplay roundId={round.roundID} />
                                                )}
                                            </div>
                                        ) : isOngoing ? (
                                            isLockedByOrder ? (
                                                <div className="h-11 px-6 rounded-xl border border-white/5 bg-white/5 flex items-center justify-center text-[10px] font-black text-greyscale-600 uppercase tracking-widest gap-2 w-full sm:w-auto opacity-40 cursor-not-allowed">
                                                    <MdLock size={16} />
                                                    Chưa mở khóa
                                                </div>
                                            ) : (
                                                <Button
                                                    disabled={joinMutation.isPending}
                                                    onClick={() => handleJoin(round.roundID)}
                                                    className="h-11 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-wider text-[10px] gap-2 shadow-lg shadow-indigo-600/20 border-none transition-all active:scale-95 w-full sm:w-auto"
                                                >
                                                    {joinMutation.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : <MdPlayArrow size={20} />}
                                                    Vào thi
                                                </Button>
                                            )
                                        ) : (
                                            <div className="h-11 px-6 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-[10px] font-black text-greyscale-500 uppercase tracking-widest italic w-full sm:w-auto opacity-60">
                                                {isFinished ? "Vòng thi đã đóng" : "Sắp diễn ra"}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Countdown component
function RoundCountdown({ startTime, endTime, phase, onEnd }: { startTime: string, endTime: string, phase: string | null | undefined, onEnd?: () => void }) {
    const [timeLeft, setTimeLeft] = useState<string>("");
    const [isUrgent, setIsUrgent] = useState(false);
    const hasEndedRef = React.useRef(false);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const start = new Date(startTime).getTime();
            const end = new Date(endTime).getTime();

            let targetTime = 0;
            let prefix = "";

            if (phase === "Upcoming") {
                targetTime = start;
                prefix = "Mở sau: ";
                setIsUrgent(false);
            } else if (phase === "Ongoing") {
                targetTime = end;
                prefix = "Hạn thi: ";
                setIsUrgent((end - now) < 30 * 60 * 1000);
            } else {
                setTimeLeft("");
                return;
            }

            const difference = targetTime - now;

            if (difference <= 0) {
                setTimeLeft("");
                if (!hasEndedRef.current) {
                    hasEndedRef.current = true;
                    onEnd?.();
                }
                return;
            }

            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            let timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            setTimeLeft(prefix + timeString);
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(timer);
    }, [startTime, endTime, phase, onEnd]);

    if (!timeLeft) return null;

    return (
        <span className={cn(
            "flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border shadow-sm",
            isUrgent ? "text-rose-400 bg-rose-500/10 border-rose-500/20 animate-pulse" :
                "text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
        )}>
            <MdTimer size={12} className="opacity-70" />
            {timeLeft}
        </span>
    );
}

// Sub-component to fetch and display specific round result details
function RoundResultDisplay({ roundId }: { roundId: string }) {
    const { data: detailRaw, isLoading } = useGetMyRoundResultDetail(roundId);

    const detail = useMemo(() => {
        if (!detailRaw) return null;
        return detailRaw.data || detailRaw;
    }, [detailRaw]);

    const isPassed = detail?.isPassed !== false; // Mặc định là true trừ khi explicitly là false

    return (
        <div className={cn(
            "flex items-center gap-4 border rounded-xl p-3 px-5 transition-all min-w-[180px] h-[52px]",
            isPassed 
                ? "bg-emerald-500/5 border-emerald-500/20" 
                : "bg-rose-500/5 border-rose-500/20"
        )}>
            {isLoading ? (
                <div className="flex items-center justify-center w-full gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-500/50" />
                    <span className="text-[10px] font-bold text-greyscale-500 uppercase tracking-widest">Đang tải...</span>
                </div>
            ) : (
                <div className="flex items-center gap-4 w-full animate-in fade-in duration-500">
                    <div className={cn(
                        "flex flex-col items-center border-r pr-4 flex-1",
                        isPassed ? "border-emerald-500/10" : "border-rose-500/10"
                    )}>
                        <span className={cn(
                            "text-[8px] font-black uppercase tracking-widest mb-1",
                            isPassed ? "text-emerald-500/60" : "text-rose-500/60"
                        )}>Điểm số</span>
                        <span className={cn(
                            "text-xl font-black leading-none",
                            isPassed ? "text-emerald-400" : "text-rose-400"
                        )}>
                            {detail?.point ?? 0}
                        </span>
                    </div>
                    <div className="flex flex-col items-end flex-1">
                        <span className={cn(
                            "text-[8px] font-black uppercase tracking-widest mb-1",
                            isPassed ? "text-emerald-500/60" : "text-rose-500/60"
                        )}>Thời gian</span>
                        <span className="text-sm font-bold text-white leading-none">
                            {detail?.executionTime?.split('.')[0] || "00:00"}
                        </span>
                    </div>
                    <div className={cn(
                        "ml-1 h-7 w-7 rounded-full flex items-center justify-center",
                        isPassed ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                    )}>
                        {isPassed ? <MdCheckCircle size={16} /> : <MdLock size={16} />}
                    </div>
                </div>
            )}
        </div>
    );
}
