"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { MdHistory } from "react-icons/md";

export type TabType = "wallet" | "history";

interface WalletSidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export function WalletSidebar({ activeTab, setActiveTab }: WalletSidebarProps) {
  const tabs = [
    {
      id: "wallet" as const,
      label: "Thông tin ví",
      icon: <IoIosInformationCircleOutline size={20} />,
    },
    {
      id: "history" as const,
      label: "Lịch sử rút tiền",
      icon: <MdHistory size={20} />,
    },
  ];

  return (
    <div className="flex h-fit flex-col gap-2 rounded border border-greyscale-700 bg-greyscale-900 p-3 shadow-xl backdrop-blur-md">
      <div className="mb-2 px-3 py-2">
        <h3 className="text-base text-greyscale-0">
          Quản lý ví
        </h3>
      </div>
      <div className="flex flex-col gap-1.5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "group flex items-center gap-3 rounded px-3 py-2.5 text-sm font-medium transition-all duration-300",
                isActive
                  ? "bg-primary/10 text-primary-400 border border-primary/20 shadow-[0_0_15px_rgba(var(--primary-rgb),0.05)]"
                  : "text-greyscale-100 hover:bg-white/5 hover:text-greyscale-0 border border-transparent"
              )}
            >
              <span className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg border transition-all duration-300",
                isActive 
                  ? "bg-primary/20 border-primary/30 text-primary-300" 
                  : "bg-white/5 border-white/10 text-greyscale-200 group-hover:border-white/20 group-hover:text-greyscale-0"
              )}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
