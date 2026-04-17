"use client";

import React from "react";
import Image from "next/image";
import { MdOutlineEmojiEvents, MdOutlineInfo, MdAdd } from "react-icons/md";
import { LuClipboardList } from "react-icons/lu";
import { IoClose } from "react-icons/io5";

import { Spinner } from "@/components/ui/spinner";
import EmptyState from "@/components/common/EmptyState";
import { CompetitionCertificate } from "@/validations/competitions/competitions";
import { useLocale, useTranslations } from "@/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import AssignCertificatesDialog from "../AssignCertificatesDialog";
import { useDeleteCompetitionCertificates } from "@/hooks/certificate/useCertificate";
import { toast } from "react-hot-toast";

interface CompetitionCertificatesTabProps {
    competitionId: string;
    certificates?: CompetitionCertificate[];
    competitionStatus: string;
}

export default function CompetitionCertificatesTab({
    competitionId,
    certificates = [],
    competitionStatus,
}: CompetitionCertificatesTabProps) {
    const locale = useLocale();
    const t = useTranslations("ManagerCompetitions.detailPage.certificates");

    const [isAssignOpen, setIsAssignOpen] = React.useState(false);

    const { mutate: deleteCert, isPending: isDeleting } = useDeleteCompetitionCertificates();

    const isDraft = competitionStatus === "DRAFT";

    const handleDelete = (certId: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa chứng chỉ này khỏi cuộc thi?")) return;

        deleteCert(
            { competitionId, payload: { certificateIDs: [certId] } },
            {
                onSuccess: () => {
                    toast.success("Đã xóa chứng chỉ thành công");
                },
                onError: (error: any) => {
                    console.error("Delete Error:", error);
                    let msg = "Có lỗi khi xóa chứng chỉ";

                    if (error.response?.data) {
                        const data = error.response.data as any;
                        if (data.message) {
                            msg = data.message;
                        } else if (Array.isArray(data)) {
                            msg = data.map((e: any) => e.message).join(", ");
                        }
                    } else {
                        msg = error.message;
                    }

                    toast.error(msg);
                }
            }
        );
    };

    if (certificates.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-greyscale-700 bg-greyscale-900/20 p-12 text-center animate-in fade-in duration-500">
                <MdOutlineEmojiEvents className="mx-auto h-16 w-16 text-greyscale-600 mb-4" />
                <h2 className="text-2xl font-bold text-greyscale-200 mb-2">{t("title")}</h2>
                <p className="text-greyscale-400 max-w-md mx-auto mb-6">{t("empty")}</p>
                {isDraft && (
                    <Button
                        onClick={() => setIsAssignOpen(true)}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        <MdAdd className="mr-2 h-5 w-5" />
                        Thêm chứng chỉ
                    </Button>
                )}

                <AssignCertificatesDialog
                    competitionId={competitionId}
                    open={isAssignOpen}
                    onOpenChange={setIsAssignOpen}
                    existingCertificateIds={certificates.map(c => c.certificateID)}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between border-b border-greyscale-800 pb-4">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-greyscale-0 flex items-center gap-2">
                        <LuClipboardList className="text-primary" />
                        {t("title")}
                    </h2>
                    <p className="text-sm text-greyscale-400">{t("description")}</p>
                </div>

                {isDraft && (
                    <Button
                        onClick={() => setIsAssignOpen(true)}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        <MdAdd className="mr-2 h-5 w-5" />
                        Thêm chứng chỉ
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {certificates.map((cert) => (
                    <div
                        key={cert.certificateID}
                        className="group relative overflow-hidden rounded-xl border border-greyscale-800 bg-greyscale-900/60 p-4 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
                    >
                        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-greyscale-800 bg-black mb-4">
                            <Image
                                src={cert.imageUrl}
                                alt={locale === "en" ? cert.certificateNameEN : cert.certificateNameVN}
                                fill
                                className="object-contain p-2"
                            />
                            {isDraft && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(cert.certificateID);
                                    }}
                                    disabled={isDeleting}
                                    className="absolute right-2 top-2 z-10 rounded-full bg-red-500/80 p-1.5 text-white backdrop-blur-sm transition-all hover:bg-red-500 hover:scale-110 disabled:opacity-50"
                                >
                                    {isDeleting ? <Spinner className="h-4 w-4" /> : <IoClose size={16} />}
                                </button>
                            )}
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-semibold text-greyscale-50 line-clamp-1">
                                {locale === "en" ? cert.certificateNameEN : cert.certificateNameVN}
                            </h3>
                            <div className="flex items-center gap-1.5 text-xs text-greyscale-400">
                                <MdOutlineInfo className="shrink-0" />
                                <span>ID: {cert.certificateID.slice(0, 8)}...</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <AssignCertificatesDialog
                competitionId={competitionId}
                open={isAssignOpen}
                onOpenChange={setIsAssignOpen}
                existingCertificateIds={certificates.map(c => c.certificateID)}
            />
        </div>
    );
}
