"use client";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/providers/i18n-provider";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

export default function HomeCommunity() {
  const router = useRouter();
  const t = useTranslations("Home.community");
  return (
    <section>
      <div className="mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12 items-center">
          {/* Left Image */}
          <div className="md:col-span-3 w-full h-[300px] md:h-[400px] lg:h-[450px] relative order-2 md:order-1">
            <Image
              src="/images/community.png"
              fill
              className="rounded brightness-90 contrast-95 object-cover"
              alt="Community"
            />
          </div>

          {/* Right Content */}
          <div className="md:col-span-2 flex flex-col gap-4 md:gap-6 items-start md:items-end order-1 md:order-2">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-greyscale-0 text-left md:text-right">
              {t("title")}
            </h1>
            <p className="text-sm md:text-base text-greyscale-100 text-left md:text-right">
              {t("description")}
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 w-full sm:w-auto">
              <Button 
                onClick={() => router.push("/auth/login")}
                className="w-full sm:w-auto"
              >
                {t("join")}
              </Button>

              <Button 
                variant={"secondary"} 
                onClick={() => router.push("/auth/login")}
                className="w-full sm:w-auto"
              >
                {t("create")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
