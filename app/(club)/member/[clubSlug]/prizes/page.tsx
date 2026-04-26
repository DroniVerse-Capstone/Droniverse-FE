"use client";

import React, { useState } from "react";
import { useGetMyPrizes } from "@/hooks/competitions/useCompetitionPrizes";
import { Spinner } from "@/components/ui/spinner";
import { MdEmojiEvents, MdOutlineCardGiftcard, MdOutlinePayments, MdSearch, MdMilitaryTech } from "react-icons/md";
import { useLocale } from "@/providers/i18n-provider";
import { cn } from "@/lib/utils";
import EmptyState from "@/components/common/EmptyState";
import { FadeIn } from "@/components/animation/FadeIn";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";
import AppPagination from "@/components/common/AppPagination";

export default function MemberPrizesPage() {
    const locale = useLocale();
    const params = useParams<{ clubSlug: string }>();
    const clubSlug = params?.clubSlug;

    const [searchTerm, setSearchTerm] = useState("");
    const [searchKeyword, setSearchKeyword] = useState<string | undefined>(undefined);
    const [currentPage, setCurrentPage] = useState(1);

    const { data: prizesData, isLoading, isFetching } = useGetMyPrizes({
        currentPage: currentPage,
        pageSize: 12,
        competitionName: searchKeyword,
    });

    const prizes = prizesData?.data || [];
    const totalPages = prizesData?.totalPages || 1;

    const handleSearch = () => {
        setSearchKeyword(searchTerm.trim() || undefined);
        setCurrentPage(1);
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr || dateStr.startsWith("0001-01-01")) return null;
        return new Date(dateStr).toLocaleDateString(locale === "en" ? "en-US" : "vi-VN", {
            day: "2-digit",
            month: "long",
            year: "numeric"
        });
    };

    return (
        <div className="space-y-10 px-6 py-4 min-h-screen">
            {/* Header Area */}
            <div className="space-y-6">
                <FadeIn from="top">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href={`/member/${clubSlug}`} className="text-greyscale-500 hover:text-primary transition-colors">Trang chủ</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="text-greyscale-300">Giải thưởng</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </FadeIn>

                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <FadeIn from="left">
                        <h1 className="text-3xl font-black text-white uppercase tracking-tight">
                            GIẢI THƯỞNG
                        </h1>
                    </FadeIn>

                    {/* Uniform Search Section */}
                    <FadeIn from="right" className="w-full lg:max-w-md">
                        <div className="flex w-full gap-2">
                            <div className="relative flex-1 group">
                                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-greyscale-500 group-focus-within:text-primary transition-colors" size={20} />
                                <Input
                                    placeholder="Tìm theo tên cuộc thi..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                    className="pl-10"
                                />
                            </div>
                            <Button
                                type="button"
                                className="h-10 px-6"
                                onClick={handleSearch}
                            >
                                Tìm kiếm
                            </Button>
                        </div>
                    </FadeIn>
                </div>
            </div>

            <FadeIn from="bottom">
                {isLoading ? (
                    <div className="flex min-h-72 items-center justify-center rounded-2xl border border-greyscale-800 bg-greyscale-900/60">
                        <Spinner className="h-10 w-10 text-primary" />
                    </div>
                ) : prizes.length > 0 ? (
                    <div className="space-y-12">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {prizes.map((item) => {
                                const formattedDate = formatDate(item.prize.awardedAt);
                                const isFirst = item.prize.rank === 1;
                                const isSecond = item.prize.rank === 2;
                                const isThird = item.prize.rank === 3;

                                return (
                                    <div
                                        key={item.prize.prizeId}
                                        className={cn(
                                            "group relative p-0.5 rounded-[28px] transition-all duration-500 hover:-translate-y-2",
                                            isFirst ? "bg-linear-to-br from-amber-400 via-amber-400/20 to-transparent shadow-[0_0_20px_rgba(251,191,36,0.1)] hover:shadow-[0_0_30px_rgba(251,191,36,0.2)]" :
                                                isSecond ? "bg-linear-to-br from-greyscale-300 via-greyscale-300/20 to-transparent" :
                                                    isThird ? "bg-linear-to-br from-orange-400 via-orange-400/20 to-transparent" :
                                                        "bg-linear-to-br from-indigo-500/30 via-white/5 to-transparent"
                                        )}
                                    >
                                        <div className="relative h-full rounded-[27px] bg-greyscale-950 p-5 overflow-hidden flex flex-col gap-4">
                                            {/* Rank Highlight Background */}
                                            <div className={cn(
                                                "absolute -top-10 -right-10 w-40 h-40 blur-3xl rounded-full opacity-10 transition-all duration-700 group-hover:scale-150 group-hover:opacity-20",
                                                isFirst ? "bg-amber-400" : isSecond ? "bg-greyscale-300" : isThird ? "bg-orange-400" : "bg-indigo-500"
                                            )} />

                                            {/* Top Row: Icon & Date */}
                                            <div className="flex justify-between items-start relative z-10">
                                                <div className={cn(
                                                    "relative h-16 w-16 rounded-2xl flex items-center justify-center border-2 transition-all duration-700 shadow-2xl",
                                                    isFirst ? "bg-linear-to-br from-amber-200 via-amber-400 to-amber-600 text-greyscale-950 border-amber-100 shadow-amber-400/40 scale-110 -translate-y-2 ring-4 ring-amber-400/20" :
                                                        isSecond ? "bg-linear-to-br from-greyscale-200 to-greyscale-500 text-greyscale-950 border-greyscale-100 shadow-greyscale-400/20" :
                                                            isThird ? "bg-linear-to-br from-orange-300 to-orange-600 text-greyscale-950 border-orange-200 shadow-orange-400/20" :
                                                                "bg-greyscale-800 text-primary border-greyscale-700 shadow-black/40"
                                                )}>
                                                    {item.prize.rewardType === "MONEY" ? (
                                                        <MdOutlinePayments size={32} className="relative z-10" />
                                                    ) : (
                                                        <MdOutlineCardGiftcard size={32} className="relative z-10" />
                                                    )}
                                                </div>

                                                {formattedDate && (
                                                    <div className="text-right">
                                                        <p className="text-[9px] font-black text-greyscale-600 uppercase tracking-widest leading-none mb-1">Đạt được vào</p>
                                                        <p className="text-[10px] font-bold text-greyscale-400 bg-white/5 px-2 py-1 rounded-md">{formattedDate}</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Prize Details */}
                                            <div className="space-y-2 relative z-10 mt-4">
                                                <h3 className={cn(
                                                    "text-2xl font-black leading-tight line-clamp-1 transition-all duration-300 uppercase tracking-tight",
                                                    isFirst ? "text-amber-400" :
                                                        isSecond ? "text-greyscale-300" :
                                                            isThird ? "text-orange-400" :
                                                                "text-white"
                                                )}>
                                                    {locale === "en" ? item.prize.titleEN : item.prize.titleVN}
                                                </h3>
                                                <p className={cn(
                                                    "text-[10px] font-black line-clamp-1 uppercase tracking-[0.2em] w-fit px-3 py-1 rounded-md border",
                                                    isFirst ? "text-amber-400/80 bg-amber-400/10 border-amber-400/20" :
                                                        isSecond ? "text-greyscale-300/80 bg-greyscale-300/10 border-greyscale-300/20" :
                                                            isThird ? "text-orange-400/80 bg-orange-400/10 border-orange-400/20" :
                                                                "text-indigo-300 bg-indigo-500/10 border-indigo-500/20"
                                                )}>
                                                    {locale === "en" ? item.competition.nameEN : item.competition.nameVN}
                                                </p>
                                            </div>

                                            {/* Bottom: Rank & Value */}
                                            <div className="mt-auto flex items-end justify-between relative z-10">
                                                <div className="space-y-3">
                                                    <div className={cn(
                                                        "inline-flex items-center gap-2 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border-2 shadow-xl",
                                                        isFirst ? "bg-amber-400 text-greyscale-950 border-amber-200 shadow-amber-400/30" :
                                                            isSecond ? "bg-greyscale-300 text-greyscale-950 border-greyscale-100 shadow-greyscale-300/30" :
                                                                isThird ? "bg-orange-400 text-greyscale-950 border-orange-200 shadow-orange-400/30" :
                                                                    "bg-white/5 text-greyscale-400 border-white/10"
                                                    )}>
                                                        {isFirst && <MdEmojiEvents size={14} className="animate-pulse" />}
                                                        Hạng {item.prize.rank}
                                                    </div>
                                                    <div className={cn(
                                                        "text-3xl font-black flex items-baseline gap-2",
                                                        isFirst ? "text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.4)]" : "text-white"
                                                    )}>
                                                        {item.prize.rewardType === "MONEY" && item.prize.rewardValueMoney ? (
                                                            <>
                                                                {item.prize.rewardValueMoney.toLocaleString()}
                                                                <span className={cn(
                                                                    "text-xs font-bold uppercase tracking-widest",
                                                                    isFirst ? "text-amber-400/60" : "text-greyscale-500"
                                                                )}>VNĐ</span>
                                                            </>
                                                        ) : (
                                                            <span className="text-lg uppercase tracking-widest">Quà tặng</span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                                                    <div className={cn(
                                                        "h-10 w-10 rounded-full flex items-center justify-center border-2 transition-transform duration-300 hover:scale-110",
                                                        isFirst ? "bg-amber-400/10 text-amber-400 border-amber-400/20" : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                                                    )}>
                                                        <MdEmojiEvents size={20} />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Background Text Decoration */}
                                            <div className={cn(
                                                "absolute -bottom-4 -right-4 font-black text-8xl select-none pointer-events-none italic transition-all duration-700",
                                                isFirst ? "text-amber-400/[0.04] group-hover:text-amber-400/[0.08]" : "text-white/[0.02] group-hover:text-white/[0.04]"
                                            )}>
                                                #{item.prize.rank}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex items-center justify-end">
                            <AppPagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                disabled={isFetching}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="rounded-2xl border border-greyscale-800 bg-greyscale-900/60 p-12 text-center">
                        <EmptyState
                            title={searchKeyword ? "Không tìm thấy kết quả" : "Hành trình vinh quang"}
                            description={searchKeyword ? `Chúng tôi không tìm thấy giải thưởng nào khớp với "${searchKeyword}".` : "Hãy tham gia các cuộc thi để ghi tên mình vào bảng vàng danh dự!"}
                            icon={<MdEmojiEvents size={64} className="text-greyscale-700" />}
                            actionLabel={searchKeyword ? "Xóa tìm kiếm" : undefined}
                            onAction={searchKeyword ? () => { setSearchTerm(""); setSearchKeyword(undefined); } : undefined}
                        />
                    </div>
                )}
            </FadeIn>
        </div>
    );
}
