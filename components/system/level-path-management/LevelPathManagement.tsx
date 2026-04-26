"use client"

import React, { useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"

import CourseLevelBadge from "@/components/course/CourseLevelBadge"
import PrerequisiteCourseSelectItem from "@/components/course/PrerequisiteCourseSelectItem"
import CommonDropdown from "@/components/common/CommonDropdown"
import EmptyState from "@/components/common/EmptyState"
import { TableCustom } from "@/components/common/TableCustom"
import { Button } from "@/components/ui/button"
import { Empty } from "@/components/ui/empty"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { TableCell } from "@/components/ui/table"
import { useGetCourses } from "@/hooks/course/useCourse"
import { useGetDrones } from "@/hooks/drone/useDrone"
import { useAddLevelCourse, useGetLevelPath } from "@/hooks/level/useLevel"
import { useLocale } from "@/providers/i18n-provider"
import type { Course } from "@/validations/course/course"
import type { LevelPath } from "@/validations/level/level"

export default function LevelPathManagement() {
  const locale = useLocale()
  const [selectedDroneId, setSelectedDroneId] = useState("")
  const [courseSearch, setCourseSearch] = useState("")
  const [levelCourseDialogOpen, setLevelCourseDialogOpen] = useState(false)
  const [activeLevelPath, setActiveLevelPath] = useState<LevelPath | null>(null)
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([])

  const {
    data: drones = [],
    isLoading: isDronesLoading,
    isError: isDronesError,
    error: dronesError,
  } = useGetDrones()

  const {
    data: levelPaths = [],
    isLoading: isLevelPathsLoading,
    isError: isLevelPathsError,
    error: levelPathsError,
  } = useGetLevelPath(selectedDroneId || undefined)

  const {
    data: droneCoursesData,
    isLoading: isCoursesLoading,
    isError: isCoursesError,
    error: coursesError,
  } = useGetCourses({
    droneId: selectedDroneId || undefined,
    pageIndex: 1,
    pageSize: 1000,
    status: "PUBLISH",
    enabled: Boolean(selectedDroneId) && levelCourseDialogOpen,
  })

  const addLevelCourseMutation = useAddLevelCourse()

  useEffect(() => {
    if (!selectedDroneId && drones.length > 0) {
      setSelectedDroneId(drones[0].droneID)
    }
  }, [drones, selectedDroneId])

  const isWaitingForInitialDroneSelection = !selectedDroneId && drones.length > 0
  const selectedDrone = drones.find((drone) => drone.droneID === selectedDroneId)
  const droneCourses = droneCoursesData?.data ?? []
  const currentLevelId = activeLevelPath?.level.levelID || activeLevelPath?.level.levelId || ""
  const currentLevelName = activeLevelPath?.level.name || ""

  const droneOptions = drones.map((drone) => ({
    value: drone.droneID,
    label: locale === "vi" ? drone.droneNameVN : drone.droneNameEN,
    description:
      locale === "vi"
        ? `${drone.droneTypeNameVN} • ${drone.manufacturer}`
        : `${drone.droneTypeNameEN} • ${drone.manufacturer}`,
  }))

    const headers = [
      locale === "vi" ? "Cấp độ" : "Level",
      locale === "vi" ? "Điều kiện thăng cấp" : "Promotion criteria",
      locale === "vi" ? "Thao tác" : "Actions",
    ]

    const filteredCourses = useMemo<Course[]>(() => {
      const search = courseSearch.trim().toLowerCase()

      if (!search) {
        return droneCourses
      }

      return droneCourses.filter((course) => {
        const title = locale === "vi"
          ? course.currentVersion?.titleVN || course.currentVersion?.titleEN || course.courseID
          : course.currentVersion?.titleEN || course.currentVersion?.titleVN || course.courseID

        return [
          title,
          course.courseID,
          course.level?.name,
          course.level?.levelNumber?.toString(),
        ]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(search))
      })
    }, [courseSearch, droneCourses, locale])

    const openChangeDialog = (levelPath: LevelPath) => {
      setActiveLevelPath(levelPath)
      setSelectedCourseIds(levelPath.courses.map((course) => course.courseID))
      setCourseSearch("")
      setLevelCourseDialogOpen(true)
    }

    const closeChangeDialog = () => {
      if (addLevelCourseMutation.isPending) {
        return
      }

      setLevelCourseDialogOpen(false)
      setActiveLevelPath(null)
      setSelectedCourseIds([])
      setCourseSearch("")
    }

    const toggleCourseSelection = (courseId: string) => {
      setSelectedCourseIds((current) =>
        current.includes(courseId)
          ? current.filter((id) => id !== courseId)
          : [...current, courseId],
      )
    }

    const handleSaveLevelCourses = async () => {
      const levelId = currentLevelId

      if (!levelId) {
        toast.error(locale === "vi" ? "Không tìm thấy level." : "Level not found.")
        return
      }

      try {
        const response = await addLevelCourseMutation.mutateAsync({
          levelId,
          data: {
            courseIds: selectedCourseIds,
          },
        })

        toast.success(response.message || (locale === "vi" ? "Đã cập nhật khóa học." : "Courses updated."))
        closeChangeDialog()
      } catch (error) {
        const axiosError = error as { response?: { data?: { message?: string } }; message?: string }
        toast.error(
          axiosError.response?.data?.message ||
            axiosError.message ||
            (locale === "vi" ? "Không thể cập nhật khóa học." : "Unable to update courses."),
        )
      }
    }

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
            ? "Chưa có drone nào để lọc lộ trình thăng cấp."
            : "No drones available to filter level paths."
        }
      />
    )
  }

  if (isLevelPathsError) {
    return (
      <Empty>
        <p className="text-sm text-muted-foreground">
          {levelPathsError.response?.data?.message ||
            levelPathsError.message ||
            (locale === "vi"
              ? "Không thể tải lộ trình thăng cấp."
              : "Unable to load level paths.")}
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
              {locale === "vi" ? "Quản lý cấp độ" : "Level path management"}
            </h1>
            <p className="text-sm text-greyscale-100">
              {locale === "vi"
                ? "Chọn một drone để xem các cấp độ và điều kiện thăng cấp."
                : "Choose a drone to view its levels and promotion criteria."}
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

      {isLevelPathsLoading || isWaitingForInitialDroneSelection ? (
        <div className="flex min-h-40 items-center justify-center">
          <Spinner className="h-5 w-5" />
        </div>
      ) : levelPaths.length === 0 ? (
        <EmptyState
          title={
            locale === "vi"
              ? "Drone này chưa có điều kiện thăng cấp."
              : "This drone has no promotion criteria yet."
          }
          description={
            locale === "vi"
              ? "Hãy chọn drone khác hoặc thêm điều kiện thăng cấp cho drone hiện tại."
              : "Try another drone or add promotion criteria for the selected drone."
          }
        />
      ) : (
        <TableCustom
          headers={headers}
          data={levelPaths}
          renderRow={(levelPath) => {
            const levelId = levelPath.level.levelID || levelPath.level.levelId || ""

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
                        const title = locale === "vi"
                          ? course.currentVersion?.titleVN || course.currentVersion?.titleEN || course.courseID
                          : course.currentVersion?.titleEN || course.currentVersion?.titleVN || course.courseID

                        return (
                          <div
                            key={course.courseID}
                            className="rounded-md border border-greyscale-700 bg-greyscale-800/70 px-3 py-2"
                          >
                            <div className="flex items-start gap-3">
                              <div className="min-w-0 flex-1 space-y-1">
                                <p className="font-medium text-greyscale-0">{title}</p>
                              </div>
                              {course.level ? <CourseLevelBadge level={course.level} /> : null}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="viewIcon"
                      onClick={() => openChangeDialog(levelPath)}
                    >
                      {locale === "vi" ? "Thay đổi" : "Change"}
                    </Button>
                  </div>
                </TableCell>
              </>
            )
          }}
        />
      )}

      <Dialog open={levelCourseDialogOpen} onOpenChange={(open) => (open ? setLevelCourseDialogOpen(true) : closeChangeDialog())}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
          <div className="flex max-h-[90vh] flex-col">
            <DialogHeader className="px-6 pt-6">
              <DialogTitle>
                {locale === "vi" ? "Thay đổi điều kiện thăng cấp" : "Change promotion criteria"}
              </DialogTitle>
              <DialogDescription>
                {locale === "vi"
                  ? "Chọn các khóa học của drone hiện tại để tạo điều kiện thăng cấp."
                  : "Select courses from the current drone to create promotion criteria."}
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded border border-greyscale-700 bg-greyscale-900 px-3 py-2 text-sm text-greyscale-100">
                  <div className="text-xs uppercase tracking-wide text-greyscale-300">
                    {locale === "vi" ? "Cấp độ hiện tại" : "Current level"}
                  </div>
                  <div className="mt-2 font-medium text-greyscale-0">
                    {currentLevelName ? <CourseLevelBadge level={currentLevelName} /> : (locale === "vi" ? "Chưa chọn" : "Not selected")}
                  </div>
                </div>

                <div className="rounded border border-greyscale-700 bg-greyscale-900 px-3 py-2 text-sm text-greyscale-100">
                  <div className="text-xs uppercase tracking-wide text-greyscale-300">
                    {locale === "vi" ? "Drone" : "Drone"}
                  </div>
                  <div className="mt-1 font-medium text-greyscale-0">
                    {selectedDrone ? (locale === "vi" ? selectedDrone.droneNameVN : selectedDrone.droneNameEN) : "-"}
                  </div>
                </div>
              </div>

              <Input
                value={courseSearch}
                onChange={(event) => setCourseSearch(event.target.value)}
                placeholder={locale === "vi" ? "Tìm khóa học..." : "Search courses..."}
              />

              <div className="max-h-96 space-y-2 overflow-y-auto rounded border border-greyscale-700 p-2">
                {isCoursesLoading ? (
                  <div className="flex min-h-32 items-center justify-center">
                    <Spinner className="h-5 w-5" />
                  </div>
                ) : isCoursesError ? (
                  <p className="px-2 py-3 text-sm text-greyscale-100">
                    {coursesError.response?.data?.message ||
                      coursesError.message ||
                      (locale === "vi"
                        ? "Không thể tải danh sách khóa học của drone."
                        : "Unable to load drone courses.")}
                  </p>
                ) : filteredCourses.length === 0 ? (
                  <p className="px-2 py-3 text-sm text-greyscale-100">
                    {locale === "vi"
                      ? "Không có khóa học phù hợp cho drone này."
                      : "No matching courses for this drone."}
                  </p>
                ) : (
                  filteredCourses.map((course: Course) => {
                    const title = locale === "vi"
                      ? course.currentVersion?.titleVN || course.currentVersion?.titleEN || course.courseID
                      : course.currentVersion?.titleEN || course.currentVersion?.titleVN || course.courseID

                    return (
                      <PrerequisiteCourseSelectItem
                        key={course.courseID}
                        course={course as Course}
                        title={title}
                        selected={selectedCourseIds.includes(course.courseID)}
                        disabled={addLevelCourseMutation.isPending}
                        onToggle={toggleCourseSelection}
                      />
                    )
                  })
                )}
              </div>

              <p className="text-sm text-greyscale-100">
                {locale === "vi"
                  ? `Đã chọn ${selectedCourseIds.length} khóa học`
                  : `${selectedCourseIds.length} courses selected`}
              </p>
            </div>

            <DialogFooter className="flex-row justify-end gap-3 border-t border-greyscale-700 px-6 py-4 sm:space-x-0">
              <Button type="button" variant="outline" onClick={closeChangeDialog} disabled={addLevelCourseMutation.isPending}>
                {locale === "vi" ? "Hủy" : "Cancel"}
              </Button>
              <Button type="button" onClick={handleSaveLevelCourses} disabled={addLevelCourseMutation.isPending || !currentLevelId}>
                {addLevelCourseMutation.isPending
                  ? locale === "vi"
                    ? "Đang lưu..."
                    : "Saving..."
                  : locale === "vi"
                    ? "Lưu thay đổi"
                    : "Save changes"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}
