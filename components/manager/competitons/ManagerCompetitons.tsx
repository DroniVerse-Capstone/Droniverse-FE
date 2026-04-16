"use client";

import React from "react";
import { useParams } from "next/navigation";

import ManagerCompetitionCard from "@/components/competition/ManagerCompetitionCard";
import EmptyState from "@/components/common/EmptyState";
import { Empty } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { useGetCompetitionsByClub } from "@/hooks/competitions/useCompetitions";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/providers/i18n-provider";
import { CompetitionStatus } from "@/validations/competitions/competitions";
import { COMPETITION_STATUS } from "@/lib/constants/competition";
import { Button } from "@/components/ui/button";

const UUID_SUFFIX_REGEX =
  /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function ManagerCompetitons() {
  const t = useTranslations("ManagerCompetitions");
  const params = useParams<{ clubSlug?: string }>();
  const clubSlug = params?.clubSlug;
  const [selectedStatus, setSelectedStatus] =
    React.useState<CompetitionStatus | null>(null);

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
  } = useGetCompetitionsByClub(clubId, { status: selectedStatus });

  const sortedCompetitions = React.useMemo(
    () =>
      [...competitions].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [competitions],
  );

  if (!clubId) {
    return (
      <div className="px-6 pb-6">
        <Empty>
          <p className="text-sm text-muted-foreground">
            {t("errors.resolveClub")}
          </p>
        </Empty>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-60 items-center justify-center px-6 pb-6">
        <Spinner className="h-5 w-5" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="px-6 pb-6">
        <Empty>
          <p className="text-sm text-muted-foreground">
            {error.response?.data?.message ||
              error.message ||
              t("errors.loadCompetitions")}
          </p>
        </Empty>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-6 pb-6">
      <div className="space-y-3 rounded border border-greyscale-700 bg-linear-to-r from-greyscale-900 via-greyscale-850 to-greyscale-900 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-greyscale-100">
            {t("summary.total", { count: sortedCompetitions.length })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {COMPETITION_STATUS.map((statusOption) => (
            <Button
              key={statusOption.label}
              onClick={() =>
                setSelectedStatus(
                  statusOption.value as CompetitionStatus | null,
                )
              }
              className={cn(
                "rounded border px-2.5 py-1 text-sm transition-colors",
                selectedStatus === statusOption.value
                  ? "border-primary bg-primary/15 text-primary hover:bg-primary/25"
                  : "border-greyscale-600 bg-greyscale-800 text-greyscale-100 hover:border-greyscale-500 hover:bg-greyscale-700",
              )}
            >
              {t(`status.${statusOption.label}`)}
            </Button>
          ))}
        </div>
      </div>

      {sortedCompetitions.length === 0 ? (
        <div className="px-6 pb-6">
          <EmptyState
            title={t("empty.title")}
            description={t("empty.description")}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {sortedCompetitions.map((competition) => (
            <ManagerCompetitionCard
              key={competition.competitionID}
              competition={competition}
            />
          ))}
        </div>
      )}
    </div>
  );
}
