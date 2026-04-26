"use client";

import React from "react";
import {
    useGetCompetitionLeaderboard,
    useGetMyCompetitionParticipation
} from "@/hooks/competitions/useCompetitions";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { MdEmojiEvents, MdOutlineTimer, MdPerson } from "react-icons/md";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

interface MemberCompetitionLeaderboardTabProps {
    competitionId: string;
    isRegistered?: boolean;
}

export default function MemberCompetitionLeaderboardTab({
    competitionId,
    isRegistered
}: MemberCompetitionLeaderboardTabProps) {
    const { data: leaderboardData, isLoading } = useGetCompetitionLeaderboard(competitionId, {
        currentPage: 1,
        pageSize: 20,
    });

    const leaderboard = leaderboardData?.data || [];
    const myEntry = leaderboard.find(e => e.isCurrentUser);

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-xl bg-white/5" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-white/5 bg-greyscale-900/50 overflow-hidden backdrop-blur-sm">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-none hover:bg-transparent">
                            <TableHead className="w-20 text-center font-black uppercase text-[10px] tracking-widest text-greyscale-500">Hạng</TableHead>
                            <TableHead className="font-black uppercase text-[10px] tracking-widest text-greyscale-500">Thí sinh</TableHead>
                            <TableHead className="text-center font-black uppercase text-[10px] tracking-widest text-greyscale-500">Điểm số</TableHead>
                            <TableHead className="text-center font-black uppercase text-[10px] tracking-widest text-greyscale-500">Thời gian</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {leaderboard.map((entry) => {
                            const isMe = entry.isCurrentUser;
                            const rank = entry.rank;

                            return (
                                <TableRow
                                    key={entry.user.userId}
                                    className={cn(
                                        "border-white/5 transition-all duration-300",
                                        isMe ? "bg-primary/10 hover:bg-primary/15 border-l-4 border-l-primary" : "hover:bg-white/5"
                                    )}
                                >
                                    <TableCell className="text-center">
                                        <div className="flex justify-center">
                                            {rank === 1 ? (
                                                <div className="h-8 w-8 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-400/20">
                                                    <MdEmojiEvents size={20} />
                                                </div>
                                            ) : rank === 2 ? (
                                                <div className="h-8 w-8 rounded-full bg-greyscale-300/20 flex items-center justify-center text-greyscale-300 shadow-lg shadow-greyscale-300/20">
                                                    <MdEmojiEvents size={20} />
                                                </div>
                                            ) : rank === 3 ? (
                                                <div className="h-8 w-8 rounded-full bg-orange-400/20 flex items-center justify-center text-orange-400 shadow-lg shadow-orange-400/20">
                                                    <MdEmojiEvents size={20} />
                                                </div>
                                            ) : (
                                                <span className="text-sm font-bold text-greyscale-400">{rank}</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 border border-white/10">
                                                <AvatarImage src={entry.user.avatarUrl || undefined} />
                                                <AvatarFallback className="bg-greyscale-800">
                                                    <MdPerson className="text-greyscale-400" />
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-bold text-sm text-greyscale-100 flex items-center gap-2">
                                                    {entry.user.fullName}
                                                    {isMe && (
                                                        <span className="px-1.5 py-0.5 rounded-full bg-primary/20 text-primary text-[8px] font-black uppercase tracking-widest border border-primary/20">
                                                            Bạn
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[10px] text-greyscale-500 font-medium">{entry.user.email}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className="text-sm font-black text-indigo-400">
                                            {entry.totalScore.toLocaleString()}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-1 text-greyscale-400">
                                            <MdOutlineTimer size={14} className="opacity-60" />
                                            <span className="text-xs font-medium">{entry.totalTime || "--:--"}</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}

                        {leaderboard.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="h-32 text-center text-greyscale-500 italic border-none">
                                    Chưa có dữ liệu xếp hạng
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {isRegistered && (
                <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
                            <MdEmojiEvents size={22} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest">Thứ hạng của bạn</p>
                            <p className="text-lg font-bold text-greyscale-50">
                                {myEntry ? `Hạng ${myEntry.rank}` : "Vị trí của bạn nằm ngoài danh sách hiện tại"}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-greyscale-500 uppercase tracking-widest">Tổng điểm</p>
                        <p className="text-lg font-black text-indigo-400">{myEntry ? myEntry.totalScore.toLocaleString() : 0}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
