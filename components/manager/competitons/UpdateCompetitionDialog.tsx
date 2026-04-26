"use client";

import { AxiosError } from "axios";
import React from "react";
import toast from "react-hot-toast";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import QuillEditor from "@/components/common/QuillEditor";
import { useTranslations } from "@/providers/i18n-provider";
import { useUpdateCompetition } from "@/hooks/competitions/useCompetitions";
import { Competition, updateCompetitionRequestSchema } from "@/validations/competitions/competitions";
import { toLocalDatetimeString } from "@/lib/utils/format-date";

interface UpdateCompetitionDialogProps {
    competition: Competition;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function UpdateCompetitionDialog({
    competition,
    open,
    onOpenChange,
}: UpdateCompetitionDialogProps) {
    const t = useTranslations("ManagerCompetitions.updateDialog");
    const tf = useTranslations("ManagerCompetitions.createDialog.fields");

    const [form, setForm] = React.useState({
        nameVN: competition.nameVN,
        nameEN: competition.nameEN,
        descriptionVN: competition.descriptionVN || "",
        descriptionEN: competition.descriptionEN || "",
        ruleContent: competition.ruleContent,
        maxParticipants: competition.maxParticipants,
        visibleAt: toLocalDatetimeString(competition.visibleAt),
        registrationStartDate: toLocalDatetimeString(competition.registrationStartDate),
        registrationEndDate: toLocalDatetimeString(competition.registrationEndDate),
        startDate: toLocalDatetimeString(competition.startDate),
        endDate: toLocalDatetimeString(competition.endDate),
    });

    const updateCompetitionMutation = useUpdateCompetition();

    const isSubmitting = updateCompetitionMutation.isPending;

    const normalizedPayload = React.useMemo(() => {
        return {
            nameVN: form.nameVN.trim(),
            nameEN: form.nameEN.trim(),
            descriptionVN: form.descriptionVN.trim(),
            descriptionEN: form.descriptionEN.trim(),
            ruleContent: form.ruleContent.trim(),
            maxParticipants: Number(form.maxParticipants),
            visibleAt: form.visibleAt ? `${form.visibleAt}:00` : "",
            registrationStartDate: form.registrationStartDate ? `${form.registrationStartDate}:00` : "",
            registrationEndDate: form.registrationEndDate ? `${form.registrationEndDate}:00` : "",
            startDate: form.startDate ? `${form.startDate}:00` : "",
            endDate: form.endDate ? `${form.endDate}:00` : "",
        };
    }, [form]);

    const formValidation = React.useMemo(() => {
        return updateCompetitionRequestSchema.safeParse(normalizedPayload);
    }, [normalizedPayload]);

    const setField = <K extends keyof typeof form>(
        key: K,
        value: (typeof form)[K]
    ) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleOpenChange = (nextOpen: boolean) => {
        if (isSubmitting) return;
        onOpenChange(nextOpen);
    };

    const handleSubmit = async () => {
        if (!formValidation.success) {
            const firstError = formValidation.error.issues[0];
            if (firstError) {
                toast.error(firstError.message || t("toast.error"));
            } else {
                toast.error(t("toast.error"));
            }
            return;
        }

        try {
            await updateCompetitionMutation.mutateAsync({
                id: competition.competitionID,
                payload: formValidation.data,
            });
            toast.success(t("toast.success"));
            onOpenChange(false);
        } catch (error) {
            const axiosError = error as AxiosError<{ message?: string }>;
            toast.error(
                axiosError.response?.data?.message ||
                axiosError.message ||
                t("toast.error")
            );
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden p-0 bg-greyscale-900 border-greyscale-800 text-greyscale-50">
                <div className="flex max-h-[90vh] flex-col">
                    <DialogHeader className="px-6 pt-6 pb-2 border-b border-greyscale-800">
                        <DialogTitle className="text-xl text-greyscale-50">{t("title")}</DialogTitle>
                        <DialogDescription className="text-greyscale-300">
                            {t("subtitle")}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="comp-name-vn">{tf("nameVn")}</Label>
                                <Input
                                    id="comp-name-vn"
                                    value={form.nameVN}
                                    onChange={(e) => setField("nameVN", e.target.value)}
                                    placeholder={tf("nameVnPlaceholder")}
                                    className="bg-greyscale-850 border-greyscale-700 focus-visible:ring-primary"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="comp-name-en">{tf("nameEn")}</Label>
                                <Input
                                    id="comp-name-en"
                                    value={form.nameEN}
                                    onChange={(e) => setField("nameEN", e.target.value)}
                                    placeholder={tf("nameEnPlaceholder")}
                                    className="bg-greyscale-850 border-greyscale-700 focus-visible:ring-primary"
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="comp-desc-vn">{tf("descVn")}</Label>
                                <Textarea
                                    id="comp-desc-vn"
                                    value={form.descriptionVN}
                                    onChange={(e) => setField("descriptionVN", e.target.value)}
                                    placeholder={tf("descVnPlaceholder")}
                                    className="bg-greyscale-850 border-greyscale-700 focus-visible:ring-primary resize-none h-24"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="comp-desc-en">{tf("descEn")}</Label>
                                <Textarea
                                    id="comp-desc-en"
                                    value={form.descriptionEN}
                                    onChange={(e) => setField("descriptionEN", e.target.value)}
                                    placeholder={tf("descEnPlaceholder")}
                                    className="bg-greyscale-850 border-greyscale-700 focus-visible:ring-primary resize-none h-24"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>{tf("maxParticipants")}</Label>
                            <Input
                                type="number"
                                min={1}
                                value={form.maxParticipants}
                                onChange={(e) => setField("maxParticipants", parseInt(e.target.value, 10))}
                                className="bg-greyscale-850 border-greyscale-700 focus-visible:ring-primary md:w-1/2"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="block border-b border-greyscale-800 pb-2 font-semibold">
                                Timeline
                            </Label>
                            <div className="grid gap-4 md:grid-cols-2 pt-2">
                                <div className="space-y-2">
                                    <Label htmlFor="comp-visible-at">{tf("visibleAt")}</Label>
                                    <Input
                                        id="comp-visible-at"
                                        type="datetime-local"
                                        value={form.visibleAt}
                                        onChange={(e) => setField("visibleAt", e.target.value)}
                                        className="bg-greyscale-850 border-greyscale-700 focus-visible:ring-primary [color-scheme:dark]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="comp-reg-start">{tf("registrationStartDate")}</Label>
                                    <Input
                                        id="comp-reg-start"
                                        type="datetime-local"
                                        value={form.registrationStartDate}
                                        onChange={(e) => setField("registrationStartDate", e.target.value)}
                                        className="bg-greyscale-850 border-greyscale-700 focus-visible:ring-primary [color-scheme:dark]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="comp-reg-end">{tf("registrationEndDate")}</Label>
                                    <Input
                                        id="comp-reg-end"
                                        type="datetime-local"
                                        value={form.registrationEndDate}
                                        onChange={(e) => setField("registrationEndDate", e.target.value)}
                                        className="bg-greyscale-850 border-greyscale-700 focus-visible:ring-primary [color-scheme:dark]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="comp-start">{tf("startDate")}</Label>
                                    <Input
                                        id="comp-start"
                                        type="datetime-local"
                                        value={form.startDate}
                                        onChange={(e) => setField("startDate", e.target.value)}
                                        className="bg-greyscale-850 border-greyscale-700 focus-visible:ring-primary [color-scheme:dark]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="comp-end">{tf("endDate")}</Label>
                                    <Input
                                        id="comp-end"
                                        type="datetime-local"
                                        value={form.endDate}
                                        onChange={(e) => setField("endDate", e.target.value)}
                                        className="bg-greyscale-850 border-greyscale-700 focus-visible:ring-primary [color-scheme:dark]"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>{tf("ruleContent")}</Label>
                            <QuillEditor
                                value={form.ruleContent}
                                onChange={(val) => setField("ruleContent", val)}
                                placeholder={tf("ruleContentPlaceholder")}
                                minHeight={250}
                            />
                        </div>
                    </div>

                    <DialogFooter className="flex-row justify-end gap-3 border-t border-greyscale-800 px-6 py-4 bg-greyscale-950 sm:space-x-0">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={isSubmitting}
                            onClick={() => handleOpenChange(false)}
                            className="border-greyscale-700 text-greyscale-100 hover:bg-greyscale-850 hover:text-white"
                        >
                            {t("buttons.cancel")}
                        </Button>

                        <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            {isSubmitting ? <Spinner className="w-4 h-4 mr-2" /> : null}
                            {t("buttons.save")}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
