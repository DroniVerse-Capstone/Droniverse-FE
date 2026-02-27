"use client";
import { useTranslations } from "@/providers/i18n-provider";
import Image from "next/image";
import React from "react";

export default function AboutMission() {
  const t = useTranslations("About.mission");

  const features = [
    t("feature.feature1"),
    t("feature.feature2"),
    t("feature.feature3"),
  ];

  return (
    <section>
      <div className="mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 items-center">
          {/* Left Content */}
          <div className="space-y-6 md:space-y-6">
            <h2 className="text-3xl md:text-4xl lg:text-[40px] font-semibold text-greyscale-0">
              {t("title")}
            </h2>
            
            <p className="text-base text-greyscale-100 leading-relaxed">
              {t("description")}
            </p>

            <div className="space-y-6">
              <p className="text-base text-greyscale-100 font-medium">
                {t("feature.title")}
              </p>
              
              <div className="space-y-2 border-l-4 border-secondary-300 pl-4 md:pl-6">
                {features.map((feature, index) => (
                  <p
                    key={index}
                    className="text-base text-greyscale-25 leading-relaxed"
                  >
                    {feature}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="w-full h-[400px] md:h-[350px] lg:h-[350px] relative rounded overflow-hidden">
            <Image
              src="/images/mission.avif"
              fill
              className="object-cover"
              alt="Mission - Community hands together"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
