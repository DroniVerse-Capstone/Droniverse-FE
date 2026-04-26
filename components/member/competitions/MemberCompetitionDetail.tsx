"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useGetCompetitionDetail,
  useRegisterCompetition,
  useWithdrawCompetition,
} from "@/hooks/competitions/useCompetitions";
import { FadeIn } from "@/components/animation/FadeIn";
import { cn } from "@/lib/utils";
import { Loader2, ArrowLeft, LogOut } from "lucide-react";
import ConfirmActionPopover from "@/components/common/ConfirmActionPopover";
import { useLocale, useTranslations } from "@/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MemberCompetitionOverviewTab from "./tabs/MemberCompetitionOverviewTab";
import MemberCompetitionRoundsTab from "./tabs/MemberCompetitionRoundsTab";
import MemberCompetitionPrizesTab from "./tabs/MemberCompetitionPrizesTab";
import { toast } from "react-hot-toast";
import { MdEmojiEvents, MdCheckCircle, MdLock, MdOutlineTimer, MdLogout, MdPeopleAlt } from "react-icons/md";
import { Badge } from "@/components/ui/badge";
import MemberCompetitionLeaderboardTab from "./tabs/MemberCompetitionLeaderboardTab";

export default function MemberCompetitionDetail() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const locale = useLocale();
  const [activeTab, setActiveTab] = React.useState("overview");

  const { data: competition, isLoading } = useGetCompetitionDetail(id);
  const registerMutation = useRegisterCompetition();
  const withdrawMutation = useWithdrawCompetition();

  const [currentPhase, setCurrentPhase] = React.useState<string | null>(null);
  const [timeLeft, setTimeLeft] = React.useState<string>("");

  React.useEffect(() => {
    if (!competition) return;

    const calculatePhase = () => {
      const now = new Date().getTime();
      const visible = new Date(competition.visibleAt).getTime();
      const regStart = new Date(competition.registrationStartDate).getTime();
      const regEnd = new Date(competition.registrationEndDate).getTime();
      const start = new Date(competition.startDate).getTime();
      const end = new Date(competition.endDate).getTime();

      let actualPhase: string | null = competition.competitionPhase || null;
      let target: number | null = null;

      if (competition.competitionStatus !== "DRAFT") {
        if (now >= end) {
          actualPhase = "FINISHED";
          target = null;
        } else if (now >= start) {
          actualPhase = "ONGOING";
          target = end;
        } else if (now >= regEnd) {
          actualPhase = "REGISTRATION_CLOSED";
          target = start;
        } else if (now >= regStart) {
          actualPhase = "REGISTRATION_OPEN";
          target = regEnd;
        } else if (now >= visible) {
          actualPhase = "COMING_SOON";
          target = regStart;
        }
      }

      setCurrentPhase((prev) => (prev !== actualPhase ? actualPhase : prev));

      if (target) {
        const diff = target - now;
        if (diff > 0) {
          const h = Math.floor(diff / (1000 * 60 * 60));
          const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const s = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeLeft(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
        } else {
          setTimeLeft("00:00:00");
        }
      } else {
        setTimeLeft("");
      }
    };

    calculatePhase();
    const timer = setInterval(calculatePhase, 1000);
    return () => clearInterval(timer);
  }, [competition]);

  const handleRegister = async () => {
    if (!id) return;
    try {
      await registerMutation.mutateAsync(id);
      toast.success("Đăng ký tham gia cuộc thi thành công!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại sau.");
    }
  };

  const handleWithdraw = async () => {
    if (!id) return;
    try {
      await withdrawMutation.mutateAsync(id);
      toast.success("Rút khỏi cuộc thi thành công.");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Rút lui thất bại. Vui lòng thử lại sau.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!competition) return <div>Không tìm thấy cuộc thi</div>;

  const displayPhase = currentPhase || competition.competitionPhase;
  const isRegistrationOpen = displayPhase === "REGISTRATION_OPEN";
  const isRegistrationClosed = displayPhase === "REGISTRATION_CLOSED";
  const isComingSoon = displayPhase === "COMING_SOON";
  const isOngoing = displayPhase === "ONGOING";
  const isFinished = displayPhase === "FINISHED" || displayPhase === "COMPLETED";
  const isRegistered = competition.isRegistered;

  return (
    <div className="min-h-screen bg-greyscale-950 text-greyscale-50 pb-20 animate-in fade-in duration-700">
      {/* Header / Hero */}
      <div className="relative border-b border-greyscale-800 bg-greyscale-900/50 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="text-greyscale-400 hover:text-white hover:bg-white/5"
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-xl font-bold line-clamp-1">
                {locale === "en" ? competition.nameEN : competition.nameVN}
              </h1>
              <div className="flex items-center gap-3">
                <Badge className={cn(
                  "px-3 py-1 text-[11px] font-bold uppercase tracking-wider",
                  isFinished ? "bg-greyscale-800 text-greyscale-400 border-greyscale-700" :
                    (isRegistered && !isOngoing) ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                      isComingSoon ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                        isRegistrationOpen ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                          isRegistrationClosed ? "bg-purple-500/10 text-purple-500 border-purple-500/20" :
                            isOngoing ? "bg-cyan-500/10 text-cyan-500 border-cyan-500/20" :
                              "bg-greyscale-800 text-greyscale-400 border-greyscale-700"
                )}>
                  {isFinished ? "Đã kết thúc" :
                    isRegistered && !isOngoing ? "Đã đăng ký" :
                      isComingSoon ? "Sắp mở đăng ký" :
                        isRegistrationOpen ? "Đang mở đăng ký" :
                          isRegistrationClosed ? "Đã đóng đăng ký" :
                            isOngoing ? "Đang diễn ra" :
                              "Đã kết thúc"}
                </Badge>

              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {((!isRegistered && isRegistrationOpen) || (isRegistered && isOngoing)) && activeTab !== "rounds" && (
              <Button
                disabled={registerMutation.isPending || withdrawMutation.isPending}
                onClick={isRegistered && isOngoing ? () => setActiveTab("rounds") : handleRegister}
                className={cn(
                  "font-bold px-10 h-14 rounded-xl transition-all duration-500 border-none bg-linear-to-r from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                )}
              >
                {(registerMutation.isPending || withdrawMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isRegistered && isOngoing ? (
                  <div className="flex flex-col items-center leading-none">
                    <span className="text-[14px]">Vào phòng thi ngay</span>
                    <span className="text-[10px] font-medium opacity-80 mt-1">Đang diễn ra</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center leading-none">
                    <span className="text-[14px]">Đăng ký ngay</span>
                    <span className="text-[10px] font-medium opacity-80 mt-1 flex items-center gap-1">
                      <MdOutlineTimer size={12} /> Đóng sau: {timeLeft || "00:00:00"}
                    </span>
                  </div>
                )}
              </Button>
            )}

            {isRegistered && !isOngoing && !isFinished && (

              <ConfirmActionPopover
                title="Xác nhận rút lui"
                description="Bạn có chắc chắn muốn rút khỏi cuộc thi này? Hành động này không thể hoàn tác."
                confirmText="Xác nhận rút"
                cancelText="Quay lại"
                isLoading={withdrawMutation.isPending}
                onConfirm={handleWithdraw}
                trigger={
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={withdrawMutation.isPending || registerMutation.isPending}
                    className="text-red-400 border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50 font-bold h-14 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-red-500/5"
                  >
                    <MdLogout size={18} />
                    Rút lui
                  </Button>
                }
              />
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex items-center justify-between border-b border-greyscale-800">
            <TabsList className="bg-transparent h-12 p-0 gap-8">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-0 text-md font-bold transition-all"
              >
                Tổng quan
              </TabsTrigger>
              <TabsTrigger
                value="rounds"
                className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-0 text-md font-bold transition-all"
              >
                Vòng thi
              </TabsTrigger>
              <TabsTrigger
                value="prizes"
                className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-0 text-md font-bold transition-all"
              >
                Giải thưởng
              </TabsTrigger>
              {competition.resultPublishedAt && (
                <TabsTrigger
                  value="leaderboard"
                  className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-0 text-md font-bold transition-all"
                >
                  BXH
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <TabsContent value="overview">
            <FadeIn from="bottom">
              <MemberCompetitionOverviewTab competition={competition} />
            </FadeIn>
          </TabsContent>

          <TabsContent value="rounds">
            <FadeIn from="bottom">
              <MemberCompetitionRoundsTab competition={competition} />
            </FadeIn>
          </TabsContent>

          <TabsContent value="prizes">
            <FadeIn from="bottom">
              <MemberCompetitionPrizesTab
                competitionId={competition.competitionID}
              />
            </FadeIn>
          </TabsContent>

          {competition.resultPublishedAt && (
            <TabsContent value="leaderboard">
              <FadeIn from="bottom">
                <MemberCompetitionLeaderboardTab
                  competitionId={competition.competitionID}
                  isRegistered={competition.isRegistered}
                />
              </FadeIn>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
