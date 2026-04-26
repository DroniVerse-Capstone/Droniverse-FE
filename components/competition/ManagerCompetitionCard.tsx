"use client"

import React from "react"
import { Trash2 } from "lucide-react"
import toast from "react-hot-toast"
import { FaFlagCheckered, FaRegClock, FaUserTie } from "react-icons/fa"
import { FiTarget } from "react-icons/fi"
import { IoPeople } from "react-icons/io5"
import { MdEmojiEvents, MdOutlineTimer, MdOutlinePublish, MdOutlineFactCheck } from "react-icons/md"
import { Spinner } from "@/components/ui/spinner"
import { useParams, useRouter } from "next/navigation"

import CompetitonStatusBadge from "@/components/competition/CompetitonStatusBadge"
import { formatDateTime } from "@/lib/utils/format-date"
import { useLocale, useTranslations } from "@/providers/i18n-provider"
import { Competition } from "@/validations/competitions/competitions"
import { Button } from "@/components/ui/button"
import UpdateCompetitionDialog from "@/components/manager/competitons/UpdateCompetitionDialog"
import { useDeleteCompetition, useUpdateCompetitionStatus } from "@/hooks/competitions/useCompetitions"
import ConfirmActionPopover from "@/components/common/ConfirmActionPopover"
import { cn } from "@/lib/utils"

type ManagerCompetitionCardProps = {
	competition: Competition
}

