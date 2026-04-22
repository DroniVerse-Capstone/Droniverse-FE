"use client";

import Image from "next/image";
import { IoPeopleOutline } from "react-icons/io5";

import ClubStatusBadge from "@/components/club/ClubStatusBadge";
import { Club } from "@/validations/club/club";
import { useLocale, useTranslations } from "@/providers/i18n-provider";

type ClubCardProps = {
  club: Club;
  onClick?: () => void;
};

export default function ClubCard({ club, onClick }: ClubCardProps) {
  const t = useTranslations("ClubDashboard");
  const locale = useLocale();

  const clubName = locale === "en" ? club.nameEN || club.nameVN : club.nameVN;

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer overflow-hidden rounded border border-greyscale-700 bg-greyscale-900 p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-greyscale-500 hover:bg-greyscale-800"
    >
      <div className="relative h-44 overflow-hidden rounded-md">
        <Image
          src={club.imageUrl || "/images/club-placeholder.jpg"}
          alt={clubName}
          fill
          className="rounded object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="mt-3 space-y-3.5">
        <div className="mb-1 flex items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-wide text-greyscale-100">
            {club.clubCode}
          </p>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded bg-secondary/15 px-2.5 py-1 text-secondary border border-secondary/40 flex items-center gap-1">
              <IoPeopleOutline size={15} />
              {club.totalMembers}/{club.limitParticipation}
            </span>
            <ClubStatusBadge status={club.status} />
          </div>
        </div>

        <h3 className="line-clamp-2 text-base font-semibold text-greyscale-0">
          {clubName}
        </h3>

        <div className="grid gap-3 rounded border border-greyscale-700/80 bg-greyscale-900/60 p-3">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-greyscale-200">
              {locale === "en" ? "Required drone" : "Drone yêu cầu"}
            </p>
            {club.drone ? (
              <div className="mt-2 flex items-center gap-3">
                <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded border border-greyscale-700">
                  <Image
                    src={club.drone.imgURL || "/images/drone-placeholder.jpg"}
                    alt={
                      locale === "en"
                        ? club.drone.droneNameEN || club.drone.droneNameVN
                        : club.drone.droneNameVN
                    }
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="space-y-0.5">
                  <p className="line-clamp-2 text-sm text-greyscale-50">
                    {locale === "en"
                      ? club.drone.droneNameEN || club.drone.droneNameVN
                      : club.drone.droneNameVN}
                  </p>
                  <p className="text-xs text-greyscale-100">
                    {locale === "vi"
                      ? club.drone.droneTypeNameVN
                      : club.drone.droneTypeNameEN}
                  </p>
                </div>
              </div>
            ) : (
              <p className="mt-1 text-sm text-greyscale-400">
                {locale === "en" ? "No drone assigned" : "Chưa có Drone"}
              </p>
            )}
          </div>

          <div className="border-t border-greyscale-700/80 pt-2">
            <p className="text-[11px] uppercase tracking-wide text-greyscale-200">
              {locale === "en" ? "Managed by" : "Quản lý bởi"}
            </p>
            {club.creator ? (
              <p className="mt-1 text-sm text-greyscale-50">
                {club.creator.username}
                <span className="mx-1 text-greyscale-500">•</span>
                <span className="text-greyscale-200">{club.creator.email}</span>
              </p>
            ) : (
              <p className="mt-1 text-sm text-greyscale-400">
                {locale === "en" ? "No manager" : "Chưa có quản lý"}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
