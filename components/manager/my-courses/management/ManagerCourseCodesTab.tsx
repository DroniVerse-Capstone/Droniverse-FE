"use client";

import React from "react";
import toast from "react-hot-toast";

import CommonDropdown from "@/components/common/CommonDropdown";
import EmptyState from "@/components/common/EmptyState";
import { TableCustom } from "@/components/common/TableCustom";
import ManagerCourseCodesHeader from "@/components/manager/my-courses/management/ManagerCourseCodesHeader";
import { Spinner } from "@/components/ui/spinner";
import { TableCell } from "@/components/ui/table";
import {
  useGenerateCodes,
  useGetClubCourseCodeSummary,
  useGetCourseCodesByClub,
  useUpdateClubCourseProfitType,
} from "@/hooks/code/useCode";
import type { CodeOwnState, CodeProfitType, CodeUseState } from "@/validations/code/code";

type ManagerCourseCodesTabProps = {
  clubId: string;
  courseId: string;
};

const PAGE_SIZE = 5;

type CodeFilterKey = "TH1" | "TH2" | "TH4";

const CODE_FILTERS: Record<
  CodeFilterKey,
  { label: string; codeUseState: CodeUseState; codeOwnState: CodeOwnState }
> = {
  TH1: {
    label: "Mã khả dụng",
    codeUseState: "UnUse",
    codeOwnState: "UnUserOwned",
  },
  TH2: {
    label: "Mã đã được sở hữu nhưng chưa dùng",
    codeUseState: "UnUse",
    codeOwnState: "UserOwned",
  },
  TH4: {
    label: "Mã đã được dùng",
    codeUseState: "Used",
    codeOwnState: "UserOwned",
  },
};

export default function ManagerCourseCodesTab({
  clubId,
  courseId,
}: ManagerCourseCodesTabProps) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [quantity, setQuantity] = React.useState("1");
  const [codeFilter, setCodeFilter] = React.useState<CodeFilterKey>("TH2");
  const [profitType, setProfitType] = React.useState<CodeProfitType>("PROFIT");

  const selectedFilter = CODE_FILTERS[codeFilter];

  const courseCodesQuery = useGetCourseCodesByClub(clubId, courseId, {
    codeUseState: selectedFilter.codeUseState,
    codeOwnState: selectedFilter.codeOwnState,
    currentPage,
    pageSize: PAGE_SIZE,
  });
  const clubCourseSummaryQuery = useGetClubCourseCodeSummary(clubId, courseId);
  const generateCodesMutation = useGenerateCodes();
  const updateProfitTypeMutation = useUpdateClubCourseProfitType();

  const codesPaging = courseCodesQuery.data?.codesItem;
  const codeItems = codesPaging?.data ?? [];
  const courseInfo = courseCodesQuery.data?.courseInfo;
  const courseSummary = clubCourseSummaryQuery.data;
  const totalCodes = courseSummary?.totalQuantity;
  const remainingCodes = courseSummary?.remainingQuantity ?? 0;
  const courseName = courseInfo?.courseNameVN || courseInfo?.courseNameEN || "Khóa học";

  const headers = [
    "STT",
    "Mã code",
    "Người sở hữu",
    "Người sử dụng",
  ];

  React.useEffect(() => {
    setCurrentPage(1);
  }, [codeFilter]);

  React.useEffect(() => {
    if (courseSummary?.profitType) {
      setProfitType(courseSummary.profitType);
    }
  }, [courseSummary?.profitType]);

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
          ?.message ?? "Tạo mã code thất bại. Vui lòng thử lại.";
      toast.error(message);
    }
  };

  const handleChangeProfitType = async (value: string) => {
    const nextProfitType = value as CodeProfitType;

    if (nextProfitType === profitType) {
      return;
    }

    try {
      await updateProfitTypeMutation.mutateAsync({
        clubId,
        courseId,
        payload: { profitType: nextProfitType },
      });
      setProfitType(nextProfitType);
      toast.success("Đã cập nhật loại lợi nhuận của khóa học.");
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Cập nhật loại lợi nhuận thất bại. Vui lòng thử lại.";
      toast.error(message);
    }
  };

  return (
    <div className="space-y-4">
      <ManagerCourseCodesHeader
        courseName={courseName}
        courseImageUrl={courseInfo?.imageUrl}
        remainingCodes={remainingCodes}
        totalCodes={totalCodes ?? 0}
        isSummaryLoading={clubCourseSummaryQuery.isLoading}
        quantity={quantity}
        onQuantityChange={setQuantity}
        onGenerateCodes={handleGenerateCodes}
        isGeneratingCodes={generateCodesMutation.isPending}
        profitType={profitType}
        onConfirmProfitTypeChange={handleChangeProfitType}
        isUpdatingProfitType={updateProfitTypeMutation.isPending}
      />

      <div className="flex flex-wrap items-end justify-between gap-3 rounded border border-greyscale-700 bg-greyscale-900/70 p-4">
        <div>
          <p className="text-sm text-greyscale-50">Tổng số mã</p>
          <p className="text-xl font-semibold text-greyscale-0">
            {codesPaging?.totalRecords ?? 0}
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:max-w-xl sm:flex-row sm:items-center sm:justify-end">
          <div>
            <p className="text-sm text-greyscale-50">Lọc theo trạng thái:</p>
          </div>
          <CommonDropdown
            value={codeFilter}
            onChange={(value) => setCodeFilter(value as CodeFilterKey)}
            options={Object.entries(CODE_FILTERS).map(([value, filter]) => ({
              value,
              label: filter.label,
            }))}
            placeholder="Lọc theo trạng thái"
            className="w-fit"
            triggerClassName="mt-0"
          />
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
              </>
            );
          }}
        />
      )}
    </div>
  );
}

export type { ManagerCourseCodesTabProps };
