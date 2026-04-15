"use client";

import React from "react";
import Image from "next/image";
import { IoPeople } from "react-icons/io5";
import { RiRefreshLine } from "react-icons/ri";
import { Star } from "lucide-react";

import CourseLevelBadge from "@/components/course/CourseLevelBadge";
import { formatDate } from "@/lib/utils/format-date";

type CourseOverviewHeroProps = {
  title: string;
  description: string;
  level: "EASY" | "MEDIUM" | "HARD";
  estimatedDuration: number;
  averageRating: number;
  totalLearners: number;
  authorName: string;
  lastUpdatedAt: string | null;
  imageUrl: string | null;
};

export default function CourseOverviewHero({
  title,
  description,
  level,
  estimatedDuration,
  averageRating,
  totalLearners,
  authorName,
  lastUpdatedAt,
  imageUrl,
}: CourseOverviewHeroProps) {
  return (
    <section className="rounded bg-linear-120 from-greyscale-900 to-greyscale-700 p-6">
      <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[minmax(0,1fr)_500px]">
        <div className="space-y-4">
          <h1 className="text-3xl leading-tight font-semibold text-greyscale-0">{title}</h1>

          <p className="text-base font-regular text-greyscale-0">{description}</p>

          <div className="flex flex-wrap items-center gap-2">
            <CourseLevelBadge level={level} className="text-sm" />
            <span className="inline-flex rounded border-2 border-tertiary bg-tertiary/15 px-3 py-1 text-sm font-semibold text-tertiary">
              {estimatedDuration} phút
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-sm text-greyscale-25">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{averageRating.toFixed(1)}</span>
              <span className="flex items-center gap-1 text-yellow-400">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star key={idx} className="h-4 w-4 fill-current" />
                ))}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <IoPeople className="text-primary" />
              <span className="font-semibold">{totalLearners} đã học</span>
            </div>
          </div>

          <p className="text-sm text-greyscale-25">
            Tác giả: <span className="font-semibold text-primary">{authorName}</span>
          </p>

          <p className="flex items-center gap-2 text-sm text-greyscale-25">
            <RiRefreshLine className="text-greyscale-100" />
            Cập nhật gần nhất {formatDate(lastUpdatedAt)}
          </p>
        </div>

        <div className="relative h-60 overflow-hidden rounded border border-greyscale-700">
          <Image
            src={imageUrl || "/images/club-placeholder.jpg"}
            alt={title}
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
    </section>
  );
}
