"use client";

import React from "react";

import RegisterClubDialog from "@/components/club/RegisterClubDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MyClub from "@/components/manager/dashboard/MyClub";
import MyRequest from "@/components/manager/dashboard/MyRequest";
import { useTranslations } from "@/providers/i18n-provider";

export default function ManagerDashboard() {
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
            <RegisterClubDialog />
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