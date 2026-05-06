"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ExternalLink, Award, CalendarDays, ShieldCheck } from "lucide-react";

import AppPagination from "@/components/common/AppPagination";
import EmptyState from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useGetUserCertificates } from "@/hooks/certificate/useUserCertificate";
import { formatDate } from "@/lib/utils/format-date";
import { FaArrowLeft } from "react-icons/fa";
import { PiDownloadSimpleBold } from "react-icons/pi";
import { PiCertificate } from "react-icons/pi";

const PAGE_SIZE = 8;

export default function MyCertificates() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [downloadingCertificateId, setDownloadingCertificateId] =
    React.useState<string | null>(null);
  const { data, isLoading, isError, error, isFetching } =
    useGetUserCertificates({
      pageIndex: currentPage,
      pageSize: PAGE_SIZE,
    });

  const certificates = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalRecords = data?.totalRecords ?? 0;

  const handleDownloadCertificate = React.useCallback(
    async (url: string, fileName: string) => {
      try {
        setDownloadingCertificateId(fileName);
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      } catch (downloadError) {
        console.error("Download certificate failed:", downloadError);
        window.open(url, "_blank");
      } finally {
        setDownloadingCertificateId(null);
      }
    },
    [],
  );

  return (
    <div className="space-y-6 px-6 py-4">
      <Button
        type="button"
        variant="outline"
        icon={<FaArrowLeft />}
        className="border-greyscale-700 bg-greyscale-900 text-greyscale-0 hover:bg-greyscale-800"
        onClick={() => router.back()}
      >
        Quay lại
      </Button>
      <div className="flex flex-col gap-3 rounded border border-greyscale-800 bg-[radial-gradient(circle_at_top_left,rgba(79,70,229,0.18),transparent_38%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(15,23,42,0.88))] p-6 shadow-2xl shadow-black/20">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              <PiCertificate className="h-3.5 w-3.5" />
              Chứng chỉ của tôi
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-greyscale-0 sm:text-3xl">
              Xem toàn bộ chứng chỉ đã đạt được
            </h1>
          </div>

          <div className="rounded border border-white/10 bg-white/5 px-4 py-3 text-right">
            <p className="text-xs uppercase text-greyscale-100">
              Tổng chứng chỉ
            </p>
            <p className="mt-1 text-2xl font-bold text-greyscale-0">
              {totalRecords}
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-72 items-center justify-center rounded-2xl border border-greyscale-800 bg-greyscale-900/60">
          <Spinner className="h-6 w-6 text-greyscale-0" />
        </div>
      ) : null}

      {!isLoading && isError ? (
        <div className="rounded-2xl border border-greyscale-800 bg-greyscale-900/60 p-8">
          <EmptyState
            title={
              error.response?.data?.message ||
              error.message ||
              "Không thể tải danh sách chứng chỉ."
            }
            description="Hãy thử tải lại trang hoặc quay lại sau."
          />
        </div>
      ) : null}

      {!isLoading && !isError ? (
        <>
          {certificates.length === 0 ? (
            <div className="rounded-2xl border border-greyscale-800 bg-greyscale-900/60 p-8">
              <EmptyState
                title="Bạn chưa có chứng chỉ nào"
                description="Khi hoàn thành khóa học và được cấp chứng chỉ, chúng sẽ xuất hiện ở đây."
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {certificates.map((certificate) => {
                const isRevoked = certificate.status === "REVOKED";

                return (
                  <article
                    key={certificate.certificateID}
                    className={cn(
                      "group overflow-hidden rounded border border-greyscale-700 bg-greyscale-900/70 shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-primary/10",
                      isRevoked && "opacity-70 grayscale-[0.2]",
                    )}
                  >
                    <div className="relative aspect-16/10 overflow-hidden border-b border-greyscale-800 bg-greyscale-950">
                      <Image
                        src={certificate.certificateUrl}
                        alt={`Certificate ${certificate.certificateID}`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      <div className="absolute inset-0 bg-linear-to-t from-greyscale-950 via-greyscale-950/10 to-transparent" />

                      <div className="absolute left-4 top-4 flex items-center gap-2">
                        <Badge
                          variant={isRevoked ? "destructive" : "success"}
                          className="border-0 shadow-sm"
                        >
                          {isRevoked ? "Đã thu hồi" : "Đã đạt"}
                        </Badge>
                      </div>

                      <div className="absolute right-4 top-4 rounded-full border border-white/10 bg-black/40 p-2 text-white/90 backdrop-blur-sm">
                        <Award className="h-4 w-4" />
                      </div>
                    </div>

                    <div className="space-y-4 p-5">
                      <div className="flex items-center gap-2">
                        <p className="flex items-center gap-2 text-sm text-greyscale-50">
                          <CalendarDays className="h-3.5 w-3.5" />
                          Ngày đạt
                        </p>
                        <p className="text-sm font-semibold text-greyscale-0">
                          {formatDate(certificate.achievedDate)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-3 pt-1">
                        <Button
                          type="button"
                          variant="secondary"
                          icon={<PiDownloadSimpleBold />}
                          onClick={() =>
                            handleDownloadCertificate(
                              certificate.certificateUrl,
                              `certificate-${certificate.certificateID}.png`,
                            )
                          }
                          disabled={
                            downloadingCertificateId ===
                            `certificate-${certificate.certificateID}.png`
                          }
                        >
                          Tải về máy
                        </Button>

                        <Link
                          href={certificate.certificateUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded bg-primary/15 text-primary border-1 border-primary-300 shadow-sm hover:bg-primary/5 h-10 px-4 py-2 font-semibold transition-colors"
                        >
                          Xem chi tiết
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-end pt-2">
            <AppPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              disabled={isFetching}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
