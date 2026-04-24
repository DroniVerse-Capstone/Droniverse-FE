"use client"

import Image from "next/image"
import React, { useState } from "react"

import CourseLevelBadge from "@/components/course/CourseLevelBadge"
import EmptyState from "@/components/common/EmptyState"
import { TableCustom } from "@/components/common/TableCustom"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Empty } from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { TableCell } from "@/components/ui/table"
import { useGetCourses } from "@/hooks/course/useCourse"
import { useLocale, useTranslations } from "@/providers/i18n-provider"
import { PiPathBold } from "react-icons/pi"

interface LearningPathDialogProps {
  droneId: string
  buttonLabel?: string
}

export default function LearningPathDialog({
  droneId,
  buttonLabel,
}: LearningPathDialogProps) {
  const locale = useLocale()
  const t = useTranslations("CurriculumManagement")
  const [dialogOpen, setDialogOpen] = useState(false)

  const {
    data: coursesData,
    isLoading: isCoursesLoading,
    isError: isCoursesError,
    error: coursesError,
  } = useGetCourses({
    droneId,
    pageIndex: 1,
    pageSize: 1000,
    status: "PUBLISH",
    enabled: dialogOpen,
  })

  const courses = coursesData?.data ?? []

  const headers = [
    locale === "vi" ? "Khóa học" : "Course",
    locale === "vi" ? "Khóa học tiên quyết" : "Prerequisite courses",
  ]

  return (
    <>
      <Button
        icon={<PiPathBold size={20}/>}
        variant="default"
        onClick={() => setDialogOpen(true)}
      >
        {buttonLabel || (locale === "vi" ? "Lộ trình học" : "Learning Path")}
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0">
          <div className="flex max-h-[90vh] flex-col">
            <DialogHeader className="px-6 pt-6">
              <DialogTitle>
                {locale === "vi" ? "Lộ trình học" : "Learning Path"}
              </DialogTitle>
              <DialogDescription>
                {locale === "vi"
                  ? "Xem danh sách khóa học và các khóa học tiên quyết."
                  : "View courses and their prerequisite courses."}
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {isCoursesLoading ? (
                <div className="flex min-h-40 items-center justify-center">
                  <Spinner className="h-5 w-5" />
                </div>
              ) : isCoursesError ? (
                <Empty>
                  <p className="text-sm text-muted-foreground">
                    {coursesError.response?.data?.message ||
                      coursesError.message ||
                      (locale === "vi"
                        ? "Không thể tải danh sách khóa học."
                        : "Unable to load courses.")}
                  </p>
                </Empty>
              ) : courses.length === 0 ? (
                <EmptyState
                  title={
                    locale === "vi"
                      ? "Chưa có khóa học."
                      : "No courses available."
                  }
                />
              ) : (
                <TableCustom
                  headers={headers}
                  data={courses}
                  renderRow={(course) => {
                    const courseTitle = locale === "vi"
                      ? course.currentVersion?.titleVN || course.currentVersion?.titleEN || course.courseID
                      : course.currentVersion?.titleEN || course.currentVersion?.titleVN || course.courseID
                    const courseImage = course.currentVersion?.imageUrl || "/images/club-placeholder.jpg"

                    return (
                      <>
                        <TableCell>
                          <div className="flex items-start gap-3">
                            <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded border border-greyscale-700">
                              <Image
                                src={courseImage}
                                alt={courseTitle}
                                fill
                                className="object-cover"
                              />
                            </div>

                            <div className="space-y-2">
                              <p className="font-medium text-greyscale-0">{courseTitle}</p>
                              {course.level ? <CourseLevelBadge level={course.level} /> : null}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          {course.prerequisiteCourses.length === 0 ? (
                            <span className="text-sm text-greyscale-100">
                              {locale === "vi"
                                ? "Không có khóa học tiên quyết"
                                : "No prerequisite courses"}
                            </span>
                          ) : (
                            <div className="space-y-2">
                              {course.prerequisiteCourses.map((prerequisiteCourse) => {
                                const prerequisiteTitle = locale === "vi"
                                  ? prerequisiteCourse.titleVN || prerequisiteCourse.titleEN || prerequisiteCourse.courseID
                                  : prerequisiteCourse.titleEN || prerequisiteCourse.titleVN || prerequisiteCourse.courseID

                                return (
                                  <div
                                    key={prerequisiteCourse.courseID}
                                    className="rounded-md border border-greyscale-700 bg-greyscale-800/70 px-3 py-3"
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded border border-greyscale-700">
                                        <Image
                                          src={prerequisiteCourse.imageUrl || "/images/club-placeholder.jpg"}
                                          alt={prerequisiteTitle}
                                          fill
                                          className="object-cover"
                                        />
                                      </div>

                                      <div className="min-w-0 flex-1">
                                        <p className="font-medium text-greyscale-0">{prerequisiteTitle}</p>
                                        {prerequisiteCourse.level ? (
                                          <div className="mt-2">
                                            <CourseLevelBadge level={prerequisiteCourse.level} />
                                          </div>
                                        ) : null}
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </TableCell>
                      </>
                    )
                  }}
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
