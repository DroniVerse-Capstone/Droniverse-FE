"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, CircleAlert, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";

type PaymentResultType = "success" | "cancel";

type PaymentResultCardProps = {
  type: PaymentResultType;
};

export default function PaymentResultCard({ type }: PaymentResultCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleName = useAuthStore((state) => state.user?.roleName);

  const code = searchParams.get("code");
  const id = searchParams.get("id");
  const cancel = searchParams.get("cancel");
  const status = searchParams.get("status");
  const orderCode = searchParams.get("orderCode");

  const hasPaymentData = !!(code && id && cancel && status && orderCode);
  const defaultHomePath = roleName === "CLUB_MANAGER" ? "/manager" : "/member";

  const isSuccess = type === "success";

  // If no payment data, show only warning state
  if (!hasPaymentData) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-greyscale-900">
        <div className="absolute inset-0 bg-(image:--bg-pattern-grid) bg-repeat bg-size-[96px_96px] opacity-20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,146,60,0.08),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(219,65,57,0.1),transparent_40%)]" />

        <div className="relative mx-auto w-full max-w-md px-6">
          <div className="space-y-6">
            <div className="animate-bounce-slow space-y-4">
              <div className="flex justify-center">
                <div className="relative flex h-24 w-24 items-center justify-center">
                  <div className="absolute h-24 w-24 rounded-full border border-warning/20 animate-pulse" />
                  <div className="absolute h-24 w-24 rounded-full border border-warning/10 animate-ping" />
                  <div className="rounded-2xl border border-warning/40 bg-warning/10 p-4 shadow-[0_12px_40px_rgba(251,146,60,0.15)]">
                    <CircleAlert className="h-8 w-8 text-warning" />
                  </div>
                </div>
              </div>

              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-greyscale-0">Chưa có thanh toán nào</h1>
                <p className="text-greyscale-300">
                  Không tìm thấy dữ liệu giao dịch. Vui lòng quay lại và thử lại.
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <Button 
                icon={<ArrowLeft />}
                onClick={() => router.push(defaultHomePath)}
              >
                  Về trang chủ
              </Button>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes bounce-slow {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-8px);
            }
          }

          .animate-bounce-slow {
            animation: bounce-slow 3s ease-in-out infinite;
          }

          .animate-ping {
            animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
          }

          @keyframes ping {
            75%, 100% {
              transform: scale(2);
              opacity: 0;
            }
          }
        `}</style>
      </div>
    );
  }

  const title = isSuccess ? "Thanh toán thành công" : "Thanh toán đã hủy";
  const description = isSuccess
    ? "Giao dịch đã được xác nhận. Bạn có thể quay lại để tiếp tục quản lý khóa học."
    : "Giao dịch chưa hoàn tất hoặc đã bị hủy. Bạn có thể thử thanh toán lại bất cứ lúc nào.";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-greyscale-900">
      <div className="absolute inset-0 bg-(image:--bg-pattern-grid) bg-repeat bg-size-[96px_96px] opacity-20" />
      <div
        className={`absolute inset-0 ${
          isSuccess
            ? "bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.12),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(45,212,191,0.10),transparent_40%)]"
            : "bg-[radial-gradient(circle_at_top,rgba(219,65,57,0.12),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.10),transparent_40%)]"
        }`}
      />

      <div className="relative mx-auto w-full max-w-2xl px-6">
        <div className="overflow-hidden rounded-3xl border border-greyscale-700/60 bg-greyscale-900/80 shadow-[0_32px_96px_rgba(2,8,23,0.55)] backdrop-blur-xl">
          <div
            className={`bg-linear-120 p-8 md:p-12 ${
              isSuccess
                ? "from-greyscale-900 via-success/5 to-greyscale-900"
                : "from-greyscale-900 via-primary/5 to-greyscale-900"
            }`}
          >
            <div className="space-y-6">
              {/* Animated Icon Section */}
              <div className="flex justify-center">
                <div
                  className={`relative flex h-32 w-32 items-center justify-center animate-scale-in`}
                >
                  {/* Outer animated rings */}
                  <div
                    className={`absolute h-32 w-32 rounded-full border opacity-30 ${
                      isSuccess
                        ? "border-success animate-orbit-outer"
                        : "border-primary animate-orbit-outer"
                    }`}
                  />
                  <div
                    className={`absolute h-24 w-24 rounded-full border opacity-40 ${
                      isSuccess
                        ? "border-success animate-orbit-inner"
                        : "border-primary animate-orbit-inner"
                    }`}
                  />

                  {/* Main icon box */}
                  <div
                    className={`relative rounded-3xl border p-6 shadow-[0_20px_60px_rgba(0,0,0,0.3)] ${
                      isSuccess
                        ? "border-success/50 bg-success/15 text-success"
                        : "border-primary/50 bg-primary/15 text-primary"
                    }`}
                  >
                    {isSuccess ? (
                      <CheckCircle2 className="h-12 w-12 animate-pulse" />
                    ) : (
                      <XCircle className="h-12 w-12 animate-pulse" />
                    )}
                  </div>
                </div>
              </div>

              {/* Title and Description */}
              <div className="space-y-3 text-center animate-fade-in" style={{ animationDelay: "0.2s" }}>
                <h1 className="text-xl font-bold text-greyscale-0 md:text-3xl">{title}</h1>
                <p className="text-base text-greyscale-200 md:text-sm">{description}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center pt-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
                <Button
                  icon={<ArrowLeft />}
                  onClick={() => router.push(defaultHomePath)}
                >
                  Về trang chủ
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes orbit-outer {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes orbit-inner {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        @keyframes scale-in {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-scale-in {
          animation: scale-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-orbit-outer {
          animation: orbit-outer 4s linear infinite;
        }

        .animate-orbit-inner {
          animation: orbit-inner 6s linear infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}
