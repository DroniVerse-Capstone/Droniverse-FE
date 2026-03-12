"use client";

import Image from "next/image";
import { IoPeopleOutline } from "react-icons/io5";
import { CiLock, CiUnlock } from "react-icons/ci";

import ClubStatusBadge from "@/components/common/ClubStatusBadge";
import { Club } from "@/validations/club/club";
import { useLocale, useTranslations } from "@/providers/i18n-provider";

type ClubCardProps = {
  club: Club;
  onClick?: () => void;
};

export default function ClubCard({ club, onClick }: ClubCardProps) {
  const t = useTranslations("ClubDashboard");
  const locale = useLocale();

  const clubName = locale === "en" ? (club.nameEN || club.nameVN) : club.nameVN;

  return (
    <div
      onClick={onClick}
      className="group overflow-hidden rounded border border-greyscale-700 bg-transparent p-4 shadow-sm transition-colors hover:bg-greyscale-800 cursor-pointer"
    >
      <div className="relative h-45 overflow-hidden rounded">
        <Image
          src={club.image || "/images/club-placeholder.jpg"}
          alt={clubName}
          fill
          className="rounded object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="mt-3 space-y-3">
        <div className="flex items-center justify-between gap-3 mb-1">
          <p className="text-xs uppercase tracking-wide text-greyscale-100">
            {club.clubCode}
          </p>

          <ClubStatusBadge status={club.status} />
        </div>

        <h3 className="line-clamp-2 text-base font-semibold text-greyscale-0">
          {clubName}
        </h3>

        <div className="flex flex-wrap gap-2 text-xs">
          <span
            className={`rounded px-2.5 py-1 border flex items-center gap-1 ${
              club.isPublic
                ? "bg-secondary/15 text-secondary border-secondary/40"
                : "bg-primary/15 text-primary border-primary/40"
            }`}
          >
            {club.isPublic ? (
              <CiUnlock size={15} />
            ) : (
              <CiLock size={15} />
            )}
            {club.isPublic ? t("privacy.public") : t("privacy.private")}
          </span>
          <span className="rounded bg-secondary/15 px-2.5 py-1 text-secondary border border-secondary/40 flex items-center gap-1">
            <IoPeopleOutline size={15} />
            {club.totalMembers}/{club.limitParticipation}
          </span>
        </div>

        {club.categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {club.categories.slice(0, 3).map((category) => (
              <span
                key={category.categoryId}
                className="rounded px-2.5 py-1 text-xs text-greyscale-100 border-greyscale-600 border"
              >
                {locale === "en" ? (category.typeNameEN || category.typeNameVN) : category.typeNameVN}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}