"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { IoChevronBackOutline } from "react-icons/io5";
import {
    MdOutlineDashboard,
    MdOutlineStars,
    MdOutlineEmojiEvents,
    MdOutlinePeopleAlt,
    MdOutlineLeaderboard,
    MdOutlineAssignment,
    MdOutlineFactCheck,
    MdAssignmentTurnedIn
} from "react-icons/md";
import { toast } from "react-hot-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import EmptyState from "@/components/common/EmptyState";
import { useUpdateCompetitionStatus, useGetCompetitionDetail, useAggregateCompetition } from "@/hooks/competitions/useCompetitions";
import ConfirmActionPopover from "@/components/common/ConfirmActionPopover";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "@/providers/i18n-provider";
import CompetitionOverviewTab from "./tabs/CompetitionOverviewTab";
import CompetitionParticipantsTab from "./tabs/CompetitionParticipantsTab";
import CompetitionConditionsTab from "./tabs/CompetitionConditionsTab";
import CompetitionPrizesTab from "./tabs/CompetitionPrizesTab";
import CompetitionRoundsTab from "./tabs/CompetitionRoundsTab";
import CompetitonStatusBadge from "@/components/competition/CompetitonStatusBadge";
import CompetitionLeaderboardTab from "./tabs/CompetitionLeaderboardTab";

