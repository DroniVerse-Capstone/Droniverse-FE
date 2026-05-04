"use client";

import React from "react";
import { MdOutlineInfo, MdOutlineSchool } from "react-icons/md";
import { LuClipboardList } from "react-icons/lu";

import { Spinner } from "@/components/ui/spinner";
import EmptyState from "@/components/common/EmptyState";
import { Competition } from "@/validations/competitions/competitions";
import { useLocale, useTranslations } from "@/providers/i18n-provider";
import { useGetClubDetailById } from "@/hooks/club/useClub";
import { useGetLevelsByDrone } from "@/hooks/level/useLevel";
import { useGetCompetitionLevels, useDeleteCompetitionLevels } from "@/hooks/competitions/useCompetitions";
import AssignCompetitionLevelsDialog from "../dialogs/AssignCompetitionLevelsDialog";
import { Button } from "@/components/ui/button";
import { MdAdd, MdClose } from "react-icons/md";
import { toast } from "react-hot-toast";
import ConfirmActionPopover from "@/components/common/ConfirmActionPopover";

interface CompetitionConditionsTabProps {
    competition: Competition;
}

export default function CompetitionConditionsTab({
    competition,
}: CompetitionConditionsTabProps) {
    const locale = useLocale();
    const t = useTranslations("ManagerCompetitions.detailPage.tabs");
    
    const LEVEL_NAME_MAP: Record<string, Record<string, string>> = {
        "Beginner": { vi: "Sơ Cấp", en: "Beginner" },
        "Intermediate": { vi: "Trung Cấp", en: "Intermediate" },
        "Advanced": { vi: "Cao Cấp", en: "Advanced" },
        "Master": { vi: "Thành Thạo", en: "Master" }
    };

    const getLocalizedLevelName = (name: string) => {
        return LEVEL_NAME_MAP[name]?.[locale] || name;
    };

    const [isConfigOpen, setIsConfigOpen] = React.useState(false);

    // 1. Fetch club detail to get the drone
    const { data: club, isLoading: isClubLoading } = useGetClubDetailById(competition.clubID);

    // 2. Fetch all levels based on the club's drone (for info/lookup)
    const droneID = club?.drone?.droneID;

    // 3. Fetch currently assigned levels for this competition
    const { data: assignedLevels, isLoading: isAssignedLoading } = useGetCompetitionLevels(competition.competitionID);
    const { mutate: deleteLevels, isPending: isDeleting } = useDeleteCompetitionLevels();

    const isLoading = isClubLoading || isAssignedLoading;
    const isDraft = competition.competitionStatus === "DRAFT";

    const handleDeleteLevel = (levelId: string) => {
        deleteLevels(
            { competitionId: competition.competitionID, levelIds: [levelId] },
            {
                onSuccess: () => {
                    toast.success("Đã xóa điều kiện Cấp độ thành công");
                },
                onError: (error: any) => {
                    toast.error(error.response?.data?.message || "Có lỗi khi xóa điều kiện");
                }
            }
        );
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Spinner className="h-8 w-8 text-primary" />
            </div>
        );
    }

    if (!club?.drone) {
        return (
            <EmptyState
                title="Không tìm thấy drone"
                description="Câu lạc bộ chưa thiết lập drone cho các hoạt động đào tạo và thi đấu."
            />
        );
    }

    const droneName = locale === "en" ? club.drone.droneNameEN : club.drone.droneNameVN;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Drone Info Section */}
            <div className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-3xl border border-greyscale-800 bg-greyscale-900/40 shadow-xl backdrop-blur-sm">
                <div className="w-full md:w-48 aspect-square relative rounded-2xl overflow-hidden bg-black border border-greyscale-700 shadow-inner group">
                    {club.drone.imgURL ? (
                        <img
                            src={club.drone.imgURL}
                            alt={droneName}
                            className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-greyscale-600 italic text-xs">
                            No image
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="flex-1 space-y-2">
                    <div className="space-y-1">
                        <h3 className="text-3xl font-black text-greyscale-0 tracking-tight">
                            {droneName}
                        </h3>
                        <p className="text-primary text-sm font-black uppercase tracking-widest">
                            {locale === "en" ? club.drone.droneTypeNameEN : club.drone.droneTypeNameVN} • {club.drone.manufacturer}
                        </p>
                    </div>
                </div>
            </div>

            {/* Participation Conditions Header */}
            <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-greyscale-800 pb-4">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold text-greyscale-0 flex items-center gap-2">
                            <LuClipboardList className="text-primary" />
                            {t("conditions")}
                        </h2>
                        <p className="text-sm text-greyscale-400">
                            {locale === "en" 
                                ? `Candidates must achieve the following levels for the drone ${droneName} to be eligible for participation.`
                                : `Thí sinh cần đạt các cấp độ sau đây của drone ${droneName} để đủ điều kiện tham gia.`}
                        </p>
                    </div>

                    {isDraft && (
                        <Button
                            onClick={() => setIsConfigOpen(true)}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
                        >
                            <MdAdd className="mr-2 h-5 w-5" />
                            {locale === "en" ? "Configure Levels" : "Thiết lập cấp độ"}
                        </Button>
                    )}
                </div>

                {/* Levels Grid */}
                {!assignedLevels || assignedLevels.length === 0 ? (
                    <div className="rounded-2xl border-2 border-dashed border-greyscale-800 bg-greyscale-900/20 py-12 text-center">
                        <MdOutlineSchool className="mx-auto h-12 w-12 text-greyscale-600 mb-3" />
                        <p className="text-greyscale-400 font-medium">
                            {locale === "en" ? "No level conditions have been set for this competition yet." : "Chưa có điều kiện Cấp độ nào được thiết lập cho cuộc thi này."}
                        </p>
                        {isDraft && (
                            <p className="text-xs text-greyscale-500 mt-2">
                                {locale === "en" ? 'Click the "Configure Levels" button to start.' : 'Bấm nút "Thiết lập Cấp độ" để bắt đầu.'}
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[...assignedLevels]
                            .sort((a, b) => a.levelNumber - b.levelNumber)
                            .map((level) => (
                                <div
                                    key={level.levelId}
                                    className="group relative p-5 rounded-2xl border border-greyscale-800 bg-greyscale-900/60 hover:bg-greyscale-800/80 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 flex items-center gap-4"
                                >
                                    <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xl shadow-inner">
                                        {level.levelNumber}
                                    </div>
                                    <div className="space-y-0.5 flex-1 min-w-0">
                                        <p className="text-[10px] font-black text-primary/70 uppercase tracking-widest">
                                            {locale === "en" ? "MANDATORY" : "BẮT BUỘC"}
                                        </p>
                                        <h4 className="font-bold text-greyscale-0 truncate">
                                            {getLocalizedLevelName(level.name)}
                                        </h4>
                                    </div>

                                    {isDraft && (
                                        <ConfirmActionPopover
                                            title={locale === "en" ? "Remove condition?" : "Xóa điều kiện?"}
                                            description={locale === "en" ? "Are you sure you want to remove this Level requirement from the competition?" : "Bạn có chắc chắn muốn gỡ bỏ yêu cầu Cấp độ này khỏi cuộc thi?"}
                                            confirmText={locale === "en" ? "Confirm delete" : "Xác nhận xóa"}
                                            cancelText={locale === "en" ? "Cancel" : "Hủy"}
                                            isLoading={isDeleting}
                                            onConfirm={() => handleDeleteLevel(level.levelId)}
                                            trigger={
                                                <button
                                                    className="opacity-0 group-hover:opacity-100 absolute -right-2 -top-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-all disabled:opacity-50"
                                                >
                                                    <MdClose size={14} />
                                                </button>
                                            }
                                        />
                                    )}
                                </div>
                            ))}
                    </div>
                )}
            </div>

            {/* Dialog for config */}
            {droneID && (
                <AssignCompetitionLevelsDialog
                    competitionId={competition.competitionID}
                    droneId={droneID}
                    open={isConfigOpen}
                    onOpenChange={setIsConfigOpen}
                    existingLevelIds={assignedLevels?.map(l => l.levelId) || []}
                />
            )}

            {/* Disclaimer */}
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                <MdOutlineInfo className="text-primary shrink-0 mt-0.5" size={20} />
                <p className="text-sm text-greyscale-300 leading-relaxed">
                    <strong>{locale === "en" ? "Note" : "Lưu ý"}:</strong> {locale === "en" 
                        ? "The system will automatically check the highest level certificate the candidate has achieved for this drone at the time of registration. Candidates must achieve at least Level 1 of the corresponding drone to participate."
                        : "Hệ thống sẽ tự động kiểm tra chứng chỉ Level cao nhất mà thí sinh đã đạt được đối với drone này tại thời điểm đăng ký. Thí sinh phải đạt ít nhất Level 1 của drone tương ứng để tham gia."}
                </p>
            </div>
        </div>
    );
}
