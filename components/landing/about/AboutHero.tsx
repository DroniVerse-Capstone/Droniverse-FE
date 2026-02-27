"use client";
import { useTranslations } from "@/providers/i18n-provider";
import Image from "next/image";
import React from "react";

export default function AboutHero() {
  const t = useTranslations("About.hero");
  return (
    <section className="min-h-[500px] md:min-h-[600px] py-12 md:py-16">
      <div className="mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-4 md:space-y-6">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-greyscale-0 leading-tight">
              {t("title")}
            </h1>
            <p className="text-lg md:text-lg text-greyscale-100 leading-relaxed">
              {t("description1")}
            </p>
            <p className="text-lg md:text-lg text-greyscale-100 leading-relaxed">
              {t("description2")}
            </p>
            <p className="text-lg md:text-lg text-greyscale-100 leading-relaxed">
              {t("description3")}
            </p>
          </div>

          {/* Right Image */}
          <div className="w-full h-[300px] md:h-[400px] lg:h-[500px] relative">
            <Image
              src="/images/about.avif"
              fill
              className="object-cover rounded"
              alt="Community"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
