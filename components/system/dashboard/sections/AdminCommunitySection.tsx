"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Wallet,
  ShoppingBag,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Calendar,
  ExternalLink,
  X
} from "lucide-react";
import {
  useGetAdminDetailClubManagers,
  useGetAdminDetailUsers,
  useGetAdminDetailUserOrders,
  useGetAdminDetailUserTransactions
} from "@/hooks/dashboard/useDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "@/providers/i18n-provider";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

const formatVND = (v: number, locale: string) => {
  const formatted = new Intl.NumberFormat(locale === "en" ? "en-US" : "vi-VN", {
    maximumFractionDigits: 0,
  }).format(v);
  return locale === "en" ? `${formatted} VND` : `${formatted} ₫`;
};

export default function AdminCommunitySection() {
  const t = useTranslations("SystemDashboard.community");
  const locale = useLocale();
  const [subTab, setSubTab] = useState<"clubManagers" | "users">("clubManagers");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Modal State
  const [selectedUser, setSelectedUser] = useState<{ id: string, name: string } | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

  const { data: clubManagersData, isLoading: isClubManagersLoading } = useGetAdminDetailClubManagers({
    pageIndex: page,
    pageSize,
  });

  const { data: usersData, isLoading: isUsersLoading } = useGetAdminDetailUsers({
    pageIndex: page,
    pageSize,
  });

  const { data: userOrders, isLoading: isOrdersLoading } = useGetAdminDetailUserOrders(selectedUser?.id);
  const { data: userTransactions, isLoading: isTransactionsLoading } = useGetAdminDetailUserTransactions(selectedUser?.id);

  const isLoading = subTab === "clubManagers" ? isClubManagersLoading : isUsersLoading;
  const currentData = subTab === "clubManagers" ? clubManagersData : usersData;

  const handlePageChange = (p: number) => {
    setPage(p);
  };

  const openOrderModal = (id: string, name: string) => {
    setSelectedUser({ id, name });
    setIsOrderModalOpen(true);
  };

  const openTransactionModal = (id: string, name: string) => {
    setSelectedUser({ id, name });
    setIsTransactionModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* HEADER & TOGGLE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">{t("title")}</h2>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-[11px] text-[#6a7080]">{t("subtitle")}</p>
            {currentData && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-tight">
                  {locale === "en"
                    ? `Total: ${currentData.totalRecords} ${subTab === "clubManagers" ? "managers" : "members"}`
                    : `Hiện có ${currentData.totalRecords} ${subTab === "clubManagers" ? "quản lý CLB" : "học viên"}`
                  }
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-[#1e2130] border border-white/[0.07] rounded-xl p-1">
            <button
              onClick={() => { setSubTab("clubManagers"); setPage(1); }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-[11px] font-bold rounded-lg transition-all",
                subTab === "clubManagers" ? "bg-blue-500 text-white shadow-lg" : "text-[#6a7080] hover:text-[#a0a8b8]"
              )}
            >
              <UserCheck size={14} />
              <span>{t("clubManagers")}</span>
            </button>
            <button
              onClick={() => { setSubTab("users"); setPage(1); }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-[11px] font-bold rounded-lg transition-all",
                subTab === "users" ? "bg-purple-500 text-white shadow-lg" : "text-[#6a7080] hover:text-[#a0a8b8]"
              )}
            >
              <Users size={14} />
              <span>{t("users")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence mode="wait">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-[#181b22] border border-white/[0.07] rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-xl bg-white/[0.06]" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24 bg-white/[0.06]" />
                    <Skeleton className="h-3 w-32 bg-white/[0.06]" />
                  </div>
                </div>
                <Skeleton className="h-12 w-full rounded-xl bg-white/[0.06]" />
              </div>
            ))
          ) : (
            currentData?.data.map((item: any, idx: number) => (
              <motion.div
                key={item.userId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="group bg-[#181b22] border border-white/[0.07] hover:border-white/[0.15] hover:bg-[#1c2029] rounded-2xl p-5 transition-all duration-300 relative overflow-hidden"
              >
                {/* BG GLOW */}
                <div className={cn(
                  "absolute -top-12 -right-12 w-24 h-24 blur-[60px] opacity-0 group-hover:opacity-20 transition-opacity duration-500",
                  subTab === "clubManagers" ? "bg-blue-500" : "bg-purple-500"
                )} />

                <div className="flex items-center gap-4 mb-5 relative z-10">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#242835] border border-white/[0.05]">
                      {item.avatarUrl ? (
                        <Image
                          src={item.avatarUrl}
                          alt={item.fullName}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20">
                          <Users size={20} />
                        </div>
                      )}
                    </div>
                    <div className={cn(
                      "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#181b22] flex items-center justify-center",
                      subTab === "clubManagers" ? "bg-blue-500" : "bg-purple-500"
                    )}>
                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-[13px] font-bold text-white truncate group-hover:text-white transition-colors">
                      {item.fullName}
                    </h4>
                    <p className="text-[11px] text-[#5a6070] truncate">{item.email}</p>
                  </div>
                </div>

                <div className="bg-[#111318]/50 rounded-xl p-3 border border-white/[0.03] mb-4 group-hover:bg-[#111318]/80 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "p-1.5 rounded-lg",
                        subTab === "clubManagers" ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400"
                      )}>
                        {subTab === "clubManagers" ? <Wallet size={12} /> : <ShoppingBag size={12} />}
                      </div>
                      <span className="text-[10px] text-[#5a6070] font-medium uppercase tracking-wider">
                        {subTab === "clubManagers" ? t("walletBalance") : t("totalSpent")}
                      </span>
                    </div>
                    <span className="text-[13px] font-bold text-white">
                      {formatVND(subTab === "clubManagers" ? (item as any).walletBalance : (item as any).totalSpent, locale)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {subTab === "users" && (
                    <button
                      onClick={() => openOrderModal(item.userId, item.fullName)}
                      className="flex-1 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] hover:border-white/[0.15] text-[11px] font-bold text-white py-2.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 group/btn"
                    >
                      <ShoppingBag size={14} className="text-purple-400" />
                      {t("viewOrders")}
                    </button>
                  )}
                  {subTab === "clubManagers" && (
                    <button
                      onClick={() => openTransactionModal(item.userId, item.fullName)}
                      className="flex-1 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] hover:border-white/[0.15] text-[11px] font-bold text-white py-2.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 group/btn"
                    >
                      <Wallet size={14} className="text-blue-400" />
                      {t("viewTransactions")}
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* PAGINATION */}
      {currentData && currentData.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="w-10 h-10 rounded-xl bg-[#1e2130] border border-white/[0.07] flex items-center justify-center text-[#6a7080] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex items-center gap-1.5 bg-[#1e2130] border border-white/[0.07] px-3 py-1.5 rounded-xl">
            {Array.from({ length: currentData.totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i + 1)}
                className={cn(
                  "w-7 h-7 text-[11px] font-bold rounded-lg transition-all",
                  page === i + 1
                    ? (subTab === "clubManagers" ? "bg-blue-500 text-white" : "bg-purple-500 text-white")
                    : "text-[#5a6070] hover:text-[#a0a8b8]"
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === currentData.totalPages}
            className="w-10 h-10 rounded-xl bg-[#1e2130] border border-white/[0.07] flex items-center justify-center text-[#6a7080] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {!isLoading && currentData?.data.length === 0 && (
        <div className="bg-[#181b22] border border-dashed border-white/[0.07] rounded-3xl py-20 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.02] flex items-center justify-center mb-4">
            <Users size={32} className="text-[#3a4050]" />
          </div>
          <h3 className="text-white font-bold text-base">{t("noData")}</h3>
          <p className="text-[11px] text-[#5a6070] mt-1">Hệ thống chưa ghi nhận thông tin nào.</p>
        </div>
      )}

      {/* ORDER MODAL */}
      <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
        <DialogContent className="max-w-4xl bg-[#111318] border border-white/[0.07] text-white p-0 overflow-hidden outline-none">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                <ShoppingBag size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold">{t("orderDetail.title")}</h3>
                  {userOrders && userOrders.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold text-purple-400">
                      {userOrders.length} {locale === "en" ? "orders" : "đơn hàng"}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#6a7080] font-normal">{selectedUser?.name}</p>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="p-6">
            <div className="bg-[#181b22] border border-white/[0.07] rounded-2xl overflow-hidden flex flex-col max-h-[60vh]">
              <div className="overflow-y-auto custom-scrollbar">
                <Table>
                  <TableHeader className="bg-white/[0.02] sticky top-0 z-10">
                    <TableRow className="hover:bg-transparent border-white/[0.07]">
                      <TableHead className="text-[11px] font-bold text-[#6a7080] uppercase h-11 bg-[#181b22]">{t("orderDetail.course")}</TableHead>
                      <TableHead className="text-[11px] font-bold text-[#6a7080] uppercase h-11 bg-[#181b22]">{t("orderDetail.club")}</TableHead>
                      <TableHead className="text-[11px] font-bold text-[#6a7080] uppercase h-11 bg-[#181b22]">{t("orderDetail.time")}</TableHead>
                      <TableHead className="text-[11px] font-bold text-[#6a7080] uppercase h-11 bg-[#181b22]">{t("orderDetail.amount")}</TableHead>
                      <TableHead className="text-[11px] font-bold text-[#6a7080] uppercase h-11 text-right bg-[#181b22]">{t("orderDetail.status")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isOrdersLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i} className="border-white/[0.07]">
                          <TableCell colSpan={5} className="p-4"><Skeleton className="h-10 w-full bg-white/[0.05]" /></TableCell>
                        </TableRow>
                      ))
                    ) : userOrders && userOrders.length > 0 ? (
                      userOrders.map((order, idx) => (
                        <TableRow key={idx} className="hover:bg-white/[0.02] border-white/[0.07] transition-colors group">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-[#242835] border border-white/[0.05]">
                                {order.courseVersion.imageUrl && (
                                  <Image src={order.courseVersion.imageUrl} alt="course" width={40} height={40} className="object-cover w-full h-full" />
                                )}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[12px] font-bold text-white line-clamp-1">
                                  {locale === "en" ? order.courseVersion.titleEN : order.courseVersion.titleVN}
                                </span>
                                <span className="text-[10px] text-[#5a6070]">v{order.courseVersion.version}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-md overflow-hidden flex-shrink-0 bg-[#242835]">
                                {order.club.imageUrl && (
                                  <Image src={order.club.imageUrl} alt="club" width={24} height={24} className="object-cover w-full h-full" />
                                )}
                              </div>
                              <span className="text-[11px] text-[#a0a8b8]">
                                {locale === "en" ? order.club.nameEN : order.club.nameVN}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-[11px] text-white font-medium">{format(new Date(order.time), "dd/MM/yyyy")}</span>
                              <span className="text-[9px] text-[#5a6070]">{format(new Date(order.time), "HH:mm")}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-[12px] font-bold text-white">{formatVND(order.amount, locale)}</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={cn(
                              "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-tight",
                              order.status === "SUCCESS" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                            )}>
                              {order.status === "SUCCESS" ? t("orderDetail.statusValue.success") : t("orderDetail.statusValue.pending")}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-32 text-center text-[#5a6070] text-[11px]">{t("noData")}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* TRANSACTION MODAL */}
      <Dialog open={isTransactionModalOpen} onOpenChange={setIsTransactionModalOpen}>
        <DialogContent className="max-w-4xl bg-[#111318] border border-white/[0.07] text-white p-0 overflow-hidden outline-none">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                <Wallet size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold">{t("transactionDetail.title")}</h3>
                  {userTransactions && userTransactions.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400">
                      {userTransactions.length} {locale === "en" ? "transactions" : "giao dịch"}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#6a7080] font-normal">{selectedUser?.name}</p>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="p-6">
            <div className="bg-[#181b22] border border-white/[0.07] rounded-2xl overflow-hidden flex flex-col max-h-[60vh]">
              <div className="overflow-y-auto custom-scrollbar">
                <Table>
                  <TableHeader className="bg-white/[0.02] sticky top-0 z-10">
                    <TableRow className="hover:bg-transparent border-white/[0.07]">
                      <TableHead className="text-[11px] font-bold text-[#6a7080] uppercase h-11 bg-[#181b22]">{t("transactionDetail.type")}</TableHead>
                      <TableHead className="text-[11px] font-bold text-[#6a7080] uppercase h-11 bg-[#181b22]">{t("transactionDetail.content")}</TableHead>
                      <TableHead className="text-[11px] font-bold text-[#6a7080] uppercase h-11 bg-[#181b22]">{t("transactionDetail.date")}</TableHead>
                      <TableHead className="text-[11px] font-bold text-[#6a7080] uppercase h-11 bg-[#181b22] text-right">{t("transactionDetail.amount")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isTransactionsLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i} className="border-white/[0.07]">
                          <TableCell colSpan={4} className="p-4"><Skeleton className="h-10 w-full bg-white/[0.05]" /></TableCell>
                        </TableRow>
                      ))
                    ) : userTransactions && userTransactions.length > 0 ? (
                      userTransactions.map((tx, idx) => (
                        <TableRow key={idx} className="hover:bg-white/[0.02] border-white/[0.07] transition-colors group">
                          <TableCell>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/[0.05] text-[#a0a8b8]">
                              {t(`transactionDetail.typeValue.${tx.type}`)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-[12px] font-medium text-white">
                                {tx.order?.item
                                  ? (locale === "en" ? tx.order.item.productNameEN : tx.order.item.productNameVN)
                                  : tx.withdrawRequest?.note || "—"
                                }
                              </span>
                              {tx.club && (
                                <span className="text-[10px] text-[#5a6070]">
                                  {locale === "en" ? tx.club.nameEN : tx.club.nameVN}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-[11px] text-white">{format(new Date(tx.createdAt), "dd/MM/yyyy")}</span>
                              <span className="text-[9px] text-[#5a6070]">{format(new Date(tx.createdAt), "HH:mm")}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {(() => {
                              const isNegative = ["WITHDRAWAL", "WITHDRAW", "PURCHASE"].includes(tx.type);
                              return (
                                <span className={cn(
                                  "text-[13px] font-bold",
                                  isNegative ? "text-rose-400" : "text-emerald-400"
                                )}>
                                  {isNegative ? "-" : "+"}{formatVND(Math.abs(tx.amount), locale)}
                                </span>
                              );
                            })()}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="h-32 text-center text-[#5a6070] text-[11px]">{t("noData")}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
