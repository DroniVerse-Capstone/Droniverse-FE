"use client";

import React from "react";
import { useParams } from "next/navigation";

import EmptyState from "@/components/common/EmptyState";
import JoinRequestsTab from "@/components/manager/members/JoinRequestsTab";
import MembersListTab from "@/components/manager/members/MembersListTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetMyClubs } from "@/hooks/club/useClub";
import { useTranslations } from "@/providers/i18n-provider";

const UUID_SUFFIX_REGEX =
  /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function ManagerMembers() {
  const t = useTranslations("ManagerMembers");
  const params = useParams<{ clubSlug?: string }>();
  const clubSlug = params?.clubSlug;
  const { data: myClubs = [] } = useGetMyClubs();

  const clubId = React.useMemo(() => {
    if (!clubSlug) return undefined;

    const matchedClub = myClubs.find((club) =>
      clubSlug.endsWith(`-${club.clubID}`),
    );
    if (matchedClub) return matchedClub.clubID;

    const uuidMatch = clubSlug.match(UUID_SUFFIX_REGEX);
    if (uuidMatch) return uuidMatch[0];

    return undefined;
  }, [clubSlug, myClubs]);

  if (!clubId) {
    return (
      <div className="px-6 py-4">
        <EmptyState title={t("errors")} />
      </div>
    );
  }

  return (
    <div className="space-y-4 px-6 py-4">
      <Tabs defaultValue="members" className="w-full">
        <TabsList>
          <TabsTrigger value="members">{t("memberlist")}</TabsTrigger>
          <TabsTrigger value="join-requests">{t("requests")}</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-4">
          <MembersListTab clubId={clubId} />
        </TabsContent>

        <TabsContent value="join-requests" className="mt-4">
          <JoinRequestsTab clubId={clubId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
