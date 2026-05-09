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

  const courseId = React.useMemo(() => {
    if (!courseSlug) return undefined;

    const uuidMatch = courseSlug.match(UUID_SUFFIX_REGEX);
    return uuidMatch?.[0];
  }, [courseSlug]);

  const { data, isLoading, isError, error } = useGetClubCourseOverview(
    clubId,
    courseId,
  );

  const [paymentError, setPaymentError] = React.useState<string | null>(null);

  const redirectedRef = React.useRef(false);

  const createPaymentOrderMutation = useCreatePaymentOrder();

  const title = locale === "vi" ? data?.titleVN ?? "" : data?.titleEN ?? "";
  const hasProduct = !!data?.miniProduct;
  const unitPrice = data?.miniProduct?.price ?? 0;
  const currency = data?.miniProduct?.currency ?? "VND";
  const quantity = 1;
  const total = unitPrice;
  const isProcessingPayment = createPaymentOrderMutation.isPending;

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

      const paymentUrl = createdOrder.data.payment?.paymentUrl;

      if (!paymentUrl) {
        setPaymentError("Không lấy được đường dẫn thanh toán.");
        return;
      }

      if (!redirectedRef.current) {
        redirectedRef.current = true;
        window.location.href = paymentUrl;
      }
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

  if (!clubId || !courseId) {
    return (
      <div className="px-6 py-4">
        <EmptyState title={locale === "vi" ? "Không xác định được khóa học hoặc câu lạc bộ hiện tại." : "Unable to identify the current course or club."} />
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
            locale === "vi" ? "Không tải được thông tin checkout" : "Unable to load checkout information"
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
          {locale === "vi" ? "Quay lại" : "Back"}
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
              {locale === "vi" ? "Thông tin thanh toán" : "Payment Information"}
            </h3>

            {!hasProduct ? (
              <div className="mt-4 rounded border border-greyscale-700 bg-greyscale-900/60 p-4">
                <EmptyState
                  title={locale === "vi" ? "Không có sản phẩm nào được liên kết với khóa học này." : "No products are linked to this course."}
                  description={locale === "vi" ? "Không thể checkout vì khóa học này chưa được cấu hình giá bán." : "Cannot checkout because this course has not been configured with a price."}
                />
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="rounded border border-greyscale-700 bg-greyscale-900/70 p-3">
                  <p className="mb-2 text-sm font-medium text-greyscale-25">
                    {locale === "vi" ? "Phương thức thanh toán" : "Payment Method"}
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
                <div className="grid grid-cols-1 gap-2 rounded border border-greyscale-700 bg-greyscale-900/80 p-4 text-sm text-greyscale-100">
                  <div className="flex items-center justify-between">
                    <span>{locale === "vi" ? "Đơn giá" : "Unit Price"}</span>
                    <span className="font-semibold text-greyscale-0">
                      {formatPrice(unitPrice, currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{locale === "vi" ? "Số lượng" : "Quantity"}</span>
                    <span className="font-semibold text-greyscale-0">1</span>
                  </div>
                  <div className="my-1 h-px bg-greyscale-700" />
                  <div className="flex items-center justify-between text-base">
                    <span className="font-semibold text-greyscale-0">
                      {locale === "vi" ? "Tổng tiền" : "Total Amount"}
                    </span>
                    <span className="font-bold text-primary">
                      {formatPrice(total, currency)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {paymentError ? (
              <p className="mt-3 text-sm text-primary">{paymentError}</p>
            ) : null}

            <Button
              className="mt-5 w-full"
              disabled={!hasProduct || isProcessingPayment}
              onClick={handleCheckout}
            >
              {isProcessingPayment ? (locale === "vi" ? "Đang chuyển tới cổng thanh toán..." : "Processing payment...") : (locale === "vi" ? "Thanh toán" : "Checkout")}
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
