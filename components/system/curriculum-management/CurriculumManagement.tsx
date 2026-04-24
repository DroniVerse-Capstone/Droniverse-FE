"use client"

import Image from "next/image"
import React, { useEffect, useState } from "react"

import CourseLevelBadge from "@/components/course/CourseLevelBadge"
import CommonDropdown from "@/components/common/CommonDropdown"
import EmptyState from "@/components/common/EmptyState"
import { TableCustom } from "@/components/common/TableCustom"
import { Empty } from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { TableCell } from "@/components/ui/table"
import { useGetCourses } from "@/hooks/course/useCourse"
import { useGetDrones } from "@/hooks/drone/useDrone"
import { useLocale } from "@/providers/i18n-provider"

export default function CurriculumManagement() {
  const locale = useLocale()
  const [selectedDroneId, setSelectedDroneId] = useState("")

  const {
    data: drones = [],
    isLoading: isDronesLoading,
    isError: isDronesError,
    error: dronesError,
  } = useGetDrones({ status: "Active" })

  const {
    data: coursesData,
    isLoading: isCoursesLoading,
    isError: isCoursesError,
    error: coursesError,
  } = useGetCourses({
    droneId: selectedDroneId || undefined,
    pageIndex: 1,
    pageSize: 1000,
    status: "PUBLISH",
    enabled: Boolean(selectedDroneId),
  })

  useEffect(() => {
    if (!selectedDroneId && drones.length > 0) {
      setSelectedDroneId(drones[0].droneID)
    }
  }, [drones, selectedDroneId])

  const isWaitingForInitialDroneSelection = !selectedDroneId && drones.length > 0
  const selectedDrone = drones.find((drone) => drone.droneID === selectedDroneId)
  const courses = coursesData?.data ?? []

  const droneOptions = drones.map((drone) => ({
    value: drone.droneID,
    label: locale === "vi" ? drone.droneNameVN : drone.droneNameEN,
    description:
      locale === "vi"
        ? `${drone.droneTypeNameVN} • ${drone.manufacturer}`
        : `${drone.droneTypeNameEN} • ${drone.manufacturer}`,
  }))

  const headers = [
    locale === "vi" ? "Khóa học" : "Course",
    locale === "vi" ? "Khóa học tiên quyết" : "Prerequisite courses",
  ]

  if (isDronesLoading) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <Spinner className="h-5 w-5" />
      </div>
    )
  }

  if (isDronesError) {
    return (
      <Empty>
        <p className="text-sm text-muted-foreground">
          {dronesError.response?.data?.message ||
            dronesError.message ||
            (locale === "vi"
              ? "Không thể tải danh sách drone."
              : "Unable to load drones.")}
        </p>
      </Empty>
    )
  }

  if (drones.length === 0) {
    return (
      <EmptyState
        title={
          locale === "vi"
            ? "Chưa có drone nào cho khung chương trình."
            : "No drones available for curriculum management."
        }
      />
    )
  }

  if (isCoursesError) {
    return (
      <Empty>
        <p className="text-sm text-muted-foreground">
          {coursesError.response?.data?.message ||
            coursesError.message ||
            (locale === "vi"
              ? "Không thể tải danh sách khóa học."
              : "Unable to load courses.")}
        </p>
      </Empty>
    )
  }

  return (
    <section className="space-y-5">
      <header className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-greyscale-0">
              {locale === "vi" ? "Khung chương trình" : "Curriculum management"}
            </h1>
            <p className="text-sm text-greyscale-100">
              {locale === "vi"
                ? "Xem danh sách khóa học và các khóa học tiên quyết theo từng drone."
                : "View courses and their prerequisite courses by drone."}
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:max-w-xl">
          <CommonDropdown
            value={selectedDroneId}
            onChange={setSelectedDroneId}
            options={droneOptions}
            label={locale === "vi" ? "Lọc theo drone" : "Filter by drone"}
            placeholder={locale === "vi" ? "Chọn drone" : "Select a drone"}
            menuLabel={locale === "vi" ? "Danh sách drone" : "Drone list"}
            emptyMessage={
              locale === "vi"
                ? "Không có drone khả dụng"
                : "No available drones"
            }
          />
        </div>
      </header>

      {isCoursesLoading || isWaitingForInitialDroneSelection ? (
        <div className="flex min-h-40 items-center justify-center">
          <Spinner className="h-5 w-5" />
        </div>
      ) : courses.length === 0 ? (
        <EmptyState
          title={
            locale === "vi"
              ? "Drone này chưa có khóa học."
              : "This drone has no courses yet."
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
    </section>
  )
}
