"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  Search,
  ShieldCheck,
} from "lucide-react";

import EmptyState from "@/components/common/EmptyState";
import { LanguageSwitcher } from "@/components/layouts/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useGetSystemPolicies } from "@/hooks/sys-policy/useSysPolicy";
import { useLocale } from "@/providers/i18n-provider";
import type {
  SystemPolicy,
  SystemPolicyType,
} from "@/validations/sys-policy/sys-policy";

const PAGE_SIZE = 20;

const POLICY_TYPE_OPTIONS: Array<{
  labelVN: string;
  labelEN: string;
  value: SystemPolicyType | undefined;
}> = [
  { labelVN: "Tất cả", labelEN: "All", value: undefined },
  { labelVN: "Điều khoản", labelEN: "Terms", value: "TERMS" },
  { labelVN: "Quyền riêng tư", labelEN: "Privacy", value: "PRIVACY" },
  { labelVN: "Thanh toán", labelEN: "Payment", value: "PAYMENT" },
  { labelVN: "Hoàn tiền", labelEN: "Refund", value: "REFUND" },
  { labelVN: "An toàn drone", labelEN: "Drone safety", value: "DRONE_SAFETY" },
];

export default function Policies() {
  const router = useRouter();
  const locale = useLocale();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedType, setSelectedType] = React.useState<
    SystemPolicyType | undefined
  >(undefined);
  const [openId, setOpenId] = React.useState<string | null>(null);

  const { data, isLoading, isError, error } = useGetSystemPolicies({
    currentPage: 1,
    pageSize: PAGE_SIZE,
    type: selectedType,
  });

  const policies = data?.data ?? [];

  const filteredPolicies = React.useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return policies.filter((policy) => {
      const matchesType = !selectedType || policy.type === selectedType;
      if (!matchesType) return false;

      if (!keyword) return true;

      const haystack = [
        policy.titleVN,
        policy.titleEN,
        policy.contentVN,
        policy.contentEN,
        policy.type,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(keyword);
    });
  }, [policies, searchTerm, selectedType]);

  const getPolicyTypeLabel = (type: SystemPolicyType) => {
    const option = POLICY_TYPE_OPTIONS.find((item) => item.value === type);
    return locale === "vi"
      ? (option?.labelVN ?? type)
      : (option?.labelEN ?? type);
  };

  const renderPolicyCard = (policy: SystemPolicy) => {
    const title = locale === "vi" ? policy.titleVN : policy.titleEN;
    const isOpen = openId === policy.sysPolicyID;

    return (
      <article
        key={policy.sysPolicyID}
        className="overflow-hidden rounded border border-greyscale-700 bg-greyscale-900/80 shadow-sm"
      >
        {/* HEADER (click để expand) */}
        <div
          onClick={() => setOpenId(isOpen ? null : policy.sysPolicyID)}
          className="flex cursor-pointer gap-4 border-b border-greyscale-700 px-5 py-5 items-center justify-between"
        >
          <div className="space-y-2">
              <span className="inline-flex items-center rounded border border-primary-500/20 bg-primary-500/10 px-3 py-1 text-xs font-medium text-primary-300">
                {getPolicyTypeLabel(policy.type)}
              </span>

            <h3 className="text-lg font-semibold text-greyscale-0">{title}</h3>
          </div>

          {/* Icon */}
          <ChevronDown
            className={`h-5 w-5 text-greyscale-0 transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>

        {/* CONTENT */}
        <div
          className={`px-5 transition-all duration-300 ${
            isOpen
              ? "max-h-250 py-5 opacity-100"
              : "max-h-0 overflow-hidden opacity-0"
          }`}
        >
          <p className="whitespace-pre-wrap text-sm leading-6 text-greyscale-50">
            {locale === "vi" ? policy.contentVN : policy.contentEN}
          </p>
        </div>
      </article>
    );
  };

  return (
    <div className="min-h-[calc(100vh)] bg-greyscale-900 px-4 py-6 md:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
        <div className="flex items-center justify-between gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {locale === "vi" ? "Quay lại" : "Go back"}
          </Button>

          <LanguageSwitcher />
        </div>

        <section className="rounded border border-greyscale-700 bg-greyscale-900/85 p-6 shadow-sm md:p-7">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary-300">
              <ShieldCheck className="h-4 w-4" />
              {locale === "vi" ? "Điều khoản & chính sách" : "Terms & policies"}
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-greyscale-0 md:text-4xl">
              {locale === "vi"
                ? "Tra cứu điều khoản và chính sách"
                : "Browse terms and policies"}
            </h1>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
            <div className="flex flex-wrap gap-2">
              {POLICY_TYPE_OPTIONS.map((option) => {
                const label = locale === "vi" ? option.labelVN : option.labelEN;
                const active = selectedType === option.value;

                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setSelectedType(option.value)}
                    className={`rounded px-4 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "bg-primary text-greyscale-0"
                        : "border border-greyscale-700 bg-greyscale-800 text-greyscale-200 hover:border-primary-400 hover:text-greyscale-0"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {isLoading ? (
          <div className="flex min-h-48 items-center justify-center rounded-3xl border border-greyscale-700 bg-greyscale-800/70">
            <Spinner className="h-6 w-6" />
          </div>
        ) : isError ? (
          <div className="rounded-3xl border border-greyscale-700 bg-greyscale-800/70 p-6">
            <EmptyState
              title={
                locale === "vi"
                  ? "Không tải được chính sách"
                  : "Unable to load policies"
              }
              description={
                error?.response?.data?.message ||
                error?.message ||
                (locale === "vi"
                  ? "Đã xảy ra lỗi khi tải dữ liệu chính sách hệ thống."
                  : "An error occurred while loading system policies.")
              }
            />
          </div>
        ) : filteredPolicies.length === 0 ? (
          <div className="rounded-3xl border border-greyscale-700 bg-greyscale-800/70 p-6">
            <EmptyState
              title={
                locale === "vi"
                  ? "Không có chính sách phù hợp"
                  : "No matching policy found"
              }
              description={
                locale === "vi"
                  ? "Hãy thử đổi bộ lọc hoặc từ khóa tìm kiếm."
                  : "Try changing the filter or search keyword."
              }
            />
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredPolicies.map(renderPolicyCard)}
          </div>
        )}
      </div>
    </div>
  );
}
