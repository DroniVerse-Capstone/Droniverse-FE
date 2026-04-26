"use client";

import React from "react";
import {
    MdOutlineEmojiEvents,
    MdCardGiftcard,
    MdCurrencyExchange,
} from "react-icons/md";
import { Spinner } from "@/components/ui/spinner";
import { useGetCompetitionPrizes } from "@/hooks/competitions/useCompetitionPrizes";
import { cn } from "@/lib/utils";

interface MemberCompetitionPrizesTabProps {
    competitionId: string;
}

export default function MemberCompetitionPrizesTab({
    competitionId,
}: MemberCompetitionPrizesTabProps) {
    const { data: prizes = [], isLoading } = useGetCompetitionPrizes(competitionId);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Header */}
            <div className="flex flex-col items-center justify-center text-center space-y-4 mb-6 mt-4">
                <div className="h-16 w-16 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center border border-amber-500/20 shadow-[0_0_20px_rgba(251,191,36,0.15)]">
                    <MdOutlineEmojiEvents className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-3xl font-black text-transparent bg-clip-text bg-linear-to-r from-amber-200 via-amber-400 to-amber-200">
                        Cơ cấu giải thưởng
                    </h2>
                    <p className="text-greyscale-400 max-w-xl mx-auto">
                        Khám phá những phần quà hấp dẫn và giá trị đang chờ đợi các tay đua xuất sắc nhất tại giải đấu lần này.
                    </p>
                </div>
            </div>

            {isLoading ? (
                <div className="flex h-40 items-center justify-center">
                    <Spinner className="h-8 w-8 text-amber-500" />
                </div>
            ) : prizes.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-greyscale-800 bg-greyscale-900/40 p-12 text-center max-w-2xl mx-auto">
                    <MdOutlineEmojiEvents className="mx-auto h-12 w-12 text-greyscale-600 mb-4" />
                    <h3 className="text-xl font-bold text-greyscale-300 mb-2">Đang cập nhật giải thưởng</h3>
                    <p className="text-greyscale-500">Ban tổ chức đang lên danh sách giải thưởng. Bạn hãy quay lại xem sau nhé!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {prizes.map((prize) => (
                        <div
                            key={prize.competitionPrizeID}
                            className="group relative overflow-hidden rounded-[24px] border border-white/5 bg-linear-to-b from-[#131B2C] to-[#0B101A] flex flex-col transition-all hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(251,191,36,0.1)] hover:border-amber-500/30"
                        >
                            {/* Epic Glow */}
                            <div className="absolute -top-20 -right-20 w-48 h-48 bg-amber-500/10 blur-[60px] rounded-full pointer-events-none transition-colors duration-700 group-hover:bg-amber-500/20" />

                            <div className="p-6 flex-1 flex flex-col relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <span className={cn(
                                        "px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border shadow-lg backdrop-blur-md",
                                        prize.rankFrom === 1 
                                            ? "bg-amber-500/20 text-amber-400 border-amber-500/30" 
                                            : prize.rankFrom === 2
                                                ? "bg-slate-300/20 text-slate-300 border-slate-300/30"
                                                : prize.rankFrom === 3
                                                    ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                                                    : "bg-primary/20 text-primary border-primary/30"
                                    )}>
                                        Hạng {prize.rankFrom === prize.rankTo ? prize.rankFrom : `${prize.rankFrom} - ${prize.rankTo}`}
                                    </span>
                                </div>
                                
                                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-amber-300 transition-colors" title={prize.titleVN}>
                                    {prize.titleVN}
                                </h3>
                                
                                <p className="text-sm text-greyscale-400 line-clamp-2 leading-relaxed flex-1">
                                    {prize.descriptionVN || "Phần thưởng vinh danh thành tích xuất sắc của tay đua."}
                                </p>
                            </div>

                            <div className="p-6 pt-0 relative z-10">
                                <div className={cn(
                                    "rounded-2xl p-4 flex items-center gap-4 border transition-colors",
                                    prize.rewardType === "MONEY" 
                                        ? "bg-emerald-500/10 border-emerald-500/20 group-hover:border-emerald-500/40" 
                                        : "bg-indigo-500/10 border-indigo-500/20 group-hover:border-indigo-500/40"
                                )}>
                                    <div className={cn(
                                        "h-12 w-12 rounded-xl flex items-center justify-center text-2xl shadow-inner shrink-0",
                                        prize.rewardType === "MONEY" ? "bg-emerald-500/20 text-emerald-400" : "bg-indigo-500/20 text-indigo-400"
                                    )}>
                                        {prize.rewardType === "MONEY" ? <MdCurrencyExchange /> : <MdCardGiftcard />}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[10px] text-greyscale-400 font-bold uppercase tracking-widest mb-1 truncate">
                                            {prize.rewardType === "MONEY" ? "Tiền mặt" : "Hiện vật"}
                                        </span>
                                        <span className={cn(
                                            "text-xl font-black tracking-tight truncate",
                                            prize.rewardType === "MONEY" ? "text-emerald-400" : "text-indigo-400"
                                        )}>
                                            {prize.rewardType === "MONEY" ? formatCurrency(prize.rewardValueMoney || 0) : (prize.rewardValueGiftVN || "Phần quà đặc biệt")}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
