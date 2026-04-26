"use client";

import React, { useState } from "react";
import { Competition, ParticipantStatus } from "@/validations/competitions/competitions";
import { useGetCompetitionParticipants } from "@/hooks/competitions/useCompetitions";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MdPeopleAlt, MdChevronLeft, MdChevronRight, MdPersonRemove } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils/format-date";

interface MemberCompetitionParticipantsTabProps {
    competition: Competition;
}

export default function MemberCompetitionParticipantsTab({
    competition,
}: MemberCompetitionParticipantsTabProps) {
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const { data, isLoading } = useGetCompetitionParticipants(competition.competitionID, {
        status: null, // Members see everyone
        currentPage: page,
        pageSize,
    });

    const getStatusColor = (s?: string | null) => {
        switch (s) {
            case "ACTIVE": return "text-success bg-success/10 border-success/20";
            case "DISQUALIFIED": return "text-error bg-error/10 border-error/20";
            case "WITHDRAWN": return "text-greyscale-400 bg-greyscale-800 border-greyscale-700";
            default: return "text-greyscale-300 bg-greyscale-800 border-greyscale-700";
        }
    };

    const translateStatus = (s?: string | null) => {
        switch (s) {
            case "ACTIVE": return "Tham gia";
            case "DISQUALIFIED": return "Bị loại";
            case "WITHDRAWN": return "Rút lui";
            default: return "Chưa xác định";
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-greyscale-800 pb-4 gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary">
                        <MdPeopleAlt size={24} />
                        <h2 className="text-xl font-bold uppercase tracking-tight text-greyscale-50">
                            Danh sách thí sinh
                        </h2>
                    </div>
                    <p className="text-sm text-greyscale-400">
                        Danh sách các phi công tham gia cuộc thi này.
                    </p>
                </div>
            </div>

            <div className="rounded-2xl border border-greyscale-800 bg-greyscale-900/30 overflow-hidden shadow-xl">
                <Table>
                    <TableHeader className="bg-greyscale-900/50">
                        <TableRow className="border-greyscale-800 hover:bg-transparent">
                            <TableHead className="text-greyscale-400 uppercase tracking-wider text-xs font-black">Thí sinh</TableHead>
                            <TableHead className="text-greyscale-400 uppercase tracking-wider text-xs font-black text-center">Trạng thái</TableHead>
                            <TableHead className="text-greyscale-400 uppercase tracking-wider text-xs font-black text-right">Tham gia lúc</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={3} className="h-48 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-3">
                                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                                        <p className="text-sm text-greyscale-500 animate-pulse">Đang tải danh sách...</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : !data?.participations?.data?.length ? (
                            <TableRow>
                                <TableCell colSpan={3} className="h-48 text-center">
                                    <div className="flex flex-col items-center justify-center text-greyscale-500 space-y-2">
                                        <MdPersonRemove size={48} className="text-greyscale-700" />
                                        <p>Chưa có thí sinh nào tham gia.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.participations.data.map((p, idx) => (
                                <TableRow key={p.user.userId + idx} className="border-greyscale-800 hover:bg-greyscale-800/50 transition-colors group">
                                    <TableCell>
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-12 w-12 border-2 border-greyscale-700 group-hover:border-primary/50 transition-colors">
                                                <AvatarImage src={p.user.avatarUrl || undefined} />
                                                <AvatarFallback className="bg-primary/20 text-primary font-bold text-lg">{p.user.fullName[0]}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-bold text-greyscale-50 text-base">{p.user.fullName}</p>
                                                <p className="text-xs text-greyscale-400">{p.user.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${getStatusColor(p.status || "ACTIVE")}`}>
                                            {translateStatus(p.status || "ACTIVE")}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right text-sm text-greyscale-400 font-medium">
                                        {formatDateTime(p.createdAt)}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            {data?.participations?.totalPages && data.participations.totalPages > 1 ? (
                <div className="flex items-center justify-between px-2">
                    <p className="text-sm text-greyscale-500">
                        Hiển thị <span className="font-bold text-greyscale-300">{data.participations.data.length}</span> trên tổng số <span className="font-bold text-greyscale-300">{data.participations.totalRecords}</span>
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
                            Trang {page} / {data.participations.totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setPage(p => Math.min(data.participations.totalPages, p + 1))}
                            disabled={page === data.participations.totalPages}
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
