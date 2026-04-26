"use client";

import React, { useState } from "react";
import { useTranslations } from "@/providers/i18n-provider";
import { Competition, ParticipantStatus } from "@/validations/competitions/competitions";
import { useGetCompetitionParticipants, useDisqualifyParticipant } from "@/hooks/competitions/useCompetitions";
import { toast } from "react-hot-toast";
import ConfirmActionPopover from "@/components/common/ConfirmActionPopover";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MdPeopleAlt, MdChevronLeft, MdChevronRight, MdPersonRemove, MdBlock, MdGavel } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils/format-date";

interface CompetitionParticipantsTabProps {
    competition: Competition;
}

export default function CompetitionParticipantsTab({
    competition,
}: CompetitionParticipantsTabProps) {
    const t = useTranslations("ManagerCompetitions.detailsDialog.sections.participants");
    const [status, setStatus] = useState<ParticipantStatus | "ALL">("ALL");
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const { data, isLoading } = useGetCompetitionParticipants(competition.competitionID, {
        status: status === "ALL" ? null : status,
        currentPage: page,
        pageSize,
    });

    const disqualifyMutation = useDisqualifyParticipant();

    const handleDisqualify = async (userId: string) => {
        try {
            await disqualifyMutation.mutateAsync({
                competitionId: competition.competitionID,
                userId
            });
            toast.success("Đã loại thí sinh khỏi cuộc thi.");
        } catch (error) {
            toast.error("Không thể loại thí sinh. Vui lòng thử lại.");
        }
    };

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
                        Quản lý người tham gia, điểm số và thứ hạng của cuộc thi.
                    </p>
                </div>

                <div className="w-full sm:w-48">
                    <Select value={status} onValueChange={(val: any) => {
                        setStatus(val);
                        setPage(1);
                    }}>
                        <SelectTrigger className="bg-greyscale-900 border-greyscale-700 text-greyscale-100 font-semibold shadow-inner transition-colors hover:bg-greyscale-800">
                            <SelectValue placeholder="Lọc trạng thái" />
                        </SelectTrigger>
                        <SelectContent className="bg-greyscale-900 border-greyscale-700">
                            <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                            <SelectItem value="ACTIVE" className="text-success focus:bg-success/10 focus:text-success">Tham gia</SelectItem>
                            <SelectItem value="DISQUALIFIED" className="text-error focus:bg-error/10 focus:text-error">Bị loại</SelectItem>
                            <SelectItem value="WITHDRAWN" className="text-greyscale-400">Rút lui</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="rounded-2xl border border-greyscale-800 bg-greyscale-900/30 overflow-hidden shadow-xl">
                <Table>
                    <TableHeader className="bg-greyscale-900/50">
                        <TableRow className="border-greyscale-800 hover:bg-transparent">
                            <TableHead className="text-greyscale-400 uppercase tracking-wider text-xs font-black">Thí sinh</TableHead>
                            <TableHead className="text-greyscale-400 uppercase tracking-wider text-xs font-black text-center">Trạng thái</TableHead>
                            <TableHead className="text-greyscale-400 uppercase tracking-wider text-xs font-black text-center">Tham gia lúc</TableHead>
                            <TableHead className="text-greyscale-400 uppercase tracking-wider text-xs font-black text-right">Thao tác</TableHead>
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
                                        <p>Không tìm thấy thí sinh nào phù hợp với bộ lọc.</p>
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
                                        {p.status || "ACTIVE" ? (
                                            <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${getStatusColor(p.status || "ACTIVE")}`}>
                                                {translateStatus(p.status || "ACTIVE")}
                                            </span>
                                        ) : (
                                            <span className="text-greyscale-500 text-xs italic">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center text-sm text-greyscale-400 font-medium">
                                        {formatDateTime(p.createdAt)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {p.status !== "DISQUALIFIED" && p.status !== "WITHDRAWN" && (
                                            <ConfirmActionPopover
                                                title="Loại thí sinh"
                                                description={`Bạn có chắc chắn muốn loại thí sinh "${p.user.fullName}" khỏi cuộc thi?`}
                                                confirmText="Loại bỏ"
                                                cancelText="Hủy"
                                                isLoading={disqualifyMutation.isPending}
                                                onConfirm={() => handleDisqualify(p.user.userId)}
                                                trigger={
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-greyscale-400 hover:text-error hover:bg-error/10 transition-colors"
                                                        title="Cấm thi / Loại bỏ"
                                                    >
                                                        <MdBlock size={18} />
                                                    </Button>
                                                }
                                            />
                                        )}
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
