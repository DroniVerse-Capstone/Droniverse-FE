"use client";

import React, { useCallback } from "react";
import { AdminOrderStatistics } from "@/validations/dashboard/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  ShoppingBag, Clock, CheckCircle2, XCircle, AlertCircle,
  ChevronLeft, ChevronRight, X, ChevronDown
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AdminOrderStatisticsParams } from "@/hooks/dashboard/useDashboard";
import { useLocale, useTranslations } from "@/providers/i18n-provider";

interface Props {
  data?: AdminOrderStatistics;
  isLoading: boolean;
  currentPage: number;
  onPageChange: (page: number) => void;
  filters: AdminOrderStatisticsParams;
  onFilterChange: (filters: AdminOrderStatisticsParams) => void;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING:   "text-amber-400 bg-amber-500/10 border-amber-500/20",
  SUCCESS:   "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  FAILED:    "text-rose-400 bg-rose-500/10 border-rose-500/20",
  CANCELLED: "text-gray-400 bg-gray-500/10 border-gray-500/20",
};

const STATUS_ICONS: Record<string, any> = {
  PENDING:   Clock,
  SUCCESS:   CheckCircle2,
  FAILED:    XCircle,
  CANCELLED: AlertCircle,
};

function StatusBadge({ status }: { status: string }) {
  const t = useTranslations("SystemDashboard.orders.status");
  const color = STATUS_COLORS[status] || "text-gray-400 bg-gray-500/10 border-gray-500/20";
  const Icon = STATUS_ICONS[status] || AlertCircle;
  const labelMap: Record<string, string> = {
    PENDING:   t("pending"),
    SUCCESS:   t("success"),
    FAILED:    t("failed"),
    CANCELLED: t("cancelled"),
  };
  return (
    <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold tracking-tight", color)}>
      <Icon size={12} />
      <span>{labelMap[status] || status}</span>
    </div>
  );
}

function FilterSelect({ label, value, options, onChange }: {
  label: string; value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] text-[#6a7080] font-semibold uppercase tracking-wider">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="appearance-none bg-[#1e2130] border border-white/[0.07] rounded-xl px-3 pr-8 py-2 text-[11px] text-white outline-none focus:border-blue-500/50 transition-all w-full cursor-pointer"
        >
          {options.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6a7080] pointer-events-none" size={13} />
      </div>
    </div>
  );
}

