"use client";

import React from "react";
import {
    FaFlagCheckered,
    FaRegClock,
    FaUserTie,
    FaInfoCircle,
    FaHistory
} from "react-icons/fa";
import { FiTarget, FiFileText } from "react-icons/fi";
import { IoPeople } from "react-icons/io5";
import { MdEmojiEvents, MdOutlineTimer, MdCalendarToday } from "react-icons/md";

import { formatDateTime } from "@/lib/utils/format-date";
import { useLocale, useTranslations } from "@/providers/i18n-provider";
import { Competition } from "@/validations/competitions/competitions";

interface CompetitionOverviewTabProps {
    competition: Competition;
}

export default function CompetitionOverviewTab({
    competition,
}: CompetitionOverviewTabProps) {
    const locale = useLocale();
    const t = useTranslations("ManagerCompetitions.detailsDialog");
    const tc = useTranslations("ManagerCompetitions");

    const description =
        locale === "en"
            ? competition.descriptionEN || competition.descriptionVN
            : competition.descriptionVN || competition.descriptionEN;

    const DetailItem = ({ icon: Icon, label, value, colorClass = "text-greyscale-50" }: any) => (
        <div className="flex items-start gap-3 py-2">
            <div className="mt-1 rounded-full bg-greyscale-800 p-2 text-greyscale-300">
                <Icon size={16} />
            </div>
            <div>
                <p className="text-xs font-medium text-greyscale-400 uppercase tracking-wider">{label}</p>
                <p className={`text-sm font-semibold ${colorClass}`}>{value}</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Section: General Info */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 text-primary">
                    <FaInfoCircle size={18} />
                    <h3 className="text-lg font-semibold uppercase tracking-tight">{t("sections.info")}</h3>
                </div>
                <div className="rounded-xl border border-greyscale-800 bg-greyscale-900/30 p-6">
                    <p className="text-greyscale-100 text-lg leading-relaxed mb-6 italic">
                        {description || tc("fallback.noDescription")}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <DetailItem icon={FiTarget} label={tc("metrics.rounds")} value={competition.totalRounds} />
                        <DetailItem icon={IoPeople} label={tc("metrics.competitors")} value={`${competition.totalCompetitors} / ${competition.maxParticipants}`} />
                        <DetailItem icon={MdEmojiEvents} label={tc("metrics.prizes")} value={competition.totalPrizes} />
                        <DetailItem icon={FaUserTie} label="Người tạo" value={competition.createdBy.fullName} />
                    </div>
                </div>
            </section>

            {/* Section: Timeline */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 text-secondary">
                    <MdCalendarToday size={18} />
                    <h3 className="text-lg font-semibold uppercase tracking-tight">{t("sections.timeline")}</h3>
                </div>
                <div className="rounded-xl border border-greyscale-800 bg-greyscale-900/30 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 relative">
                        <div className="space-y-8">
                            <div className="relative pl-8 border-l-2 border-primary/30">
                                <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-primary border-4 border-greyscale-950" />
                                <DetailItem
                                    icon={FaRegClock}
                                    label={tc("metrics.visible")}
                                    value={formatDateTime(competition.visibleAt)}
                                    colorClass="text-primary-foreground/90"
                                />
                            </div>

                            <div className="relative pl-8 border-l-2 border-secondary/30">
                                <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-secondary border-4 border-greyscale-950" />
                                <DetailItem
                                    icon={MdOutlineTimer}
                                    label={tc("timeline.registration")}
                                    value={`${formatDateTime(competition.registrationStartDate)} - ${formatDateTime(competition.registrationEndDate)}`}
                                    colorClass="text-secondary"
                                />
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="relative pl-8 border-l-2 border-error/30">
                                <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-error border-4 border-greyscale-950" />
                                <DetailItem
                                    icon={FaFlagCheckered}
                                    label={tc("timeline.competition")}
                                    value={`${formatDateTime(competition.startDate)} - ${formatDateTime(competition.endDate)}`}
                                    colorClass="text-error"
                                />
                            </div>

                            <div className="relative pl-8 border-l-2 border-success/30">
                                <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-success border-4 border-greyscale-950" />
                                <DetailItem
                                    icon={FaHistory}
                                    label="Công bố kết quả"
                                    value={competition.resultPublishedAt ? formatDateTime(competition.resultPublishedAt) : "Chưa xác định"}
                                    colorClass="text-success"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section: Rules */}
            <section className="space-y-4 pb-8">
                <div className="flex items-center gap-2 text-greyscale-200">
                    <FiFileText size={18} />
                    <h3 className="text-lg font-semibold uppercase tracking-tight">{t("sections.rules")}</h3>
                </div>
                <div className="rounded-xl border border-greyscale-800 bg-greyscale-900/50 p-8 shadow-inner">
                    <div
                        className="prose prose-invert max-w-none text-greyscale-100 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: competition.ruleContent }}
                    />
                </div>
            </section>
        </div>
    );
}
