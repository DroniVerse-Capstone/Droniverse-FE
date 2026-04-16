"use client";

import Image from "next/image";
import { IoHelpCircleOutline, IoPeople, IoStar } from "react-icons/io5";

import EmptyState from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useGetClubDetailById } from "@/hooks/club/useClub";
import { useLocale, useTranslations } from "@/providers/i18n-provider";
import StatCard from "@/components/common/StatCard";
import { BiSolidBookAlt } from "react-icons/bi";
import { FaEdit } from "react-icons/fa";
import { IoIosSettings } from "react-icons/io";

type ManagerClubInfoProps = {
  clubId?: string;
};
export default function ManagerClubInfo({ clubId }: ManagerClubInfoProps) {
  const t = useTranslations("ClubDetail.ClubInfo");
   const locale = useLocale();
   const {
     data: club,
     isLoading,
     isError,
     error,
   } = useGetClubDetailById(clubId);
 
   if (isLoading) {
     return (
       <div className="flex min-h-[40vh] items-center justify-center">
         <Spinner className="h-6 w-6" />
       </div>
     );
   }
 
   if (!clubId) {
     return (
       <EmptyState
         title={t("empty.title")}
         description={t("empty.description")}
       />
     );
   }
 
   if (isError || !club) {
     return (
       <EmptyState
         title={t("error")}
         description={error?.response?.data?.message || error?.message}
       />
     );
   }
 
   const clubName = locale === "en" ? club.nameEN || club.nameVN : club.nameVN;
 
   let managerName = "Chưa cập nhật";
   if (club.creator && typeof club.creator === "object") {
     const creator = club.creator as Record<string, unknown>;
     const candidate = creator.fullName || creator.name || creator.username;
     if (typeof candidate === "string" && candidate.trim()) {
       managerName = candidate;
     }
   }
 
   return (
     <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
       <div className="flex min-w-0 flex-1 items-start gap-4">
         <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded">
           <Image
             src={club.imageUrl || "/images/club-placeholder.jpg"}
             alt={clubName}
             fill
             className="object-cover"
             sizes="128px"
             priority
           />
         </div>
 
         <div className="min-w-0 space-y-6">
           <div className="space-y-1">
             <h1 className="truncate text-2xl font-semibold text-greyscale-0">
               {clubName}
             </h1>
             <p className="text-base font-semibold text-greyscale-50">
               {club.clubCode}
             </p>
           </div>
 
           <Button variant={"secondary"} icon={<IoIosSettings size={20} />}>{t("edit")}</Button>
         </div>
       </div>
 
       <div className="grid w-full gap-3 md:grid-cols-3 xl:w-auto xl:min-w-190">
         <StatCard
           icon={<IoStar size={24} />}
           title={t("manager")}
           value={managerName}
           variant="primary"
           extra={<IoHelpCircleOutline size={18} className="text-primary" />}
         />
 
         <StatCard
           icon={<IoPeople size={24} />}
           title={t("members")}
           value={club.totalMembers}
           variant="secondary"
         />
 
         <StatCard
           icon={<BiSolidBookAlt size={24} />}
           title={t("courses")}
           value={club.totalCourses}
           variant="tertiary"
         />
       </div>
     </div>
   );
 }
 
