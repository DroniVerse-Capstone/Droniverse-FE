"use client";

import React from "react";
import { HiOutlineCurrencyDollar } from "react-icons/hi";
import { PiTrendUpBold } from "react-icons/pi";
import { TbReceipt2 } from "react-icons/tb";

import type { AdminRevenueOverview } from "@/validations/dashboard/dashboard";

type SystemAdminKpiSectionProps = {
  overview?: AdminRevenueOverview;
  formatVND: (value: number) => string;
};

export default function SystemAdminKpiSection({
  overview,
  formatVND,
}: SystemAdminKpiSectionProps) {
  const revenueGrowthRate = overview?.revenueGrowthRate ?? 0;
  const profitGrowthRate = overview?.profitGrowthRate ?? 0;

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div className="rounded border border-primary/40 bg-primary/8 p-4">
        <div className="flex items-center gap-2 text-primary">
          <HiOutlineCurrencyDollar size={18} />
          <p className="text-sm font-semibold">Tổng doanh thu</p>
        </div>
        <p className="mt-2 text-2xl font-semibold text-greyscale-0">
          {formatVND(overview?.totalRevenue ?? 0)}
        </p>
        <p className="mt-1 text-xs text-greyscale-50">
          Tháng này: {formatVND(overview?.revenueThisMonth ?? 0)}
        </p>
      </div>

      <div className="rounded border border-secondary/40 bg-secondary/8 p-4">
        <div className="flex items-center gap-2 text-secondary">
          <PiTrendUpBold size={18} />
          <p className="text-sm font-semibold">Tăng trưởng doanh thu</p>
        </div>
        <p className="mt-2 text-2xl font-semibold text-greyscale-0">
          {revenueGrowthRate.toFixed(1)}%
        </p>
        <p className="mt-1 text-xs text-greyscale-50">
          Tháng trước: {formatVND(overview?.revenueLastMonth ?? 0)}
        </p>
      </div>

      <div className="rounded border border-tertiary/40 bg-tertiary/8 p-4">
        <div className="flex items-center gap-2 text-tertiary">
          <HiOutlineCurrencyDollar size={18} />
          <p className="text-sm font-semibold">Lợi nhuận ròng</p>
        </div>
        <p className="mt-2 text-2xl font-semibold text-greyscale-0">
          {formatVND(overview?.netProfit ?? 0)}
        </p>
        <p className="mt-1 text-xs text-greyscale-50">
          Tăng trưởng: {profitGrowthRate.toFixed(1)}%
        </p>
      </div>

      <div className="rounded border border-warning/40 bg-warning/8 p-4">
        <div className="flex items-center gap-2 text-warning">
          <TbReceipt2 size={18} />
          <p className="text-sm font-semibold">Tổng giao dịch</p>
        </div>
        <p className="mt-2 text-2xl font-semibold text-greyscale-0">
          {overview?.totalTransactions ?? 0}
        </p>
        <p className="mt-1 text-xs text-greyscale-50">
          Tháng này: {overview?.transactionsThisMonth ?? 0}
        </p>
      </div>
    </section>
  );
}
