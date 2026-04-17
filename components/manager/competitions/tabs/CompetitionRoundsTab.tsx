"use client";

import React, { useState } from "react";
import {
    MdAdd,
    MdDelete,
    MdSchedule,
    MdTimer,
} from "react-icons/md";
import { LuClipboardList } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/providers/i18n-provider";
import {
    Competition,
} from "@/validations/competitions/competitions";
import { formatDateTime } from "@/lib/utils/format-date";
import {
    useGetCompetitionRounds,
    useDeleteCompetitionRound
} from "@/hooks/competitions/useCompetitionRounds";
import { CreateRoundDialog } from "../dialogs/CreateRoundDialog";
import toast from "react-hot-toast";

interface CompetitionRoundsTabProps {
    competition: Competition;
}

export default function CompetitionRoundsTab({
    competition,
}: CompetitionRoundsTabProps) {
    const t = useTranslations("ManagerCompetitions.detailPage.rounds");
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const { data: rounds, isLoading } = useGetCompetitionRounds(competition.competitionID);
    const deleteRoundMutation = useDeleteCompetitionRound();

    const isDraft = competition.competitionStatus === "DRAFT";

    const handleDeleteRound = async (roundId: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa vòng thi này?")) return;

        try {
            await deleteRoundMutation.mutateAsync({
                competitionId: competition.competitionID,
                roundId
            });
            toast.success("Xóa vòng thi thành công");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Xóa vòng thi thất bại");
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
                <div className="grid grid-cols-1 gap-6">
                    {rounds.sort((a, b) => a.roundNumber - b.roundNumber).map((round) => (
                        <div
                            key={round.roundID}
                            className="group relative overflow-hidden rounded-2xl border-2 border-greyscale-700 bg-greyscale-900/90 backdrop-blur-xl p-6 shadow-2xl transition-all hover:border-primary/50 hover:shadow-primary/10"
                        >
                            {/* Decorative Background Accent */}
                            <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-primary/20 blur-[80px] opacity-0 transition-opacity group-hover:opacity-100" />

                            <div className="relative z-10 flex items-center justify-between">
                                <div className="flex items-center gap-8">
                                    {/* Round Number Badge */}
                                    <div className="relative">
                                        <div className="flex flex-col items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-br from-greyscale-800 to-greyscale-900 border border-greyscale-600 shadow-2xl group-hover:border-primary/50 transition-colors">
                                            <span className="text-[10px] uppercase font-black tracking-[0.2em] text-greyscale-400 mb-0.5">Round</span>
                                            <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-greyscale-50 to-greyscale-300 leading-none">
                                                {round.roundNumber}
                                            </span>
                                        </div>
                                        {round.roundPhase === "Ongoing" && (
                                            <div className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-green-500 border-4 border-greyscale-950 animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-xl font-black text-white tracking-tight drop-shadow-sm">
                                                    {round.lab?.labNameVN || "Bài Lab chưa xác định"}
                                                </h3>
                                                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border-2 shadow-sm ${round.roundPhase === "Upcoming" ? "bg-blue-500/20 text-blue-300 border-blue-500/30" :
                                                        round.roundPhase === "Ongoing" ? "bg-green-500/20 text-green-300 border-green-500/30 font-bold" :
                                                            "bg-greyscale-800 text-greyscale-400 border-greyscale-700"
                                                    }`}>
                                                    {t(`phases.${round.roundPhase}`)}
                                                </div>
                                            </div>
                                            <p className="text-xs font-mono text-greyscale-400 flex items-center gap-2 uppercase tracking-widest bg-greyscale-800/50 w-fit px-2 py-0.5 rounded border border-greyscale-700/50">
                                                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                                ID: {round.lab.labID}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-10">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] text-primary/80 font-black uppercase tracking-[0.15em] flex items-center gap-1.5">
                                                    <MdSchedule size={14} /> Thời gian
                                                </span>
                                                <span className="text-sm font-bold text-greyscale-100 flex items-center gap-2">
                                                    <span className="px-2 py-0.5 rounded bg-greyscale-800 text-greyscale-300 border border-greyscale-700 text-xs">
                                                        {formatDateTime(round.startTime)}
                                                    </span>
                                                    <span className="text-greyscale-500">—</span>
                                                    <span className="px-2 py-0.5 rounded bg-greyscale-800 text-greyscale-300 border border-greyscale-700 text-xs">
                                                        {formatDateTime(round.endTime)}
                                                    </span>
                                                </span>
                                            </div>

                                            <div className="w-px h-10 bg-greyscale-800" />

                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] text-primary/80 font-black uppercase tracking-[0.15em] flex items-center gap-1.5">
                                                    <MdTimer size={14} /> {t("table.limit")}
                                                </span>
                                                <span className="text-base font-black text-primary flex items-center gap-2">
                                                    <span className="text-2xl">{round.timeLimit.split(':')[1]}</span>
                                                    <span className="text-xs text-greyscale-500 uppercase tracking-tighter">Phút</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {isDraft && (
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDeleteRound(round.roundID)}
                                            className="h-14 w-14 rounded-2xl text-greyscale-500 hover:text-error hover:bg-error/10 border-2 border-transparent hover:border-error/30 transition-all active:scale-95 shadow-lg shadow-black/20"
                                            title="Xóa vòng thi"
                                        >
                                            <MdDelete size={28} />
                                        </Button>
                                    </div>
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
        </div>
    );
}
