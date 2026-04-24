"use client";

import React, { useState } from "react";

import CourseLevelBadge from "@/components/course/CourseLevelBadge";
import EmptyState from "@/components/common/EmptyState";
import { TableCustom } from "@/components/common/TableCustom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Empty } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { TableCell } from "@/components/ui/table";
import { useGetLevelPath } from "@/hooks/level/useLevel";
import { useLocale, useTranslations } from "@/providers/i18n-provider";
import { RiArrowUpDoubleFill } from "react-icons/ri";

interface LevelPathDialogProps {
  droneId: string;
  buttonLabel?: string;
}

export default function LevelPathDialog({
  droneId,
  buttonLabel,
}: LevelPathDialogProps) {
  const locale = useLocale();
  const t = useTranslations("LevelPathManagement");
  const [dialogOpen, setDialogOpen] = useState(false);

  const {
    data: levelPaths = [],
    isLoading: isLevelPathsLoading,
    isError: isLevelPathsError,
    error: levelPathsError,
  } = useGetLevelPath(dialogOpen ? droneId : undefined);

  const headers = [
    locale === "vi" ? "Cấp độ" : "Level",
    locale === "vi" ? "Điều kiện thăng cấp" : "Promotion criteria",
  ];

  return (
    <>
      <Button
        icon={<RiArrowUpDoubleFill size={20}/>}
        variant="tertiary"
        onClick={() => setDialogOpen(true)}
      >
        {buttonLabel || (locale === "vi" ? "Lộ trình thăng cấp" : "Level Path")}
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0">
          <div className="flex max-h-[90vh] flex-col">
            <DialogHeader className="px-6 pt-6">
              <DialogTitle>
                {locale === "vi" ? "Lộ trình thăng cấp" : "Level Path"}
              </DialogTitle>
              <DialogDescription>
                {locale === "vi"
                  ? "Xem các cấp độ và điều kiện thăng cấp."
                  : "View levels and their promotion criteria."}
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {isLevelPathsLoading ? (
                <div className="flex min-h-40 items-center justify-center">
                  <Spinner className="h-5 w-5" />
                </div>
              ) : isLevelPathsError ? (
                <Empty>
                  <p className="text-sm text-muted-foreground">
                    {levelPathsError.response?.data?.message ||
                      levelPathsError.message ||
                      (locale === "vi"
                        ? "Không thể tải lộ trình thăng cấp."
                        : "Unable to load level paths.")}
                  </p>
                </Empty>
              ) : levelPaths.length === 0 ? (
                <EmptyState
                  title={
                    locale === "vi"
                      ? "Chưa có điều kiện thăng cấp."
                      : "No promotion criteria available."
                  }
                />
              ) : (
                <TableCustom
                  headers={headers}
                  data={levelPaths}
                  renderRow={(levelPath) => {
                    return (
                      <>
                        <TableCell>
                          <CourseLevelBadge level={levelPath.level} />
                        </TableCell>

                        <TableCell>
                          <div className="space-y-2">
                            {levelPath.courses.length === 0 ? (
                              <span className="text-sm text-greyscale-100">
                                {locale === "vi"
                                  ? "Không có điều kiện thăng cấp"
                                  : "No promotion criteria defined"}
                              </span>
                            ) : (
                              levelPath.courses.map((course) => {
                                const title =
                                  locale === "vi"
                                    ? course.currentVersion?.titleVN ||
                                      course.currentVersion?.titleEN ||
                                      course.courseID
                                    : course.currentVersion?.titleEN ||
                                      course.currentVersion?.titleVN ||
                                      course.courseID;

                                return (
                                  <div
                                    key={course.courseID}
                                    className="rounded-md border border-greyscale-700 bg-greyscale-800/70 px-3 py-2"
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <p className="font-medium text-greyscale-0">
                                        {title}
                                      </p>
                                      {course.level ? (
                                        <CourseLevelBadge
                                          level={course.level}
                                        />
                                      ) : null}
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </TableCell>
                      </>
                    );
                  }}
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
