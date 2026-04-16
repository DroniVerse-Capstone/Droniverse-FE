"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { IoChevronBackOutline } from "react-icons/io5";

import EmptyState from "@/components/common/EmptyState";
import CourseOverviewHero from "@/components/course/CourseOverviewHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useGetClubCourseOverview } from "@/hooks/club/useClubCourse";
import { useCreatePaymentOrder, useGetPaymentDetail } from "@/hooks/payment/usePayment";
import { useLocale } from "@/providers/i18n-provider";
import Image from "next/image";

const UUID_SUFFIX_REGEX =
  /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const formatPrice = (value: number, currency: "USD" | "VND") => {
  if (currency === "USD") {
    return `${value.toLocaleString("en-US")} $`;
  }

  return `${value.toLocaleString("vi-VN")} VND`;
};

export default function ManagerCourseCheckout() {
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

  const [quantity, setQuantity] = React.useState(1);
  const [paymentMethod, setPaymentMethod] = React.useState<"VNPAY">("VNPAY");
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
  const total = unitPrice * quantity;
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
          paymentMethod,
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
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } }; message?: string })
          ?.response?.data?.message ||
        (error as { message?: string })?.message ||
        "Không tạo được đơn hàng thanh toán.";
      setPaymentError(message);
    }
  }, [
    createPaymentOrderMutation,
    clubId,
    data?.miniProduct,
    data?.titleEN,
    data?.titleVN,
    hasProduct,
    isProcessingPayment,
    paymentMethod,
    quantity,
  ]);

  if (!clubId || !courseId) {
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
          onClick={() => router.push(`/manager/${clubSlug}/${courseSlug}`)}
        >
          Quay lại
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section>
          <CourseOverviewHero
            title={title}
            description={
              locale === "vi" ? data.descriptionVN : data.descriptionEN
            }
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
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded border border-primary/40 bg-primary/10 px-3 py-2 text-left"
                    onClick={() => setPaymentMethod("VNPAY")}
                  >
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

                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        paymentMethod === "VNPAY"
                          ? "bg-primary"
                          : "bg-greyscale-500"
                      }`}
                    />
                  </button>
                </div>

                <div className="rounded border border-greyscale-700 bg-greyscale-900/70 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-greyscale-25">
                      Số lượng mã{" "}
                      <span className="text-xs text-primary">(Tối đa 100)</span>
                    </p>

                    {data.clubCourseOwn && (
                      <p className="text-sm font-medium text-greyscale-25">
                        Số mã còn lại: {data.clubCourseOwn.remainingQuantity}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() =>
                        setQuantity((prev) => Math.max(1, prev - 1))
                      }
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      value={quantity}
                      onChange={(event) => {
                        const value = Number(event.target.value || 1);
                        setQuantity(
                          Number.isNaN(value)
                            ? 1
                            : Math.min(100, Math.max(1, value)),
                        );
                      }}
                      className="w-28 text-center"
                    />
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() =>
                        setQuantity((prev) => Math.min(100, prev + 1))
                      }
                    >
                      +
                    </Button>
                  </div>
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
                    <span className="font-semibold text-greyscale-0">
                      {quantity}
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
