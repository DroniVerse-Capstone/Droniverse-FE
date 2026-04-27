"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
import { MdLeaderboard, MdChevronLeft, MdChevronRight, MdSearch } from "react-icons/md";
import { Input } from "@/components/ui/input";
import { useGetRoundLeaderboard } from "@/hooks/competitions/useCompetitionRounds";
import { formatDateTime } from "@/lib/utils/format-date";

interface RoundLeaderboardDialogProps {
    roundId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function RoundLeaderboardDialog({
    roundId,
    open,
    onOpenChange,
}: RoundLeaderboardDialogProps) {
    const [page, setPage] = useState(1);
    const [searchName, setSearchName] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const pageSize = 10;

    // Optional: implement a simple debounce for searching
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchName);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchName]);

    const { data, isLoading } = useGetRoundLeaderboard(roundId, {
        currentPage: page,
        pageSize,
        searchName: debouncedSearch || undefined,
    });

    const entries = data?.data?.roundEntries || [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[900px] bg-greyscale-900 border-greyscale-800 text-greyscale-50 p-0 overflow-hidden">
                <div className="flex flex-col h-[85vh] max-h-[800px]">
                    <DialogHeader className="px-6 py-4 border-b border-greyscale-800 bg-greyscale-950/50">
                        <DialogTitle className="flex items-center gap-3 text-xl font-bold uppercase tracking-tight">
                            <div className="p-2 rounded-xl bg-primary/20 text-primary">
                                <MdLeaderboard size={24} />
                            </div>
                            Bảng xếp hạng vòng thi
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 flex flex-col p-6 overflow-hidden gap-4 bg-greyscale-950">
                        {/* Filters */}
                        <div className="flex items-center justify-between">
                            <div className="relative w-72">
                                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-greyscale-500" size={20} />
                                <Input
                                    placeholder="Tìm kiếm thí sinh..."
                                    value={searchName}
                                    onChange={(e) => setSearchName(e.target.value)}
                                    className="pl-10 bg-black/20 border-greyscale-700 text-greyscale-100 placeholder:text-greyscale-600 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500/50 hover:border-greyscale-600 transition-all shadow-inner"
                                />
                            </div>
                        </div>

                        {/* Table */}
                        <div className="flex-1 rounded-2xl border border-greyscale-800 bg-greyscale-900/30 overflow-y-auto shadow-inner">
                            <Table>
                                <TableHeader className="bg-greyscale-900/80 sticky top-0 z-10 backdrop-blur-sm">
                                    <TableRow className="border-greyscale-800 hover:bg-transparent">
                                        <TableHead className="text-greyscale-400 font-black uppercase text-[10px] tracking-wider w-16 text-center">Hạng</TableHead>
                                        <TableHead className="text-greyscale-400 font-black uppercase text-[10px] tracking-wider">Thí sinh</TableHead>
                                        <TableHead className="text-greyscale-400 font-black uppercase text-[10px] tracking-wider text-right">Điểm</TableHead>
                                        <TableHead className="text-greyscale-400 font-black uppercase text-[10px] tracking-wider text-right">Thời gian</TableHead>
                                        <TableHead className="text-greyscale-400 font-black uppercase text-[10px] tracking-wider text-right">Nộp bài lúc</TableHead>
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
                                            <TableCell colSpan={5} className="h-64 text-center text-greyscale-500">
                                                Không có dữ liệu xếp hạng.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        entries.map((entry, idx) => (
                                            <TableRow 
                                                key={entry.user.userId + idx} 
                                                className={`border-greyscale-800 hover:bg-greyscale-800/50 transition-colors ${entry.isCurrentUser ? 'bg-primary/5 border-l-2 border-l-primary' : ''}`}
                                            >
                                                <TableCell className="text-center">
                                                    <span className={`inline-flex items-center justify-center h-8 min-w-8 px-2 rounded-lg font-black ${
                                                        entry.rank === 1 ? "bg-yellow-500 text-yellow-950 shadow-[0_0_15px_rgba(234,179,8,0.4)]" :
                                                        entry.rank === 2 ? "bg-greyscale-300 text-greyscale-900" :
                                                        entry.rank === 3 ? "bg-amber-700 text-amber-100" :
                                                        "bg-greyscale-800 text-greyscale-400"
                                                    }`}>
                                                        #{entry.rank > 0 ? entry.rank : "-"}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-10 w-10 border border-greyscale-700">
                                                            <AvatarImage src={entry.user.avatarUrl || undefined} />
                                                            <AvatarFallback className="bg-primary/20 text-primary font-bold">{entry.user.fullName[0]}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-bold text-greyscale-100">{entry.user.fullName}</p>
                                                                {entry.isCurrentUser && (
                                                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-primary/20 text-primary">Bạn</span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-greyscale-500">{entry.user.email}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <span className="font-mono font-black text-lg text-secondary">{entry.point}</span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <span className="font-mono text-greyscale-300 font-medium bg-greyscale-800 px-2 py-1 rounded-md">{entry.executionTime || "--:--"}</span>
                                                </TableCell>
                                                <TableCell className="text-right text-xs text-greyscale-400">
                                                    {entry.submittedAt ? formatDateTime(entry.submittedAt) : "-"}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination Controls */}
                        {data?.totalPages ? data.totalPages > 1 && (
                            <div className="flex items-center justify-between px-2 pt-2 border-t border-greyscale-800/50">
                                <p className="text-sm text-greyscale-500">
                                    Tổng cộng <span className="font-bold text-greyscale-300">{data.totalRecords}</span> bản ghi
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
                </div>
            </DialogContent>
        </Dialog>
    );
}
