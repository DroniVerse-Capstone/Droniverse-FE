"use client";

import React, { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MdLeaderboard, MdChevronLeft, MdChevronRight, MdEmojiEvents } from "react-icons/md";
import { useGetCompetitionLeaderboard } from "@/hooks/competitions/useCompetitions";
import { AxiosError } from "axios";

interface CompetitionLeaderboardTabProps {
    competitionId: string;
}

export default function CompetitionLeaderboardTab({
    competitionId,
}: CompetitionLeaderboardTabProps) {
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const { data, isLoading, error } = useGetCompetitionLeaderboard(competitionId, {
        currentPage: page,
        pageSize,
    });

    const isNotAvailableYet = error?.response?.status === 409;
    const entries = data?.data || [];

    if (isNotAvailableYet) {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full animate-pulse" />
                    <div className="relative h-32 w-32 bg-linear-to-br from-greyscale-800 to-greyscale-900 rounded-[32px] border border-white/10 flex items-center justify-center shadow-2xl">
                        <MdEmojiEvents size={64} className="text-greyscale-600 opacity-50" />
                        <div className="absolute -bottom-2 -right-2 bg-primary p-2 rounded-xl shadow-lg animate-bounce">
                            <MdLeaderboard size={24} className="text-white" />
                        </div>
                    </div>
                </div>

                <div className="max-w-md space-y-4">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                        Bảng xếp hạng đang chờ xử lý
                    </h2>
                    <p className="text-greyscale-400 text-sm leading-relaxed">
                        Dữ liệu bảng xếp hạng chung cuộc sẽ tự động hiển thị ngay sau khi cuộc thi kết thúc.
                        Manager có thể theo dõi tiến độ thi đấu thời gian thực trong phần <span className="text-primary font-bold">Giám sát</span> của các vòng thi.
                    </p>
                </div>

                {/* <div className="mt-10 flex gap-4">
                    <div className="px-4 py-2 bg-white/5 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest text-greyscale-500">
                        Chế độ: Công bố tự động
                    </div>
                </div> */}
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-greyscale-800 pb-4 gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary">
                        <MdEmojiEvents size={24} />
                        <h2 className="text-xl font-bold uppercase tracking-tight text-greyscale-50">
                            Bảng xếp hạng chung cuộc
                        </h2>
                    </div>
                    <p className="text-sm text-greyscale-400">
                        Theo dõi tổng điểm và thứ hạng của tất cả thí sinh trong toàn bộ cuộc thi.
                    </p>
                </div>
            </div>

            <div className="rounded-2xl border border-greyscale-800 bg-greyscale-900/30 overflow-hidden shadow-xl">
                <Table>
                    <TableHeader className="bg-greyscale-900/50">
                        <TableRow className="border-greyscale-800 hover:bg-transparent">
                            <TableHead className="text-greyscale-400 uppercase tracking-wider text-xs font-black text-center w-20">Hạng</TableHead>
                            <TableHead className="text-greyscale-400 uppercase tracking-wider text-xs font-black">Thí sinh</TableHead>
                            <TableHead className="text-greyscale-400 uppercase tracking-wider text-xs font-black text-right">Tổng Điểm</TableHead>
                            <TableHead className="text-greyscale-400 uppercase tracking-wider text-xs font-black text-right">Tổng Thời gian</TableHead>
                            <TableHead className="text-greyscale-400 uppercase tracking-wider text-xs font-black text-center">Trạng thái</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-64 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-3">
                                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                                        <p className="text-sm text-greyscale-500 animate-pulse">Đang tải bảng xếp hạng...</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : entries.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-64 text-center">
                                    <div className="flex flex-col items-center justify-center text-greyscale-500 space-y-2">
                                        <MdLeaderboard size={48} className="text-greyscale-700" />
                                        <p>Không có dữ liệu xếp hạng nào.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            entries.map((entry, idx) => (
                                <TableRow
                                    key={entry.user.userId + idx}
                                    className={`border-greyscale-800 hover:bg-greyscale-800/50 transition-colors group ${entry.isCurrentUser ? 'bg-primary/5 border-l-2 border-l-primary' : ''}`}
                                >
                                    <TableCell className="text-center">
                                        <span className={`inline-flex items-center justify-center h-10 min-w-10 px-2 rounded-xl font-black text-lg ${entry.rank === 1 ? "bg-yellow-500 text-yellow-950 shadow-[0_0_15px_rgba(234,179,8,0.4)]" :
                                            entry.rank === 2 ? "bg-greyscale-300 text-greyscale-900" :
                                                entry.rank === 3 ? "bg-amber-700 text-amber-100" :
                                                    "bg-greyscale-800 text-greyscale-400"
                                            }`}>
                                            #{entry.rank > 0 ? entry.rank : "-"}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-12 w-12 border-2 border-greyscale-700 group-hover:border-primary/50 transition-colors">
                                                <AvatarImage src={entry.user.avatarUrl || undefined} />
                                                <AvatarFallback className="bg-primary/20 text-primary font-bold text-lg">{entry.user.fullName[0]}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-greyscale-50 text-base">{entry.user.fullName}</p>
                                                    {entry.isCurrentUser && (
                                                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-primary/20 text-primary">Bạn</span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-greyscale-400">{entry.user.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span className="font-mono font-black text-xl text-secondary">{entry.totalScore}</span>
                                    </TableCell>
                                    <TableCell className="text-right font-mono font-bold text-greyscale-300">
                                        {entry.totalTime || "--:--:--"}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {entry.status === "ACTIVE" ? (
                                            <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border text-success bg-success/10 border-success/20">Tham gia</span>
                                        ) : entry.status === "DISQUALIFIED" ? (
                                            <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border text-error bg-error/10 border-error/20">Bị loại</span>
                                        ) : entry.status === "WITHDRAWN" ? (
                                            <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border text-greyscale-400 bg-greyscale-800 border-greyscale-700">Rút lui</span>
                                        ) : (
                                            <span className="text-greyscale-500 text-xs">-</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}

                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            {data?.totalPages ? data.totalPages > 1 && (
                <div className="flex items-center justify-between px-2">
                    <p className="text-sm text-greyscale-500">
                        Hiển thị <span className="font-bold text-greyscale-300">{entries.length}</span> trên tổng số <span className="font-bold text-greyscale-300">{data.totalRecords}</span> bản ghi
                    </p>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="h-9 w-9 border-greyscale-700 bg-greyscale-900 text-greyscale-300 hover:bg-greyscale-800 hover:text-white disabled:opacity-50"
                        >
                            <MdChevronLeft size={20} />
                        </Button>
                        <span className="text-sm font-bold text-primary px-2">
                            Trang {page} / {data.totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                            disabled={page === data.totalPages}
                            className="h-9 w-9 border-greyscale-700 bg-greyscale-900 text-greyscale-300 hover:bg-greyscale-800 hover:text-white disabled:opacity-50"
                        >
                            <MdChevronRight size={20} />
                        </Button>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
