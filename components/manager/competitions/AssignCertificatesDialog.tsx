"use client";

import React from "react";
import Image from "next/image";
import { MdOutlineEmojiEvents, MdCheck, MdAdd } from "react-icons/md";
import { LuClipboardList } from "react-icons/lu";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
    useGetAllCertificates,
    useAssignCompetitionCertificates
} from "@/hooks/certificate/useCertificate";
import { useLocale, useTranslations } from "@/providers/i18n-provider";
import { CompetitionCertificate } from "@/validations/competitions/competitions";
import { toast } from "react-hot-toast";

interface AssignCertificatesDialogProps {
    competitionId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    existingCertificateIds: string[];
}

export default function AssignCertificatesDialog({
    competitionId,
    open,
    onOpenChange,
    existingCertificateIds,
}: AssignCertificatesDialogProps) {
    const locale = useLocale();
    const t = useTranslations("ManagerCompetitions.detailPage.certificates");
    const tc = useTranslations("ManagerCompetitions");

    const { data: allCertificates = [], isLoading: isFetching } = useGetAllCertificates();
    const { mutate: assignCertificates, isPending: isAssigning } = useAssignCompetitionCertificates();

    const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

    // Filter out certificates that are already assigned
    const availableCertificates = React.useMemo(() => {
        return allCertificates.filter(cert => !existingCertificateIds.includes(cert.certificateID));
    }, [allCertificates, existingCertificateIds]);

    const toggleCertificate = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSave = () => {
        if (selectedIds.length === 0) return;

        assignCertificates(
            { competitionId, payload: { certificateIDs: selectedIds } },
            {
                onSuccess: () => {
                    toast.success("Đã thêm chứng chỉ thành công");
                    onOpenChange(false);
                    setSelectedIds([]);
                },
                onError: (error) => {
                    console.error("Assignment Error:", error);
                    let msg = "Có lỗi khi thêm chứng chỉ";

                    if (error.response?.data) {
                        const data = error.response.data as any;
                        if (data.message) {
                            msg = data.message;
                        } else if (Array.isArray(data)) {
                            msg = data.map((e: any) => e.message).join(", ");
                        } else if (typeof data === 'string') {
                            msg = data;
                        }
                    } else {
                        msg = error.message;
                    }

                    toast.error(msg);
                }
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl bg-greyscale-950 border-greyscale-800 text-greyscale-50 p-0 overflow-hidden flex flex-col max-h-[85vh]">
                <DialogHeader className="p-6 border-b border-greyscale-800">
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <LuClipboardList className="text-primary" />
                        {t("title")}
                    </DialogTitle>
                    <DialogDescription className="text-greyscale-400">
                        {t("description")}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6">
                    {isFetching ? (
                        <div className="flex h-40 items-center justify-center">
                            <Spinner className="h-8 w-8 text-primary" />
                        </div>
                    ) : availableCertificates.length === 0 ? (
                        <div className="text-center py-12">
                            <MdOutlineEmojiEvents className="mx-auto h-12 w-12 text-greyscale-700 mb-4" />
                            <p className="text-greyscale-400 font-medium">Không còn chứng chỉ nào để thêm.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {availableCertificates.map((cert) => (
                                <div
                                    key={cert.certificateID}
                                    onClick={() => toggleCertificate(cert.certificateID)}
                                    className={`relative flex items-center gap-4 p-3 rounded-xl border transition-all cursor-pointer ${selectedIds.includes(cert.certificateID)
                                        ? "bg-primary/10 border-primary"
                                        : "bg-greyscale-900/50 border-greyscale-800 hover:border-greyscale-600"
                                        }`}
                                >
                                    <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded border border-greyscale-800 bg-black">
                                        <Image
                                            src={cert.imageUrl}
                                            alt={locale === "en" ? cert.certificateNameEN : cert.certificateNameVN}
                                            fill
                                            className="object-contain p-1"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-greyscale-50 line-clamp-1">
                                            {locale === "en" ? cert.certificateNameEN : cert.certificateNameVN}
                                        </p>
                                        <p className="text-[10px] text-greyscale-400">ID: {cert.certificateID.slice(0, 8)}...</p>
                                    </div>
                                    <div className={`h-5 w-5 rounded-full border flex items-center justify-center transition-all ${selectedIds.includes(cert.certificateID)
                                        ? "bg-primary border-primary text-greyscale-950"
                                        : "border-greyscale-700 bg-transparent"
                                        }`}>
                                        {selectedIds.includes(cert.certificateID) && <MdCheck size={14} />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <DialogFooter className="p-6 border-t border-greyscale-800 bg-greyscale-900/30">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="border-greyscale-700 hover:bg-greyscale-800"
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={selectedIds.length === 0 || isAssigning}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-32"
                    >
                        {isAssigning ? <Spinner className="h-4 w-4 mr-2" /> : <MdAdd className="mr-2 h-5 w-5" />}
                        Lưu thay đổi
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
