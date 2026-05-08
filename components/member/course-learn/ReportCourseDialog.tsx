"use client";

import React from "react";
import toast from "react-hot-toast";
import { IoHelpCircleOutline } from "react-icons/io5";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useCreateReport } from "@/hooks/report/useReport";
import { useLocale } from "@/providers/i18n-provider";
import { MdOutlineReport } from "react-icons/md";

type ReportPreset = {
	id: string;
	label: string;
	contentVN: string;
	contentEN: string;
};

const REPORT_PRESETS: ReportPreset[] = [
	{
		id: "bug",
		label: "Lỗi nội dung / Content issue",
		contentVN: "Tôi muốn khiếu nại khóa học này vì có lỗi nội dung hoặc hiển thị không chính xác.",
		contentEN: "I want to report this course because it contains incorrect or broken content.",
	},
	{
		id: "checkpoint",
		label: "Checkpoint bị lỗi / Checkpoint issue",
		contentVN: "Tôi muốn khiếu nại khóa học này vì checkpoint hoặc bài kiểm tra đang gặp sự cố.",
		contentEN: "I want to report this course because a checkpoint or assessment is not working properly.",
	},
	{
		id: "other",
		label: "Khác / Other",
		contentVN: "",
		contentEN: "",
	},
];

type ReportCourseDialogProps = {
	courseVersionId?: string;
};

