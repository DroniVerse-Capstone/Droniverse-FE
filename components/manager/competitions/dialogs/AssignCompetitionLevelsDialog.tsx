"use client";

import React from "react";
import { MdCheck, MdAdd, MdOutlineSchool } from "react-icons/md";
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
import { useGetLevelsByDrone } from "@/hooks/level/useLevel";
import { useAssignCompetitionLevels, useDeleteCompetitionLevels } from "@/hooks/competitions/useCompetitions";
import { useLocale } from "@/providers/i18n-provider";
import { toast } from "react-hot-toast";

interface AssignCompetitionLevelsDialogProps {
    competitionId: string;
    droneId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    existingLevelIds: string[];
}

export default function AssignCompetitionLevelsDialog({
    competitionId,
    droneId,
    open,
    onOpenChange,
    existingLevelIds,
}: AssignCompetitionLevelsDialogProps) {
    const locale = useLocale();

    const LEVEL_NAME_MAP: Record<string, Record<string, string>> = {
        "Beginner": { vi: "Sơ Cấp", en: "Beginner" },
        "Intermediate": { vi: "Trung Cấp", en: "Intermediate" },
        "Advanced": { vi: "Cao Cấp", en: "Advanced" },
        "Master": { vi: "Bậc Thầy", en: "Master" }
    };

    const getLocalizedLevelName = (name: string) => {
        return LEVEL_NAME_MAP[name]?.[locale] || name;
    };

    const { data: allLevels = [], isLoading: isFetching } = useGetLevelsByDrone(droneId);
    const { mutateAsync: assignLevels, isPending: isAssigning } = useAssignCompetitionLevels();
    const { mutateAsync: deleteLevels, isPending: isDeleting } = useDeleteCompetitionLevels();

    const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

    const isProcessing = isAssigning || isDeleting;

    // Initialize selectedIds when dialog opens
    React.useEffect(() => {
        if (open) {
            setSelectedIds(existingLevelIds);
        }
    }, [open, existingLevelIds]);

    const toggleLevel = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSave = async () => {
        const addedIds = selectedIds.filter(id => !existingLevelIds.includes(id));
        const removedIds = existingLevelIds.filter(id => !selectedIds.includes(id));

        if (addedIds.length === 0 && removedIds.length === 0) {
            onOpenChange(false);
            return;
        }

        try {
            const promises = [];
            
            if (addedIds.length > 0) {
                promises.push(assignLevels({ competitionId, levelIds: addedIds }));
            }
            
            if (removedIds.length > 0) {
                promises.push(deleteLevels({ competitionId, levelIds: removedIds }));
            }

            await Promise.all(promises);
            toast.success("Cập nhật điều kiện tham gia thành công");
            onOpenChange(false);
        } catch (error: any) {
            console.error("Save Error:", error);
            toast.error(error.response?.data?.message || "Có lỗi khi cập nhật điều kiện");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl bg-greyscale-950 border-greyscale-800 text-greyscale-50 p-0 overflow-hidden flex flex-col max-h-[85vh]">
                <DialogHeader className="p-6 border-b border-greyscale-800">
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <LuClipboardList className="text-primary" />
                        {locale === "en" ? "Configure Participation Levels" : "Thiết lập điều kiện Cấp độ"}
                    </DialogTitle>
                    <DialogDescription className="text-greyscale-400">
                        {locale === "en" 
                            ? "Select the mandatory levels that candidates must achieve to participate in the competition." 
                            : "Chọn các cấp độ mà thí sinh bắt buộc phải đạt được để tham gia cuộc thi."}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6">
                    {isFetching ? (
                        <div className="flex h-40 items-center justify-center">
                            <Spinner className="h-8 w-8 text-primary" />
                        </div>
                    ) : allLevels.length === 0 ? (
                        <div className="text-center py-12">
                            <MdOutlineSchool className="mx-auto h-12 w-12 text-greyscale-700 mb-4" />
                            <p className="text-greyscale-400 font-medium">
                                {locale === "en" ? "No levels found for this drone." : "Không tìm thấy Cấp độ nào cho drone này."}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[...allLevels]
                                .sort((a, b) => a.levelNumber - b.levelNumber)
                                .map((level) => (
                                    <div
                                        key={level.levelId}
                                    onClick={() => toggleLevel(level.levelId)}
                                    className={`relative flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${selectedIds.includes(level.levelId)
                                        ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(255,102,0,0.1)]"
                                        : "bg-greyscale-900/50 border-greyscale-800 hover:border-greyscale-600"
                                        }`}
                                >
                                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-black text-xl shadow-inner border transition-colors ${selectedIds.includes(level.levelId)
                                        ? "bg-primary/20 border-primary/30 text-primary"
                                        : "bg-greyscale-800/50 border-greyscale-700/50 text-greyscale-400"
                                        }`}>
                                        {level.levelNumber}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black text-greyscale-50 truncate">
                                            {getLocalizedLevelName(level.name)}
                                        </p>
                                        <p className="text-[10px] font-bold text-greyscale-500 uppercase tracking-widest">
                                            {locale === "en" ? "Required Level" : "Yêu cầu Cấp độ"}
                                        </p>
                                    </div>
                                    <div className={`h-6 w-6 rounded-full border flex items-center justify-center transition-all ${selectedIds.includes(level.levelId)
                                        ? "bg-primary border-primary text-greyscale-950"
                                        : "border-greyscale-700 bg-transparent"
                                        }`}>
                                        {selectedIds.includes(level.levelId) && <MdCheck size={16} />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <DialogFooter className="p-6 border-t border-greyscale-800 bg-greyscale-900/30">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="text-greyscale-400 hover:text-greyscale-0 hover:bg-greyscale-800"
                    >
                        {locale === "en" ? "Cancel" : "Hủy"}
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isProcessing}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-40 font-bold shadow-lg shadow-primary/20"
                    >
                        {isProcessing ? <Spinner className="h-4 w-4 mr-2" /> : <MdAdd className="mr-2 h-5 w-5" />}
                        {locale === "en" ? "Save Configuration" : "Lưu thiết lập"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
