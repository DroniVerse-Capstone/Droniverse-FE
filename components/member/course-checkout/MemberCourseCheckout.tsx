"use client";

import React from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { IoChevronBackOutline } from "react-icons/io5";

import EmptyState from "@/components/common/EmptyState";
import CourseOverviewHero from "@/components/course/CourseOverviewHero";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useGetClubCourseOverview } from "@/hooks/club/useClubCourse";
import {
  useCreatePaymentOrder,
  useGetPaymentDetail,
} from "@/hooks/payment/usePayment";
import { useLocale } from "@/providers/i18n-provider";

const UUID_SUFFIX_REGEX =
  /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const formatPrice = (value: number, currency: "USD" | "VND") => {
  if (currency === "USD") {
    return `${value.toLocaleString("en-US")} $`;
  }

  return `${value.toLocaleString("vi-VN")} VND`;
};

export default function MemberCourseCheckout() {
  const router = useRouter();
  const locale = useLocale();
  const params = useParams<{ clubSlug?: string; courseSlug?: string }>();
  const clubSlug = params?.clubSlug;
  const courseSlug = params?.courseSlug;

  const clubId = React.useMemo(() => {
    if (!clubSlug) return undefined;

    const uuidMatch = clubSlug.match(UUID_SUFFIX_REGEX);
    return uuidMatch?.[0];
  }, [clubSlug]);

  const courseVersionId = React.useMemo(() => {
    if (!courseSlug) return undefined;

    const uuidMatch = courseSlug.match(UUID_SUFFIX_REGEX);
    return uuidMatch?.[0];
  }, [courseSlug]);

  const { data, isLoading, isError, error } = useGetClubCourseOverview(
    clubId,
    courseVersionId,
  );

  const [createdOrderId, setCreatedOrderId] = React.useState<string | undefined>(
    undefined,
  );
  const [paymentError, setPaymentError] = React.useState<string | null>(null);

  const redirectedRef = React.useRef(false);

  const createPaymentOrderMutation = useCreatePaymentOrder();
  const {
    data: paymentDetail,
    isFetching: isFetchingPaymentDetail,
    isError: isPaymentDetailError,
    error: paymentDetailError,
  } = useGetPaymentDetail(createdOrderId);

  const title = locale === "vi" ? data?.titleVN ?? "" : data?.titleEN ?? "";
  const hasProduct = !!data?.miniProduct;
  const unitPrice = data?.miniProduct?.price ?? 0;
  const currency = data?.miniProduct?.currency ?? "VND";
  const quantity = 1;
  const clubMaintenanceFee = unitPrice * 0.1;
  const total = unitPrice + clubMaintenanceFee;
  const isProcessingPayment =
    createPaymentOrderMutation.isPending || isFetchingPaymentDetail;

  React.useEffect(() => {
    if (!paymentDetail?.paymentUrl || redirectedRef.current) return;

    redirectedRef.current = true;
    window.location.href = paymentDetail.paymentUrl;
  }, [paymentDetail?.paymentUrl]);

  const handleCheckout = React.useCallback(async () => {
    if (!hasProduct || !data?.miniProduct || !clubId || isProcessingPayment) return;

    setPaymentError(null);

    try {
      const createdOrder = await createPaymentOrderMutation.mutateAsync({
        clubId,
        data: {
          paymentMethod: "VNPAY",
          item: {
            productID: data.miniProduct.productId,
            productNameVN: data.titleVN,
            productNameEN: data.titleEN,
            type: "COURSE",
            quantity,
          },
        },
      });

      setCreatedOrderId(createdOrder.data.orderID);
    } catch (checkoutError) {
      const message =
        (
          checkoutError as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (checkoutError as { message?: string })?.message ||
        "Không tạo được đơn hàng thanh toán.";
      setPaymentError(message);
    }
  }, [
    clubId,
    createPaymentOrderMutation,
    data?.miniProduct,
    data?.titleEN,
    data?.titleVN,
    hasProduct,
    isProcessingPayment,
    quantity,
  ]);

  if (!clubId || !courseVersionId) {
    return (
      <div className="px-6 py-4">
        <EmptyState title="Không xác định được khóa học hoặc câu lạc bộ hiện tại." />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="px-6 py-4">
        <EmptyState
          title={
            error?.response?.data?.message ||
            error?.message ||
            "Không tải được thông tin checkout"
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-5 px-6 py-4">
      <div className="flex items-center gap-4">
        <Button
          icon={<IoChevronBackOutline />}
          variant="outline"
          onClick={() => router.push(`/member/${clubSlug}/${courseSlug}`)}
        >
          Quay lại
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section>
          <CourseOverviewHero
            title={title}
            description={locale === "vi" ? data.descriptionVN : data.descriptionEN}
            level={data.level}
            estimatedDuration={data.estimatedDuration}
            averageRating={data.averageRating}
            totalLearners={data.totalLearners}
            authorName={data.author.fullName}
            lastUpdatedAt={data.lastUpdatedAt}
            imageUrl={data.imageUrl}
          />
        </section>

        <aside className="xl:sticky xl:top-6 xl:self-start">
          <div className="rounded border border-greyscale-700 bg-greyscale-900/75 p-5">
            <h3 className="text-lg font-semibold text-greyscale-0">
              Thông tin thanh toán
            </h3>

            {!hasProduct ? (
              <div className="mt-4 rounded border border-greyscale-700 bg-greyscale-900/60 p-4">
                <EmptyState
                  title="Không có sản phẩm nào được liên kết với khóa học này."
                  description="Không thể checkout vì khóa học này chưa được cấu hình giá bán."
                />
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="rounded border border-greyscale-700 bg-greyscale-900/70 p-3">
                  <p className="mb-2 text-sm font-medium text-greyscale-25">
                    Phương thức thanh toán
                  </p>
                  <div className="flex w-full items-center justify-between rounded border border-primary/40 bg-primary/10 px-3 py-2 text-left">
                    <div className="flex items-center gap-2">
                      <Image
                        src="/images/payOS.png"
                        alt="payos"
                        width={24}
                        height={24}
                        className="rounded"
                      />
                      <span className="text-sm font-semibold text-greyscale-0">
                        PayOS
                      </span>
                    </div>

                    <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                  </div>
                </div>

                <div className="rounded border border-greyscale-700 bg-greyscale-900/70 p-3">
                  <p className="text-sm font-medium text-greyscale-25">Số lượng mã</p>
                  <p className="mt-2 inline-flex rounded bg-greyscale-800 px-3 py-1 text-sm font-semibold text-greyscale-0">
                    1
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2 rounded border border-greyscale-700 bg-greyscale-900/80 p-4 text-sm text-greyscale-100">
                  <div className="flex items-center justify-between">
                    <span>Đơn giá</span>
                    <span className="font-semibold text-greyscale-0">
                      {formatPrice(unitPrice, currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Số lượng</span>
                    <span className="font-semibold text-greyscale-0">1</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Phí duy trì CLB (10%)</span>
                    <span className="font-semibold text-greyscale-0">
                      {formatPrice(clubMaintenanceFee, currency)}
                    </span>
                  </div>
                  <div className="my-1 h-px bg-greyscale-700" />
                  <div className="flex items-center justify-between text-base">
                    <span className="font-semibold text-greyscale-0">
                      Tổng tiền
                    </span>
                    <span className="font-bold text-primary">
                      {formatPrice(total, currency)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {isPaymentDetailError ? (
              <p className="mt-3 text-sm text-primary">
                {paymentDetailError?.response?.data?.message ||
                  paymentDetailError?.message ||
                  "Không lấy được thông tin thanh toán."}
              </p>
            ) : null}

            {paymentError ? (
              <p className="mt-3 text-sm text-primary">{paymentError}</p>
            ) : null}

            <Button
              className="mt-5 w-full"
              disabled={!hasProduct || isProcessingPayment}
              onClick={handleCheckout}
            >
              {isProcessingPayment ? "Đang chuyển tới cổng thanh toán..." : "Thanh toán"}
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
