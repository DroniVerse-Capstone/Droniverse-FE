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
import {
    MdMonitor,
    MdChevronLeft,
    MdChevronRight,
    MdSearch,
    MdFilterList,
    MdInfoOutline,
    MdCheckCircle,
    MdHistory,
    MdError
} from "react-icons/md";
import { Input } from "@/components/ui/input";
import { useGetRoundUserResults } from "@/hooks/competitions/useCompetitionRounds";
import { formatDateTime } from "@/lib/utils/format-date";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import UserRoundDetailDialog from "./UserRoundDetailDialog";

interface RoundMonitoringDialogProps {
    roundId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function RoundMonitoringDialog({
    roundId,
    open,
    onOpenChange,
}: RoundMonitoringDialogProps) {
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedUserResult, setSelectedUserResult] = useState<{
        userInfo: any;
        participantResult: any;
    } | null>(null);
    const pageSize = 10;

    // Debounce search query
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const { data, isLoading, refetch } = useGetRoundUserResults(roundId, {
        currentPage: page,
        pageSize,
        status: statusFilter === "all" ? undefined : statusFilter,
        search: debouncedSearch,
        sortBy: "StartedAt",
        sortDirection: "Desc",
        refetchInterval: (currentData) => {
            if (!currentData?.roundInfo) return 5000;

            const now = new Date();
            const endTime = new Date(currentData.roundInfo.endTime);
            const isFinished =
                now > endTime ||
                currentData.roundInfo.roundPhase === "Finished" ||
                currentData.roundInfo.roundStatus === "Cancelled";

            // If round is ongoing, refresh every 5 seconds for real-time feel
            return isFinished ? false : 5000;
        }
    });

