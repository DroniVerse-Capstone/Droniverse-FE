"use client";

import Image from "next/image";
import { PiCertificateBold } from "react-icons/pi";
import { Progress } from "@/components/ui/progress";
import CourseLevelBadge from "@/components/course/CourseLevelBadge";
import { UserEnrollment } from "@/validations/enrollment/user-enrollment";
import { div } from "three/src/nodes/math/OperatorNode.js";

type UserEnrollmentCardProps = {
  enrollment: UserEnrollment;
  onClick?: () => void;
};

export default function UserEnrollmentCard({
  enrollment,
  onClick,
}: UserEnrollmentCardProps) {
  const isCompleted = enrollment.enrollStatus === "COMPLETED";

  return (
    <article
      className="flex h-full flex-col overflow-hidden rounded border border-greyscale-700 bg-greyscale-900 p-4 shadow-sm transition-colors hover:bg-greyscale-800"
      onClick={onClick}
      onKeyDown={(event) => {
        if (!onClick) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="relative mb-3 h-42 overflow-hidden rounded border border-greyscale-700">
        <Image
          src={enrollment.imageUrl || "/images/club-placeholder.jpg"}
          alt={enrollment.courseNameVN}
          fill
          className="object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* <CourseLevelBadge level={enrollment.level} /> */}
          <span className="inline-flex rounded px-2 py-1 text-xs font-medium bg-tertiary/15 text-tertiary border-2 border-tertiary">
            {enrollment.estimatedDuration} phút
          </span>
        </div>

        <h3 className="min-h-12 line-clamp-2 text-base leading-6 font-semibold text-greyscale-0">
          {enrollment.courseNameVN}
        </h3>

        <div className="space-y-2 border-t border-greyscale-700 pt-2">
          {isCompleted ? (
            <div className="flex items-center justify-center w-full">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded 
  bg-secondary/10 text-secondary border border-secondary/30
  shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse"
              >
                <PiCertificateBold size={18} />
                <span className="font-semibold text-sm">
                  Bạn đã hoàn thành khóa học
                </span>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-greyscale-50">Tiến độ</span>
                <span className="text-sm font-semibold text-greyscale-0">
                  {Math.round(enrollment.progress)}%
                </span>
              </div>
              <Progress value={enrollment.progress} className="h-2" />
            </>
          )}
        </div>
      </div>
    </article>
  );
}

export type { UserEnrollmentCardProps };
