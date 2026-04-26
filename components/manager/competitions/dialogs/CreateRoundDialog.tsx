"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useLocale, useTranslations } from "@/providers/i18n-provider";
import { useGetVRSimulators } from "@/hooks/simulator/useSimulator";
import { formatDateTime } from "@/lib/utils/format-date";
import {
    Competition,
    CreateRoundRequest
} from "@/validations/competitions/competitions";
import toast from "react-hot-toast";
import { useCreateCompetitionRound } from "@/hooks/competitions/useCompetitionRounds";
import { Loader2 } from "lucide-react";

interface CreateRoundDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    competition: Competition;
}

export function CreateRoundDialog({
    open,
    onOpenChange,
    competition,
}: CreateRoundDialogProps) {
    const t = useTranslations("ManagerCompetitions.detailPage.rounds.create");
    const locale = useLocale();
    const { data: simulators, isLoading: isLoadingSimulators } = useGetVRSimulators({ type: "COMPETITION" });

    const createRoundMutation = useCreateCompetitionRound();

    const [formData, setFormData] = useState<Partial<CreateRoundRequest>>({
        competitionID: competition.competitionID,
        startTime: "",
        endTime: "",
        weight: 1,
    });
    const [limitMinutes, setLimitMinutes] = useState<string>("15");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.vrSimilatorID || !formData.startTime || !formData.endTime || !limitMinutes || !formData.weight) {
            toast.error("Vui lòng điền đầy đủ thông tin");
            return;
        }

        const start = new Date(formData.startTime).getTime();
        const end = new Date(formData.endTime).getTime();
        
        if (end <= start) {
            toast.error("Thời gian kết thúc phải lớn hơn thời gian bắt đầu.");
            return;
        }

        const durationMinutes = Math.floor((end - start) / (1000 * 60));
        const minutes = parseInt(limitMinutes);

        if (isNaN(minutes) || minutes <= 0) {
            toast.error("Thời gian làm bài phải là số lớn hơn 0.");
            return;
        }

        if (minutes > durationMinutes) {
            toast.error(`Thời gian làm bài (${minutes} phút) không được vượt quá khoảng thời gian mở vòng thi (${durationMinutes} phút).`);
            return;
        }

        try {
            const h = Math.floor(minutes / 60).toString().padStart(2, "0");
            const m = (minutes % 60).toString().padStart(2, "0");
            const formattedLimitTime = `${h}:${m}:00`;

            const payload: CreateRoundRequest = {
                ...formData as CreateRoundRequest,
                startTime: `${formData.startTime}:00`,
                endTime: `${formData.endTime}:00`,
                limitTime: formattedLimitTime,
            };

            await createRoundMutation.mutateAsync(payload);
            toast.success(t("toast.success"));
            onOpenChange(false);
            setFormData({
                competitionID: competition.competitionID,
                startTime: "",
                endTime: "",
                weight: 1,
            });
            setLimitMinutes("15");
        } catch (error: any) {
            toast.error(error.response?.data?.message || t("toast.error"));
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-greyscale-900 border-greyscale-800 text-greyscale-50 p-0 overflow-hidden">
                <DialogHeader className="px-6 py-4 border-b border-greyscale-800 bg-greyscale-950/50">
                    <DialogTitle className="text-xl font-bold text-greyscale-50 uppercase tracking-tight">{t("title")}</DialogTitle>
                    <DialogDescription className="text-greyscale-400 text-sm">
                        {t("subtitle")}
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-primary/5 border-y border-primary/10 px-6 py-3 flex items-center justify-between text-[11px]">
                    <div className="flex flex-col gap-1">
                        <span className="text-greyscale-500 font-black uppercase tracking-widest text-[9px]">Thời gian cuộc thi</span>
                        <div className="flex items-center gap-3 font-bold text-greyscale-200">
                            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {formatDateTime(competition.startDate)}</span>
                            <span className="text-greyscale-600 font-normal">→</span>
                            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> {formatDateTime(competition.endDate)}</span>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 p-6">
                    <div className="space-y-2">
                        <Label htmlFor="lab" className="text-sm font-medium text-greyscale-300">
                            Chọn Simulator
                        </Label>
                        <Select
                            onValueChange={(value) => setFormData({ ...formData, vrSimilatorID: value })}
                            value={formData.vrSimilatorID}
                        >
                            <SelectTrigger className="bg-greyscale-950 border-greyscale-700 focus:ring-2 focus:ring-primary/20 focus:border-primary h-11 text-greyscale-100 transition-all hover:border-greyscale-500">
                                <SelectValue placeholder="Chọn VR cho vòng thi..." />
                            </SelectTrigger>
                            <SelectContent className="bg-greyscale-850 border-greyscale-700 text-greyscale-100 shadow-2xl overflow-hidden">
                                {isLoadingSimulators ? (
                                    <div className="flex items-center justify-center p-4">
                                        <Loader2 className="animate-spin text-primary" size={20} />
                                    </div>
                                ) : (
                                    Array.isArray(simulators) && simulators.map((sim: any) => (
                                        <SelectItem 
                                            key={sim.vrSimulatorID} 
                                            value={sim.vrSimulatorID}
                                            className="focus:bg-primary/20 focus:text-primary cursor-pointer transition-colors"
                                        >
                                            {locale === "en" ? sim.titleEN || sim.titleVN : sim.titleVN || sim.titleEN}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startTime" className="text-sm font-medium text-greyscale-300">
                                {t("fields.startTime")}
                            </Label>
                            <Input
                                id="startTime"
                                type="datetime-local"
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                className="bg-greyscale-950 border-greyscale-700 focus:ring-primary h-11 text-greyscale-100"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endTime" className="text-sm font-medium text-greyscale-300">
                                {t("fields.endTime")}
                            </Label>
                            <Input
                                id="endTime"
                                type="datetime-local"
                                value={formData.endTime}
                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                className="bg-greyscale-950 border-greyscale-700 focus:ring-primary h-11 text-greyscale-100"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="limitTime" className="text-sm font-medium text-greyscale-300">
                                {t("fields.limitTime")}
                            </Label>
                            <Input
                                id="limitTime"
                                type="number"
                                min="1"
                                placeholder={t("fields.limitTimePlaceholder")}
                                value={limitMinutes}
                                onChange={(e) => setLimitMinutes(e.target.value)}
                                className="bg-greyscale-950 border-greyscale-700 focus:ring-primary h-11 text-greyscale-100"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="weight" className="text-sm font-medium text-greyscale-300">
                                Độ khó
                            </Label>
                            <Select
                                onValueChange={(value) => setFormData({ ...formData, weight: parseInt(value) })}
                                value={formData.weight?.toString() || "1"}
                            >
                                <SelectTrigger className="bg-greyscale-950 border-greyscale-700 focus:ring-primary h-11 text-greyscale-100">
                                    <SelectValue placeholder="Chọn độ khó" />
                                </SelectTrigger>
                                <SelectContent className="bg-greyscale-850 border-greyscale-700 text-greyscale-100 shadow-2xl">
                                    <SelectItem value="1" className="focus:bg-emerald-500/20 focus:text-emerald-400">Dễ</SelectItem>
                                    <SelectItem value="2" className="focus:bg-amber-500/20 focus:text-amber-400">Trung bình</SelectItem>
                                    <SelectItem value="3" className="focus:bg-rose-500/20 focus:text-rose-400">Khó</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter className="pt-4 border-t border-greyscale-800 mt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="text-greyscale-400 hover:text-white hover:bg-white/5"
                        >
                            {t("buttons.cancel")}
                        </Button>
                        <Button
                            type="submit"
                            disabled={createRoundMutation.isPending}
                            className="bg-primary hover:bg-primary/90 text-white px-8 h-11 font-bold"
                        >
                            {createRoundMutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {t("buttons.create")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
