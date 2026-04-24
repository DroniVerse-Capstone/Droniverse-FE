"use client";

import React, { useState } from "react";
import {
    MdAdd,
    MdDelete,
    MdSchedule,
    MdTimer,
    MdEdit,
    MdCancel,
} from "react-icons/md";
import { LuClipboardList } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import ConfirmActionPopover from "@/components/common/ConfirmActionPopover";
import { useLocale, useTranslations } from "@/providers/i18n-provider";
import {
    Competition,
    CompetitionRound,
} from "@/validations/competitions/competitions";
import { formatDateTime } from "@/lib/utils/format-date";
import {
    useGetCompetitionRounds,
    useCancelCompetitionRound
} from "@/hooks/competitions/useCompetitionRounds";
import { CreateRoundDialog } from "../dialogs/CreateRoundDialog";
import toast from "react-hot-toast";
import { UpdateRoundDialog } from "../dialogs/UpdateRoundDialog";

interface CompetitionRoundsTabProps {
    competition: Competition;
}

export default function CompetitionRoundsTab({
    competition,
}: CompetitionRoundsTabProps) {
    const t = useTranslations("ManagerCompetitions.detailPage.rounds");
    const locale = useLocale();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingRound, setEditingRound] = useState<CompetitionRound | null>(null);

    const { data: rounds, isLoading } = useGetCompetitionRounds(competition.competitionID);
    const cancelRoundMutation = useCancelCompetitionRound();

    const isDraft = competition.competitionStatus === "DRAFT";

    const handleCancelRound = async (roundId: string) => {
        try {
            await cancelRoundMutation.mutateAsync(roundId);
            toast.success("Hủy vòng thi thành công");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Hủy vòng thi thất bại");
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
                            className="group relative overflow-hidden rounded-3xl border border-greyscale-700 bg-greyscale-800/40 p-1 shadow-xl transition-all duration-300 hover:border-primary/50 hover:bg-greyscale-800/60 hover:shadow-primary/5"
                        >
                            {/* Accent Glow */}
                            <div className={`absolute -left-20 -top-20 h-40 w-40 rounded-full blur-[100px] opacity-0 transition-opacity duration-500 group-hover:opacity-20 ${round.roundPhase === "Ongoing" ? "bg-green-500" : "bg-primary"
                                }`} />

                            <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6 p-6">
                                {/* Left Side: Round Indicator */}
                                <div className="flex flex-col items-center justify-center">
                                    <div className="relative h-20 w-20 flex flex-col items-center justify-center rounded-2xl bg-greyscale-800 border border-greyscale-600 shadow-xl group-hover:border-primary/40 transition-colors">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-greyscale-400">Vòng</span>
                                        <span className="text-4xl font-black text-greyscale-0 leading-none">
                                            {round.roundNumber}
                                        </span>
                                        {round.roundPhase === "Ongoing" && (
                                            <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-greyscale-900"></span>
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Middle: Round Details */}
                                <div className="flex-1 space-y-4">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h3 className="text-2xl font-bold text-greyscale-0 tracking-tight">
                                            {locale === "en" ? round.vrSimulator?.titleEN : round.vrSimulator?.titleVN || "Bài Lab chưa xác định"}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${round.roundPhase === "Upcoming" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                                round.roundPhase === "Ongoing" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                                    "bg-greyscale-800 text-greyscale-400 border-greyscale-700"
                                                }`}>
                                                {t(`phases.${round.roundPhase}`)}
                                            </span>
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${round.roundStatus === "Valid" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                                round.roundStatus === "ScheduleInvalid" ? "bg-error/10 text-error border-error/20" :
                                                    "bg-greyscale-800 text-greyscale-400 border-greyscale-700"
                                                }`}>
                                                {t(`statuses.${round.roundStatus}`)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-2">
                                        <div className="flex items-center gap-3 bg-greyscale-800/80 px-4 py-2.5 rounded-2xl border border-greyscale-700/50 shadow-sm">
                                            <div className="p-2 rounded-xl bg-primary/20 text-primary shadow-inner">
                                                <MdSchedule size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-greyscale-400 uppercase tracking-wider mb-0.5">Thời gian thi đấu</p>
                                                <div className="flex items-center gap-2 text-sm font-bold text-greyscale-50">
                                                    <span>{formatDateTime(round.startTime)}</span>
                                                    <span className="text-greyscale-600">—</span>
                                                    <span>{formatDateTime(round.endTime)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 bg-greyscale-800/80 px-4 py-2.5 rounded-2xl border border-greyscale-700/50 shadow-sm">
                                            <div className="p-2 rounded-xl bg-secondary/20 text-secondary shadow-inner">
                                                <MdTimer size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-greyscale-400 uppercase tracking-wider mb-0.5">{t("table.limit")}</p>
                                                <p className="text-sm font-black text-greyscale-0">
                                                    <span className="text-xl text-secondary">{round.timeLimit.split(':')[1]}</span>
                                                    <span className="ml-1.5 text-greyscale-400 font-bold tracking-tight">phút</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-[10px] font-mono text-greyscale-500 bg-black/20 w-fit px-2 py-0.5 rounded border border-greyscale-800/50">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                                        ID: {round.vrSimulator.vrSimulatorId}
                                    </div>
                                </div>

                                {/* Right Side: Actions */}
                                <div className="flex items-center gap-2">
                                    {isDraft && (
                                        <>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setEditingRound(round)}
                                                className="h-12 w-12 rounded-2xl text-greyscale-500 hover:text-primary hover:bg-primary/10 transition-all border border-transparent hover:border-primary/20"
                                                title="Chỉnh sửa vòng thi"
                                            >
                                                <MdEdit size={24} />
                                            </Button>

                                            <ConfirmActionPopover
                                                title="Hủy vòng thi"
                                                description="Bạn có chắc chắn muốn hủy vòng thi này không? Hành động này không thể hoàn tác."
                                                onConfirm={() => handleCancelRound(round.roundID)}
                                                confirmText="Xác nhận hủy"
                                                cancelText="Đóng"
                                                isLoading={cancelRoundMutation.isPending}
                                                trigger={
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-12 w-12 rounded-2xl text-greyscale-500 hover:text-error hover:bg-error/10 transition-all border border-transparent hover:border-error/20"
                                                        title="Hủy vòng thi"
                                                    >
                                                        <MdDelete size={24} />
                                                    </Button>
                                                }
                                            />
                                        </>
                                    )}
                                </div>
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

            <UpdateRoundDialog
                open={!!editingRound}
                onOpenChange={(open) => !open && setEditingRound(null)}
                round={editingRound!}
            />
        </div>
    );
}
