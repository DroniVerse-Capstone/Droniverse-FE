"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { IoChevronBackOutline } from "react-icons/io5";
import { MdOutlineDashboard, MdStars, MdOutlineEmojiEvents } from "react-icons/md";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import EmptyState from "@/components/common/EmptyState";
import { useGetCompetitionDetail } from "@/hooks/competitions/useCompetitions";
import { useGetCompetitionCertificates } from "@/hooks/certificate/useCertificate";
import { useLocale, useTranslations } from "@/providers/i18n-provider";
import CompetitionOverviewTab from "./tabs/CompetitionOverviewTab";
import CompetitionCertificatesTab from "./tabs/CompetitionCertificatesTab";
import CompetitionPrizesTab from "./tabs/CompetitionPrizesTab";
import CompetitionRoundsTab from "./tabs/CompetitionRoundsTab";
import CompetitonStatusBadge from "@/components/competition/CompetitonStatusBadge";

export default function ManagerCompetitionDetail() {
    const router = useRouter();
    const locale = useLocale();
    const params = useParams<{ clubSlug: string; competitionId: string }>();
    const competitionId = params?.competitionId;
    const clubSlug = params?.clubSlug;

    const t = useTranslations("ManagerCompetitions.detailPage");
    const tc = useTranslations("ManagerCompetitions");

    const { data: competition, isLoading: isCompLoading, isError: isCompError, error: compError } = useGetCompetitionDetail(competitionId);
    const { data: certificates, isLoading: isCertsLoading } = useGetCompetitionCertificates(competitionId);

    const isLoading = isCompLoading || isCertsLoading;
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
                                <CompetitonStatusBadge status={competition.competitionStatus} />
                                <span className="text-xs text-greyscale-400 font-medium">ID: {competition.competitionID.slice(0, 8)}...</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Future action buttons can go here */}
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
                                    <MdStars className="mr-2 h-5 w-5" />
                                    {t("tabs.rounds")}
                                </TabsTrigger>
                                <TabsTrigger
                                    value="certificates"
                                    className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-transparent h-full px-1 text-base font-semibold text-greyscale-400 transition-all hover:text-greyscale-200"
                                >
                                    <MdOutlineEmojiEvents className="mr-2 h-5 w-5" />
                                    {t("tabs.certificates")}
                                </TabsTrigger>
                                <TabsTrigger
                                    value="prizes"
                                    className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-transparent h-full px-1 text-base font-semibold text-greyscale-400 transition-all hover:text-greyscale-200"
                                >
                                    <MdOutlineEmojiEvents className="mr-2 h-5 w-5 text-yellow-500" />
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

                        <TabsContent value="certificates" className="mt-0 outline-none">
                            <CompetitionCertificatesTab
                                competitionId={competition.competitionID}
                                certificates={certificates}
                                competitionStatus={competition.competitionStatus}
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
