"use client";

import React from "react";
import { useParams } from "next/navigation";

import EmptyState from "@/components/common/EmptyState";
import ManagerCourseCodeDistributionTab from "@/components/manager/my-courses/management/ManagerCourseCodeDistributionTab";
import ManagerCourseCodesTab from "@/components/manager/my-courses/management/ManagerCourseCodesTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const UUID_SUFFIX_REGEX =
  /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function ManagerMyCourseManagement() {
  const params = useParams<{ clubSlug?: string; courseId?: string }>();
  const clubSlug = params?.clubSlug;
  const courseId = params?.courseId;

  const clubId = React.useMemo(() => {
    if (!clubSlug) {
      return undefined;
    }

    const uuidMatch = clubSlug.match(UUID_SUFFIX_REGEX);
    return uuidMatch?.[0];
  }, [clubSlug]);

  if (!clubId || !courseId) {
    return (
      <div className="px-6 py-4">
        <EmptyState title="Không tìm thấy thông tin khóa học." />
      </div>
    );
  }

  return (
    <div className="space-y-4 px-6 py-4">
      <Tabs defaultValue="code-management" className="w-full">
        <TabsList>
          <TabsTrigger value="code-management">Quản lý mã</TabsTrigger>
          <TabsTrigger value="code-distribution">Phân phát mã</TabsTrigger>
        </TabsList>

        <TabsContent value="code-management" className="mt-4">
          <ManagerCourseCodesTab clubId={clubId} courseId={courseId} />
        </TabsContent>

        <TabsContent value="code-distribution" className="mt-4">
          <ManagerCourseCodeDistributionTab clubId={clubId} courseId={courseId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
