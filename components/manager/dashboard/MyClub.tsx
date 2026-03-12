"use client";

import React, { useState } from "react";

import { Spinner } from "@/components/ui/spinner";
import { useGetMyClubs } from "@/hooks/club/useClub";
import ClubCard from "@/components/common/ClubCard";
import { Empty } from "@/components/ui/empty";
import EmptyState from "@/components/common/EmptyState";
import { CLUB_STATUS } from "@/lib/constants/club";
import { useTranslations } from "@/providers/i18n-provider";

type ClubStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "ARCHIVED" | null;

export default function MyClub() {
  const t = useTranslations("ClubDashboard");
  const [selectedStatus, setSelectedStatus] = useState<ClubStatus>(null);

  const {
    data: clubs = [],
    isLoading,
    isError,
    error,
  } = useGetMyClubs({
    status: selectedStatus || undefined,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <Spinner className="h-5 w-5" />
      </div>
    );
  }

  if (isError) {
    return (
      <Empty>
        <p className="text-sm text-muted-foreground">
          {error.response?.data?.message ||
            error.message}
        </p>
      </Empty>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center gap-2">
        <div className="flex flex-wrap gap-2">
          {CLUB_STATUS.map((status) => (
            <button
              key={status.value}
              onClick={() =>
                setSelectedStatus(
                  selectedStatus === status.value
                    ? null
                    : (status.value as ClubStatus),
                )
              }
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                selectedStatus === status.value
                  ? "bg-primary text-greyscale-0"
                  : "bg-greyscale-700 text-greyscale-100 hover:bg-greyscale-600"
              }`}
            >
              {t(status.label)}
            </button>
          ))}
        </div>
      </div>

      {clubs.length === 0 ? (
        <EmptyState
          title={t("empty.title")}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {clubs.map((club) => (
            <ClubCard key={club.clubID} club={club} />
          ))}
        </div>
      )}
    </div>
  );
}
