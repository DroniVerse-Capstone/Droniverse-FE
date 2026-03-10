"use client";
import RegisterClubDialog from "@/components/manager/dashboard/RegisterClubDialog";
import React from "react";

export default function ManagerDashboard() {
  return (
    <div className="px-6">
      <div className="py-4 flex items-center justify-end">
        <RegisterClubDialog />
      </div>
    </div>
  );
}
