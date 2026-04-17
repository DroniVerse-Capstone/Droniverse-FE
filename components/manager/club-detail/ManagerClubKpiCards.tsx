import React from "react";
import { BiLineChart } from "react-icons/bi";
import { HiOutlineCurrencyDollar } from "react-icons/hi";
import { PiTrendUpBold } from "react-icons/pi";
import { TbReceipt2 } from "react-icons/tb";

import type { ClubRevenueOverview } from "@/validations/dashboard/dashboard";

type ManagerClubKpiCardsProps = {
  overview?: ClubRevenueOverview;
};

export default function ManagerClubKpiCards({ overview }: ManagerClubKpiCardsProps) {
  const formatVND = React.useCallback((value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);
  }, []);

  const currentMonthExpense = overview?.expenseThisMonth ?? 0;
  const previousMonthExpense = overview?.expenseLastMonth ?? 0;
  const expenseMoMPercent =
    previousMonthExpense === 0
      ? currentMonthExpense === 0
        ? 0
        : 100
      : ((currentMonthExpense - previousMonthExpense) / previousMonthExpense) *
        100;
  const isExpenseIncrease = currentMonthExpense > previousMonthExpense;
  const isExpenseDecrease = currentMonthExpense < previousMonthExpense;

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div className="rounded border border-primary/40 bg-primary/8 p-4">
        <div className="flex items-center gap-2 text-primary">
          <HiOutlineCurrencyDollar size={18} />
          <p className="text-sm font-semibold">Tổng chi phí</p>
        </div>
        <p className="mt-2 text-2xl font-semibold text-greyscale-0">
          {formatVND(overview?.totalExpense ?? 0)}
        </p>
      </div>

      <div className="rounded border border-tertiary/40 bg-tertiary/8 p-4">
        <div className="flex items-center gap-2 text-tertiary">
          <TbReceipt2 size={18} />
          <p className="text-sm font-semibold">Tổng giao dịch</p>
        </div>
        <p className="mt-2 text-2xl font-semibold text-greyscale-0">
          {overview?.totalTransactions ?? 0}
        </p>
      </div>

      <div className="rounded border border-secondary/40 bg-secondary/8 p-4">
        <div className="flex justify-between gap-2 items-center">
          <div className="flex items-center gap-2 text-secondary">
            <PiTrendUpBold size={18} />
            <p className="text-sm font-semibold">Chi phí tháng này</p>
          </div>

          <span
            className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${
              isExpenseIncrease
                ? "bg-warning/20 text-warning"
                : isExpenseDecrease
                  ? "bg-primary/20 text-primary"
                  : "bg-greyscale-700/70 text-greyscale-200"
            }`}
          >
            {isExpenseIncrease
              ? `+${Math.abs(expenseMoMPercent).toFixed(1)}% vs tháng trước`
              : isExpenseDecrease
                ? `-${Math.abs(expenseMoMPercent).toFixed(1)}% vs tháng trước`
                : "0% vs tháng trước"}
          </span>
        </div>
        <p className="mt-2 text-2xl font-semibold text-greyscale-0">
          {formatVND(overview?.expenseThisMonth ?? 0)}
        </p>
      </div>

      <div className="rounded border border-warning/40 bg-warning/8 p-4">
        <div className="flex items-center gap-2 text-warning">
          <BiLineChart size={18} />
          <p className="text-sm font-semibold">Tổng giao dịch tháng này</p>
        </div>
        <p className="mt-2 text-2xl font-semibold text-greyscale-0">
          {overview?.transactionsThisMonth ?? 0}
        </p>
      </div>
    </section>
  );
}
