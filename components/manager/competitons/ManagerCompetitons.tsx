"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, RefreshCcw } from "lucide-react";
import { IoFilterSharp, IoSearchOutline } from "react-icons/io5";
import { MdOutlineClose } from "react-icons/md";

import ManagerCompetitionCard from "@/components/competition/ManagerCompetitionCard";
import CreateCompetitionDialog from "@/components/manager/competitons/CreateCompetitionDialog";
import EmptyState from "@/components/common/EmptyState";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import InlineFilterRow, { InlineFilterOption } from "@/components/common/InlineFilterRow";
import { useGetCompetitionsByClub } from "@/hooks/competitions/useCompetitions";
import { useLocale, useTranslations } from "@/providers/i18n-provider";
import { CompetitionStatus } from "@/validations/competitions/competitions";
import { COMPETITION_STATUS } from "@/lib/constants/competition";
import { cn } from "@/lib/utils";

const UUID_SUFFIX_REGEX =
  /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function ManagerCompetitons() {
  const t = useTranslations("ManagerCompetitions");
  const locale = useLocale();
  const router = useRouter();
  const params = useParams<{ clubSlug?: string }>();
  const clubSlug = params?.clubSlug;

  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);

  const [selectedStatus, setSelectedStatus] = React.useState<CompetitionStatus | null>(null);
  const [searchInput, setSearchInput] = React.useState("");
  const [searchKeyword, setSearchKeyword] = React.useState("");
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const clubId = React.useMemo(() => {
    if (!clubSlug) return undefined;
    const uuidMatch = clubSlug.match(UUID_SUFFIX_REGEX);
    return uuidMatch?.[0];
  }, [clubSlug]);

  const {
    data: competitions = [],
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useGetCompetitionsByClub(clubId, { status: selectedStatus });

  const statusOptions = React.useMemo<InlineFilterOption<CompetitionStatus>[]>(
    () =>
      COMPETITION_STATUS.filter((s) => s.value !== null).map((s) => ({
        value: s.value as CompetitionStatus,
        label: t(`status.${s.label}`),
      })),
    [t],
  );

  const filteredCompetitions = React.useMemo(() => {
    let result = [...competitions];

    if (searchInput.trim()) {
      const keyword = searchInput.toLowerCase().trim();
      result = result.filter((c) => {
        const nameVN = c.nameVN?.toLowerCase() || "";
        const nameEN = c.nameEN?.toLowerCase() || "";
        return nameVN.includes(keyword) || nameEN.includes(keyword);
      });
    }

    return result.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [competitions, searchInput]);

  const clearSearch = React.useCallback(() => {
    setSearchInput("");
  }, []);

  if (!clubId) {
    return (
      <div className="px-6 py-4">
        <EmptyState title={t("errors.resolveClub")} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-greyscale-0 ">Cuộc thi của Câu lạc bộ</h2>
      <div className="flex flex-col gap-6 rounded-md border border-greyscale-700 bg-greyscale-900/40 p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-greyscale-400">
              <IoFilterSharp size={18} />
              <p className="text-xs font-bold uppercase tracking-widest">{t("filter")}</p>
            </div>

            <InlineFilterRow
              label={t("status.label")}
              selectedValue={selectedStatus}
              options={statusOptions}
              onChange={setSelectedStatus}
              allLabel={t("status.all")}
            />
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center xl:max-w-xl">
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-greyscale-500 pointer-events-none">
                <IoSearchOutline size={18} />
              </div>
              <Input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="bg-greyscale-950 border-greyscale-700 pl-10 pr-10 focus-visible:ring-0 focus-visible:border-indigo-500/50 h-11 text-sm rounded-md transition-all placeholder:text-greyscale-600"
              />
              {searchInput && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-greyscale-500 hover:text-greyscale-200 transition-colors p-1"
                >
                  <MdOutlineClose size={16} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={async () => {
                  setIsRefreshing(true);
                  await refetch();
                  // Giữ trạng thái xoay ít nhất 800ms để người dùng cảm nhận được
                  setTimeout(() => setIsRefreshing(false), 800);
                }}
                disabled={isRefreshing || isRefetching}
                className={cn(
                  "h-11 w-11 rounded-md border border-greyscale-700 bg-greyscale-950 text-greyscale-400 hover:text-white transition-all",
                  (isRefreshing || isRefetching) && "text-blue-400"
                )}
              >
                <RefreshCcw size={18} className={cn((isRefreshing || isRefetching) && "animate-spin")} />
              </Button>

              <Button
                className="h-11 gap-2 bg-primary px-6 text-white hover:bg-primary/90 font-bold text-sm shadow-lg shadow-primary/20 transition-all active:scale-95"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">{t("create")}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-greyscale-800 pb-2">
        <p className="text-sm text-greyscale-200">
          {t("summary.total", { count: filteredCompetitions.length })}
        </p>
      </div>

      {isLoading ? (
        <div className="flex min-h-72 items-center justify-center rounded-xl border border-greyscale-800 bg-greyscale-900/60">
          <Spinner className="h-6 w-6" />
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-greyscale-800 bg-greyscale-900/60 p-8">
          <EmptyState
            title={error.response?.data?.message || error.message || t("errors.loadCompetitions")}
          />
        </div>
      ) : filteredCompetitions.length === 0 ? (
        <div className="rounded-xl border border-greyscale-800 bg-greyscale-900/60 p-8">
          <EmptyState
            title={t("empty.title")}
            description={t("empty.description")}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 2xl:grid-cols-3">
          {filteredCompetitions.map((competition) => (
            <ManagerCompetitionCard
              key={competition.competitionID}
              competition={competition}
            />
          ))}
        </div>
      )}

      {clubId && (
        <CreateCompetitionDialog
          clubId={clubId}
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
        />
      )}
    </div>
  );
}

