"use client";

import { AxiosError } from "axios";
import React from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import CommonDropdown, {
  CommonDropdownOption,
} from "@/components/common/CommonDropdown";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  useCreateCourseProduct,
  useUpdateCourseProduct,
} from "@/hooks/course/useCourse";
import { ApiError } from "@/types/api/common";
import { Course, CourseVersion } from "@/validations/course/course";
import { useLocale } from "@/providers/i18n-provider";

type CourseProductPriceSectionProps = {
  course: Course;
  version: CourseVersion | null;
  canManagePrice?: boolean;
};

export default function CourseProductPriceSection({
  course,
  version,
  canManagePrice = false,
}: CourseProductPriceSectionProps) {
  const locale = useLocale();
  const createCourseProductMutation = useCreateCourseProduct();
  const updateCourseProductMutation = useUpdateCourseProduct();
  const hasMiniProduct = !!course.miniProduct;
  const isCreatingProduct = createCourseProductMutation.isPending;
  const isUpdatingProduct = updateCourseProductMutation.isPending;
  const isPriceSubmitting = isCreatingProduct || isUpdatingProduct;
  const currencyOptions = React.useMemo<CommonDropdownOption[]>(
    () => [{ value: "VND", label: "VND" }],
    [],
  );

  const [priceDialogOpen, setPriceDialogOpen] = React.useState(false);
  const [price, setPrice] = React.useState<string>(
    course.miniProduct?.price?.toString() ?? "",
  );
  const [currency, setCurrency] = React.useState<"USD" | "VND">("VND");

  React.useEffect(() => {
    setPrice(course.miniProduct?.price?.toString() ?? "");
    setCurrency("VND");
  }, [course.miniProduct?.price]);

  const handleOpenPriceDialog = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    setPrice(course.miniProduct?.price?.toString() ?? "");
    setCurrency("VND");
    setPriceDialogOpen(true);
  };

  const handleSubmitPrice = async () => {
    const normalizedPrice = price.trim();

    if (!normalizedPrice) {
      toast.error(locale === "vi" ? "Vui lòng nhập giá tiền." : "Please enter a price.");
      return;
    }

    const parsedPrice = Number(normalizedPrice);

    if (!Number.isInteger(parsedPrice) || parsedPrice <= 0) {
      toast.error(locale === "vi" ? "Giá phải lớn hơn 0." : "Price must be a positive integer.");
      return;
    }

    const productNameVN =
      version?.titleVN?.trim() || version?.titleEN?.trim() || "Khóa học";
    const productNameEN =
      version?.titleEN?.trim() || version?.titleVN?.trim() || "Course";
    const descriptionVN =
      version?.descriptionVN?.trim() ||
      version?.descriptionEN?.trim() ||
      "Mô tả khóa học";
    const descriptionEN =
      version?.descriptionEN?.trim() ||
      version?.descriptionVN?.trim() ||
      "Course description";

    const status = "ACTIVE" as const;

    try {
      if (hasMiniProduct) {
        await updateCourseProductMutation.mutateAsync({
          id: course.miniProduct!.productId,
          data: {
            productNameVN,
            productNameEN,
            descriptionVN,
            descriptionEN,
            referenceId: course.courseID,
            price: parsedPrice,
            currency,
            status,
          },
        });
        toast.success(locale === "vi" ? "Cập nhật giá khóa học thành công" : "Price updated successfully");
      } else {
        await createCourseProductMutation.mutateAsync({
          productNameVN,
          productNameEN,
          descriptionVN,
          descriptionEN,
          referenceId: course.courseID,
          price: parsedPrice,
          currency,
          status,
        });
        toast.success(locale === "vi" ? "Thêm giá khóa học thành công" : "Price added successfully");
      }

      setPriceDialogOpen(false);
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      toast.error(
        axiosError.response?.data?.message ||
          axiosError.message ||
          locale === "vi" ? "Không thể lưu giá khóa học" : "Failed to save course price",
      );
    }
  };

  return (
    <div
      onClick={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <div className="mt-1 flex items-center justify-between gap-3">
        <p className="text-lg font-bold text-primary">
          {hasMiniProduct ? (
            <span>
              {course.miniProduct?.price.toLocaleString()} {course.miniProduct?.currency}
            </span>
          ) : (
            locale === "vi" ? "Chưa có giá" : "No price set"
          )}
        </p>

        {canManagePrice ? (
          <Button
            type="button"
            size="sm"
            variant={hasMiniProduct ? "outline" : "destructive"}
            onClick={handleOpenPriceDialog}
          >
            {hasMiniProduct ? (locale === "vi" ? "Sửa giá" : "Edit Price") : (locale === "vi" ? "Thêm giá" : "Add Price")}
          </Button>
        ) : null}
      </div>

      <Dialog open={priceDialogOpen} onOpenChange={setPriceDialogOpen}>
        <DialogContent
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle>
              {hasMiniProduct ? (locale === "vi" ? "Cập nhật giá khóa học" : "Update Course Price") : (locale === "vi" ? "Thêm giá khóa học" : "Add Course Price")}
            </DialogTitle>
            <DialogDescription>
              {locale === "vi" ? "Thêm giá cho khóa học để xuất bản khóa học" : "Add a price to the course to publish it."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor={`course-price-${course.courseID}`}>
                {locale === "vi" ? "Giá tiền" : "Price"}
              </Label>
              <Input
                id={`course-price-${course.courseID}`}
                type="number"
                min={1}
                value={price}
                onChange={(event) => setPrice(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>
                {locale === "vi" ? "Đơn vị tiền tệ" : "Currency"}
              </Label>
              <CommonDropdown
                options={currencyOptions}
                value={currency}
                onChange={(value) => setCurrency(value as "USD" | "VND")}
                placeholder={locale === "vi" ? "Chọn đơn vị tiền tệ" : "Select Currency"}
                triggerClassName="mt-0"
                disabled={isPriceSubmitting}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isPriceSubmitting}
              onClick={() => setPriceDialogOpen(false)}
            >
              {locale === "vi" ? "Hủy" : "Cancel"}
            </Button>
            <Button
              type="button"
              disabled={isPriceSubmitting}
              onClick={handleSubmitPrice}
            >
              {isPriceSubmitting ? (
                <Spinner />
              ) : hasMiniProduct ? (
                locale === "vi" ? "Cập nhật" : "Update"
              ) : (
                locale === "vi" ? "Thêm" : "Add"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
