"use client";

import React from "react";

import { Spinner } from "@/components/ui/spinner";
import { useGetMyClubs } from "@/hooks/club/useClub";
import ClubCard from "@/components/club/ClubCard";
import { Empty } from "@/components/ui/empty";
import EmptyState from "@/components/common/EmptyState";
import { useTranslations } from "@/providers/i18n-provider";

export default function MyClub() {
  const t = useTranslations("ClubDashboard");

  const { data: clubs = [], isLoading, isError, error } = useGetMyClubs({});

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
          {error.response?.data?.message || error.message}
        </p>
      </Empty>
    );
  }

  return (
    <div>
      {clubs.length === 0 ? (
        <EmptyState title={t("empty.title")} />
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
