"use client"

import React from "react"

import EmptyState from "@/components/common/EmptyState"
import { TableCustom } from "@/components/common/TableCustom"
import { Empty } from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { TableCell } from "@/components/ui/table"
import { useGetCategories } from "@/hooks/category/useCategory"
import { useLocale } from "@/providers/i18n-provider"
import { Category } from "@/validations/category/category"

import CreateCategoryDialog from "@/components/system/club-category/CreateCategoryDialog"
import DeleteCategoryDialog from "@/components/system/club-category/DeleteCategoryDialog"
import UpdateCategoryDialog from "@/components/system/club-category/UpdateCategoryDialog"

export default function ClubCategory() {
  const locale = useLocale()
  const { data, isLoading, isError, error } = useGetCategories()

  const categories = data ?? []

  const headers = [
    locale === "vi" ? "Tên danh mục (VI)" : "Category Name (VI)",
    locale === "vi" ? "Tên danh mục (EN)" : "Category Name (EN)",
    locale === "vi" ? "Mô tả (VI)" : "Description (VI)",
    locale === "vi" ? "Mô tả (EN)" : "Description (EN)",
    locale === "vi" ? "Thao tác" : "Actions",
  ]

  if (isLoading) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <Spinner className="h-5 w-5" />
      </div>
    )
  }

  if (isError) {
    return (
      <Empty>
        <p className="text-sm text-muted-foreground">
          {error.response?.data?.message ||
            error.message ||
            (locale === "vi"
              ? "Không thể tải danh sách danh mục."
              : "Unable to load categories.")}
        </p>
      </Empty>
    )
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-end">
        <CreateCategoryDialog />
      </div>

      {categories.length === 0 ? (
        <EmptyState
          title={
            locale === "vi" ? "Chưa có danh mục nào." : "No categories available."
          }
        />
      ) : (
        <TableCustom
          headers={headers}
          data={categories}
          renderRow={(category: Category) => (
            <>
              <TableCell className="text-greyscale-25">{category.typeNameVN}</TableCell>
              <TableCell className="text-greyscale-25">{category.typeNameEN}</TableCell>
              <TableCell className="max-w-80 text-greyscale-50">
                <p className="line-clamp-2">{category.descriptionVN}</p>
              </TableCell>
              <TableCell className="max-w-80 text-greyscale-50">
                <p className="line-clamp-2">{category.descriptionEN}</p>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <UpdateCategoryDialog category={category} />
                  <DeleteCategoryDialog category={category} />
                </div>
              </TableCell>
            </>
          )}
        />
      )}
    </section>
  )
}
