"use client";

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
    MdAssignmentInd, 
    MdStars, 
    MdEmojiEvents,
    MdCheckCircle,
    MdCancel,
    MdAccessTime,
    MdFlag,
} from "react-icons/md";
import { useGetUserRoundResultDetail } from "@/hooks/competitions/useCompetitionRounds";
import { formatDateTime } from "@/lib/utils/format-date";
import { cn } from "@/lib/utils";

interface UserRoundDetailDialogProps {
    userId: string;
    userName: string;
    userAvatar?: string | null;
    userEmail: string;
    roundId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: {
        status: string;
        point: number | null;
        rank: number | null;
        startedAt: string | null;
        submittedAt: string | null;
        executionTime: string | null;
        isPassed?: boolean;
    };
}

export default function UserRoundDetailDialog({
    userId,
    userName,
    userAvatar,
    userEmail,
    roundId,
    open,
    onOpenChange,
    initialData,
}: UserRoundDetailDialogProps) {
    const { data: detail, isLoading } = useGetUserRoundResultDetail(userId, roundId);

    // Merge data: prioritize real detail, fallback to initialData
    const status = detail?.status || initialData?.status;
    const point = detail?.point ?? initialData?.point;
    const rank = detail?.rank ?? initialData?.rank;
    const startedAt = detail?.startedAt || initialData?.startedAt;
    const submittedAt = detail?.submittedAt || initialData?.submittedAt;
    const executionTime = detail?.executionTime || initialData?.executionTime;
    const isPassed = detail?.isPassed ?? initialData?.isPassed;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px] bg-[#0B1221] bg-gradient-to-br from-[#111927] to-[#0B1221] border-white/10 text-greyscale-50 p-0 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/5">
                <DialogHeader className="px-6 py-5 border-b border-white/[0.08] bg-white/[0.02]">
                    <DialogTitle className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-greyscale-400">
                        <MdAssignmentInd size={18} className="text-primary shadow-sm" />
                        Chi tiết bài thi
                    </DialogTitle>
                </DialogHeader>

                {isLoading && !initialData ? (
                    <div className="h-[350px] flex flex-col items-center justify-center space-y-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        <p className="text-[10px] text-greyscale-500 font-bold uppercase tracking-widest">Đang tải dữ liệu...</p>
                    </div>
                ) : (status || point !== undefined) ? (
                    <div className="p-6 space-y-6">
                        {/* Student Header */}
                        <div className="flex items-center gap-4">
                            <Avatar className="h-14 w-14 border border-white/10">
                                <AvatarImage src={userAvatar || undefined} />
                                <AvatarFallback className="bg-greyscale-900 text-white font-black">{userName.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-0.5">
                                <h3 className="text-lg font-bold text-white leading-tight">{userName}</h3>
                                <p className="text-xs text-greyscale-500 font-medium">{userEmail}</p>
                                <div className="pt-1">
                                    <span className={cn(
                                        "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider",
                                        status === "Completed" ? "bg-emerald-500/10 text-emerald-400" :
                                        status === "InProgress" ? "bg-sky-500/10 text-sky-400" :
                                        "bg-rose-500/10 text-rose-400"
                                    )}>
                                        {status === "Completed" ? "Đã hoàn thành" : status === "InProgress" ? "Đang thi" : "Bị loại"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 rounded-xl bg-white/[0.05] border border-white/[0.08] flex flex-col items-center gap-1 shadow-sm">
                                <span className="text-[9px] font-black text-greyscale-400 uppercase tracking-widest">Điểm số</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-black text-white">{point ?? 0}</span>
                                    <span className="text-[10px] font-bold text-greyscale-500">đ</span>
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-white/[0.05] border border-white/[0.08] flex flex-col items-center gap-1 shadow-sm">
                                <span className="text-[9px] font-black text-greyscale-400 uppercase tracking-widest">Thứ hạng</span>
                                <div className="flex items-baseline gap-0.5">
                                    <span className="text-[10px] font-black text-amber-500">#</span>
                                    <span className="text-2xl font-black text-white">{rank ?? "--"}</span>
                                </div>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-greyscale-500 uppercase tracking-widest px-1">Lịch trình thi</span>
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/[0.08] border border-white/10 shadow-sm">
                                    <MdAccessTime size={12} className="text-primary" />
                                    <span className="text-[10px] font-bold text-greyscale-300">Thực hiện: <span className="text-white font-mono">{executionTime || "--:--"}</span></span>
                                </div>
                            </div>

                            <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-5 relative">
                                <div className="absolute left-[2.4rem] top-8 bottom-8 w-px bg-white/10" />
                                
                                <div className="flex items-center gap-5 relative">
                                    <div className="h-2.5 w-2.5 rounded-full bg-primary z-10 shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                                    <div className="flex-1 flex justify-between items-center">
                                        <span className="text-[10px] font-black text-greyscale-400 uppercase tracking-widest">Bắt đầu</span>
                                        <div className="flex flex-col items-end">
                                            <span className="text-xl font-black text-white font-mono leading-none">
                                                {startedAt ? formatDateTime(startedAt).split(' ')[1] : "--:--"}
                                            </span>
                                            <span className="text-[11px] text-greyscale-500 font-bold mt-1">
                                                {startedAt ? formatDateTime(startedAt).split(' ')[0] : ""}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-5 relative">
                                    <div className={cn(
                                        "h-2.5 w-2.5 rounded-full z-10 shadow-sm",
                                        status === "Completed" ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-greyscale-700"
                                    )} />
                                    <div className="flex-1 flex justify-between items-center">
                                        <span className="text-[10px] font-black text-greyscale-400 uppercase tracking-widest">Kết thúc</span>
                                        <div className="flex flex-col items-end">
                                            <span className={cn(
                                                "text-xl font-black font-mono leading-none",
                                                status === "Completed" ? "text-emerald-400" : "text-greyscale-400"
                                            )}>
                                                {submittedAt ? formatDateTime(submittedAt).split(' ')[1] : (status === "InProgress" ? "..." : "--:--")}
                                            </span>
                                            <span className="text-[11px] text-greyscale-500 font-bold mt-1">
                                                {submittedAt ? formatDateTime(submittedAt).split(' ')[0] : ""}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Verdict */}
                        {status === "Completed" && (
                            <div className={cn(
                                "flex items-center justify-between p-4 rounded-xl border transition-all",
                                isPassed ? "bg-emerald-500/5 border-emerald-500/20" : "bg-rose-500/5 border-rose-500/20"
                            )}>
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "h-10 w-10 rounded-lg flex items-center justify-center",
                                        isPassed ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                                    )}>
                                        {isPassed ? <MdCheckCircle size={24} /> : <MdCancel size={24} />}
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Kết luận bài thi</p>
                                        <p className={cn(
                                            "text-lg font-black uppercase italic tracking-wider",
                                            isPassed ? "text-emerald-400" : "text-rose-400"
                                        )}>
                                            {isPassed ? "Vượt qua" : "Không đạt"}
                                        </p>
                                    </div>
                                </div>
                                <MdFlag className="text-greyscale-700" size={20} />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-[350px] flex items-center justify-center text-greyscale-500 italic text-xs">
                        Không tìm thấy dữ liệu bài thi.
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
