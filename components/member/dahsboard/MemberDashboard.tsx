"use client"
import React from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "@/providers/i18n-provider";
import JoinClubDialog from '@/components/member/dahsboard/JoinClubDialog';
import MyClub from '@/components/member/dahsboard/Myclub';
import MyRequest from '@/components/member/dahsboard/MyRequest';

export default function MemberDashboard() {
   const t = useTranslations("ClubDashboard");
  return (
    <div className="px-6 py-4">
      <Tabs defaultValue="my-clubs" className="w-full">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="my-clubs">{t("myClubs")}</TabsTrigger>
            <TabsTrigger value="registration-requests">
              {t("myRequests")}
            </TabsTrigger>
          </TabsList>
            <JoinClubDialog />
        </div>

        <TabsContent value="my-clubs" className="mt-4">
          <MyClub />
        </TabsContent>

        <TabsContent value="registration-requests" className="mt-4">
          <MyRequest />
        </TabsContent>
      </Tabs>
    </div>
  );
}
