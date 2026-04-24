"use client";

import React, { useState, useEffect } from "react";
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
import {
    CompetitionRound,
    UpdateRoundRequest
} from "@/validations/competitions/competitions";
import toast from "react-hot-toast";
import { useUpdateCompetitionRound } from "@/hooks/competitions/useCompetitionRounds";
import { Loader2 } from "lucide-react";

interface UpdateRoundDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    round: CompetitionRound;
}

export function UpdateRoundDialog({
    open,
    onOpenChange,
    round,
}: UpdateRoundDialogProps) {
    const t = useTranslations("ManagerCompetitions.detailPage.rounds.create"); // Reuse create translations
    const locale = useLocale();
    const { data: simulators, isLoading: isLoadingSimulators } = useGetVRSimulators();
    const updateRoundMutation = useUpdateCompetitionRound();

    const [formData, setFormData] = useState<Partial<UpdateRoundRequest>>({});
    const [limitMinutes, setLimitMinutes] = useState<string>("15");

    useEffect(() => {
        if (round) {
            // Check if round.startTime exists and format it for datetime-local (YYYY-MM-DDTHH:mm)
            const formatForInput = (dateStr: string) => {
                if (!dateStr) return "";
                // If it's already in a partial format or full ISO
                return dateStr.substring(0, 16); 
            };

            setFormData({
                vrSimulatorID: round.vrSimulator.vrSimulatorId,
                startTime: formatForInput(round.startTime),
                endTime: formatForInput(round.endTime),
            });

            // Extract minutes from HH:mm:ss
            if (round.timeLimit) {
                const parts = round.timeLimit.split(':');
                if (parts.length >= 2) {
                    const totalMinutes = parseInt(parts[0]) * 60 + parseInt(parts[1]);
                    setLimitMinutes(totalMinutes.toString());
                }
            }
        }
    }, [round, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.vrSimulatorID || !formData.startTime || !formData.endTime || !limitMinutes) {
            toast.error("Vui lòng điền đầy đủ thông tin");
            return;
        }

        try {
            const minutes = parseInt(limitMinutes);
            const h = Math.floor(minutes / 60).toString().padStart(2, "0");
            const m = (minutes % 60).toString().padStart(2, "0");
            const formattedLimitTime = `${h}:${m}:00`;

            const payload: UpdateRoundRequest = {
                vrSimulatorID: formData.vrSimulatorID!,
                // Ensure seconds are added if not present for backend validation
                startTime: formData.startTime!.length === 16 ? `${formData.startTime}:00` : formData.startTime!,
                endTime: formData.endTime!.length === 16 ? `${formData.endTime}:00` : formData.endTime!,
                timeLimit: formattedLimitTime,
            };

            await updateRoundMutation.mutateAsync({
                roundId: round.roundID,
                payload
            });
            toast.success("Cập nhật vòng thi thành công");
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Cập nhật vòng thi thất bại");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-greyscale-950 border-greyscale-800 text-greyscale-0">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-primary">Cập nhật vòng thi</DialogTitle>
                    <DialogDescription className="text-greyscale-400">
                        Chỉnh sửa thông tin vòng thi hiện tại.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="lab" className="text-sm font-medium text-greyscale-300">
                            Chọn Simulator
                        </Label>
                        <Select
                            onValueChange={(value) => setFormData({ ...formData, vrSimulatorID: value })}
                            value={formData.vrSimulatorID}
                        >
                            <SelectTrigger className="bg-greyscale-900 border-greyscale-800 focus:ring-primary h-11">
                                <SelectValue placeholder="Chọn VR cho vòng thi..." />
                            </SelectTrigger>
                            <SelectContent className="bg-greyscale-900 border-greyscale-800 text-greyscale-0">
                                {isLoadingSimulators ? (
                                    <div className="flex items-center justify-center p-4">
                                        <Loader2 className="animate-spin text-primary" size={20} />
                                    </div>
                                ) : (
                                    Array.isArray(simulators) && simulators.map((sim: any) => (
                                        <SelectItem key={sim.vrSimulatorID} value={sim.vrSimulatorID}>
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
                                className="bg-greyscale-900 border-greyscale-800 focus:ring-primary h-11"
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
                                className="bg-greyscale-900 border-greyscale-800 focus:ring-primary h-11"
                                required
                            />
                        </div>
                    </div>

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
                            className="bg-greyscale-900 border-greyscale-800 focus:ring-primary h-11"
                            required
                        />
                    </div>

                    <DialogFooter className="pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="text-greyscale-400 hover:text-white hover:bg-white/5"
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            disabled={updateRoundMutation.isPending}
                            className="bg-primary hover:bg-primary/90 text-white px-8 h-11 font-bold"
                        >
                            {updateRoundMutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Lưu thay đổi
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