    // Handle search with a small delay or manual trigger if needed, 
    // but for now let's just bind it.
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setPage(1);
    };

    const userResults = data?.userResults?.data || [];
    const totalPages = data?.userResults?.totalPages || 1;
    const totalRecords = data?.userResults?.totalRecords || 0;

    const getStatusStyle = (participant: any) => {
        const status = participant.status;
        const isPassed = participant.isPassed !== false;

        switch (status) {
            case "InProgress":
                return "text-sky-400 bg-sky-500/10 border-sky-500/20";
            case "Completed":
                return isPassed 
                    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                    : "text-rose-400 bg-rose-500/10 border-rose-500/20";
            case "Disqualified":
                return "text-rose-400 bg-rose-500/10 border-rose-500/20";
            default:
                return "text-greyscale-400 bg-greyscale-800 border-greyscale-700";
        }
    };

    const getStatusIcon = (participant: any) => {
        const status = participant.status;
        const isPassed = participant.isPassed !== false;

        switch (status) {
            case "InProgress":
                return <MdHistory className="animate-spin-slow" size={14} />;
            case "Completed":
                return isPassed ? <MdCheckCircle size={14} /> : <MdError size={14} />;
            case "Disqualified":
                return <MdError size={14} />;
            default:
                return null;
        }
    };

    const getStatusText = (participant: any) => {
        const status = participant.status;
        const isPassed = participant.isPassed !== false;

        switch (status) {
            case "InProgress": return "Đang thi";
            case "Completed": return isPassed ? "Hoàn thành" : "Thất bại";
            case "Disqualified": return "Bị loại";
            default: return status;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[1000px] bg-greyscale-900 border-greyscale-800 text-greyscale-50 p-0 overflow-hidden shadow-2xl">
                <div className="flex flex-col h-[85vh] max-h-[800px]">
                    <DialogHeader className="px-6 py-5 border-b border-greyscale-800 bg-greyscale-950/50">
                        <div className="flex items-center justify-between">
                            <DialogTitle className="flex items-center gap-3 text-xl font-black uppercase tracking-tight">
                                <div className="p-2 rounded-xl bg-primary/20 text-primary border border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.1)]">
                                    <MdMonitor size={24} />
                                </div>
                                Giám sát tiến độ vòng thi
                            </DialogTitle>

                            {data?.roundInfo && (
                                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-bold px-3 py-1">
                                    Vòng {data.roundInfo.roundNumber}: {data.roundInfo.vrSimulator.titleVN}
                                </Badge>
                            )}
                        </div>
                    </DialogHeader>

                    <div className="flex-1 flex flex-col p-6 overflow-hidden gap-4 bg-greyscale-950/30">
                        {/* Filters Row */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <Tabs
                                defaultValue="all"
                                className="w-full sm:w-auto"
                                onValueChange={(val) => {
                                    setStatusFilter(val);
                                    setPage(1);
                                }}
                            >
                                <TabsList className="bg-greyscale-900 border border-greyscale-800 p-1 h-11">
                                    <TabsTrigger value="all" className="px-4 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">Tất cả</TabsTrigger>
                                    <TabsTrigger value="InProgress" className="px-4 font-bold data-[state=active]:bg-sky-600 data-[state=active]:text-white">Đang thi</TabsTrigger>
                                    <TabsTrigger value="Completed" className="px-4 font-bold data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Hoàn thành</TabsTrigger>
                                    <TabsTrigger value="Disqualified" className="px-4 font-bold data-[state=active]:bg-rose-600 data-[state=active]:text-white">Bị loại</TabsTrigger>
                                </TabsList>
                            </Tabs>

                            <div className="relative w-full sm:w-72">
                                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-greyscale-500" size={20} />
                                <Input
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    placeholder="Tìm tên thí sinh..."
                                    className="pl-10 bg-black/40 border-greyscale-700 text-greyscale-100 h-11 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500/50 hover:border-greyscale-600 transition-all shadow-inner"
                                />
                            </div>
                        </div>

                        {/* Table */}
                        <div className="flex-1 rounded-2xl border border-greyscale-800 bg-greyscale-900/40 overflow-hidden flex flex-col shadow-inner">
                            <div className="overflow-y-auto flex-1">
                                <Table>
                                    <TableHeader className="bg-greyscale-900/80 sticky top-0 z-10 backdrop-blur-md border-b border-greyscale-800">
                                        <TableRow className="border-greyscale-800 hover:bg-transparent">
                                            <TableHead className="text-greyscale-400 font-black uppercase text-[10px] tracking-widest pl-6">Thí sinh</TableHead>
                                            <TableHead className="text-greyscale-400 font-black uppercase text-[10px] tracking-widest text-center">Trạng thái</TableHead>
                                            <TableHead className="text-greyscale-400 font-black uppercase text-[10px] tracking-widest text-center">Bắt đầu lúc</TableHead>
                                            <TableHead className="text-greyscale-400 font-black uppercase text-[10px] tracking-widest text-center">Kết quả</TableHead>
                                            <TableHead className="text-greyscale-400 font-black uppercase text-[10px] tracking-widest text-right pr-6">Thao tác</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoading ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="h-64 text-center">
                                                    <div className="flex flex-col items-center justify-center space-y-4">
                                                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                                                        <p className="text-sm text-greyscale-500 font-medium animate-pulse tracking-wide">Đang đồng bộ dữ liệu phòng thi...</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : userResults.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="h-64 text-center">
                                                    <div className="flex flex-col items-center justify-center text-greyscale-500 gap-2">
                                                        <MdFilterList size={40} className="opacity-20" />
                                                        <p className="font-medium italic">Không có thí sinh nào trong trạng thái này.</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            userResults.map((item, idx) => (
                                                <TableRow
                                                    key={item.userInfo.userId + idx}
                                                    className="border-greyscale-800/50 hover:bg-white/[0.02] transition-colors group"
                                                >
                                                    <TableCell className="pl-6 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <Avatar className="h-11 w-11 border-2 border-greyscale-800 group-hover:border-primary/30 transition-all duration-300">
                                                                <AvatarImage src={item.userInfo.avatarUrl || undefined} />
                                                                <AvatarFallback className="bg-primary/10 text-primary font-black uppercase text-xs">
                                                                    {item.userInfo.fullName.substring(0, 2)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="font-bold text-greyscale-100 group-hover:text-white transition-colors">{item.userInfo.fullName}</p>
                                                                <p className="text-[11px] text-greyscale-500 font-medium">{item.userInfo.email}</p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <span className={cn(
                                                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border",
                                                            getStatusStyle(item.participantResult)
                                                        )}>
                                                            {getStatusIcon(item.participantResult)}
                                                            {getStatusText(item.participantResult)}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-sm font-mono text-greyscale-300">
                                                                {item.participantResult.startedAt ? formatDateTime(item.participantResult.startedAt).split(' ')[1] : "-"}
                                                            </span>
                                                            <span className="text-[9px] text-greyscale-600 font-bold uppercase">
                                                                {item.participantResult.startedAt ? formatDateTime(item.participantResult.startedAt).split(' ')[0] : ""}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex flex-col items-center">
                                                            {item.participantResult.status === "Completed" ? (
                                                                <>
                                                                    <div className="flex items-center gap-1.5">
                                                                        <span className={cn(
                                                                            "text-lg font-black",
                                                                            item.participantResult.isPassed !== false ? "text-emerald-400" : "text-rose-400"
                                                                        )}>
                                                                            {item.participantResult.point ?? 0}
                                                                        </span>
                                                                        <span className="text-[10px] font-bold text-greyscale-500 uppercase">đ</span>
                                                                    </div>
                                                                    <span className={cn(
                                                                        "text-[11px] font-mono",
                                                                        item.participantResult.isPassed !== false ? "text-greyscale-400" : "text-rose-400/60"
                                                                    )}>
                                                                        {item.participantResult.executionTime ? item.participantResult.executionTime.split('.')[0] : "--:--"}
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                <div className="flex flex-col items-center opacity-40">
                                                                    <span className="text-lg font-black text-greyscale-600">--</span>
                                                                    <span className="text-[10px] font-bold text-greyscale-700 uppercase">Chưa có kết quả</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right pr-6">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setSelectedUserResult({
                                                                userInfo: item.userInfo,
                                                                participantResult: item.participantResult
                                                            })}
                                                            className="h-9 px-3 rounded-xl border-greyscale-700 bg-greyscale-800 text-greyscale-300 hover:text-primary hover:border-primary/50 hover:bg-primary/10 transition-all font-bold gap-2"
                                                        >
                                                            <MdInfoOutline size={16} />
                                                            Chi tiết
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="px-6 py-4 border-t border-greyscale-800 bg-greyscale-900/50 flex items-center justify-between">
                                    <p className="text-[11px] font-bold text-greyscale-500 uppercase tracking-widest">
                                        Hiển thị <span className="text-greyscale-300">{userResults.length}</span> / <span className="text-greyscale-300">{totalRecords}</span> thí sinh
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="h-9 w-9 border-greyscale-700 bg-greyscale-950 text-greyscale-400 hover:text-white disabled:opacity-30"
                                        >
                                            <MdChevronLeft size={20} />
                                        </Button>
                                        <div className="bg-greyscale-950 px-4 py-1.5 rounded-lg border border-greyscale-800">
                                            <span className="text-xs font-black text-primary uppercase">Trang {page} / {totalPages}</span>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                            disabled={page === totalPages}
                                            className="h-9 w-9 border-greyscale-700 bg-greyscale-950 text-greyscale-400 hover:text-white disabled:opacity-30"
                                        >
                                            <MdChevronRight size={20} />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>

            {selectedUserResult && (
                <UserRoundDetailDialog
                    open={!!selectedUserResult}
                    onOpenChange={(open) => !open && setSelectedUserResult(null)}
                    userId={selectedUserResult.userInfo.userId}
                    userName={selectedUserResult.userInfo.fullName}
                    userEmail={selectedUserResult.userInfo.email}
                    userAvatar={selectedUserResult.userInfo.avatarUrl}
                    initialData={selectedUserResult.participantResult}
                    roundId={roundId}
                />
            )}
        </Dialog>
    );
}
