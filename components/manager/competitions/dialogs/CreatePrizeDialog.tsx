"use client";

import React from "react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useTranslations } from "@/providers/i18n-provider";
import { CreateCompetitionPrizeRequest, CompetitionPrize } from "@/validations/competitions/competitions";

interface CreatePrizeDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateCompetitionPrizeRequest) => void;
    isLoading: boolean;
    initialData?: CompetitionPrize | null;
}

export default function CreatePrizeDialog({
    isOpen,
    onClose,
    onSubmit,
    isLoading,
    initialData,
}: CreatePrizeDialogProps) {
    const t = useTranslations("ManagerCompetitions.detailPage.prizes");
    const isEdit = !!initialData;

    const [formData, setFormData] = React.useState<CreateCompetitionPrizeRequest>({
        titleVN: "",
        titleEN: "",
        descriptionVN: "",
        descriptionEN: "",
        rewardType: "MONEY",
        rewardValueMoney: 0,
        rewardValueGiftVN: "",
        rewardValueGiftEN: "",
        rankFrom: 1,
        rankTo: 1,
    });

    React.useEffect(() => {
        if (initialData) {
            setFormData({
                titleVN: initialData.titleVN,
                titleEN: initialData.titleEN,
                descriptionVN: initialData.descriptionVN || "",
                descriptionEN: initialData.descriptionEN || "",
                rewardType: initialData.rewardType,
                rewardValueMoney: initialData.rewardValueMoney || 0,
                rewardValueGiftVN: initialData.rewardValueGiftVN || "",
                rewardValueGiftEN: initialData.rewardValueGiftEN || "",
                rankFrom: initialData.rankFrom,
                rankTo: initialData.rankTo,
            });
        } else {
            setFormData({
                titleVN: "",
                titleEN: "",
                descriptionVN: "",
                descriptionEN: "",
                rewardType: "MONEY",
                rewardValueMoney: 0,
                rewardValueGiftVN: "",
                rewardValueGiftEN: "",
                rankFrom: 1,
                rankTo: 1,
            });
        }
    }, [initialData, isOpen]);

    const handleChange = (field: keyof CreateCompetitionPrizeRequest, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-greyscale-950 border-greyscale-800 text-greyscale-0 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? "Cập nhật giải thưởng" : (t("create.title") || "Thêm giải thưởng mới")}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit ? "Điều chỉnh thông tin chi tiết cho giải thưởng này." : (t("create.description") || "Nhập thông tin chi tiết cho giải thưởng này.")}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleFormSubmit} className="space-y-6 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Tiêu đề (Tiếng Việt)</Label>
                            <Input
                                className="bg-greyscale-900 border-greyscale-700 focus:border-primary"
                                placeholder="Giải Nhất"
                                value={formData.titleVN}
                                onChange={(e) => handleChange("titleVN", e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Title (English)</Label>
                            <Input
                                className="bg-greyscale-900 border-greyscale-700 focus:border-primary"
                                placeholder="First Prize"
                                value={formData.titleEN}
                                onChange={(e) => handleChange("titleEN", e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Mô tả (Tiếng Việt)</Label>
                            <Textarea
                                className="bg-greyscale-900 border-greyscale-700 min-h-[80px] focus:border-primary"
                                placeholder="Mô tả về giải thưởng..."
                                value={formData.descriptionVN || ""}
                                onChange={(e) => handleChange("descriptionVN", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Description (English)</Label>
                            <Textarea
                                className="bg-greyscale-900 border-greyscale-700 min-h-[80px] focus:border-primary"
                                placeholder="Description for the prize..."
                                value={formData.descriptionEN || ""}
                                onChange={(e) => handleChange("descriptionEN", e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Thứ hạng từ</Label>
                            <Input
                                type="number"
                                className="bg-greyscale-900 border-greyscale-700 focus:border-primary"
                                value={formData.rankFrom}
                                onChange={(e) => handleChange("rankFrom", parseInt(e.target.value))}
                                min={1}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Thứ hạng đến</Label>
                            <Input
                                type="number"
                                className="bg-greyscale-900 border-greyscale-700 focus:border-primary"
                                value={formData.rankTo}
                                onChange={(e) => handleChange("rankTo", parseInt(e.target.value))}
                                min={1}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Loại phần thưởng</Label>
                        <Select
                            value={formData.rewardType}
                            onValueChange={(value: any) => handleChange("rewardType", value)}
                        >
                            <SelectTrigger className="bg-greyscale-900 border-greyscale-700 focus:border-primary">
                                <SelectValue placeholder="Chọn loại phần thưởng" />
                            </SelectTrigger>
                            <SelectContent className="bg-greyscale-900 border-greyscale-800 text-greyscale-0">
                                <SelectItem value="MONEY">Tiền mặt</SelectItem>
                                <SelectItem value="GIFT">Hiện vật</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {formData.rewardType === "MONEY" ? (
                        <div className="space-y-2">
                            <Label>Tiền thưởng (VNĐ)</Label>
                            <Input
                                type="number"
                                className="bg-greyscale-900 border-greyscale-700 focus:border-primary"
                                placeholder="1000000"
                                value={formData.rewardValueMoney || 0}
                                onChange={(e) => handleChange("rewardValueMoney", parseInt(e.target.value))}
                            />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Phần quà (Tiếng Việt)</Label>
                                <Input
                                    className="bg-greyscale-900 border-greyscale-700 focus:border-primary"
                                    placeholder="1 Drone DJI Phantom"
                                    value={formData.rewardValueGiftVN || ""}
                                    onChange={(e) => handleChange("rewardValueGiftVN", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Gift (English)</Label>
                                <Input
                                    className="bg-greyscale-900 border-greyscale-700 focus:border-primary"
                                    placeholder="1 Drone DJI Phantom"
                                    value={formData.rewardValueGiftEN || ""}
                                    onChange={(e) => handleChange("rewardValueGiftEN", e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter className="pt-4 border-t border-greyscale-800">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
                            Hủy
                        </Button>
                        <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={isLoading}>
                            {isLoading ? "Đang lưu..." : (isEdit ? "Cập nhật giải thưởng" : "Lưu giải thưởng")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
