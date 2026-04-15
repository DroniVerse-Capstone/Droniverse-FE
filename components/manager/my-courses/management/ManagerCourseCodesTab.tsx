"use client";

import React from "react";
import toast from "react-hot-toast";

import EmptyState from "@/components/common/EmptyState";
import { TableCustom } from "@/components/common/TableCustom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { TableCell } from "@/components/ui/table";
import { useGenerateCodes, useGetCourseCodesByClub } from "@/hooks/code/useCode";
import { formatDateTime } from "@/lib/utils/format-date";

type ManagerCourseCodesTabProps = {
  clubId: string;
  courseId: string;
};

const PAGE_SIZE = 5;

export default function ManagerCourseCodesTab({
  clubId,
  courseId,
}: ManagerCourseCodesTabProps) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [quantity, setQuantity] = React.useState("1");

  const courseCodesQuery = useGetCourseCodesByClub(clubId, courseId, {
    currentPage,
    pageSize: PAGE_SIZE,
  });
  const generateCodesMutation = useGenerateCodes();

  const codesPaging = courseCodesQuery.data?.codesItem;
  const codeItems = codesPaging?.data ?? [];

  const headers = [
    "STT",
    "Mã code",
    "Người sở hữu",
    "Người sử dụng",
    "Ngày hết hạn",
  ];

  const handleGenerateCodes = async () => {
    const parsedQuantity = Number(quantity);
    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      toast.error("Số lượng mã phải là số nguyên dương.");
      return;
    }

    try {
      const result = await generateCodesMutation.mutateAsync({
        clubId,
        courseId,
        quantity: parsedQuantity,
      });

      toast.success(`Đã tạo ${result.createdCode} mã code.`);
      setQuantity("1");
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Tạo mã thất bại. Vui lòng thử lại.";
      toast.error(message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3 rounded border border-greyscale-700 bg-greyscale-900/70 p-4">
        <div>
          <p className="text-sm text-greyscale-100">Tổng số mã</p>
          <p className="text-xl font-semibold text-greyscale-0">
            {codesPaging?.totalRecords ?? 0}
          </p>
        </div>

        <div className="flex w-full max-w-sm items-center gap-2">
          <Input
            type="number"
            min={1}
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            placeholder="Nhập số lượng mã"
            className="w-full"
          />
          <Button
            onClick={handleGenerateCodes}
            disabled={generateCodesMutation.isPending}
          >
            {generateCodesMutation.isPending ? "Đang tạo..." : "Tạo mã"}
          </Button>
        </div>
      </div>

      {courseCodesQuery.isLoading ? (
        <div className="flex min-h-40 items-center justify-center">
          <Spinner className="h-5 w-5" />
        </div>
      ) : courseCodesQuery.isError ? (
        <p className="text-sm text-error">
          {courseCodesQuery.error.response?.data?.message ||
            courseCodesQuery.error.message ||
            "Không tải được danh sách mã code."}
        </p>
      ) : codeItems.length === 0 ? (
        <EmptyState title="Chưa có mã code nào" />
      ) : (
        <TableCustom
          headers={headers}
          data={codeItems}
          pagination={{
            currentPage: codesPaging?.pageIndex ?? currentPage,
            pageSize: codesPaging?.pageSize ?? PAGE_SIZE,
            totalItems: codesPaging?.totalRecords ?? 0,
            onPageChange: setCurrentPage,
          }}
          renderRow={(item, index) => {
            const currentPageIndex = (codesPaging?.pageIndex ?? 1) - 1;
            const pageSize = codesPaging?.pageSize ?? PAGE_SIZE;

            return (
              <>
                <TableCell className="text-greyscale-100">
                  {currentPageIndex * pageSize + index + 1}
                </TableCell>
                <TableCell className="font-medium text-greyscale-0">
                  {item.code}
                </TableCell>
                <TableCell className="text-greyscale-50">
                  {item.ownerInfo ? (
                    <div>
                      <p className="font-medium text-greyscale-25">
                        {item.ownerInfo.fullName}
                      </p>
                      <p className="text-xs">{item.ownerInfo.email}</p>
                    </div>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="text-greyscale-50">
                  {item.comsumerInfo ? (
                    <div>
                      <p className="font-medium text-greyscale-25">
                        {item.comsumerInfo.fullName}
                      </p>
                      <p className="text-xs">{item.comsumerInfo.email}</p>
                    </div>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="text-greyscale-50">
                  {formatDateTime(item.expireDate)}
                </TableCell>
              </>
            );
          }}
        />
      )}
    </div>
  );
}

export type { ManagerCourseCodesTabProps };