export default function AdminOrderStatisticsSection({
  data, isLoading, currentPage, onPageChange, filters, onFilterChange
}: Props) {
  const t = useTranslations("SystemDashboard.orders");
  const locale = useLocale();
  const dateLocale = locale === "en" ? "en-US" : "vi-VN";

  const STATUS_OPTIONS = [
    { value: "", label: t("status.all") },
    { value: "PENDING",   label: t("status.pending")   },
    { value: "SUCCESS",   label: t("status.success")   },
    { value: "FAILED",    label: t("status.failed")    },
    { value: "CANCELLED", label: t("status.cancelled") },
  ];

  const formatVND = (amount: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

  const hasActiveFilters = !!(filters.status || filters.createAt);

  const clearFilters = useCallback(() => {
    onFilterChange({ currentPage: 1, pageSize: filters.pageSize || 10 });
    onPageChange(1);
  }, [onFilterChange, onPageChange, filters.pageSize]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full bg-white/[0.03] rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[400px] w-full bg-white/[0.03] rounded-xl" />
      </div>
    );
  }

  const ov = data?.overview;
  const orders = data?.orders.data || [];
  const pagination = data?.orders;

  return (
    <div className="space-y-6">
      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: t("kpi.total"),     value: ov?.totalOrders    || 0, icon: ShoppingBag,  color: "text-white",       bg: "bg-[#1e2130]"      },
          { label: t("kpi.pending"),   value: ov?.pendingOrders  || 0, icon: Clock,         color: "text-amber-400",   bg: "bg-amber-500/10"   },
          { label: t("kpi.success"),   value: ov?.successOrders  || 0, icon: CheckCircle2,  color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: t("kpi.failed"),    value: ov?.failedOrders   || 0, icon: XCircle,       color: "text-rose-400",    bg: "bg-rose-500/10"    },
          { label: t("kpi.cancelled"), value: ov?.cancelledOrders|| 0, icon: AlertCircle,   color: "text-[#6a7080]",  bg: "bg-gray-500/10"    },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={cn("rounded-xl p-4 border border-white/[0.05]", item.bg)}
          >
            <div className="flex items-center gap-2.5 mb-2">
              <div className={cn("p-1.5 rounded-lg bg-white/5", item.color)}>
                <item.icon size={13} />
              </div>
              <span className="text-[10px] text-[#6a7080] font-bold uppercase tracking-wider">{item.label}</span>
            </div>
            <p className={cn("text-2xl font-bold", item.color)}>{item.value.toLocaleString(dateLocale)}</p>
          </motion.div>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-[#181b22] rounded-2xl border border-white/[0.07] overflow-hidden">

        {/* Table Header */}
        <div className="p-5 border-b border-white/[0.07]">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h3 className="text-[13px] font-bold text-white">{t("table.title")}</h3>
              <p className="text-[11px] text-[#6a7080] mt-0.5">
                {t("table.subtitle", { count: pagination?.totalRecords || 0 })}
                {hasActiveFilters && <span className="ml-2 text-blue-400 font-semibold">· {t("table.filtering")}</span>}
              </p>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-bold hover:bg-rose-500/20 transition-all"
              >
                <X size={13} />
                <span>{t("table.clearFilter")}</span>
              </button>
            )}
          </div>

          {/* Filter Panel - always visible */}
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/[0.05]">
            <FilterSelect
              label={t("table.statusLabel")}
              value={filters.status || ""}
              options={STATUS_OPTIONS}
              onChange={v => { onFilterChange({ ...filters, status: v || undefined, currentPage: 1 }); onPageChange(1); }}
            />
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-[#6a7080] font-semibold uppercase tracking-wider">{t("table.perPage")}</span>
              <div className="relative">
                <select
                  value={filters.pageSize || 10}
                  onChange={e => { onFilterChange({ ...filters, pageSize: Number(e.target.value), currentPage: 1 }); onPageChange(1); }}
                  className="appearance-none bg-[#1e2130] border border-white/[0.07] rounded-xl px-3 pr-8 py-2 text-[11px] text-white outline-none focus:border-blue-500/50 transition-all w-full cursor-pointer"
                >
                  {[5, 10, 20].map(n => <option key={n} value={n}>{t("table.perPageOption", { n })}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6a7080] pointer-events-none" size={13} />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-[10px] text-[#6a7080] uppercase tracking-wider border-b border-white/[0.05] bg-white/[0.01]">
                <th className="text-left py-3.5 px-5 font-semibold">{t("table.order")}</th>
                <th className="text-left py-3.5 px-5 font-semibold">{t("table.user")}</th>
                <th className="text-left py-3.5 px-5 font-semibold">{t("table.product")}</th>
                <th className="text-right py-3.5 px-5 font-semibold">{t("table.amount")}</th>
                <th className="text-center py-3.5 px-5 font-semibold">{t("table.status")}</th>
                <th className="text-center py-3.5 px-5 font-semibold">{t("table.club")}</th>
                <th className="text-right py-3.5 px-5 font-semibold">{t("table.date")}</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <p className="text-[12px] text-[#5a6070]">{t("table.empty")}</p>
                    </td>
                  </tr>
                ) : orders.map((order, i) => (
                  <motion.tr
                    key={order.orderID}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group cursor-pointer"
                  >
                    <td className="py-4 px-5">
                      <span className="text-[11px] font-bold text-blue-400 group-hover:text-blue-300 transition-colors font-mono">
                        #{order.orderID.slice(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-8 w-8 border border-white/[0.07] flex-shrink-0">
                          <AvatarImage src={order.user.imageUrl || ""} />
                          <AvatarFallback className="bg-blue-500/10 text-blue-400 text-[10px] font-bold">
                            {order.user.firstName?.[0]}{order.user.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[11px] font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                            {order.user.firstName} {order.user.lastName}
                          </span>
                          <span className="text-[9px] text-[#6a7080] truncate max-w-[160px]">{order.user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className="text-[11px] font-medium text-white line-clamp-1 max-w-[200px]">
                        {locale === "en" ? order.item.productNameEN : order.item.productNameVN}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <span className="text-[11px] font-bold text-white">{formatVND(order.totalAmount)}</span>
                      <p className="text-[9px] text-[#6a7080] mt-0.5">{order.payment.paymentMethod}</p>
                    </td>
                    <td className="py-4 px-5 text-center">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-6 h-6 rounded-md border border-white/[0.07] overflow-hidden bg-white/5 flex-shrink-0">
                          {order.club.imageUrl && (
                            <img src={order.club.imageUrl} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <span className="text-[10px] font-medium text-[#8a9099] line-clamp-1 max-w-[90px]">
                          {locale === "en" ? order.club.nameEN : order.club.nameVN}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold text-white">
                          {new Date(order.createAt).toLocaleDateString(dateLocale, { day: "2-digit", month: "2-digit", year: "numeric" })}
                        </span>
                        <span className="text-[9px] text-[#6a7080] mt-0.5">
                          {new Date(order.createAt).toLocaleTimeString(dateLocale, { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-5 border-t border-white/[0.07] flex items-center justify-between flex-wrap gap-3">
          <p className="text-[11px] text-[#6a7080]">
            {t("table.page", { current: currentPage, total: pagination?.totalPages || 1, records: pagination?.totalRecords || 0 })}
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="p-2 rounded-xl bg-[#1e2130] border border-white/[0.07] text-[#6a7080] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-1">
              {[...Array(Math.min(pagination?.totalPages || 1, 7))].map((_, i) => (
                <button
                  key={i}
                  onClick={() => onPageChange(i + 1)}
                  className={cn(
                    "w-8 h-8 rounded-xl text-[11px] font-bold transition-all border",
                    currentPage === i + 1
                      ? "bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/20"
                      : "bg-[#1e2130] border-white/[0.07] text-[#6a7080] hover:border-white/[0.12] hover:text-[#a0a8b8]"
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              disabled={currentPage >= (pagination?.totalPages || 1)}
              onClick={() => onPageChange(currentPage + 1)}
              className="p-2 rounded-xl bg-[#1e2130] border border-white/[0.07] text-[#6a7080] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
