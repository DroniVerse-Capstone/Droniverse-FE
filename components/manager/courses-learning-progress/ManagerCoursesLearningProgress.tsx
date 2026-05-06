"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useGetClubEnrollments } from "@/hooks/enrollment/useClubEnrollment";
import { useParams } from "next/navigation";
import { TableCustom } from "@/components/common/TableCustom";
import { TableCell } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLocale, useTranslations } from "@/providers/i18n-provider";
import { IoEyeOutline, IoSearchOutline, IoFilterOutline } from "react-icons/io5";
import { cn } from "@/lib/utils";
import ManagerLearningPathDialog from "./ManagerLearningPathDialog";
import { ClubEnrollment } from "@/validations/enrollment/club-enrollment";

function isUUID(str: string) {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

export default function ManagerCoursesLearningProgress() {
  const params = useParams<{ id?: string; clubSlug?: string }>();
  const rawId = params?.id || params?.clubSlug;

  // Extract UUID if the ID is a slug (e.g., name-uuid)
  const clubId = React.useMemo(() => {
    if (!rawId) return "";
    if (isUUID(rawId)) return rawId;

    // Try to extract UUID from the end of the slug
    const parts = rawId.split("-");
    if (parts.length >= 5) {
      const potentialUuid = parts.slice(-5).join("-");
      if (isUUID(potentialUuid)) return potentialUuid;
    }

    return rawId;
  }, [rawId]);

  const locale = useLocale();

  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEnrollment, setSelectedEnrollment] = useState<{ id: string; name: string } | null>(null);

  const { data, isLoading } = useGetClubEnrollments({
    clubId: clubId || "",
    pageIndex,
    pageSize,
  });

  const filteredData = data?.data.filter(item =>
    item.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.courseNameVN.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.courseNameEN.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const t = useTranslations("ManagerLearningProgress");

  const headers = [
    t("table.member"),
    t("table.course"),
    t("table.level"),
    t("table.progress"),
    t("table.status"),
    t("table.actions"),
  ];

  const renderRow = (item: ClubEnrollment) => (
    <>
      <TableCell className="py-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-white/[0.08]">
            <AvatarImage src={item.user.avatarUrl || ""} alt={item.user.fullName} />
            <AvatarFallback className="bg-white/[0.05] text-[#7a8090]">
              {item.user.fullName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-bold text-white leading-tight">{item.user.fullName}</p>
            <p className="text-[11px] text-[#5a6070] mt-0.5">{item.user.email}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="max-w-[200px]">
          <p className="text-sm font-medium text-white line-clamp-1">
            {locale === "vi" ? item.courseNameVN : item.courseNameEN}
          </p>
          <p className="text-[11px] text-[#5a6070] mt-0.5">{item.estimatedDuration} {t("detail.minutes")}</p>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="bg-white/[0.03] border-white/[0.08] text-[#7a8090] font-bold text-[10px] uppercase">
          {t(`levels.${item.level.name}`) || item.level.name}
        </Badge>
      </TableCell>
      <TableCell className="w-[180px]">
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] font-bold">
            <span className="text-[#5a6070]">{t("table.progress").toUpperCase()}</span>
            <span className="text-white">{Math.round(item.progress)}%</span>
          </div>
          <Progress value={item.progress} className="h-1.5 bg-white/[0.06]" />
        </div>
      </TableCell>
      <TableCell>
        <Badge className={cn(
          "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase",
          item.enrollStatus === "COMPLETED"
            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
        )}>
          {t(`statuses.${item.enrollStatus}`) || item.enrollStatus}
        </Badge>
      </TableCell>
      <TableCell>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-white/[0.05] text-[#7a8090] hover:text-white"
          onClick={() => setSelectedEnrollment({ id: item.enrollmentId, name: item.user.fullName })}
        >
          <IoEyeOutline size={18} />
        </Button>
      </TableCell>
    </>
  );

  // Mock summary data based on current page (in real app, BE would provide this)
  const totalStudents = data?.totalRecords || 0;
  const completedCount = data?.data.filter(i => i.enrollStatus === "COMPLETED").length || 0;
  const avgProgress = data?.data.length ? data.data.reduce((acc, curr) => acc + curr.progress, 0) / data.data.length : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {t("title")}
          </h2>
          <p className="text-sm text-[#7a8090] mt-1">
            {t("subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative group">
            <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a6070] group-focus-within:text-primary transition-colors" />
            <Input
              placeholder={t("searchPlaceholder")}
              className="pl-10 h-10 w-full md:w-[300px] bg-[#181b22] border-white/[0.07] text-white focus:border-primary/50 focus:ring-primary/20 placeholder:text-[#4a5060]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="h-10 bg-[#181b22] border-white/[0.07] text-[#7a8090] hover:bg-[#1e2130] hover:text-white">
            <IoFilterOutline className="mr-2" /> {t("filter")}
          </Button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiSummaryCard
          label={t("kpi.totalEnrollments")}
          value={totalStudents.toString()}
          sub={t("kpi.totalEnrollmentsSub")}
          index={0}
        />
        <KpiSummaryCard
          label={t("kpi.avgProgress")}
          value={`${Math.round(avgProgress)}%`}
          sub={t("kpi.avgProgressSub")}
          index={1}
        />
        <KpiSummaryCard
          label={t("kpi.completed")}
          value={completedCount.toString()}
          sub={t("kpi.completedSub")}
          index={2}
          isSuccess
        />
      </div>

      {/* Table Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-[#181b22] rounded-2xl border border-white/[0.07] overflow-hidden"
      >
        <div className="p-1">
          <TableCustom
            headers={headers}
            data={filteredData}
            renderRow={renderRow}
            pagination={{
              currentPage: pageIndex,
              pageSize: pageSize,
              totalItems: data?.totalRecords || 0,
              onPageChange: setPageIndex,
            }}
          />
        </div>
      </motion.div>

      <ManagerLearningPathDialog
        enrollmentId={selectedEnrollment?.id || null}
        userName={selectedEnrollment?.name || ""}
        onClose={() => setSelectedEnrollment(null)}
      />
    </div>
  );
}

function KpiSummaryCard({ label, value, sub, index, isSuccess }: {
  label: string;
  value: string;
  sub: string;
  index: number;
  isSuccess?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="bg-[#181b22] rounded-2xl p-6 border border-white/[0.07] relative overflow-hidden group"
    >
      <div className={cn(
        "absolute top-0 right-0 w-24 h-24 blur-3xl opacity-10 transition-opacity group-hover:opacity-20",
        isSuccess ? "bg-emerald-500" : "bg-blue-500"
      )} />

      <p className="text-[11px] text-[#7a8090] font-bold uppercase tracking-wider">{label}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <p className="text-3xl font-black text-white tracking-tight">{value}</p>
      </div>
      <p className="text-[11px] text-[#4a5060] mt-1 font-medium">{sub}</p>
    </motion.div>
  );
}
