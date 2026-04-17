"use client";

import React from "react";
import {
    MdOutlineEmojiEvents,
    MdAdd,
    MdDelete,
    MdEdit,
    MdCardGiftcard,
    MdCurrencyExchange,
    MdMoreVert
} from "react-icons/md";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/providers/i18n-provider";
import { Spinner } from "@/components/ui/spinner";
import {
    useGetCompetitionPrizes,
    useCreateCompetitionPrize,
    useUpdateCompetitionPrize,
    useDeleteCompetitionPrize
} from "@/hooks/competitions/useCompetitionPrizes";
import { toast } from "react-hot-toast";
import CreatePrizeDialog from "../dialogs/CreatePrizeDialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CompetitionPrize } from "@/validations/competitions/competitions";

interface CompetitionPrizesTabProps {
    competitionId: string;
    competitionStatus: string;
}

export default function CompetitionPrizesTab({
    competitionId,
    competitionStatus,
}: CompetitionPrizesTabProps) {
    const t = useTranslations("ManagerCompetitions.detailPage.prizes");
    const isDraft = competitionStatus === "DRAFT";

    const [isCreateOpen, setIsCreateOpen] = React.useState(false);
    const [editingPrize, setEditingPrize] = React.useState<CompetitionPrize | null>(null);

    const { data: prizes = [], isLoading } = useGetCompetitionPrizes(competitionId);
    const { mutate: createPrize, isPending: isCreating } = useCreateCompetitionPrize();
    const { mutate: updatePrize, isPending: isUpdating } = useUpdateCompetitionPrize();
    const { mutate: deletePrize } = useDeleteCompetitionPrize();

    const handleCreateOrUpdate = (payload: any) => {
        if (editingPrize) {
            updatePrize(
                { competitionId, prizeId: editingPrize.competitionPrizeID, payload },
                {
                    onSuccess: () => {
                        toast.success("Đã cập nhật giải thưởng thành công");
                        setIsCreateOpen(false);
                        setEditingPrize(null);
                    },
                    onError: (error: any) => {
                        toast.error(error.response?.data?.message || "Có lỗi khi cập nhật giải thưởng");
                    }
                }
            );
        } else {
            createPrize(
                { competitionId, payload },
                {
                    onSuccess: () => {
                        toast.success("Đã thêm giải thưởng thành công");
                        setIsCreateOpen(false);
                    },
                    onError: (error: any) => {
                        toast.error(error.response?.data?.message || "Có lỗi khi thêm giải thưởng");
                    }
                }
            );
        }
    };

    const handleDeletePrize = (prizeId: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa giải thưởng này?")) return;

        deletePrize(
            { competitionId, prizeId },
            {
                onSuccess: () => {
                    toast.success("Đã xóa giải thưởng thành công");
                },
                onError: (error: any) => {
                    toast.error(error.response?.data?.message || "Có lỗi khi xóa giải thưởng");
                }
            }
        );
    };

    const handleEditClick = (prize: CompetitionPrize) => {
        setEditingPrize(prize);
        setIsCreateOpen(true);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between border-b border-greyscale-800 pb-4">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-greyscale-0 flex items-center gap-2">
                        <MdOutlineEmojiEvents className="text-primary h-6 w-6" />
                        {t("title")}
                    </h2>
                    <p className="text-sm text-greyscale-400">{t("description")}</p>
                </div>

                {isDraft && (
                    <Button
                        onClick={() => {
                            setEditingPrize(null);
                            setIsCreateOpen(true);
                        }}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        <MdAdd className="mr-2 h-5 w-5" />
                        Thêm giải thưởng
                    </Button>
                )}
            </div>

            {isLoading ? (
                <div className="flex h-40 items-center justify-center">
                    <Spinner className="h-8 w-8 text-primary" />
                </div>
            ) : prizes.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-greyscale-700 bg-greyscale-900/20 p-12 text-center">
                    <MdOutlineEmojiEvents className="mx-auto h-16 w-16 text-greyscale-600 mb-4" />
                    <h2 className="text-2xl font-bold text-greyscale-200 mb-2">{t("empty.title")}</h2>
                    <p className="text-greyscale-400 max-w-md mx-auto">{t("empty.description")}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {prizes.map((prize) => (
                        <div
                            key={prize.competitionPrizeID}
                            className="group relative overflow-hidden rounded-2xl border border-greyscale-800 bg-greyscale-900/40 backdrop-blur-sm p-5 transition-all hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10"
                        >
                            {/* Decorative Background Gradient */}
                            <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl opacity-10 transition-opacity group-hover:opacity-20 ${prize.rewardType === "MONEY" ? "bg-green-500" : "bg-primary"}`} />

                            <div className="flex justify-between items-start relative z-10 mb-4">
                                <div className="space-y-1.5 whitespace-nowrap overflow-hidden">
                                    <div className="flex items-center gap-2">
                                        <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm ${prize.rewardType === "MONEY"
                                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                                            : "bg-primary/20 text-primary border-primary/30"}`}>
                                            Hạng {prize.rankFrom === prize.rankTo ? prize.rankFrom : `${prize.rankFrom} - ${prize.rankTo}`}
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-greyscale-0 truncate max-w-[180px]" title={prize.titleVN}>
                                        {prize.titleVN}
                                    </h3>
                                </div>

                                {isDraft && (
                                    <div className="flex items-center gap-1">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-greyscale-400 hover:text-greyscale-0 hover:bg-white/5">
                                                    <MdMoreVert size={20} />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-greyscale-950/90 backdrop-blur-lg border-greyscale-800 text-greyscale-0">
                                                <DropdownMenuItem
                                                    onClick={() => handleEditClick(prize)}
                                                    className="focus:bg-greyscale-800 focus:text-greyscale-0 cursor-pointer"
                                                >
                                                    <MdEdit className="mr-2 h-4 w-4" /> Sửa
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleDeletePrize(prize.competitionPrizeID)}
                                                    className="focus:bg-error/10 focus:text-error text-error cursor-pointer"
                                                >
                                                    <MdDelete className="mr-2 h-4 w-4" /> Xóa
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                )}
                            </div>

                            <p className="text-sm text-greyscale-400 mb-6 line-clamp-2 min-h-[40px] leading-relaxed relative z-10 italic opacity-80">
                                {prize.descriptionVN || "Thí sinh sẽ nhận được giải thưởng này dựa trên thành tích thi đấu."}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-greyscale-800/50 relative z-10">
                                <div className="flex items-center gap-3">
                                    {prize.rewardType === "MONEY" ? (
                                        <>
                                            <div className="h-10 w-10 rounded-xl bg-green-500/15 flex items-center justify-center text-green-400 shadow-inner">
                                                <MdCurrencyExchange size={22} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs text-greyscale-500 font-medium uppercase tracking-tight">Trị giá</span>
                                                <span className="text-xl font-black text-green-400 tracking-tighter">
                                                    {formatCurrency(prize.rewardValueMoney || 0)}
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary shadow-inner">
                                                <MdCardGiftcard size={22} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs text-greyscale-500 font-medium uppercase tracking-tight">Phần quà</span>
                                                <span className="text-xl font-black text-primary tracking-tighter line-clamp-1 max-w-[150px]">
                                                    {prize.rewardValueGiftVN || "Hiện vật"}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="h-8 w-8 rounded-full border border-greyscale-800 flex items-center justify-center text-greyscale-600 transition-colors group-hover:border-primary/20 group-hover:text-primary/40">
                                    <MdOutlineEmojiEvents size={18} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <CreatePrizeDialog
                isOpen={isCreateOpen}
                onClose={() => {
                    setIsCreateOpen(false);
                    setEditingPrize(null);
                }}
                onSubmit={handleCreateOrUpdate}
                isLoading={isCreating || isUpdating}
                initialData={editingPrize}
            />
        </div>
    );
}
