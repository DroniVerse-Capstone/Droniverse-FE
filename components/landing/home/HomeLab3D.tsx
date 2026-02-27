"use client";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { useTranslations } from "@/providers/i18n-provider";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

const features = [
  { key: "card1" },
  { key: "card2" },
  { key: "card3" },
  { key: "card4" },
];

export default function HomeLab3D() {
  const router = useRouter();
  const t = useTranslations("Home.lab");
  return (
    <section>
      <div className="mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12 items-center">
          {/* Left Content */}
          <div className="md:col-span-2 flex flex-col gap-4 md:gap-6">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-greyscale-0">
              {t("title")}
            </h1>
            <p className="text-sm md:text-base text-greyscale-100">
              {t("description")}
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              {features.map((feature) => (
                <GlassCard key={feature.key}>{t(feature.key)}</GlassCard>
              ))}
            </div>

            <div className="mt-2">
              <Button 
                onClick={() => router.push("/auth/login")}
                className="w-full sm:w-auto"
              >
                {t("cta")}
              </Button>
            </div>
          </div>

          {/* Right Image */}
          <div className="md:col-span-3 w-full h-[300px] md:h-[400px] lg:h-[450px] relative">
            <Image
              src="/images/lab3d.png"
              fill
              className="rounded object-fill"
              alt="Lab 3D"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