export default function ReportCourseDialog({ courseVersionId }: ReportCourseDialogProps) {
	const locale = useLocale();
	const createReportMutation = useCreateReport();
	const [open, setOpen] = React.useState(false);
	const [selectedPresetId, setSelectedPresetId] = React.useState("bug");
	const [customContentVN, setCustomContentVN] = React.useState("");
	const [customContentEN, setCustomContentEN] = React.useState("");

	const selectedPreset =
		REPORT_PRESETS.find((preset) => preset.id === selectedPresetId) ?? REPORT_PRESETS[0];
	const isCustomPreset = selectedPresetId === "other";

	const resetForm = () => {
		setSelectedPresetId("bug");
		setCustomContentVN("");
		setCustomContentEN("");
	};

	const handleSubmit = async () => {
		if (!courseVersionId) {
			toast.error(
				locale === "vi"
					? "Không tìm thấy phiên bản khóa học."
					: "Course version not found.",
			);
			return;
		}

		const contentVN = isCustomPreset
			? customContentVN.trim()
			: selectedPreset.contentVN.trim();
		const contentEN = isCustomPreset
			? customContentEN.trim()
			: selectedPreset.contentEN.trim();

		if (!contentVN || !contentEN) {
			toast.error(
				locale === "vi"
					? "Vui lòng nhập cả nội dung tiếng Việt và tiếng Anh."
					: "Please enter both Vietnamese and English content.",
			);
			return;
		}

		try {
			const response = await createReportMutation.mutateAsync({
				referenceID: courseVersionId,
				reportType: "CourseVersion",
				contentVN,
				contentEN,
			});

			toast.success(
				response.message ||
					(locale === "vi" ? "Tạo khiếu nại thành công." : "Report created successfully."),
			);
			setOpen(false);
			resetForm();
		} catch (reportError) {
			const message =
				(reportError as { response?: { data?: { message?: string } } })?.response?.data?.message ||
				(reportError as { message?: string })?.message ||
				(locale === "vi" ? "Không thể gửi khiếu nại." : "Unable to submit the report.");
			toast.error(message);
		}
	};

	return (
		<>
			<Button
				icon={<MdOutlineReport size={20} />}
				variant="deleteIcon"
				onClick={() => setOpen(true)}
				disabled={createReportMutation.isPending || !courseVersionId}
			>
				{locale === "vi" ? "Khiếu nại" : "Report"}
			</Button>

			<Dialog
				open={open}
				onOpenChange={(nextOpen) => {
					setOpen(nextOpen);
					if (!nextOpen) {
						resetForm();
					}
				}}
			>
				<DialogContent className="max-h-[85vh] max-w-2xl overflow-hidden p-0">
					<div className="flex max-h-[85vh] flex-col">
						<DialogHeader className="border-b border-greyscale-700 px-6 py-5 text-left">
							<DialogTitle>
								{locale === "vi" ? "Khiếu nại khóa học" : "Report course"}
							</DialogTitle>
							<DialogDescription>
								{locale === "vi"
									? "Chọn một lý do có sẵn hoặc chuyển sang Khác để nhập nội dung riêng."
									: "Pick a preset reason or switch to Other to enter your own content."}
							</DialogDescription>
						</DialogHeader>

						<div className="flex-1 overflow-y-auto space-y-5 px-6 py-5">
							<div className="space-y-3">
								<p className="text-sm font-medium text-greyscale-0">
									{locale === "vi" ? "Chọn lý do" : "Choose a reason"}
								</p>
								<div className="grid gap-3 sm:grid-cols-2">
									{REPORT_PRESETS.map((preset) => {
										const isSelected = preset.id === selectedPresetId;

										return (
											<button
												key={preset.id}
												type="button"
												onClick={() => setSelectedPresetId(preset.id)}
												className={`rounded border px-4 py-3 text-left transition-colors ${
													isSelected
														? "border-primary bg-primary/10 text-greyscale-0"
														: "border-greyscale-700 bg-greyscale-900 text-greyscale-100 hover:border-greyscale-500 hover:bg-greyscale-800"
												}`}
											>
												<p className="font-semibold">{preset.label}</p>
												{preset.id !== "other" ? (
													<p className="mt-1 text-xs text-greyscale-200 line-clamp-2">
														{locale === "vi" ? preset.contentVN : preset.contentEN}
													</p>
												) : (
													<p className="mt-1 text-xs text-greyscale-200">
														{locale === "vi"
															? "Cho phép nhập nội dung khiếu nại riêng cho khóa học này."
															: "Lets you write a custom report message for this course."}
													</p>
												)}
											</button>
										);
									})}
								</div>
							</div>

							{isCustomPreset ? (
								<div className="grid gap-4">
									<div className="space-y-2">
										<p className="text-sm font-medium text-greyscale-0">
											{locale === "vi" ? "Nội dung tiếng Việt" : "Vietnamese content"}
										</p>
										<Textarea
											value={customContentVN}
											onChange={(event) => setCustomContentVN(event.target.value)}
											placeholder={
												locale === "vi"
													? "Nhập nội dung khiếu nại bằng tiếng Việt"
													: "Enter the report content in Vietnamese"
											}
											className="min-h-28"
										/>
									</div>

									<div className="space-y-2">
										<p className="text-sm font-medium text-greyscale-0">
											{locale === "vi" ? "Nội dung tiếng Anh" : "English content"}
										</p>
										<Textarea
											value={customContentEN}
											onChange={(event) => setCustomContentEN(event.target.value)}
											placeholder={
												locale === "vi"
													? "Nhập nội dung khiếu nại bằng tiếng Anh"
													: "Enter the report content in English"
											}
											className="min-h-28"
										/>
									</div>
								</div>
							) : (
								<div className="rounded border border-greyscale-700 bg-greyscale-900/70 p-4 space-y-3">
									<p className="text-sm font-medium text-greyscale-0">
										{locale === "vi" ? "Nội dung khiếu nại đã chọn" : "Selected report content"}
									</p>
									<div className="space-y-3 text-sm text-greyscale-100">
										<p>
											<span className="font-semibold text-greyscale-0">VI: </span>
											{selectedPreset.contentVN}
										</p>
										<p>
											<span className="font-semibold text-greyscale-0">EN: </span>
											{selectedPreset.contentEN}
										</p>
									</div>
								</div>
							)}
						</div>

						<DialogFooter className="border-t border-greyscale-700 px-6 py-4">
							<Button
								variant="outline"
								onClick={() => setOpen(false)}
								disabled={createReportMutation.isPending}
							>
								{locale === "vi" ? "Hủy" : "Cancel"}
							</Button>
							<Button
								onClick={handleSubmit}
								disabled={createReportMutation.isPending}
							>
								{createReportMutation.isPending
									? locale === "vi"
										? "Đang gửi..."
										: "Submitting..."
									: locale === "vi"
										? "Gửi khiếu nại"
										: "Submit report"}
							</Button>
						</DialogFooter>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}