export default function ManagerCompetitionCard({
	competition,
}: ManagerCompetitionCardProps) {
	const locale = useLocale()
	const t = useTranslations("ManagerCompetitions")

	const title =
		locale === "en"
			? competition.nameEN || competition.nameVN
			: competition.nameVN || competition.nameEN

	const [isUpdateOpen, setIsUpdateOpen] = React.useState(false)
	const router = useRouter()
	const { clubSlug } = useParams()
	const deleteMutation = useDeleteCompetition()
	const statusMutation = useUpdateCompetitionStatus()

	const handleUpdateStatus = async (status: 'PUBLISHED' | 'RESULT_PUBLISHED') => {
		try {
			await statusMutation.mutateAsync({
				id: competition.competitionID,
				status,
				invalidReason: null
			})
			toast.success(locale === 'en' ? 'Status updated!' : 'Đã cập nhật trạng thái!')
		} catch (error: any) {
			toast.error(error?.response?.data?.message || (locale === 'en' ? 'Failed to update status' : 'Cập nhật trạng thái thất bại'));
		}
	}

	const handleDelete = async () => {
		try {
			await deleteMutation.mutateAsync(competition.competitionID)
			toast.success(t("delete.toastSuccess"))
		} catch (error) {
			toast.error(t("delete.toastError"))
		}
	}

	const description =
		locale === "en"
			? competition.descriptionEN || competition.descriptionVN
			: competition.descriptionVN || competition.descriptionEN

	const isFinished = 
		competition.competitionPhase === "FINISHED" || 
		competition.competitionPhase === "COMPLETED" || 
		new Date().getTime() > new Date(competition.endDate).getTime();

	return (
		<article className={cn(
			"group overflow-hidden rounded border border-greyscale-700 bg-linear-to-r from-greyscale-800 via-greyscale-700 to-greyscale-900 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-greyscale-500 hover:shadow-md",
			isFinished && "opacity-60 grayscale-[0.3] hover:opacity-80 transition-opacity"
		)}>
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div className="min-w-0 space-y-1">
					<h3 className="line-clamp-2 text-lg font-semibold text-greyscale-0 leading-tight">
						{title}
					</h3>
					<p className="line-clamp-2 text-sm text-greyscale-100">
						{description || t("fallback.noDescription")}
					</p>
				</div>

				<CompetitonStatusBadge 
					status={competition.competitionStatus} 
					phase={competition.competitionPhase || undefined}
					endDate={competition.endDate}
				/>
			</div>

			{/* Metrics Grid (2x2 for more space) */}
			<div className="mt-5 grid grid-cols-2 gap-3">
				{[
					{ icon: FiTarget, label: t("metrics.rounds"), value: competition.totalRounds, color: "text-indigo-400" },
					{ icon: IoPeople, label: t("metrics.competitors"), value: `${competition.totalCompetitors}/${competition.maxParticipants}`, color: "text-emerald-400" },
					{ icon: MdEmojiEvents, label: t("metrics.prizes"), value: competition.totalPrizes, color: "text-amber-400" },
					{ icon: FaRegClock, label: t("metrics.visible"), value: formatDateTime(competition.visibleAt), color: "text-rose-400" },
				].map((metric, i) => (
					<div key={i} className="rounded-lg border border-greyscale-700 bg-greyscale-800/70 p-3 shadow-inner">
						<p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-greyscale-500">
							<metric.icon size={14} className={metric.color} />
							{metric.label}
						</p>
						<p className="mt-1.5 text-sm font-bold text-greyscale-50">
							{metric.value}
						</p>
					</div>
				))}
			</div>

			{/* Horizontal Roadmap (Refined labels) */}
			<div className="mt-4 rounded-lg border border-greyscale-700 bg-greyscale-800/45 p-5 shadow-inner">
				<div className="relative flex items-center justify-between px-2">
					{/* Connecting Line */}
					<div className="absolute top-1.5 left-4 right-4 h-0.5 bg-greyscale-700 z-0" />

					{[
						{ label: locale === 'en' ? 'Visible' : 'Hiển thị', date: competition.visibleAt },
						{ label: locale === 'en' ? 'Reg Open' : 'Mở ĐK', date: competition.registrationStartDate },
						{ label: locale === 'en' ? 'Reg Close' : 'Đóng ĐK', date: competition.registrationEndDate },
						{ label: locale === 'en' ? 'Start' : 'Bắt đầu', date: competition.startDate },
						{ label: locale === 'en' ? 'End' : 'Kết thúc', date: competition.endDate },
					].map((node, i) => {
						const nodeTime = new Date(node.date).getTime();
						const now = new Date().getTime();
						const isPast = now > nodeTime;

						return (
							<div key={i} className="relative z-10 flex flex-col items-center flex-1">
								{/* Dot */}
								<div className={cn(
									"h-3 w-3 rounded-full border-2 transition-all duration-500",
									isPast 
										? "bg-emerald-500 border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
										: "bg-greyscale-950 border-greyscale-700"
								)} />
								
								{/* Labels */}
								<div className="mt-3 text-center">
									<p className={cn(
										"text-[7px] font-black uppercase tracking-tighter leading-tight mb-1",
										isPast ? "text-emerald-400" : "text-greyscale-500"
									)}>
										{node.label}
									</p>
									<p className="text-[8px] font-bold text-greyscale-200 whitespace-nowrap">
										{formatDateTime(node.date).split(' ')[0]}
									</p>
									<p className="text-[7px] text-greyscale-500 mt-0.5 font-medium">
										{formatDateTime(node.date).split(' ')[1]}
									</p>
								</div>
							</div>
						);
					})}
				</div>
			</div>

			<div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-greyscale-700 pt-4 text-[11px] text-greyscale-400 font-medium">
				<p className="flex items-center gap-1.5">
					<FaUserTie size={12} className="text-greyscale-500" />
					<span className="text-greyscale-200 font-bold">{competition.createdBy.fullName}</span>
				</p>
				<p className="text-greyscale-500 uppercase tracking-widest text-[9px]">
					{t("meta.createdAt")}: <span className="text-greyscale-300 font-bold ml-1">{formatDateTime(competition.createdAt)}</span>
				</p>
			</div>

			{competition.invalidReason && (
				<div className="mt-3 rounded border border-error/45 bg-error/10 p-2 text-xs text-error">
					{t("meta.invalidReason")}: {" "}
					{competition.invalidReason}
				</div>
			)}

			<div className="mt-4 flex items-center gap-2 pt-1">
				<Button
					size="sm"
					variant="outline"
					onClick={() => router.push(`/manager/${clubSlug}/competitions/${competition.competitionID}`)}
					className="flex-1 h-10 border-greyscale-600 bg-greyscale-800/50 hover:bg-greyscale-700 hover:text-white text-xs font-bold"
				>
					{t("detailsDialog.buttons.details")}
				</Button>

				{competition.competitionStatus === "DRAFT" && (
					<Button
						size="sm"
						variant="outline"
						onClick={() => setIsUpdateOpen(true)}
						className="flex-1 h-10 border-greyscale-600 bg-greyscale-800/50 hover:bg-greyscale-700 hover:text-white text-xs font-bold"
					>
						{t("updateDialog.buttons.edit")}
					</Button>
				)}

				{competition.competitionStatus === "DRAFT" && (
					<ConfirmActionPopover
						title={locale === 'en' ? 'Publish Competition' : 'Công bố cuộc thi'}
						description={locale === 'en' ? 'Make this competition visible to all participants.' : 'Hiển thị cuộc thi này cho tất cả thí sinh.'}
						confirmText={locale === 'en' ? 'Publish' : 'Công bố'}
						cancelText={t("delete.cancelText")}
						isLoading={statusMutation.isPending}
						onConfirm={() => handleUpdateStatus('PUBLISHED')}
						triggerClassName="flex-1"
						trigger={
							<Button
								className="w-full h-10 bg-primary hover:bg-primary/90 text-white font-bold gap-2 shadow-lg shadow-primary/20 text-xs"
							>
								{statusMutation.isPending ? <Spinner className="h-4 w-4" /> : <MdOutlinePublish size={16} />}
								{locale === 'en' ? 'Publish Now' : 'Công bố ngay'}
							</Button>
						}
					/>
				)}

				<div className="flex shrink-0 items-center gap-1">
					{competition.competitionStatus === "DRAFT" && (
						<ConfirmActionPopover
							title={t("delete.title")}
							description={t("delete.description")}
							confirmText={t("delete.confirmText")}
							cancelText={t("delete.cancelText")}
							isLoading={deleteMutation.isPending}
							onConfirm={handleDelete}
							trigger={
								<Button
									size="icon"
									variant="ghost"
									className="h-10 w-10 shrink-0 text-greyscale-400 hover:bg-error/10 hover:text-error"
									title={t("delete.confirmText")}
								>
									<Trash2 size={18} />
								</Button>
							}
						/>
					)}
				</div>
			</div>

			<UpdateCompetitionDialog
				competition={competition}
				open={isUpdateOpen}
				onOpenChange={setIsUpdateOpen}
			/>
		</article>
	)
}
