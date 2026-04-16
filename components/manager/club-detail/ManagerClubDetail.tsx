"use client";

import { FadeIn } from "@/components/animation/FadeIn";
import ManagerClubInfo from "@/components/manager/club-detail/ManagerClubInfo";
import { useGetMyClubs } from "@/hooks/club/useClub";
import { useParams } from "next/navigation";
import React from "react";

const UUID_SUFFIX_REGEX =
  /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function ManagerClubDetail() {
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
 
   return (
     <div className="space-y-6 px-6 pb-6">
       <FadeIn from="bottom" duration={0.8} delay={0.2}>
         <ManagerClubInfo clubId={clubId} />
       </FadeIn>
     </div>
   );
 }
