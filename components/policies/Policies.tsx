"use client";

import React from "react";
import { CalendarDays, Search, ShieldCheck, Sparkles } from "lucide-react";

import EmptyState from "@/components/common/EmptyState";
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
  const locale = useLocale();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedType, setSelectedType] = React.useState<SystemPolicyType | undefined>(undefined);

  const { data, isLoading, isError, error } = useGetSystemPolicies({
    currentPage: 1,
    pageSize: PAGE_SIZE,
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

  const featuredPolicy = filteredPolicies[0];

  const getPolicyTypeLabel = (type: SystemPolicyType) => {
    const option = POLICY_TYPE_OPTIONS.find((item) => item.value === type);
    return locale === "vi" ? option?.labelVN ?? type : option?.labelEN ?? type;
  };

  const formatDate = (value: string) => {
    const date = new Date(value);
    return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const renderPolicyCard = (policy: SystemPolicy) => {
    const title = locale === "vi" ? policy.titleVN : policy.titleEN;

    return (
      <article
        key={policy.sysPolicyID}
        className="overflow-hidden rounded-2xl border border-greyscale-700 bg-linear-to-br from-greyscale-900 to-greyscale-800 shadow-[0_24px_60px_rgba(0,0,0,0.24)]"
      >
        <div className="flex flex-col gap-5 border-b border-greyscale-700 px-5 py-5 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-primary-500/20 bg-primary-500/10 px-3 py-1 text-xs font-semibold text-primary-300">
                {getPolicyTypeLabel(policy.type)}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-greyscale-600 bg-greyscale-800 px-3 py-1 text-xs font-medium text-greyscale-100">
                <CalendarDays className="h-3.5 w-3.5" />
                {formatDate(policy.effectiveDate)}
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-semibold text-greyscale-0">{title}</h3>
              <p className="text-sm text-greyscale-300">
                {locale === "vi"
                  ? "Mở rộng để xem toàn bộ nội dung chính sách."
                  : "Expand to read the full policy content."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start rounded-xl border border-greyscale-700 bg-greyscale-900/70 px-4 py-3">
            <ShieldCheck className="h-5 w-5 text-emerald-300" />
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.22em] text-greyscale-400">
                {locale === "vi" ? "Mã chính sách" : "Policy code"}
              </p>
              <p className="truncate font-mono text-sm text-greyscale-0">{policy.sysPolicyID}</p>
            </div>
          </div>
        </div>

        <div className="px-5 py-5">
          <details className="group rounded-2xl border border-greyscale-700 bg-greyscale-900/70 p-4">
            <summary className="cursor-pointer list-none select-none text-sm font-medium text-greyscale-0">
              <div className="flex items-center justify-between gap-3">
                <span>{locale === "vi" ? "Xem nội dung" : "View content"}</span>
                <Sparkles className="h-4 w-4 text-primary-300 transition-transform group-open:rotate-180" />
              </div>
            </summary>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="space-y-2 rounded-xl border border-greyscale-700 bg-greyscale-800/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-300">
                  {locale === "vi" ? "Tiếng Việt" : "Vietnamese"}
                </p>
                <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-greyscale-100">
                  {policy.contentVN}
                </pre>
              </div>

              <div className="space-y-2 rounded-xl border border-greyscale-700 bg-greyscale-800/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-300">
                  English
                </p>
                <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-greyscale-100">
                  {policy.contentEN}
                </pre>
              </div>
            </div>
          </details>
        </div>

        <div className="border-t border-greyscale-700 px-5 py-4 text-xs text-greyscale-400">
          {locale === "vi" ? "Tạo lúc" : "Created at"}: {formatDate(policy.createdAt)}
        </div>
      </article>
    );
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-greyscale-900 px-4 py-6 md:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="overflow-hidden rounded-3xl border border-greyscale-700 bg-linear-to-br from-greyscale-900 via-greyscale-800 to-greyscale-900 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
          <div className="grid gap-6 px-6 py-7 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-center lg:px-8 lg:py-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-primary-300">
                <ShieldCheck className="h-4 w-4" />
                {locale === "vi" ? "Điều khoản & chính sách" : "Terms & policies"}
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl font-bold tracking-tight text-greyscale-0 md:text-4xl">
                  {locale === "vi"
                    ? "Tra cứu toàn bộ điều khoản và chính sách hệ thống"
                    : "Browse every system policy in one place"}
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-greyscale-200 md:text-base">
                  {locale === "vi"
                    ? "Tìm nhanh điều khoản, chính sách quyền riêng tư, hoàn tiền, thanh toán và an toàn drone. Giao diện này tối ưu để đọc nhanh và mở rộng nội dung khi cần."
                    : "Quickly find the terms of service, privacy policy, refund policy, payment policy, and drone safety guidelines. The layout is designed for fast scanning and comfortable reading."}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-greyscale-700 bg-greyscale-900/80 p-4">
              <label className="flex items-center gap-3 rounded-xl border border-greyscale-700 bg-greyscale-800/80 px-4 py-3">
                <Search className="h-4 w-4 text-greyscale-400" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder={locale === "vi" ? "Tìm theo tiêu đề hoặc nội dung..." : "Search by title or content..."}
                  className="w-full bg-transparent text-sm text-greyscale-0 outline-none placeholder:text-greyscale-500"
                />
              </label>

              <div className="mt-4 flex flex-wrap gap-2">
                {POLICY_TYPE_OPTIONS.map((option) => {
                  const label = locale === "vi" ? option.labelVN : option.labelEN;
                  const active = selectedType === option.value;

                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setSelectedType(option.value)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                        active
                          ? "bg-primary text-greyscale-0 shadow-lg shadow-primary/20"
                          : "border border-greyscale-700 bg-greyscale-800 text-greyscale-100 hover:border-primary-400 hover:text-greyscale-0"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
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
              title={locale === "vi" ? "Không tải được chính sách" : "Unable to load policies"}
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
              title={locale === "vi" ? "Không có chính sách phù hợp" : "No matching policy found"}
              description={
                locale === "vi"
                  ? "Hãy thử đổi bộ lọc hoặc từ khóa tìm kiếm."
                  : "Try changing the filter or search keyword."
              }
            />
          </div>
        ) : (
          <div className="space-y-6">
            {featuredPolicy ? (
              <section className="grid gap-4 rounded-3xl border border-greyscale-700 bg-linear-to-r from-primary/10 via-greyscale-800 to-greyscale-800 p-5 md:grid-cols-[minmax(0,1fr)_260px] md:items-center">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-300">
                    {locale === "vi" ? "Chính sách nổi bật" : "Featured policy"}
                  </p>
                  <h2 className="text-2xl font-semibold text-greyscale-0">
                    {locale === "vi" ? featuredPolicy.titleVN : featuredPolicy.titleEN}
                  </h2>
                  <p className="text-sm leading-7 text-greyscale-200">
                    {locale === "vi"
                      ? featuredPolicy.contentVN.slice(0, 240)
                      : featuredPolicy.contentEN.slice(0, 240)}...
                  </p>
                </div>

                <div className="rounded-2xl border border-greyscale-700 bg-greyscale-900/80 p-4 text-sm text-greyscale-200">
                  <p className="text-xs uppercase tracking-[0.22em] text-greyscale-400">
                    {locale === "vi" ? "Kết quả hiển thị" : "Visible results"}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-greyscale-0">{filteredPolicies.length}</p>
                  <p className="mt-1">
                    {locale === "vi"
                      ? "Chính sách trong bộ lọc hiện tại"
                      : "Policies in the current filter"}
                  </p>
                </div>
              </section>
            ) : null}

            <div className="grid gap-4">
              {filteredPolicies.map(renderPolicyCard)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
