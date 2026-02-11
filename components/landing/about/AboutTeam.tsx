"use client";
import { useTranslations } from "@/providers/i18n-provider";
import Image from "next/image";
import React from "react";

interface TeamMember {
  name: string;
  role: string;
  subRole?: string;
  image: string;
  isLeader?: boolean;
}

export default function AboutTeam() {
  const t = useTranslations("About.team");

  const teamMembers: TeamMember[] = [
    {
      name: "Nguyễn Song Toàn",
      role: "LEADER",
      subRole: "BE Developer",
      image: "/images/team/toan.jpg",
      isLeader: true,
    },
    {
      name: "Tô Minh Tuyền",
      role: "BE Developer",
      image: "/images/team/tuyen.jpg",
    },
    {
      name: "Nguyễn Thế Trung",
      role: "BE Developer",
      image: "/images/team/trung.jpg",
    },
    {
      name: "Phạm Nguyên Khoa",
      role: "FE Developer",
      image: "/images/team/khoa.jpg",
    },
    {
      name: "Lê Minh Thống",
      role: "UI/UX Designer",
      subRole: "FE Developer",
      image: "/images/team/thong.jpg",
    },
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto px-4 md:px-8 ">
        {/* Title */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-[40px] font-semibold text-greyscale-0">
            {t("title")}
          </h2>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-10">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center space-y-2 group"
            >
              {/* Avatar */}
              <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden bg-greyscale-700 transition-transform duration-300 group-hover:scale-105">
                <Image
                  src={member.image}
                  fill
                  className="object-cover"
                  alt={member.name}
                />
              </div>

              {/* Name */}
              <h3 className="text-xl md:text-2xl font-semibold text-greyscale-0">
                {member.name}
              </h3>

              {/* Role */}
              <div className="space-y-2">
                <p
                  className={`text-base font-medium ${
                    member.isLeader ? "text-primary-200" : "text-greyscale-50"
                  }`}
                >
                  {member.role}
                </p>
                {member.subRole && (
                  <p className="text-base text-greyscale-50">
                    {member.subRole}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