export default function ManagerCompetitionDetail() {
    const router = useRouter();
    const locale = useLocale();
    const params = useParams<{ clubSlug: string; competitionId: string }>();
    const competitionId = params?.competitionId;
    const clubSlug = params?.clubSlug;

    const t = useTranslations("ManagerCompetitions.detailPage");
    const tc = useTranslations("ManagerCompetitions");

    const { data: competition, isLoading: isCompLoading, isError: isCompError, error: compError } = useGetCompetitionDetail(competitionId);
    const statusMutation = useUpdateCompetitionStatus();

    const handleUpdateStatus = async (status: 'PUBLISHED' | 'RESULT_PUBLISHED') => {
        try {
            await statusMutation.mutateAsync({
                id: competitionId!,
                status,
                invalidReason: null
            });
            toast.success(locale === 'en' ? 'Status updated successfully!' : 'Đã cập nhật trạng thái thành công!');
        } catch (error: any) {
            toast.error(error?.response?.data?.message || (locale === 'en' ? 'Failed to update status' : 'Cập nhật trạng thái thất bại'));
        }
    };

    const aggregateMutation = useAggregateCompetition();

    const handlePublishResults = async () => {
        try {
            await aggregateMutation.mutateAsync(competitionId!);
            toast.success(locale === 'en' ? 'Results published successfully!' : 'Công bố kết quả thành công!');
        } catch (error: any) {
            toast.error(error?.response?.data?.message || (locale === 'en' ? 'Failed to publish results' : 'Công bố kết quả thất bại. Vui lòng thử lại.'));
        }
    };

    const isLoading = isCompLoading;
    const isError = isCompError;
    const error = compError;

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-greyscale-950">
                <Spinner className="h-8 w-8 text-primary" />
            </div>
        );
    }

    if (isError || !competition) {
        return (
            <div className="px-6 py-8 bg-greyscale-950 min-h-screen">
                <EmptyState
                    title={error?.response?.data?.message || error?.message || tc("errors.loadCompetitions")}
                />
            </div>
        );
    }

    const title = locale === "en" ? competition.nameEN || competition.nameVN : competition.nameVN || competition.nameEN;

    return (
        <div className="min-h-screen bg-greyscale-950 text-greyscale-50 flex flex-col">
            {/* Top Header/Navigation */}
            <header className="sticky top-0 z-20 border-b border-greyscale-800 bg-greyscale-950/80 backdrop-blur-md px-6 py-4">
                <div className="flex items-center justify-between gap-4 max-w-(--breakpoint-2xl) mx-auto w-full">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full border-greyscale-800 bg-greyscale-900 hover:bg-greyscale-800"
                            onClick={() => router.push(`/manager/${clubSlug}/competitions`)}
                        >
                            <IoChevronBackOutline size={20} />
                        </Button>
                        <div className="space-y-0.5">
                            <h1 className="text-xl font-bold text-greyscale-0 tracking-tight">{title}</h1>
                            <div className="flex items-center gap-2">
                                <CompetitonStatusBadge 
                                    status={competition.competitionStatus} 
                                    phase={competition.competitionPhase || undefined}
                                    endDate={competition.endDate}
                                />
                                <span className="text-xs text-greyscale-400 font-medium">ID: {competition.competitionID.slice(0, 8)}...</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {competition.competitionStatus === "PUBLISHED" && (
                            (() => {
                                const isEnded = new Date().getTime() > new Date(competition.endDate).getTime();
                                const publishButton = (
                                    <Button
                                        disabled={!isEnded || statusMutation.isPending}
                                        className={cn(
                                            "h-10 px-6 font-bold gap-2 transition-all rounded-md border shadow-sm",
                                            isEnded
                                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-500/50 hover:shadow-emerald-500/10 active:scale-95"
                                                : "bg-greyscale-900/40 text-greyscale-600 border-greyscale-800 opacity-60 cursor-not-allowed shadow-none"
                                        )}
                                        title={!isEnded ? (locale === 'en' ? 'Results can be published after the competition ends' : 'Chỉ có thể công bố kết quả sau khi cuộc thi kết thúc') : ""}
                                    >
                                        {statusMutation.isPending ? (
                                            <Spinner className="h-4 w-4" />
                                        ) : (
                                            <MdAssignmentTurnedIn size={18} className={isEnded ? "text-emerald-400" : "text-greyscale-600"} />
                                        )}
                                        <span className="uppercase tracking-widest text-[10px]">
                                            {locale === 'en' ? 'Publish Results' : 'Công bố kết quả'}
                                        </span>
                                    </Button>
                                );

                                if (!isEnded) return null;

                                return (
                                    <ConfirmActionPopover
                                        title={locale === 'en' ? 'Confirm Result Publication' : 'Xác nhận công bố kết quả'}
                                        description={locale === 'en' ? 'Once published, scores will be calculated and results will be visible to all participants. This process is final and cannot be reversed.' : 'Sau khi công bố, điểm số sẽ được tính toán và kết quả sẽ hiển thị cho tất cả thí sinh. Quy trình này là chính thức và không thể hoàn tác.'}
                                        confirmText={locale === 'en' ? 'Publish Now' : 'Công bố ngay'}
                                        cancelText={tc("delete.cancelText")}
                                        isLoading={aggregateMutation.isPending || statusMutation.isPending}
                                        onConfirm={handlePublishResults}
                                        trigger={publishButton}
                                    />
                                );
                            })()
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto w-full max-w-(--breakpoint-2xl) mx-auto">
                <div className="px-6 py-8">
                    <Tabs defaultValue="overview" className="space-y-8">
                        <div className="flex items-center justify-between border-b border-greyscale-800 pb-1">
                            <TabsList className="bg-transparent h-12 p-0 gap-8">
                                <TabsTrigger
                                    value="overview"
                                    className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-transparent h-full px-1 text-base font-semibold text-greyscale-400 transition-all hover:text-greyscale-200"
                                >
                                    <MdOutlineDashboard className="mr-2 h-5 w-5" />
                                    {t("tabs.overview")}
                                </TabsTrigger>
                                <TabsTrigger
                                    value="rounds"
                                    className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-transparent h-full px-1 text-base font-semibold text-greyscale-400 transition-all hover:text-greyscale-200"
                                >
                                    <MdOutlineStars className="mr-2 h-5 w-5" />
                                    {t("tabs.rounds")}
                                </TabsTrigger>
                                {competition.competitionStatus !== "DRAFT" && (
                                    <>
                                        <TabsTrigger
                                            value="participants"
                                            className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-transparent h-full px-1 text-base font-semibold text-greyscale-400 transition-all hover:text-greyscale-200"
                                        >
                                            <MdOutlinePeopleAlt className="mr-2 h-5 w-5" />
                                            Thí sinh
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="leaderboard"
                                            className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-transparent h-full px-1 text-base font-semibold text-greyscale-400 transition-all hover:text-greyscale-200"
                                        >
                                            <MdOutlineLeaderboard className="mr-2 h-5 w-5" />
                                            BXH Chung Cuộc
                                        </TabsTrigger>
                                    </>
                                )}
                                <TabsTrigger
                                    value="conditions"
                                    className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-transparent h-full px-1 text-base font-semibold text-greyscale-400 transition-all hover:text-greyscale-200"
                                >
                                    <MdOutlineAssignment className="mr-2 h-5 w-5" />
                                    {t("tabs.conditions")}
                                </TabsTrigger>
                                <TabsTrigger
                                    value="prizes"
                                    className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-transparent h-full px-1 text-base font-semibold text-greyscale-400 transition-all hover:text-greyscale-200"
                                >
                                    <MdOutlineEmojiEvents className="mr-2 h-5 w-5" />
                                    {t("tabs.prizes")}
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="overview" className="mt-0 outline-none">
                            <CompetitionOverviewTab competition={competition} />
                        </TabsContent>

                        <TabsContent value="rounds" className="mt-0 outline-none">
                            <CompetitionRoundsTab competition={competition} />
                        </TabsContent>

                        {competition.competitionStatus !== "DRAFT" && (
                            <>
                                <TabsContent value="participants" className="mt-0 outline-none">
                                    <CompetitionParticipantsTab competition={competition} />
                                </TabsContent>

                                <TabsContent value="leaderboard" className="mt-0 outline-none">
                                    <CompetitionLeaderboardTab competitionId={competition.competitionID} />
                                </TabsContent>
                            </>
                        )}

                        <TabsContent value="conditions" className="mt-0 outline-none">
                            <CompetitionConditionsTab
                                competition={competition}
                            />
                        </TabsContent>

                        <TabsContent value="prizes" className="mt-0 outline-none">
                            <CompetitionPrizesTab
                                competitionId={competition.competitionID}
                                competitionStatus={competition.competitionStatus}
                            />
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </div>
    );
}
