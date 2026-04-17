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
import { useTranslations } from "@/providers/i18n-provider";
import { useGetLabs } from "@/hooks/lab/useLabs";
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
    const { data: labs, isLoading: isLoadingLabs } = useGetLabs({
        type: "COMPETITION",
        status: "ACTIVE",
    });

    const createRoundMutation = useCreateCompetitionRound();

    const [formData, setFormData] = useState<Partial<CreateRoundRequest>>({
        competitionID: competition.competitionID,
        startTime: "",
        endTime: "",
    });
    const [limitMinutes, setLimitMinutes] = useState<string>("15");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.labID || !formData.startTime || !formData.endTime || !limitMinutes) {
            toast.error("Vui lòng điền đầy đủ thông tin");
            return;
        }

        try {
            const minutes = parseInt(limitMinutes);
            const h = Math.floor(minutes / 60).toString().padStart(2, "0");
            const m = (minutes % 60).toString().padStart(2, "0");
            const formattedLimitTime = `${h}:${m}:00`;

            // Send the exact value seen in the input (local time)
            // Backend often expects YYYY-MM-DDTHH:mm:ss
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
            });
            setLimitMinutes("15");
        } catch (error: any) {
            toast.error(error.response?.data?.message || t("toast.error"));
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-greyscale-950 border-greyscale-800 text-greyscale-0">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-primary">{t("title")}</DialogTitle>
                    <DialogDescription className="text-greyscale-400">
                        {t("subtitle")}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="lab" className="text-sm font-medium text-greyscale-300">
                            {t("fields.lab")}
                        </Label>
                        <Select
                            onValueChange={(value) => setFormData({ ...formData, labID: value })}
                            value={formData.labID}
                        >
                            <SelectTrigger className="bg-greyscale-900 border-greyscale-800 focus:ring-primary h-11">
                                <SelectValue placeholder={t("fields.labPlaceholder")} />
                            </SelectTrigger>
                            <SelectContent className="bg-greyscale-900 border-greyscale-800 text-greyscale-0">
                                {isLoadingLabs ? (
                                    <div className="flex items-center justify-center p-4">
                                        <Loader2 className="animate-spin text-primary" size={20} />
                                    </div>
                                ) : (
                                    Array.isArray(labs) && labs.map((lab: any) => (
                                        <SelectItem key={lab.labID} value={lab.labID}>
                                            {lab.nameVN}
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
                        <p className="text-[10px] text-greyscale-500 italic">Nhập số phút làm bài bài lab</p>
                    </div>

                    <DialogFooter className="pt-4">
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
